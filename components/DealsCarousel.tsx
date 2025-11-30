import Colors from "@/constants/colors";
import { Product } from "@/integrations/supabase/products";
import { formatCurrency } from "@/lib/utils";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

// We'll define the width of our carousel items.
// A value around 70-75% of the screen width often looks best for this effect.
// Show the active item centered and reveal parts of neighbors by using
// an item width slightly smaller than the screen and padding the carousel container
// Keep the active item visually unshrunk by using a parallax scale near 1.
const ITEM_WIDTH = width * 0.82;

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
        source={{
          uri: product.main_image_url || "https://via.placeholder.com/150",
        }}
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

  // side padding so the center item sits in the middle of the screen
  const sidePadding = (width - ITEM_WIDTH) / 2;

  return (
    <View className="relative" style={{ paddingHorizontal: sidePadding }}>
      <Carousel
        ref={carouselRef}
        // width of each item (smaller than screen to reveal neighbors)
        width={ITEM_WIDTH}
        // keep a pleasant aspect ratio
        height={ITEM_WIDTH * 0.75}
        data={products}
        loop={true}
        autoPlay={true}
        autoPlayInterval={4000}
        renderItem={({ item }) => <ProductCard product={item} />}
        onSnapToItem={(index) => setActiveIndex(index)}
        mode="parallax"
        modeConfig={{
          // keep the active slide at full size and scale adjacent slides minimally
          parallaxScrollingScale: 0.98,
          // offset for parallax effect (adjusted for ITEM_WIDTH)
          parallaxScrollingOffset: 40,
        }}
      />

      {/* Navigation Arrows */}
      {showControls && (
        <>
          <TouchableOpacity
            onPress={() => carouselRef.current?.prev()}
            className="absolute left-1 top-1/2 p-2.5 bg-white/90 rounded-full shadow-lg"
            style={{ transform: [{ translateY: -20 }] }}
          >
            <ChevronLeft size={22} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => carouselRef.current?.next()}
            className="absolute right-1 top-1/2 p-2.5 bg-white/90 rounded-full shadow-lg"
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
