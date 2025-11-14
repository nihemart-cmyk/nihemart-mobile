import { useApp } from "@/contexts/AppContext";
import { useOrders } from "@/hooks/useOrders";
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

import toast from "@/utils/toast";
import {
   CheckCircle2,
   ChevronDown,
   ChevronUp,
   CreditCard,
   MapPin,
   Package,
   ShoppingCart,
} from "lucide-react-native";

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

   const [formData, setFormData] = useState({
      email: "",
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      phone: "",
      delivery_notes: "",
   });

   const [orderItems, setOrderItems] = useState<CartItem[]>([]);
   const [errors, setErrors] = useState<any>({});
   const [isSubmitting, setIsSubmitting] = useState(false);

   // Section states
   const [addressOpen, setAddressOpen] = useState(false);
   const [addNewOpen, setAddNewOpen] = useState(false);
   const [instructionsOpen, setInstructionsOpen] = useState(false);
   const [paymentOpen, setPaymentOpen] = useState(false);

   // Payment - default to Cash on Delivery for now
   const [paymentMethod, setPaymentMethod] = useState<
      "cash_on_delivery" | "mtn_momo" | "airtel_money" | ""
   >("cash_on_delivery");
   const [mobileMoneyPhones, setMobileMoneyPhones] = useState({
      mtn_momo: "",
      airtel_money: "",
   });

   // Location data
   const [provinces, setProvinces] = useState<any[]>([]);
   const [districts, setDistricts] = useState<any[]>([]);
   const [sectors, setSectors] = useState<any[]>([]);

   const [selectedProvince, setSelectedProvince] = useState<string | null>(
      null
   );
   const [selectedDistrict, setSelectedDistrict] = useState<string | null>(
      null
   );
   const [selectedSector, setSelectedSector] = useState<string | null>(null);

   const [houseNumber, setHouseNumber] = useState("");
   const [phoneInput, setPhoneInput] = useState("");

   // Calculate totals
   const subtotal = orderItems.reduce(
      (sum, item) =>
         sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
      0
   );

   const transport = 2000; // Fixed delivery fee for simplicity
   const total = subtotal + transport;

   // Load location data (you'll need to adapt your JSON imports for React Native)
   useEffect(() => {
      // You can load your location data here from local JSON files
      // For now, we'll use empty arrays
      setProvinces([]);
      setDistricts([]);
      setSectors([]);
   }, []);

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

   // Pre-fill user data
   useEffect(() => {
      if (user && !isRetryMode) {
         setFormData((prev) => ({
            ...prev,
            email: user.email || "",
            firstName: user.user_metadata?.full_name?.split(" ")[0] || "",
            lastName:
               user.user_metadata?.full_name?.split(" ").slice(1).join(" ") ||
               "",
         }));
      }
   }, [user, isRetryMode]);

   // Phone formatting
   const formatPhoneInput = (input: string) => {
      const cleaned = input.replace(/[^\d+]/g, "");

      if (cleaned.startsWith("+250")) {
         const digits = cleaned.slice(4);
         if (digits.length <= 3) return `+250 ${digits}`;
         if (digits.length <= 6)
            return `+250 ${digits.slice(0, 3)} ${digits.slice(3)}`;
         return `+250 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
      }

      if (cleaned.startsWith("07")) {
         const digits = cleaned;
         if (digits.length <= 3) return digits;
         if (digits.length <= 6)
            return `${digits.slice(0, 3)} ${digits.slice(3)}`;
         return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
      }

      return cleaned;
   };

   const handlePhoneChange = (text: string) => {
      const formatted = formatPhoneInput(text);

      if (formatted.startsWith("+250")) {
         if (formatted.replace(/[^\d]/g, "").length <= 12) {
            setPhoneInput(formatted);
         }
      } else if (formatted.startsWith("07")) {
         if (formatted.replace(/[^\d]/g, "").length <= 10) {
            setPhoneInput(formatted);
         }
      } else {
         if (text.length <= 15) {
            setPhoneInput(formatted);
         }
      }

      if (errors?.phone) {
         setErrors((prev: any) => ({ ...prev, phone: undefined }));
      }
   };

   const validateForm = () => {
      const formErrors: any = {};
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

      if (!formData.email.trim() || !emailPattern.test(formData.email)) {
         formErrors.email = "Please enter a valid email";
      }

      if (!formData.address.trim()) {
         formErrors.address = "Delivery address is required";
      }

      if (!phoneInput.trim()) {
         formErrors.phone = "Phone number is required";
      }

      return formErrors;
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

      try {
         const orderData = {
            order: {
               user_id: user!.id,
               subtotal: subtotal,
               tax: transport,
               total: total,
               customer_email: formData.email.trim(),
               customer_first_name: formData.firstName.trim(),
               customer_last_name: formData.lastName.trim(),
               customer_phone: phoneInput.trim(),
               delivery_address: formData.address.trim(),
               delivery_city: formData.city.trim(),
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

         // For cash on delivery
         if (paymentMethod === "cash_on_delivery" || !paymentMethod) {
            createOrder.mutate(orderData, {
               onSuccess: (createdOrder: any) => {
                  clearCart();
                  setOrderItems([]);
                  toast.success(
                     `Order #${createdOrder.order_number} created successfully!`
                  );
                  // Redirect user to orders list (order detail page not implemented)
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
            // Handle mobile money payments
            // You'll need to implement your payment gateway integration here
            toast.error("Mobile money payment integration not implemented");
            setIsSubmitting(false);
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
               {/* Delivery Address Section */}
               <View className="bg-white rounded-lg p-4 shadow-sm">
                  <TouchableOpacity
                     onPress={() => setAddressOpen(!addressOpen)}
                     className="flex-row items-center justify-between"
                  >
                     <View className="flex-row items-center space-x-3">
                        <MapPin
                           className="text-orange-600"
                           size={20}
                        />
                        <Text className="text-lg font-medium text-gray-900">
                           Delivery Address
                        </Text>
                     </View>
                     {addressOpen ? (
                        <ChevronUp size={20} />
                     ) : (
                        <ChevronDown size={20} />
                     )}
                  </TouchableOpacity>

                  {addressOpen && (
                     <View className="mt-4 space-y-4">
                        <View>
                           <Text className="text-sm font-medium text-gray-700 mb-2">
                              Email *
                           </Text>
                           <TextInput
                              value={formData.email}
                              onChangeText={(text) =>
                                 setFormData((prev) => ({
                                    ...prev,
                                    email: text,
                                 }))
                              }
                              placeholder="your@email.com"
                              className={`border rounded-lg px-3 py-2 ${errors.email ? "border-red-500" : "border-gray-300"}`}
                              keyboardType="email-address"
                              autoCapitalize="none"
                           />
                           {errors.email && (
                              <Text className="text-red-500 text-xs mt-1">
                                 {errors.email}
                              </Text>
                           )}
                        </View>

                        <View className="flex-row space-x-3">
                           <View className="flex-1">
                              <Text className="text-sm font-medium text-gray-700 mb-2">
                                 First Name
                              </Text>
                              <TextInput
                                 value={formData.firstName}
                                 onChangeText={(text) =>
                                    setFormData((prev) => ({
                                       ...prev,
                                       firstName: text,
                                    }))
                                 }
                                 placeholder="First name"
                                 className="border border-gray-300 rounded-lg px-3 py-2"
                              />
                           </View>
                           <View className="flex-1">
                              <Text className="text-sm font-medium text-gray-700 mb-2">
                                 Last Name
                              </Text>
                              <TextInput
                                 value={formData.lastName}
                                 onChangeText={(text) =>
                                    setFormData((prev) => ({
                                       ...prev,
                                       lastName: text,
                                    }))
                                 }
                                 placeholder="Last name"
                                 className="border border-gray-300 rounded-lg px-3 py-2"
                              />
                           </View>
                        </View>

                        <View>
                           <Text className="text-sm font-medium text-gray-700 mb-2">
                              Address *
                           </Text>
                           <TextInput
                              value={formData.address}
                              onChangeText={(text) =>
                                 setFormData((prev) => ({
                                    ...prev,
                                    address: text,
                                 }))
                              }
                              placeholder="Street address"
                              className={`border rounded-lg px-3 py-2 ${errors.address ? "border-red-500" : "border-gray-300"}`}
                           />
                           {errors.address && (
                              <Text className="text-red-500 text-xs mt-1">
                                 {errors.address}
                              </Text>
                           )}
                        </View>

                        <View>
                           <Text className="text-sm font-medium text-gray-700 mb-2">
                              City
                           </Text>
                           <TextInput
                              value={formData.city}
                              onChangeText={(text) =>
                                 setFormData((prev) => ({
                                    ...prev,
                                    city: text,
                                 }))
                              }
                              placeholder="City"
                              className="border border-gray-300 rounded-lg px-3 py-2"
                           />
                        </View>

                        <View>
                           <Text className="text-sm font-medium text-gray-700 mb-2">
                              Phone Number *
                           </Text>
                           <TextInput
                              value={phoneInput}
                              onChangeText={handlePhoneChange}
                              placeholder="+250 XXX XXX XXX or 07X XXX XXX"
                              className={`border rounded-lg px-3 py-2 ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                              keyboardType="phone-pad"
                           />
                           {errors.phone && (
                              <Text className="text-red-500 text-xs mt-1">
                                 {errors.phone}
                              </Text>
                           )}
                        </View>
                     </View>
                  )}
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
               <View className="bg-white rounded-lg p-4 shadow-sm">
                  <TouchableOpacity
                     onPress={() => setPaymentOpen(!paymentOpen)}
                     className="flex-row items-center justify-between"
                  >
                     <View className="flex-row items-center space-x-3">
                        <CreditCard
                           className="text-orange-600"
                           size={20}
                        />
                        <Text className="text-lg font-medium text-gray-900">
                           Payment Method
                        </Text>
                     </View>
                     {paymentOpen ? (
                        <ChevronUp size={20} />
                     ) : (
                        <ChevronDown size={20} />
                     )}
                  </TouchableOpacity>

                  {paymentOpen && (
                     <View className="mt-4 space-y-3">
                        <TouchableOpacity
                           onPress={() => setPaymentMethod("cash_on_delivery")}
                           className={`flex-row items-center p-3 border rounded-lg ${
                              paymentMethod === "cash_on_delivery"
                                 ? "border-orange-500 bg-orange-50"
                                 : "border-gray-300"
                           }`}
                        >
                           <View
                              className={`w-5 h-5 rounded-full border-2 mr-3 ${
                                 paymentMethod === "cash_on_delivery"
                                    ? "bg-orange-500 border-orange-500"
                                    : "border-gray-300"
                              }`}
                           />
                           <Text className="font-medium">Cash on Delivery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                           onPress={() => setPaymentMethod("mtn_momo")}
                           className={`flex-row items-center p-3 border rounded-lg ${
                              paymentMethod === "mtn_momo"
                                 ? "border-orange-500 bg-orange-50"
                                 : "border-gray-300"
                           }`}
                        >
                           <View
                              className={`w-5 h-5 rounded-full border-2 mr-3 ${
                                 paymentMethod === "mtn_momo"
                                    ? "bg-orange-500 border-orange-500"
                                    : "border-gray-300"
                              }`}
                           />
                           <Text className="font-medium">MTN Mobile Money</Text>
                        </TouchableOpacity>

                        {paymentMethod === "mtn_momo" && (
                           <View className="ml-8">
                              <Text className="text-sm font-medium text-gray-700 mb-2">
                                 MTN Phone Number
                              </Text>
                              <TextInput
                                 value={mobileMoneyPhones.mtn_momo}
                                 onChangeText={(text) =>
                                    setMobileMoneyPhones((prev) => ({
                                       ...prev,
                                       mtn_momo: text,
                                    }))
                                 }
                                 placeholder="07X XXX XXX"
                                 className="border border-gray-300 rounded-lg px-3 py-2"
                                 keyboardType="phone-pad"
                              />
                           </View>
                        )}

                        <TouchableOpacity
                           onPress={() => setPaymentMethod("airtel_money")}
                           className={`flex-row items-center p-3 border rounded-lg ${
                              paymentMethod === "airtel_money"
                                 ? "border-orange-500 bg-orange-50"
                                 : "border-gray-300"
                           }`}
                        >
                           <View
                              className={`w-5 h-5 rounded-full border-2 mr-3 ${
                                 paymentMethod === "airtel_money"
                                    ? "bg-orange-500 border-orange-500"
                                    : "border-gray-300"
                              }`}
                           />
                           <Text className="font-medium">Airtel Money</Text>
                        </TouchableOpacity>

                        {paymentMethod === "airtel_money" && (
                           <View className="ml-8">
                              <Text className="text-sm font-medium text-gray-700 mb-2">
                                 Airtel Phone Number
                              </Text>
                              <TextInput
                                 value={mobileMoneyPhones.airtel_money}
                                 onChangeText={(text) =>
                                    setMobileMoneyPhones((prev) => ({
                                       ...prev,
                                       airtel_money: text,
                                    }))
                                 }
                                 placeholder="07X XXX XXX"
                                 className="border border-gray-300 rounded-lg px-3 py-2"
                                 keyboardType="phone-pad"
                              />
                           </View>
                        )}
                     </View>
                  )}
               </View>

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
                     disabled={isSubmitting || !paymentMethod}
                     className={`mt-6 rounded-lg py-4 flex-row items-center justify-center ${
                        isSubmitting || !paymentMethod
                           ? "bg-gray-400"
                           : "bg-orange-500"
                     }`}
                  >
                     {isSubmitting ? (
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
                        {isSubmitting ? "Processing..." : "Place Order"}
                     </Text>
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </ScrollView>
   );
};

export default CheckoutScreen;
