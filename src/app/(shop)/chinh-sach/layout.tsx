import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Chinh Sach Mua Hang Duky Store",
  description:
    "Thong tin chinh sach mua hang, doi size, bao hanh, giao hang va ho tro khach hang tai Duky Store.",
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
