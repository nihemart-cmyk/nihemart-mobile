import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { products } from '@/mocks/products';
import { categories } from '@/mocks/categories';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const category = categories.find((c) => c.id === id);
  const categoryProducts = products.filter((p) => p.category === category?.name);

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
          source={{ uri: category.image }}
          className="w-full h-48"
          contentFit="cover"
        />
        <View className="absolute top-0 left-0 right-0 h-48 bg-black bg-opacity-40 justify-center items-center">
          <Text className="text-3xl font-bold text-white mb-2">{category.name}</Text>
          <Text className="text-lg text-white opacity-90">{categoryProducts.length} Products</Text>
        </View>

        <View className="p-2">
          <View className="grid grid-cols-2 gap-2">
            {categoryProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                className="px-2 py-2 mb-2 bg-white rounded-xl overflow-hidden shadow-sm"
                onPress={() => router.push(`/product/${product.id}` as any)}
              >
                <Image
                  source={{ uri: product.image }}
                  className="w-full h-40"
                  contentFit="cover"
                />
                {product.discountPrice && (
                  <View className="absolute top-2 right-2 bg-primary px-2 py-1 rounded-lg">
                    <Text className="text-white text-xs font-bold">
                      {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                    </Text>
                  </View>
                )}
                <View className="p-3">
                  <Text className="text-sm text-text mb-2 h-10" numberOfLines={2}>
                    {product.name}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    {product.discountPrice && (
                      <Text className="text-sm text-textSecondary line-through">
                        ₹{product.price}
                      </Text>
                    )}
                    <Text className="text-lg font-bold text-primary">
                      ₹{product.discountPrice || product.price}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
