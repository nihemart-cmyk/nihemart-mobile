import { Tabs, useRouter } from "expo-router";
import { Home, Grid3x3, ShoppingCart, Package, User } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import Fonts from "@/constants/fonts";
import { useApp } from "@/contexts/AppContext";
import NotificationBell from "@/components/NotificationBell";
import { useTranslation } from 'react-i18next';
import "../../globals.css"

// Modern NiheMart color palette
const NiheColors = {
  primary: "#00A6E0",      // NiheMart Blue
  accent: "#FF6B35",       // NiheMart Orange
  background: "#FFFFFF",
  surface: "#F8FAFB",
  text: "#1A2332",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  shadow: "rgba(0, 166, 224, 0.15)",
};

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
        tabBarActiveTintColor: NiheColors.primary,
        tabBarInactiveTintColor: NiheColors.textSecondary,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: NiheColors.background,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: NiheColors.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 1,
          shadowRadius: 16,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          paddingTop: 12,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
        },
        headerStyle: {
          backgroundColor: NiheColors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: NiheColors.border,
        },
        headerTintColor: NiheColors.text,
        headerTitleStyle: {
          fontFamily: Fonts.bold,
          fontSize: 20,
          color: NiheColors.text,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.semiBold || Fonts.medium,
          fontSize: 11,
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Home 
              size={focused ? 26 : 24} 
              color={focused ? NiheColors.primary : color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          tabBarLabel: t('tabs.home'),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: t('tabs.categories'),
          headerRight: () => <NotificationBell />,
          headerStyle: {
            backgroundColor: NiheColors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: NiheColors.border,
          },
          tabBarIcon: ({ color, focused }) => (
            <Grid3x3 
              size={focused ? 26 : 24} 
              color={focused ? NiheColors.primary : color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          tabBarLabel: t('tabs.categories'),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('tabs.cart'),
          headerRight: () => <NotificationBell />,
          headerStyle: {
            backgroundColor: NiheColors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: NiheColors.border,
          },
          tabBarIcon: ({ color, focused }) => (
            <ShoppingCart 
              size={focused ? 26 : 24} 
              color={focused ? NiheColors.accent : color}
              strokeWidth={focused ? 2.5 : 2}
              fill={focused ? NiheColors.accent : "transparent"}
              fillOpacity={focused ? 0.1 : 0}
            />
          ),
          tabBarLabel: t('tabs.cart'),
          tabBarBadgeStyle: {
            backgroundColor: NiheColors.accent,
            color: NiheColors.background,
            fontFamily: Fonts.bold,
            fontSize: 10,
          },
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t('tabs.orders'),
          headerRight: () => <NotificationBell />,
          headerStyle: {
            backgroundColor: NiheColors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: NiheColors.border,
          },
          tabBarIcon: ({ color, focused }) => (
            <Package 
              size={focused ? 26 : 24} 
              color={focused ? NiheColors.primary : color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          tabBarLabel: t('tabs.orders'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          headerRight: () => <NotificationBell />,
          headerStyle: {
            backgroundColor: NiheColors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: NiheColors.border,
          },
          tabBarIcon: ({ color, focused }) => (
            <User 
              size={focused ? 26 : 24} 
              color={focused ? NiheColors.primary : color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          tabBarLabel: t('tabs.profile'),
        }}
      />
    </Tabs>
  );
}