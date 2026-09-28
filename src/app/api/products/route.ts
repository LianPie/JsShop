import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
