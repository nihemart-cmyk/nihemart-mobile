import { useQuery } from "@tanstack/react-query";
import { fetchStoreProductById } from "@/integrations/supabase/products";

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchStoreProductById(id),
    enabled: !!id,
  });
}