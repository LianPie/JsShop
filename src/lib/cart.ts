import { cookies } from "next/headers";
import type { Cart, CartProduct } from "@/types/product";
import { prisma } from "@/lib/prisma";


const COOKIE_NAME = "user_cart";
const SESSION_DAYS = 30;


export async function readCart(): Promise<Cart> {
    const cart = (await cookies()).get(COOKIE_NAME)?.value
    if (!cart) {
        return { products: [] }
    }
    try {
        const cartobj = JSON.parse(cart) as Cart;
        const products = cartobj.products.filter(
            (item) =>
                Number.isInteger(item?.id) &&
                Number.isInteger(item?.quantity) &&
                item.quantity >= 1 &&
                item.quantity <= 99
        );
        return { products };
    } catch {
        return { products: [] }
    }
}

export async function writeCart(cart: Cart) {
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)


    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAME, JSON.stringify(cart), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: expiresAt,
    });
}

// The cart with names, prices and images from the database (prices never come from the cookie).
// Products that no longer exist are skipped.
export async function getCartItems(): Promise<CartProduct[]> {
    const cart = await readCart();
    if (cart.products.length === 0) return [];

    const ids = cart.products.map((item) => item.id);
    const rows = await prisma.product.findMany({ where: { id: { in: ids } } });
    const byId = new Map(rows.map((p) => [p.id, p]));

    return cart.products.flatMap((item) => {
        const product = byId.get(item.id);
        if (!product) return [];
        return [{ ...product, quantity: item.quantity }];
    });
}
