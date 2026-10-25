import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ALLOWED_TRANSITIONS, DELIVERED_CODE } from "@/lib/order-status";

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

  let newStatus: unknown;
  try {
    ({ status: newStatus } = await request.json());
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  if (typeof newStatus !== "number" || !(newStatus in ALLOWED_TRANSITIONS)) {
    return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) return { error: "Order not found", code: 404 } as const;

      if (!ALLOWED_TRANSITIONS[order.status]?.includes(newStatus as number)) {
        return {
          error: "This status change is not allowed",
          code: 409,
        } as const;
      }

      // Only update if the status is still what we just read, so two admins
      // clicking at once can't both trigger the sales increment.
      const { count } = await tx.order.updateMany({
        where: { id: orderId, status: order.status },
        data: { status: newStatus as number },
      });
      if (count === 0) {
        return { error: "Order was changed by someone else", code: 409 } as const;
      }

      if (newStatus === DELIVERED_CODE) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productid },
            data: { boughtCount: { increment: item.quantity } },
          });
        }
      }

      return { ok: true } as const;
    });

    if ("error" in result) {
      return NextResponse.json({ message: result.error }, { status: result.code });
    }

    return NextResponse.json({ message: "Status updated" }, { status: 200 });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { message: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function GET(
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

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        dateSubmitted: true,
        user: { select: { userName: true, phoneNumber: true } },
        Address: { select: { address: true, zipcode: true } },
        items: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            paymentStatus: true,
            product: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      dateSubmitted: order.dateSubmitted,
      userName: order.user.userName,
      phoneNumber: order.user.phoneNumber,
      address: order.Address.address,
      zipcode: order.Address.zipcode,
      items: order.items.map((i) => ({
        id: i.id,
        productId: i.product.id,
        name: i.product.name,
        image: i.product.image,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        paymentStatus: i.paymentStatus,
      })),
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { message: "Failed to fetch order" },
      { status: 500 }
    );
  }
}