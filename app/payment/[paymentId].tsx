import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
   ActivityIndicator,
   ScrollView,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import {
   AlertCircle,
   CheckCircle2,
   Clock,
   RefreshCcw,
} from "lucide-react-native";
import { useKPayPayment } from "@/hooks/useKPayPayment";
import Colors from "@/constants/colors";

type PaymentStatus = "pending" | "completed" | "successful" | "failed" | "timeout" | "cancelled" | string;

interface PaymentData {
   id: string;
   order_id: string | null;
   amount: number;
   currency: string;
   payment_method: string;
   status: PaymentStatus;
   reference: string;
   kpay_transaction_id?: string;
   customer_name: string;
   customer_email: string;
   customer_phone: string;
   failure_reason?: string | null;
}

const getApiUrl = () => {
   return (
      process.env.EXPO_PUBLIC_API_URL ||
      process.env.EXPO_PUBLIC_SITE_URL ||
      ""
   );
};

export default function MobilePaymentStatusScreen() {
   const { paymentId } = useLocalSearchParams<{ paymentId: string }>();
   const router = useRouter();
   const { checkPaymentStatus, isCheckingStatus } = useKPayPayment();

   const [payment, setPayment] = useState<PaymentData | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [updating, setUpdating] = useState(false);

   const apiBase = getApiUrl();

   const fetchPayment = async () => {
      if (!paymentId) return;
      setLoading(true);
      setError(null);
      try {
         const endpoint = apiBase
            ? `${apiBase}/api/payments/${paymentId}`
            : `/api/payments/${paymentId}`;
         const resp = await fetch(endpoint);
         if (!resp.ok) {
            throw new Error("Failed to load payment details");
         }
         const data = await resp.json();
         setPayment(data);
      } catch (e: any) {
         setError(e?.message || "Failed to load payment");
      } finally {
         setLoading(false);
      }
   };

   const finalizeIfNecessary = async (paymentData: PaymentData) => {
      // If order already exists, just go to it
      if (paymentData.order_id) {
         router.push(`/orders/${paymentData.order_id}` as any);
         return;
      }

      // Otherwise, ask server if this session can create an order
      try {
         setUpdating(true);
         const endpoint = apiBase
            ? `${apiBase}/api/payments/kpay/finalize`
            : `/api/payments/kpay/finalize`;
         const resp = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: paymentData.reference }),
         });

         if (!resp.ok) {
            setUpdating(false);
            return;
         }

         const data = await resp.json();

         if (data?.success && data.orderId) {
            // Webhook / finalize already created the order
            setUpdating(false);
            router.push(`/orders/${data.orderId}` as any);
            return;
         }

         // If canCreateOrder is true, we rely on the web checkout / admin flows
         // to handle auto-creation from a stored snapshot. In the mobile app we
         // simply surface that the payment is successful and keep the status
         // screen visible so the user can manage orders from another device.
         setUpdating(false);
      } catch (e) {
         setUpdating(false);
      }
   };

   const refreshStatus = async () => {
      if (!payment) {
         await fetchPayment();
         return;
      }

      try {
         const status = await checkPaymentStatus({
            paymentId: payment.id,
            transactionId: payment.kpay_transaction_id,
            reference: payment.reference,
         });

         if (status.success) {
            const nextStatus = status.status as PaymentStatus;
            const updated: PaymentData = {
               ...payment,
               status: nextStatus,
            };
            setPayment(updated);

            if (nextStatus === "completed" || nextStatus === "successful") {
               await finalizeIfNecessary(updated);
            }
         } else if (status.error) {
            setError(status.error);
         }
      } catch (e: any) {
         setError(e?.message || "Failed to refresh payment status");
      }
   };

   useEffect(() => {
      fetchPayment();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [paymentId]);

   const renderStatusBadge = (status: PaymentStatus) => {
      let bg = "bg-gray-100";
      let color = "text-gray-800";
      let label = status;

      switch (status) {
         case "completed":
         case "successful":
            bg = "bg-green-100";
            color = "text-green-800";
            label = "Successful";
            break;
         case "failed":
         case "cancelled":
         case "timeout":
            bg = "bg-red-100";
            color = "text-red-800";
            label = status === "timeout" ? "Timeout" : "Failed";
            break;
         case "pending":
            bg = "bg-orange-100";
            color = "text-orange-800";
            label = "Pending";
            break;
      }

      return (
         <View
            className={`px-2 py-1 rounded-full ${bg}`}
            style={{ alignSelf: "flex-start" }}
         >
            <Text className={`text-xs font-semibold ${color}`}>{label}</Text>
         </View>
      );
   };

   const renderStatusIcon = (status: PaymentStatus) => {
      switch (status) {
         case "completed":
         case "successful":
            return (
               <CheckCircle2
                  size={42}
                  color={Colors.success}
               />
            );
         case "failed":
         case "cancelled":
         case "timeout":
            return (
               <AlertCircle
                  size={42}
                  color={Colors.error}
               />
            );
         case "pending":
         default:
            return (
               <Clock
                  size={42}
                  color={Colors.secondary}
               />
            );
      }
   };

   if (loading) {
      return (
         <View className="flex-1 bg-gray-50 items-center justify-center">
            <ActivityIndicator
               size="large"
               color={Colors.primary}
            />
            <Text className="mt-3 text-gray-600 text-sm">
               Loading payment details...
            </Text>
         </View>
      );
   }

   if (error || !payment) {
      return (
         <View className="flex-1 bg-gray-50 items-center justify-center px-6">
            <AlertCircle
               size={42}
               color={Colors.error}
            />
            <Text className="mt-3 text-red-700 font-semibold text-base text-center">
               Payment Error
            </Text>
            <Text className="mt-2 text-gray-700 text-sm text-center">
               {error || "Payment not found. Please check your link or try again."}
            </Text>
            <TouchableOpacity
               onPress={() => router.back()}
               className="mt-6 px-6 py-3 rounded-lg bg-gray-800"
            >
               <Text className="text-white font-semibold text-sm">
                  Go Back
               </Text>
            </TouchableOpacity>
         </View>
      );
   }

   return (
      <View className="flex-1 bg-gray-50">
         <View className="px-4 pt-10 pb-4 bg-white border-b border-gray-200">
            <Text className="text-xs text-gray-500 mb-1">
               Payment Reference
            </Text>
            <Text className="text-sm font-mono font-semibold text-gray-900">
               {payment.reference}
            </Text>
         </View>

         <ScrollView className="flex-1 px-4 py-4">
            <View className="bg-white rounded-xl shadow-sm p-4 mb-4 items-center">
               {renderStatusIcon(payment.status)}
               <Text className="mt-3 text-lg font-semibold text-gray-900">
                  {payment.status === "completed" ||
                  payment.status === "successful"
                     ? "Payment Successful"
                     : payment.status === "pending"
                     ? "Processing Payment"
                     : payment.status === "timeout"
                     ? "Payment Timeout"
                     : "Payment Status"}
               </Text>
               <View className="mt-2">{renderStatusBadge(payment.status)}</View>
               <Text className="mt-3 text-xs text-gray-600 text-center">
                  {payment.status === "completed" ||
                  payment.status === "successful"
                     ? "Your payment has been processed successfully."
                     : payment.status === "pending"
                     ? "We are still waiting for confirmation from your payment provider."
                     : payment.status === "timeout"
                     ? "Payment took too long to process. You can try again with a different method."
                     : payment.failure_reason ||
                       "There was a problem with your payment."}
               </Text>
            </View>

            <View className="bg-white rounded-xl shadow-sm p-4 space-y-3 mb-4">
               <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-500">Amount</Text>
                  <Text className="text-base font-semibold text-gray-900">
                     {payment.amount.toLocaleString()} {payment.currency}
                  </Text>
               </View>
               <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-500">Customer</Text>
                  <Text className="text-xs font-medium text-gray-900">
                     {payment.customer_name}
                  </Text>
               </View>
               <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-500">Phone</Text>
                  <Text className="text-xs font-medium text-gray-900">
                     {payment.customer_phone}
                  </Text>
               </View>
               {payment.kpay_transaction_id && (
                  <View className="flex-row justify-between">
                     <Text className="text-xs text-gray-500">Transaction ID</Text>
                     <Text className="text-[11px] font-mono text-gray-800 max-w-[65%] text-right">
                        {payment.kpay_transaction_id}
                     </Text>
                  </View>
               )}
            </View>

            {/* Refresh / Navigate actions */}
            <View className="bg-white rounded-xl shadow-sm p-4 space-y-3 mb-6">
               <TouchableOpacity
                  onPress={refreshStatus}
                  disabled={isCheckingStatus || updating}
                  className={`flex-row items-center justify-center rounded-lg py-3 ${
                     isCheckingStatus || updating
                        ? "bg-gray-300"
                        : "bg-orange-500"
                  }`}
               >
                  {isCheckingStatus || updating ? (
                     <ActivityIndicator
                        color="#ffffff"
                        className="mr-2"
                     />
                  ) : (
                     <RefreshCcw
                        size={18}
                        color="#ffffff"
                        className="mr-2"
                     />
                  )}
                  <Text className="text-white font-semibold text-sm">
                     {payment.status === "pending"
                        ? "Refresh Payment Status"
                        : "Check Again"}
                  </Text>
               </TouchableOpacity>

               {payment.order_id && (
                  <TouchableOpacity
                     onPress={() =>
                        router.push(`/orders/${payment.order_id}` as any)
                     }
                     className="flex-row items-center justify-center rounded-lg py-3 border border-gray-300 bg-gray-50"
                  >
                     <Text className="text-gray-800 font-semibold text-sm">
                        View Order
                     </Text>
                  </TouchableOpacity>
               )}

               {!payment.order_id &&
                  (payment.status === "completed" ||
                     payment.status === "successful") && (
                     <Text className="text-[11px] text-gray-500 text-center mt-1">
                        Payment is complete but no order is linked yet. The
                        system will link or create your order shortly. You can
                        also check your orders from the Orders tab.
                     </Text>
                  )}
            </View>
         </ScrollView>
      </View>
   );
}


