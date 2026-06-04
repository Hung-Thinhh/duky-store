import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildMetadata, type PageMetadataInput } from "./metadata";

describe("buildMetadata", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("generates title following pattern '{title} | Duky Store'", () => {
    const input: PageMetadataInput = {
      title: "Boot Nam",
      description: "Giày boot nam cao cấp",
      path: "/boot-nam",
    };

    const metadata = buildMetadata(input);
    expect(metadata.title).toBe("Boot Nam | Duky Store");
  });

  it("generates Open Graph tags with all required fields", () => {
    const input: PageMetadataInput = {
      title: "Sản phẩm mới",
      description: "Mô tả sản phẩm",
      path: "/san-pham/test-product",
      image: "https://example.com/image.jpg",
      type: "product",
    };

    const metadata = buildMetadata(input);
    const og = metadata.openGraph as Record<string, unknown>;

    expect(og.title).toBe("Sản phẩm mới | Duky Store");
    expect(og.description).toBe("Mô tả sản phẩm");
    expect(og.url).toBe("https://dukystore.com/san-pham/test-product");
    expect(og.type).toBe("website");
    expect(og.images).toEqual([{ url: "https://example.com/image.jpg" }]);
    expect(og.siteName).toBe("Duky Store");
  });

  it("generates Twitter Card tags with all required fields", () => {
    const input: PageMetadataInput = {
      title: "Blog Post",
      description: "A blog post description",
      path: "/blog/test-post",
      image: "https://example.com/blog.jpg",
      type: "article",
    };

    const metadata = buildMetadata(input);
    const twitter = metadata.twitter as Record<string, unknown>;

    expect(twitter.card).toBe("summary_large_image");
    expect(twitter.title).toBe("Blog Post | Duky Store");
    expect(twitter.description).toBe("A blog post description");
    expect(twitter.images).toEqual(["https://example.com/blog.jpg"]);
  });

  it("uses fallback image and summary_large_image for twitter card when no image is provided", () => {
    const input: PageMetadataInput = {
      title: "No Image Page",
      description: "Page without image",
      path: "/about",
    };

    const metadata = buildMetadata(input);
    const twitter = metadata.twitter as Record<string, unknown>;

    expect(twitter.card).toBe("summary_large_image");
    expect(twitter.images).toEqual(["/assets/logo_header.webp"]);
  });

  it("uses NEXT_PUBLIC_SITE_URL env var for canonical URLs", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://custom-domain.com";

    const input: PageMetadataInput = {
      title: "Test",
      description: "Test description",
      path: "/test",
    };

    const metadata = buildMetadata(input);
    const og = metadata.openGraph as Record<string, unknown>;

    expect(metadata.alternates).toEqual({
      canonical: "https://custom-domain.com/test",
    });
    expect(og.url).toBe("https://custom-domain.com/test");
  });

  it("falls back to https://dukystore.com when env var is not set", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    const input: PageMetadataInput = {
      title: "Test",
      description: "Test description",
      path: "/boot-nu",
    };

    const metadata = buildMetadata(input);
    const og = metadata.openGraph as Record<string, unknown>;

    expect(metadata.alternates).toEqual({
      canonical: "https://dukystore.com/boot-nu",
    });
    expect(og.url).toBe("https://dukystore.com/boot-nu");
  });

  it("defaults og:type to 'website' when type is not provided", () => {
    const input: PageMetadataInput = {
      title: "Home",
      description: "Welcome to Duky Store",
      path: "/",
    };

    const metadata = buildMetadata(input);
    const og = metadata.openGraph as Record<string, unknown>;

    expect(og.type).toBe("website");
  });

  it("uses fallback image for og:images when no image is provided", () => {
    const input: PageMetadataInput = {
      title: "No Image",
      description: "No image page",
      path: "/no-image",
    };

    const metadata = buildMetadata(input);
    const og = metadata.openGraph as Record<string, unknown>;

    expect(og.images).toEqual([{ url: "/assets/logo_header.webp" }]);
  });
});
