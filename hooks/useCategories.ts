import { useQuery } from "@tanstack/react-query";
import { fetchCategoriesLight, CategoryLight } from "@/integrations/supabase/categories";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategoriesLight,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}