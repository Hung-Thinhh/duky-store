import type { Metadata } from "next";
import Script from "next/script";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Duky Store - Premium Women's Boots",
  description:
    "Premium e-commerce landing page for high-end women's boots, featuring a blend of minimalism, glassmorphism, and neumorphism.",
  icons: {
    icon: "/assets/logo_header.png",
    shortcut: "/assets/logo_header.png",
    apple: "/assets/logo_header.png",
  },
};

import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { Providers } from "@/components/Providers";
import StyledJsxRegistry from "@/lib/registry";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${playfair.variable} ${montserrat.variable}`}>
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <StyledJsxRegistry>
          <Providers>
            {children}
            <ScrollToTop />
          </Providers>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
