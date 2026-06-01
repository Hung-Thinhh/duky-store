import { Suspense } from "react";
import dynamic from "next/dynamic";
import type { Metadata } from "next";

import { Footer } from "@/components/layout";
import { CategorySection } from "@/components/shop";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";
import { buildWebsiteJsonLd } from "@/lib/structured-data";
import { SectionSkeleton } from "@/components/shop/home/SectionSkeleton";
import { HomeHeader } from "./HomeHeader";
import { HomeHeroBanner } from "./HomeHeroBanner";
import { HomeCartToast } from "./HomeCartToast";

// Lazy-load below-fold sections to reduce initial bundle size.
// These components use motion/gsap and are "use client" — dynamic import
// keeps them out of the server-rendered shell.
const LazyBootMaleSection = dynamic(
  () =>
    import("@/components/shop/home/BootMaleSection").then((m) => ({
      default: m.BootMaleSection,
    })),
  { loading: () => <SectionSkeleton /> },
);

const LazyBootFemaleSection = dynamic(
  () =>
    import("@/components/shop/home/BootFemaleSection").then((m) => ({
      default: m.BootFemaleSection,
    })),
  { loading: () => <SectionSkeleton /> },
);

const LazyGuideSection = dynamic(
  () =>
    import("@/components/shop/home/GuideSection").then((m) => ({
      default: m.GuideSection,
    })),
  { loading: () => <SectionSkeleton /> },
);

const LazyNewsSection = dynamic(
  () =>
    import("@/components/shop/home/NewsSection").then((m) => ({
      default: m.NewsSection,
    })),
  { loading: () => <SectionSkeleton /> },
);

const LazyFAQSection = dynamic(
  () =>
    import("@/components/shop/home/FAQSection").then((m) => ({
      default: m.FAQSection,
    })),
  { loading: () => <SectionSkeleton /> },
);

const LazyPreFooter = dynamic(
  () =>
    import("@/components/shop/home/PreFooter").then((m) => ({
      default: m.PreFooter,
    })),
  { loading: () => <SectionSkeleton /> },
);

import { getHeroSliderData } from "@/data/heroSlider";
import {
  fetchProductsByCategories,
  fetchProducts,
  fetchBlogPosts,
  mapBlogPostToNewsItem,
} from "@/lib/api";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Trang chủ",
    description:
      "Duky Store - Chuyên cung cấp các dòng boot nam nữ cao cấp, phụ kiện thời trang và unisex phong cách. Giao hàng toàn quốc, bảo hành chính hãng.",
    path: "/",
  });
}

export default async function ShopPage() {
  const slides = await getHeroSliderData();
  const [maleProducts, femaleProducts, bestSellersResult, blogPostsResult] =
    await Promise.all([
      fetchProductsByCategories("boot-nam", 12),
      fetchProductsByCategories("boot-nu", 12),
      fetchProducts({ isBestSeller: true, limit: 12 }).catch(() => ({
        data: [],
        pagination: null,
      })),
      fetchBlogPosts({ limit: 9, sort: "newest" }).catch(() => ({ data: [] })),
    ]);

  const bestSellers = bestSellersResult?.data || [];
  const newsItems = (blogPostsResult?.data || [])
    .map(mapBlogPostToNewsItem)
    .sort((a, b) => b.publishedAtMs - a.publishedAtMs)
    .slice(0, 9);

  return (
    <>
      <JsonLd data={buildWebsiteJsonLd()} />
      {/* Above-fold: rendered synchronously for fast LCP */}
      <HomeHeader />
      <HomeHeroBanner initialSlides={slides} />
      <div className="home-page-sections">
        <CategorySection initialProducts={bestSellers} />
        {/* Below-fold: lazy-loaded with Suspense boundaries */}
        <Suspense fallback={<SectionSkeleton />}>
          <LazyBootMaleSection initialProducts={maleProducts} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <LazyBootFemaleSection initialProducts={femaleProducts} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <LazyGuideSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <LazyNewsSection initialNewsItems={newsItems} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <LazyFAQSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <LazyPreFooter />
        </Suspense>
      </div>
      <Footer />
      <HomeCartToast />
    </>
  );
}
