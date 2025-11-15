import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "expo-router";
import { useEffect } from "react";

// Hook to guard screens that require authentication.
// - If loading: returns null (UI should show spinner)
// - If not loading and no user: redirects to signin
// - If user exists: allows screen to render
//
// This matches the web behavior and ensures:
// 1. No forced re-login on each render
// 2. Session persists across screens
// 3. Tokens are automatically refreshed by Supabase client
export default function useRequireAuth(redirectTo = "/signin") {
   const user = useAuthStore((s) => s.user);
   const loading = useAuthStore((s) => s.loading);
   const router = useRouter();

   useEffect(() => {
      // Still loading session from storage, don't redirect yet
      if (loading) {
         console.log("[useRequireAuth] Auth still loading, waiting...");
         return;
      }

      // Loading complete and no user - redirect to signin
      if (!user) {
         console.log(
            "[useRequireAuth] No user found, redirecting to",
            redirectTo
         );
         // Replace (not push) so user can't go back to protected page
         router.replace(redirectTo as any);
      } else {
         console.log("[useRequireAuth] User authenticated:", user.email);
      }
   }, [user, loading, router, redirectTo]);

   return { user, loading };
}
