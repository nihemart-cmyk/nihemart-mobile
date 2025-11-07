import Colors from "@/constants/colors";
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
import React, { useState } from "react";
import {
   RefreshControl,
   ScrollView,
   Text,
   TouchableOpacity,
   View,
} from "react-native";

// Mock data - replace with actual API calls
const mockStats = {
   totalOrders: 156,
   completed: 142,
   pending: 8,
   earnings: 1250000,
   rating: 4.8,
};

const mockRecentDeliveries = [
   {
      id: "1",
      orderNumber: "#ORD-001",
      location: "Kigali Heights, KG 123 St",
      amount: "8,500",
      time: "2 hours ago",
      status: "completed",
   },
   {
      id: "2",
      orderNumber: "#ORD-002",
      location: "Kimironko Market, KG 456 St",
      amount: "12,000",
      time: "5 hours ago",
      status: "completed",
   },
   {
      id: "3",
      orderNumber: "#ORD-003",
      location: "Remera, KG 789 St",
      amount: "9,500",
      time: "1 day ago",
      status: "completed",
   },
];

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
   <View className={`${gradient} rounded-2xl p-4 shadow-lg`}>
      <View className="flex-row items-center justify-between">
         <View className="flex-1">
            <Text className="text-white/80 text-xs font-medium mb-1">
               {title}
            </Text>
            <Text className="text-white text-xl font-bold">{value}</Text>
            {change && (
               <View className="flex-row items-center mt-1">
                  <TrendingUp
                     size={14}
                     color="rgba(255,255,255,0.8)"
                  />
                  <Text className="text-white/80 text-xs ml-1">
                     {change}% vs last week
                  </Text>
               </View>
            )}
         </View>
         <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center">
            <Icon
               size={20}
               color="white"
            />
         </View>
      </View>
   </View>
);

interface DeliveryCardProps {
   orderNumber: string;
   location: string;
   amount: string;
   time: string;
   status: string;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({
   orderNumber,
   location,
   amount,
   time,
   status,
}) => (
   <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between mb-3">
         <View className="flex-row items-center">
            <View className="w-8 h-8 bg-orange-100 rounded-lg items-center justify-center mr-3">
               <Package
                  size={16}
                  color={Colors.primary}
               />
            </View>
            <Text className="font-bold text-gray-900">{orderNumber}</Text>
         </View>
         <View
            className={`px-2 py-1 rounded-full ${status === "completed" ? "bg-green-100" : "bg-blue-100"}`}
         >
            <Text
               className={`text-xs font-medium ${status === "completed" ? "text-green-700" : "text-blue-700"}`}
            >
               {status === "completed" ? "Delivered" : "In Progress"}
            </Text>
         </View>
      </View>

      <View className="flex-row items-center mb-2">
         <MapPin
            size={14}
            color={Colors.textSecondary}
         />
         <Text className="text-gray-600 text-sm ml-2 flex-1">{location}</Text>
      </View>

      <View className="flex-row items-center justify-between">
         <View className="flex-row items-center">
            <Text className="text-gray-500 text-xs ml-1">{time}</Text>
         </View>
         <Text className="font-bold text-gray-900">RWF {amount}</Text>
      </View>
   </View>
);

export default function RiderDashboard() {
   const router = useRouter();
   const [refreshing, setRefreshing] = useState(false);
   const user = useAuthStore((state) => state.user);
   const { data: rider } = useRiderByUserId(user?.id as any);

   const onRefresh = async () => {
      setRefreshing(true);
      // Simulate API call
      setTimeout(() => setRefreshing(false), 1000);
   };

   return (
      <>
         <Stack.Screen
            options={{
               headerShown: true,
               title: "Dashboard",
               headerStyle: { backgroundColor: Colors.primary },
               headerTintColor: "#fff",
            }}
         />

         <ScrollView
            className="flex-1 bg-gray-50"
            refreshControl={
               <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={Colors.primary}
               />
            }
         >
            <View className="p-4">
               {/* Welcome Section */}
               <View className="mb-6">
                  <Text className="text-2xl font-bold text-gray-900 mb-1">
                     Welcome back,{" "}
                     {rider?.full_name ?? user?.email?.split("@")[0]}!
                  </Text>
                  <Text className="text-gray-600">
                     Here's your delivery overview
                  </Text>
               </View>

               {/* Stats Grid */}
               <View className="mb-6">
                  <Text className="text-lg font-semibold text-gray-900 mb-3">
                     Today's Overview
                  </Text>
                  <View className="flex-row flex-wrap -mx-1">
                     <View className="w-1/2 px-1 mb-2">
                        <StatsCard
                           title="Total Orders"
                           value={mockStats.totalOrders.toString()}
                           change="12"
                           icon={Package}
                           gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                        />
                     </View>
                     <View className="w-1/2 px-1 mb-2">
                        <StatsCard
                           title="Completed"
                           value={mockStats.completed.toString()}
                           change="8"
                           icon={Target}
                           gradient="bg-gradient-to-br from-green-500 to-green-600"
                        />
                     </View>
                     <View className="w-1/2 px-1">
                        <StatsCard
                           title="Pending"
                           value={mockStats.pending.toString()}
                           change="-3"
                           icon={Timer}
                           gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                        />
                     </View>
                     <View className="w-1/2 px-1">
                        <StatsCard
                           title="Earnings"
                           value={`RWF ${(mockStats.earnings / 1000).toFixed(0)}K`}
                           change="15"
                           icon={DollarSign}
                           gradient="bg-gradient-to-br from-orange-500 to-orange-600"
                        />
                     </View>
                  </View>
               </View>

               {/* Profile Quick Stats */}
               <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                  <View className="flex-row items-center justify-between mb-4">
                     <Text className="text-lg font-semibold text-gray-900">
                        Your Profile
                     </Text>
                     <TouchableOpacity
                        onPress={() => router.push("/rider/settings")}
                     >
                        <ChevronRight
                           size={20}
                           color={Colors.textSecondary}
                        />
                     </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center mb-4">
                     <View className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl items-center justify-center mr-4">
                        <Text className="text-white font-bold text-lg">
                           {user?.email?.charAt(0).toUpperCase()}
                        </Text>
                     </View>

                     <View className="flex-1">
                        <Text className="font-bold text-gray-900 text-lg">
                           {rider?.full_name ?? user?.email?.split("@")[0]}
                        </Text>
                        <Text className="text-gray-600 text-sm">
                           Professional Rider
                        </Text>
                        <View className="flex-row items-center mt-1">
                           <Star
                              size={14}
                              color="#f59e0b"
                              fill="#f59e0b"
                           />
                           <Text className="text-gray-700 text-sm ml-1">
                              {mockStats.rating}
                           </Text>
                        </View>
                     </View>
                  </View>

                  <View className="flex-row justify-around">
                     <View className="items-center">
                        <Text className="text-2xl font-bold text-gray-900">
                           {mockStats.totalOrders}
                        </Text>
                        <Text className="text-gray-500 text-xs">
                           Deliveries
                        </Text>
                     </View>
                     <View className="items-center">
                        <Text className="text-2xl font-bold text-gray-900">
                           98%
                        </Text>
                        <Text className="text-gray-500 text-xs">
                           Success Rate
                        </Text>
                     </View>
                     <View className="items-center">
                        <Text className="text-2xl font-bold text-gray-900">
                           12
                        </Text>
                        <Text className="text-gray-500 text-xs">
                           Active Days
                        </Text>
                     </View>
                  </View>
               </View>

               {/* Recent Deliveries */}
               <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <View className="flex-row items-center justify-between mb-4">
                     <Text className="text-lg font-semibold text-gray-900">
                        Recent Deliveries
                     </Text>
                     <TouchableOpacity
                        onPress={() => router.push("/rider/orders")}
                        className="flex-row items-center"
                     >
                        <Text className="text-primary text-sm font-medium mr-1">
                           View All
                        </Text>
                        <ChevronRight
                           size={16}
                           color={Colors.primary}
                        />
                     </TouchableOpacity>
                  </View>

                  {mockRecentDeliveries.map((delivery) => (
                     <DeliveryCard
                        key={delivery.id}
                        orderNumber={delivery.orderNumber}
                        location={delivery.location}
                        amount={delivery.amount}
                        time={delivery.time}
                        status={delivery.status}
                     />
                  ))}
               </View>
            </View>
         </ScrollView>
      </>
   );
}
