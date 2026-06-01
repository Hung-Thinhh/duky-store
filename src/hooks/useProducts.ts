import { useState, useEffect, useRef } from "react";
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
  initialData?: Product[];
};

export function useProducts(
  params?: ProductListParams,
  options?: UseProductsOptions,
): UseProductsResult {
  const initialData = options?.initialData;
  const [products, setProducts] = useState<Product[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData || initialData.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseProductsResult["pagination"]>(null);
  const enabled = options?.enabled ?? true;

  const hasLoadedInitial = useRef(Boolean(initialData && initialData.length > 0));

  useEffect(() => {
    if (hasLoadedInitial.current) {
      hasLoadedInitial.current = false;
      return;
    }

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
