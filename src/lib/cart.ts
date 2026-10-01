import { cookies } from "next/headers";
import type { Cart } from "@/types/product";


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
