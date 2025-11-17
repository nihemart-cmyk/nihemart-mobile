// components/skeletons/ProductDetailSkeleton.tsx
import React from 'react';
import { View, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const ProductDetailSkeleton = () => {
  return (
    <View className="flex-1 bg-background">
      {/* Image Skeleton */}
      <View className="bg-gray-200" style={{ width, height: width }} />
      <View className="flex-row p-4 space-x-2">
        <View className="w-20 h-20 bg-gray-200 rounded-lg" />
        <View className="w-20 h-20 bg-gray-200 rounded-lg" />
        <View className="w-20 h-20 bg-gray-200 rounded-lg" />
      </View>

      {/* Info Skeleton */}
      <View className="p-4 space-y-4">
        <View className="h-8 w-3/4 bg-gray-200 rounded" />
        <View className="h-6 w-1/2 bg-gray-200 rounded" />
        <View className="h-10 w-1/3 bg-gray-200 rounded" />
        <View className="h-12 w-full bg-gray-200 rounded-lg" />
        <View className="h-12 w-full bg-gray-200 rounded-lg" />
      </View>
    </View>
  );
};

export default ProductDetailSkeleton;