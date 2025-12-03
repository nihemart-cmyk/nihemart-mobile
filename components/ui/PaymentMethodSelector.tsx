import React, { useState } from "react";
import {
   View,
   Text,
   TouchableOpacity,
   ScrollView,
   Modal,
   TextInput,
   Alert,
} from "react-native";
import { PAYMENT_METHODS } from "@/lib/services/kpay";
import {
   CreditCard,
   Smartphone,
   Wallet,
   Banknote,
   CheckCircle2,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import MobileMoneyPhoneDialog from "./MobileMoneyPhoneDialog";

export interface PaymentMethodSelectorProps {
   selectedMethod: keyof typeof PAYMENT_METHODS | "cash_on_delivery";
   onMethodChange: (
      method: keyof typeof PAYMENT_METHODS | "cash_on_delivery"
   ) => void;
   disabled?: boolean;
   onMobileMoneyPhoneChange?: (
      method: "mtn_momo" | "airtel_money",
      phoneNumber: string
   ) => void;
   mobileMoneyPhones?: {
      mtn_momo?: string;
      airtel_money?: string;
   };
}

const PaymentMethodIcon = ({
   method,
}: {
   method: keyof typeof PAYMENT_METHODS | "cash_on_delivery";
}) => {
   switch (method) {
      case "mtn_momo":
      case "airtel_money":
         return (
            <Smartphone
               size={20}
               color={Colors.primary}
            />
         );
      case "visa_card":
      case "mastercard":
         return (
            <CreditCard
               size={20}
               color={Colors.success}
            />
         );
      case "spenn":
         return (
            <Wallet
               size={20}
               color={Colors.primary}
            />
         );
      case "cash_on_delivery":
         return (
            <Banknote
               size={20}
               color={Colors.secondary}
            />
         );
      default:
         return (
            <CheckCircle2
               size={20}
               color={Colors.textSecondary}
            />
         );
   }
};

const getPaymentMethodDetails = (
   method: keyof typeof PAYMENT_METHODS | "cash_on_delivery"
) => {
   if (method === "cash_on_delivery") {
      return {
         name: "Cash on Delivery",
         description: "Pay with cash when your order is delivered",
         badge: "Traditional",
      };
   }

   const paymentMethod = PAYMENT_METHODS[method];
   if (!paymentMethod) {
      return {
         name: "Unknown",
         description: "",
         badge: "",
      };
   }

   const details: Record<string, { description: string; badge: string }> = {
      mtn_momo: {
         description: "Pay using your MTN Mobile Money wallet",
         badge: "Popular",
      },
      airtel_money: {
         description: "Pay using your Airtel Money wallet",
         badge: "Mobile",
      },
      visa_card: {
         description: "Pay securely with your Visa card",
         badge: "Secure",
      },
      mastercard: {
         description: "Pay securely with your MasterCard",
         badge: "Secure",
      },
      spenn: {
         description: "Pay using your SPENN digital wallet",
         badge: "Digital",
      },
   };

   return {
      name: paymentMethod.name,
      description: details[method]?.description || "",
      badge: details[method]?.badge || "",
   };
};

export default function PaymentMethodSelector({
   selectedMethod,
   onMethodChange,
   disabled = false,
   onMobileMoneyPhoneChange,
   mobileMoneyPhones = {},
}: PaymentMethodSelectorProps) {
   const [mobileMoneyDialog, setMobileMoneyDialog] = useState<{
      isOpen: boolean;
      method: "mtn_momo" | "airtel_money" | null;
   }>({ isOpen: false, method: null });

   // Payment options - match web implementation
   const paymentOptions: (keyof typeof PAYMENT_METHODS | "cash_on_delivery")[] =
      [
         "mtn_momo",
         "airtel_money",
         "visa_card",
         "mastercard",
         // 'spenn', // Temporarily disabled - not supported by KPay (error 609)
         "cash_on_delivery",
      ];

   const handleMethodChange = (
      method: keyof typeof PAYMENT_METHODS | "cash_on_delivery"
   ) => {
      if (disabled) return;

      // Handle Mobile Money methods
      if (
         (method === "mtn_momo" || method === "airtel_money") &&
         onMobileMoneyPhoneChange
      ) {
         if (!mobileMoneyPhones[method]) {
            setMobileMoneyDialog({ isOpen: true, method });
            return;
         }
      }

      onMethodChange(method);
   };

   const handleMobileMoneyPhoneConfirm = (phoneNumber: string) => {
      const { method } = mobileMoneyDialog;
      if (method && onMobileMoneyPhoneChange) {
         onMobileMoneyPhoneChange(method, phoneNumber);
         onMethodChange(method);
      }
   };

   const handleMobileMoneyDialogClose = () => {
      setMobileMoneyDialog({ isOpen: false, method: null });
   };

   return (
      <View>
         <View className="bg-white rounded-lg p-4 shadow-sm">
            <View className="flex-row items-center mb-4">
               <CreditCard
                  size={20}
                  color={Colors.secondary}
                  className="mr-2"
               />
               <Text className="text-lg font-medium text-gray-900">
                  Payment Method
               </Text>
            </View>

            <View className="space-y-3">
               {paymentOptions.map((method) => {
                  const details = getPaymentMethodDetails(method);
                  const isSelected = selectedMethod === method;

                  return (
                     <TouchableOpacity
                        key={method}
                        onPress={() => handleMethodChange(method)}
                        disabled={disabled}
                        className={`flex-row items-center p-4 border-2 rounded-lg ${
                           isSelected
                              ? "border-primary bg-orange-50"
                              : "border-gray-200 bg-white"
                        } ${disabled ? "opacity-50" : ""}`}
                     >
                        <View
                           className={`w-5 h-5 rounded-full border-2 mr-3 ${
                              isSelected
                                 ? "bg-primary border-primary"
                                 : "border-gray-300"
                           }`}
                        />
                        <PaymentMethodIcon method={method} />
                        <View className="flex-1 ml-3">
                           <View className="flex-row items-center mb-1">
                              <Text className="font-medium text-gray-900">
                                 {details.name}
                              </Text>
                              {details.badge && (
                                 <View className="bg-gray-100 px-2 py-1 rounded-lg ml-2">
                                    <Text className="text-xs text-gray-700 font-medium">
                                       {details.badge}
                                    </Text>
                                 </View>
                              )}
                           </View>
                           <Text className="text-sm text-gray-600">
                              {details.description}
                           </Text>
                           {/* Show payment details for different methods */}
                           {(method === "mtn_momo" ||
                              method === "airtel_money") &&
                              mobileMoneyPhones[method] && (
                                 <Text className="text-xs text-primary font-mono mt-1">
                                    📱 {mobileMoneyPhones[method]}
                                 </Text>
                              )}
                        </View>
                        {isSelected && (
                           <CheckCircle2
                              size={20}
                              color={Colors.secondary}
                           />
                        )}
                     </TouchableOpacity>
                  );
               })}
            </View>

            {/* Payment Security Notice */}
            <View className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
               <View className="flex-row items-start">
                  <CheckCircle2
                     size={16}
                     color={Colors.primary}
                     className="mr-2 mt-0.5"
                  />
                  <View className="flex-1">
                     <Text className="font-medium text-blue-900 mb-1">
                        Secure Payment
                     </Text>
                     <Text className="text-xs text-blue-800 leading-relaxed">
                        All online payments are processed securely using
                        industry-standard encryption. Your payment information
                        is never stored on our servers.
                     </Text>
                  </View>
               </View>
            </View>
         </View>

         {/* Mobile Money Phone Dialog */}
         {mobileMoneyDialog.method && (
            <MobileMoneyPhoneDialog
               isOpen={mobileMoneyDialog.isOpen}
               onOpenChange={(open) => {
                  if (!open) handleMobileMoneyDialogClose();
               }}
               paymentMethod={mobileMoneyDialog.method}
               onConfirm={handleMobileMoneyPhoneConfirm}
               initialPhone={mobileMoneyPhones[mobileMoneyDialog.method] || ""}
            />
         )}
      </View>
   );
}
