"use client";

import content from "@/data/site-content.json";
import Loader from "@/components/Loader";
import { useEffect, useState, use } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import type { Product } from "@/types/product";
import { useCart } from "@/components/CartProvider";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function Details({ params }: PageProps) {

    const { items, addToCart, setQuantity } = useCart();

    const [product, setProduct] = useState<Product>();
    const [loading, setLoading] = useState(true);
    // True while a cart request is running, so quick double-clicks can't pile up
    const [busy, setBusy] = useState(false);

    const { id } = use(params);
    const productId = Number(id);

    // How many of this product are in the cart (0 if it isn't)
    const quantity = items.find((item) => item.id === productId)?.quantity ?? 0;

    const run = async (action: () => Promise<boolean>) => {
        setBusy(true);
        await action();
        setBusy(false);
    };
    useEffect(() => {
        fetch(`/api/products/${productId}`)
            .then((res) => res.json())
            .then((data) => {
                setProduct(data);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <Loader />;
    } return (
        <div className="w-full mb-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm mt-2">
            {/* Title */}
            <div className="border-b border-border bg-accent-soft px-6 py-5">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    {content.products["product-pagetitle"]} {product?.name}
                </h1>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-10 p-6 md:grid-cols-2 md:p-8">
                <div className="relative h-96 overflow-hidden rounded-xl">
                    {/* Blurred background */}
                    <img
                        src={product?.image}
                        alt=""
                        className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
                    />

                    {/* Actual image */}
                    <img
                        src={product?.image}
                        alt={product?.name}
                        className="relative h-full w-full object-contain transition-transform duration-300 hover:scale-105"
                    />
                </div>

                {/* Info */}
                <div className="flex flex-col">
                    <div className="space-y-5">
                        <div>
                            <p className="text-sm font-medium uppercase tracking-wider text-muted">
                                {content.products.title}
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-foreground">
                                {product?.name}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-medium uppercase tracking-wider text-muted">
                                {content.products.price}
                            </p>
                            <p className="mt-1 text-3xl font-semibold text-primary">
                                ${product?.price}
                            </p>
                        </div>
                    </div>

                    {quantity === 0 ? (
                        /* Not in the cart yet: Add to cart */
                        <button
                            type="button"
                            disabled={busy}
                            className="mt-5 md:mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-medium text-white transition hover:bg-primary-hover disabled:opacity-60"
                            onClick={() => run(() => addToCart(productId))}
                        >
                            <FontAwesomeIcon icon={faCartShopping} />
                            {content.cart.addToCart}
                        </button>
                    ) : (
                        /* Already in the cart: minus, how many, plus */
                        <div className="mt-5 md:mt-auto flex w-full items-center justify-between rounded-xl bg-primary text-white">
                            <button
                                type="button"
                                aria-label={content.cart.decrease}
                                disabled={busy}
                                onClick={() => run(() => setQuantity(productId, quantity - 1))}
                                className="flex h-12 w-16 items-center justify-center rounded-l-xl transition hover:bg-primary-hover disabled:opacity-60"
                            >
                                <FontAwesomeIcon icon={faMinus} />
                            </button>

                            <span aria-live="polite" className="text-lg font-semibold">
                                {quantity}
                            </span>

                            <button
                                type="button"
                                aria-label={content.cart.increase}
                                disabled={busy || quantity >= 99}
                                onClick={() => run(() => setQuantity(productId, quantity + 1))}
                                className="flex h-12 w-16 items-center justify-center rounded-r-xl transition hover:bg-primary-hover disabled:opacity-60"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}