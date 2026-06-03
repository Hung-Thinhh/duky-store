import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { fetchProductBySlug, fetchProductVariants } from "@/lib/api";
import { absoluteUrl, SITE_NAME, truncateMeta } from "@/lib/seo";
import {
  getAllProductImageUrls,
  getDisplayPrice,
  getProductImageUrl,
  type Product,
} from "@/types/product";
import ProductDetailPageClient from "./ProductDetailPageClient";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

const getProductBySlug = cache(fetchProductBySlug);

function productDescription(product: Product) {
  return (
    truncateMeta(
      product.seo?.metaDescription ||
        product.metaDescription ||
        product.desc ||
        `${product.name} tai Duky Store.`,
    ) || `${product.name} tai Duky Store.`
  );
}

function productTitle(product: Product) {
  return (
    truncateMeta(
      product.seo?.metaTitle || product.metaTitle || `${product.name} - ${SITE_NAME}`,
      70,
    ) || product.name
  );
}

function productCanonical(product: Product, slug: string) {
  return absoluteUrl(`/san-pham/${product.slug || slug}`);
}

function shouldNoIndex(product: Product) {
  const status = product.status?.toUpperCase();
  const visibility = product.catalogVisibility?.toUpperCase();

  return Boolean(
    product.seo?.noIndex ||
      (status && status !== "PUBLISHED" && status !== "ACTIVE") ||
      visibility === "HIDDEN",
  );
}

function JsonLdScript({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

function buildProductJsonLd(product: Product, slug: string) {
  const canonical = productCanonical(product, slug);
  const images = getAllProductImageUrls(product).map((image) => absoluteUrl(image));
  const price = getDisplayPrice(product);
  const schemaFromDb =
    product.seo?.schemaJson && Object.keys(product.seo.schemaJson).length
      ? product.seo.schemaJson
      : {};

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images.length ? images : undefined,
    description: productDescription(product),
    sku: product.sku || undefined,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: price
      ? {
          "@type": "Offer",
          url: canonical,
          price,
          priceCurrency: "VND",
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
        }
      : undefined,
    url: canonical,
    ...schemaFromDb,
  };
}

function buildBreadcrumbJsonLd(product: Product, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "San pham",
        item: absoluteUrl("/san-pham"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: productCanonical(product, slug),
      },
    ],
  };
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await getProductBySlug(slug);
    const title = productTitle(product);
    const description = productDescription(product);
    const canonical = productCanonical(product, slug);
    const image = absoluteUrl(getProductImageUrl(product));

    return {
      title,
      description,
      alternates: {
        canonical,
      },
      robots: {
        index: !shouldNoIndex(product),
        follow: !product.seo?.noFollow,
      },
      openGraph: {
        title: product.seo?.ogTitle || title,
        description: product.seo?.ogDescription || description,
        url: canonical,
        siteName: SITE_NAME,
        type: "website",
        images: [
          {
            url: image,
            alt: product.thumbnailMedia?.altText || product.name,
          },
        ],
        locale: "vi_VN",
      },
      twitter: {
        card: "summary_large_image",
        title: product.seo?.ogTitle || title,
        description: product.seo?.ogDescription || description,
        images: [image],
      },
    };
  } catch {
    return {
      title: "San pham khong ton tai",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  let product: Product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }

  const variantsResult = await fetchProductVariants(slug).catch(() => ({ data: [] }));

  return (
    <>
      <JsonLdScript
        data={[buildProductJsonLd(product, slug), buildBreadcrumbJsonLd(product, slug)]}
      />
      <ProductDetailPageClient
        slug={slug}
        initialProduct={product}
        initialVariants={variantsResult.data}
      />
    </>
  );
}
