"use client";

import { useState } from "react";

type UserPanelInfo = {
    isLoggedIn: boolean;
    text: {
        noAuth: string;
        logIn: string;
        profile: string;
        orders: string;
        logOut: string;
    };
}

export default function UserPanel({ isLoggedIn, text }: UserPanelInfo) {
    // True while the logout request is running; disables the button
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch {
            // Server unreachable: nothing more we can do; reload anyway
        } finally {
            // Full reload to the home page so the navbar sees the cookie is gone
            window.location.href = "/";
        }
    };

    // Not logged in: show the message and a login button
    if (!isLoggedIn) {
        return (
            <div className="flex flex-col gap-4">
                <p className="text-sm text-muted">
                    {text.noAuth}
                </p>
                <a
                    href="/login"
                    className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-primary-hover"
                >
                    {text.logIn}
                </a>
            </div>
        );
    }

    // Logged in: show the account links and log out
    return (
        <div className="flex flex-col gap-2">
            <a
                href="/profile"
                className="rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-accent-soft"
            >
                {text.profile}
            </a>
            <a
                href="/orders"
                className="rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-accent-soft"
            >
                {text.orders}
            </a>

            <div className="my-1 border-t border-border" />

            <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-lg px-4 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
            >
                {text.logOut}
            </button>
        </div>
    );
}
