import { Tabs, useRouter } from "expo-router";
import { Home, Grid3x3, ShoppingCart, Package, User } from "lucide-react-native";
import React from "react";
import Colors from "@/constants/colors";
import Fonts from "@/constants/fonts";
import { useApp } from "@/contexts/AppContext";
import NotificationBell from "@/components/NotificationBell";
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { mode, isLoading } = useApp();
  const { t } = useTranslation();
  const router = useRouter();

  if (isLoading) {
    return null;
  }

  if (mode === 'rider') {
    router.replace('/rider' as any);
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontFamily: Fonts.bold,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.medium,
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: t('tabs.categories'),
          headerRight: () => <NotificationBell />,
          tabBarIcon: ({ color, size }) => <Grid3x3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('tabs.cart'),
          headerRight: () => <NotificationBell />,
          tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t('tabs.orders'),
          headerRight: () => <NotificationBell />,
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          headerRight: () => <NotificationBell />,
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}