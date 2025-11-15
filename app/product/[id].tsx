import React from "react";
import {
   View,
   Text,
   ScrollView,
   TouchableOpacity,
   Dimensions,
   Alert,
   ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Star, ShoppingCart, Heart, Truck } from "lucide-react-native";
import { useProduct } from "@/hooks/useProduct";
import { useApp } from "@/contexts/AppContext";
import Colors from "@/constants/colors";
import { useState } from "react";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
   const { id } = useLocalSearchParams();
   const router = useRouter();
   const { addToCart } = useApp();
   const [quantity, setQuantity] = useState<number>(1);

   const { data: product, isLoading } = useProduct(id as string);

   if (isLoading) {
      return (
         <View className="flex-1 bg-background items-center justify-center">
            <ActivityIndicator
               size="large"
               color={Colors.primary}
            />
         </View>
      );
   }

   if (!product) {
      return (
         <View className="flex-1 bg-background items-center justify-center">
            <Text className="text-lg text-textSecondary">
               Product not found
            </Text>
         </View>
      );
   }

   const handleAddToCart = () => {
      addToCart(product as any, quantity);
      Alert.alert(
         "Added to Cart",
         `${product.name} has been added to your cart.`,
         [
            { text: "Continue Shopping", style: "cancel" },
            {
               text: "View Cart",
               onPress: () => router.push("/(tabs)/cart" as any),
            },
         ]
      );
   };

   const isInStock = product.stock > 0 && product.status === "active";
   const discount =
      product.compare_at_price && product.compare_at_price > product.price
         ? Math.round((1 - product.price / product.compare_at_price) * 100)
         : 0;

   return (
      <View className="flex-1 bg-background">
         <ScrollView
            className="flex-1 pb-20"
            showsVerticalScrollIndicator={false}
         >
            <Image
               source={{
                  uri:
                     product.main_image_url ||
                     "https://via.placeholder.com/400",
               }}
               className="w-full"
               style={{ height: width }}
               contentFit="cover"
            />

            {discount > 0 && (
               <View className="absolute top-4 right-4 bg-secondary px-3 py-2 rounded-lg">
                  <Text className="text-white text-base font-bold">
                     {discount}% OFF
                  </Text>
               </View>
            )}

            <View className="p-4">
               <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                     {product.brand && (
                        <Text className="text-primary text-base font-semibold mb-1">
                           {product.brand}
                        </Text>
                     )}
                  </View>
                  <TouchableOpacity className="w-11 h-11 rounded-full bg-background items-center justify-center border border-border">
                     <Heart
                        size={24}
                        color={Colors.error}
                     />
                  </TouchableOpacity>
               </View>

               <Text className="text-2xl font-bold text-text mb-4">
                  {product.name}
               </Text>

               <View className="flex-row items-center space-x-3 mb-4">
                  <Text className="text-2xl font-bold text-primary">
                     RWF {product.price}
                  </Text>
                  {product.compare_at_price &&
                     product.compare_at_price > product.price && (
                        <Text className="text-xl text-textSecondary line-through">
                           RWF {product.compare_at_price}
                        </Text>
                     )}
                  {product.compare_at_price &&
                     product.compare_at_price > product.price && (
                        <View className="bg-success/20 px-2 py-1 rounded">
                           <Text className="text-success font-semibold text-sm">
                              Save RWF{" "}
                              {product.compare_at_price - product.price}
                           </Text>
                        </View>
                     )}
               </View>

               <View className="flex-row items-center space-x-2 bg-primary/10 p-3 rounded mb-5">
                  <Truck
                     size={20}
                     color={Colors.primary}
                  />
                  <Text className="text-primary text-sm font-medium">
                     Free delivery on orders above RWF 5000
                  </Text>
               </View>

               <View className="h-px bg-border my-5" />

               <View className="mb-1">
                  <Text className="text-lg font-bold text-text mb-3">
                     Description
                  </Text>
                  <Text className="text-textSecondary text-base leading-6">
                     {product.description}
                  </Text>
               </View>

               <View className="h-px bg-border my-5" />

               <View className="mb-4">
                  <Text className="text-lg font-bold text-text mb-3">
                     Product Details
                  </Text>
                  {product.brand && (
                     <View className="flex-row justify-between py-2">
                        <Text className="text-textSecondary text-base">
                           Brand
                        </Text>
                        <Text className="text-text font-semibold text-base">
                           {product.brand}
                        </Text>
                     </View>
                  )}
                  <View className="flex-row justify-between py-2">
                     <Text className="text-textSecondary text-base">Stock</Text>
                     <Text className="text-text font-semibold text-base">
                        {product.stock}
                     </Text>
                  </View>
                  <View className="flex-row justify-between py-2">
                     <Text className="text-textSecondary text-base">
                        Status
                     </Text>
                     <Text
                        className={`text-base font-semibold ${isInStock ? "text-success" : "text-error"}`}
                     >
                        {isInStock ? "In Stock" : "Out of Stock"}
                     </Text>
                  </View>
               </View>
            </View>
         </ScrollView>

         <View className="flex-row p-4 space-x-3 bg-white border-t border-border">
            <View className="flex-row items-center bg-background border border-border rounded">
               <TouchableOpacity
                  className="w-11 h-11 items-center justify-center"
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
               >
                  <Text className="text-primary text-2xl font-semibold">−</Text>
               </TouchableOpacity>
               <Text className="text-text text-lg font-bold text-center min-w-[40px]">
                  {quantity}
               </Text>
               <TouchableOpacity
                  className="w-11 h-11 items-center justify-center"
                  onPress={() => setQuantity(quantity + 1)}
               >
                  <Text className="text-primary text-2xl font-semibold">+</Text>
               </TouchableOpacity>
            </View>

            <TouchableOpacity
               className={`flex-1 flex-row items-center justify-center space-x-2 rounded px-4 py-3 ${isInStock ? "bg-primary" : "bg-textSecondary"}`}
               onPress={handleAddToCart}
               disabled={!isInStock}
            >
               <ShoppingCart
                  size={20}
                  color={Colors.white}
               />
               <Text className="text-white text-base font-bold">
                  {isInStock ? "Add to Cart" : "Out of Stock"}
               </Text>
            </TouchableOpacity>
         </View>
      </View>
   );
}

// Original StyleSheet kept for reference
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: Colors.background },
//   errorContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
//   errorText: { fontSize: 18, color: Colors.textSecondary },
//   content: { flex: 1 },
//   productImage: { width: width, height: width },
//   discountBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: Colors.secondary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
//   discountText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
//   detailsContainer: { padding: 16 },
//   headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
//   brandContainer: { flex: 1 },
//   brandText: { fontSize: 16, color: Colors.primary, fontWeight: '600', marginBottom: 4 },
//   ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   ratingText: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
//   reviewsText: { fontSize: 14, color: Colors.textSecondary },
//   wishlistButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
//   productName: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 16 },
//   priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
//   currentPrice: { fontSize: 28, fontWeight: 'bold', color: Colors.primary },
//   originalPrice: { fontSize: 20, color: Colors.textSecondary, textDecorationLine: 'line-through' },
//   saveBadge: { backgroundColor: Colors.success + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
//   saveText: { fontSize: 14, color: Colors.success, fontWeight: '600' },
//   deliveryInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary + '10', padding: 12, borderRadius: 8 },
//   deliveryText: { fontSize: 14, color: Colors.primary, fontWeight: '500' },
//   divider: { height: 1, backgroundColor: Colors.border, marginVertical: 20 },
//   section: { marginBottom: 4 },
//   sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
//   description: { fontSize: 16, color: Colors.textSecondary, lineHeight: 24 },
//   detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
//   detailLabel: { fontSize: 16, color: Colors.textSecondary },
//   detailValue: { fontSize: 16, fontWeight: '600', color: Colors.text },
//   footer: { flexDirection: 'row', padding: 16, gap: 12, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
//   quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
//   quantityButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
//   quantityButtonText: { fontSize: 24, color: Colors.primary, fontWeight: '600' },
//   quantityText: { fontSize: 18, fontWeight: 'bold', color: Colors.text, minWidth: 40, textAlign: 'center' },
//   addToCartButton: { flex: 1, flexDirection: 'row', backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 8 },
//   disabledButton: { backgroundColor: Colors.textSecondary },
//   addToCartText: { fontSize: 16, fontWeight: 'bold', color: Colors.white },
// });
