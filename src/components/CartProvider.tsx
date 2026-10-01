"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartProduct } from "@/types/product";

type CartContextValue = {
    items: CartProduct[];                              
    count: number;                                     
    addToCart: (productId: number) => Promise<boolean>;     
    removeFromCart: (productId: number) => Promise<boolean>;
    // Set an exact amount; 0 removes the product
    setQuantity: (productId: number, quantity: number) => Promise<boolean>;
};

const CartContext = createContext<CartContextValue | null>(null);

export default function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartProduct[]>([]);

    // Ask the server for the cart and put the answer on the whiteboard
    const refresh = async () => {
        try {
            const res = await fetch("/api/cart");
            if (!res.ok) return;
            const data = await res.json();
            setItems(data.products);
        } catch {
            
        }
    };

    // Load the cart once, when the page first opens
    useEffect(() => {
        refresh();
    }, []);

    // Send one request to the cart API, then refresh the whiteboard.
    // POST adds one, DELETE removes the product, PATCH sets an exact quantity.
    // Returns true if the server said OK.
    const sendCartRequest = async (method: "POST" | "DELETE" | "PATCH", productId: number, quantity?: number) => {
        try {
            const res = await fetch("/api/cart", {
                method,
                headers: { "Content-Type": "application/json" },
                // quantity is only sent for PATCH
                body: JSON.stringify({ product: productId, quantity }),
            });
            if (!res.ok) return false;

            await refresh();
            return true;
        } catch {
            return false;
        }
    };

    const addToCart = (productId: number) => sendCartRequest("POST", productId);
    const removeFromCart = (productId: number) => sendCartRequest("DELETE", productId);
    const setQuantity = (productId: number, quantity: number) => sendCartRequest("PATCH", productId, quantity);

    // Add up every item's quantity: 2 apples + 3 pears = 5
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    // Everything inside <CartProvider> can now read these values
    return (
        <CartContext.Provider value={{ items, count, addToCart, removeFromCart, setQuantity }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const value = useContext(CartContext);
    if (!value) {
        throw new Error("useCart must be used inside <CartProvider>");
    }
    return value;
}
