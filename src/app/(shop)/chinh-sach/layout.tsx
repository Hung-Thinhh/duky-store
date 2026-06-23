import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Chinh Sach Mua Hang Duky Store",
  description:
    "Tổng hợp chính sách mua hàng tại Duky Store bao gồm quy định đổi size, bảo hành sản phẩm, chính sách giao hàng và thông tin hỗ trợ khách hàng tốt nhất.",
  path: "/chinh-sach",
  image: "/assets/logo-duky-fashion.webp",
});

export default function PolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
