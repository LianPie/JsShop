import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getCartItems, writeCart } from "@/lib/cart";

// POST /api/orders: turns the cart into a real order for the logged-in user
export async function POST(request: Request) {
  // Orders belong to a user, so this one needs a login (the cart itself doesn't)
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Please log in to submit an order" }, { status: 401 });
  }

  // Now it ONLY expects an ID, completely unaware of address creation logic
  const { addressId } = await request.json();

  if (!addressId) {
    return NextResponse.json({ message: "Shipping address is required" }, { status: 400 });
  }

  // Names and prices come from the database, never from the cookie
  const items = await getCartItems();
  if (items.length === 0) {
    return NextResponse.json({ message: "Your cart is empty" }, { status: 400 });
  }

  // One create call for the order and all its items, so it's saved completely or not at all.
  // status isn't set: the default in schema.prisma (0) is "stock checking".
  const order = await prisma.order.create({
    data: {
      userid: user.id,
      addressid: parseInt(addressId, 10),
      items: {
        create: items.map((item) => ({
          productid: item.id,
          quantity: item.quantity,
          // The price at the time of ordering, so later price changes don't alter old orders
          unitPrice: item.price,
        })),
      },
    },
  });

  // The cart has become an order, so empty it
  await writeCart({ products: [] });

  return NextResponse.json({ id: order.id }, { status: 201 });
}


export async function GET(request: Request) {
  const user = await getCurrentUser("admin");
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10) || 12)
  );

  try {
    const [orders, totalOrders] = await Promise.all([
      prisma.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dateSubmitted: "desc" },
        select: {
          id: true,
          status: true,
          dateSubmitted: true,
          user: { select: { userName: true, phoneNumber: true } },
        },
      }),
      prisma.order.count(),
    ]);

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.id,
        status: o.status,
        dateSubmitted: o.dateSubmitted,
        userName: o.user?.userName ?? "Deleted",
        phoneNumber: o.user?.phoneNumber ?? "Deleted",
        customerDeleted: o.user === null,
      })),
      totalOrders,
      totalPages: Math.max(1, Math.ceil(totalOrders / limit)),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}