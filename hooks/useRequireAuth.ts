import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "expo-router";
import { useEffect } from "react";

// Hook to guard screens that require authentication. If the user is not
// authenticated and auth initialization is complete, it redirects to /signin.
export default function useRequireAuth(redirectTo = "/signin") {
   const user = useAuthStore((s) => s.user);
   const loading = useAuthStore((s) => s.loading);
   const router = useRouter();

   useEffect(() => {
      if (loading) return;
      if (!user) {
         // Replace current route with signin so user can't go back to protected page
         router.replace(redirectTo as any);
      }
   }, [user, loading, router, redirectTo]);

   return { user, loading };
}
