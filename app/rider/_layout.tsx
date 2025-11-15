import NotificationBell from "@/components/NotificationBell";
import Colors from "@/constants/colors";
import Fonts from "@/constants/fonts";
import { useApp } from "@/contexts/AppContext";
import { Redirect, Tabs } from "expo-router";
import { Clock, History, Package, User, PackageCheck } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";
import "../../globals.css";

// Modern NiheMart Rider color palette
const RiderColors = {
  primary: "#FF6B35",      // NiheMart Orange (for riders - energy & urgency)
  secondary: "#00A6E0",    // NiheMart Blue (secondary accent)
  background: "#FFFFFF",
  surface: "#F8FAFB",
  text: "#1A2332",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  shadow: "rgba(255, 107, 53, 0.15)",
  success: "#10B981",
  active: "#F59E0B",
};

export default function RiderTabLayout() {
   const { mode, isLoading } = useApp();

   if (isLoading) {
      return null;
   }

   if (mode === "user") {
      return <Redirect href="/(tabs)" />;
   }

   return (
      <Tabs
         screenOptions={{
            tabBarActiveTintColor: RiderColors.primary,
            tabBarInactiveTintColor: RiderColors.textSecondary,
            headerShown: true,
            tabBarStyle: {
               backgroundColor: RiderColors.background,
               borderTopWidth: 0,
               elevation: 20,
               shadowColor: RiderColors.shadow,
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
               backgroundColor: RiderColors.primary,
               elevation: 4,
               shadowColor: RiderColors.shadow,
               shadowOffset: { width: 0, height: 2 },
               shadowOpacity: 0.25,
               shadowRadius: 8,
            },
            headerTintColor: RiderColors.background,
            headerTitleStyle: {
               fontFamily: Fonts.bold,
               fontSize: 20,
               color: RiderColors.background,
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
               title: "Available",
               headerRight: () => <NotificationBell color={RiderColors.background} />,
               tabBarIcon: ({ color, focused }) => (
                  <Package
                     size={focused ? 26 : 24}
                     color={focused ? RiderColors.primary : color}
                     strokeWidth={focused ? 2.5 : 2}
                  />
               ),
               tabBarLabel: "Available",
            }}
         />
         <Tabs.Screen
            name="orders"
            options={{
               title: "Orders",
               headerRight: () => <NotificationBell color={RiderColors.background} />,
               tabBarIcon: ({ color, focused }) => (
                  <PackageCheck
                     size={focused ? 26 : 24}
                     color={focused ? RiderColors.primary : color}
                     strokeWidth={focused ? 2.5 : 2}
                  />
               ),
               tabBarLabel: "Orders",
               tabBarBadgeStyle: {
                  backgroundColor: RiderColors.secondary,
                  color: RiderColors.background,
                  fontFamily: Fonts.bold,
                  fontSize: 10,
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
               },
            }}
         />
         <Tabs.Screen
            name="active"
            options={{
               title: "Active",
               headerRight: () => <NotificationBell color={RiderColors.background} />,
               headerStyle: {
                  backgroundColor: RiderColors.active,
                  elevation: 4,
                  shadowColor: "rgba(245, 158, 11, 0.2)",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
               },
               tabBarIcon: ({ color, focused }) => (
                  <Clock
                     size={focused ? 26 : 24}
                     color={focused ? RiderColors.active : color}
                     strokeWidth={focused ? 2.5 : 2}
                     fill={focused ? RiderColors.active : "transparent"}
                     fillOpacity={focused ? 0.1 : 0}
                  />
               ),
               tabBarLabel: "Active",
            }}
         />
         <Tabs.Screen
            name="history"
            options={{
               title: "History",
               headerRight: () => <NotificationBell color={RiderColors.background} />,
               headerStyle: {
                  backgroundColor: RiderColors.secondary,
                  elevation: 4,
                  shadowColor: "rgba(0, 166, 224, 0.2)",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
               },
               tabBarIcon: ({ color, focused }) => (
                  <History
                     size={focused ? 26 : 24}
                     color={focused ? RiderColors.primary : color}
                     strokeWidth={focused ? 2.5 : 2}
                  />
               ),
               tabBarLabel: "History",
            }}
         />
         <Tabs.Screen
            name="profile"
            options={{
               title: "Profile",
               headerRight: () => <NotificationBell color={RiderColors.background} />,
               tabBarIcon: ({ color, focused }) => (
                  <User
                     size={focused ? 26 : 24}
                     color={focused ? RiderColors.primary : color}
                     strokeWidth={focused ? 2.5 : 2}
                     fill={focused ? RiderColors.primary : "transparent"}
                     fillOpacity={focused ? 0.1 : 0}
                  />
               ),
               tabBarLabel: "Profile",
            }}
         />
      </Tabs>
   );
}