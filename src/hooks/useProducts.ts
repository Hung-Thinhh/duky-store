"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { fetchProducts, ProductListParams } from "@/lib/api";

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

type UseProductsOptions = {
  enabled?: boolean;
};

export function useProducts(
  params?: ProductListParams,
  options?: UseProductsOptions,
): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseProductsResult["pagination"]>(null);
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!enabled) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetchProducts(params);
        if (!cancelled) {
          setProducts(result.data);
          setPagination(result.pagination);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch products");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    params?.page,
    params?.limit,
    params?.search,
    params?.categorySlug,
    params?.isBestSeller,
    params?.isFeatured,
    params?.isNewArrival,
    params?.minPrice,
    params?.maxPrice,
    params?.sort,
  ]);

  return { products, loading, error, pagination };
}
