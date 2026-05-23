import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import ShopPageClient from "./ShopPageClient";

export const metadata: Metadata = buildPageMetadata({
  title: "Duky Store - Giay Boot Da Cao Cap Cho Nam Nu",
  description:
    "Kham pha giay boot da, ao khoac da va phu kien thoi trang cao cap tai Duky Store, tu van size va giao hang toan quoc.",
  path: "/",
  image: "/assets/banner_hero.png",
});

export default function ShopPage() {
  return <ShopPageClient />;
}
