import { useQuery } from "@tanstack/react-query";
import { fetchSubcategories, SubcategoryQueryOptions } from "@/integrations/supabase/subcategories";

export function useSubcategories(options: SubcategoryQueryOptions = {}) {
  return useQuery({
    queryKey: ["subcategories", options],
    queryFn: () => fetchSubcategories(options),
    enabled: !!options.category_id, // Only fetch when category_id is provided
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}