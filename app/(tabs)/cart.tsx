import Colors from "@/constants/colors";
import Fonts from "@/constants/fonts";
import { useApp } from "@/contexts/AppContext";
import { useAuthStore } from "@/store/auth.store";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import {
   Minus,
   Plus,
   ShoppingBag,
   Trash2,
   ShoppingCart,
   ArrowRight,
} from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
   Alert,
   ScrollView,
   Text,
   TouchableOpacity,
   View,
   Platform,
   ActivityIndicator,
} from "react-native";

// Modern NiheMart colors
const NiheColors = {
   primary: "#00A6E0",
   accent: "#FF6B35",
   background: "#F8FAFB",
   surface: "#FFFFFF",
   text: "#1A2332",
   textSecondary: "#64748B",
   border: "#E2E8F0",
   error: "#EF4444",
   success: "#10B981",
};

export default function CartScreen() {
   const { cart, updateCartQuantity, removeFromCart, cartTotal, placeOrder } =
      useApp();
   const router = useRouter();
   const { t } = useTranslation();
   const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);

   // Orders feature flag from server: when false, customers cannot place orders
   const [ordersEnabled, setOrdersEnabled] = useState<boolean | null>(null);
   const [ordersDisabledMessage, setOrdersDisabledMessage] = useState<
      string | null
   >(null);

   // Fetch whether orders are enabled (admin-controlled) and subscribe for realtime updates
   useEffect(() => {
      let mounted = true;
      let channel: any = null;

      const fetchOrdersEnabled = async () => {
         try {
            const res = await fetch("/api/admin/settings/orders-enabled");
            if (!res.ok) throw new Error("Failed to fetch setting");
            const json = await res.json();
            if (!mounted) return;
            setOrdersEnabled(Boolean(json.enabled));
            setOrdersDisabledMessage(json.message || null);
         } catch (err) {
            console.warn("Failed to load orders_enabled setting", err);
            if (!mounted) return;
            setOrdersEnabled(null);
         }
      };

      fetchOrdersEnabled();

      try {
         // Try to subscribe via Supabase realtime channel if available in mobile
         // eslint-disable-next-line @typescript-eslint/no-var-requires
         const { supabase } = require("@/integrations/supabase/client");
         channel = supabase
            .channel("cart_site_settings_orders_enabled")
            .on(
               "postgres_changes",
               {
                  event: "*",
                  schema: "public",
                  table: "site_settings",
                  filter: "key=eq.orders_enabled",
               },
               (payload: any) => {
                  try {
                     const val = payload?.new?.value ?? payload?.old?.value;
                     const enabled =
                        val === true ||
                        String(val) === "true" ||
                        (val && val === "true");
                     setOrdersEnabled(Boolean(enabled));
                     if (payload?.new?.message)
                        setOrdersDisabledMessage(payload.new.message);
                  } catch (e) {
                     // ignore
                  }
               }
            )
            .subscribe();
      } catch (e) {
         console.warn("Supabase realtime unavailable in mobile cart:", e);
      }

      return () => {
         mounted = false;
         try {
            if (channel) {
               // eslint-disable-next-line @typescript-eslint/no-var-requires
               const { supabase } = require("@/integrations/supabase/client");
               supabase.removeChannel(channel);
            }
         } catch (e) {
            // ignore
         }
      };
   }, []);

   const handleCheckout = async () => {
      const user = useAuthStore.getState().user;

      if (!user) {
         router.push("/signin" as any);
         return;
      }

      if (cart.length === 0) {
         Alert.alert(t("cart.empty"), t("cart.emptyMessage"));
         return;
      }

      router.push("/checkout" as any);
   };

   const handleRemove = (productId: string, productName: string) => {
      Alert.alert(t("cart.remove"), `${t("cart.remove")} ${productName}?`, [
         { text: t("common.cancel"), style: "cancel" },
         {
            text: t("cart.remove"),
            style: "destructive",
            onPress: () => removeFromCart(productId),
         },
      ]);
   };

   if (cart.length === 0) {
      return (
         <>
            <Stack.Screen options={{ headerShown: false }} />
            <View className="flex-1 bg-[#F8FAFB] items-center justify-center px-8">
               <View className="w-36 h-36 rounded-full bg-white items-center justify-center mb-6 shadow-lg">
                  <ShoppingBag
                     size={80}
                     color={NiheColors.textSecondary}
                     strokeWidth={1.5}
                  />
               </View>
               <Text
                  className="text-[#1A2332] text-3xl font-bold mb-3 text-center"
                  style={{ fontFamily: Fonts.bold }}
               >
                  {t("cart.empty")}
               </Text>
               <Text
                  className="text-[#64748B] text-base text-center mb-8 leading-6"
                  style={{ fontFamily: Fonts.regular }}
               >
                  {t("cart.emptyMessage")}
               </Text>
               <TouchableOpacity
                  className="flex-row items-center bg-[#00A6E0] px-8 py-4 rounded-2xl gap-2 shadow-lg"
                  onPress={() => router.push("/(tabs)" as any)}
                  activeOpacity={0.8}
               >
                  <Text
                     className="text-white text-lg font-bold"
                     style={{ fontFamily: Fonts.bold }}
                  >
                     {t("home.viewAll")}
                  </Text>
                  <ArrowRight
                     size={20}
                     color="#FFFFFF"
                  />
               </TouchableOpacity>
            </View>
         </>
      );
   }

   return (
      <>
         <Stack.Screen options={{ headerShown: false }} />
         <View className="flex-1 bg-[#F8FAFB]">
            {/* Header */}
            <View
               className={`flex-row justify-between items-center px-5 ${Platform.OS === "ios" ? "pt-14" : "pt-5"} pb-5 bg-white border-b border-[#E2E8F0]`}
            >
               <View>
                  <Text
                     className="text-[#1A2332] text-3xl font-bold"
                     style={{ fontFamily: Fonts.bold }}
                  >
                     My Cart
                  </Text>
                  <Text
                     className="text-[#64748B] text-sm mt-1"
                     style={{ fontFamily: Fonts.medium }}
                  >
                     {cart.length} {cart.length === 1 ? "item" : "items"}
                  </Text>
               </View>
               <View className="w-12 h-12 rounded-full bg-[#F8FAFB] items-center justify-center">
                  <ShoppingCart
                     size={24}
                     color={NiheColors.primary}
                  />
               </View>
            </View>

            {/* Cart Items */}
            <ScrollView
               className="flex-1"
               contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
               showsVerticalScrollIndicator={false}
            >
               {cart.map((item, index) => (
                  <View
                     key={item.product.id}
                     className={`flex-row bg-white rounded-2xl p-3 shadow-md ${index === cart.length - 1 ? "mb-0" : "mb-3"}`}
                  >
                     {/* Product Image */}
                     <View className="w-[90px] h-[90px] rounded-xl overflow-hidden bg-[#F8FAFB]">
                        <Image
                           source={{ uri: item.product.image }}
                           className="w-full h-full"
                           contentFit="cover"
                        />
                     </View>

                     {/* Product Details */}
                     <View className="flex-1 ml-3 justify-between">
                        <Text
                           className="text-[#1A2332] text-[15px] font-semibold leading-5 mb-1"
                           numberOfLines={2}
                           style={{
                              fontFamily: Fonts.semiBold || Fonts.medium,
                           }}
                        >
                           {item.product.name}
                        </Text>

                        <View className="flex-row items-center gap-2 mb-2">
                           <Text
                              className="text-[#00A6E0] text-lg font-bold"
                              style={{ fontFamily: Fonts.bold }}
                           >
                              {item.product.discountPrice || item.product.price}{" "}
                              RWF
                           </Text>
                           {item.product.discountPrice && (
                              <Text
                                 className="text-[#64748B] text-sm line-through"
                                 style={{ fontFamily: Fonts.medium }}
                              >
                                 {item.product.price} RWF
                              </Text>
                           )}
                        </View>

                        {/* Quantity Controls */}
                        <View className="flex-row items-center gap-3">
                           <TouchableOpacity
                              className="w-8 h-8 rounded-xl bg-[#F8FAFB] items-center justify-center border-[1.5px] border-[#00A6E0]"
                              onPress={() =>
                                 updateCartQuantity(
                                    item.product.id,
                                    item.quantity - 1
                                 )
                              }
                              activeOpacity={0.7}
                           >
                              <Minus
                                 size={18}
                                 color={NiheColors.primary}
                                 strokeWidth={2.5}
                              />
                           </TouchableOpacity>

                           <View className="min-w-8 items-center">
                              <Text
                                 className="text-[#1A2332] text-base font-bold"
                                 style={{ fontFamily: Fonts.bold }}
                              >
                                 {item.quantity}
                              </Text>
                           </View>

                           <TouchableOpacity
                              className="w-8 h-8 rounded-xl bg-[#F8FAFB] items-center justify-center border-[1.5px] border-[#00A6E0]"
                              onPress={() =>
                                 updateCartQuantity(
                                    item.product.id,
                                    item.quantity + 1
                                 )
                              }
                              activeOpacity={0.7}
                           >
                              <Plus
                                 size={18}
                                 color={NiheColors.primary}
                                 strokeWidth={2.5}
                              />
                           </TouchableOpacity>
                        </View>
                     </View>

                     {/* Remove Button */}
                     <TouchableOpacity
                        className="justify-start pt-1"
                        onPress={() =>
                           handleRemove(item.product.id, item.product.name)
                        }
                        activeOpacity={0.7}
                     >
                        <View className="w-9 h-9 rounded-xl bg-[#F8FAFB] items-center justify-center">
                           <Trash2
                              size={20}
                              color={NiheColors.error}
                              strokeWidth={2}
                           />
                        </View>
                     </TouchableOpacity>
                  </View>
               ))}
            </ScrollView>

            {/* Footer with Total and Checkout */}
            <View
               className={`bg-white px-5 pt-5 ${Platform.OS === "ios" ? "pb-24" : "pb-20"} border-t border-[#E2E8F0] shadow-2xl`}
            >
               {/* Order Summary */}
               <View className="mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                     <Text
                        className="text-[#64748B] text-[15px]"
                        style={{ fontFamily: Fonts.medium }}
                     >
                        Subtotal
                     </Text>
                     <Text
                        className="text-[#1A2332] text-[15px] font-semibold"
                        style={{ fontFamily: Fonts.semiBold || Fonts.medium }}
                     >
                        {cartTotal} RWF
                     </Text>
                  </View>
                  <View className="h-[1px] bg-[#E2E8F0] my-3" />
                  <View className="flex-row justify-between items-center">
                     <Text
                        className="text-[#1A2332] text-lg font-bold"
                        style={{ fontFamily: Fonts.bold }}
                     >
                        Total
                     </Text>
                     <Text
                        className="text-[#00A6E0] text-2xl font-bold"
                        style={{ fontFamily: Fonts.bold }}
                     >
                        {cartTotal} RWF
                     </Text>
                  </View>
               </View>

               {/* Checkout Button */}
               <TouchableOpacity
                  className={`flex-row py-[18px] rounded-2xl items-center justify-center gap-2 shadow-lg ${
                     ordersEnabled === false
                        ? "bg-orange-300 opacity-60"
                        : "bg-orange-500"
                  } ${isPlacingOrder && "opacity-60"}`}
                  onPress={handleCheckout}
                  disabled={isPlacingOrder}
                  activeOpacity={0.8}
               >
                  <Text
                     className="text-white text-[17px] font-bold"
                     style={{ fontFamily: Fonts.bold }}
                  >
                     {isPlacingOrder
                        ? t("common.loading")
                        : t("cart.proceedToCheckout")}
                  </Text>
                  {!isPlacingOrder && (
                     <ArrowRight
                        size={22}
                        color="#FFFFFF"
                        strokeWidth={2.5}
                     />
                  )}
               </TouchableOpacity>

               {/* Show warning if orders disabled */}
               {ordersEnabled === false && (
                  <View className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                     <Text className="text-yellow-900 text-xs font-medium">
                        {ordersDisabledMessage ||
                           "We are currently not allowing orders. You can still proceed to checkout to schedule a delivery for tomorrow."}
                     </Text>
                  </View>
               )}
            </View>
         </View>
      </>
   );
}
