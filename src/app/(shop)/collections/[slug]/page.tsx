import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProducts } from "@/lib/api";
import {
  COLLECTION_SLUGS,
  getCollectionSeo,
  type CollectionSeo,
} from "@/lib/collection-seo";
import { absoluteUrl, buildPageMetadata, SITE_NAME } from "@/lib/seo";
import type { Product } from "@/types/product";
import CollectionPageClient from "./CollectionPageClient";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

function JsonLdScript({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

function buildCollectionJsonLd(meta: CollectionSeo) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: meta.title,
    description: meta.metaDescription,
    url: absoluteUrl(`/collections/${meta.slug}`),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl(meta.heroImage),
    },
  };
}

function buildBreadcrumbJsonLd(meta: CollectionSeo) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chu",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: meta.title,
        item: absoluteUrl(`/collections/${meta.slug}`),
      },
    ],
  };
}

function buildItemListJsonLd(meta: CollectionSeo, products: Product[]) {
  if (products.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: meta.title,
    itemListElement: products
      .filter((product) => product.slug)
      .slice(0, 8)
      .map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.name,
        url: absoluteUrl(`/san-pham/${product.slug}`),
      })),
  };
}

async function fetchCollectionProducts(slug: string) {
  const result = await fetchProducts({
    categorySlug: slug,
    limit: 8,
    page: 1,
    sort: "newest",
  }).catch(() => ({ data: [] as Product[] }));

  return result.data;
}

export function generateStaticParams() {
  return COLLECTION_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = getCollectionSeo(slug);

  if (!meta) {
    return {
      title: "Danh muc khong ton tai",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildPageMetadata({
    title: meta.metaTitle,
    description: meta.metaDescription,
    path: `/collections/${slug}`,
    image: meta.heroImage,
  });
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const meta = getCollectionSeo(slug);

  if (!meta) {
    notFound();
  }

  const products = await fetchCollectionProducts(slug);
  const itemListJsonLd = buildItemListJsonLd(meta, products);
  const jsonLd = [
    buildCollectionJsonLd(meta),
    buildBreadcrumbJsonLd(meta),
    ...(itemListJsonLd ? [itemListJsonLd] : []),
  ];

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <CollectionPageClient slug={slug} meta={meta} />
    </>
  );
}
