// Order.status is a number in the database. The position in this list is that number:
//   0 = stockChecking (every new order starts here, it's the default in schema.prisma)
//   1 = processing
//   2 = delivered
//   3 = canceled
// Names match "orders.status" in site-content.json.
// Only ever add new statuses at the END, or old orders would change meaning.
export const ORDER_STATUSES = ["stockChecking", "processing", "delivered", "canceled"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Turn the number from the database into a status name
export function orderStatusKey(code: number): OrderStatus {
    return ORDER_STATUSES[code] ?? "stockChecking";
}
