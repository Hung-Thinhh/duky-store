import React, { Suspense } from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { SearchClient } from "./SearchClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Tìm kiếm sản phẩm",
    description: "Tìm kiếm các sản phẩm giày boot nam, giày boot nữ và phụ kiện thời trang cao cấp tại Duky Store.",
    path: "/tim-kiem",
  });
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh] text-[var(--text-muted)] font-medium">
          Đang tải trang tìm kiếm...
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
