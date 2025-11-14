import React from "react";
import { View, ScrollView } from "react-native";
import Colors from "@/constants/colors";

// A small helper component for individual placeholder blocks
const Placeholder = ({ className }: { className?: string }) => {
  return <View className={`bg-gray-200 rounded-md ${className}`} />;
};

const HomeScreenSkeleton = () => {
  return (
    <View className="flex-1 bg-background">
      {/* Skeleton for Header */}
      <View className="bg-primary px-4 pt-4 pb-5 rounded-b-3xl">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-1">
            <Placeholder className="h-4 w-1/4" />
            <Placeholder className="h-8 w-3/4 mt-3" />
          </View>
          <View className="w-12 h-12 rounded-full bg-white/20" />
        </View>
        <Placeholder className="h-12 w-full rounded-xl" />
      </View>

      {/* The rest of the content will pulse */}
      <View className="flex-1 animate-pulse">
        {/* Skeleton for Categories */}
        <View className="py-5">
          <View className="flex-row justify-between items-center px-4 mb-4">
            <Placeholder className="h-7 w-1/3" />
            <Placeholder className="h-4 w-1/6" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
            <Placeholder className="w-36 h-24 mr-3 rounded-xl" />
            <Placeholder className="w-36 h-24 mr-3 rounded-xl" />
            <Placeholder className="w-36 h-24 mr-3 rounded-xl" />
          </ScrollView>
        </View>

        {/* Skeleton for Deals */}
        <View className="py-5">
          <View className="flex-row items-center px-4 mb-4">
            <Placeholder className="h-7 w-1/2" />
          </View>
          <View className="px-2 grid grid-cols-2 gap-4">
            <View>
              <Placeholder className="w-full h-40 rounded-xl" />
              <Placeholder className="h-4 w-full mt-2" />
              <Placeholder className="h-4 w-2/3 mt-2" />
            </View>
            <View>
              <Placeholder className="w-full h-40 rounded-xl" />
              <Placeholder className="h-4 w-full mt-2" />
              <Placeholder className="h-4 w-2/3 mt-2" />
            </View>
          </View>
        </View>

         {/* Skeleton for All Products Title */}
        <View className="pt-5 pb-2">
            <View className="flex-row justify-between items-center px-4 mb-2">
                <Placeholder className="h-7 w-1/3" />
            </View>
        </View>

      </View>
    </View>
  );
};

export default HomeScreenSkeleton;