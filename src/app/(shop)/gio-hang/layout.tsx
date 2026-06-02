import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata("Gio Hang");

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
