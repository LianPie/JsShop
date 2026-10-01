import content from "@/data/site-content.json";

export type OrderLine = {
    id: number;
    name: string;
    image: string;
    price: number;
    quantity: number;
};

// The list of products with a total at the bottom.
// Used for the not-yet-submitted cart and for real orders.
export default function OrderSummary({ lines }: { lines: OrderLine[] }) {
    const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

    return (
        <div>
            <ul className="divide-y divide-border">
                {lines.map((line) => (
                    <li key={line.id} className="flex items-center gap-4 py-4">
                        <a
                            href={`/product/${line.id}`}
                            className="flex min-w-0 flex-1 items-center gap-4"
                        >
                            <img
                                className="h-16 w-16 shrink-0 rounded-lg object-cover"
                                src={line.image}
                                alt={line.name}
                            />
                            <div className="min-w-0">
                                <p className="truncate font-medium">
                                    {line.name}
                                </p>
                                <p className="text-sm text-muted">
                                    {line.quantity} × ${line.price.toFixed(2)}
                                </p>
                            </div>
                        </a>

                        <p className="shrink-0 font-semibold">
                            ${(line.price * line.quantity).toFixed(2)}
                        </p>
                    </li>
                ))}
            </ul>

            <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-muted">
                    {content.orders.total}
                </span>
                <span className="text-2xl font-semibold">
                    ${total.toFixed(2)}
                </span>
            </div>
        </div>
    );
}
