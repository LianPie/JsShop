"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import StarsBackground from "./StarsBackground";
import content from "@/data/site-content.json";

type Mode = "login" | "signup";

// Phone: full-screen starfield, one form at a time with a switch link under it.
// Desktop: login on the left, signup on the right, and a starfield panel that
// slides over whichever form isn't active.
export default function AuthCard({ initialMode }: { initialMode: Mode }) {
    const [mode, setMode] = useState<Mode>(initialMode);

    const switchTo = (next: Mode) => {
        setMode(next);
        // Keep the URL in sync so a refresh stays on the same form
        window.history.replaceState(null, "", next === "login" ? "/login" : "/signup");
    };

    // The switch panel and link always invite you to the *other* form
    const other = mode === "login" ? content.signup : content.login;
    const otherMode: Mode = mode === "login" ? "signup" : "login";

    const mobileSwitch = (
        <p className="mt-6 text-center text-sm text-white/80 md:hidden">
            {other.switchTitle}{" "}
            <button
                type="button"
                onClick={() => switchTo(otherMode)}
                className="font-semibold text-white underline underline-offset-4"
            >
                {other.switchButton}
            </button>
        </p>
    );

    const sectionBase = "flex-col justify-center text-white md:absolute md:inset-y-0 md:flex md:w-1/2 md:px-12 md:text-foreground";

    return (
        <div className="relative flex min-h-dvh flex-1 flex-col items-center justify-center px-6 py-16 md:bg-background md:p-6">

            {/* Phone background */}
            <StarsBackground className="md:hidden" />

            {/* Logo + shop name, links back to the home page */}
            <a
                href="/"
                className="absolute left-5 top-5 z-20 flex items-center gap-3 text-white md:left-8 md:top-6 md:text-foreground"
            >
                <img
                    src="/favicon.ico"
                    alt=""
                    width={32}
                    height={32}
                    loading="eager"
                />
                <span className="text-lg font-semibold tracking-tight">
                    {content.siteInfo.shopName}
                </span>
            </a>

            <div className="relative w-full max-w-sm md:h-[44rem] md:max-w-4xl md:overflow-hidden md:rounded-2xl md:border md:border-border md:bg-surface md:shadow-sm">

                {/* Login form (left half on desktop) */}
                <section
                    inert={mode !== "login"}
                    className={`${mode === "login" ? "flex" : "hidden"} ${sectionBase} md:left-0`}
                >
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {content.login.title}
                    </h1>
                    <p className="mt-2 mb-8 text-white/80 md:text-muted">
                        {content.login.subtitle}
                    </p>
                    <LoginForm text={content.login} />
                    {mobileSwitch}
                </section>

                {/* Signup form (right half on desktop) */}
                <section
                    inert={mode !== "signup"}
                    className={`${mode === "signup" ? "flex" : "hidden"} ${sectionBase} md:right-0`}
                >
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {content.signup.title}
                    </h1>
                    <p className="mt-2 mb-8 text-white/80 md:text-muted">
                        {content.signup.subtitle}
                    </p>
                    <SignupForm text={content.signup} />
                    {mobileSwitch}
                </section>

                {/* Sliding starfield panel (desktop only): right side for login, left side for signup */}
                <div
                    className={`absolute inset-y-0 left-0 z-10 hidden w-1/2 transition-transform duration-700 ease-in-out motion-reduce:transition-none md:block ${mode === "login" ? "translate-x-full" : "translate-x-0"}`}
                >
                    <StarsBackground />
                    <div className="relative flex h-full flex-col items-center justify-center px-10 text-center text-white">
                        <p className="text-sm uppercase tracking-[0.3em] text-white/70">
                            {content.siteInfo.shopName}
                        </p>
                        <h2 className="mt-4 text-3xl font-semibold">
                            {other.switchTitle}
                        </h2>
                        <p className="mt-3 text-white/80">
                            {other.switchText}
                        </p>
                        <button
                            type="button"
                            onClick={() => switchTo(otherMode)}
                            className="mt-8 rounded-lg border border-white/70 px-8 py-3 font-medium transition hover:bg-white/10"
                        >
                            {other.switchButton}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
