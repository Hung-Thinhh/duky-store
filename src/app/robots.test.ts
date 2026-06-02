import { describe, it, expect, beforeEach, afterEach } from "vitest";
import robots from "./robots";

describe("robots", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("allows all crawlers to access public pages", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const allCrawlerRule = rules.find((r) => r.userAgent === "*");

    expect(allCrawlerRule).toBeDefined();
    expect(allCrawlerRule!.allow).toBe("/");
  });

  it("disallows crawling of private routes", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const allCrawlerRule = rules.find((r) => r.userAgent === "*");

    expect(allCrawlerRule).toBeDefined();
    expect(allCrawlerRule!.disallow).toEqual([
      "/dang-nhap",
      "/dang-ky",
      "/tai-khoan",
      "/gio-hang",
      "/thanh-toan",
    ]);
  });

  it("includes a reference to the sitemap URL", () => {
    const result = robots();
    expect(result.sitemap).toBe("https://dukystore.com/sitemap.xml");
  });

  it("uses NEXT_PUBLIC_SITE_URL env var for sitemap URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://custom-domain.com";
    const result = robots();
    expect(result.sitemap).toBe("https://custom-domain.com/sitemap.xml");
  });

  it("falls back to https://dukystore.com when env var is not set", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    const result = robots();
    expect(result.sitemap).toBe("https://dukystore.com/sitemap.xml");
  });
});
