import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import content from "@/data/site-content.json";

// Shop pages get the navbar and footer; auth pages (login/signup) don't
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar
        siteName={content.siteInfo.shopName}
        links={content.nav} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4">
        {children}
      </main>

      <Footer
        siteName={content.siteInfo.shopName}
        footer={content.footer}
      />
    </>
  );
}
