import { NextResponse } from "next/server";
import { readCart, writeCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";



export async function POST(request: Request) {
    //request
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    // Valid JSON can still be null, a number, etc. We need an object
    if (!body || typeof body !== "object") {
        return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    //normalize and check
    const { product } = body;

    // Must be a positive whole number (1.5 or -3 would make Prisma throw)
    const productId = Number(product);
    if (!Number.isInteger(productId) || productId < 1) {
        return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    //check
    const exists = await prisma.product.findUnique({ where: { id: productId } });
    if (!exists) {
        return NextResponse.json({ message: "product not found" }, { status: 404 });
    }


    let cart = await readCart();
    let item = cart.products.find(x => x.id == productId)
    if (item) {
        if (item.quantity < 99)
            item.quantity++
    }
    else {
        cart.products.push(
            {
                id: productId,
                quantity: 1
            }
        )
    }
    await writeCart(cart);

    return NextResponse.json({ ok: true }, { status: 200 });
}


// DELETE /api/cart  { product: 5 }: remove that product from the cart completely
export async function DELETE(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
        return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const productId = Number(body.product);
    if (!Number.isInteger(productId) || productId < 1) {
        return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const cart = await readCart();
    // Keep everything except that product
    cart.products = cart.products.filter((x) => x.id !== productId);
    await writeCart(cart);

    return NextResponse.json({ ok: true }, { status: 200 });
}


// PATCH /api/cart  { product: 5, quantity: 3 }: set how many of that product are in the cart.
// A quantity of 0 removes it.
export async function PATCH(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
        return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const productId = Number(body.product);
    if (!Number.isInteger(productId) || productId < 1) {
        return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Whole number from 0 to 99 (readCart throws away anything above 99)
    const quantity = Number(body.quantity);
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) {
        return NextResponse.json({ message: "Invalid quantity" }, { status: 400 });
    }

    const cart = await readCart();
    const item = cart.products.find((x) => x.id === productId);
    if (!item) {
        return NextResponse.json({ message: "Product is not in the cart" }, { status: 404 });
    }

    if (quantity === 0) {
        cart.products = cart.products.filter((x) => x.id !== productId);
    } else {
        item.quantity = quantity;
    }
    await writeCart(cart);

    return NextResponse.json({ ok: true }, { status: 200 });
}


export async function GET() {

    const cart = await readCart();
    const ids = cart.products.map(item => item.id)

    const rows = await prisma.product.findMany({ where: { id: { in: ids } } });
    const byId = new Map(rows.map((p) => [p.id, p]));

    const items = cart.products.flatMap((item) => {
        const product = byId.get(item.id);
        if (!product) return [];               // product was deleted: skip it
        return [{ ...product, quantity: item.quantity }];
    });

    return NextResponse.json({ products: items });
}