"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBasketShopping, faMinus, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useCart } from "./CartProvider";
import content from "@/data/site-content.json";

type CartPanelInfo = {
    title: string;
}

export default function CartPanel({ title }: CartPanelInfo) {
    const { items, removeFromCart, setQuantity } = useCart();
    // True while a cart request is running, so quick double-clicks can't pile up
    const [busy, setBusy] = useState(false);

    const run = async (action: () => Promise<boolean>) => {
        setBusy(true);
        await action();
        setBusy(false);
    };

    // Nothing in the cart: heading, then a centered icon and message
    if (items.length === 0) {
        return (
            <div>
                <h2 className="text-lg font-semibold">
                    {title}
                </h2>
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <FontAwesomeIcon
                        icon={faBasketShopping}
                        className="h-12 w-12 text-muted/50"
                    />
                    <p className="text-sm text-muted">
                        {content.cart.empty}
                    </p>
                </div>
            </div>
        );
    }

    // Price x quantity for every item, added up
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div>
            <h2 className="text-lg font-semibold">
                {title}
            </h2>

            {/* Scrolls when the cart gets long */}
            <ul className="mt-2 max-h-80 divide-y divide-border overflow-y-auto">
                {items.map((item) => (
                    <li className="flex items-center gap-3 py-3" key={item.id}>
                        <a href={`/product/${item.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                            <img
                                className="h-12 w-12 shrink-0 rounded-lg object-cover"
                                src={item.image}
                                alt={item.name}
                            />

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                    {item.name}
                                </p>
                                <p className="text-sm text-muted">
                                    ${item.price.toFixed(2)}
                                </p>
                            </div>

                        </a>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                            {/* minus, how many, plus */}
                            <div className="flex items-center rounded-lg bg-primary text-white">
                                <button
                                    type="button"
                                    aria-label={`${content.cart.decrease} ${item.name}`}
                                    disabled={busy}
                                    onClick={() => run(() => setQuantity(item.id, item.quantity - 1))}
                                    className="flex h-7 w-7 items-center justify-center rounded-l-lg text-xs transition hover:bg-primary-hover disabled:opacity-60"
                                >
                                    <FontAwesomeIcon icon={faMinus} />
                                </button>

                                <span aria-live="polite" className="min-w-6 text-center text-sm font-medium">
                                    {item.quantity}
                                </span>

                                <button
                                    type="button"
                                    aria-label={`${content.cart.increase} ${item.name}`}
                                    disabled={busy || item.quantity >= 99}
                                    onClick={() => run(() => setQuantity(item.id, item.quantity + 1))}
                                    className="flex h-7 w-7 items-center justify-center rounded-r-lg text-xs transition hover:bg-primary-hover disabled:opacity-60"
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                aria-label={`${content.cart.remove} ${item.name}`}
                                title={content.cart.remove}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-sm text-muted transition hover:bg-red-50 hover:text-red-600"
                            >
                                <FontAwesomeIcon icon={faTrashCan} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted">
                    {content.cart.total}
                </span>
                <span className="text-lg font-semibold">
                    ${total.toFixed(2)}
                </span>
            </div>
        </div>
    );
}
