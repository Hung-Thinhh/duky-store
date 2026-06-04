import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Gallery Phong Cach Duky Store",
  description:
    "Bo suu tap hinh anh phoi do voi giay boot, ao khoac da va phu kien thoi trang Duky Store.",
  path: "/gallery",
  image: "/assets/page_img.webp",
});

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
