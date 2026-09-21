import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import content from "@/data/site-content.json";

const inter = Inter({
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: content.siteInfo.shopName,
  description: content.siteInfo.metadesc,
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({ children }: LayoutProps<"/">) {

  return (
    <html
      lang={content.siteInfo.lan}

    >
      <body className={`${inter.className}  flex min-h-screen flex-col`}>
        <Navbar
          siteName={content.siteInfo.shopName}
          links={content.nav} />

        <main className="flex-1 md:mx-auto max-w-7xl px-4">
          {children}
        </main>

        <Footer
          siteName={content.siteInfo.shopName}
          footer={content.footer}
        />

      </body>
    </html>
  );
}
