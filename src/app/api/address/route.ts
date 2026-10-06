import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const addresses = await prisma.address.findMany({
            where: { userid: user.id },
            orderBy: { id: "desc" }, // Most recent first
        });

        return NextResponse.json(addresses);
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch addresses" }, { status: 500 });
    }
}


export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { address, zipcode } = await request.json();

    if (!address || !zipcode) {
        return NextResponse.json({ message: "Address and zipcode are required" }, { status: 400 });
    }

    try {
        const newAddress = await prisma.address.create({
            data: {
                userid: user.id,
                address,
                zipcode,
            },
        });

        return NextResponse.json({ id: newAddress.id });
    } catch (error) {
        return NextResponse.json({ message: "Failed to save address" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const addressId = parseInt(params.id, 10);

    const existing = await prisma.address.findUnique({ where: { id: addressId } });
    if (!existing || existing.userid !== user.id) {
        return NextResponse.json({ message: "Not found or unauthorized" }, { status: 404 });
    }

    try {
        await prisma.address.delete({ where: { id: addressId } });
        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error: any) {
        // Prevent deletion if an order is currently using this address
        if (error.code === "P2003") {
            return NextResponse.json(
                { message: "Cannot delete address because it is linked to past orders." },
                { status: 409 }
            );
        }
        return NextResponse.json({ message: "Failed to delete address" }, { status: 500 });
    }
}