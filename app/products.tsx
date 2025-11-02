import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>All Products</Text>
          <Text style={styles.subtitle}>{products.length} items available</Text>
        </View>

        <View style={styles.productsGrid}>
          {products.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => router.push(`/product/${product.id}` as any)}
            >
              <Image
                source={{ uri: product.image }}
                style={styles.productImage}
                contentFit="cover"
              />
              {product.discountPrice && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                  </Text>
                </View>
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <View style={styles.priceRow}>
                  {product.discountPrice && (
                    <Text style={styles.originalPrice}>₹{product.price}</Text>
                  )}
                  <Text style={styles.productPrice}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  productCard: {
    width: (width - 48) / 2,
    marginHorizontal: 8,
    marginVertical: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 160,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    height: 40,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 14,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
});