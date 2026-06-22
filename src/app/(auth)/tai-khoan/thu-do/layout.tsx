import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata("Thử đồ | Duky Store");

export default function TryOnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
