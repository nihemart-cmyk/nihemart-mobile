import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/integrations/supabase/products";

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
}