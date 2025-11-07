import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import React, { useEffect } from "react";

// The AuthProvider handles initialization and state sync with Supabase.
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
   const { initialize, setUser, setSession, fetchRoles, setRoles } =
      useAuthStore();

   useEffect(() => {
      const handleInitialization = async () => {
         try {
            await initialize();
         } catch (e) {
            console.warn("Auth initialization failed:", e);
         }
      };

      void handleInitialization();

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

               // Optional: if you have a backend API to upsert profile rows, call it here.
               // On mobile there is no relative /api route; use a full API_URL env var if needed.
            } else {
               setRoles(new Set());
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
