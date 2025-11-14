import Colors from "@/constants/colors";
import { useRiderOrders } from "@/hooks/useRiderOrders";
import { useRiderByUserId } from "@/hooks/useRiders";
import { useAuthStore } from "@/store/auth.store";
import { Stack, useRouter } from "expo-router";
import {
   ChevronRight,
   DollarSign,
   MapPin,
   Package,
   Star,
   Target,
   Timer,
   TrendingUp,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
   RefreshControl,
   ScrollView,
   Text,
   TouchableOpacity,
   View,
} from "react-native";

// Helper to format time
const getTimeAgo = (dateString: string) => {
   const date = new Date(dateString);
   const now = new Date();
   const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

   if (seconds < 60) return "Just now";
   if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
   if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
   return `${Math.floor(seconds / 86400)} days ago`;
};

interface StatsCardProps {
   title: string;
   value: string;
   change?: string;
   icon: React.ComponentType<any>;
   gradient: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
   title,
   value,
   change,
   icon: Icon,
   gradient,
}) => (
   <View
      className={`${gradient} rounded-3xl p-5 shadow-md flex-1`}
      style={{ minHeight: 130 }}
   >
      <View className="flex-row items-start justify-between mb-3">
         <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center backdrop-blur">
            <Icon
               size={22}
               color="white"
            />
         </View>
         {change && (
            <View className="bg-white/20 px-2 py-1 rounded-full flex-row items-center">
               <TrendingUp
                  size={12}
                  color="rgba(255,255,255,0.9)"
               />
               <Text className="text-white text-xs font-bold ml-1">
                  {change}%
               </Text>
            </View>
         )}
      </View>
      <View className="flex-1 justify-end">
         <Text className="text-white/80 text-xs font-semibold mb-1 uppercase tracking-wide">
            {title}
         </Text>
         <Text className="text-white text-2xl font-bold">{value}</Text>
      </View>
   </View>
);

const DeliveryCard: React.FC<{
   orderNumber: string;
   location: string;
   amount: number;
   time: string;
   status: string;
}> = ({ orderNumber, location, amount, time, status }) => (
   <View className="bg-white rounded-3xl p-5 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between mb-4">
         <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 bg-orange-50 rounded-2xl items-center justify-center mr-3 border border-orange-100">
               <Package
                  size={20}
                  color={Colors.secondary}
               />
            </View>
            <View className="flex-1">
               <Text className="font-bold text-gray-900 text-base">
                  {orderNumber}
               </Text>
               <Text className="text-gray-500 text-xs mt-0.5">{time}</Text>
            </View>
         </View>
         <View
            className={`px-3 py-1.5 rounded-full ${
               status === "completed" ? "bg-green-50" : "bg-blue-50"
            }`}
         >
            <Text
               className={`text-xs font-bold ${
                  status === "completed" ? "text-green-600" : "text-blue-600"
               }`}
            >
               {status === "completed" ? "Delivered" : "In Progress"}
            </Text>
         </View>
      </View>

      <View className="flex-row items-center mb-3 bg-gray-50 p-3 rounded-2xl">
         <MapPin
            size={16}
            color={Colors.textSecondary}
         />
         <Text className="text-gray-700 text-sm ml-2 flex-1 font-medium">
            {location}
         </Text>
      </View>

      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
         <Text className="text-gray-500 text-xs">Delivery Fee</Text>
         <Text className="font-bold text-gray-900 text-lg">
            RWF {amount?.toLocaleString()}
         </Text>
      </View>
   </View>
);

export default function RiderDashboard() {
   const router = useRouter();
   const [refreshing, setRefreshing] = useState(false);
   const user = useAuthStore((state) => state.user);
   const { data: rider } = useRiderByUserId(user?.id as any);
   const { data: ordersData, refetch: refetchOrders } = useRiderOrders(
      rider?.id
   );

   const orders = useMemo(() => {
      if (!ordersData) return [];
      return (ordersData as any)?.data || [];
   }, [ordersData]);

   // Calculate stats from real data
   const stats = useMemo(() => {
      const completed = orders.filter(
         (o: any) => o.assignment_status === "completed"
      ).length;
      const pending = orders.filter(
         (o: any) => o.assignment_status === "assigned"
      ).length;
      const inProgress = orders.filter(
         (o: any) => o.assignment_status === "accepted"
      ).length;
      const totalEarnings = orders
         .filter((o: any) => o.assignment_status === "completed")
         .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      return {
         totalOrders: orders.length,
         completed,
         pending,
         inProgress,
         earnings: totalEarnings,
         rating: 4.8, // This would come from a rider profile table
      };
   }, [orders]);

   // Get recent completed deliveries
   const recentDeliveries = useMemo(
      () =>
         orders
            .filter((o: any) => o.assignment_status === "completed")
            .sort(
               (a: any, b: any) =>
                  new Date(b.completed_at).getTime() -
                  new Date(a.completed_at).getTime()
            )
            .slice(0, 3),
      [orders]
   );

   const onRefresh = async () => {
      setRefreshing(true);
      await refetchOrders();
      setTimeout(() => setRefreshing(false), 500);
   };

   return (
      <>
         <Stack.Screen
            options={{
               headerShown: true,
               title: "Dashboard",
               headerStyle: { backgroundColor: Colors.secondary },
               headerTintColor: "#fff",
            }}
         />

         <ScrollView
            className="flex-1 bg-gray-50"
            refreshControl={
               <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={Colors.secondary}
               />
            }
         >
            <View className="p-5">
               {/* Welcome Section */}
               <View className="mb-6">
                  <Text className="text-3xl font-bold text-gray-900 mb-2">
                     Welcome back 👋
                  </Text>
                  <Text className="text-base text-gray-600 font-medium">
                     {rider?.full_name ?? user?.email?.split("@")[0]}
                  </Text>
               </View>

               {/* Stats Grid - Fixed sizing */}
               <View className="mb-6">
                  <Text className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">
                     Today's Overview
                  </Text>
                  <View className="flex-row mb-3 gap-3">
                     <StatsCard
                        title="Total Orders"
                        value={stats.totalOrders.toString()}
                        change={
                           stats.pending > 0 ? stats.pending.toString() : "0"
                        }
                        icon={Package}
                        gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                     />
                     <StatsCard
                        title="Completed"
                        value={stats.completed.toString()}
                        change={
                           stats.completed > 0
                              ? Math.round(
                                   (stats.completed / stats.totalOrders) * 100
                                ).toString()
                              : "0"
                        }
                        icon={Target}
                        gradient="bg-gradient-to-br from-green-500 to-green-600"
                     />
                  </View>
                  <View className="flex-row gap-3">
                     <StatsCard
                        title="Pending"
                        value={stats.pending.toString()}
                        change="0"
                        icon={Timer}
                        gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                     />
                     <StatsCard
                        title="Earnings"
                        value={`${(stats.earnings / 1000).toFixed(0)}K`}
                        change={stats.completed > 0 ? "+" : "0"}
                        icon={DollarSign}
                        gradient="bg-gradient-to-br from-orange-500 to-orange-600"
                     />
                  </View>
               </View>

               {/* Profile Quick Stats */}
               <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
                  <View className="flex-row items-center justify-between mb-5">
                     <Text className="text-lg font-bold text-gray-900">
                        Your Profile
                     </Text>
                     <TouchableOpacity
                        onPress={() => router.push("/rider/profile")}
                        className="bg-gray-50 rounded-full p-2"
                     >
                        <ChevronRight
                           size={20}
                           color={Colors.textSecondary}
                        />
                     </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center mb-6">
                     <View className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl items-center justify-center mr-4 shadow-md">
                        <Text className="text-white font-bold text-2xl">
                           {user?.email?.charAt(0).toUpperCase()}
                        </Text>
                     </View>

                     <View className="flex-1">
                        <Text className="font-bold text-gray-900 text-xl mb-1">
                           {rider?.full_name ?? user?.email?.split("@")[0]}
                        </Text>
                        <Text className="text-gray-600 text-sm mb-2">
                           Professional Rider
                        </Text>
                        <View className="flex-row items-center bg-amber-50 self-start px-3 py-1 rounded-full">
                           <Star
                              size={14}
                              color="#f59e0b"
                              fill="#f59e0b"
                           />
                           <Text className="text-amber-700 text-sm font-bold ml-1">
                              {stats.rating}
                           </Text>
                        </View>
                     </View>
                  </View>

                  <View className="flex-row justify-around pt-4 border-t border-gray-100">
                     <View className="items-center">
                        <Text className="text-3xl font-bold text-gray-900">
                           {stats.totalOrders}
                        </Text>
                        <Text className="text-gray-500 text-xs mt-1 font-medium">
                           Deliveries
                        </Text>
                     </View>
                     <View className="w-px bg-gray-200" />
                     <View className="items-center">
                        <Text className="text-3xl font-bold text-gray-900">
                           {stats.completed > 0 && stats.totalOrders > 0
                              ? Math.round(
                                   (stats.completed / stats.totalOrders) * 100
                                )
                              : 0}
                           %
                        </Text>
                        <Text className="text-gray-500 text-xs mt-1 font-medium">
                           Success Rate
                        </Text>
                     </View>
                     <View className="w-px bg-gray-200" />
                     <View className="items-center">
                        <Text className="text-3xl font-bold text-gray-900">
                           {stats.pending}
                        </Text>
                        <Text className="text-gray-500 text-xs mt-1 font-medium">
                           Active Deliveries
                        </Text>
                     </View>
                  </View>
               </View>

               {/* Recent Deliveries */}
               <View className="mb-6">
                  <View className="flex-row items-center justify-between mb-4">
                     <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        Recent Deliveries
                     </Text>
                     <TouchableOpacity
                        onPress={() => router.push("/rider/orders")}
                        className="flex-row items-center bg-orange-50 px-3 py-2 rounded-full"
                     >
                        <Text className="text-secondary text-sm font-bold mr-1">
                           View All
                        </Text>
                        <ChevronRight
                           size={16}
                           color={Colors.secondary}
                        />
                     </TouchableOpacity>
                  </View>

                  {recentDeliveries.length === 0 ? (
                     <View className="bg-white rounded-3xl p-6 items-center justify-center">
                        <Package
                           size={32}
                           color={Colors.textSecondary}
                        />
                        <Text className="text-gray-500 text-sm font-medium mt-2">
                           No completed deliveries yet
                        </Text>
                     </View>
                  ) : (
                     recentDeliveries.map((delivery: any) => (
                        <DeliveryCard
                           key={delivery.order_id}
                           orderNumber={delivery.order_number}
                           location={`${delivery.delivery_address}, ${delivery.delivery_city}`}
                           amount={delivery.total}
                           time={getTimeAgo(delivery.completed_at)}
                           status="completed"
                        />
                     ))
                  )}
               </View>
            </View>
         </ScrollView>
      </>
   );
}
