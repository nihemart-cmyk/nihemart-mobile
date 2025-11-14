import Colors from "@/constants/colors";
import { useOrders } from "@/hooks/useOrders";
import useRequireAuth from "@/hooks/useRequireAuth";
import { Order } from "@/types/orders";
import { Stack } from "expo-router";
import {
   CheckCircle,
   Clock,
   Package,
   RefreshCw,
   Truck,
   XCircle,
} from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function OrdersScreen() {
   const { loading: authLoading } = useRequireAuth();
   const ordersHook = useOrders();
   const userOrdersQ = ordersHook.useUserOrders();

   const orders = userOrdersQ?.data?.data || [];

   if (authLoading) return null;

   const getStatusIcon = (status: Order["status"]) => {
      switch (status) {
         case "pending":
            return (
               <Clock
                  size={20}
                  color={Colors.warning}
               />
            );
         case "processing":
            return (
               <Package
                  size={20}
                  color={Colors.primary}
               />
            );
         case "assigned":
            return (
               <RefreshCw
                  size={20}
                  color={Colors.primary}
               />
            );
         case "shipped":
            return (
               <Truck
                  size={20}
                  color={Colors.primary}
               />
            );
         case "delivered":
            return (
               <CheckCircle
                  size={20}
                  color={Colors.success}
               />
            );
         case "refunded":
            return (
               <XCircle
                  size={20}
                  color={Colors.error}
               />
            );
         case "cancelled":
            return (
               <XCircle
                  size={20}
                  color={Colors.error}
               />
            );
         default:
            return (
               <Package
                  size={20}
                  color={Colors.primary}
               />
            );
      }
   };

   const getStatusColor = (status: Order["status"]) => {
      switch (status) {
         case "pending":
            return Colors.warning;
         case "processing":
         case "assigned":
         case "shipped":
            return Colors.primary;
         case "delivered":
            return Colors.success;
         case "refunded":
         case "cancelled":
            return Colors.error;
         default:
            return Colors.text;
      }
   };

   const formatDate = (dateString: string | undefined | null) => {
      const date = dateString ? new Date(dateString) : new Date();
      return date.toLocaleDateString("en-US", {
         month: "short",
         day: "numeric",
         year: "numeric",
      });
   };

   if (!userOrdersQ.isLoading && orders.length === 0) {
      return (
         <>
            <Stack.Screen options={{ title: "My Orders" }} />
            <View className="flex-1 bg-background items-center justify-center p-6">
               <Package
                  size={64}
                  color={Colors.textSecondary}
               />
               <Text className="text-2xl font-bold text-text mt-4">
                  No orders yet
               </Text>
               <Text className="text-lg text-textSecondary mt-2">
                  Your order history will appear here
               </Text>
            </View>
         </>
      );
   }

   return (
      <>
         <Stack.Screen options={{ title: "My Orders" }} />
         <ScrollView
            className="flex-1 bg-background"
            showsVerticalScrollIndicator={false}
         >
            <View className="p-4">
               {orders.map((order) => (
                  <View
                     key={order.id}
                     className="bg-white rounded-xl p-4 mb-4 shadow-lg"
                  >
                     <View className="flex-row justify-between items-start">
                        <View>
                           <Text className="text-lg font-bold text-text">
                              Order #{order.id.slice(-8)}
                           </Text>
                           <Text className="text-sm text-textSecondary mt-1">
                              {formatDate(order.created_at)}
                           </Text>
                        </View>
                        <View
                           className={`flex-row items-center gap-2 px-3 py-2 rounded-xl ${getStatusColor(order.status)}20`}
                        >
                           {getStatusIcon(order.status)}
                           <Text
                              className={`text-sm font-semibold ${getStatusColor(order.status)}`}
                           >
                              {order.status.charAt(0).toUpperCase() +
                                 order.status.slice(1)}
                           </Text>
                        </View>
                     </View>

                     <View className="h-px bg-border my-3" />

                     <View className="mb-3">
                        {Array.isArray(order.items ? order.items : []) &&
                           (order.items || [])
                              .slice(0, 2)
                              .map((item: any, idx: number) => (
                                 <View
                                    key={`${order.id}-item-${idx}`}
                                    className="flex-row justify-between py-1"
                                 >
                                    <Text className="text-sm text-text flex-1">
                                       {item.product_name || item.product?.name}
                                    </Text>
                                    <Text className="text-sm text-textSecondary ml-2">
                                       x{item.quantity}
                                    </Text>
                                 </View>
                              ))}
                        {Array.isArray(order.items) &&
                           order.items.length > 2 && (
                              <Text className="text-sm text-primary mt-1">
                                 +{order.items.length - 2} more items
                              </Text>
                           )}
                     </View>

                     <View className="flex-row justify-between items-center pt-3 border-t border-border">
                        <Text className="text-sm text-textSecondary">
                           Total Amount
                        </Text>
                        <Text className="text-xl font-bold text-primary">
                           RWF {Number(order.total || 0).toLocaleString()}
                        </Text>
                     </View>

                     <TouchableOpacity className="bg-primary py-3 rounded-lg items-center mt-3">
                        <Text className="text-sm font-semibold text-white">
                           Track Order
                        </Text>
                     </TouchableOpacity>
                  </View>
               ))}
            </View>
         </ScrollView>
      </>
   );
}

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: Colors.background },
//   emptyContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
//   emptyTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginTop: 16 },
//   emptyText: { fontSize: 16, color: Colors.textSecondary, marginTop: 8 },
//   content: { padding: 16 },
//   orderCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
//   orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
//   orderId: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
//   orderDate: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
//   statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
//   statusText: { fontSize: 14, fontWeight: '600' },
//   divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
//   orderItems: { marginBottom: 12 },
//   orderItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
//   itemName: { fontSize: 14, color: Colors.text, flex: 1 },
//   itemQuantity: { fontSize: 14, color: Colors.textSecondary, marginLeft: 8 },
//   moreItems: { fontSize: 14, color: Colors.primary, marginTop: 4 },
//   orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
//   totalLabel: { fontSize: 14, color: Colors.textSecondary },
//   totalAmount: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
//   trackButton: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
//   trackButtonText: { fontSize: 14, fontWeight: '600', color: Colors.white },
// });
