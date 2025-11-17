// components/DealsCarousel.tsx
import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Product } from "@/integrations/supabase/products";
import { formatCurrency } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react-native";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

// We'll define the width of our carousel items.
// A value around 70-75% of the screen width often looks best for this effect.
const ITEM_WIDTH = width * 0.7;

interface DealsCarouselProps {
  products: Product[];
}

// The Product Card now contains the styling from your screenshot
const ProductCard = ({ product }: { product: Product }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100"
      onPress={() => router.push(`/product/${product.id}` as any)}
    >
      <Image
        source={{ uri: product.main_image_url || "https://via.placeholder.com/150" }}
        className="w-full h-full"
        contentFit="cover"
      />
      {/* Absolute positioned overlay for price and wishlist */}
      <View className="absolute top-3 w-full px-3 flex-row justify-between items-center">
        <View className="bg-primary/90 px-3 py-1 rounded-full">
          <Text className="text-white font-bold text-sm">
            {formatCurrency(product.price)}
          </Text>
        </View>
        <TouchableOpacity className="w-9 h-9 bg-white/80 rounded-full items-center justify-center">
          <Heart size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const DealsCarousel: React.FC<DealsCarouselProps> = ({ products }) => {
  const carouselRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!products || products.length === 0) {
    return null; // Or render an empty state
  }

  const showControls = products.length > 1;

  return (
    <View className="relative">
      <Carousel
        ref={carouselRef}
        // The total width of the Carousel component itself
        width={width}
        // The height of a single item
        height={width * 0.8}
        // The data for the carousel
        data={products}
        // Enable infinite looping
        loop={true}
        // Optional: auto-play feature
        autoPlay={true}
        autoPlayInterval={4000}
        // The function that renders each item
        renderItem={({ item }) => <ProductCard product={item} />}
        // Callback for when an item snaps into place
        onSnapToItem={(index) => setActiveIndex(index)}
        // --- THIS IS THE MAGIC FOR THE VISUAL EFFECT ---
        mode="parallax"
        modeConfig={{
          // How much the adjacent (inactive) slides should be scaled down. 0.8 means 80% of original size.
          parallaxScrollingScale: 0.82,
          // How much the adjacent slides should be visible. A larger number means they are further apart.
          parallaxScrollingOffset: 60,
        }}
      />

      {/* Navigation Arrows */}
      {showControls && (
        <>
          <TouchableOpacity
            onPress={() => carouselRef.current?.prev()}
            className="absolute left-4 top-1/2 p-2.5 bg-white/90 rounded-full shadow-lg"
            style={{ transform: [{ translateY: -20 }] }}
          >
            <ChevronLeft size={22} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => carouselRef.current?.next()}
            className="absolute right-4 top-1/2 p-2.5 bg-white/90 rounded-full shadow-lg"
            style={{ transform: [{ translateY: -20 }] }}
          >
            <ChevronRight size={22} color={Colors.text} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default DealsCarousel;