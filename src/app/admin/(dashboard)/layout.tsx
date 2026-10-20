import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import content from "@/data/site-content.json";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import AdminProvider from "@/components/admin/AdminProvider";

// Admin pages get a sidebar and top header; unauthorized users are redirected
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 1. Explicitly check for the "admin" session
  const user = await getCurrentUser("admin");

  // Basic protection: ensure the user exists and has an admin role
  if (!user || user.access !== 1) {
    // 2. Redirect them to the admin login page
    redirect("/admin/login"); 
  }

  // AdminProvider wraps everything (useful for managing mobile sidebar toggle state, toasts, etc.)
  return (
    <AdminProvider>
      <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
        
        <AdminSidebar 
          siteName={content.siteInfo.shopName} 
          links={content.adminNav} 
        />

        {/* Main content wrapper */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader 
            user={user} 
          />

          {/* Scrollable main area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
        
      </div>
    </AdminProvider>
  );
}