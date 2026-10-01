import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getCartItems, writeCart } from "@/lib/cart";

// POST /api/orders: turns the cart into a real order for the logged-in user
export async function POST() {
    // Orders belong to a user, so this one needs a login (the cart itself doesn't)
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ message: "Please log in to submit an order" }, { status: 401 });
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
