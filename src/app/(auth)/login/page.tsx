import type { Metadata } from "next";
import AuthCard from "@/components/AuthCard";
import content from "@/data/site-content.json";

export const metadata: Metadata = {
    title: `${content.login.title} | ${content.siteInfo.shopName}`,
};

export default function LoginPage() {
    return <AuthCard initialMode="login" />;
}
