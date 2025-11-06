import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, Stack } from 'expo-router';
import { products } from '@/mocks/products';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function AllProductsScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'All Products' }} />
      <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
        <View className="p-4 bg-white border-b border-border">
          <Text className="text-2xl font-bold text-text mb-1">All Products</Text>
          <Text className="text-base text-textSecondary">{products.length} items available</Text>
        </View>

        <View className="flex-row flex-wrap p-2">
          {products.map((product) => (
            <TouchableOpacity
              key={product.id}
              className="m-2 bg-white rounded-xl overflow-hidden"
              style={{ width: (width - 48) / 2 }}
              onPress={() => router.push(`/product/${product.id}` as any)}
            >
              <Image
                source={{ uri: product.image }}
                className="w-full"
                style={{ height: 160 }}
                contentFit="cover"
              />
              {product.discountPrice && (
                <View className="absolute top-2 right-2 bg-secondary px-2 py-1 rounded">
                  <Text className="text-white text-xs font-bold">
                    {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                  </Text>
                </View>
              )}
              <View className="p-3">
                <Text className="text-text text-sm mb-2 h-10" numberOfLines={2}>
                  {product.name}
                </Text>
                <View className="flex-row items-center space-x-2">
                  {product.discountPrice && (
                    <Text className="text-textSecondary text-sm line-through">
                      ₹{product.price}
                    </Text>
                  )}
                  <Text className="text-primary text-base font-bold">
                    ₹{product.discountPrice || product.price}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

// Original StyleSheet kept for reference
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: Colors.background },
//   header: { padding: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
//   title: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
//   subtitle: { fontSize: 16, color: Colors.textSecondary },
//   productsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
//   productCard: { width: (width - 48)/2, marginHorizontal: 8, marginVertical: 8, backgroundColor: Colors.white, borderRadius: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
//   productImage: { width: '100%', height: 160 },
//   discountBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: Colors.secondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
//   discountText: { color: Colors.white, fontSize: 12, fontWeight: 'bold' },
//   productInfo: { padding: 12 },
//   productName: { fontSize: 14, color: Colors.text, marginBottom: 8, height: 40 },
//   priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   productPrice: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
//   originalPrice: { fontSize: 14, color: Colors.textSecondary, textDecorationLine: 'line-through' },
// });