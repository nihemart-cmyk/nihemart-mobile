import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data: categories = [] } = useCategories();
  const category = categories.find((c) => c.id === id);

  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useProducts({ category: id as string, limit: 10 });

  const categoryProducts = (productsData as any)?.pages.flatMap((page: any) => page.products) || [];

  if (!category) {
    return (
      <>
        <Stack.Screen options={{ title: 'Category' }} />
        <View className="flex-1 bg-background items-center justify-center">
          <Text className="text-lg text-textSecondary">Category not found</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: category.name }} />
      <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: category.icon_url || 'https://via.placeholder.com/150' }}
          className="w-full h-48"
          contentFit="cover"
        />
        <View className="absolute top-0 left-0 right-0 h-48 bg-black bg-opacity-40 justify-center items-center">
          <Text className="text-3xl font-bold text-white mb-2">{category.name}</Text>
          <Text className="text-lg text-white opacity-90">{categoryProducts.length} Products</Text>
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={categoryProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            renderItem={({ item: product }) => (
              <TouchableOpacity
                className="flex-1 m-2 mb-4 bg-white rounded-xl overflow-hidden shadow-sm"
                onPress={() => router.push(`/product/${product.id}` as any)}
              >
                <Image
                  source={{ uri: product.main_image_url || 'https://via.placeholder.com/150' }}
                  className="w-full h-40"
                  contentFit="cover"
                />
                <View className="p-3">
                  <Text className="text-primary text-xl font-bold">
                    FRW {product.price}
                  </Text>
                  <Text
                    className="text-text text-base truncate font-medium"
                    numberOfLines={2}
                  >
                    {product.name}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4 items-center">
                  <Text className="text-textSecondary">Loading more...</Text>
                </View>
              ) : null
            }
          />
        )}
      </ScrollView>
    </>
  );
}

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: Colors.background },
//   errorContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
//   errorText: { fontSize: 18, color: Colors.textSecondary },
//   headerImage: { width: width, height: 200 },
//   headerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 200, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center' },
//   categoryTitle: { fontSize: 32, fontWeight: 'bold', color: Colors.white, marginBottom: 8 },
//   productCount: { fontSize: 16, color: Colors.white, opacity: 0.9 },
//   content: { padding: 8 },
//   productsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
//   productCard: { width: (width - 48) / 2, marginHorizontal: 8, marginVertical: 8, backgroundColor: Colors.white, borderRadius: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
//   productImage: { width: '100%', height: 160 },
//   discountBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: Colors.secondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
//   discountText: { color: Colors.white, fontSize: 12, fontWeight: 'bold' },
//   productInfo: { padding: 12 },
//   productName: { fontSize: 14, color: Colors.text, marginBottom: 8, height: 40 },
//   priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   productPrice: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
//   originalPrice: { fontSize: 14, color: Colors.textSecondary, textDecorationLine: 'line-through' },
// });
