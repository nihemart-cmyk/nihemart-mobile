import { Tabs, Redirect } from "expo-router";
import { Package, Clock, History, User } from "lucide-react-native";
import React from "react";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import NotificationBell from "@/components/NotificationBell";
import "../../globals.css"

export default function RiderTabLayout() {
  const { mode, isLoading } = useApp();

  if (isLoading) {
    return null;
  }

  if (mode === 'user') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.textSecondary,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: Colors.secondary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold' as const,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Available",
          headerRight: () => <NotificationBell color={Colors.white} />,
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="active"
        options={{
          title: "Active",
          headerRight: () => <NotificationBell color={Colors.white} />,
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          headerRight: () => <NotificationBell color={Colors.white} />,
          tabBarIcon: ({ color, size }) => <History size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerRight: () => <NotificationBell color={Colors.white} />,
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}