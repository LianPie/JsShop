"use client";

import { useState } from "react";
import content from "@/data/site-content.json";
import AddressSelector from "@/components/AddressSelector";
import Loading from "@/components/Loader";

type Address = {
    id: number;
    address: string;
    zipcode: string;
};

// Sends the cart to /api/orders. On success, opens the new order's page.
export default function SubmitOrderButton() {
    const [step, setStep] = useState<"initial" | "address">("initial");
    const [addresses, setAddresses] = useState<Address[]>([]);

    const [fetchingAddresses, setFetchingAddresses] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleProceedToAddress = async () => {
        setStep("address");
        setFetchingAddresses(true);
        setError(null);

        try {
            const res = await fetch("/api/address");
            if (!res.ok) throw new Error("Failed to load addresses");

            const data = await res.json();
            setAddresses(data);
        } catch {
            setError("Could not load saved addresses. You can still enter a new one.");
        } finally {
            setFetchingAddresses(false);
        }
    };

    const handleFinalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        let finalAddressId = formData.get("addressId") as string;

        try {
            // 1. If no addressId exists, it means we are creating a new one
            if (!finalAddressId) {
                const addressRes = await fetch("/api/address", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        address: formData.get("newAddress"),
                        zipcode: formData.get("newZipcode"),
                    }),
                });

                if (!addressRes.ok) {
                    throw new Error("Failed to save new address");
                }

                const addressData = await addressRes.json();
                finalAddressId = addressData.id;
            }

            // 2. Now submit the order with a guaranteed existing address ID
            const orderRes = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ addressId: finalAddressId }),
            });

            if (!orderRes.ok) {
                const data = await orderRes.json().catch(() => null);
                throw new Error(data?.message ?? content.order.error);
            }

            const orderData = await orderRes.json();
            window.location.href = `/orders/${orderData.id}`;

        } catch (err: any) {
            setError(err.message || content.order.error);
            setLoading(false);
        }
    };

    if (step === "initial") {
        return (
            <button
                type="button"
                onClick={handleProceedToAddress}
                className="mt-2 w-full rounded-xl bg-primary px-6 py-3.5 font-medium text-white transition hover:bg-primary-hover"
            >
                {content.order.submit}
            </button>
        );
    }

    return (
        <form
            onSubmit={handleFinalSubmit}
            className="mt-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
            {fetchingAddresses ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted">
                    Loading addresses...
                </div>
            ) : (
                <AddressSelector savedAddresses={addresses} />
            )}

            {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={loading || fetchingAddresses}
                className="w-full rounded-xl bg-primary px-6 py-3.5 font-medium text-white transition hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
            >
                Confirm Address & Order
            </button>
        </form>
    );
}


