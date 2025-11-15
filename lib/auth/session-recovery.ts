/**
 * Session Recovery Utility
 *
 * This module ensures consistent and reliable session persistence across app restarts
 * and automatic token refresh without forcing users to re-login.
 *
 * Key behaviors:
 * 1. On app launch: Supabase client restores session from AsyncStorage
 * 2. On screen navigation: Session remains in memory (no reload needed)
 * 3. On token expiry: Supabase auto-refreshes with persisted refresh token
 * 4. On app backgrounding: Session is preserved in AsyncStorage
 * 5. Loading state clears immediately after first session check (not after roles fetch)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

const SESSION_KEY = "sb-auth-session";
const REFRESH_TOKEN_KEY = "sb-refresh-token";

/**
 * Recover session from persisted storage on app launch.
 * This is called by Supabase client automatically, but can be used for debugging.
 */
export async function recoverSessionFromStorage(): Promise<Session | null> {
   try {
      const sessionJson = await AsyncStorage.getItem(SESSION_KEY);
      if (sessionJson) {
         const session = JSON.parse(sessionJson);
         console.log("[SessionRecovery] Session recovered from storage:", {
            hasSession: !!session,
            userEmail: session?.user?.email,
            expiresAt: session?.expires_at,
         });
         return session;
      }
   } catch (error) {
      console.warn("[SessionRecovery] Failed to recover session:", error);
   }
   return null;
}

/**
 * Check if refresh token needs refreshing based on current session.
 * Supabase handles this automatically, but can be used for explicit refresh.
 */
export async function ensureValidSession(): Promise<boolean> {
   try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
         console.error("[SessionRecovery] Session check failed:", error);
         return false;
      }

      if (data?.session) {
         console.log("[SessionRecovery] Session is valid:", {
            userEmail: data.session.user.email,
            expiresAt: data.session.expires_at,
         });
         return true;
      }

      console.log("[SessionRecovery] No valid session found");
      return false;
   } catch (error) {
      console.error(
         "[SessionRecovery] Unexpected error checking session:",
         error
      );
      return false;
   }
}

/**
 * Explicitly refresh the access token using the refresh token.
 * Usually not needed since Supabase handles this automatically with autoRefreshToken: true
 */
export async function refreshAccessToken(): Promise<boolean> {
   try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
         console.error("[SessionRecovery] Token refresh failed:", error);
         return false;
      }

      if (data?.session) {
         console.log("[SessionRecovery] Token refreshed successfully");
         return true;
      }

      return false;
   } catch (error) {
      console.error(
         "[SessionRecovery] Unexpected error during refresh:",
         error
      );
      return false;
   }
}

/**
 * Clear all cached session data (for logout or troubleshooting).
 */
export async function clearSessionCache(): Promise<void> {
   try {
      await Promise.all([
         AsyncStorage.removeItem(SESSION_KEY),
         AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
         AsyncStorage.removeItem("sb-auth-token"),
      ]);
      console.log("[SessionRecovery] Session cache cleared");
   } catch (error) {
      console.warn("[SessionRecovery] Error clearing session cache:", error);
   }
}
