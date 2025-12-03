"use client";

import Colors from "@/constants/colors";
import { useOrders } from "@/hooks/useOrders";
import { useAuthStore } from "@/store/auth.store";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
   Alert,
   Modal,
   ScrollView,
   Text,
   TextInput,
   TouchableOpacity,
   View,
   ActivityIndicator,
} from "react-native";
import {
   ChevronLeft,
   Package,
   Truck,
   CheckCircle,
   Clock,
   X,
   MapPin,
   Phone,
   User as UserIcon,
   MessageCircle,
   CreditCard,
   Smartphone,
} from "lucide-react-native";
import toast from "@/utils/toast";

const getStatusIcon = (status: string) => {
   const iconProps = { size: 20, strokeWidth: 2 };
   switch (status) {
      case "pending":
         return (
            <Clock
               {...iconProps}
               color={Colors.warning}
            />
         );
      case "processing":
         return (
            <Package
               {...iconProps}
               color={Colors.primary}
            />
         );
      case "shipped":
         return (
            <Truck
               {...iconProps}
               color={Colors.primary}
            />
         );
      case "delivered":
         return (
            <CheckCircle
               {...iconProps}
               color={Colors.success}
            />
         );
      case "cancelled":
         return (
            <X
               {...iconProps}
               color={Colors.error}
            />
         );
      case "refunded":
         return (
            <X
               {...iconProps}
               color={Colors.error}
            />
         );
      default:
         return (
            <Clock
               {...iconProps}
               color={Colors.text}
            />
         );
   }
};

const getStatusColor = (status: string) => {
   switch (status) {
      case "pending":
         return Colors.warning;
      case "processing":
      case "shipped":
         return Colors.primary;
      case "delivered":
         return Colors.success;
      case "cancelled":
      case "refunded":
         return Colors.error;
      default:
         return Colors.text;
   }
};

const getRefundStatusColor = (status: string) => {
   switch (status) {
      case "requested":
         return "#3b82f6"; // blue
      case "approved":
         return Colors.success;
      case "rejected":
         return Colors.error;
      case "refunded":
         return Colors.success;
      default:
         return Colors.text;
   }
};

const buildTimeline = (order: any) => {
   const entries: any[] = [];

   entries.push({
      key: "placed",
      title: "Order Placed",
      date: order.created_at,
      color: "#9ca3af",
   });

   if (
      order.status === "processing" ||
      order.status === "shipped" ||
      order.status === "delivered"
   ) {
      entries.push({
         key: "processing",
         title: "Order Processing",
         date: order.updated_at || order.created_at,
         color: Colors.primary,
      });
   }

   if (order.status === "shipped" || order.status === "delivered") {
      entries.push({
         key: "shipped",
         title: "Order Shipped",
         date: order.shipped_at,
         color: "#a855f7",
      });
   }

   if (order.status === "delivered") {
      entries.push({
         key: "delivered",
         title: "Order Delivered",
         date: order.delivered_at,
         color: Colors.success,
      });
   }

   if (order.status === "cancelled") {
      entries.push({
         key: "cancelled",
         title: "Order Cancelled",
         date: order.updated_at || order.created_at,
         color: Colors.error,
      });
   }

   return entries.filter((e) => (e.date ? true : e.key === "placed"));
};

const formatDate = (dateString: string | undefined | null) => {
   if (!dateString) return "";
   const date = new Date(dateString);
   return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
   });
};

export default function OrderDetailScreen() {
   const params = useLocalSearchParams();
   const id = (params?.id as string) || "";
   const router = useRouter();

   const orders = useOrders();
   const user = useAuthStore((s) => s.user);
   const hasRole = useAuthStore((s) => s.hasRole);

   const { data, isLoading, isError, refetch } = orders.useOrder(id);
   const updateStatus = orders.updateOrderStatus;
   const requestRefund = orders.useRequestRefundItem();
   const cancelRefund = orders.useCancelRefundRequestItem();
   const requestOrderRefund = orders.useRequestRefundOrder();
   const cancelOrderRefund = orders.useCancelRefundRequestOrder();

   const isAdmin = hasRole && hasRole("admin");
   const isOwner = user?.id === data?.user_id;

   const [showRefundDialog, setShowRefundDialog] = useState(false);
   const [showItemRefundDialog, setShowItemRefundDialog] = useState(false);
   const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
   const [refundReason, setRefundReason] = useState("");
   const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
   const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

   const getPaymentMethodLabel = (method?: string | null) => {
      if (!method) return "Not set";
      const map: Record<string, string> = {
         mtn_momo: "MTN Mobile Money",
         airtel_money: "Airtel Money",
         visa_card: "Visa Card",
         mastercard: "MasterCard",
         spenn: "SPENN",
         cash_on_delivery: "Cash on Delivery",
      };
      return map[method] || method.replace(/_/g, " ");
   };

   const getPaymentMethodIcon = (method?: string | null) => {
      const m = method || "";
      if (m.includes("mtn") || m.includes("momo") || m.includes("airtel")) {
         return (
            <Smartphone
               size={18}
               color={Colors.primary}
            />
         );
      }
      if (m === "cash_on_delivery") {
         return (
            <Package
               size={18}
               color={Colors.secondary}
            />
         );
      }
      return (
         <CreditCard
            size={18}
            color={Colors.primary}
         />
      );
   };

   const handleStatusUpdate = async (newStatus: string) => {
      if (isUpdatingStatus) return;
      setIsUpdatingStatus(true);

      Alert.alert("Confirm", `Mark order as ${newStatus}?`, [
         { text: "Cancel", style: "cancel" },
         {
            text: "Yes",
            onPress: async () => {
               try {
                  await updateStatus.mutateAsync({ id, status: newStatus });
                  toast.success(`Order marked as ${newStatus}`);
                  refetch();
               } catch (err: any) {
                  toast.error(err?.message || "Failed to update order");
               } finally {
                  setIsUpdatingStatus(false);
               }
            },
         },
      ]);
   };

   const handleRequestItemRefund = async (itemId: string) => {
      setSelectedItemId(itemId);
      setShowItemRefundDialog(true);
   };

   const handleSubmitItemRefund = async () => {
      if (!selectedItemId || !refundReason.trim()) {
         toast.error("Please enter a reason");
         return;
      }

      setIsSubmittingRefund(true);
      try {
         await requestRefund.mutateAsync({
            orderItemId: selectedItemId,
            reason: refundReason,
         });
         setShowItemRefundDialog(false);
         setRefundReason("");
         setSelectedItemId(null);
         refetch();
      } catch (err: any) {
         toast.error(err?.message || "Failed to request refund");
      } finally {
         setIsSubmittingRefund(false);
      }
   };

   const handleCancelItemRefund = async (itemId: string) => {
      Alert.alert("Confirm", "Cancel refund request?", [
         { text: "Cancel", style: "cancel" },
         {
            text: "Yes",
            onPress: async () => {
               try {
                  await cancelRefund.mutateAsync(itemId);
                  refetch();
               } catch (err: any) {
                  toast.error(err?.message || "Failed to cancel refund");
               }
            },
         },
      ]);
   };

   const handleRequestFullRefund = async () => {
      if (!refundReason.trim()) {
         toast.error("Please enter a reason");
         return;
      }

      setIsSubmittingRefund(true);
      try {
         await requestOrderRefund.mutateAsync({
            orderId: id,
            reason: refundReason,
         });
         setShowRefundDialog(false);
         setRefundReason("");
         refetch();
      } catch (err: any) {
         toast.error(err?.message || "Failed to request refund");
      } finally {
         setIsSubmittingRefund(false);
      }
   };

   const handleCancelFullRefund = () => {
      Alert.alert("Confirm", "Cancel full refund request?", [
         { text: "Cancel", style: "cancel" },
         {
            text: "Yes",
            onPress: async () => {
               try {
                  await cancelOrderRefund.mutateAsync(id);
                  refetch();
               } catch (err: any) {
                  toast.error(err?.message || "Failed to cancel refund");
               }
            },
         },
      ]);
   };

   if (isLoading) {
      return (
         <View className="flex-1 items-center justify-center bg-background">
            <ActivityIndicator
               size="large"
               color={Colors.primary}
            />
            <Text className="mt-2 text-textSecondary">Loading order...</Text>
         </View>
      );
   }

   if (isError || !data) {
      return (
         <View className="flex-1 items-center justify-center bg-background p-4">
            <Package
               size={48}
               color={Colors.textSecondary}
            />
            <Text className="text-lg font-bold text-text mt-4">
               Order not found
            </Text>
            <Text className="text-sm text-textSecondary text-center mt-2">
               The order could not be loaded. Please try again.
            </Text>
         </View>
      );
   }

   const order = data;
   const orderStateForActions =
      order?.status === "refunded"
         ? "refunded"
         : String(order?.refund_status || order?.status || "").toString();

   const hasOrderActions = (() => {
      if (!order) return false;

      if (isAdmin) {
         if (
            orderStateForActions === "pending" ||
            orderStateForActions === "processing" ||
            orderStateForActions === "shipped"
         )
            return true;
      }

      if (isOwner) {
         if (orderStateForActions === "refunded") return false;

         if (orderStateForActions === "delivered") {
            if (order.delivered_at) {
               const deliveredAt = new Date(order.delivered_at).getTime();
               const now = Date.now();
               const within24h = now - deliveredAt <= 24 * 60 * 60 * 1000;

               if (within24h) return true;
               if (
                  order.refund_status &&
                  String(order.refund_status) !== "refunded"
               )
                  return true;

               return false;
            }

            return true;
         }

         return true;
      }

      return false;
   })();

   return (
      <ScrollView
         className="flex-1 bg-background"
         showsVerticalScrollIndicator={false}
      >
         <Stack.Screen
            options={{
               title: `Order #${order.order_number || order.id.slice(-8)}`,
               headerBackVisible: true,
            }}
         />

         <View className="p-4">
            {/* Header Card */}
            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
               <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                     <Text className="text-xl font-bold text-text">
                        Order #{order.order_number || order.id.slice(-8)}
                     </Text>
                     <Text className="text-xs text-textSecondary mt-1">
                        {formatDate(order.created_at)}
                     </Text>
                  </View>
                  <View
                     className="flex-row items-center gap-2 px-3 py-2 rounded-lg"
                     style={{
                        backgroundColor: getStatusColor(order.status) + "20",
                     }}
                  >
                     {getStatusIcon(order.status)}
                     <Text
                        className="text-sm font-semibold"
                        style={{ color: getStatusColor(order.status) }}
                     >
                        {order.status.charAt(0).toUpperCase() +
                           order.status.slice(1)}
                     </Text>
                  </View>
               </View>
            </View>

            {/* Order Items Card */}
            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
               <Text className="text-lg font-bold text-text mb-3">
                  Order Items
               </Text>
               {Array.isArray(order.items) && order.items.length > 0 ? (
                  <View className="space-y-3">
                     {order.items.map((item: any, idx: number) => (
                        <View
                           key={item.id}
                           className={`p-3 border border-gray-200 rounded-lg ${
                              idx < order.items.length - 1 ? "mb-2" : ""
                           }`}
                        >
                           <View className="flex-row justify-between mb-2">
                              <View className="flex-1">
                                 <Text className="font-semibold text-text">
                                    {item.product_name}
                                 </Text>
                                 {item.variation_name && (
                                    <Text className="text-xs text-textSecondary mt-1">
                                       Variation: {item.variation_name}
                                    </Text>
                                 )}
                                 {item.product_sku && (
                                    <Text className="text-xs text-textSecondary">
                                       SKU: {item.product_sku}
                                    </Text>
                                 )}
                              </View>
                              <Text className="font-bold text-text">
                                 RWF {Number(item.total || 0).toLocaleString()}
                              </Text>
                           </View>

                           <View className="flex-row justify-between items-center text-xs text-textSecondary mb-2">
                              <Text>Qty: {item.quantity}</Text>
                              <Text>
                                 Unit: RWF {Number(item.price).toLocaleString()}
                              </Text>
                           </View>

                           {/* Refund Status for Item */}
                           {item.refund_status && (
                              <View
                                 className="mt-2 p-2 rounded flex-row items-center gap-2"
                                 style={{
                                    backgroundColor:
                                       getRefundStatusColor(
                                          item.refund_status
                                       ) + "20",
                                 }}
                              >
                                 {item.refund_status === "approved" && (
                                    <CheckCircle
                                       size={14}
                                       color={Colors.success}
                                    />
                                 )}
                                 {item.refund_status === "rejected" && (
                                    <X
                                       size={14}
                                       color={Colors.error}
                                    />
                                 )}
                                 {item.refund_status === "requested" && (
                                    <Clock
                                       size={14}
                                       color="#3b82f6"
                                    />
                                 )}
                                 <Text
                                    className="text-xs font-medium"
                                    style={{
                                       color: getRefundStatusColor(
                                          item.refund_status
                                       ),
                                    }}
                                 >
                                    {item.refund_status === "approved"
                                       ? "Refund Approved"
                                       : item.refund_status === "requested"
                                         ? "Refund Requested"
                                         : item.refund_status === "rejected"
                                           ? "Rejected"
                                           : item.refund_status
                                                .charAt(0)
                                                .toUpperCase() +
                                             item.refund_status.slice(1)}
                                 </Text>
                              </View>
                           )}

                           {/* Refund Actions */}
                           {!["refunded", "cancelled", "rejected"].includes(
                              orderStateForActions
                           ) &&
                              item.refund_status !== "rejected" &&
                              !isAdmin &&
                              isOwner && (
                                 <View className="mt-2 flex-row gap-2">
                                    {item.refund_status === "requested" && (
                                       <TouchableOpacity
                                          onPress={() =>
                                             handleCancelItemRefund(item.id)
                                          }
                                          className="flex-1 py-2 px-3 rounded-lg border border-yellow-300"
                                       >
                                          <Text className="text-xs font-semibold text-yellow-600 text-center">
                                             Cancel Request
                                          </Text>
                                       </TouchableOpacity>
                                    )}
                                    {!item.refund_status ||
                                    item.refund_status === "cancelled" ? (
                                       <TouchableOpacity
                                          onPress={() =>
                                             handleRequestItemRefund(item.id)
                                          }
                                          className="flex-1 py-2 px-3 rounded-lg border border-green-300"
                                       >
                                          <Text className="text-xs font-semibold text-green-600 text-center">
                                             {order.status === "delivered"
                                                ? "Request Refund"
                                                : "Reject Item"}
                                          </Text>
                                       </TouchableOpacity>
                                    ) : null}
                                 </View>
                              )}
                        </View>
                     ))}
                  </View>
               ) : (
                  <Text className="text-sm text-textSecondary">No items</Text>
               )}
            </View>

            {/* Timeline Card */}
            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
               <Text className="text-lg font-bold text-text mb-3">
                  Order Timeline
               </Text>
               <View>
                  {buildTimeline(order).map((entry: any, index: number) => (
                     <View
                        key={entry.key}
                        className="flex-row mb-3"
                     >
                        <View className="items-center mr-3">
                           <View
                              className="w-8 h-8 rounded-full items-center justify-center"
                              style={{ backgroundColor: entry.color }}
                           >
                              {getStatusIcon(entry.key)}
                           </View>
                           {index < buildTimeline(order).length - 1 && (
                              <View
                                 className="w-1 h-6"
                                 style={{
                                    backgroundColor: "#e5e7eb",
                                    marginTop: 4,
                                 }}
                              />
                           )}
                        </View>
                        <View className="flex-1">
                           <Text className="font-semibold text-text">
                              {entry.title}
                           </Text>
                           <Text className="text-xs text-textSecondary mt-1">
                              {formatDate(entry.date)}
                           </Text>
                        </View>
                     </View>
                  ))}
               </View>
            </View>

            {/* Delivery Information Card */}
            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
               <Text className="text-lg font-bold text-text mb-3">
                  Delivery Information
               </Text>
               <View className="flex-row gap-3 mb-3">
                  <MapPin
                     size={18}
                     color={Colors.textSecondary}
                  />
                  <View className="flex-1">
                     <Text className="text-sm text-text">
                        {order.delivery_address}
                     </Text>
                     <Text className="text-xs text-textSecondary mt-1">
                        {order.delivery_city}
                     </Text>
                  </View>
               </View>
               {order.delivery_notes && (
                  <View className="p-3 bg-gray-50 rounded-lg">
                     <Text className="text-xs font-semibold text-text mb-1">
                        Delivery Notes:
                     </Text>
                     <Text className="text-xs text-textSecondary">
                        {order.delivery_notes}
                     </Text>
                  </View>
               )}
            </View>

            {/* Payment Information Card */}
            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
               <Text className="text-lg font-bold text-text mb-3">
                  Payment Information
               </Text>
               <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                     {getPaymentMethodIcon(order.payment_method)}
                     <Text className="text-sm font-medium text-text">
                        {getPaymentMethodLabel(order.payment_method)}
                     </Text>
                  </View>
                  <View
                     className="px-2 py-1 rounded-full"
                     style={{
                        backgroundColor: (order.is_paid
                           ? Colors.success
                           : Colors.warning) + "20",
                     }}
                  >
                     <Text
                        className="text-xs font-semibold"
                        style={{
                           color: order.is_paid
                              ? Colors.success
                              : Colors.warning,
                        }}
                     >
                        {order.is_paid ? "Paid" : "Pending"}
                     </Text>
                  </View>
               </View>
               <View className="flex-row justify-between mt-1">
                  <Text className="text-xs text-textSecondary">Amount</Text>
                  <Text className="text-xs font-semibold text-text">
                     RWF {Number(order.total || 0).toLocaleString()}
                  </Text>
               </View>
               {order.currency && (
                  <Text className="text-[11px] text-textSecondary mt-2">
                     Currency: {order.currency}
                  </Text>
               )}
            </View>

            {/* Customer Information Card */}
            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
               <Text className="text-lg font-bold text-text mb-3">
                  Customer Information
               </Text>
               <View className="flex-row items-center gap-3 mb-3">
                  <UserIcon
                     size={18}
                     color={Colors.textSecondary}
                  />
                  <Text className="text-sm text-text">
                     {order.customer_first_name} {order.customer_last_name}
                  </Text>
               </View>
               <View className="flex-row items-center gap-3 mb-3">
                  <MessageCircle
                     size={18}
                     color={Colors.textSecondary}
                  />
                  <Text className="text-sm text-text">
                     {order.customer_email}
                  </Text>
               </View>
               {order.customer_phone && (
                  <View className="flex-row items-center gap-3">
                     <Phone
                        size={18}
                        color={Colors.textSecondary}
                     />
                     <Text className="text-sm text-text">
                        {order.customer_phone}
                     </Text>
                  </View>
               )}
            </View>

            {/* Order Summary Card */}
            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
               <Text className="text-lg font-bold text-text mb-3">
                  Order Summary
               </Text>
               <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-textSecondary">Subtotal</Text>
                  <Text className="text-sm font-medium text-text">
                     RWF {Number(order.subtotal || 0).toLocaleString()}
                  </Text>
               </View>
               <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-textSecondary">
                     Tax/Delivery
                  </Text>
                  <Text className="text-sm font-medium text-text">
                     RWF {Number(order.tax || 0).toLocaleString()}
                  </Text>
               </View>
               <View className="border-t border-gray-200 pt-2 flex-row justify-between">
                  <Text className="text-base font-bold text-text">Total</Text>
                  <Text className="text-base font-bold text-text">
                     RWF {Number(order.total || 0).toLocaleString()}
                  </Text>
               </View>
            </View>

            {/* Refund Status Card */}
            {(order.refund_status ||
               order.items?.some((item: any) => item.refund_status)) && (
               <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                  <Text className="text-lg font-bold text-text mb-3">
                     Refund Status
                  </Text>

                  {order.refund_status && (
                     <View
                        className="p-3 rounded-lg mb-3"
                        style={{
                           backgroundColor:
                              getRefundStatusColor(order.refund_status) + "20",
                        }}
                     >
                        <View className="flex-row items-center gap-2 mb-2">
                           {order.refund_status === "approved" && (
                              <CheckCircle
                                 size={16}
                                 color={Colors.success}
                              />
                           )}
                           {order.refund_status === "rejected" && (
                              <X
                                 size={16}
                                 color={Colors.error}
                              />
                           )}
                           {order.refund_status === "requested" && (
                              <Clock
                                 size={16}
                                 color="#3b82f6"
                              />
                           )}
                           <Text
                              className="font-semibold text-sm"
                              style={{
                                 color: getRefundStatusColor(
                                    order.refund_status
                                 ),
                              }}
                           >
                              Full Order Refund
                           </Text>
                        </View>

                        <Text className="text-xs text-text">
                           {order.refund_status === "requested"
                              ? "Your refund request is being reviewed."
                              : order.refund_status === "approved"
                                ? "Your refund has been approved!"
                                : "Your refund request was rejected."}
                        </Text>

                        {order.refund_reason && (
                           <Text className="text-xs text-textSecondary mt-2">
                              Reason: {order.refund_reason}
                           </Text>
                        )}
                     </View>
                  )}

                  {order.items?.some((item: any) => item.refund_status) && (
                     <View>
                        <Text className="text-sm font-semibold text-text mb-2">
                           Item Refunds
                        </Text>
                        {order.items
                           .filter((item: any) => item.refund_status)
                           .map((item: any) => (
                              <View
                                 key={item.id}
                                 className="p-2 bg-gray-50 rounded-lg mb-2"
                              >
                                 <View className="flex-row justify-between items-start">
                                    <Text className="text-xs font-medium text-text flex-1">
                                       {item.product_name}
                                    </Text>
                                    <Text
                                       className="text-xs font-bold"
                                       style={{
                                          color: getRefundStatusColor(
                                             item.refund_status
                                          ),
                                       }}
                                    >
                                       {item.refund_status === "approved"
                                          ? "Approved"
                                          : item.refund_status
                                               .charAt(0)
                                               .toUpperCase() +
                                            item.refund_status.slice(1)}
                                    </Text>
                                 </View>
                                 {item.refund_reason && (
                                    <Text className="text-xs text-textSecondary mt-1">
                                       {item.refund_reason}
                                    </Text>
                                 )}
                              </View>
                           ))}
                     </View>
                  )}
               </View>
            )}

            {/* Order Actions Card */}
            {(isAdmin || isOwner) && hasOrderActions && (
               <View className="bg-white rounded-xl p-4 mb-8 shadow-sm">
                  <Text className="text-lg font-bold text-text mb-3">
                     Order Actions
                  </Text>

                  {isAdmin && order.status === "pending" && (
                     <TouchableOpacity
                        onPress={() => handleStatusUpdate("processing")}
                        disabled={isUpdatingStatus}
                        className="bg-blue-600 py-3 rounded-lg items-center mb-2"
                     >
                        <Text className="text-white font-semibold">
                           {isUpdatingStatus
                              ? "Updating..."
                              : "Mark Processing"}
                        </Text>
                     </TouchableOpacity>
                  )}

                  {isAdmin && order.status === "processing" && (
                     <TouchableOpacity
                        onPress={() => handleStatusUpdate("shipped")}
                        disabled={isUpdatingStatus}
                        className="bg-purple-600 py-3 rounded-lg items-center mb-2"
                     >
                        <Text className="text-white font-semibold">
                           {isUpdatingStatus ? "Updating..." : "Mark Shipped"}
                        </Text>
                     </TouchableOpacity>
                  )}

                  {isAdmin && order.status === "shipped" && (
                     <TouchableOpacity
                        onPress={() => handleStatusUpdate("delivered")}
                        disabled={isUpdatingStatus}
                        className="bg-green-600 py-3 rounded-lg items-center mb-2"
                     >
                        <Text className="text-white font-semibold">
                           {isUpdatingStatus ? "Updating..." : "Mark Delivered"}
                        </Text>
                     </TouchableOpacity>
                  )}

                  {isOwner &&
                     order.status === "delivered" &&
                     order.delivered_at &&
                     (() => {
                        const deliveredAt = new Date(
                           order.delivered_at
                        ).getTime();
                        const now = Date.now();
                        const within24h =
                           now - deliveredAt <= 24 * 60 * 60 * 1000;

                        const canRequestRefund =
                           within24h &&
                           (!order.refund_status ||
                              order.refund_status === "cancelled");

                        if (canRequestRefund) {
                           return (
                              <TouchableOpacity
                                 onPress={() => setShowRefundDialog(true)}
                                 className="bg-green-600 py-3 rounded-lg items-center"
                              >
                                 <Text className="text-white font-semibold">
                                    Request Full Refund
                                 </Text>
                              </TouchableOpacity>
                           );
                        }

                        if (order.refund_status === "requested") {
                           return (
                              <TouchableOpacity
                                 onPress={handleCancelFullRefund}
                                 className="bg-yellow-600 py-3 rounded-lg items-center"
                              >
                                 <Text className="text-white font-semibold">
                                    Cancel Refund Request
                                 </Text>
                              </TouchableOpacity>
                           );
                        }

                        return null;
                     })()}
               </View>
            )}
         </View>

         {/* Full Refund Dialog */}
         <Modal
            visible={showRefundDialog}
            transparent
            animationType="slide"
            onRequestClose={() => setShowRefundDialog(false)}
         >
            <View className="flex-1 bg-black bg-opacity-50 justify-end">
               <View className="bg-white rounded-t-3xl p-6 pb-8">
                  <Text className="text-xl font-bold text-text mb-2">
                     Request Full Refund
                  </Text>
                  <Text className="text-sm text-textSecondary mb-4">
                     Provide a reason for requesting a refund for this entire
                     order.
                  </Text>

                  <TextInput
                     placeholder="Enter refund reason"
                     value={refundReason}
                     onChangeText={setRefundReason}
                     multiline
                     numberOfLines={4}
                     className="border border-gray-300 rounded-lg p-3 mb-4 text-text"
                     placeholderTextColor={Colors.textSecondary}
                  />

                  <View className="flex-row gap-2">
                     <TouchableOpacity
                        onPress={() => {
                           setShowRefundDialog(false);
                           setRefundReason("");
                        }}
                        disabled={isSubmittingRefund}
                        className="flex-1 py-3 rounded-lg border border-gray-300"
                     >
                        <Text className="text-center font-semibold text-text">
                           Cancel
                        </Text>
                     </TouchableOpacity>
                     <TouchableOpacity
                        onPress={handleRequestFullRefund}
                        disabled={isSubmittingRefund || !refundReason.trim()}
                        className={`flex-1 py-3 rounded-lg items-center ${
                           isSubmittingRefund || !refundReason.trim()
                              ? "bg-orange-400"
                              : "bg-orange-600"
                        }`}
                     >
                        {isSubmittingRefund ? (
                           <ActivityIndicator color="white" />
                        ) : (
                           <Text className="font-semibold text-white">
                              Request Refund
                           </Text>
                        )}
                     </TouchableOpacity>
                  </View>
               </View>
            </View>
         </Modal>

         {/* Item Refund Dialog */}
         <Modal
            visible={showItemRefundDialog}
            transparent
            animationType="slide"
            onRequestClose={() => setShowItemRefundDialog(false)}
         >
            <View className="flex-1 bg-black bg-opacity-50 justify-end">
               <View className="bg-white rounded-t-3xl p-6 pb-8">
                  <Text className="text-xl font-bold text-text mb-2">
                     {order.status === "delivered"
                        ? "Request Refund"
                        : "Reject Item"}
                  </Text>
                  <Text className="text-sm text-textSecondary mb-4">
                     {order.status === "delivered"
                        ? "Provide a reason for requesting a refund for this item."
                        : "You are about to reject this item."}
                  </Text>

                  <TextInput
                     placeholder={
                        order.status === "delivered"
                           ? "Enter refund reason"
                           : "Enter rejection reason"
                     }
                     value={refundReason}
                     onChangeText={setRefundReason}
                     multiline
                     numberOfLines={4}
                     className="border border-gray-300 rounded-lg p-3 mb-4 text-text"
                     placeholderTextColor={Colors.textSecondary}
                  />

                  <View className="flex-row gap-2">
                     <TouchableOpacity
                        onPress={() => {
                           setShowItemRefundDialog(false);
                           setRefundReason("");
                           setSelectedItemId(null);
                        }}
                        disabled={isSubmittingRefund}
                        className="flex-1 py-3 rounded-lg border border-gray-300"
                     >
                        <Text className="text-center font-semibold text-text">
                           Cancel
                        </Text>
                     </TouchableOpacity>
                     <TouchableOpacity
                        onPress={handleSubmitItemRefund}
                        disabled={isSubmittingRefund || !refundReason.trim()}
                        className={`flex-1 py-3 rounded-lg items-center ${
                           isSubmittingRefund || !refundReason.trim()
                              ? "bg-orange-400"
                              : "bg-orange-600"
                        }`}
                     >
                        {isSubmittingRefund ? (
                           <ActivityIndicator color="white" />
                        ) : (
                           <Text className="font-semibold text-white">
                              {order.status === "delivered"
                                 ? "Request Refund"
                                 : "Reject Item"}
                           </Text>
                        )}
                     </TouchableOpacity>
                  </View>
               </View>
            </View>
         </Modal>
      </ScrollView>
   );
}
