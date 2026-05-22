import { describe, it, expect } from "vitest";
import {
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
  buildWebsiteJsonLd,
  buildArticleJsonLd,
  ArticleJsonLdInput,
} from "./structured-data";
import { Product } from "@/types/product";

describe("buildProductJsonLd", () => {
  const baseProduct: Product = {
    id: "prod-1",
    name: "Boot Nam Classic",
    slug: "boot-nam-classic",
    sku: "BNC-001",
    originalPrice: 500000,
    salePrice: null,
    desc: "A classic boot for men",
    thumbnailMedia: {
      id: "media-1",
      url: "https://example.com/img.jpg",
      secureUrl: "https://example.com/img-secure.jpg",
      fileName: "img.jpg",
      altText: null,
      title: null,
      width: 800,
      height: 800,
    },
  };

  it("produces a valid Product schema with required fields", () => {
    const result = buildProductJsonLd(baseProduct);

    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("Product");
    expect(result.name).toBe("Boot Nam Classic");
    expect(result.description).toBe("A classic boot for men");
    expect(result.image).toContain("https://example.com/img-secure.jpg");
    expect(result.sku).toBe("BNC-001");
    expect(result.brand).toEqual({ "@type": "Brand", name: "Duky Store" });
  });

  it("includes single offer when no sale price", () => {
    const result = buildProductJsonLd(baseProduct);

    expect(result.offers).toEqual({
      "@type": "Offer",
      price: 500000,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      url: "https://dukystore.vn/products/boot-nam-classic",
    });
  });

  it("includes both prices when salePrice < originalPrice", () => {
    const saleProduct: Product = {
      ...baseProduct,
      salePrice: 350000,
    };
    const result = buildProductJsonLd(saleProduct);

    expect(result.offers).toHaveProperty("@type", "AggregateOffer");
    const offers = (result.offers as { offers: object[] }).offers;
    expect(offers).toHaveLength(2);
    expect(offers[0]).toMatchObject({ price: 350000, priceCurrency: "VND" });
    expect(offers[1]).toMatchObject({ price: 500000, priceCurrency: "VND" });
  });

  it("uses single offer when salePrice >= originalPrice", () => {
    const noDiscountProduct: Product = {
      ...baseProduct,
      salePrice: 600000,
    };
    const result = buildProductJsonLd(noDiscountProduct);

    expect(result.offers).toHaveProperty("@type", "Offer");
    expect((result.offers as { price: number }).price).toBe(500000);
  });

  it("omits sku field when product has no sku", () => {
    const noSkuProduct: Product = { ...baseProduct, sku: undefined };
    const result = buildProductJsonLd(noSkuProduct);

    expect(result).not.toHaveProperty("sku");
  });

  it("uses product name as description when desc is missing", () => {
    const noDescProduct: Product = { ...baseProduct, desc: undefined };
    const result = buildProductJsonLd(noDescProduct);

    expect(result.description).toBe("Boot Nam Classic");
  });
});

describe("buildBreadcrumbJsonLd", () => {
  it("produces a valid BreadcrumbList with sequential positions", () => {
    const items = [
      { name: "Trang chủ", url: "/" },
      { name: "Boot Nam", url: "/collections/boot-nam" },
      { name: "Boot Classic", url: "/products/boot-classic" },
    ];
    const result = buildBreadcrumbJsonLd(items);

    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("BreadcrumbList");
    expect(result.itemListElement).toHaveLength(3);
    expect(result.itemListElement[0].position).toBe(1);
    expect(result.itemListElement[1].position).toBe(2);
    expect(result.itemListElement[2].position).toBe(3);
    expect(result.itemListElement[0].name).toBe("Trang chủ");
  });

  it("prepends SITE_URL to relative URLs", () => {
    const items = [{ name: "Home", url: "/" }];
    const result = buildBreadcrumbJsonLd(items);

    expect(result.itemListElement[0].item).toBe("https://dukystore.vn/");
  });

  it("preserves absolute URLs", () => {
    const items = [{ name: "External", url: "https://other.com/page" }];
    const result = buildBreadcrumbJsonLd(items);

    expect(result.itemListElement[0].item).toBe("https://other.com/page");
  });
});

describe("buildWebsiteJsonLd", () => {
  it("produces a valid WebSite schema with SearchAction", () => {
    const result = buildWebsiteJsonLd();

    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("WebSite");
    expect(result.name).toBe("Duky Store");
    expect(result.url).toBe("https://dukystore.vn");
    expect(result.potentialAction["@type"]).toBe("SearchAction");
    expect(result.potentialAction.target.urlTemplate).toBe(
      "https://dukystore.vn/products?search={search_term_string}"
    );
    expect(result.potentialAction["query-input"]).toBe(
      "required name=search_term_string"
    );
  });
});

describe("buildArticleJsonLd", () => {
  const basePost: ArticleJsonLdInput = {
    title: "Cách phối đồ với boot nam",
    slug: "cach-phoi-do-voi-boot-nam",
    excerpt: "Hướng dẫn phối đồ với boot nam đẹp nhất",
    content: "<p>Nội dung bài viết...</p>",
    publishedAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T12:00:00Z",
    coverMedia: {
      url: "https://example.com/cover.jpg",
      secureUrl: "https://example.com/cover-secure.jpg",
    },
  };

  it("produces a valid BlogPosting schema", () => {
    const result = buildArticleJsonLd(basePost);

    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("BlogPosting");
    expect(result.headline).toBe("Cách phối đồ với boot nam");
    expect(result.datePublished).toBe("2024-01-15T10:00:00Z");
    expect(result.dateModified).toBe("2024-01-20T12:00:00Z");
    expect(result.url).toBe(
      "https://dukystore.vn/blog/cach-phoi-do-voi-boot-nam"
    );
  });

  it("uses secureUrl for image when available", () => {
    const result = buildArticleJsonLd(basePost);

    expect(result.image).toBe("https://example.com/cover-secure.jpg");
  });

  it("falls back to updatedAt when publishedAt is null", () => {
    const unpublished: ArticleJsonLdInput = {
      ...basePost,
      publishedAt: null,
    };
    const result = buildArticleJsonLd(unpublished);

    expect(result.datePublished).toBe("2024-01-20T12:00:00Z");
  });

  it("omits image when coverMedia is null", () => {
    const noImage: ArticleJsonLdInput = { ...basePost, coverMedia: null };
    const result = buildArticleJsonLd(noImage);

    expect(result).not.toHaveProperty("image");
  });

  it("uses title as description when excerpt is null", () => {
    const noExcerpt: ArticleJsonLdInput = { ...basePost, excerpt: null };
    const result = buildArticleJsonLd(noExcerpt);

    expect(result.description).toBe("Cách phối đồ với boot nam");
  });
});
