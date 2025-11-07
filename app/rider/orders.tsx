import Colors from "@/constants/colors";
import { useAuthStore } from "@/store/auth.store";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
   ScrollView,
   Text,
   View,
   TouchableOpacity,
   TextInput,
   RefreshControl,
} from "react-native";
import {
   Search,
   Filter,
   Package,
   MapPin,
   Clock,
   CheckCircle,
   XCircle,
   ChevronLeft,
} from "lucide-react-native";

// Mock data
const mockOrders = [
   {
      id: "1",
      orderNumber: "#ORD-004",
      location: "Kacyiru, KG 123 St",
      amount: "15,000",
      time: "Just now",
      status: "assigned",
      customer: "John Doe",
      items: 3,
   },
   {
      id: "2",
      orderNumber: "#ORD-005",
      location: "Gisozi, KG 456 St",
      amount: "9,500",
      time: "30 min ago",
      status: "accepted",
      customer: "Jane Smith",
      items: 2,
   },
   {
      id: "3",
      orderNumber: "#ORD-006",
      location: "Nyarutarama, KG 789 St",
      amount: "12,500",
      time: "1 hour ago",
      status: "completed",
      customer: "Mike Johnson",
      items: 4,
   },
   {
      id: "4",
      orderNumber: "#ORD-007",
      location: "Kimihurura, KG 321 St",
      amount: "8,000",
      time: "2 hours ago",
      status: "rejected",
      customer: "Sarah Wilson",
      items: 1,
   },
];

type OrderStatus = "assigned" | "accepted" | "completed" | "rejected";

interface OrderCardProps {
   order: typeof mockOrders[0];
   onAccept: (id: string) => void;
   onReject: (id: string) => void;
   onComplete: (id: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
   order,
   onAccept,
   onReject,
   onComplete,
}) => {
   const getStatusColor = (status: OrderStatus) => {
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

   const getStatusText = (status: OrderStatus) => {
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
            <View className="flex-row items-center">
               <View className="w-10 h-10 bg-orange-100 rounded-lg items-center justify-center mr-3">
                  <Package
                     size={20}
                     color={Colors.primary}
                  />
               </View>
               <View>
                  <Text className="font-bold text-gray-900 text-lg">
                     {order.orderNumber}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                     {order.customer} • {order.items} items
                  </Text>
               </View>
            </View>
            <View className={`px-3 py-1 rounded-full ${getStatusColor(order.status as OrderStatus)}`}>
               <Text className="text-xs font-medium">
                  {getStatusText(order.status as OrderStatus)}
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
               {order.location}
            </Text>
         </View>

         {/* Footer */}
         <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
               <Clock
                  size={14}
                  color={Colors.textSecondary}
               />
               <Text className="text-gray-500 text-xs ml-1">{order.time}</Text>
            </View>
            
            <View className="flex-row items-center">
               <Text className="font-bold text-gray-900 mr-3">
                  RWF {order.amount}
               </Text>
               
               {order.status === "assigned" && (
                  <View className="flex-row">
                     <TouchableOpacity
                        onPress={() => onAccept(order.id)}
                        className="bg-green-600 rounded-lg px-3 py-2 mr-2"
                     >
                        <CheckCircle
                           size={16}
                           color="white"
                        />
                     </TouchableOpacity>
                     <TouchableOpacity
                        onPress={() => onReject(order.id)}
                        className="bg-red-600 rounded-lg px-3 py-2"
                     >
                        <XCircle
                           size={16}
                           color="white"
                        />
                     </TouchableOpacity>
                  </View>
               )}
               
               {order.status === "accepted" && (
                  <TouchableOpacity
                     onPress={() => onComplete(order.id)}
                     className="bg-primary rounded-lg px-4 py-2 flex-row items-center"
                  >
                     <CheckCircle
                        size={16}
                        color="white"
                     />
                     <Text className="text-white text-sm font-medium ml-1">
                        Complete
                     </Text>
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
   const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");
   const [orders, setOrders] = useState(mockOrders);

   const onRefresh = async () => {
      setRefreshing(true);
      // Simulate API call
      setTimeout(() => setRefreshing(false), 1000);
   };

   const filteredOrders = orders.filter((order) => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === "all" || order.status === activeFilter;
      return matchesSearch && matchesFilter;
   });

   const handleAccept = (id: string) => {
      setOrders(orders.map(order => 
         order.id === id ? { ...order, status: "accepted" } : order
      ));
   };

   const handleReject = (id: string) => {
      setOrders(orders.map(order => 
         order.id === id ? { ...order, status: "rejected" } : order
      ));
   };

   const handleComplete = (id: string) => {
      setOrders(orders.map(order => 
         order.id === id ? { ...order, status: "completed" } : order
      ));
   };

   const filterOptions: { value: OrderStatus | "all"; label: string }[] = [
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
                  backgroundColor: Colors.primary,
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
               className="flex-1 p-4"
               refreshControl={
                  <RefreshControl
                     refreshing={refreshing}
                     onRefresh={onRefresh}
                     tintColor={Colors.primary}
                  />
               }
            >
               {filteredOrders.length === 0 ? (
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
                  filteredOrders.map((order) => (
                     <OrderCard
                        key={order.id}
                        order={order}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onComplete={handleComplete}
                     />
                  ))
               )}
            </ScrollView>
         </View>
      </>
   );
}