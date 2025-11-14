import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import React, { useEffect } from "react";

// The AuthProvider handles initialization and state sync with Supabase.
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
   const { initialize, setUser, setSession, fetchRoles, setRoles, hasRole } =
      useAuthStore();
   const { switchMode } = useApp();

   useEffect(() => {
      const handleInitialization = async () => {
         try {
            await initialize();
         } catch (e) {
            console.warn("Auth initialization failed:", e);
         }
      };

      void handleInitialization();

      // After initialization, sync app mode with the user's roles (if any).
      // If the authenticated user has the `rider` role, put the app into
      // rider mode so the rider layout is used automatically.
      (async () => {
         try {
            const stateHasRider = hasRole && hasRole("rider");
            if (stateHasRider) switchMode("rider");
         } catch (e) {
            // noop
         }
      })();

      const { data } = supabase.auth.onAuthStateChange(
         async (event, session) => {
            setSession(session as any);
            setUser((session as any)?.user ?? null);

            if ((session as any)?.user) {
               try {
                  await fetchRoles((session as any).user.id);
               } catch (e) {
                  console.warn("Role fetch failed:", e);
               }

               // Sync app mode to rider if the fetched roles include rider.
               try {
                  const isRider = hasRole && hasRole("rider");
                  if (isRider) {
                     switchMode("rider");
                  } else {
                     switchMode("user");
                  }
               } catch (e) {
                  // ignore
               }

               // Optional: if you have a backend API to upsert profile rows, call it here.
               // On mobile there is no relative /api route; use a full API_URL env var if needed.
            } else {
               setRoles(new Set());
               // Ensure mode returns to user when signed out
               try {
                  switchMode("user");
               } catch (e) {}
            }
         }
      );

      return () => {
         try {
            data.subscription?.unsubscribe();
         } catch (e) {
            console.warn("Subscription cleanup error:", e);
         }
      };
   }, [initialize, setUser, setSession, fetchRoles, setRoles]);

   return <>{children}</>;
};
