import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { isValidName, isValidPassword } from "@/lib/validation";

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
    const { name, phone, password } = body;

    if (typeof name !== "string" || typeof phone !== "string" || typeof password !== "string") {
        return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    //validate
    const cleanName = name.trim();
    const cleanPhone = phone.replace(/\D/g, "");

    if (!isValidName(cleanName)) {
        return NextResponse.json({ message: "Please enter a valid name" }, { status: 400 });
    }

    if (!cleanPhone) {
        return NextResponse.json({ message: "Phone number is required" }, { status: 400 });
    }

    if (!isValidPassword(password)) {
        return NextResponse.json({ message: "Password doesn't meet the rules" }, { status: 400 });
    }


    //check if phone number is registered
    const existing = await prisma.user.findUnique({
        where: { phoneNumber: cleanPhone },
    });

    if (existing) {
        return NextResponse.json({ message: "This phone number is already registered" }, { status: 409 });
    }

    //save
    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            userName: cleanName,
            phoneNumber: cleanPhone,
            password: hash,
        },
    });

    // Log the new user in straight away
    await createSession(user.id);

    return NextResponse.json({ ok: true }, { status: 201 });
}