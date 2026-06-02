import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import ProductsPageClient from "./ProductsPageClient";

export const metadata: Metadata = buildPageMetadata({
  title: "Tat Ca San Pham Giay Boot Va Phu Kien",
  description:
    "Mua giay boot nam, giay boot nu, ao khoac da va phu kien thoi trang cao cap tai Duky Store.",
  path: "/san-pham",
  image: "/assets/banner_sample.png",
});

export default function ProductsPage() {
  return <ProductsPageClient />;
}
