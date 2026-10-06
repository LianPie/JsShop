import { notFound, redirect } from "next/navigation";
import content from "@/data/site-content.json";
import { getCurrentUser } from "@/lib/session";
import { orderStatusKey } from "@/lib/order-status";
import { getUserOrder } from "@/lib/orders";
import OrderSummary from "@/components/OrderSummary";
import StatusBadge from "@/components/StatusBadge";

const dateFormat = new Intl.DateTimeFormat(content.siteInfo.lan, { dateStyle: "long" });

// One submitted order, with its current status
export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const { id } = await params;
    const orderId = Number(id);
    if (!Number.isInteger(orderId)) notFound();

    const order = await getUserOrder(orderId)

    // Someone else's order looks exactly like one that doesn't exist
    if (!order || order.userid !== user.id) notFound();

    const lines = order.items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        image: item.product.image,
        // The price paid then, not today's price
        price: item.unitPrice,
        quantity: item.quantity,
    }));

    return (
        <div className="mt-6 mb-10 w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-accent-soft px-6 py-5">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {content.orders.orderNumber}{order.id}
                    </h1>
                    <p className="mt-1 text-sm text-muted">
                        {dateFormat.format(order.dateSubmitted)}
                    </p>
                </div>
                <StatusBadge status={orderStatusKey(order.status)} />
            </div>

            <div className="flex flex-col gap-6 p-6 md:p-8">
                {/* Shipping Address Section */}
                {order.Address && (
                    <div className="rounded-xl border border-border bg-background p-5">
                        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                            Shipping Address
                        </h2>
                        <div className="text-sm">
                            <p className="font-medium">{order.Address.address}</p>
                            <p className="mt-1 text-muted">Zipcode: {order.Address.zipcode}</p>
                        </div>
                    </div>
                )}

                <OrderSummary lines={lines} />

                <a href="/orders" className="text-sm font-medium text-primary hover:underline">
                    ← {content.orders.back}
                </a>
            </div>
        </div>
    );
}
