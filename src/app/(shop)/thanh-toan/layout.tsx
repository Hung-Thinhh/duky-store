import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata("Thanh Toan");

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
