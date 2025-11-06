import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { categories } from "@/mocks/categories";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Search, ShoppingBag, TrendingUp, WifiOff } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const { cartItemsCount, cachedProducts, isOffline } = useApp();
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const products = cachedProducts;
  const featuredProducts = products.filter((p) => p.discountPrice).slice(0, 6);

  return (
    <View className="flex-1 bg-background">
      <View className="bg-primary px-4 pt-4 pb-5 rounded-b-3xl">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-1">
            <Text className="text-white opacity-90 text-base">Hello!</Text>
            <Text className="text-white text-3xl mt-2">
              {t("home.welcome")}
            </Text>
            {isOffline && (
              <View className="flex-row items-center gap-1 mt-1">
                <WifiOff size={12} color={Colors.white} />
                <Text className="text-white opacity-90 text-sm font-medium">
                  {t("common.offline")}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            className="w-12 h-12 rounded-full bg-white/20 items-center justify-center"
            onPress={() => router.push("/(tabs)/cart" as any)}
          >
            <ShoppingBag size={24} color={Colors.white} />
            {cartItemsCount > 0 && (
              <View className="absolute top-1 right-1 bg-secondary w-5 h-5 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {cartItemsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-white rounded-xl px-3 py-3 gap-2">
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            className="flex-1 text-base text-text"
            placeholder={t("home.searchPlaceholder")}
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="py-5">
          <View className="flex-row justify-between items-center px-4 mb-4">
            <Text className="text-text text-2xl font-bold">
              {t("categories.title")}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/categories" as any)}
            >
              <Text className="text-primary text-sm font-semibold">
                {t("home.viewAll")}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pl-4"
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                className="w-36 h-24 mr-3 rounded-xl overflow-hidden"
                onPress={() => router.push(`/category/${category.id}` as any)}
              >
                <Image
                  source={{ uri: category.image }}
                  className="w-full h-full"
                  contentFit="cover"
                />
                <View className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Text className="text-white text-lg font-bold">
                    {category.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="py-5">
          <View className="flex-row justify-between items-center px-4 mb-4">
            <View className="flex-row items-center gap-2">
              <TrendingUp size={20} color={Colors.primary} />
              <Text className="text-text text-2xl font-bold">
                {t("home.deals")}
              </Text>
            </View>
          </View>
          <View className="px-2 grid grid-cols-2 gap-2">
            {featuredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                className="w-42 mb-4 bg-white rounded-xl overflow-hidden shadow-sm"
                onPress={() => router.push(`/product/${product.id}` as any)}
              >
                <Image
                  source={{ uri: product.image }}
                  className="w-full h-40"
                  contentFit="cover"
                />
                {product.discountPrice && (
                  <View className="absolute top-2 right-2 bg-primary px-2 py-1 rounded-lg">
                    <Text className="text-white text-xs font-bold">
                      FRW {product.discountPrice || product.price}
                    </Text>
                  </View>
                )}
                <View className="p-3">
                  <Text
                    className="text-text text-base truncate"
                    // numberOfLines={2}
                  >
                    {product.name}
                  </Text>
                  {/* <View className="flex-row items-center">
                    {product.discountPrice && (
                      <Text className="text-textSecondary text-sm line-through">₹{product.price}</Text>
                    )}
                    <Text className="text-primary text-xl font-bold">
                      FRW {product.discountPrice || product.price}
                    </Text>
                  </View> */}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="py-5">
          <View className="flex-row justify-between items-center px-4 mb-4">
            <Text className="text-text text-2xl font-bold">
              {t("home.allProducts")}
            </Text>
            <TouchableOpacity onPress={() => router.push("/products" as any)}>
              <Text className="text-primary text-sm font-semibold">
                {t("home.viewAll")}
              </Text>
            </TouchableOpacity>
          </View>
          <View className="px-2 grid grid-cols-2 gap-2">
            {products.slice(0, 8).map((product) => (
              <TouchableOpacity
                key={product.id}
                className="w-42 mb-4 bg-white rounded-xl overflow-hidden shadow-sm"
                onPress={() => router.push(`/product/${product.id}` as any)}
              >
                <Image
                  source={{ uri: product.image }}
                  className="w-full h-40"
                  contentFit="cover"
                />
                <View className="p-3">
                  <Text className="text-primary text-xl font-bold">
                    FRW {product.discountPrice || product.price}
                  </Text>
                  <Text
                    className="text-text text-base truncate font-medium"
                    // numberOfLines={2}
                  >
                    {product.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: Colors.background },
//   header: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
//   headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
//   greeting: { fontSize: 16, color: Colors.white, opacity: 0.9, fontFamily: Fonts.regular },
//   welcomeText: { fontSize: 24, fontFamily: Fonts.bold, color: Colors.white, marginTop: 2 },
//   cartButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center' },
//   cartBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: Colors.secondary, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
//   cartBadgeText: { color: Colors.white, fontSize: 12, fontFamily: Fonts.bold },
//   offlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
//   offlineText: { fontSize: 12, color: Colors.white, opacity: 0.9, fontFamily: Fonts.medium },
//   searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
//   searchInput: { flex: 1, fontSize: 16, color: Colors.text, fontFamily: Fonts.regular },
//   content: { flex: 1 },
//   section: { paddingVertical: 20 },
//   sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
//   titleWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   sectionTitle: { fontSize: 20, fontFamily: Fonts.bold, color: Colors.text },
//   seeAll: { fontSize: 14, color: Colors.primary, fontFamily: Fonts.semiBold },
//   categoriesScroll: { paddingLeft: 16 },
//   categoryCard: { width: 140, height: 100, marginRight: 12, borderRadius: 12, overflow: 'hidden' },
//   categoryImage: { width: '100%', height: '100%' },
//   categoryOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.3)', justifyContent: 'center', alignItems: 'center' },
//   categoryName: { fontSize: 16, fontFamily: Fonts.bold, color: Colors.white },
//   productsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
//   productCard: { width: (width - 48) / 2, marginHorizontal: 8, marginBottom: 16, backgroundColor: Colors.white, borderRadius: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
//   productImage: { width: '100%', height: 160 },
//   discountBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: Colors.secondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
//   discountText: { color: Colors.white, fontSize: 12, fontFamily: Fonts.bold },
//   productInfo: { padding: 12 },
//   productName: { fontSize: 14, color: Colors.text, marginBottom: 8, height: 40, fontFamily: Fonts.medium },
//   priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   productPrice: { fontSize: 16, fontFamily: Fonts.bold, color: Colors.primary },
//   originalPrice: { fontSize: 14, color: Colors.textSecondary, textDecorationLine: 'line-through', fontFamily: Fonts.regular },
// });
