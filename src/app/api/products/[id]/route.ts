import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!Number(id)) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }
  const productId = Number(id);


  const product = await
    prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}


export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser("admin");
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
  }

  try {
    // 1. Verify the product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // 2. Parse incoming FormData
    const formData = await request.formData();
    const name = formData.get("name") as string | null;
    const priceStr = formData.get("price") as string | null;
    const file = formData.get("image") as File | null;

    // 3. Build the update payload dynamically
    const updateData: {
      name?: string;
      price?: number;
      image?: string;
    } = {};

    if (name) {
      updateData.name = name;
    }

    if (priceStr) {
      const price = parseFloat(priceStr);
      if (isNaN(price)) {
        return NextResponse.json(
          { message: "Invalid price format" },
          { status: 400 }
        );
      }
      updateData.price = price;
    }

    // 4. Handle replacing the image file
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.name) || ".jpg";
      const filename = `${uniqueSuffix}${ext}`;

      const uploadDir = path.join(process.cwd(), "public/uploads");
      await mkdir(uploadDir, { recursive: true });

      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      updateData.image = `/uploads/${filename}`;

      // Optional: Delete the old local file if one previously existed
      if (existingProduct.image?.startsWith("/uploads/")) {
        const oldFilePath = path.join(
          process.cwd(),
          "public",
          existingProduct.image
        );
        unlink(oldFilePath).catch(() => {
          // Silent catch: avoids crashing if the file was already deleted manually
        });
      }
    }

    // 5. Ensure at least one field is provided
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No fields provided to update" },
        { status: 400 }
      );
    }

    // 6. Update database
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser("admin");
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  
  const { id } = await params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    return NextResponse.json({ message: "Not found or unauthorized" }, { status: 404 });
  }

  try {
    await prisma.product.delete({ where: { id: productId } });

    if (existing.image?.startsWith("/uploads/")) {
      const oldFilePath = path.join(process.cwd(), "public", existing.image);
      unlink(oldFilePath).catch(() => { });
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    // Prevent deletion if an order is currently using this address
    if (error.code === "P2003") {
      return NextResponse.json(
        { message: "Cannot delete product because it is linked to past orders." },
        { status: 409 }
      );
    }
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
  }
}
