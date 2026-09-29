import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "user_session";
const SESSION_DAYS = 30;

export async function createSession(userId: number) {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

    await prisma.session.create({
        data: { id: token, userid: userId, expiresAt }
    })

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: expiresAt,
    });
}

export async function getCurrentUser() {
    const token = (await cookies()).get(COOKIE_NAME)?.value

    if (!token) {
        return null;
    }

    const session = await prisma.session.findUnique({
        where: { id: token },
        include: { user: {
            select: { id: true, userName: true, phoneNumber: true, access: true, status: true },
        } },
    });

    if (!session) {
        return null;
    }
    if (session.expiresAt < new Date() || session.user.status == false) {
        return null;
    }

    return session.user
}

export async function deleteSession() {
    const token = (await cookies()).get(COOKIE_NAME)?.value

    if (!token) {
        return null;
    }

    await prisma.session.deleteMany({ where: { id: token } });
    (await cookies()).delete(COOKIE_NAME);
}