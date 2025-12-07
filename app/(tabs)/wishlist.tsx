import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { useWishlistStore } from "@/store/wishlist.store";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Heart, ShoppingCart } from "lucide-react-native";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const cardWidth = (width - 32) / 2;

const Wishlist = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { wishlistItems, loading, loadWishlist, removeFromWishlist } =
    useWishlistStore();
  const { addToCart } = useApp();

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId);
  };

  const handleMoveToCart = async (productId: string) => {
    const product = wishlistItems.find((item) => item.id === productId);
    if (product) {
      await addToCart(product, 1);
      await removeFromWishlist(productId);
    }
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const renderWishlistItem = ({
    item,
  }: {
    item: (typeof wishlistItems)[0];
  }) => {
    const displayPrice = item.discountPrice || item.price;
    const originalPrice = item.discountPrice ? item.price : null;
    const discountPercent = originalPrice
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : null;

    return (
      <TouchableOpacity
        style={[styles.card, { width: cardWidth }]}
        onPress={() => handleProductPress(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode="cover"
          />
          {discountPercent && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercent}%</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={() => handleRemoveFromWishlist(item.id)}
          >
            <Heart size={20} color="#FF4757" fill="#FF4757" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>★ {item.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({item.reviews})</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              RWF {displayPrice.toLocaleString()}
            </Text>
            {originalPrice && (
              <Text style={styles.originalPrice}>
                RWF {originalPrice.toLocaleString()}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => handleMoveToCart(item.id)}
            activeOpacity={0.7}
          >
            <ShoppingCart size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.cartButtonText}>{t("common.addToCart")}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Heart size={64} color={Colors.textSecondary} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>{t("wishlist.empty")}</Text>
      <Text style={styles.emptySubtitle}>{t("wishlist.emptyDescription")}</Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => router.push("/(tabs)")}
      >
        <Text style={styles.exploreButtonText}>
          {t("common.exploreProdcuts")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("common.wishlist")}</Text>
        {wishlistItems.length > 0 && (
          <Text style={styles.itemCount}>{wishlistItems.length}</Text>
        )}
      </View> */}

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>{t("common.loading")}</Text>
        </View>
      ) : wishlistItems.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={wishlistItems}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    fontFamily: "Poppins-Bold",
  },
  itemCount: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontFamily: "Poppins-SemiBold",
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: cardWidth * 1.2,
    backgroundColor: "#F5F5F5",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF4757",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Poppins-Bold",
  },
  wishlistButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
    fontFamily: "Poppins-SemiBold",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Poppins-SemiBold",
  },
  reviews: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Poppins-Regular",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary,
    fontFamily: "Poppins-Bold",
  },
  originalPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
    textDecorationLine: "line-through",
    fontFamily: "Poppins-Regular",
  },
  cartButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  cartButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 16,
    textAlign: "center",
    fontFamily: "Poppins-Bold",
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "Poppins-Regular",
  },
  exploreButton: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  exploreButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Wishlist;
