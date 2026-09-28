import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
