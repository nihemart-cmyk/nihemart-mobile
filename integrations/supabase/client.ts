import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Prefer Expo-managed public env variables. Fallback to NEXT_PUBLIC_* or plain names if present.
const SUPABASE_URL =
   process.env.EXPO_PUBLIC_SUPABASE_URL ||
   process.env.EXPO_PUBLIC_SUPABASE_URL ||
   process.env.SUPABASE_URL ||
   process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
   process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
   process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
   process.env.SUPABASE_ANON_KEY ||
   process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
   const message =
      "Missing required Supabase environment variables. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (or EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY) in your .env or app config and restart the dev server.";

   // In Node (server/dev CLI) throw so the developer notices early. In the browser
   // avoid throwing an uncaught error — log instead and allow app to continue so
   // the dev UX isn't blocked by an uncaught exception. The missing envs will
   // still cause Supabase calls to fail until corrected.
   if (typeof window === "undefined") {
      throw new Error(message);
   } else {
      // eslint-disable-next-line no-console
      console.error(message);
   }
}

// Detect React Native environment. We avoid importing react-native-async-storage
// at module-eval time because doing so can crash in Node (Expo CLI / SSR).
const isReactNative =
   typeof navigator !== "undefined" &&
   (navigator as any).product === "ReactNative";

let storage: any = undefined;
let persistSession = false;
let autoRefreshToken = false;

if (isReactNative) {
   // Require AsyncStorage only when running in React Native.
   // Using require avoids evaluating the module during Node startup.
   // eslint-disable-next-line @typescript-eslint/no-var-requires
   const AsyncStorage = require("@react-native-async-storage/async-storage");

   storage = {
      async getItem(key: string) {
         return await AsyncStorage.getItem(key);
      },
      async setItem(key: string, value: string) {
         await AsyncStorage.setItem(key, value);
      },
      async removeItem(key: string) {
         await AsyncStorage.removeItem(key);
      },
   } as any;

   persistSession = true;
   autoRefreshToken = true;
}

export const supabase = createClient<Database>(
   SUPABASE_URL as string,
   SUPABASE_ANON_KEY as string,
   {
      auth: {
         storage,
         persistSession,
         autoRefreshToken,
      },
   }
);
