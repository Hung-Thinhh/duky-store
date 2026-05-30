import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchProducts } from "@/lib/api";
import {
  COLLECTION_SLUGS,
  getCollectionSeo,
  type CollectionSeo,
} from "@/lib/collection-seo";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbJsonLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Product } from "@/types/product";
import CollectionClient from "./CollectionClient";

export const revalidate = 60;

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

interface CategoryItem {
  id: string;
  slug: string;
  parentId: string | null;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export function generateStaticParams() {
  return COLLECTION_SLUGS.map((slug) => ({ slug }));
}

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

async function fetchCollectionProducts(slug: string): Promise<Product[]> {
  const categories = await fetchCategories();
  const parentCat = categories.find((category) => category.slug === slug);
  const slugsToFetch = new Set<string>([slug]);

  if (parentCat) {
    for (const child of categories.filter(
      (category) => category.parentId === parentCat.id,
    )) {
      slugsToFetch.add(child.slug);
    }
  }

  const slugs = Array.from(slugsToFetch);
  const results = await Promise.all(
    slugs.map((categorySlug) =>
      fetchProducts({ categorySlug, limit: 100, page: 1, sort: "newest" })
        .then((res) =>
          res.data.map((product) => ({
            ...product,
            categorySlugs: [categorySlug],
          })),
        )
        .catch(() => [] as Array<Product & { categorySlugs?: string[] }>),
    ),
  );

  const productMap = new Map<string, Product & { categorySlugs?: string[] }>();

  for (const products of results) {
    for (const product of products) {
      const existing = productMap.get(product.id);
      if (!existing) {
        productMap.set(product.id, product);
        continue;
      }

      for (const categorySlug of product.categorySlugs || []) {
        if (!existing.categorySlugs?.includes(categorySlug)) {
          existing.categorySlugs = [...(existing.categorySlugs || []), categorySlug];
        }
      }
    }
  }

  return Array.from(productMap.values());
}

function buildCollectionJsonLd(meta: CollectionSeo) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: meta.title,
    description: meta.metaDescription,
    url: `/collections/${meta.slug}`,
    primaryImageOfPage: meta.heroImage,
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
        url: `/san-pham/${product.slug}`,
      })),
  };
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = getCollectionSeo(slug);

  if (!meta) {
    return {
      ...buildMetadata({
        title: "Bo suu tap",
        description: "Kham pha bo suu tap san pham tai Duky Store",
        path: `/collections/${slug}`,
      }),
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildMetadata({
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
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Trang chu", url: "/" },
    { name: meta.title, url: `/collections/${slug}` },
  ]);

  return (
    <>
      <JsonLd data={buildCollectionJsonLd(meta)} />
      <JsonLd data={breadcrumbJsonLd} />
      {itemListJsonLd ? <JsonLd data={itemListJsonLd} /> : null}

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
          className="h-auto w-full"
          priority
        />
        <div className="absolute inset-0 flex items-center">
          <div className="space-y-3 px-12 md:px-16 lg:px-[100px]">
            <span className="inline-block text-xs font-medium uppercase tracking-widest text-gray-500">
              {meta.kicker}
            </span>
            <h1 className="whitespace-pre-line text-[36px] font-semibold leading-[1.1] tracking-normal text-gray-900 md:text-[52px] lg:text-[64px]">
              {meta.heroTitle}
            </h1>
            <div className="flex max-w-sm items-start gap-3">
              <div className="mt-2.5 h-px w-8 shrink-0 bg-gray-900" />
              <p className="text-sm font-light leading-relaxed text-gray-500">
                {meta.heroDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      <CollectionClient
        initialProducts={products}
        slug={slug}
        collectionTitle={meta.title}
      />
    </>
  );
}
