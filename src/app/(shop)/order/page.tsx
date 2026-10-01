import type { Metadata } from "next";
import { redirect } from "next/navigation";
import content from "@/data/site-content.json";
import { getCurrentUser } from "@/lib/session";
import { getCartItems } from "@/lib/cart";
import OrderSummary from "@/components/OrderSummary";
import StatusBadge from "@/components/StatusBadge";
import SubmitOrderButton from "@/components/SubmitOrderButton";

export const metadata: Metadata = {
    title: `${content.order.title} | ${content.siteInfo.shopName}`,
};

// The order page for a cart that hasn't been submitted yet
export default async function OrderPage() {
    // Orders belong to a user
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const items = await getCartItems();

    if (items.length === 0) {
        return (
            <div className="mt-6 mb-10 flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-16 text-center shadow-sm">
                <h1 className="text-2xl font-semibold">
                    {content.order.emptyTitle}
                </h1>
                <p className="text-muted">
                    {content.order.emptyText}
                </p>
                <a
                    href="/product"
                    className="mt-4 rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary-hover"
                >
                    {content.order.browse}
                </a>
            </div>
        );
    }

    return (
        <div className="mt-6 mb-10 w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-accent-soft px-6 py-5">
                <h1 className="text-3xl font-semibold tracking-tight">
                    {content.order.title}
                </h1>
                <StatusBadge status="notSubmitted" />
            </div>

            <div className="flex flex-col gap-6 p-6 md:p-8">
                <p className="text-muted">
                    {content.order.draftNote}
                </p>

                <OrderSummary lines={items} />

                <SubmitOrderButton />
            </div>
        </div>
    );
}
