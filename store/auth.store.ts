import { supabase } from "@/integrations/supabase/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

export type AppRole =
   | "admin"
   | "user"
   | "rider"
   | "manager"
   | "staff"
   | "stock_manager";

type AuthState = {
   user: User | null;
   session: Session | null;
   roles: Set<AppRole>;
   loading: boolean;
   isFetchingRoles?: boolean;
   lastFetchedRolesUserId?: string | null;
   setUser: (user: User | null) => void;
   setSession: (session: Session | null) => void;
   setRoles: (roles: Set<AppRole>) => void;
   setLoading: (loading: boolean) => void;
   setIsFetchingRoles?: (v: boolean) => void;
   setLastFetchedRolesUserId?: (id: string | null) => void;
   fetchRoles: (userId: string) => Promise<void>;
   signIn: (
      email: string,
      password: string
   ) => Promise<{ error: string | null }>;
   signUp: (
      fullName: string,
      email: string,
      password: string,
      phone?: string
   ) => Promise<{ error: string | null }>;
   signOut: () => Promise<void>;
   requestPasswordReset: (email: string) => Promise<{ error: string | null }>;
   hasRole: (role: AppRole) => boolean;
   initialize: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
   user: null,
   session: null,
   roles: new Set(),
   loading: true,
   isFetchingRoles: false,
   lastFetchedRolesUserId: null,
   setUser: (user) => set({ user }),
   setSession: (session) => set({ session }),
   setRoles: (roles) => set({ roles }),
   setLoading: (loading) => set({ loading }),
   setIsFetchingRoles: (v) => set({ isFetchingRoles: v }),
   setLastFetchedRolesUserId: (id) => set({ lastFetchedRolesUserId: id }),
   fetchRoles: async (userId: string) => {
      // Guard: no userId
      if (!userId) {
         set({ roles: new Set(), lastFetchedRolesUserId: null });
         return;
      }

      // If we've already fetched roles for this user and there's an existing set, skip
      const lastId = get().lastFetchedRolesUserId;
      const isFetching = get().isFetchingRoles;
      if (
         lastId === userId &&
         !isFetching &&
         get().roles &&
         get().roles.size > 0
      ) {
         return;
      }

      // Prevent concurrent fetches
      if (isFetching) return;

      set({ isFetchingRoles: true });
      try {
         const { data, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId);

         // If query succeeded and returned roles, use them. If it returned
         // an empty array (no rows) we should still run the riders fallback
         // because some rider users are only represented in the `riders`
         // table and don't have an explicit user_roles row.
         if (!error && Array.isArray(data) && data.length > 0) {
            const r = new Set<AppRole>();
            data.forEach((row: any) => r.add(row.role as AppRole));
            set({ roles: r, lastFetchedRolesUserId: userId });
         } else {
            // No explicit user_roles found or empty result. As a fallback,
            // check if a riders row exists for this user and treat them as
            // a rider if so.
            try {
               const sb: any = supabase as any;
               const { data: riderRow } = await sb
                  .from("riders")
                  .select("id")
                  .eq("user_id", userId)
                  .maybeSingle();
               if (riderRow && (riderRow as any).id) {
                  set({
                     roles: new Set<AppRole>(["rider"]),
                     lastFetchedRolesUserId: userId,
                  });
               } else {
                  set({ roles: new Set(), lastFetchedRolesUserId: userId });
               }
            } catch (err) {
               console.error("Error checking riders fallback:", err);
               set({ roles: new Set(), lastFetchedRolesUserId: userId });
            }
         }
      } catch (error) {
         console.error("Error fetching roles:", error);
         set({ roles: new Set(), lastFetchedRolesUserId: userId });
      } finally {
         set({ isFetchingRoles: false });
      }
   },
   signIn: async (email, password) => {
      try {
         console.log("[AuthStore.signIn] Starting sign-in for", email);
         const { error, data } = await supabase.auth.signInWithPassword({
            email,
            password,
         });

         if (error) {
            console.error("[AuthStore.signIn] Error:", error.message);
            return { error: error.message };
         }

         console.log(
            "[AuthStore.signIn] Success. Setting user:",
            data.user?.email
         );
         if (data.user) {
            // Fetch roles (deduped inside fetchRoles) then update state
            await get().fetchRoles(data.user.id);
            set({ user: data.user, session: data.session });
            console.log("[AuthStore.signIn] User and session set in store", {
               user: get().user?.email ?? "(none)",
            });
         }

         return { error: null };
      } catch (error) {
         console.error("[AuthStore.signIn] Unexpected error:", error);
         return { error: "An unexpected error occurred" };
      }
   },
   signUp: async (fullName, email, password, phone) => {
      try {
         // Sign up user first
         const { error, data } = await supabase.auth.signUp({
            email,
            password,
            options: {
               data: { full_name: fullName, phone },
            },
         });

         if (error) {
            return { error: error.message };
         }

         // Send confirmation email via our Next.js API endpoint
         // This matches the web flow by calling /api/email/send with type=signup
         try {
            const emailRes = await fetch(
               `${process.env.EXPO_PUBLIC_APP_URL || process.env.EXPO_PUBLIC_API_URL || ""}/api/email/send`,
               {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                     email,
                     type: "signup",
                     userId: data?.user?.id,
                  }),
               }
            );

            const emailJson = await emailRes.json().catch(() => null);
            if (!emailRes.ok) {
               console.warn("[AuthStore.signUp] Email send failed:", emailJson);
               // Don't fail signup if email fails, but log it
            }
         } catch (emailErr) {
            console.warn("[AuthStore.signUp] Email send error:", emailErr);
            // Email errors don't block signup; user is still registered
         }

         return { error: null };
      } catch (error) {
         return { error: "An unexpected error occurred" };
      }
   },
   signOut: async () => {
      try {
         await supabase.auth.signOut();
         set({ user: null, session: null, roles: new Set() });
         // Clear any auth-related local storage keys used by supabase-js
         try {
            await AsyncStorage.removeItem("sb-access-token");
         } catch {}
      } catch (error) {
         console.error("Error signing out:", error);
         throw error;
      }
   },
   requestPasswordReset: async (email: string) => {
      try {
         // Call the same email API as web, but with type=recovery
         const emailRes = await fetch(
            `${process.env.EXPO_PUBLIC_APP_URL || process.env.EXPO_PUBLIC_API_URL || ""}/api/email/send`,
            {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                  email,
                  type: "recovery",
               }),
            }
         );

         const emailJson = await emailRes.json().catch(() => null);
         if (!emailRes.ok) {
            console.error(
               "[AuthStore.requestPasswordReset] Email send failed:",
               emailJson
            );
            return {
               error: emailJson?.error || "Failed to send password reset email",
            };
         }

         return { error: null };
      } catch (error: any) {
         console.error("[AuthStore.requestPasswordReset] Error:", error);
         return { error: error?.message || "An unexpected error occurred" };
      }
   },
   hasRole: (role) => get().roles.has(role),
   initialize: async () => {
      try {
         console.log("[AuthStore] initialize() called");

         // Get current session from persisted storage (AsyncStorage on mobile)
         // This is the first check and won't re-fetch if session exists
         const {
            data: { session },
         } = await supabase.auth.getSession();

         console.log(
            "[AuthStore] Got session from supabase.auth.getSession():",
            {
               hasSession: !!session,
               userEmail: session?.user?.email ?? "(none)",
            }
         );

         if (session?.user) {
            console.log(
               "[AuthStore] Session exists, setting user and fetching roles"
            );
            // Set basic session/user immediately to unblock UI
            set({ user: session.user, session, loading: false });

            // Fetch roles in background (doesn't block UI rendering)
            try {
               await get().fetchRoles(session.user.id);
               console.log(
                  "[AuthStore] Roles fetched for user",
                  session.user.id
               );
            } catch (roleErr) {
               console.warn("[AuthStore] Role fetch error:", roleErr);
            }
         } else {
            console.log("[AuthStore] No session found, clearing user");
            set({
               user: null,
               session: null,
               roles: new Set(),
               loading: false,
            });
         }
      } catch (error) {
         console.error("[AuthStore] Error initializing auth:", error);
         // Always clear loading to unblock UI, even on error
         set({ loading: false });
      }
   },
}));
