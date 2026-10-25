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
  { params }: { params: Promise<{ id: string }> } // Next 15+; use { id: string } directly on Next 14
) {
  const user = await getCurrentUser("admin");
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params; // on Next 14: const { id } = params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
  }

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const priceStr = formData.get("price");
    const file = formData.get("image");

    const updateData: { name?: string; price?: number; image?: string } = {};

    if (typeof name === "string" && name.trim()) {
      updateData.name = name.trim();
    }

    if (typeof priceStr === "string" && priceStr.trim()) {
      const price = parseFloat(priceStr);
      if (isNaN(price)) {
        return NextResponse.json({ message: "Invalid price format" }, { status: 400 });
      }
      updateData.price = price;
    }

    // Upload works whether or not a previous image exists
    let newFilename: string | null = null;
    if (file instanceof File && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || ".jpg";
      newFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, newFilename), buffer);

      updateData.image = `/uploads/${newFilename}`;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No fields provided to update" }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    // Clean up the old file only after the DB update succeeded
    const oldImage = existingProduct.image;
    if (newFilename && oldImage && oldImage.startsWith("/uploads/")) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const oldFilePath = path.join(process.cwd(), "public", oldImage);

      // Guard against path traversal, then ignore a missing file
      if (oldFilePath.startsWith(uploadDir + path.sep)) {
        try {
          await unlink(oldFilePath);
        } catch (err: any) {
          if (err?.code !== "ENOENT") {
            console.warn("Could not delete old image:", err);
          }
        }
      }
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
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
