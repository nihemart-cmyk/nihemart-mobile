import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { useProduct } from "@/hooks/useProduct"; // Assuming this hook fetches all data
import { formatCurrency } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist.store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heart, RotateCcw, ShoppingCart, Truck } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

// Import our new components
import DealsCarousel from "@/components/DealsCarousel"; // For similar products
import ImageGallery from "@/components/product/ImageGallery";
import ProductTabs from "@/components/product/ProductTabs";
import ProductDetailSkeleton from "@/components/skeletons/ProductDetailSkeleton";

// You'll need to update your useProduct hook and Product type to include these fields
// Example: { product: {...}, images: [...], reviews: [...], similarProducts: [...] }

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { addToCart } = useApp();
  const { addToWishlist, removeFromWishlist, isInWishlist } =
    useWishlistStore();
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);

  // IMPORTANT: Update your useProduct hook to fetch images, reviews, etc.
  const { data: productData, isLoading } = useProduct(id as string);
  console.log({ productData });

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  // Safely destructure productData. Use a fallback empty object `{}` for the initial render.
  const {
    product,
    images: productImages = [],
    reviews = [],
    similarProducts = [],
    variations = [],
  } = productData || {};

  // --- All Hooks are now at the top level and will run on every render ---

  const uniqueAttributeValues = useMemo(() => {
    const attributes: Record<string, Set<string>> = {};
    if (!variations) return {}; // Guard against undefined variations on initial render
    variations.forEach((v) => {
      Object.entries(v.attributes).forEach(([key, value]) => {
        if (!attributes[key]) attributes[key] = new Set();
        (value as string)
          .split(",")
          .map((s: string) => s.trim())
          .forEach((val: string) => attributes[key].add(val));
      });
    });
    return Object.fromEntries(
      Object.entries(attributes).map(([key, valueSet]) => [
        key,
        Array.from(valueSet),
      ])
    );
  }, [variations]);

  const possibleVariants = useMemo(() => {
    if (!variations) return []; // Guard
    if (Object.keys(selectedOptions).length === 0) return variations;
    return variations.filter((variant) =>
      Object.entries(selectedOptions).every(([key, value]) =>
        (variant.attributes[key] as string)
          ?.split(",")
          .map((s: string) => s.trim())
          .includes(value)
      )
    );
  }, [selectedOptions, variations]);

  const singleSelectedVariation = useMemo(() => {
    if (possibleVariants.length === 1) {
      const finalVariant = possibleVariants[0];
      const userSelectionCount = Object.keys(selectedOptions).length;
      const variantAttributeCount = Object.keys(finalVariant.attributes).length;
      if (userSelectionCount === variantAttributeCount) {
        return finalVariant;
      }
    }
    return null;
  }, [possibleVariants, selectedOptions]);

  const availableOptions = useMemo(() => {
    const available: Record<string, Set<string>> = {};
    if (!variations || !uniqueAttributeValues) return {}; // Guard
    Object.keys(uniqueAttributeValues).forEach((key) => {
      available[key] = new Set();
      const tempSelection = { ...selectedOptions };
      delete tempSelection[key];

      const potentialVariants = variations.filter((variant) =>
        Object.entries(tempSelection).every(([k, v]) =>
          (variant.attributes[k] as string)
            ?.split(",")
            .map((s: string) => s.trim())
            .includes(v as string)
        )
      );

      potentialVariants.forEach((variant) => {
        (variant.attributes[key] as string)
          ?.split(",")
          .map((s: string) => s.trim())
          .forEach((val: string) => available[key].add(val));
      });
    });
    return available;
  }, [selectedOptions, variations, uniqueAttributeValues]);

  useEffect(() => {
    if (variations?.length === 1) {
      const attrs = Object.keys(variations[0].attributes);
      if (attrs.length === 1) {
        const attr = attrs[0];
        const value = variations[0].attributes[attr];
        setSelectedOptions({ [attr]: value as string });
      }
    }
  }, [variations]);

  useEffect(() => {
    setInWishlist(isInWishlist(id as string));
  }, [id, isInWishlist]);

  const allImages = useMemo(() => {
    let galleryImages = productImages?.map((img: any) => img.url) || [];

    if (singleSelectedVariation) {
      const variantImages =
        productImages
          ?.filter(
            (img: any) =>
              img.product_variation_id === singleSelectedVariation.id
          )
          .map((img: any) => img.url) || [];
      const generalImages =
        productImages
          ?.filter((img: any) => !img.product_variation_id)
          .map((img: any) => img.url) || [];
      galleryImages = [...variantImages, ...generalImages];
    }

    if (
      product?.main_image_url &&
      !galleryImages.includes(product.main_image_url)
    ) {
      return [product.main_image_url, ...galleryImages];
    }
    return galleryImages.length > 0
      ? galleryImages
      : ["https://via.placeholder.com/400"];
  }, [product?.main_image_url, productImages, singleSelectedVariation]);

  // --- Conditional return is now AFTER all hooks ---
  if (isLoading || !product) {
    return <ProductDetailSkeleton />;
  }

  const handleOptionSelect = (type: string, value: string) => {
    setSelectedOptions((prev) => {
      const newOptions = { ...prev };
      if (newOptions[type] === value) {
        delete newOptions[type];
      } else {
        newOptions[type] = value;
      }
      return newOptions;
    });
  };

  const handleWishlistToggle = async () => {
    if (inWishlist) {
      await removeFromWishlist(product.id);
      setInWishlist(false);
      Toast.show({
        type: "info",
        text1: t("common.removedFromWishlist"),
        duration: 2000,
      });
    } else {
      // Create product object for wishlist
      const wishlistProduct = {
        id: product.id,
        name: product.name,
        description: product.description || "",
        price: product.price,
        discountPrice:
          product.compare_at_price && product.compare_at_price > product.price
            ? product.price
            : undefined,
        image: product.main_image_url || "https://via.placeholder.com/150",
        category: "",
        rating: product.rating || 0,
        reviews: product.reviews_count || 0,
        inStock: inStock,
        brand: "",
      };
      await addToWishlist(wishlistProduct);
      setInWishlist(true);
      Toast.show({
        type: "success",
        text1: t("common.addedToWishlist"),
        duration: 2000,
      });
    }
  };

  const handleAddToCart = () => {
    const hasVariants = variations.length > 0;
    if (hasVariants && !singleSelectedVariation) {
      Alert.alert("Please select a complete and valid product combination.");
      return;
    }

    const itemToAdd = {
      product_id: product.id,
      name: product.name,
      price: singleSelectedVariation?.price ?? product.price,
      image: product.main_image_url || "/placeholder.svg",
      variant: singleSelectedVariation
        ? Object.values(singleSelectedVariation.attributes).join(" / ")
        : undefined,
      id: singleSelectedVariation
        ? `${product.id}-${singleSelectedVariation.id}`
        : product.id,
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(itemToAdd as any);
    }

    Alert.alert(
      "Added to Cart",
      `${product.name} has been added to your cart.`,
      [
        { text: "Continue Shopping" },
        {
          text: "View Cart",
          onPress: () => router.push("/(tabs)/cart" as any),
        },
      ]
    );
  };

  const currentPrice = singleSelectedVariation?.price ?? product.price;
  const comparePrice = product.compare_at_price;
  const inStock =
    variations.length > 0
      ? (singleSelectedVariation?.stock ?? 0) > 0 || (product.stock ?? 0) > 0
      : (product.stock ?? 0) > 0;

  const isAddToCartDisabled =
    (variations.length > 0 && !singleSelectedVariation) || !inStock;

  const getButtonText = () => {
    if (!inStock) return "Out of Stock";
    if (variations.length > 0 && !singleSelectedVariation)
      return "Select Options";
    return "Add to Cart";
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageGallery images={allImages} />

        <View className="p-4">
          {/* --- Product Info --- */}
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-2xl font-bold text-text flex-1 pr-4">
              {product.name}
            </Text>
            <TouchableOpacity
              onPress={handleWishlistToggle}
              className="w-12 h-12 rounded-full bg-white items-center justify-center border border-gray-200"
            >
              <Heart
                size={24}
                color={inWishlist ? "#FF4757" : Colors.textSecondary}
                fill={inWishlist ? "#FF4757" : "none"}
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          </View>

          {/* --- Price --- */}
          <View className="flex-row items-baseline gap-2 mb-3">
            <Text className="text-3xl font-bold text-primary">
              {formatCurrency(currentPrice)}
            </Text>
            {comparePrice && (
              <Text className="text-lg text-textSecondary line-through">
                {formatCurrency(comparePrice)}
              </Text>
            )}
          </View>

          {/* --- Variations --- */}
          {Object.entries(uniqueAttributeValues).map(([attr, values]) => (
            <View key={attr} className="mb-4">
              <Text className="text-base font-medium text-text mb-3 capitalize">
                Choose a {attr}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {values.map((value) => {
                  const isSelected = selectedOptions[attr] === value;
                  const isDisabled =
                    !availableOptions[attr]?.has(value) && !isSelected;
                  return (
                    <TouchableOpacity
                      key={value}
                      onPress={() => handleOptionSelect(attr, value)}
                      disabled={isDisabled}
                      className={`px-4 py-2 rounded-lg border ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-gray-300"
                      } ${isDisabled ? "opacity-50" : ""}`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isSelected ? "text-primary" : "text-text"
                        } ${isDisabled ? "text-gray-400" : ""}`}
                      >
                        {value}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {/* --- Reviews (Placeholder) --- */}
          <View className="flex-row items-center mb-6">
            {/* Add your Star component here */}
            <Text className="text-sm text-textSecondary ml-2">
              {reviews?.length || 0} Reviews
            </Text>
          </View>

          {/* --- Delivery Info --- */}
          <View className="space-y-3 p-4 border border-gray-200 rounded-lg bg-white mb-6">
            <View className="flex-row items-center gap-3">
              <Truck size={20} color={Colors.success} />
              <View>
                <Text className="font-semibold text-success">We Deliver</Text>
                <Text className="text-sm text-textSecondary">
                  Delivery fee calculated at checkout.
                </Text>
              </View>
            </View>
            <View className="h-px bg-gray-200" />
            <View className="flex-row items-center gap-3">
              <RotateCcw size={20} color={Colors.primary} />
              <View>
                <Text className="font-semibold text-primary">
                  Return Delivery
                </Text>
                <Text className="text-sm text-textSecondary">
                  Return within 24 hours. Details
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- Tabs Section --- */}
        <View className="px-4">
          <ProductTabs
            description={product.description || "No description available."}
            reviews={reviews}
          />
        </View>

        {/* --- Similar Items Section --- */}
        {similarProducts && similarProducts.length > 0 && (
          <View className="mt-8">
            <Text className="text-xl font-bold text-text px-4 mb-4">
              Similar Items You Might Also Like
            </Text>
            <DealsCarousel products={similarProducts as any} />
          </View>
        )}

        {/* Spacer to prevent content from hiding behind the footer */}
        <View className="h-28" />
      </ScrollView>

      {/* --- Sticky Footer for Actions --- */}
      <View className="absolute bottom-0 left-0 right-0 flex-row p-3 space-x-3 bg-white border-t border-gray-200 items-center">
        <View className="flex-row items-center border border-gray-300 rounded-lg">
          <TouchableOpacity
            className="w-12 h-12 items-center justify-center"
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Text className="text-primary text-2xl font-bold">−</Text>
          </TouchableOpacity>
          <Text className="text-text text-lg font-bold min-w-[40px] text-center">
            {quantity}
          </Text>
          <TouchableOpacity
            className="w-12 h-12 items-center justify-center"
            onPress={() => setQuantity(quantity + 1)}
          >
            <Text className="text-primary text-2xl font-bold">+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className={`flex-1 h-12 flex-row items-center justify-center space-x-2 rounded-lg ${isAddToCartDisabled ? "bg-gray-400" : "bg-primary"}`}
          onPress={handleAddToCart}
          disabled={isAddToCartDisabled}
        >
          <ShoppingCart size={20} color="white" />
          <Text className="text-white text-base font-bold">
            {getButtonText()}
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
