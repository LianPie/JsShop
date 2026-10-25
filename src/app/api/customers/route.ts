import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(request: Request) {
  const user = await getCurrentUser("admin");
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10) || 12));
  const search = (searchParams.get("search") ?? "").trim();

  const where = {
    access: 0, // customers only
    ...(search
      ? {
          OR: [
            { userName: { contains: search } }, // add mode: "insensitive" on PostgreSQL
            { phoneNumber: { contains: search } },
          ],
        }
      : {}),
  };

  try {
    const [customers, totalCustomers] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dateCreated: "desc" },
        select: {
          id: true,
          userName: true,
          phoneNumber: true,
          status: true,
          dateCreated: true,
          _count: { select: { orders: true } }, // password is never selected
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      customers: customers.map((c) => ({
        id: c.id,
        userName: c.userName,
        phoneNumber: c.phoneNumber,
        status: c.status,
        dateCreated: c.dateCreated,
        orderCount: c._count.orders,
      })),
      totalCustomers,
      totalPages: Math.max(1, Math.ceil(totalCustomers / limit)),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ message: "Failed to fetch customers" }, { status: 500 });
  }
}