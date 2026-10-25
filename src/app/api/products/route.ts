  import { NextRequest, NextResponse } from "next/server";
  import { prisma } from "@/lib/prisma";
  import { writeFile, mkdir } from "fs/promises";
  import path from "path";
  import { getCurrentUser } from "@/lib/session";

  export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;



    const [products, total] = await Promise.all([

      prisma.product.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { id: "asc" } }),

      prisma.product.count()
    ]);

    return NextResponse.json({

      products: products,
      totalProducts: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  }


  export async function POST(request: Request) {
    const user = await getCurrentUser("admin");
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
      // 1. Parse FormData instead of request.json()
      const formData = await request.formData();
      const name = formData.get("name") as string;
      const priceStr = formData.get("price") as string;
      const file = formData.get("image") as File | null;

      if (!name || !priceStr) {
        return NextResponse.json(
          { message: "name and price are required" },
          { status: 400 }
        );
      }

      const price = parseFloat(priceStr);
      let imageUrl = "";

      // 2. Handle file writing if an image was provided
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename to avoid overwrites
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.name) || ".jpg";
        const filename = `${uniqueSuffix}${ext}`;

        const uploadDir = path.join(process.cwd(), "public/uploads");
        await mkdir(uploadDir, { recursive: true });

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        imageUrl = `/uploads/${filename}`;
      }

      // 3. Save to Prisma
      const newProduct = await prisma.product.create({
        data: {
          name,
          price,
          image: imageUrl,
        },
      });

      return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
      return NextResponse.json({ message: "Failed to save" }, { status: 500 });
    }
  }
