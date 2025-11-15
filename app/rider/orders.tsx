import Colors from "@/constants/colors";
import {
   useAcceptRiderAssignment,
   useCompleteRiderAssignment,
   useRejectRiderAssignment,
   useRiderOrders,
} from "@/hooks/useRiderOrders";
import { useRiderByUserId } from "@/hooks/useRiders";
import { useAuthStore } from "@/store/auth.store";
import toast from "@/utils/toast";
import { Stack, useRouter } from "expo-router";
import {
   CheckCircle,
   ChevronLeft,
   Clock,
   Filter,
   MapPin,
   Package,
   Search,
   XCircle,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
   ActivityIndicator,
   RefreshControl,
   ScrollView,
   Text,
   TextInput,
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

type OrderStatus = "assigned" | "accepted" | "completed" | "rejected";

interface OrderCardProps {
   order: any;
   onAccept: (id: string) => void;
   onReject: (id: string) => void;
   onComplete: (id: string) => void;
   isLoading?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
   order,
   onAccept,
   onReject,
   onComplete,
   isLoading = false,
}) => {
   const getStatusColor = (status: string) => {
      switch (status) {
         case "assigned":
            return "bg-blue-100 text-blue-700";
         case "accepted":
            return "bg-orange-100 text-orange-700";
         case "completed":
            return "bg-green-100 text-green-700";
         case "rejected":
            return "bg-red-100 text-red-700";
         default:
            return "bg-gray-100 text-gray-700";
      }
   };

   const getStatusText = (status: string) => {
      switch (status) {
         case "assigned":
            return "New Assignment";
         case "accepted":
            return "In Progress";
         case "completed":
            return "Delivered";
         case "rejected":
            return "Rejected";
         default:
            return status;
      }
   };

   return (
      <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
         {/* Header */}
         <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1">
               <View className="w-10 h-10 bg-orange-100 rounded-lg items-center justify-center mr-3">
                  <Package
                     size={20}
                     color={Colors.secondary}
                  />
               </View>
               <View className="flex-1">
                  <Text className="font-bold text-gray-900 text-lg">
                     {order.order_number}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                     {order.customer_first_name} {order.customer_last_name} •{" "}
                     {order.items_count} items
                  </Text>
               </View>
            </View>
            <View
               className={`px-3 py-1 rounded-full ${getStatusColor(order.assignment_status)}`}
            >
               <Text className="text-xs font-medium">
                  {getStatusText(order.assignment_status)}
               </Text>
            </View>
         </View>

         {/* Location */}
         <View className="flex-row items-center mb-3">
            <MapPin
               size={16}
               color={Colors.textSecondary}
            />
            <Text className="text-gray-600 text-sm ml-2 flex-1">
               {order.delivery_address}, {order.delivery_city}
            </Text>
         </View>

         {/* Footer */}
         <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
               <Clock
                  size={14}
                  color={Colors.textSecondary}
               />
               <Text className="text-gray-500 text-xs ml-1">
                  {getTimeAgo(order.assigned_at)}
               </Text>
            </View>

            <View className="flex-row items-center">
               <Text className="font-bold text-gray-900 mr-3">
                  RWF {order.total?.toLocaleString()}
               </Text>

               {order.assignment_status === "assigned" && (
                  <View className="flex-row">
                     <TouchableOpacity
                        onPress={() => onAccept(order.assignment_id)}
                        disabled={isLoading}
                        className="bg-green-600 rounded-lg px-3 py-2 mr-2"
                     >
                        {isLoading ? (
                           <ActivityIndicator
                              size="small"
                              color="white"
                           />
                        ) : (
                           <CheckCircle
                              size={16}
                              color="white"
                           />
                        )}
                     </TouchableOpacity>
                     <TouchableOpacity
                        onPress={() => onReject(order.assignment_id)}
                        disabled={isLoading}
                        className="bg-red-600 rounded-lg px-3 py-2"
                     >
                        {isLoading ? (
                           <ActivityIndicator
                              size="small"
                              color="white"
                           />
                        ) : (
                           <XCircle
                              size={16}
                              color="white"
                           />
                        )}
                     </TouchableOpacity>
                  </View>
               )}

               {order.assignment_status === "accepted" && (
                  <TouchableOpacity
                     onPress={() => onComplete(order.assignment_id)}
                     disabled={isLoading}
                     className="bg-secondary rounded-lg px-4 py-2 flex-row items-center"
                  >
                     {isLoading ? (
                        <ActivityIndicator
                           size="small"
                           color="white"
                        />
                     ) : (
                        <>
                           <CheckCircle
                              size={16}
                              color="white"
                           />
                           <Text className="text-white text-sm font-medium ml-1">
                              Complete
                           </Text>
                        </>
                     )}
                  </TouchableOpacity>
               )}
            </View>
         </View>
      </View>
   );
};

export default function RiderOrders() {
   const router = useRouter();
   const [searchQuery, setSearchQuery] = useState("");
   const [refreshing, setRefreshing] = useState(false);
   const [activeFilter, setActiveFilter] = useState<string>("all");

   const user = useAuthStore((state) => state.user);
   const { data: rider } = useRiderByUserId(user?.id as any);
   const { data: ordersData, isLoading, refetch } = useRiderOrders(rider?.id);

   const acceptMutation = useAcceptRiderAssignment();
   const rejectMutation = useRejectRiderAssignment();
   const completeMutation = useCompleteRiderAssignment();

   const orders = useMemo(() => {
      if (!ordersData) return [];
      return (ordersData as any)?.data || [];
   }, [ordersData]);

   const onRefresh = async () => {
      setRefreshing(true);
      await refetch();
      setRefreshing(false);
   };

   const filteredOrders = useMemo(
      () =>
         orders.filter((order: any) => {
            const matchesSearch =
               order.order_number
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
               order.delivery_address
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
               `${order.customer_first_name} ${order.customer_last_name}`
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase());
            const matchesFilter =
               activeFilter === "all" ||
               order.assignment_status === activeFilter;
            return matchesSearch && matchesFilter;
         }),
      [orders, searchQuery, activeFilter]
   );

   const handleAccept = async (assignmentId: string) => {
      try {
         await acceptMutation.mutateAsync(assignmentId);
         toast.success("Order accepted!");
      } catch (error) {
         toast.error("Failed to accept order");
      }
   };

   const handleReject = async (assignmentId: string) => {
      try {
         await rejectMutation.mutateAsync(assignmentId);
         toast.success("Order rejected");
      } catch (error) {
         toast.error("Failed to reject order");
      }
   };

   const handleComplete = async (assignmentId: string) => {
      try {
         await completeMutation.mutateAsync(assignmentId);
         toast.success("Delivery completed!");
      } catch (error) {
         toast.error("Failed to complete delivery");
      }
   };

   const filterOptions: { value: string; label: string }[] = [
      { value: "all", label: "All Orders" },
      { value: "assigned", label: "New" },
      { value: "accepted", label: "In Progress" },
      { value: "completed", label: "Completed" },
   ];

   return (
      <>
         <Stack.Screen
            options={{
               headerShown: true,
               title: "My Orders",
               headerLeft: () => (
                  <TouchableOpacity
                     onPress={() => router.back()}
                     className="mr-4"
                  >
                     <ChevronLeft
                        size={24}
                        color="#fff"
                     />
                  </TouchableOpacity>
               ),
               headerStyle: {
                  backgroundColor: Colors.secondary,
               },
               headerTintColor: "#fff",
            }}
         />

         <View className="flex-1 bg-gray-50">
            {/* Search and Filter */}
            <View className="p-4 bg-white border-b border-gray-200">
               <View className="flex-row items-center mb-3">
                  <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 py-2 mr-2">
                     <Search
                        size={18}
                        color={Colors.textSecondary}
                     />
                     <TextInput
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="flex-1 ml-2 text-gray-900"
                        placeholderTextColor={Colors.textSecondary}
                     />
                  </View>
                  <TouchableOpacity className="bg-gray-100 rounded-xl p-2">
                     <Filter
                        size={20}
                        color={Colors.textSecondary}
                     />
                  </TouchableOpacity>
               </View>

               {/* Filter Chips */}
               <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-row"
               >
                  {filterOptions.map((option) => (
                     <TouchableOpacity
                        key={option.value}
                        onPress={() => setActiveFilter(option.value)}
                        className={`mr-2 px-4 py-2 rounded-full ${
                           activeFilter === option.value
                              ? "bg-primary"
                              : "bg-gray-100"
                        }`}
                     >
                        <Text
                           className={`text-sm font-medium ${
                              activeFilter === option.value
                                 ? "text-white"
                                 : "text-gray-700"
                           }`}
                        >
                           {option.label}
                        </Text>
                     </TouchableOpacity>
                  ))}
               </ScrollView>
            </View>

            {/* Orders List */}
            <ScrollView
               className="flex-1 p-4 pb-20"
               refreshControl={
                  <RefreshControl
                     refreshing={refreshing}
                     onRefresh={onRefresh}
                     tintColor={Colors.secondary}
                  />
               }
            >
               {isLoading && !refreshing ? (
                  <View className="items-center justify-center py-12">
                     <ActivityIndicator
                        size="large"
                        color={Colors.secondary}
                     />
                     <Text className="text-gray-500 text-lg font-medium mt-4">
                        Loading orders...
                     </Text>
                  </View>
               ) : filteredOrders.length === 0 ? (
                  <View className="items-center justify-center py-12">
                     <Package
                        size={64}
                        color={Colors.textSecondary}
                     />
                     <Text className="text-gray-500 text-lg font-medium mt-4">
                        No orders found
                     </Text>
                     <Text className="text-gray-400 text-center mt-2">
                        {searchQuery || activeFilter !== "all"
                           ? "Try adjusting your search or filter"
                           : "You don't have any orders yet"}
                     </Text>
                  </View>
               ) : (
                  filteredOrders.map((order: any) => (
                     <OrderCard
                        key={order.assignment_id}
                        order={order}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onComplete={handleComplete}
                        isLoading={
                           acceptMutation.isPending ||
                           rejectMutation.isPending ||
                           completeMutation.isPending
                        }
                     />
                  ))
               )}
            </ScrollView>
         </View>
      </>
   );
}
