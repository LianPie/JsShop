import { prisma } from "@/lib/prisma";


export async function getUserOrders(userId: number) {
    return prisma.order.findMany({
        where: { userid: userId },
        orderBy: { dateSubmitted: "desc" },
        include: { items: true },
    });
}
export async function getUserOrder(orderid: number) {
    return prisma.order.findUnique({
        where: { id: orderid },
        include: {Address: true, items: { include: { product: true } } },
    });
}