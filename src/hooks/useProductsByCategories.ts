"use client";

import { useState, useEffect, useRef } from "react";
import { Product } from "@/types/product";
import { fetchProducts } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface CategoryItem {
  id: string;
  slug: string;
  parentId: string | null;
}

// Module-level cache for categories (shared across all hook instances)
let categoriesCache: CategoryItem[] | null = null;
let categoriesFetchPromise: Promise<CategoryItem[]> | null = null;

async function getCategoriesCached(): Promise<CategoryItem[]> {
  if (categoriesCache) return categoriesCache;

  if (!categoriesFetchPromise) {
    categoriesFetchPromise = fetch(`${API_URL}/categories`)
      .then((res) => res.json())
      .then((json) => {
        const cats: CategoryItem[] = json?.DT?.data || [];
        categoriesCache = cats;
        return cats;
      })
      .catch(() => {
        categoriesFetchPromise = null;
        return [];
      });
  }

  return categoriesFetchPromise;
}

/**
 * Fetches products from a parent category by automatically resolving its children.
 * Uses a module-level cache for categories to avoid repeated API calls.
 */
export function useProductsByCategories(
  parentSlug: string | string[],
  limit: number = 12
): { products: Product[]; loading: boolean } {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const slugs = Array.isArray(parentSlug) ? parentSlug : [parentSlug];
  const slugsKey = slugs.join(",");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slugsKey) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const categories = await getCategoriesCached();

        // Resolve all slugs + their children
        const allSlugsToFetch = new Set<string>();
        for (const slug of slugs) {
          allSlugsToFetch.add(slug);
          const parentCat = categories.find((c) => c.slug === slug);
          if (parentCat) {
            for (const child of categories.filter((c) => c.parentId === parentCat.id)) {
              allSlugsToFetch.add(child.slug);
            }
          }
        }

        // Fetch products from all slugs in parallel
        const results = await Promise.all(
          Array.from(allSlugsToFetch).map((slug) =>
            fetchProducts({ categorySlug: slug, limit, sort: "newest" }).catch(() => ({ data: [], pagination: null }))
          )
        );

        if (!cancelled) {
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
          setProducts(merged.slice(0, limit));
        }
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [slugsKey, limit]);

  return { products, loading };
}
