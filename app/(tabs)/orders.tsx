import Colors from "@/constants/colors";
import { useOrders } from "@/hooks/useOrders";
import useRequireAuth from "@/hooks/useRequireAuth";
import { Order, OrderQueryOptions, OrderStatus } from "@/types/orders";
import { Stack } from "expo-router";
import {
   CheckCircle,
   Clock,
   Package,
   RefreshCw,
   Truck,
   XCircle,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
   ActivityIndicator,
   ScrollView,
   Text,
   TextInput,
   TouchableOpacity,
   View,
} from "react-native";

export default function OrdersScreen() {
   const { loading: authLoading } = useRequireAuth();
   const ordersHook = useOrders();
   const router = useRouter();

   const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
   const [search, setSearch] = useState("");

   const queryOptions: OrderQueryOptions = useMemo(
      () => ({
         filters: {
            status: statusFilter === "all" ? undefined : statusFilter,
            search: search.trim() || undefined,
         },
         pagination: {
            page: 1,
            limit: 20,
         },
         sort: {
            column: "created_at",
            direction: "desc",
         },
      }),
      [statusFilter, search]
   );

   const userOrdersQ = ordersHook.useUserOrders(queryOptions);
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

   const getRefundStatusIcon = (status: string) => {
      switch (status) {
         case "requested":
            return (
               <Clock
                  size={14}
                  color="#3b82f6"
               />
            );
         case "approved":
            return (
               <CheckCircle
                  size={14}
                  color={Colors.success}
               />
            );
         case "rejected":
            return (
               <XCircle
                  size={14}
                  color={Colors.error}
               />
            );
         case "refunded":
            return (
               <CheckCircle
                  size={14}
                  color={Colors.success}
               />
            );
         default:
            return null;
      }
   };

   const getRefundStatusColor = (status: string) => {
      switch (status) {
         case "requested":
            return "#3b82f6";
         case "approved":
         case "refunded":
            return Colors.success;
         case "rejected":
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

   if (!userOrdersQ.isLoading && orders.length === 0 && !search.trim()) {
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
            className="flex-1 bg-background pb-20"
            showsVerticalScrollIndicator={false}
         >
            <View className="p-4">
               {/* Search + Status Filters */}
               <View className="mb-4">
                  <View className="mb-3">
                     <Text className="text-sm font-semibold text-text mb-1">
                        Search orders
                     </Text>
                     <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search by order number, email or product..."
                        placeholderTextColor={Colors.textSecondary}
                        className="bg-white border border-border rounded-lg px-3 py-2 text-sm text-text"
                     />
                  </View>

                  <ScrollView
                     horizontal
                     showsHorizontalScrollIndicator={false}
                     className="mt-1"
                  >
                     {(
                        [
                           { key: "all", label: "All" },
                           { key: "pending", label: "Pending" },
                           { key: "processing", label: "Processing" },
                           { key: "assigned", label: "Assigned" },
                           { key: "shipped", label: "Shipped" },
                           { key: "delivered", label: "Delivered" },
                           { key: "cancelled", label: "Cancelled" },
                           { key: "refunded", label: "Refunded" },
                        ] as { key: "all" | OrderStatus; label: string }[]
                     ).map((chip) => {
                        const isActive = statusFilter === chip.key;
                        return (
                           <TouchableOpacity
                              key={chip.key}
                              onPress={() => setStatusFilter(chip.key)}
                              className={`mr-2 mb-2 px-3 py-1.5 rounded-full border ${
                                 isActive
                                    ? "bg-primary border-primary"
                                    : "bg-white border-border"
                              }`}
                           >
                              <Text
                                 className="text-xs font-semibold"
                                 style={{
                                    color: isActive
                                       ? "#ffffff"
                                       : Colors.textSecondary,
                                 }}
                              >
                                 {chip.label}
                              </Text>
                           </TouchableOpacity>
                        );
                     })}
                  </ScrollView>
               </View>

               {userOrdersQ.isLoading && (
                  <View className="py-12 items-center justify-center">
                     <ActivityIndicator
                        size="small"
                        color={Colors.primary}
                     />
                     <Text className="mt-2 text-xs text-textSecondary">
                        Loading your orders...
                     </Text>
                  </View>
               )}

               {!userOrdersQ.isLoading &&
                  orders.length === 0 &&
                  search.trim() && (
                     <View className="py-12 items-center justify-center">
                        <Package
                           size={40}
                           color={Colors.textSecondary}
                        />
                        <Text className="mt-3 text-sm font-semibold text-text">
                           No orders match your search
                        </Text>
                        <Text className="mt-1 text-xs text-textSecondary text-center">
                           Try a different status filter or keyword.
                        </Text>
                     </View>
                  )}

               {orders.map((order) => (
                  <View
                     key={order.id}
                     className="bg-white rounded-xl p-4 mb-4 shadow-lg"
                  >
                     <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1">
                           <Text className="text-lg font-bold text-text">
                              Order #{order.order_number || order.id.slice(-8)}
                           </Text>
                           <Text className="text-xs text-textSecondary mt-1">
                              {formatDate(order.created_at)}
                           </Text>
                        </View>
                        <View
                           className={`flex-row items-center gap-2 px-3 py-2 rounded-lg`}
                           style={{
                              backgroundColor:
                                 getStatusColor(order.status) + "20",
                           }}
                        >
                           {getStatusIcon(order.status)}
                           <Text
                              className={`text-xs font-semibold`}
                              style={{ color: getStatusColor(order.status) }}
                           >
                              {order.status.charAt(0).toUpperCase() +
                                 order.status.slice(1)}
                           </Text>
                        </View>
                     </View>

                     {/* Show refund status badge if applicable */}
                     {(order.refund_status ||
                        order.items?.some(
                           (item: any) => item.refund_status
                        )) && (
                        <View className="mb-3 flex-row flex-wrap gap-2">
                           {order.refund_status && (
                              <View
                                 className="flex-row items-center gap-1 px-2 py-1 rounded"
                                 style={{
                                    backgroundColor:
                                       getRefundStatusColor(
                                          order.refund_status
                                       ) + "20",
                                 }}
                              >
                                 {getRefundStatusIcon(order.refund_status)}
                                 <Text
                                    className="text-xs font-medium"
                                    style={{
                                       color: getRefundStatusColor(
                                          order.refund_status
                                       ),
                                    }}
                                 >
                                    Refund {order.refund_status}
                                 </Text>
                              </View>
                           )}
                           {order.items?.some(
                              (item: any) => item.refund_status
                           ) && (
                              <View
                                 className="flex-row items-center gap-1 px-2 py-1 rounded"
                                 style={{
                                    backgroundColor: "#ef444420",
                                 }}
                              >
                                 <Clock
                                    size={12}
                                    color="#ef4444"
                                 />
                                 <Text className="text-xs font-medium text-red-600">
                                    Item refunds pending
                                 </Text>
                              </View>
                           )}
                        </View>
                     )}

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

                     <TouchableOpacity
                        onPress={() =>
                           router.push(`/orders/${order.id}` as any)
                        }
                        className="bg-primary py-3 rounded-lg items-center mt-3"
                     >
                        <Text className="text-sm font-semibold text-white">
                           View Details
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
