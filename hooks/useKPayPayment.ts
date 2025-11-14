import { useState, useCallback, useRef } from "react";
import toast from "@/utils/toast";
import { PAYMENT_METHODS, formatPhoneNumber } from "@/lib/services/kpay";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PaymentInitiationRequest {
   orderId?: string;
   amount: number;
   customerName: string;
   customerEmail: string;
   customerPhone: string;
   paymentMethod: keyof typeof PAYMENT_METHODS;
   redirectUrl: string;
   cart?: any;
}

export interface PaymentInitiationResponse {
   success: boolean;
   paymentId?: string;
   transactionId?: string;
   reference?: string;
   sessionId?: string;
   checkoutUrl?: string;
   status: string;
   message: string;
   error?: string;
}

export interface PaymentStatusResponse {
   success: boolean;
   paymentId: string;
   status: string;
   amount: number;
   currency: string;
   reference: string;
   transactionId?: string;
   message: string;
   needsUpdate: boolean;
   error?: string;
   kpayStatus?: {
      statusId: string;
      statusDescription: string;
      returnCode: number;
      momTransactionId?: string;
   };
}

export function useKPayPayment() {
   const [isInitiating, setIsInitiating] = useState(false);
   const [isCheckingStatus, setIsCheckingStatus] = useState(false);
   const initiatingRef = useRef(false);
   const checkingRef = useRef(false);

   const getApiUrl = () => {
      return (
         process.env.EXPO_PUBLIC_API_URL ||
         process.env.EXPO_PUBLIC_SITE_URL ||
         ""
      );
   };

   const initiatePayment = useCallback(
      async (
         request: PaymentInitiationRequest
      ): Promise<PaymentInitiationResponse> => {
         if (initiatingRef.current) {
            const msg = "A payment is already in progress. Please wait.";
            toast.error(msg);
            return {
               success: false,
               paymentId: "",
               transactionId: "",
               reference: "",
               status: "failed",
               message: msg,
               error: msg,
            };
         }

         initiatingRef.current = true;
         setIsInitiating(true);

         try {
            // If a previous reference exists in AsyncStorage, include it
            const bodyPayload: any = { ...request };
            try {
               const existingRef = await AsyncStorage.getItem("kpay_reference");
               if (existingRef) {
                  bodyPayload.clientReference = existingRef;
               }
            } catch (e) {
               // ignore
            }

            const apiUrl = getApiUrl();
            const endpoint = apiUrl
               ? `${apiUrl}/api/payments/kpay/initiate`
               : "/api/payments/kpay/initiate";

            const response = await fetch(endpoint, {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(bodyPayload),
            });

            let data: any;
            try {
               data = await response.json();
            } catch (e) {
               const txt = await response.text();
               data = { error: txt || "Failed to parse response" };
            }

            if (!response.ok) {
               const serverErr =
                  data?.technicalError ||
                  data?.error ||
                  data?.message ||
                  "Failed to initiate payment";
               throw new Error(serverErr);
            }

            if (data.success) {
               toast.success("Payment initiated successfully");
               // Store reference for potential reuse
               if (data.reference) {
                  try {
                     await AsyncStorage.setItem(
                        "kpay_reference",
                        data.reference
                     );
                  } catch (e) {
                     // ignore
                  }
               }
            } else {
               toast.error(data.error || "Payment initiation failed");
            }

            const normalized = {
               ...data,
               checkoutUrl: data.checkoutUrl || data?.kpayResponse?.url || null,
               reference: data.reference || data?.kpayResponse?.refid || null,
               sessionId: data.sessionId || data?.session?.id || null,
            } as any;

            return normalized;
         } catch (error) {
            const errorMessage =
               error instanceof Error
                  ? error.message
                  : "Payment initiation failed";
            toast.error(errorMessage);

            return {
               success: false,
               paymentId: "",
               transactionId: "",
               reference: "",
               status: "failed",
               message: errorMessage,
               error: errorMessage,
            };
         } finally {
            initiatingRef.current = false;
            setIsInitiating(false);
         }
      },
      []
   );

   const checkPaymentStatus = useCallback(
      async (params: {
         paymentId?: string;
         transactionId?: string;
         reference?: string;
      }): Promise<PaymentStatusResponse> => {
         if (checkingRef.current) {
            const start = Date.now();
            while (checkingRef.current && Date.now() - start < 5000) {
               await new Promise((r) => setTimeout(r, 150));
            }
         }

         checkingRef.current = true;
         setIsCheckingStatus(true);

         try {
            const apiUrl = getApiUrl();
            const endpoint = apiUrl
               ? `${apiUrl}/api/payments/kpay/status`
               : "/api/payments/kpay/status";

            const response = await fetch(endpoint, {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(params),
            });

            const data = await response.json();

            if (!response.ok) {
               throw new Error(data.error || "Failed to check payment status");
            }

            return data;
         } catch (error) {
            const errorMessage =
               error instanceof Error
                  ? error.message
                  : "Failed to check payment status";

            return {
               success: false,
               paymentId: params.paymentId || "",
               status: "unknown",
               amount: 0,
               currency: "RWF",
               reference: params.reference || "",
               transactionId: params.transactionId,
               message: errorMessage,
               needsUpdate: false,
               error: errorMessage,
            };
         } finally {
            checkingRef.current = false;
            setIsCheckingStatus(false);
         }
      },
      []
   );

   const formatPhoneNumberForKPay = useCallback((phone: string): string => {
      return formatPhoneNumber(phone);
   }, []);

   const validatePaymentRequest = useCallback(
      (request: PaymentInitiationRequest): string[] => {
         const errors: string[] = [];

         if (!request.orderId && !request.cart) {
            errors.push(
               "Either Order ID or cart snapshot is required to initiate a payment"
            );
         }

         if (!request.amount || request.amount <= 0) {
            errors.push("Valid amount is required");
         }

         if (!request.customerName?.trim()) {
            errors.push("Customer name is required");
         }

         if (!request.customerEmail?.trim()) {
            errors.push("Customer email is required");
         }

         if (!request.customerPhone?.trim()) {
            errors.push("Customer phone is required");
         } else {
            const formattedPhone = formatPhoneNumberForKPay(
               request.customerPhone
            );
            if (!formattedPhone.match(/^07\d{8}$/)) {
               errors.push(
                  "Phone number must be in Rwanda format (07XXXXXXXX)"
               );
            }
         }

         if (!request.paymentMethod) {
            errors.push("Payment method is required");
         } else if (!PAYMENT_METHODS[request.paymentMethod]) {
            errors.push("Invalid payment method");
         }

         if (!request.redirectUrl?.trim()) {
            errors.push("Redirect URL is required");
         }

         return errors;
      },
      [formatPhoneNumberForKPay]
   );

   return {
      initiatePayment,
      checkPaymentStatus,
      formatPhoneNumber: formatPhoneNumberForKPay,
      validatePaymentRequest,
      isInitiating,
      isCheckingStatus,
   };
}
