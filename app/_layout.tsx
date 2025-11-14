import InAppNotificationBanner from "@/components/InAppNotificationBanner";
import CustomSplashScreen from "@/components/SplashScreen";
import Colors from "@/constants/colors";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";
import "@/locales/i18n";
import { useAuthStore } from "@/store/auth.store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import "../globals.css";

ExpoSplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
   const router = useRouter();
   const segments = useSegments();
   const [hasCheckedLanguage, setHasCheckedLanguage] = useState(false);
   const authLoading = useAuthStore((s) => s.loading);

   useEffect(() => {
      const checkLanguageSelection = async () => {
         try {
            const hasSelectedLanguage = await AsyncStorage.getItem(
               "hasSelectedLanguage"
            );

            if (!hasSelectedLanguage && segments[0] !== "language-select") {
               router.replace("/language-select");
            }
         } catch (error) {
            console.log("Error checking language selection:", error);
         } finally {
            setHasCheckedLanguage(true);
         }
      };

      checkLanguageSelection();
   }, []);

   // Wait for both language check and auth initialization. If auth is still
   // loading we may not yet know the user's roles, which determine whether
   // they should be routed into the rider flow. Returning null prevents a
   // premature redirect.
   if (!hasCheckedLanguage || authLoading) {
      return null;
   }

   return (
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
         <Stack.Screen
            name="language-select"
            options={{ headerShown: false }}
         />
         <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
         />
         <Stack.Screen
            name="rider"
            options={{ headerShown: false }}
         />
         <Stack.Screen
            name="notifications"
            options={{
               presentation: "modal",
               headerShown: true,
            }}
         />
         <Stack.Screen
            name="product/[id]"
            options={{
               presentation: "modal",
               headerShown: true,
               title: "Product Details",
               headerStyle: { backgroundColor: Colors.primary },
               headerTintColor: Colors.white,
            }}
         />
         <Stack.Screen
            name="category/[id]"
            options={{
               headerShown: true,
               headerStyle: { backgroundColor: Colors.primary },
               headerTintColor: Colors.white,
            }}
         />
         <Stack.Screen
            name="products"
            options={{
               headerShown: true,
               title: "All Products",
               headerStyle: { backgroundColor: Colors.primary },
               headerTintColor: Colors.white,
            }}
         />
      </Stack>
   );
}

export default function RootLayout() {
   const [showCustomSplash, setShowCustomSplash] = useState(true);
   const [appIsReady, setAppIsReady] = useState(false);

   const [fontsLoaded] = useFonts({
      "Poppins-Regular":
         "https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJfecg.ttf",
      "Poppins-Medium":
         "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLGT9Z1xlFQ.ttf",
      "Poppins-SemiBold":
         "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLEj6Z1xlFQ.ttf",
      "Poppins-Bold":
         "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLCz7Z1xlFQ.ttf",
   });

   useEffect(() => {
      async function prepare() {
         try {
            if (fontsLoaded) {
               await ExpoSplashScreen.hideAsync();
               setAppIsReady(true);
            }
         } catch (e) {
            console.warn(e);
         }
      }

      prepare();
   }, [fontsLoaded]);

   const handleAnimationComplete = useCallback(() => {
      setShowCustomSplash(false);
   }, []);

   if (!appIsReady || !fontsLoaded) {
      return null;
   }

   if (showCustomSplash) {
      return (
         <CustomSplashScreen onAnimationComplete={handleAnimationComplete} />
      );
   }

   return (
      <QueryClientProvider client={queryClient}>
         <GestureHandlerRootView style={{ flex: 1 }}>
            <AppProvider>
               <AuthProvider>
                  <NotificationProvider>
                     <RootLayoutNav />
                     <InAppNotificationBanner />
                     <Toast />
                  </NotificationProvider>
               </AuthProvider>
            </AppProvider>
         </GestureHandlerRootView>
      </QueryClientProvider>
   );
}
