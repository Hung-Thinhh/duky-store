import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { fetchProducts, fetchCatalogBanners } from "@/lib/api";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbJsonLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { Product } from "@/types/product";
import CollectionClient from "./CollectionClient";

export const revalidate = 60;

// ─── Known parent categories that include children products ──────────────────
const PARENT_CATEGORIES = ["boot-nam", "boot-nu", "phu-kien", "unisex"];

// ─── Collection metadata (hero banners, titles) ─────────────────────────────
const COLLECTION_META: Record<
  string,
  {
    title: string;
    description: string;
    heroImage: string;
    heroTitle: string;
    heroDescription: string;
    banner: {
      badge: string;
      titleLine1: string;
      titleLine2: string;
      description: string;
    };
  }
> = {
  "boot-nam": {
    title: "Boot Nam",
    description:
      "Bộ sưu tập giày boot nam cao cấp - Da thật, thiết kế tinh tế.",
    heroImage: "/assets/banner_boot_nam.webp",
    heroTitle: "GIÀY BOOT\nNAM CAO CẤP",
    heroDescription:
      "Thiết kế tinh tế - Da thật cao cấp - Bền bỉ theo thời gian",
    banner: {
      badge: "MEN'S COLLECTION",
      titleLine1: "BOOT NAM",
      titleLine2: "CAO CẤP",
      description:
        "Thiết kế tinh tế – Da thật cao cấp – Bền bỉ theo thời gian.",
    },
  },
  "boot-nu": {
    title: "Boot Nữ",
    description: "Bộ sưu tập giày boot nữ - Thanh lịch, quyến rũ.",
    heroImage: "/assets/banner_boot_nu.webp",
    heroTitle: "GIÀY BOOT\nNỮ CAO CẤP",
    heroDescription:
      "Tôn dáng trong từng bước đi - Phong cách nữ tính hiện đại",
    banner: {
      badge: "WOMEN'S COLLECTION",
      titleLine1: "BOOT NỮ",
      titleLine2: "CAO CẤP",
      description: "Tôn dáng trong từng bước đi – Phong cách nữ tính hiện đại.",
    },
  },
  "phu-kien": {
    title: "Phụ kiện",
    description: "Phụ kiện thời trang cao cấp.",
    heroImage: "/assets/banner_phukien.webp",
    heroTitle: "PHỤ KIỆN\nCAO CẤP",
    heroDescription: "Hoàn thiện phong cách với phụ kiện đẳng cấp",
    banner: {
      badge: "ACCESSORIES",
      titleLine1: "PHỤ KIỆN",
      titleLine2: "ĐẲNG CẤP",
      description:
        "Hoàn thiện phong cách với những phụ kiện được chọn lọc kỹ lưỡng.",
    },
  },
  unisex: {
    title: "Unisex",
    description: "Gợi ý phối đồ cùng boot.",
    heroImage: "/assets/banner_outfit.webp",
    heroTitle: "UNISEX\nPHỐI ĐỒ",
    heroDescription: "Gợi ý phong cách phối đồ cùng boot Duky",
    banner: {
      badge: "UNISEX",
      titleLine1: "THỜI TRANG",
      titleLine2: "DUKY",
      description:
        "Cùng Duky nâng tầm phong cách phối đồ cùng boot – Tự tin mỗi ngày.",
    },
  },
};

// ─── Static params for ISR pre-generation ────────────────────────────────────
export function generateStaticParams() {
  return [
    { slug: "boot-nam" },
    { slug: "boot-nu" },
    { slug: "phu-kien" },
    { slug: "unisex" },
  ];
}

// ─── Metadata generation ─────────────────────────────────────────────────────
interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = COLLECTION_META[slug];

  if (!meta) {
    return buildMetadata({
      title: "Bộ sưu tập",
      description: "Khám phá bộ sưu tập sản phẩm tại Duky Store",
      path: `/${slug}`,
    });
  }

  // Fetch dynamic metadata if available
  const catalogBanners = await fetchCatalogBanners();
  const dbSlot = catalogBanners?.[slug];

  const title = meta.title;
  const description = dbSlot?.desktop?.description ?? meta.description;
  const image = dbSlot?.desktop?.image ?? meta.heroImage;

  return buildMetadata({
    title,
    description,
    path: `/${slug}`,
    image,
  });
}

// ─── Helper: fetch all products for a parent category (parent + children) ────
async function fetchParentCategoryProducts(slug: string): Promise<Product[]> {
  try {
    const result = await fetchProducts({
      categorySlug: slug,
      limit: 100,
      sort: "newest",
    });
    return result.data;
  } catch {
    return [];
  }
}

// ─── Page Component (Server) ─────────────────────────────────────────────────
export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const meta = COLLECTION_META[slug];

  if (!meta) {
    notFound();
  }

  // Fetch dynamic catalog banner config from DB
  const catalogBanners = await fetchCatalogBanners();
  const dbSlot = catalogBanners?.[slug];

  // Fetch products: for parent categories, include children
  const isParentCategory = PARENT_CATEGORIES.includes(slug);
  let products: Product[];

  if (isParentCategory) {
    products = await fetchParentCategoryProducts(slug);
  } else {
    const result = await fetchProducts({
      categorySlug: slug,
      limit: 100,
      sort: "newest",
    });
    products = result.data;
  }

  // Build breadcrumb JSON-LD
  const breadcrumbData = buildBreadcrumbJsonLd([
    { name: "Trang chủ", url: "/" },
    { name: meta.title, url: `/${slug}` },
  ]);

  const hasBanner = !!(dbSlot?.desktop?.image || dbSlot?.tablet?.image || dbSlot?.mobile?.image);

  return (
    <>
      {/* JSON-LD Structured Data */}
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
                alt={dbSlot.desktop.titleLine1 || meta.heroTitle}
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
                      <span className="inline-block text-[10px] md:text-xs font-medium tracking-widest text-gray-600 uppercase">
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
                        <p className="text-[11px] md:text-sm text-gray-600 leading-relaxed font-light line-clamp-3 sm:line-clamp-none">
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
                alt={dbSlot.tablet.titleLine1 || meta.heroTitle}
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
                      <span className="inline-block text-[10px] md:text-xs font-medium tracking-widest text-gray-600 uppercase">
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
                        <p className="text-[11px] text-gray-600 leading-relaxed font-light line-clamp-3 sm:line-clamp-none">
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
                alt={dbSlot.mobile.titleLine1 || meta.heroTitle}
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
                      <span className="inline-block text-[10px] font-medium tracking-widest text-gray-600 uppercase">
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
                        <p className="text-[11px] text-gray-600 leading-relaxed font-light line-clamp-3">
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

      {/* ═══ SECTION 2: Product Showcase (Client Component) ═══ */}
      <Suspense
        fallback={
          <div className="animate-pulse h-[50vh] bg-gray-50 rounded-2xl" />
        }
      >
        <CollectionClient
          initialProducts={products}
          slug={slug}
          collectionTitle={meta.title}
        />
      </Suspense>
    </>
  );
}
