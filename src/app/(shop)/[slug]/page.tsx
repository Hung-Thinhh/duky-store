import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { fetchProducts } from "@/lib/api";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbJsonLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { Product } from "@/types/product";
import CollectionClient from "./CollectionClient";

export const revalidate = 60;

// ─── Known parent categories that include children products ──────────────────
const PARENT_CATEGORIES = ["boot-nam", "boot-nu", "phu-kien", "unisex"];

// ─── Collection metadata (hero banners, titles) ─────────────────────────────
// TODO: Replace with API call when backend is ready
// Example: const bannerData = await fetch(`${API_URL}/banners/collection/${slug}`).then(res => res.json());
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
    title: "Giày Boot Nam Cao Cấp",
    description:
      "Bộ sưu tập giày boot nam cao cấp - Da thật, thiết kế tinh tế.",
    heroImage: "/assets/banner_boot_nam.jpg",
    heroTitle: "GIÀY BOOT\nNAM CAO CẤP",
    heroDescription:
      "Thiết kế tinh tế - Da thật cao cấp - Bền bỉ theo thời gian",
    banner: {
      badge: "MEN'S COLLECTION",
      titleLine1: "BOOT NAM",
      titleLine2: "CAO CẤP",
      description: "Thiết kế tinh tế – Da thật cao cấp – Bền bỉ theo thời gian.",
    },
  },
  "boot-nu": {
    title: "Giày Boot Nữ Cao Cấp",
    description: "Bộ sưu tập giày boot nữ - Thanh lịch, quyến rũ.",
    heroImage: "/assets/banner_boot_nu.jpg",
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
    title: "Phụ Kiện",
    description: "Phụ kiện thời trang cao cấp.",
    heroImage: "/assets/banner_phukien.jpg",
    heroTitle: "PHỤ KIỆN\nCAO CẤP",
    heroDescription: "Hoàn thiện phong cách với phụ kiện đẳng cấp",
    banner: {
      badge: "ACCESSORIES",
      titleLine1: "PHỤ KIỆN",
      titleLine2: "ĐẲNG CẤP",
      description: "Hoàn thiện phong cách với những phụ kiện được chọn lọc kỹ lưỡng.",
    },
  },
  unisex: {
    title: "Unisex",
    description: "Gợi ý phối đồ cùng boot.",
    heroImage: "/assets/banner_outfit.jpg",
    heroTitle: "UNISEX\nPHỐI ĐỒ",
    heroDescription: "Gợi ý phong cách phối đồ cùng boot Duky",
    banner: {
      badge: "UNISEX",
      titleLine1: "THỜI TRANG",
      titleLine2: "DUKY",
      description: "Cùng Duky nâng tầm phong cách phối đồ cùng boot – Tự tin mỗi ngày.",
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

  return buildMetadata({
    title: meta.title,
    description: meta.description,
    path: `/${slug}`,
    image: meta.heroImage,
  });
}

// ─── Helper: fetch all products for a parent category (parent + children) ────
async function fetchParentCategoryProducts(
  slug: string
): Promise<Product[]> {
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

  return (
    <>
      {/* JSON-LD Structured Data */}
      <JsonLd data={breadcrumbData} />

      {/* ═══ SECTION 1: Hero Banner ═══ */}
      <section
        className="relative w-full"
        style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}
      >
        <Image
          src={meta.heroImage}
          alt={meta.heroTitle}
          width={1920}
          height={1080}
          sizes="100vw"
          className="w-full h-[260px] sm:h-[320px] md:h-auto object-cover"
          priority
        />
        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20">
            <div className="space-y-2 md:space-y-3 max-w-sm sm:max-w-md">
              <span className="inline-block text-[10px] md:text-xs font-medium tracking-widest text-gray-500 uppercase">
                {meta.banner.badge}
              </span>
              <h1 className="leading-[1.1] tracking-tighter text-gray-900">
                <span className="block text-[24px] sm:text-[36px] md:text-[52px] lg:text-[64px] font-semibold">{meta.banner.titleLine1}</span>
                <span className="block text-[20px] sm:text-[30px] md:text-[44px] lg:text-[56px] font-medium italic -mt-1 md:-mt-2">
                  <span className="font-montserrat not-italic font-semibold tracking-wide bg-gradient-to-br from-zinc-500 via-zinc-300 to-zinc-700 bg-clip-text text-transparent inline-block ml-1 md:ml-2">{meta.banner.titleLine2}</span>
                </span>
              </h1>
              <div className="flex items-start gap-2 md:gap-3 max-w-[170px] sm:max-w-sm">
                <div className="w-6 sm:w-8 h-px bg-gray-900 mt-2 shrink-0" />
                <p className="text-[11px] md:text-sm text-gray-500 leading-relaxed font-light line-clamp-3 sm:line-clamp-none">
                  {meta.banner.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: Product Showcase (Client Component) ═══ */}
      <Suspense fallback={<div className="animate-pulse h-[50vh] bg-gray-50 rounded-2xl" />}>
        <CollectionClient
          initialProducts={products}
          slug={slug}
          collectionTitle={meta.title}
        />
      </Suspense>
    </>
  );
}
