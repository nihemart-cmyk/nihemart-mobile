import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { useNotifications } from "@/contexts/NotificationContext";
import useRequireAuth from "@/hooks/useRequireAuth";
import { useRiderOrders } from "@/hooks/useRiderOrders";
import { useRiderByUserId } from "@/hooks/useRiders";
import { useAuthStore } from "@/store/auth.store";
import { Stack, useRouter } from "expo-router";
import NotificationsPreview from "@/components/NotificationsPreview";
import {
   Bell,
   ChevronRight,
   DollarSign,
   LogOut,
   Package,
   Settings,
   ShoppingBag,
   Star,
   User,
} from "lucide-react-native";
import React, { useMemo } from "react";
import {
   Alert,
   ScrollView,
   Switch,
   Text,
   TouchableOpacity,
   View,
} from "react-native";

export default function RiderProfileScreen() {
   const { mode, switchMode } = useApp();
   const { scheduleLocalNotification } = useNotifications();
   const { loading: authLoading } = useRequireAuth();
   const { user, signOut } = useAuthStore();
   const router = useRouter();

   const { data: rider, isLoading: riderLoading } = useRiderByUserId(user?.id);
   const { data: ordersData } = useRiderOrders(rider?.id);
   const orders = useMemo(() => {
      if (!ordersData) return [];
      return (ordersData as any)?.data || [];
   }, [ordersData]);

   if (authLoading) return null;

   // Calculate rider stats from real data
   const riderStats = useMemo(() => {
      const completed = orders.filter(
         (o: any) => o.assignment_status === "completed"
      ).length;
      const totalEarnings = orders
         .filter((o: any) => o.assignment_status === "completed")
         .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      return {
         rating: 4.8, // This would come from a rider ratings table
         totalDeliveries: completed,
         totalEarnings: Math.round(totalEarnings),
      };
   }, [orders]);

   const handleModeSwitch = (value: boolean) => {
      const newMode = value ? "user" : "rider";
      Alert.alert(
         `Switch to ${newMode === "user" ? "Customer" : "Rider"} Mode?`,
         `You will be switched to the ${newMode} panel.`,
         [
            { text: "Cancel", style: "cancel" },
            {
               text: "Switch",
               onPress: () => switchMode(newMode),
            },
         ]
      );
   };

   return (
      <>
         <Stack.Screen options={{ title: "Rider Profile" }} />
         <ScrollView
            className="flex-1 bg-gray-50 pb-20"
            showsVerticalScrollIndicator={false}
         >
            {/* Header Section with Gradient */}
            <View className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-b-[40px] px-6 pb-8 pt-6 shadow-lg">
               <View className="items-center">
                  <View className="mb-4 relative">
                     <View className="w-24 h-24 rounded-3xl border-4 border-white/30 bg-white/20 items-center justify-center backdrop-blur shadow-lg">
                        <User
                           size={48}
                           color={Colors.white}
                        />
                     </View>
                     <View className="absolute -bottom-2 -right-2 bg-amber-400 flex-row items-center px-3 py-1.5 rounded-full shadow-md">
                        <Star
                           size={14}
                           color={Colors.white}
                           fill={Colors.white}
                        />
                        <Text className="text-white font-bold text-sm ml-1">
                           {riderStats.rating}
                        </Text>
                     </View>
                  </View>
                  <Text className="text-2xl font-bold text-white mb-1">
                     {rider?.full_name ?? user?.email?.split("@")[0] ?? "Rider"}
                  </Text>
                  <View className="bg-white/20 px-4 py-1.5 rounded-full backdrop-blur">
                     <Text className="text-white/95 text-sm font-semibold">
                        Delivery Partner
                     </Text>
                  </View>
               </View>
            </View>

            {/* Stats Section */}
            <View className="flex-row px-5 -mt-8 mb-6 gap-3">
               <View className="flex-1 bg-white rounded-3xl p-5 items-center shadow-md border border-gray-100">
                  <View className="w-12 h-12 bg-orange-50 rounded-2xl items-center justify-center mb-3">
                     <Package
                        size={24}
                        color={Colors.secondary}
                     />
                  </View>
                  <Text className="text-2xl font-bold text-gray-900 mb-1">
                     {riderStats.totalDeliveries}
                  </Text>
                  <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                     Deliveries
                  </Text>
               </View>
               <View className="flex-1 bg-white rounded-3xl p-5 items-center shadow-md border border-gray-100">
                  <View className="w-12 h-12 bg-green-50 rounded-2xl items-center justify-center mb-3">
                     <DollarSign
                        size={24}
                        color={Colors.success}
                     />
                  </View>
                  <Text className="text-2xl font-bold text-gray-900 mb-1">
                     RWF {riderStats.totalEarnings?.toLocaleString()}
                  </Text>
                  <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                     Earnings
                  </Text>
               </View>
               <View className="flex-1 bg-white rounded-3xl p-5 items-center shadow-md border border-gray-100">
                  <View className="w-12 h-12 bg-amber-50 rounded-2xl items-center justify-center mb-3">
                     <Star
                        size={24}
                        color={Colors.warning}
                     />
                  </View>
                  <Text className="text-2xl font-bold text-gray-900 mb-1">
                     {riderStats.rating}
                  </Text>
                  <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                     Rating
                  </Text>
               </View>
            </View>

            {/* Notifications Preview */}
            <View className="px-5 mb-6">
               <NotificationsPreview maxItems={3} />
            </View>

            {/* Settings Section */}
            <View className="px-5">
               <Text className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">
                  Settings
               </Text>

               {/* Customer Mode Switch */}
               <View className="bg-white rounded-3xl p-5 mb-3 flex-row items-center justify-between shadow-sm border border-gray-100">
                  <View className="flex-row items-center flex-1">
                     <View className="w-12 h-12 rounded-2xl bg-blue-50 items-center justify-center mr-4">
                        <ShoppingBag
                           size={22}
                           color={Colors.primary}
                        />
                     </View>
                     <View className="flex-1">
                        <Text className="text-base font-bold text-gray-900 mb-1">
                           Customer Mode
                        </Text>
                        <Text className="text-sm text-gray-500">
                           Switch to shopping experience
                        </Text>
                     </View>
                  </View>
                  <Switch
                     value={mode === "user"}
                     onValueChange={handleModeSwitch}
                     trackColor={{
                        false: Colors.border,
                        true: Colors.secondary,
                     }}
                     thumbColor={Colors.white}
                  />
               </View>

               {/* Test Notification */}
               <TouchableOpacity
                  className="bg-white rounded-3xl p-5 mb-3 flex-row items-center justify-between shadow-sm border border-gray-100"
                  onPress={() => {
                     scheduleLocalNotification(
                        "New Delivery Available",
                        "A delivery order is waiting for you nearby. Tap to accept!",
                        {},
                        "delivery"
                     );
                     Alert.alert("Success", "Test delivery notification sent!");
                  }}
               >
                  <View className="flex-row items-center flex-1">
                     <View className="w-12 h-12 rounded-2xl bg-purple-50 items-center justify-center mr-4">
                        <Bell
                           size={22}
                           color="#8b5cf6"
                        />
                     </View>
                     <Text className="text-base font-bold text-gray-900">
                        Test Notification
                     </Text>
                  </View>
                  <ChevronRight
                     size={20}
                     color={Colors.textSecondary}
                  />
               </TouchableOpacity>

               {/* Account Settings */}
               <TouchableOpacity className="bg-white rounded-3xl p-5 mb-3 flex-row items-center justify-between shadow-sm border border-gray-100">
                  <View className="flex-row items-center flex-1">
                     <View className="w-12 h-12 rounded-2xl bg-gray-50 items-center justify-center mr-4">
                        <Settings
                           size={22}
                           color={Colors.text}
                        />
                     </View>
                     <Text className="text-base font-bold text-gray-900">
                        Account Settings
                     </Text>
                  </View>
                  <ChevronRight
                     size={20}
                     color={Colors.textSecondary}
                  />
               </TouchableOpacity>

               {/* Logout */}
               <TouchableOpacity
                  onPress={() =>
                     Alert.alert(
                        "Logout",
                        "Are you sure you want to log out?",
                        [
                           { text: "Cancel", style: "cancel" },
                           {
                              text: "Logout",
                              style: "destructive",
                              onPress: async () => {
                                 try {
                                    await signOut();
                                    try {
                                       router.replace("/signin" as any);
                                    } catch (navErr) {
                                       console.warn(
                                          "Router replace failed:",
                                          navErr
                                       );
                                    }
                                 } catch (err: any) {
                                    Alert.alert(
                                       "Error",
                                       err?.message || "Failed to sign out"
                                    );
                                 }
                              },
                           },
                        ]
                     )
                  }
                  className="bg-white rounded-3xl p-5 flex-row items-center justify-between shadow-sm border border-red-100 mb-8"
               >
                  <View className="flex-row items-center flex-1">
                     <View className="w-12 h-12 rounded-2xl bg-red-50 items-center justify-center mr-4">
                        <LogOut
                           size={22}
                           color={Colors.error}
                        />
                     </View>
                     <Text className="text-base font-bold text-red-600">
                        Logout
                     </Text>
                  </View>
                  <ChevronRight
                     size={20}
                     color={Colors.error}
                  />
               </TouchableOpacity>
            </View>
         </ScrollView>
      </>
   );
}
