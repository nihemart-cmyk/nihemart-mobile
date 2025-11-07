import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import { useQuery } from "@tanstack/react-query";

export interface ProfileRow {
   id: string;
   full_name?: string | null;
   phone?: string | null;
   created_at?: string | null;
   // add other profile fields as needed
}

export function useProfile() {
   const user = useAuthStore((s) => s.user);

   const query = useQuery<ProfileRow | null, Error>({
      queryKey: ["profile", user?.id],
      queryFn: async () => {
         if (!user) return null;
         const { data, error } = await supabase
            .from("profiles")
            .select("id, full_name, phone, created_at")
            .eq("id", user.id)
            .maybeSingle();

         if (error) throw error;
         return data as ProfileRow | null;
      },
      enabled: !!user,
      staleTime: 1000 * 60 * 2, // 2 minutes
   });

   return {
      profile: query.data ?? null,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      error: query.error ?? null,
      refetch: query.refetch,
   };
}

export default useProfile;
