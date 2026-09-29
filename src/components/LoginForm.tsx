"use client";

import { useState, type FormEvent } from "react";
import { AuthField, AuthSubmit } from "./AuthFields";

type LoginFormInfo = {
    text: {
        phone: string;
        password: string;
        submit: string;

        networkError: string;
    };
}



export default function LoginForm({ text }: LoginFormInfo) {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        // Stop the browser from submitting the form itself
        event.preventDefault();

        // Read phone and password from the form
        const form = new FormData(event.currentTarget);
        const phone = form.get("login-phone");
        const password = form.get("login-password");

        if (!password || !phone) {
            return;
        }

        // Clear any old error and disable the button while waiting
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, password }),
            });

            if (!res.ok) {
                // The API sends { message: "..." } for every error
                const data = await res.json().catch(() => null);
                setError(data?.message ?? text.networkError);
                return;
            }

            // Full reload so the navbar sees the new session cookie
            window.location.href = "/";
        } catch {
            setError(text.networkError);
        } finally {
            setLoading(false);
        }
    };


    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <AuthField id="login-phone" label={text.phone} type="tel" autoComplete="tel" digitsOnly />
            <AuthField id="login-password" label={text.password} type="password" autoComplete="current-password" />
            {error && (
                <p role="alert" className="rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-100 md:bg-red-50 md:text-red-700">
                    {error}
                </p>
            )}

            <AuthSubmit disabled={loading}>{text.submit}</AuthSubmit>
        </form>
    );
}
