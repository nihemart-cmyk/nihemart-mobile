import DealsCarousel from "@/components/DealsCarousel";
import SearchOverlay from "@/components/SearchOverlay";
import DealsCarouselSkeleton from "@/components/skeletons/DealsCarouselSkeleton";
import HomeScreenSkeleton from "@/components/skeletons/HomeScreenSkeleton";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/integrations/supabase/products";
import { Image } from "expo-image";
import { router, useRouter } from "expo-router";
import { Bell, Heart, Search } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// Header component for content above the products list
const HomeScreenHeader = ({
  featuredProducts,
  isFeaturedLoading,
}: {
  featuredProducts: Product[];
  isFeaturedLoading: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Deals/Promo Section */}
      <View className="py-4 px-4">
        {/* <Text className="text-text text-2xl font-bold">{t("home.under15k")} 15k</Text> */}
        {isFeaturedLoading ? (
          <DealsCarouselSkeleton />
        ) : (
          // <DealsCarousel products={featuredProducts} />
          <DealsCarousel />
        )}
      </View>

      {/* "New Arrivals" Title Section */}
      <View className="pt-2 pb-3 px-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-text text-2xl font-bold">{t("home.new")}</Text>
          <TouchableOpacity onPress={() => router.push("/products" as any)}>
            <Text className="text-[#6C5CE7] text-base font-semibold">
              See All
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default function HomeScreen() {
  const { isOffline } = useApp();
  const router = useRouter();
  const { t } = useTranslation();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  // Animation ref for smooth indicator movement
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  const animateTabSwitch = (tab: string) => {
    setActiveTab(tab);

    Animated.timing(indicatorPosition, {
      toValue: tab === "home" ? 0 : 1,
      duration: 400,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  const { data: categories = [], isLoading: isCategoriesLoading } =
    useCategories();

  // fetch deals: products under 15,000
  const { data: featuredData, isLoading: isFeaturedLoading } = useProducts({
    maxPrice: 15000,
    limit: 6,
  });
  const featuredProducts: Product[] =
    (featuredData as { pages: { products: Product[] }[] })?.pages.flatMap(
      (page) => page.products
    ) || [];

  // Debug: log featured data to help troubleshoot empty carousel
  console.log("[HomeScreen] featuredData pages:", (featuredData as any)?.pages);
  console.log("[HomeScreen] featuredProducts count:", featuredProducts.length);

  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useProducts({ limit: 10 });

  const allProducts: Product[] =
    (productsData as { pages: { products: Product[] }[] })?.pages.flatMap(
      (page) => page.products
    ) || [];

  // Show skeleton only on the very first initial load
  if (isLoading && !allProducts.length) {
    return <HomeScreenSkeleton />;
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-white p-5">
        <View className="flex-row justify-between items-center">
          {/* User Greeting with Avatar */}
          <View className="flex-row items-center flex-1">
            <View className="w-16 h-16 rounded-full bg-gray-200 mr-3 overflow-hidden">
              <Image
                source={{ uri: "https://via.placeholder.com/64" }}
                className="w-full h-full"
                contentFit="cover"
              />
            </View>
            <View>
              <Text className="text-text text-lg font-bold">Hi, Jonathan</Text>
              <Text className="text-gray-400 text-sm">Let's go shopping</Text>
            </View>
          </View>
          {/* Search and Bell Icons */}
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => setIsSearchVisible(true)}>
              <Search size={26} color={Colors.text} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity className="relative">
              <Bell size={26} color={Colors.text} strokeWidth={2} />
              {/* Notification Badge */}
              <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Home/Category Tabs */}
      <View className="bg-white border-b border-gray-100 w-full">
        <View className="flex-row px-5">
          <TouchableOpacity
            className="flex-1 items-center py-2"
            onPress={() => animateTabSwitch("home")}
            activeOpacity={0.7}
          >
            <Text
              className={`font-bold text-lg ${
                activeTab === "home" ? "text-text" : "text-gray-500"
              }`}
            >
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 items-center py-2"
            onPress={() => animateTabSwitch("category")}
            activeOpacity={0.7}
          >
            <Text
              className={`font-bold text-lg ${
                activeTab === "category" ? "text-text" : "text-gray-500"
              }`}
            >
              Category
            </Text>
          </TouchableOpacity>
        </View>

        {/* Animated Indicator Bar (width and marginLeft interpolate per tab) */}
        <Animated.View
          style={{
            height: 4,
            width: indicatorPosition.interpolate({
              inputRange: [0, 1],
              outputRange: [150, 150],
            }),
            backgroundColor: "#6C5CE7",
            borderRadius: 2,
            marginLeft: indicatorPosition.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 190],
            }),
          }}
        />
      </View>

      {/* Main Content */}
      {activeTab === "home" ? (
        <FlatList
          key="home-list"
          data={allProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          ListHeaderComponent={
            <HomeScreenHeader
              featuredProducts={featuredProducts}
              isFeaturedLoading={isFeaturedLoading}
            />
          }
          contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 80 }}
          columnWrapperStyle={{ paddingHorizontal: 8 }}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          renderItem={({ item: product }) => (
            <TouchableOpacity
              className="flex-1 m-2 mb-4 bg-white rounded-2xl overflow-hidden"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
              onPress={() => router.push(`/product/${product.id}` as any)}
            >
              <View className="relative">
                <Image
                  source={{
                    uri:
                      product.main_image_url ||
                      "https://via.placeholder.com/150",
                  }}
                  className="w-full h-36"
                  contentFit="cover"
                />
                <TouchableOpacity className="absolute top-3 right-3 w-10 h-10 bg-white/90 rounded-full items-center justify-center">
                  <Heart size={18} color="#999" strokeWidth={2} />
                </TouchableOpacity>
              </View>
              <View className="p-3">
                <Text className="text-text text-lg font-bold" numberOfLines={1}>
                  {product.name}
                </Text>
                {/* <Text
                  className="text-gray-400 text-sm mt-0.5"
                  numberOfLines={1}
                >
                  Brand Name
                </Text> */}
                <Text className="text-primary text-base font-bold mt-1">
                  FRW {product.price}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4 items-center">
                <Text className="text-textSecondary">Loading more...</Text>
              </View>
            ) : null
          }
        />
      ) : (
        <FlatList
          key="category-list"
          data={categories}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{
            // paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 80,
          }}
          // columnWrapperStyle={{ paddingHorizontal: 2 }}
          scrollEnabled
          renderItem={({ item: category }) => (
            <TouchableOpacity
              className="flex-1 m-2 bg-white rounded-2xl overflow-hidden items-center p-6"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
              onPress={() =>
                router.push(`/products?categories=${category.id}` as any)
              }
            >
              <View className="w-32 h-20 items-center justify-center mb-4">
                <Image
                  source={{
                    uri: category.icon_url || "https://via.placeholder.com/150",
                  }}
                  className="w-full h-full"
                  contentFit="contain"
                />
              </View>
              <Text className="text-text text-base font-semibold text-center">
                {category.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      <SearchOverlay
        visible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
      />
    </View>
  );
}
