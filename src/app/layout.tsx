import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import content from "@/data/site-content.json";
// Load FontAwesome's CSS with the page instead of letting it inject the CSS
// later with JavaScript (that delay made icons flash huge on first load)
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

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
        {children}
      </body>
    </html>
  );
}
