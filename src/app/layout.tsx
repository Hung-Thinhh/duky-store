import type { Metadata } from "next";
import Script from "next/script";
import { Playfair_Display, Montserrat } from "next/font/google";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/seo";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://dukystore.com",
  ),
  title: {
    default: "Duky Store - Giày Boot Da Cao Cấp",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Duky Store chuyên giày boot da, áo khoác da và phụ kiện thời trang cao cấp cho nam nữ, tư vấn size và giao hàng toàn quốc.",
  applicationName: SITE_NAME,
  keywords: [
    "Duky Store",
    "giày boot",
    "giày boot da",
    "boot nam",
    "boot nữ",
    "áo khoác da",
    "phụ kiện thời trang",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Duky Store - Giày Boot Da Cao Cấp",
    description:
      "Mua giày boot da, áo khoác da và phụ kiện thời trang cao cấp tại Duky Store.",
    url: "/",
    siteName: SITE_NAME,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        alt: SITE_NAME,
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Duky Store - Giày Boot Da Cao Cấp",
    description:
      "Mua giày boot da, áo khoác da và phụ kiện thời trang cao cấp tại Duky Store.",
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { Chatbot } from "@/components/chatbot/Chatbot";
import { Providers } from "@/components/Providers";
import StyledJsxRegistry from "@/lib/registry";
import FacebookPixel from "@/components/analytics/FacebookPixel";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

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
        <FacebookPixel pixelId={process.env.FB_PIXEL_ID} />
        <GoogleAnalytics gaId={process.env.GA_MEASUREMENT_ID} />
        <StyledJsxRegistry>

          <Providers>
            {children}
            <ScrollToTop />
            <Chatbot />
          </Providers>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}

