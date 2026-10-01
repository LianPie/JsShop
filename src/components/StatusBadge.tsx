import content from "@/data/site-content.json";
import type { OrderStatus } from "@/lib/order-status";

// "notSubmitted" is for a cart that hasn't become an order yet (it isn't stored in the database)
export type BadgeStatus = OrderStatus | "notSubmitted";

const styles: Record<BadgeStatus, string> = {
    notSubmitted: "bg-gray-100 text-gray-700",
    stockChecking: "bg-amber-100 text-amber-800",
    processing: "bg-sky-100 text-sky-800",
    delivered: "bg-green-100 text-green-800",
    canceled: "bg-red-100 text-red-800",
};

export default function StatusBadge({ status }: { status: BadgeStatus }) {
    return (
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>
            {content.orders.status[status]}
        </span>
    );
}
