"use client";

import { useState } from "react";
import content from "@/data/site-content.json";

// Sends the cart to /api/orders. On success, opens the new order's page.
export default function SubmitOrderButton() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/orders", { method: "POST" });

            if (!res.ok) {
                // The API sends { message: "..." } for every error
                const data = await res.json().catch(() => null);
                setError(data?.message ?? content.order.error);
                setLoading(false);
                return;
            }

            const data = await res.json();
            // Full page load, so the navbar's cart (now empty) is read fresh.
            // The button stays disabled until the new page arrives, so it can't be clicked twice.
            window.location.href = `/orders/${data.id}`;
        } catch {
            setError(content.order.error);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full rounded-xl bg-primary px-6 py-3.5 font-medium text-white transition hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
            >
                {content.order.submit}
            </button>
        </div>
    );
}
