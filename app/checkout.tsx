import { useApp } from "@/contexts/AppContext";
import { useOrders } from "@/hooks/useOrders";
import useProfile from "@/hooks/useProfile";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
   ActivityIndicator,
   ScrollView,
   Text,
   TextInput,
   TouchableOpacity,
   View,
} from "react-native";

import { AddressSelector } from "@/components/ui/AddressSelector";
import PaymentMethodSelector from "@/components/ui/PaymentMethodSelector";
import { useAddresses } from "@/hooks/useAddresses";
import { useKPayPayment } from "@/hooks/useKPayPayment";
import { PAYMENT_METHODS } from "@/lib/services/kpay";
import { Address } from "@/types/addresses";
import toast from "@/utils/toast";
import {
   CheckCircle2,
   ChevronDown,
   ChevronUp,
   Package,
   ShoppingCart,
} from "lucide-react-native";
import { Linking } from "react-native";

interface CartItem {
   id: string;
   name: string;
   price: number;
   quantity: number;
   sku?: string;
   variation_id?: string;
   variation_name?: string;
}

const CheckoutScreen = ({
   isRetryMode = false,
   retryOrderId = null,
}: {
   isRetryMode?: boolean;
   retryOrderId?: string | null;
}) => {
   const router = useRouter();
   const user = useAuthStore((s) => s.user);
   const isLoggedIn = Boolean(user);
   const { cart: cartItems, clearCart } = useApp();
   const { createOrder } = useOrders();
   const { addresses, selected: defaultAddress } = useAddresses();

   // Selected address for delivery
   const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

   const [formData, setFormData] = useState({
      delivery_notes: "",
   });

   const [orderItems, setOrderItems] = useState<CartItem[]>([]);
   const [errors, setErrors] = useState<any>({});
   const [isSubmitting, setIsSubmitting] = useState(false);

   // Section states
   const [instructionsOpen, setInstructionsOpen] = useState(false);

   // Payment - default to Cash on Delivery for now
   const [paymentMethod, setPaymentMethod] = useState<
      keyof typeof PAYMENT_METHODS | "cash_on_delivery" | ""
   >("cash_on_delivery");
   const [mobileMoneyPhones, setMobileMoneyPhones] = useState<{
      mtn_momo?: string;
      airtel_money?: string;
   }>({});
   const [paymentInProgress, setPaymentInProgress] = useState(false);

   // KPay payment functionality
   const {
      initiatePayment,
      formatPhoneNumber,
      validatePaymentRequest,
      isInitiating,
   } = useKPayPayment();

   // Calculate totals
   const subtotal = orderItems.reduce(
      (sum, item) =>
         sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
      0
   );

   const transport = 2000; // Fixed delivery fee for simplicity
   const total = subtotal + transport;

   // Set default address when addresses are loaded
   useEffect(() => {
      if (defaultAddress && !selectedAddress) {
         setSelectedAddress(defaultAddress);
      }
   }, [defaultAddress]);

   // Sync cart items
   useEffect(() => {
      if (Array.isArray(cartItems)) {
         // Support both `useApp().cart` shape ({ product, quantity }) and
         // old cart item shapes used elsewhere in the app
         const cleaned = cartItems.map((item: any) => {
            if (item.product) {
               return {
                  id: item.product.id,
                  name: item.product.name,
                  price: item.product.discountPrice || item.product.price || 0,
                  quantity: item.quantity || 1,
                  sku: item.product.sku || undefined,
                  variation_id:
                     item.product_variation_id ||
                     item.variation_id ||
                     undefined,
                  variation_name: item.variation_name || undefined,
               } as CartItem;
            }

            return {
               ...item,
               id:
                  typeof item.id === "string"
                     ? item.id.replace(/-$/, "")
                     : item.id,
               variation_id:
                  typeof item.product_variation_id === "string"
                     ? item.product_variation_id.replace(/-$/, "")
                     : item.variation_id || item.product_variation_id,
            } as CartItem;
         });
         setOrderItems(cleaned);
      }
   }, [cartItems]);

   // Prefer profile row (from `profiles` table) for the user's full name
   // then fall back to auth `user.user_metadata.full_name` and finally
   // to an empty string. This ensures checkout shows the same name as
   // the profile page when available.
   const { profile } = useProfile();

   const getCustomerInfo = () => {
      if (!user && !profile) return { email: "", firstName: "", lastName: "" };

      const fullName =
         profile?.full_name ?? user?.user_metadata?.full_name ?? "";
      const nameParts = fullName.split(" ").filter(Boolean);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      return {
         email: user?.email || "",
         firstName,
         lastName,
      };
   };

   const customerInfo = getCustomerInfo();

   const validateForm = () => {
      const formErrors: any = {};
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

      if (!customerInfo.email || !emailPattern.test(customerInfo.email)) {
         formErrors.email = "Please ensure your email is valid";
      }

      if (!selectedAddress) {
         formErrors.address = "Please select a delivery address";
      }

      // Phone is optional if address has one, otherwise validate
      if (!selectedAddress?.phone) {
         formErrors.phone = "Please ensure your address has a phone number";
      }

      return formErrors;
   };

   // Get address display text
   const getAddressDisplayText = (address: Address) => {
      const parts = [
         address.house_number,
         address.street || address.street_address,
         address.city,
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(", ") : address.display_name || "";
   };

   const handleCreateOrder = async () => {
      if (isSubmitting) return;

      const formErrors = validateForm();
      if (Object.keys(formErrors).length > 0) {
         setErrors(formErrors);
         toast.error("Please fix the errors and try again");
         return;
      }

      if (!isLoggedIn) {
         toast.error("Please login to place order");
         router.push("/signin");
         return;
      }

      if (orderItems.length === 0) {
         toast.error("Your cart is empty");
         return;
      }

      setIsSubmitting(true);
      setErrors({});

      if (!selectedAddress) {
         toast.error("Please select a delivery address");
         return;
      }

      try {
         const deliveryAddress = getAddressDisplayText(selectedAddress);
         const deliveryCity = selectedAddress.city || "";

         const orderData = {
            order: {
               user_id: user!.id,
               subtotal: subtotal,
               tax: transport,
               total: total,
               customer_email: customerInfo.email.trim(),
               customer_first_name: customerInfo.firstName.trim(),
               customer_last_name: customerInfo.lastName.trim(),
               customer_phone: selectedAddress.phone || "",
               delivery_address: deliveryAddress,
               delivery_city: deliveryCity,
               status: "pending" as const,
               payment_method: paymentMethod || "cash_on_delivery",
               delivery_notes: formData.delivery_notes.trim() || undefined,
            },
            items: orderItems.map((item) => ({
               product_id: item.id,
               product_variation_id: item.variation_id || undefined,
               product_name: item.name,
               product_sku: item.sku || undefined,
               variation_name: item.variation_name || undefined,
               price: item.price,
               quantity: item.quantity,
               total: item.price * item.quantity,
            })),
         };

         // For cash on delivery - create order immediately
         if (paymentMethod === "cash_on_delivery" || !paymentMethod) {
            createOrder.mutate(orderData, {
               onSuccess: (createdOrder: any) => {
                  clearCart();
                  setOrderItems([]);
                  toast.success(
                     `Order #${createdOrder.order_number} created successfully!`
                  );
                  router.push("/orders");
               },
               onError: (error: any) => {
                  toast.error(
                     `Failed to create order: ${error?.message || "Unknown error"}`
                  );
               },
               onSettled: () => {
                  setIsSubmitting(false);
               },
            });
         } else {
            // For other payment methods - initiate payment first
            try {
               setPaymentInProgress(true);

               const customerPhone =
                  paymentMethod === "mtn_momo" ||
                  paymentMethod === "airtel_money"
                     ? mobileMoneyPhones[paymentMethod] ||
                       formatPhoneNumber(selectedAddress?.phone || "")
                     : formatPhoneNumber(selectedAddress?.phone || "");

               const customerFullName =
                  `${customerInfo.firstName} ${customerInfo.lastName}`.trim();

               const cartSnapshot = orderItems.map((it) => ({
                  product_id: it.id,
                  name: it.name,
                  price: it.price,
                  quantity: it.quantity,
                  sku: it.sku,
                  variation_id: it.variation_id,
                  variation_name: it.variation_name,
               }));

               // Get redirect URL for mobile app
               const apiUrl =
                  process.env.EXPO_PUBLIC_API_URL ||
                  process.env.EXPO_PUBLIC_SITE_URL ||
                  "";
               const redirectUrl = `${apiUrl}/checkout?payment=success`;

               const paymentRequest = {
                  amount: total,
                  customerName: customerFullName,
                  customerEmail: customerInfo.email,
                  customerPhone,
                  paymentMethod: paymentMethod as keyof typeof PAYMENT_METHODS,
                  redirectUrl,
                  cart: cartSnapshot,
               };

               const validationErrors = validatePaymentRequest(paymentRequest);
               if (validationErrors.length > 0) {
                  setPaymentInProgress(false);
                  setIsSubmitting(false);
                  toast.error(
                     `Payment validation failed: ${validationErrors[0]}`
                  );
                  return;
               }

               const paymentResult = await initiatePayment(paymentRequest);

               if (paymentResult.success && paymentResult.checkoutUrl) {
                  toast.success("Redirecting to payment gateway...");

                  // For mobile, open payment URL in external browser
                  const canOpen = await Linking.canOpenURL(
                     paymentResult.checkoutUrl
                  );
                  if (canOpen) {
                     await Linking.openURL(paymentResult.checkoutUrl);
                     // Navigate to payment status page if paymentId is available
                     if (paymentResult.paymentId) {
                        router.push(`/payment/${paymentResult.paymentId}`);
                     }
                  } else {
                     toast.error(
                        "Unable to open payment gateway. Please try again."
                     );
                     setPaymentInProgress(false);
                     setIsSubmitting(false);
                  }
               } else {
                  setPaymentInProgress(false);
                  setIsSubmitting(false);
                  toast.error(
                     `Payment initiation failed: ${
                        paymentResult.error || "Unknown error"
                     }`
                  );
               }
            } catch (err) {
               console.error("Payment initiation failed:", err);
               setPaymentInProgress(false);
               setIsSubmitting(false);
               toast.error("Failed to start payment. Please try again.");
            }
         }
      } catch (error: any) {
         console.error("Order creation failed:", error);
         toast.error(
            `Failed to create order: ${error?.message || "Unknown error"}`
         );
         setIsSubmitting(false);
      }
   };

   // Show empty cart message
   if (orderItems.length === 0 && !isRetryMode) {
      return (
         <View className="flex-1 items-center justify-center px-4">
            <ShoppingCart
               className="text-gray-400 mb-4"
               size={64}
            />
            <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
               Your cart is empty
            </Text>
            <Text className="text-gray-600 text-center mb-8">
               Add some items to your cart before checking out
            </Text>
            <TouchableOpacity
               onPress={() => router.push("/")}
               className="bg-orange-500 px-6 py-3 rounded-lg"
            >
               <Text className="text-white font-semibold">
                  Continue Shopping
               </Text>
            </TouchableOpacity>
         </View>
      );
   }

   return (
      <ScrollView className="flex-1 bg-gray-50">
         <View className="container mx-auto px-4 py-6">
            {/* Header */}
            <Text className="text-3xl font-bold text-gray-900 mb-6">
               {isRetryMode ? "Retry Payment" : "Checkout"}
            </Text>

            {isRetryMode && (
               <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <View className="flex-row items-center">
                     <Text className="text-blue-900 font-medium">
                        Retry Payment
                     </Text>
                  </View>
                  <Text className="text-blue-700 text-sm mt-1">
                     Previous payment failed. Choose a different payment method
                     below.
                  </Text>
               </View>
            )}

            <View className="space-y-6">
               {/* Customer Info Section */}
               <View className="bg-white rounded-lg p-4 shadow-sm">
                  <View className="mb-4">
                     <Text className="text-sm font-medium text-gray-700 mb-2">
                        Email
                     </Text>
                     <Text className="text-base text-gray-900">
                        {customerInfo.email || "Not set"}
                     </Text>
                  </View>
                  <View className="flex-row space-x-3">
                     <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                           First Name
                        </Text>
                        <Text className="text-base text-gray-900">
                           {customerInfo.firstName || "Not set"}
                        </Text>
                     </View>
                     <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                           Last Name
                        </Text>
                        <Text className="text-base text-gray-900">
                           {customerInfo.lastName || "Not set"}
                        </Text>
                     </View>
                  </View>
                  {errors.email && (
                     <Text className="text-red-500 text-xs mt-2">
                        {errors.email}
                     </Text>
                  )}
               </View>

               {/* Delivery Address Section */}
               <View className="bg-white rounded-lg p-4 shadow-sm">
                  <Text className="text-lg font-medium text-gray-900 mb-4">
                     Delivery Address
                  </Text>
                  {errors.address && (
                     <Text className="text-red-500 text-xs mb-2">
                        {errors.address}
                     </Text>
                  )}
                  <AddressSelector
                     selectedAddress={selectedAddress}
                     onSelectAddress={setSelectedAddress}
                     showAddButton={true}
                  />
               </View>

               {/* Delivery Instructions */}
               <View className="bg-white rounded-lg p-4 shadow-sm">
                  <TouchableOpacity
                     onPress={() => setInstructionsOpen(!instructionsOpen)}
                     className="flex-row items-center justify-between"
                  >
                     <View className="flex-row items-center space-x-3">
                        <Package
                           className="text-orange-600"
                           size={20}
                        />
                        <Text className="text-lg font-medium text-gray-900">
                           Delivery Instructions
                        </Text>
                     </View>
                     {instructionsOpen ? (
                        <ChevronUp size={20} />
                     ) : (
                        <ChevronDown size={20} />
                     )}
                  </TouchableOpacity>

                  {instructionsOpen && (
                     <View className="mt-4">
                        <TextInput
                           value={formData.delivery_notes}
                           onChangeText={(text) =>
                              setFormData((prev) => ({
                                 ...prev,
                                 delivery_notes: text,
                              }))
                           }
                           placeholder="Any special delivery instructions..."
                           multiline
                           numberOfLines={3}
                           className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                     </View>
                  )}
               </View>

               {/* Payment Method */}
               <PaymentMethodSelector
                  selectedMethod={paymentMethod || "cash_on_delivery"}
                  onMethodChange={(method) => setPaymentMethod(method)}
                  disabled={isSubmitting || paymentInProgress}
                  onMobileMoneyPhoneChange={(method, phoneNumber) => {
                     setMobileMoneyPhones((prev) => ({
                        ...prev,
                        [method]: phoneNumber,
                     }));
                  }}
                  mobileMoneyPhones={mobileMoneyPhones}
               />

               {/* Order Summary */}
               <View className="bg-white rounded-lg p-4 shadow-sm">
                  <Text className="text-lg font-medium text-gray-900 mb-4">
                     Order Summary
                  </Text>

                  {/* Order Items */}
                  <ScrollView className="max-h-60 mb-4">
                     {orderItems.map((item, index) => (
                        <View
                           key={`${item.id}-${index}`}
                           className="border-b border-gray-100 pb-3 mb-3"
                        >
                           <View className="flex-row items-start space-x-3">
                              <View className="w-12 h-12 bg-orange-100 rounded flex items-center justify-center">
                                 <Package
                                    className="text-orange-600"
                                    size={16}
                                 />
                              </View>
                              <View className="flex-1">
                                 <Text className="font-medium text-gray-900 text-sm">
                                    {item.name}
                                 </Text>
                                 {item.variation_name && (
                                    <Text className="text-gray-500 text-xs mt-1">
                                       Size: {item.variation_name}
                                    </Text>
                                 )}
                                 <View className="flex-row justify-between items-center mt-2">
                                    <Text className="text-gray-900 font-medium text-sm">
                                       RWF {item.price.toLocaleString()}
                                    </Text>
                                    <View className="flex-row items-center space-x-2">
                                       <Text className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">
                                          Qty: {item.quantity}
                                       </Text>
                                       <Text className="text-orange-600 font-medium text-sm">
                                          RWF{" "}
                                          {(
                                             item.price * item.quantity
                                          ).toLocaleString()}
                                       </Text>
                                    </View>
                                 </View>
                              </View>
                           </View>
                        </View>
                     ))}
                  </ScrollView>

                  {/* Totals */}
                  <View className="space-y-2 border-t border-gray-200 pt-4">
                     <View className="flex-row justify-between">
                        <Text className="text-gray-600">Subtotal</Text>
                        <Text className="font-medium">
                           RWF {subtotal.toLocaleString()}
                        </Text>
                     </View>
                     <View className="flex-row justify-between">
                        <Text className="text-gray-600">Delivery Fee</Text>
                        <Text className="font-medium text-orange-600">
                           RWF {transport.toLocaleString()}
                        </Text>
                     </View>
                     <View className="flex-row justify-between pt-2 border-t border-gray-200">
                        <Text className="text-lg font-bold text-gray-900">
                           Total
                        </Text>
                        <Text className="text-lg font-bold text-orange-600">
                           RWF {total.toLocaleString()}
                        </Text>
                     </View>
                  </View>

                  {/* Order Button */}
                  <TouchableOpacity
                     onPress={handleCreateOrder}
                     disabled={
                        isSubmitting ||
                        !paymentMethod ||
                        paymentInProgress ||
                        isInitiating
                     }
                     className={`mt-6 rounded-lg py-4 flex-row items-center justify-center ${
                        isSubmitting ||
                        !paymentMethod ||
                        paymentInProgress ||
                        isInitiating
                           ? "bg-gray-400"
                           : "bg-orange-500"
                     }`}
                  >
                     {isSubmitting || paymentInProgress || isInitiating ? (
                        <ActivityIndicator
                           color="white"
                           className="mr-2"
                        />
                     ) : (
                        <CheckCircle2
                           color="white"
                           size={20}
                           className="mr-2"
                        />
                     )}
                     <Text className="text-white font-semibold text-lg">
                        {isSubmitting
                           ? "Processing..."
                           : paymentInProgress || isInitiating
                             ? "Starting Payment..."
                             : "Place Order"}
                     </Text>
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </ScrollView>
   );
};

export default CheckoutScreen;
