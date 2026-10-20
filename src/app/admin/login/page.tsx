import type { Metadata } from "next";
import AdminLoginCard from "@/components/admin/AdminLoginCard";
import content from "@/data/site-content.json";

export const metadata: Metadata = {
  title: `Admin Login | ${content.siteInfo.shopName}`,
};

export default function AdminLoginPage() {
  return <AdminLoginCard />;
}