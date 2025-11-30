import NotificationBell from "@/components/NotificationBell";
import Fonts from "@/constants/fonts";
import { useApp } from "@/contexts/AppContext";
import { Tabs, useRouter } from "expo-router";
import { Heart, Home, Truck, User } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import "../../globals.css";

// Modern NiheMart color palette
const NiheColors = {
  primary: "#FF6B35", // NiheMart Orange
  accent: "#00A6E0", // NiheMart Blue
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

  if (mode === "rider") {
    router.replace("/rider" as any);
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
          height: Platform.OS === "ios" ? 88 : 78,
          paddingBottom: Platform.OS === "ios" ? 12 : 8,
          paddingTop: 8,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: "absolute",
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
          fontSize: 12,
          marginTop: 4,
          textAlign: "center", // Ensuring the label is centered
        },
        tabBarItemStyle: {
          paddingVertical: 0,
          alignItems: "center", // Ensure the icons and text are centered
        },
        tabBarIconStyle: {
          marginBottom: 2, // Adjust for visual balance between icon and text
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Home
              size={focused ? 28 : 24}
              color={focused ? NiheColors.primary : color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <React.Fragment>
              <Home
                size={focused ? 28 : 24}
                color={focused ? NiheColors.primary : NiheColors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
              />
              <span style={{ color: focused ? NiheColors.primary : NiheColors.textSecondary }}>
                {t("tabs.home")}
              </span>
            </React.Fragment>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t("tabs.orders"),
          headerRight: () => <NotificationBell />,
          headerStyle: {
            backgroundColor: NiheColors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: NiheColors.border,
          },
          tabBarIcon: ({ color, focused }) => (
            <Truck
              size={focused ? 28 : 24}
              color={focused ? NiheColors.primary : color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <React.Fragment>
              <Truck
                size={focused ? 28 : 24}
                color={focused ? NiheColors.primary : NiheColors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
              />
              <span style={{ color: focused ? NiheColors.primary : NiheColors.textSecondary }}>
                {t("tabs.orders")}
              </span>
            </React.Fragment>
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: t("tabs.wishlist"),
          headerRight: () => <NotificationBell />,
          headerStyle: {
            backgroundColor: NiheColors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: NiheColors.border,
          },
          tabBarIcon: ({ color, focused }) => (
            <Heart
              size={focused ? 28 : 24}
              color={focused ? NiheColors.accent : color}
              strokeWidth={focused ? 2.5 : 2}
              fill={focused ? NiheColors.accent : "transparent"}
              fillOpacity={focused ? 1 : 0}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <React.Fragment>
              <Heart
                size={focused ? 28 : 24}
                color={focused ? NiheColors.accent : NiheColors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
                fill={focused ? NiheColors.accent : "transparent"}
                fillOpacity={focused ? 1 : 0}
              />
              <span style={{ color: focused ? NiheColors.accent : NiheColors.textSecondary }}>
                {t("tabs.wishlist")}
              </span>
            </React.Fragment>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
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
              size={focused ? 28 : 24}
              color={focused ? NiheColors.primary : color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <React.Fragment>
              <User
                size={focused ? 28 : 24}
                color={focused ? NiheColors.primary : NiheColors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
              />
              <span style={{ color: focused ? NiheColors.primary : NiheColors.textSecondary }}>
                {t("tabs.profile")}
              </span>
            </React.Fragment>
          ),
        }}
      />
    </Tabs>
  );
}