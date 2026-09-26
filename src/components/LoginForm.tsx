"use client";

import type { FormEvent } from "react";

type LoginFormInfo = {
    text: {
        phone: string;
        password: string;
        submit: string;
    };
}

export default function LoginForm({ text }: LoginFormInfo) {
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        // Stop the browser from submitting the form itself
        event.preventDefault();

        // TODO: send phone + password to the login API once it exists
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-sm font-medium">
                    {text.phone}
                </label>
                <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    className="rounded-lg border border-border bg-surface px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-medium">
                    {text.password}
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="rounded-lg border border-border bg-surface px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
            </div>

            <button
                type="submit"
                className="mt-2 rounded-lg bg-accent px-6 py-3 font-medium text-nav-fore transition hover:brightness-95 md:bg-primary md:text-white md:hover:bg-primary-hover md:hover:brightness-100"
            >
                {text.submit}
            </button>
        </form>
    );
}
