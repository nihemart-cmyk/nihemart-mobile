import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as ExpoSplashScreen from 'expo-splash-screen';
import React, { useEffect, useState, useCallback } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "@/contexts/AppContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Colors from "@/constants/colors";
import CustomSplashScreen from "@/components/SplashScreen";
import InAppNotificationBanner from "@/components/InAppNotificationBanner";
import { useFonts } from 'expo-font';

ExpoSplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="rider" options={{ headerShown: false }} />
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
    'Poppins-Regular': 'https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJfecg.ttf',
    'Poppins-Medium': 'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLGT9Z1xlFQ.ttf',
    'Poppins-SemiBold': 'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLEj6Z1xlFQ.ttf',
    'Poppins-Bold': 'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLCz7Z1xlFQ.ttf',
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
    return <CustomSplashScreen onAnimationComplete={handleAnimationComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppProvider>
          <NotificationProvider>
            <RootLayoutNav />
            <InAppNotificationBanner />
          </NotificationProvider>
        </AppProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}