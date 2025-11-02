import { Tabs, Redirect } from "expo-router";
import { Home, Grid3x3, ShoppingCart, Package, User } from "lucide-react-native";
import React from "react";
import Colors from "@/constants/colors";
import Fonts from "@/constants/fonts";
import { useApp } from "@/contexts/AppContext";
import NotificationBell from "@/components/NotificationBell";

export default function TabLayout() {
  const { mode, isLoading } = useApp();

  if (isLoading) {
    return null;
  }

  if (mode === 'rider') {
    return <Redirect href="/rider" />;
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
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          headerRight: () => <NotificationBell />,
          tabBarIcon: ({ color, size }) => <Grid3x3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          headerRight: () => <NotificationBell />,
          tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          headerRight: () => <NotificationBell />,
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerRight: () => <NotificationBell />,
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}