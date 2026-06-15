import React, { Suspense } from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { fetchCatalogBanners } from "@/lib/api";
import { SearchClient } from "./SearchClient";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Tìm kiếm sản phẩm",
    description: "Tìm kiếm các sản phẩm giày boot nam, giày boot nữ và phụ kiện thời trang cao cấp tại Duky Store.",
    path: "/tim-kiem",
  });
}

export default async function SearchPage() {
  const catalogBanners = await fetchCatalogBanners();
  const dbSlot = catalogBanners?.["tim-kiem"] || null;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh] text-[var(--text-muted)] font-medium">
          Đang tải trang tìm kiếm...
        </div>
      }
    >
      <SearchClient bannerSlot={dbSlot} />
    </Suspense>
  );
}
