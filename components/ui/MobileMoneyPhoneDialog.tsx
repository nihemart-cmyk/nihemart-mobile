import React, { useState, useEffect } from "react";
import {
   View,
   Text,
   Modal,
   TextInput,
   TouchableOpacity,
   ScrollView,
   Alert,
} from "react-native";
import { PAYMENT_METHODS } from "@/lib/services/kpay";
import { Smartphone, AlertCircle, CheckCircle2, X } from "lucide-react-native";
import Colors from "@/constants/colors";

interface MobileMoneyPhoneDialogProps {
   isOpen: boolean;
   onOpenChange: (open: boolean) => void;
   paymentMethod: "mtn_momo" | "airtel_money";
   onConfirm: (phoneNumber: string) => void;
   initialPhone?: string;
}

export default function MobileMoneyPhoneDialog({
   isOpen,
   onOpenChange,
   paymentMethod,
   onConfirm,
   initialPhone = "",
}: MobileMoneyPhoneDialogProps) {
   const [phoneDisplay, setPhoneDisplay] = useState("");
   const [phoneValue, setPhoneValue] = useState("");
   const [error, setError] = useState("");
   const [isValid, setIsValid] = useState(false);

   useEffect(() => {
      if (isOpen) {
         const formatted = formatPhoneForDisplay(initialPhone);
         setPhoneDisplay(formatted);
         setPhoneValue(initialPhone);
         setError("");
         validatePhone(initialPhone);
      }
   }, [isOpen, initialPhone]);

   const formatPhoneForDisplay = (input: string): string => {
      const cleaned = input.replace(/[^\d]/g, "");

      if (cleaned.startsWith("07")) {
         const digits = cleaned;
         if (digits.length <= 3) return digits;
         if (digits.length <= 6)
            return `${digits.slice(0, 3)} ${digits.slice(3)}`;
         return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
      }

      return cleaned;
   };

   const normalizePhoneValue = (raw: string): string => {
      const digits = raw.replace(/[^\d]/g, "");
      if (digits.startsWith("07") && digits.length <= 10) {
         return digits;
      }
      return digits;
   };

   const validateMobileOperator = (
      phone: string
   ): {
      valid: boolean;
      message?: string;
   } => {
      const cleaned = phone.replace(/[^\d]/g, "");

      if (cleaned.length !== 10) {
         return { valid: false, message: "Phone number must be 10 digits" };
      }

      if (!cleaned.startsWith("07")) {
         return {
            valid: false,
            message: "Phone number must start with 07",
         };
      }

      if (paymentMethod === "mtn_momo") {
         if (/^0(78|77|76|79)/.test(cleaned)) {
            return { valid: true };
         }
         return {
            valid: false,
            message: "Please enter a valid MTN number (078, 077, 076, or 079)",
         };
      } else if (paymentMethod === "airtel_money") {
         if (/^0(73|72|70)/.test(cleaned)) {
            return { valid: true };
         }
         return {
            valid: false,
            message: "Please enter a valid Airtel number (073, 072, or 070)",
         };
      }

      return { valid: false };
   };

   const validatePhone = (phone: string) => {
      const validation = validateMobileOperator(phone);
      setIsValid(validation.valid);
      return validation;
   };

   const handlePhoneChange = (text: string) => {
      const formatted = formatPhoneForDisplay(text);
      const normalized = normalizePhoneValue(text);

      if (normalized.length <= 10) {
         setPhoneDisplay(formatted);
         setPhoneValue(normalized);
         setError("");

         if (normalized.length === 10) {
            const validation = validatePhone(normalized);
            if (!validation.valid && validation.message) {
               setError(validation.message);
            }
         } else {
            setIsValid(false);
         }
      }
   };

   const handleConfirm = () => {
      const trimmedPhone = phoneValue.trim();

      if (!trimmedPhone) {
         setError("Phone number is required");
         return;
      }

      if (trimmedPhone.length !== 10) {
         setError("Please enter a complete 10-digit phone number");
         return;
      }

      const validation = validateMobileOperator(trimmedPhone);
      if (!validation.valid) {
         setError(validation.message || "Invalid phone number");
         return;
      }

      onConfirm(trimmedPhone);
      onOpenChange(false);
   };

   const handleCancel = () => {
      onOpenChange(false);
   };

   const getPaymentMethodInfo = () => {
      const method = PAYMENT_METHODS[paymentMethod];
      return {
         name: method.name,
         prefixes:
            paymentMethod === "mtn_momo"
               ? ["078", "077", "076", "079"]
               : ["073", "072", "070"],
         color: paymentMethod === "mtn_momo" ? Colors.warning : Colors.error,
      };
   };

   const methodInfo = getPaymentMethodInfo();

   return (
      <Modal
         visible={isOpen}
         animationType="slide"
         transparent={false}
         onRequestClose={handleCancel}
      >
         <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white border-b border-gray-200 px-4 py-4 flex-row items-center justify-between">
               <View className="flex-row items-center">
                  <Smartphone
                     size={20}
                     color={methodInfo.color}
                     className="mr-2"
                  />
                  <Text className="text-xl font-bold text-gray-900">
                     {methodInfo.name} Payment
                  </Text>
               </View>
               <TouchableOpacity onPress={handleCancel}>
                  <X
                     size={24}
                     color={Colors.text}
                  />
               </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 py-4">
               <Text className="text-sm text-gray-600 mb-4">
                  Please enter your {methodInfo.name} phone number to complete
                  the payment. You will receive an SMS prompt to authorize the
                  transaction.
               </Text>

               <View className="space-y-4">
                  <View>
                     <Text className="text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                     </Text>
                     <View className="relative">
                        <TextInput
                           value={phoneDisplay}
                           onChangeText={handlePhoneChange}
                           placeholder={
                              methodInfo.name === "MTN Mobile Money"
                                 ? "078 123 4567"
                                 : "073 123 4567"
                           }
                           keyboardType="phone-pad"
                           className={`bg-white border rounded-xl px-4 py-3 text-base pr-10 ${
                              error
                                 ? "border-red-500"
                                 : isValid
                                   ? "border-green-500"
                                   : "border-gray-300"
                           }`}
                           placeholderTextColor={Colors.textSecondary}
                           maxLength={12}
                        />
                        {isValid && (
                           <View className="absolute right-3 top-1/2">
                              <CheckCircle2
                                 size={20}
                                 color={Colors.success}
                              />
                           </View>
                        )}
                     </View>
                     <Text className="text-xs text-gray-500 mt-1">
                        {phoneValue.length}/10 digits
                     </Text>
                     {error && (
                        <View className="flex-row items-center mt-2">
                           <View className="mr-2">
                              <AlertCircle
                                 size={16}
                                 color={Colors.error}
                              />
                           </View>
                           <Text className="text-sm text-red-600">{error}</Text>
                        </View>
                     )}
                  </View>

                  <View className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                     <View className="flex-row items-start">
                        <View className="mr-2">
                           <Smartphone
                              size={16}
                              color={Colors.primary}
                           />
                        </View>
                        <View className="flex-1">
                           <Text className="font-medium text-blue-900 mb-1">
                              {methodInfo.name} Number Format
                           </Text>
                           <Text className="text-xs leading-relaxed text-blue-800">
                              {methodInfo.name} numbers in Rwanda start with:{" "}
                              <Text className="font-semibold">
                                 {methodInfo.prefixes.join(", ")}
                              </Text>
                           </Text>
                           <Text className="text-xs leading-relaxed text-blue-800 mt-1">
                              Example: {methodInfo.prefixes[0]} 123 4567
                           </Text>
                        </View>
                     </View>
                  </View>
               </View>
            </ScrollView>

            {/* Footer */}
            <View className="bg-white border-t border-gray-200 px-4 py-4 flex-row justify-end">
               <TouchableOpacity
                  onPress={handleCancel}
                  className="px-4 py-3 border border-gray-300 rounded-lg mr-3"
               >
                  <Text className="text-gray-700 font-medium">Cancel</Text>
               </TouchableOpacity>
               <TouchableOpacity
                  onPress={handleConfirm}
                  disabled={!isValid}
                  className={`px-4 py-3 rounded-lg ${
                     isValid ? "bg-primary" : "bg-gray-400 opacity-50"
                  }`}
               >
                  <Text className="text-white font-semibold">
                     Continue Payment
                  </Text>
               </TouchableOpacity>
            </View>
         </View>
      </Modal>
   );
}
