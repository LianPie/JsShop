import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

// POST /api/auth/logout: deletes the session row and the cookie
export async function POST() {
    await deleteSession();
    return NextResponse.json({ ok: true });
}
