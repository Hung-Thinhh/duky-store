import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { fetchProducts } from "@/lib/api";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbJsonLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { Product } from "@/types/product";
import { ProductsClient } from "./ProductsClient";

export const revalidate = 60;

const PRODUCTS_BANNER = {
  image: "/assets/banner_products.webp",
  alt: "Tất cả sản phẩm - Duky Store",
  badge: "ALL PRODUCTS",
  titleLine1: "BỘ SƯU TẬP",
  titleLine2: "DUKY STORE",
  description: "Khám phá bộ sưu tập giày boot nam nữ cao cấp tại Duky Store.",
};

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Tất cả sản phẩm",
    description:
      "Khám phá bộ sưu tập giày boot nam nữ cao cấp, phụ kiện thời trang và phong cách độc đáo tại Duky Store.",
    path: "/san-pham",
  });
}

export default async function ProductsPage() {
  let products: Product[] = [];
  try {
    const result = await fetchProducts({ limit: 100, sort: "newest" });
    products = result.data;
  } catch {
    products = [];
  }

  const breadcrumbData = buildBreadcrumbJsonLd([
    { name: "Trang chủ", url: "/" },
    { name: "Tất cả sản phẩm", url: "/san-pham" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbData} />

      <section
        className="relative w-full"
        style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}
      >
        <Image
          src={PRODUCTS_BANNER.image}
          alt={PRODUCTS_BANNER.alt}
          width={1920}
          height={1080}
          sizes="100vw"
          className="w-full h-[260px] sm:h-[320px] md:h-auto object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20">
            <div className="space-y-2 md:space-y-3 max-w-sm sm:max-w-md">
              <span className="inline-block text-[10px] md:text-xs font-medium tracking-widest text-gray-500 uppercase">
                {PRODUCTS_BANNER.badge}
              </span>
              <h1 className="leading-[1.1] tracking-tighter text-gray-900">
                <span className="block text-[24px] sm:text-[36px] md:text-[52px] lg:text-[64px] font-semibold">
                  {PRODUCTS_BANNER.titleLine1}
                </span>
                <span className="block text-[20px] sm:text-[30px] md:text-[44px] lg:text-[56px] font-medium italic -mt-1 md:-mt-2">
                  <span className="font-montserrat not-italic font-semibold tracking-wide bg-gradient-to-br from-zinc-500 via-zinc-300 to-zinc-700 bg-clip-text text-transparent inline-block ml-1 md:ml-2">
                    {PRODUCTS_BANNER.titleLine2}
                  </span>
                </span>
              </h1>
              <div className="flex items-start gap-2 md:gap-3 max-w-[170px] sm:max-w-sm">
                <div className="w-6 sm:w-8 h-px bg-gray-900 mt-2 shrink-0" />
                <p className="text-[11px] md:text-sm text-gray-500 leading-relaxed font-light line-clamp-3 sm:line-clamp-none">
                  {PRODUCTS_BANNER.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <div
            className="animate-pulse h-[50vh] bg-gray-50 rounded-2xl mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12 mt-8"
          />
        }
      >
        <ProductsClient initialProducts={products} />
      </Suspense>
    </>
  );
}
