import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import bcrypt from "bcryptjs";



export async function POST(request: Request) {
    //request
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    // Valid JSON can still be null, a number, etc. We need an object
    if (!body || typeof body !== "object") {
        return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    //normalize and check
    const { phone, password } = body;

    if (typeof phone !== "string" || typeof password !== "string") {
        return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    //validate
    const cleanPhone = phone.replace(/\D/g, "");


    if (!cleanPhone) {
        return NextResponse.json({ message: "Phone number is required" }, { status: 400 });
    }


    //check if phone number is registered
    const existing = await prisma.user.findUnique({
        where: { phoneNumber: cleanPhone },
    });

    if (!existing) {
        return NextResponse.json({ message: "wrong phone number or password" }, { status: 401});
    }

    const passwordOk = await bcrypt.compare(password, existing.password);
    if (!passwordOk) {
        return NextResponse.json({ message: "wrong phone number or password" }, { status: 401});      
    }

    if (!existing.status) {
        return NextResponse.json({ message: "Your account is disabled" }, { status: 401});
    }

    await createSession(existing.id);

    return NextResponse.json({ ok: true }, { status: 200 });
}