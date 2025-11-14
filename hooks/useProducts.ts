import { useInfiniteQuery, UseInfiniteQueryOptions } from "@tanstack/react-query";
import { fetchProductsPage, ProductQueryOptions } from "@/integrations/supabase/products";

export function useProducts(
  options: Omit<ProductQueryOptions, 'page'> = {},
  queryOptions?: Omit<UseInfiniteQueryOptions, 'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'>
) {
  const limit = options.limit || 10; // Get limit from options, or default to 10

  return useInfiniteQuery({
    ...queryOptions,
    queryKey: ["products", options],
    queryFn: ({ pageParam }: any) =>
      fetchProductsPage({ ...options, page: pageParam, limit: limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, pages) => {
      // Use the same limit variable here for consistency
      const totalPages = Math.ceil(lastPage.pagination.total / limit);
      if (pages.length < totalPages) {
        return pages.length + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}