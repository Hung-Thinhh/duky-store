import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata("Tai Khoan Duky Store");

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
