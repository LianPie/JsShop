import { prisma } from "@/lib/prisma";

// Everything the profile page shows about one user.
// Only the listed fields are fetched, so the password hash never leaves the database.
export async function getProfile(userId: number) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            userName: true,
            phoneNumber: true,
            dateCreated: true,
            address: { select: { id: true, zipcode: true, address: true } },
            _count: { select: { orders: true } },
        },
    });
}
