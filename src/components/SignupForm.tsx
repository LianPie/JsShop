"use client";

import { useState, type FormEvent } from "react";
import { AuthField, AuthSubmit } from "./AuthFields";
import { passwordRules, isValidPassword, PasswordRule, PASSWORD_MAX_LENGTH, NAME_MAX_LENGTH } from "@/lib/validation";

type SignupFormInfo = {
    text: {
        name: string;
        phone: string;
        password: string;
        repeatPassword: string;
        rules: {
            length: string;
            uppercase: string;
            lowercase: string;
        };
        mismatch: string;
        submit: string;
        networkError: string;
    };
}

export default function SignupForm({ text }: SignupFormInfo) {
    const [password, setPassword] = useState("");
    const [repeat, setRepeat] = useState("");
    // Becomes true after the first submit attempt, so errors show even on untouched fields
    const [triedSubmit, setTriedSubmit] = useState(false);
    // True while waiting for the server; disables the button
    const [loading, setLoading] = useState(false);
    // Message from the server (e.g. "already registered"), shown above the button
    const [error, setError] = useState<string | null>(null);

    // The password rules, checked on every keystroke.
    // NOTE: the signup API must check these again; browser checks can be skipped.
    const rules = (Object.keys(passwordRules) as PasswordRule[]).map((name) => ({
        label: text.rules[name],
        met: passwordRules[name](password),
    }));

    const passwordValid = isValidPassword(password);

    // Only complain about the repeat field once something has been typed in it
    const mismatch = (repeat.length > 0 || triedSubmit) && repeat !== password;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        // Stop the browser from submitting the form itself
        event.preventDefault();

        if (!passwordValid || repeat !== password) {
            setTriedSubmit(true);
            return;
        }

        // Name and phone aren't in state, so read them from the form
        const form = new FormData(event.currentTarget);
        const name = form.get("signup-name");
        const phone = form.get("signup-phone");

        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, password }),
            });

            if (!res.ok) {
                // The API sends { message: "..." } for every error
                const data = await res.json().catch(() => null);
                setError(data?.message ?? text.networkError);
                return;
            }

            // Account created and logged in: full reload so the navbar sees the new cookie
            window.location.href = "/";
        } catch {
            // fetch itself failed: server down, no internet, etc.
            setError(text.networkError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AuthField id="signup-name" label={text.name} autoComplete="name" maxLength={NAME_MAX_LENGTH} />
            <AuthField id="signup-phone" label={text.phone} type="tel" autoComplete="tel" digitsOnly />

            <AuthField
                id="signup-password"
                label={text.password}
                type="password"
                autoComplete="new-password"
                maxLength={PASSWORD_MAX_LENGTH}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                invalid={triedSubmit && !passwordValid}
                describedBy="signup-password-rules"
            >
                {/* Live checklist: each rule turns into a tick once it's met */}
                <ul id="signup-password-rules" className="flex flex-col gap-1 text-xs">
                    {rules.map((rule) => (
                        <li
                            key={rule.label}
                            className={`flex items-center gap-2 ${rule.met
                                ? "text-white md:text-primary"
                                : triedSubmit
                                    ? "text-red-300 md:text-red-600"
                                    : "text-white/60 md:text-muted"
                                }`}
                        >
                            <span aria-hidden="true">{rule.met ? "✓" : "•"}</span>
                            {rule.label}
                        </li>
                    ))}
                </ul>
            </AuthField>

            <AuthField
                id="signup-repeat-password"
                label={text.repeatPassword}
                type="password"
                autoComplete="new-password"
                maxLength={PASSWORD_MAX_LENGTH}
                value={repeat}
                onChange={(event) => setRepeat(event.target.value)}
                invalid={mismatch}
                describedBy={mismatch ? "signup-repeat-error" : undefined}
            >
                {mismatch && (
                    <p id="signup-repeat-error" role="alert" className="text-xs text-red-300 md:text-red-600">
                        {text.mismatch}
                    </p>
                )}
            </AuthField>

            {error && (
                <p role="alert" className="rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-100 md:bg-red-50 md:text-red-700">
                    {error}
                </p>
            )}

            <AuthSubmit disabled={loading}>{text.submit}</AuthSubmit>
        </form>
    );
}
