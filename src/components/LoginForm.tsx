"use client";

import type { FormEvent } from "react";
import { AuthField, AuthSubmit } from "./AuthFields";

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
            <AuthField id="login-phone" label={text.phone} type="tel" autoComplete="tel" digitsOnly />
            <AuthField id="login-password" label={text.password} type="password" autoComplete="current-password" />
            <AuthSubmit>{text.submit}</AuthSubmit>
        </form>
    );
}
