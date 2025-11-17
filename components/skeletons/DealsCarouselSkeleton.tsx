// components/skeletons/DealsCarouselSkeleton.tsx
import React from "react";
import { View, ScrollView } from "react-native";

const DealsCarouselSkeleton = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      {Array(3)
        .fill(0)
        .map((_, index) => (
          <View
            key={index}
            className="w-56 h-64 bg-gray-200 rounded-xl mr-4 animate-pulse"
          />
        ))}
    </ScrollView>
  );
};

export default DealsCarouselSkeleton;