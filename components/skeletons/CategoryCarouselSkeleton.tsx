// components/skeletons/CategoryCarouselSkeleton.tsx
import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";

const CategoryCarouselSkeleton = () => {
  const { t } = useTranslation();

  return (
    <View className="py-5">
      <View className="flex-row justify-between items-center px-4 mb-4">
        <Text className="text-text text-2xl font-bold">
          {t("categories.title")}
        </Text>
        <Text className="text-primary text-sm font-semibold">
          {t("home.viewAll")}
        </Text>
      </View>
      <View className="px-4">
        <View className="flex-row flex-wrap justify-between">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <View
                key={index}
                className="w-[48%] h-28 bg-gray-200 rounded-xl mb-3 animate-pulse"
              />
            ))}
        </View>
      </View>
    </View>
  );
};

export default CategoryCarouselSkeleton;