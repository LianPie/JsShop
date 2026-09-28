"use client";

import { useState, type FormEvent } from "react";
import { AuthField, AuthSubmit } from "./AuthFields";

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
    };
}

export default function SignupForm({ text }: SignupFormInfo) {
    const [password, setPassword] = useState("");
    const [repeat, setRepeat] = useState("");
    // Becomes true after the first submit attempt, so errors show even on untouched fields
    const [triedSubmit, setTriedSubmit] = useState(false);

    // The password rules, checked on every keystroke.
    // NOTE: the signup API must check these again; browser checks can be skipped.
    const rules = [
        { label: text.rules.length, met: password.length >= 8 },
        { label: text.rules.uppercase, met: /[A-Z]/.test(password) },
        { label: text.rules.lowercase, met: /[a-z]/.test(password) },
    ];
    const passwordValid = rules.every((rule) => rule.met);

    // Only complain about the repeat field once something has been typed in it
    const mismatch = (repeat.length > 0 || triedSubmit) && repeat !== password;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        // Stop the browser from submitting the form itself
        event.preventDefault();

        if (!passwordValid || repeat !== password) {
            setTriedSubmit(true);
            return;
        }

        // TODO: send name + phone + password to the signup API once it exists
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AuthField id="signup-name" label={text.name} autoComplete="name" />
            <AuthField id="signup-phone" label={text.phone} type="tel" autoComplete="tel" digitsOnly />

            <AuthField
                id="signup-password"
                label={text.password}
                type="password"
                autoComplete="new-password"
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

            <AuthSubmit>{text.submit}</AuthSubmit>
        </form>
    );
}
