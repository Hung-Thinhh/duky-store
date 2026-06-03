"use client";

import { useState, useEffect, useRef } from "react";
import { Product } from "@/types/product";
import { fetchProducts } from "@/lib/api";

/**
 * Fetches products from a parent category.
 * The backend automatically resolves child categories.
 */
export function useProductsByCategories(
  parentSlug: string | string[],
  limit: number = 12,
  initialData?: Product[]
): { products: Product[]; loading: boolean } {
  const [products, setProducts] = useState<Product[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData || initialData.length === 0);

  const slugs = Array.isArray(parentSlug) ? parentSlug : [parentSlug];
  const slugsKey = slugs.join(",");

  const hasLoadedInitial = useRef(Boolean(initialData && initialData.length > 0));

  useEffect(() => {
    if (hasLoadedInitial.current) {
      hasLoadedInitial.current = false;
      return;
    }

    let cancelled = false;

    async function load() {
      if (!slugsKey) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const result = await fetchProducts({ categorySlug: slugsKey, limit, sort: "newest" });

        if (!cancelled) {
          setProducts(result.data || []);
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


