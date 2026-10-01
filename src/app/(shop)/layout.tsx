import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import content from "@/data/site-content.json";
import { getCurrentUser } from "@/lib/session"
import CartProvider from "@/components/CartProvider";

// Shop pages get the navbar and footer; auth pages (login/signup) don't
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // CartProvider wraps everything, including the Navbar (the cart panel lives there)
  return (
    <CartProvider>
      <Navbar
        siteName={content.siteInfo.shopName}
        links={content.nav}
        isLoggedIn={!!user}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4">
        {children}
      </main>

      <Footer
        siteName={content.siteInfo.shopName}
        footer={content.footer}
      />
    </CartProvider>
  );
}
