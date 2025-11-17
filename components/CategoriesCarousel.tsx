// components/CategoriesCarousel.tsx
import React, { useState, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ViewToken,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import Colors from "@/constants/colors";
import type { CategoryLight } from "@/integrations/supabase/categories";

const { width } = Dimensions.get("window");
const ITEM_PER_PAGE = 4; // 2x2 grid

interface CategoriesCarouselProps {
  categories: CategoryLight[];
}

const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
};

const CategoriesCarousel: React.FC<CategoriesCarouselProps> = ({ categories }) => {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const categoryPages = useMemo(() => chunkArray(categories, ITEM_PER_PAGE), [categories]);

  // --- START: THE FIXES ---

  // FIX #1: Use a ref to store the onViewableItemsChanged callback.
  // This ensures the function reference passed to FlatList is stable.
  const onViewableItemsChangedRef = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        // We update the state based on the first visible item
        setActiveIndex(viewableItems[0].index);
      }
    }
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 51,
  }).current;

  // FIX #2: Implement getItemLayout.
  // This removes measurement overhead and makes scrolling/indexing precise.
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: width, // The width of each item is the full screen width
      offset: width * index, // The starting position of the item
      index,
    }),
    []
  );

  // --- END: THE FIXES ---

  const scrollToPage = (index: number) => {
    if (flatListRef.current && index >= 0 && index < categoryPages.length) {
      flatListRef.current.scrollToIndex({ animated: true, index });
    }
  };

  const handleLeftPress = () => {
    scrollToPage(activeIndex - 1);
  };

  const handleRightPress = () => {
    scrollToPage(activeIndex + 1);
  };

  const renderPage = ({ item: page }: { item: CategoryLight[] }) => {
    return (
      <View style={{ width }} className="px-4 flex-row flex-wrap justify-between">
        {page.map((category) => (
          <TouchableOpacity
            key={category.id}
            className="w-[48%] h-28 bg-white border border-blue-100 rounded-xl items-center justify-center mb-3 shadow-sm"
            onPress={() => router.push(`/products?categories=${category.id}` as any)}
          >
            <Image
              source={{ uri: category.icon_url || "https://via.placeholder.com/80" }}
              style={{ width: 60, height: 60 }}
              contentFit="contain"
              className="mb-2"
            />
            <Text className="text-center font-medium text-gray-800 px-2 text-sm" numberOfLines={1}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
        {page.length < ITEM_PER_PAGE &&
          Array(ITEM_PER_PAGE - page.length)
            .fill(0)
            .map((_, idx) => <View key={`empty-${idx}`} className="w-[48%] h-28" />)}
      </View>
    );
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <View className="relative">
      <FlatList
        ref={flatListRef}
        data={categoryPages}
        renderItem={renderPage}
        keyExtractor={(_, index) => `page-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        // --- PASS THE UPDATED PROPS ---
        onViewableItemsChanged={onViewableItemsChangedRef.current} // Pass the function from the ref
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout} // Add the layout prop
        // ---
        decelerationRate="fast"
        bounces={false}
      />

      {/* Navigation Dots */}
      {categoryPages.length > 1 && (
        <View className="flex-row justify-center items-center mt-2 space-x-2">
          {categoryPages.map((_, index) => (
            <TouchableOpacity
              key={`dot-${index}`}
              onPress={() => scrollToPage(index)}
              className={`h-2 rounded-full transition-all ${
                activeIndex === index ? "w-4 bg-primary" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </View>
      )}

      {/* Navigation Arrows */}
      {categoryPages.length > 1 && (
        <>
          {activeIndex > 0 && (
            <TouchableOpacity
              onPress={handleLeftPress}
              className="absolute left-0 top-1/3 p-2 bg-white/80 rounded-full shadow-lg"
              style={{ transform: [{ translateY: -20 }] }}
            >
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          )}
          {activeIndex < categoryPages.length - 1 && (
            <TouchableOpacity
              onPress={handleRightPress}
              className="absolute right-0 top-1/3 p-2 bg-white/80 rounded-full shadow-lg"
              style={{ transform: [{ translateY: -20 }] }}
            >
              <ChevronRight size={24} color={Colors.text} />
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

export default CategoriesCarousel;