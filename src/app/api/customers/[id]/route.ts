import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> }; // Next 14: { params: { id: string } } and drop the await

async function authorize(ctx: Ctx) {
  const user = await getCurrentUser("admin");
  if (!user) {
    return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  const { id } = await ctx.params;
  const customerId = parseInt(id, 10);
  if (isNaN(customerId)) {
    return { error: NextResponse.json({ message: "Invalid customer ID" }, { status: 400 }) };
  }

  // Customers only (access 0): admins can't disable or delete themselves or each other here
  const customer = await prisma.user.findFirst({
    where: { id: customerId, access: 0 },
    select: { id: true },
  });
  if (!customer) {
    return { error: NextResponse.json({ message: "Customer not found" }, { status: 404 }) };
  }

  return { customerId };
}

// Disable / enable
export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await authorize(ctx);
  if ("error" in auth) return auth.error;

  let status: unknown;
  try {
    ({ status } = await request.json());
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }
  if (typeof status !== "boolean") {
    return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: auth.customerId }, data: { status } });
      // Disabling logs them out immediately
      if (!status) {
        await tx.session.deleteMany({ where: { userid: auth.customerId } });
      }
    });
    return NextResponse.json({ message: "Customer updated" }, { status: 200 });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json({ message: "Failed to update customer" }, { status: 500 });
  }
}

// Permanent delete: sessions and addresses go with the user,
// orders stay with their copied name, phone and address
export async function DELETE(_request: Request, ctx: Ctx) {
  const auth = await authorize(ctx);
  if ("error" in auth) return auth.error;

  try {
    await prisma.user.delete({ where: { id: auth.customerId } });
    return NextResponse.json({ message: "Customer deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json({ message: "Failed to delete customer" }, { status: 500 });
  }
}