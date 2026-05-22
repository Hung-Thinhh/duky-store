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
      path: `/collections/${slug}`,
    });
  }

  return buildMetadata({
    title: meta.title,
    description: meta.description,
    path: `/collections/${slug}`,
    image: meta.heroImage,
  });
}

// ─── Helper: fetch categories from API ───────────────────────────────────────
interface CategoryItem {
  id: string;
  slug: string;
  parentId: string | null;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

async function fetchCategories(): Promise<CategoryItem[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.DT?.data || [];
  } catch {
    return [];
  }
}

// ─── Helper: fetch all products for a parent category (parent + children) ────
async function fetchParentCategoryProducts(
  slug: string
): Promise<Product[]> {
  const categories = await fetchCategories();

  // Find the parent category
  const parentCat = categories.find((c) => c.slug === slug);

  // Collect all slugs to fetch: parent + children
  const slugsToFetch = new Set<string>([slug]);
  if (parentCat) {
    for (const child of categories.filter(
      (c) => c.parentId === parentCat.id
    )) {
      slugsToFetch.add(child.slug);
    }
  }

  // Fetch products from all slugs in parallel
  const results = await Promise.all(
    Array.from(slugsToFetch).map((s) =>
      fetchProducts({ categorySlug: s, limit: 100, sort: "newest" }).catch(
        () => ({ data: [] as Product[], pagination: null })
      )
    )
  );

  // Deduplicate products by id
  const seen = new Set<string>();
  const merged: Product[] = [];
  for (const result of results) {
    for (const product of result.data) {
      if (!seen.has(product.id)) {
        seen.add(product.id);
        merged.push(product);
      }
    }
  }

  return merged;
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
    { name: meta.title, url: `/collections/${slug}` },
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
          className="w-full h-auto"
          priority
        />
        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="px-12 md:px-16 lg:px-[100px] space-y-3">
            <span className="inline-block text-xs font-medium tracking-widest text-gray-500 uppercase">
              {meta.banner.badge}
            </span>
            <h1 className="leading-[1.1] tracking-tighter text-gray-900">
              <span className="block text-[36px] md:text-[52px] lg:text-[64px] font-semibold">{meta.banner.titleLine1}</span>
              <span className="block text-[30px] md:text-[44px] lg:text-[56px] font-medium italic -mt-1 md:-mt-2">
                <span className="font-montserrat not-italic font-semibold tracking-wide bg-gradient-to-br from-zinc-500 via-zinc-300 to-zinc-700 bg-clip-text text-transparent inline-block ml-1 md:ml-2">{meta.banner.titleLine2}</span>
              </span>
            </h1>
            <div className="flex items-start gap-3 max-w-sm">
              <div className="w-8 h-px bg-gray-900 mt-2.5 shrink-0" />
              <p className="text-sm text-gray-500 leading-relaxed font-light">
                {meta.banner.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: Product Showcase (Client Component) ═══ */}
      <CollectionClient
        initialProducts={products}
        slug={slug}
        collectionTitle={meta.title}
      />
    </>
  );
}
