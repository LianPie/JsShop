import type { Metadata } from "next";
import AuthCard from "@/components/AuthCard";
import content from "@/data/site-content.json";

export const metadata: Metadata = {
    title: `${content.signup.title} | ${content.siteInfo.shopName}`,
};

export default function SignupPage() {
    return <AuthCard initialMode="signup" />;
}
