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
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Category not found</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: category.name }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: category.image }}
          style={styles.headerImage}
          contentFit="cover"
        />
        <View style={styles.headerOverlay}>
          <Text style={styles.categoryTitle}>{category.name}</Text>
          <Text style={styles.productCount}>{categoryProducts.length} Products</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.productsGrid}>
            {categoryProducts.map((product) => (
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
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  headerImage: {
    width: width,
    height: 200,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: Colors.white,
    marginBottom: 8,
  },
  productCount: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  content: {
    padding: 8,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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