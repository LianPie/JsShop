import type { Metadata } from "next";
import { redirect } from "next/navigation";
import content from "@/data/site-content.json";
import { getCurrentUser } from "@/lib/session";
import { orderStatusKey } from "@/lib/order-status";
import { getUserOrders } from "@/lib/orders";
import StatusBadge from "@/components/StatusBadge";

export const metadata: Metadata = {
    title: `${content.orders.title} | ${content.siteInfo.shopName}`,
};

const dateFormat = new Intl.DateTimeFormat(content.siteInfo.lan, { dateStyle: "medium" });

// The logged-in user's orders, newest first
export default async function OrdersPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const orders = await getUserOrders(user.id);

    return (
        <div className="mt-6 mb-10 w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border bg-accent-soft px-6 py-6 md:px-8">
                <h1 className="text-3xl font-semibold tracking-tight">
                    {content.orders.title}
                </h1>
                <p className="mt-1 text-muted">
                    {content.orders.subtitle}
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                    <p className="text-muted">
                        {content.orders.empty}
                    </p>
                    <a
                        href="/product"
                        className="mt-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary-hover"
                    >
                        {content.orders.browse}
                    </a>
                </div>
            ) : (
                <ul className="divide-y divide-border">
                    {orders.map((order) => {
                        const total = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
                        const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

                        return (
                            <li key={order.id}>
                                <a
                                    href={`/orders/${order.id}`}
                                    className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 transition hover:bg-accent-soft/50 md:px-8"
                                >
                                    <div>
                                        <p className="font-semibold">
                                            {content.orders.orderNumber}{order.id}
                                        </p>
                                        <p className="text-sm text-muted">
                                            {dateFormat.format(order.dateSubmitted)} · {itemCount} {content.orders.items}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <StatusBadge status={orderStatusKey(order.status)} />
                                        <p className="w-24 text-right font-semibold">
                                            ${total.toFixed(2)}
                                        </p>
                                    </div>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
