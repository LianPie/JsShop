"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faTrash } from "@fortawesome/free-solid-svg-icons";
import content from "@/data/site-content.json";

type Address = { id: number; address: string; zipcode: string };

export default function AddressListItem({ address }: { address: Address }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this address?")) return;
        setLoading(true);
        setError(null);
        
        try {
            const res = await fetch(`/api/addresses/${address.id}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message || "Failed to delete");
            }
            router.refresh(); // Refreshes the server component to instantly remove the item
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <li className="flex items-start justify-between gap-3 rounded-xl border border-border p-4 transition hover:bg-surface-hover">
            <div className="flex items-start gap-3">
                <FontAwesomeIcon icon={faLocationDot} className="mt-1 text-accent" />
                <div>
                    <p className="font-medium">{address.address}</p>
                    <p className="text-sm text-muted">
                        {content.profile.zipcode}: {address.zipcode}
                    </p>
                    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                </div>
            </div>
            
            <button 
                onClick={handleDelete}
                disabled={loading}
                className="text-muted transition hover:text-red-600 disabled:opacity-50"
                aria-label="Delete address"
            >
                <FontAwesomeIcon icon={faTrash} />
            </button>
        </li>
    );
}