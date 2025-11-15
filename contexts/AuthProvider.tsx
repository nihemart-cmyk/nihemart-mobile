import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import React, { useEffect } from "react";

// The AuthProvider handles initialization and state sync with Supabase.
// It ensures:
// 1. Session is restored from AsyncStorage on app launch
// 2. Tokens are automatically refreshed when they expire
// 3. User state is consistent across the entire app
// 4. Loading state is cleared promptly to avoid unnecessary re-renders/redirects
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
   const { initialize, setUser, setSession, fetchRoles, setRoles, hasRole } =
      useAuthStore();
   const { switchMode } = useApp();

   useEffect(() => {
      const handleInitialization = async () => {
         try {
            console.log("[AuthProvider] Starting initialization...");
            await initialize();
            const { user } = useAuthStore.getState();
            console.log(
               "[AuthProvider] Initialization complete. User:",
               user?.email ?? "(none)"
            );
         } catch (e) {
            console.warn("[AuthProvider] Auth initialization failed:", e);
         }
      };

      // Run initialization immediately
      void handleInitialization();

      // Set up the auth state change listener to handle:
      // 1. Token refresh events
      // 2. User sign-in/sign-out
      // 3. Role changes
      const { data } = supabase.auth.onAuthStateChange(
         async (event, session) => {
            console.log(
               "[AuthProvider] Auth state changed:",
               event,
               "User:",
               session?.user?.email ?? "(none)"
            );

            // Update session and user state in store
            setSession(session as any);
            setUser((session as any)?.user ?? null);

            if ((session as any)?.user) {
               try {
                  // Fetch user roles
                  await fetchRoles((session as any).user.id);
               } catch (e) {
                  console.warn("[AuthProvider] Role fetch failed:", e);
               }

               // Sync app mode based on roles
               try {
                  const isRider = hasRole && hasRole("rider");
                  if (isRider) {
                     switchMode("rider");
                  } else {
                     switchMode("user");
                  }
               } catch (e) {
                  console.warn("[AuthProvider] Mode switch error:", e);
               }

               // Log token refresh events for debugging
               if (event === "TOKEN_REFRESHED") {
                  console.log("[AuthProvider] Token refreshed successfully");
               }
            } else {
               // User signed out
               setRoles(new Set());
               try {
                  switchMode("user");
               } catch (e) {
                  console.warn(
                     "[AuthProvider] Mode switch on logout error:",
                     e
                  );
               }
            }
         }
      );

      return () => {
         try {
            data.subscription?.unsubscribe();
         } catch (e) {
            console.warn("[AuthProvider] Subscription cleanup error:", e);
         }
      };
   }, [
      initialize,
      setUser,
      setSession,
      fetchRoles,
      setRoles,
      hasRole,
      switchMode,
   ]);

   return <>{children}</>;
};
