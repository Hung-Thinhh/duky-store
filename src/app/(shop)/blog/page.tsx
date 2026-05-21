import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogPageClient } from "./BlogPageClient";

export const metadata: Metadata = {
  title: "Blog | Duky Store",
  description:
    "Kinh nghiệm phối đồ, bảo quản giày boot, áo khoác da và xu hướng thời trang từ Duky Store.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog | Duky Store",
    description:
      "Kinh nghiệm phối đồ, bảo quản giày boot, áo khoác da và xu hướng thời trang từ Duky Store.",
    url: "/blog",
    type: "website",
  },
};

export default function BlogPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <BlogPageClient />
    </Suspense>
  );
}
