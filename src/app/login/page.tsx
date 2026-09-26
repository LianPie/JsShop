import type { Metadata } from "next";
import LoginForm from "../../components/LoginForm";
import StarsBackground from "../../components/StarsBackground";
import content from "@/data/site-content.json";

export const metadata: Metadata = {
    title: `${content.login.title} | ${content.siteInfo.shopName}`,
};

export default function LoginPage() {
    return (
        // Phone: rounded starfield card, only as tall as the form
        // Desktop: bordered card with the form on one side, starfield on the other
        <div className="relative mt-6 mb-6 overflow-hidden rounded-2xl px-6 py-10 shadow-sm md:mt-10 md:grid md:grid-cols-2 md:border md:border-border md:bg-surface md:p-0">

            {/* Phone background */}
            <StarsBackground className="md:hidden" />

            {/* Form side */}
            <div className="relative mx-auto w-full max-w-sm text-white md:py-16 md:text-foreground">
                <h1 className="text-3xl font-semibold tracking-tight">
                    {content.login.title}
                </h1>

                <p className="mt-2 mb-8 text-white/80 md:text-muted">
                    {content.login.subtitle}
                </p>

                <LoginForm text={content.login} />
            </div>

            {/* Starfield side (desktop only) */}
            <div className="relative hidden md:flex md:min-h-96 md:items-center md:justify-center">
                <StarsBackground />
                <p className="relative text-4xl font-light tracking-[0.3em] text-white">
                    {content.siteInfo.shopName}
                </p>
            </div>
        </div>
    );
}
