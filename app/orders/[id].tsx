import Colors from "@/constants/colors";
import { useOrders } from "@/hooks/useOrders";
import { useAuthStore } from "@/store/auth.store";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function OrderDetailScreen() {
   const params = useLocalSearchParams();
   const id = (params?.id as string) || "";

   const orders = useOrders();
   const user = useAuthStore((s) => s.user);
   const hasRole = useAuthStore((s) => s.hasRole);

   const { data, isLoading, isError, refetch } = orders.useOrder(id);
   const updateStatus = orders.updateOrderStatus;

   const isAdmin = hasRole && hasRole("admin");

   const handleMarkDelivered = async () => {
      if (!id) return;
      Alert.alert("Confirm", "Mark this order as delivered?", [
         { text: "Cancel", style: "cancel" },
         {
            text: "Yes",
            onPress: async () => {
               try {
                  await updateStatus.mutateAsync({ id, status: "delivered" });
                  Alert.alert("Success", "Order marked as delivered");
                  refetch();
               } catch (err: any) {
                  Alert.alert(
                     "Error",
                     err?.message || "Failed to update order"
                  );
               }
            },
         },
      ]);
   };

   if (isLoading) {
      return (
         <View className="flex-1 items-center justify-center p-4">
            <Text>Loading order...</Text>
         </View>
      );
   }

   if (isError || !data) {
      return (
         <View className="flex-1 items-center justify-center p-4">
            <Text>Order not found or failed to load.</Text>
         </View>
      );
   }

   const order = data;

   const statusColor = (() => {
      switch (order.status) {
         case "pending":
            return Colors.warning;
         case "processing":
            return Colors.primary;
         case "shipped":
            return Colors.primary;
         case "delivered":
            return Colors.success;
         case "cancelled":
            return Colors.error;
         default:
            return Colors.text;
      }
   })();

   const formattedDate = order.created_at
      ? new Date(order.created_at).toLocaleString()
      : "";

   return (
      <ScrollView className="flex-1 bg-background">
         <Stack.Screen
            options={{ title: `Order ${order.order_number || order.id}` }}
         />

         <View className="p-4">
            <View className="bg-white rounded-lg p-4 mb-4">
               <Text className="text-lg font-bold">
                  {order.order_number || order.id}
               </Text>
               <Text className="text-sm text-textSecondary mt-1">
                  {formattedDate}
               </Text>
               <View className="mt-3">
                  <Text className="text-sm text-textSecondary">Status</Text>
                  <Text
                     className="text-lg font-semibold"
                     style={{ color: statusColor }}
                  >
                     {order.status}
                  </Text>
               </View>
            </View>

            <View className="bg-white rounded-lg p-4 mb-4">
               <Text className="text-lg font-bold mb-2">Delivery</Text>
               <Text className="text-sm">
                  {order.delivery_address || order.delivery_city}
               </Text>
               {order.customer_phone && (
                  <Text className="text-sm mt-1">
                     Phone: {order.customer_phone}
                  </Text>
               )}
               {order.delivery_notes && (
                  <Text className="text-sm mt-1">
                     Notes: {order.delivery_notes}
                  </Text>
               )}
            </View>

            <View className="bg-white rounded-lg p-4 mb-4">
               <Text className="text-lg font-bold mb-2">Items</Text>
               {Array.isArray(order.items) && order.items.length > 0 ? (
                  order.items.map((it: any) => (
                     <View
                        key={it.id}
                        className="flex-row justify-between py-2 border-b border-gray-100"
                     >
                        <View className="flex-1">
                           <Text className="font-medium">
                              {it.product_name}
                           </Text>
                           {it.variation_name && (
                              <Text className="text-sm text-textSecondary">
                                 {it.variation_name}
                              </Text>
                           )}
                        </View>
                        <View className="items-end">
                           <Text className="text-sm">x{it.quantity}</Text>
                           <Text className="text-sm font-semibold">
                              RWF{" "}
                              {Number(
                                 it.total || it.price * it.quantity
                              ).toLocaleString()}
                           </Text>
                        </View>
                     </View>
                  ))
               ) : (
                  <Text className="text-sm text-textSecondary">No items</Text>
               )}

               <View className="pt-3">
                  <View className="flex-row justify-between">
                     <Text className="text-sm text-textSecondary">
                        Subtotal
                     </Text>
                     <Text className="font-medium">
                        RWF {Number(order.subtotal || 0).toLocaleString()}
                     </Text>
                  </View>
                  <View className="flex-row justify-between mt-1">
                     <Text className="text-sm text-textSecondary">
                        Delivery Fee
                     </Text>
                     <Text className="font-medium">
                        RWF {Number(order.tax || 0).toLocaleString()}
                     </Text>
                  </View>
                  <View className="flex-row justify-between mt-2 border-t pt-2">
                     <Text className="text-lg font-bold">Total</Text>
                     <Text className="text-lg font-bold">
                        RWF {Number(order.total || 0).toLocaleString()}
                     </Text>
                  </View>
               </View>
            </View>

            <View className="mb-8">
               {isAdmin && order.status !== "delivered" && (
                  <TouchableOpacity
                     onPress={handleMarkDelivered}
                     className="bg-green-600 py-3 rounded-lg items-center"
                  >
                     <Text className="text-white font-semibold">
                        Mark Delivered
                     </Text>
                  </TouchableOpacity>
               )}
            </View>
         </View>
      </ScrollView>
   );
}
