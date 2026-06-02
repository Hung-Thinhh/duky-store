import { Product, getAllProductImageUrls } from "@/types/product";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dukystore.com";

// ─── Blog post input type for Article JSON-LD ────────────────────────────────
export interface ArticleJsonLdInput {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  publishedAt: string | null;
  updatedAt: string;
  coverMedia?: { url: string; secureUrl: string | null } | null;
}

// ─── Product JSON-LD (schema.org/Product) ────────────────────────────────────
export function buildProductJsonLd(product: Product) {
  const images = getAllProductImageUrls(product);
  const description = product.desc || product.name;
  const originalPrice = product.originalPrice ?? product.price ?? 0;
  const salePrice = product.salePrice;
  const url = `${SITE_URL}/products/${product.slug || product.id}`;

  // Build offers: include both prices when sale price exists and is less than original
  const offers: object[] = [];

  if (salePrice != null && salePrice < originalPrice) {
    // Sale price offer (current price)
    offers.push({
      "@type": "Offer",
      price: salePrice,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      url,
    });
    // Original price offer (strikethrough price)
    offers.push({
      "@type": "Offer",
      price: originalPrice,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      url,
    });
  } else {
    offers.push({
      "@type": "Offer",
      price: originalPrice,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      url,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description,
    image: images,
    ...(product.sku ? { sku: product.sku } : {}),
    brand: {
      "@type": "Brand",
      name: "Duky Store",
    },
    offers:
      offers.length === 1 ? offers[0] : { "@type": "AggregateOffer", offers },
  };
}

// ─── BreadcrumbList JSON-LD (schema.org/BreadcrumbList) ──────────────────────
export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

// ─── WebSite JSON-LD with SearchAction (schema.org/WebSite) ──────────────────
export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Duky Store",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ─── Article/BlogPosting JSON-LD (schema.org/Article) ────────────────────────
export function buildArticleJsonLd(post: ArticleJsonLdInput) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const image = post.coverMedia?.secureUrl || post.coverMedia?.url || undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.title,
    url,
    ...(image ? { image } : {}),
    datePublished: post.publishedAt || post.updatedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: "Duky Store",
    },
    publisher: {
      "@type": "Organization",
      name: "Duky Store",
      url: SITE_URL,
    },
  };
}

// ─── Store JSON-LD (schema.org/ShoeStore) ────────────────────────────────────
export function buildStoreJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ShoeStore",
    name: "Duky Store",
    description:
      "Duky Store chuyên cung cấp các dòng giày boot nam, boot nữ cao cấp, phụ kiện thời trang và phong cách unisex hiện đại.",
    url: SITE_URL,
    logo: `${SITE_URL}/assets/logo_header.png`,
    image: [
      `${SITE_URL}/assets/outside-store.webp`,
      `${SITE_URL}/assets/space-shop-1.webp`,
      `${SITE_URL}/assets/space-shop.webp`,
    ],
    telephone: "0939.654.574",
    email: "dukystore.info@gmail.com",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "122 Nguyễn Hiền, KDC 91B, P. Tân An",
      addressLocality: "Ninh Kiều",
      addressRegion: "Cần Thơ",
      addressCountry: "VN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 10.023,
      longitude: 105.7558,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "09:00",
      closes: "21:00",
    },
    sameAs: [
      "https://zalo.me/0939654574",
      "https://www.instagram.com/duky.store",
      "https://www.tiktok.com/@duky.store",
      "https://www.facebook.com/Giaybootda.Namnu.CanTho.Dukystore",
    ],
  };
}
