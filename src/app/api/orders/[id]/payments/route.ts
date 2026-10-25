import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // on Next 14 use { id: string }
) {
  const user = await getCurrentUser("admin");
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params; // on Next 14: const { id } = params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return NextResponse.json({ message: "Invalid order ID" }, { status: 400 });
  }

  let body: { itemIds?: unknown; paymentStatus?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const { itemIds, paymentStatus } = body;

  if (
    typeof paymentStatus !== "boolean" ||
    !Array.isArray(itemIds) ||
    itemIds.length === 0 ||
    !itemIds.every((n) => Number.isInteger(n))
  ) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  try {
    // orderid in the where clause makes sure items from other orders can't be touched
    const { count } = await prisma.orderItem.updateMany({
      where: { orderid: orderId, id: { in: itemIds as number[] } },
      data: { paymentStatus },
    });

    if (count === 0) {
      return NextResponse.json({ message: "No matching items" }, { status: 404 });
    }

    return NextResponse.json({ updated: count }, { status: 200 });
  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { message: "Failed to update payment status" },
      { status: 500 }
    );
  }
}