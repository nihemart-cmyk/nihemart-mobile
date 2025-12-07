import Colors from "@/constants/colors";
import { useDebounce } from "@/hooks/use-debounce";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { useSubcategories } from "@/hooks/useSubcategories";
import { useWishlistStore } from "@/store/wishlist.store";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { Heart, Search, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

export default function AllProductsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { wishlistItems, addToWishlist, removeFromWishlist, isInWishlist } =
    useWishlistStore();

  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const { data: subcategoriesData, isLoading: subcategoriesLoading } =
    useSubcategories({
      category_id: selectedCategory || undefined,
    });

  const subcategories = subcategoriesData?.data || [];

  const productOptions = useMemo(
    () => ({
      search: debouncedSearchQuery.trim(),
      category: selectedCategory || undefined,
      subcategory: selectedSubcategory || undefined,
      limit: 20,
    }),
    [debouncedSearchQuery, selectedCategory, selectedSubcategory]
  );

  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useProducts(productOptions);

  const products =
    (productsData as any)?.pages.flatMap((page: any) => page.products) || [];
  const totalProducts = (productsData as any)?.pages[0]?.pagination?.total || 0;

  const clearSearch = () => {
    setSearchQuery("");
  };

  const clearCategory = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const clearSubcategory = () => {
    setSelectedSubcategory(null);
  };

  const handleWishlistToggle = async (product: any, e: any) => {
    e.stopPropagation();

    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
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
        reviews: product.reviews || 0,
        inStock: true,
        brand: "",
      };
      await addToWishlist(wishlistProduct);
      Toast.show({
        type: "success",
        text1: t("common.addedToWishlist"),
        duration: 2000,
      });
    }
  };

  const renderProduct = ({ item: product }: { item: any }) => {
    const inWishlist = isInWishlist(product.id);

    return (
      <TouchableOpacity
        className="flex-1 m-2 mb-4 bg-white rounded-xl overflow-hidden shadow-sm relative"
        onPress={() => router.push(`/product/${product.id}` as any)}
      >
        <Image
          source={{
            uri: product.main_image_url || "https://via.placeholder.com/150",
          }}
          className="w-full h-40"
          contentFit="cover"
        />
        {product.compare_at_price &&
          product.compare_at_price > product.price && (
            <View className="absolute top-2 right-12 bg-secondary px-2 py-1 rounded">
              <Text className="text-white text-xs font-bold">
                {Math.round(
                  (1 - product.price / product.compare_at_price) * 100
                )}
                % OFF
              </Text>
            </View>
          )}
        <TouchableOpacity
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md"
          onPress={(e) => handleWishlistToggle(product, e)}
        >
          <Heart
            size={20}
            color={inWishlist ? "#FF4757" : "#999"}
            fill={inWishlist ? "#FF4757" : "none"}
            strokeWidth={1.5}
          />
        </TouchableOpacity>
        <View className="p-2">
          <Text className="text-text text-sm mb-1" numberOfLines={1}>
            {product.name}
          </Text>
          <View className="flex-row items-center space-x-2">
            {product.compare_at_price &&
              product.compare_at_price > product.price && (
                <Text className="text-textSecondary text-sm line-through">
                  RWF {product.compare_at_price}
                </Text>
              )}
            <Text className="text-primary text-base font-bold">
              RWF {product.price}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryChip = ({ item: category }: { item: any }) => (
    <TouchableOpacity
      className={`px-4 py-2 rounded-full mr-2 mb-2 ${
        selectedCategory === category.id
          ? "bg-primary"
          : "bg-gray-100 border border-gray-300"
      }`}
      onPress={() =>
        setSelectedCategory(
          selectedCategory === category.id ? null : category.id
        )
      }
    >
      <Text
        className={`text-sm font-medium ${
          selectedCategory === category.id ? "text-white" : "text-text"
        }`}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  if (isError) {
    return (
      <>
        <Stack.Screen options={{ title: "All Products" }} />
        <View className="flex-1 bg-background items-center justify-center">
          <Text className="text-lg text-red-500 mb-4">
            Failed to load products
          </Text>
          <TouchableOpacity
            className="bg-primary px-4 py-2 rounded-lg"
            onPress={() => window.location.reload()}
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "All Products" }} />
      <View className="flex-1 bg-background">
        {/* Search Bar */}
        <View className="p-4 bg-white border-b border-border">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2 gap-2">
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              className="flex-1 text-base text-text"
              placeholder="Search products..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories Filter */}
        {!categoriesLoading && categories.length > 0 && (
          <View className="px-4 py-2 bg-white border-b border-border">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                  selectedCategory === null
                    ? "bg-primary"
                    : "bg-gray-100 border border-gray-300"
                }`}
                onPress={clearCategory}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedCategory === null ? "text-white" : "text-text"
                  }`}
                >
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                    selectedCategory === category.id
                      ? "bg-primary"
                      : "bg-gray-100 border border-gray-300"
                  }`}
                  onPress={() =>
                    setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )
                  }
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedCategory === category.id
                        ? "text-white"
                        : "text-text"
                    }`}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Subcategories Filter */}
        {selectedCategory &&
          !subcategoriesLoading &&
          subcategories.length > 0 && (
            <View className="px-4 py-2 bg-white border-b border-border">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                    selectedSubcategory === null
                      ? "bg-secondary"
                      : "bg-gray-100 border border-gray-300"
                  }`}
                  onPress={clearSubcategory}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedSubcategory === null ? "text-white" : "text-text"
                    }`}
                  >
                    All{" "}
                    {categories.find((c) => c.id === selectedCategory)?.name}
                  </Text>
                </TouchableOpacity>
                {subcategories.map((subcategory) => (
                  <TouchableOpacity
                    key={subcategory.id}
                    className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                      selectedSubcategory === subcategory.id
                        ? "bg-secondary"
                        : "bg-gray-100 border border-gray-300"
                    }`}
                    onPress={() =>
                      setSelectedSubcategory(
                        selectedSubcategory === subcategory.id
                          ? null
                          : subcategory.id
                      )
                    }
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selectedSubcategory === subcategory.id
                          ? "text-white"
                          : "text-text"
                      }`}
                    >
                      {subcategory.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

        {/* Products Count */}
        <View className="px-4 py-2 bg-white">
          <Text className="text-base text-textSecondary">
            {isLoading ? "Loading..." : `${totalProducts} products found`}
          </Text>
        </View>

        {/* Products Grid */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : products.length === 0 ? (
          <View className="flex-1 justify-center items-center px-4">
            <Text className="text-lg text-textSecondary text-center mb-4">
              {debouncedSearchQuery || selectedCategory
                ? "No products found matching your criteria"
                : "No products available"}
            </Text>
            {(debouncedSearchQuery ||
              selectedCategory ||
              selectedSubcategory) && (
              <TouchableOpacity
                className="bg-primary px-4 py-2 rounded-lg"
                onPress={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                }}
              >
                <Text className="text-white font-medium">Clear filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={{
              paddingHorizontal: 8,
              paddingBottom: 80,
            }}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            renderItem={renderProduct}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text className="text-textSecondary mt-2">
                    Loading more...
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </>
  );
}

// Original StyleSheet kept for reference
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: Colors.background },
//   header: { padding: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
//   title: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
//   subtitle: { fontSize: 16, color: Colors.textSecondary },
//   productsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
//   productCard: { width: (width - 48)/2, marginHorizontal: 8, marginVertical: 8, backgroundColor: Colors.white, borderRadius: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
//   productImage: { width: '100%', height: 160 },
//   discountBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: Colors.secondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
//   discountText: { color: Colors.white, fontSize: 12, fontWeight: 'bold' },
//   productInfo: { padding: 12 },
//   productName: { fontSize: 14, color: Colors.text, marginBottom: 8, height: 40 },
//   priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   productPrice: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
//   originalPrice: { fontSize: 14, color: Colors.textSecondary, textDecorationLine: 'line-through' },
// });
