import Colors from "@/constants/colors";
import { Product } from "@/integrations/supabase/products";
import { formatCurrency } from "@/lib/utils";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Heart, Tag } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

const ITEM_WIDTH = width * 0.85;
const ITEM_HEIGHT = ITEM_WIDTH * 0.72;

interface DealsCarouselProps {
  products: Product[];
}

const ProductCard = ({
  product,
  index,
}: {
  product: Product;
  index: number;
}) => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      className="w-full h-full"
    >
      <TouchableOpacity
        activeOpacity={0.95}
        className="w-full h-full rounded-3xl overflow-hidden"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
        }}
        onPress={() => router.push(`/product/${product.id}` as any)}
      >
        {/* Image Container */}
        <View className="w-full h-full relative">
          <Image
            source={{
              uri: product.main_image_url || "https://via.placeholder.com/400",
            }}
            className="w-full h-full"
            contentFit="cover"
            transition={300}
          />

          {/* Top Gradient for better text readability */}
          <LinearGradient
            colors={["rgba(0,0,0,0.5)", "transparent"]}
            className="absolute top-0 left-0 right-0"
            style={{ height: 120 }}
          />

          {/* Bottom Gradient for product info */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.75)"]}
            className="absolute bottom-0 left-0 right-0"
            style={{ height: 160 }}
          />
        </View>

        {/* Top Controls */}
        <View className="absolute top-4 left-4 right-4 flex-row justify-between items-center z-10">
          {/* Price Badge */}
          <View
            className="flex-row items-center px-4 py-2.5 rounded-full"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Tag size={14} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text
              className="font-bold text-base"
              style={{ color: Colors.primary }}
            >
              {formatCurrency(product.price)}
            </Text>
          </View>

          {/* Wishlist Button */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Heart
              size={20}
              color={isFavorite ? "#EF4444" : Colors.textSecondary}
              fill={isFavorite ? "#EF4444" : "none"}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info at Bottom */}
        <View className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <Text
            className="text-white font-bold text-xl mb-1"
            numberOfLines={2}
            style={{
              textShadowColor: "rgba(0, 0, 0, 0.3)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {product.name}
          </Text>
          {product.description && (
            <Text
              className="text-white/90 text-sm"
              numberOfLines={2}
              style={{
                textShadowColor: "rgba(0, 0, 0, 0.3)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              {product.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const DealsCarousel: React.FC<DealsCarouselProps> = ({ products }) => {
  const carouselRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Add console log to debug
  console.log("[DealsCarousel] Products received:", products?.length);
  console.log(
    "[DealsCarousel] products sample:",
    products && products.slice(0, 3)
  );

  // If there are no products, render a simple placeholder so the UI indicates absence
  if (!products || products.length === 0) {
    console.log("[DealsCarousel] No products to display");
    return (
      <View className="w-full items-center py-6">
        <Text className="text-gray-400">No deals available right now.</Text>
      </View>
    );
  }

  const showControls = products.length > 1;
  const sidePadding = (width - ITEM_WIDTH) / 2;

  return (
    <View className="relative mb-4">
      {/* Carousel Container */}
      <View style={{ paddingHorizontal: sidePadding }}>
        <Carousel
          ref={carouselRef}
          width={ITEM_WIDTH}
          height={ITEM_HEIGHT}
          data={products}
          loop={products.length > 1}
          autoPlay={products.length > 1}
          autoPlayInterval={5000}
          renderItem={({ item, index }) => (
            <ProductCard product={item} index={index} />
          )}
          onSnapToItem={(index) => setActiveIndex(index)}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.92,
            parallaxScrollingOffset: 50,
          }}
        />
      </View>

      {/* Modern Navigation Arrows */}
      {showControls && (
        <>
          <TouchableOpacity
            onPress={() => carouselRef.current?.prev()}
            className="absolute left-4 p-3 rounded-full"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              top: "50%",
              marginTop: -24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <ChevronLeft size={24} color={Colors.text} strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => carouselRef.current?.next()}
            className="absolute right-4 p-3 rounded-full"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              top: "50%",
              marginTop: -24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <ChevronRight size={24} color={Colors.text} strokeWidth={2.5} />
          </TouchableOpacity>
        </>
      )}

      {/* Pagination Dots */}
      {showControls && (
        <View
          className="flex-row justify-center items-center mt-5"
          style={{ columnGap: 8 }}
        >
          {products.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() =>
                carouselRef.current?.scrollTo({ index, animated: true })
              }
              className="h-2 rounded-full"
              style={{
                width: activeIndex === index ? 24 : 8,
                backgroundColor:
                  activeIndex === index
                    ? Colors.primary
                    : Colors.textSecondary + "40",
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default DealsCarousel;
