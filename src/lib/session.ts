import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

const getCookieName = (type: "user" | "admin" | null) =>
    type === "admin" ? "admin_session" : "user_session";

const SESSION_DAYS = 30;

export async function createSession(userId: number, type: "user" | "admin" | null = "user") {
    const sessionType = type || "user";

    if (sessionType === "admin") {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.access !== 1) {
            throw new Error("Attempted to create an admin session for a non-admin user");
        }
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

    await prisma.session.create({
        data: { id: token, userid: userId, expiresAt }
    })

    const cookieStore = await cookies();
    cookieStore.set(getCookieName(sessionType), token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: expiresAt,
    });
}

export async function getCurrentUser(type: "user" | "admin" | null = "user") {
    const sessionType = type || "user";
    const token = (await cookies()).get(getCookieName(sessionType))?.value;

    if (!token) {
        return null;
    }

    const session = await prisma.session.findUnique({
        where: { id: token },
        include: {
            user: {
                select: { id: true, userName: true, phoneNumber: true, access: true, status: true },
            }
        },
    });

    if (!session) {
        return null;
    }
    if (session.expiresAt < new Date() || session.user.status == false) {
        return null;
    }
    if (sessionType === "admin" && session.user.access !== 1) {
        return null;
    }
    return session.user
}

export async function deleteSession(type: "user" | "admin" | null = "user") {
    const sessionType = type || "user";
    const cookieName = getCookieName(sessionType);

    const cookieStore = await cookies();
    const token = cookieStore.get(cookieName)?.value;

    if (!token) {
        return null;
    }

    await prisma.session.deleteMany({ where: { id: token } });
    (await cookies()).delete(cookieName);
}