import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Lien He Duky Store",
  description:
    "Lien he Duky Store de duoc tu van size giay boot, chinh sach bao hanh, doi size va ho tro dat hang.",
  path: "/lien-he",
  image: "/assets/logo-duky-fashion.webp",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
