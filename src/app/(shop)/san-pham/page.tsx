import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { fetchProducts, fetchCatalogBanners } from "@/lib/api";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbJsonLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { Product } from "@/types/product";
import { ProductsClient } from "./ProductsClient";

export const revalidate = 60;

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

  const catalogBanners = await fetchCatalogBanners();
  const dbSlot = catalogBanners?.["san-pham"];
  const hasBanner = !!(dbSlot?.desktop?.image || dbSlot?.tablet?.image || dbSlot?.mobile?.image);

  const breadcrumbData = buildBreadcrumbJsonLd([
    { name: "Trang chủ", url: "/" },
    { name: "Tất cả sản phẩm", url: "/san-pham" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbData} />

      {/* ═══ SECTION 1: Hero Banner ═══ */}
      {hasBanner && (
        <section
          className="relative w-full"
          style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}
        >
          {/* Desktop image layout */}
          {dbSlot?.desktop?.image && (
            <div className="hidden md:block w-full relative">
              <Image
                src={dbSlot.desktop.image}
                alt={dbSlot.desktop.titleLine1 || "Tất cả sản phẩm - Duky Store"}
                width={1920}
                height={1080}
                sizes="100vw"
                className="w-full h-auto object-cover"
                priority
              />
              {/* Desktop Text Overlay */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20">
                  <div className="space-y-2 md:space-y-3 max-w-sm sm:max-w-md">
                    {dbSlot.desktop.badge && (
                      <span className="inline-block text-[10px] md:text-xs font-medium tracking-widest text-gray-500 uppercase">
                        {dbSlot.desktop.badge}
                      </span>
                    )}
                    {(dbSlot.desktop.titleLine1 || dbSlot.desktop.titleLine2) && (
                      <h1 className="leading-[1.1] tracking-tighter text-gray-900">
                        {dbSlot.desktop.titleLine1 && (
                          <span className="block text-[24px] sm:text-[36px] md:text-[52px] lg:text-[64px] font-semibold">
                            {dbSlot.desktop.titleLine1}
                          </span>
                        )}
                        {dbSlot.desktop.titleLine2 && (
                          <span className="block text-[20px] sm:text-[30px] md:text-[44px] lg:text-[56px] font-medium italic -mt-1 md:-mt-2">
                            <span className="font-montserrat not-italic font-semibold tracking-wide bg-gradient-to-br from-zinc-500 via-zinc-300 to-zinc-700 bg-clip-text text-transparent inline-block ml-1 md:ml-2">
                              {dbSlot.desktop.titleLine2}
                            </span>
                          </span>
                        )}
                      </h1>
                    )}
                    {dbSlot.desktop.description && (
                      <div className="flex items-start gap-2 md:gap-3 max-w-[170px] sm:max-w-sm">
                        <div className="w-6 sm:w-8 h-px bg-gray-900 mt-2 shrink-0" />
                        <p className="text-[11px] md:text-sm text-gray-500 leading-relaxed font-light line-clamp-3 sm:line-clamp-none">
                          {dbSlot.desktop.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tablet image layout */}
          {dbSlot?.tablet?.image && (
            <div className="hidden sm:block md:hidden w-full relative">
              <Image
                src={dbSlot.tablet.image}
                alt={dbSlot.tablet.titleLine1 || "Tất cả sản phẩm - Duky Store"}
                width={1024}
                height={576}
                sizes="100vw"
                className="w-full h-[320px] object-cover"
                priority
              />
              {/* Tablet Text Overlay */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full max-w-[1024px] mx-auto px-6 md:px-20">
                  <div className="space-y-2 md:space-y-3 max-w-sm sm:max-w-md">
                    {dbSlot.tablet.badge && (
                      <span className="inline-block text-[10px] md:text-xs font-medium tracking-widest text-gray-500 uppercase">
                        {dbSlot.tablet.badge}
                      </span>
                    )}
                    {(dbSlot.tablet.titleLine1 || dbSlot.tablet.titleLine2) && (
                      <h1 className="leading-[1.1] tracking-tighter text-gray-900">
                        {dbSlot.tablet.titleLine1 && (
                          <span className="block text-[24px] sm:text-[36px] font-semibold">
                            {dbSlot.tablet.titleLine1}
                          </span>
                        )}
                        {dbSlot.tablet.titleLine2 && (
                          <span className="block text-[20px] sm:text-[30px] font-medium italic -mt-1">
                            <span className="font-montserrat not-italic font-semibold tracking-wide bg-gradient-to-br from-zinc-500 via-zinc-300 to-zinc-700 bg-clip-text text-transparent inline-block ml-1">
                              {dbSlot.tablet.titleLine2}
                            </span>
                          </span>
                        )}
                      </h1>
                    )}
                    {dbSlot.tablet.description && (
                      <div className="flex items-start gap-2 max-w-[170px] sm:max-w-sm">
                        <div className="w-6 sm:w-8 h-px bg-gray-900 mt-2 shrink-0" />
                        <p className="text-[11px] text-gray-500 leading-relaxed font-light line-clamp-3 sm:line-clamp-none">
                          {dbSlot.tablet.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile image layout */}
          {dbSlot?.mobile?.image && (
            <div className="block sm:hidden w-full relative">
              <Image
                src={dbSlot.mobile.image}
                alt={dbSlot.mobile.titleLine1 || "Tất cả sản phẩm - Duky Store"}
                width={640}
                height={360}
                sizes="100vw"
                className="w-full h-[260px] object-cover"
                priority
              />
              {/* Mobile Text Overlay */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full max-w-[640px] mx-auto px-6">
                  <div className="space-y-2 max-w-[170px]">
                    {dbSlot.mobile.badge && (
                      <span className="inline-block text-[10px] font-medium tracking-widest text-gray-500 uppercase">
                        {dbSlot.mobile.badge}
                      </span>
                    )}
                    {(dbSlot.mobile.titleLine1 || dbSlot.mobile.titleLine2) && (
                      <h1 className="leading-[1.1] tracking-tighter text-gray-900">
                        {dbSlot.mobile.titleLine1 && (
                          <span className="block text-[24px] font-semibold">
                            {dbSlot.mobile.titleLine1}
                          </span>
                        )}
                        {dbSlot.mobile.titleLine2 && (
                          <span className="block text-[20px] font-medium italic -mt-1">
                            <span className="font-montserrat not-italic font-semibold tracking-wide bg-gradient-to-br from-zinc-500 via-zinc-300 to-zinc-700 bg-clip-text text-transparent inline-block ml-1">
                              {dbSlot.mobile.titleLine2}
                            </span>
                          </span>
                        )}
                      </h1>
                    )}
                    {dbSlot.mobile.description && (
                      <div className="flex items-start gap-2 max-w-[170px]">
                        <div className="w-6 h-px bg-gray-900 mt-2 shrink-0" />
                        <p className="text-[11px] text-gray-500 leading-relaxed font-light line-clamp-3">
                          {dbSlot.mobile.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

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
