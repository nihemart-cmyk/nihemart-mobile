import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star, ShoppingCart, Heart, Truck } from 'lucide-react-native';
import { products } from '@/mocks/products';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { useState } from 'react';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useApp();
  const [quantity, setQuantity] = useState<number>(1);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    Alert.alert(
      'Added to Cart',
      `${product.name} has been added to your cart.`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/(tabs)/cart' as any) }
      ]
    );
  };

  const discount = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          contentFit="cover"
        />

        {product.discountPrice && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}

        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <View style={styles.brandContainer}>
              {product.brand && (
                <Text style={styles.brandText}>{product.brand}</Text>
              )}
              <View style={styles.ratingContainer}>
                <Star size={16} color={Colors.warning} fill={Colors.warning} />
                <Text style={styles.ratingText}>{product.rating}</Text>
                <Text style={styles.reviewsText}>({product.reviews} reviews)</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.wishlistButton}>
              <Heart size={24} color={Colors.error} />
            </TouchableOpacity>
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>
              ₹{product.discountPrice || product.price}
            </Text>
            {product.discountPrice && (
              <Text style={styles.originalPrice}>₹{product.price}</Text>
            )}
            {product.discountPrice && (
              <View style={styles.saveBadge}>
                <Text style={styles.saveText}>
                  Save ₹{product.price - product.discountPrice}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.deliveryInfo}>
            <Truck size={20} color={Colors.primary} />
            <Text style={styles.deliveryText}>Free delivery on orders above ₹500</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{product.category}</Text>
            </View>
            {product.brand && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Brand</Text>
                <Text style={styles.detailValue}>{product.brand}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Availability</Text>
              <Text style={[styles.detailValue, { color: product.inStock ? Colors.success : Colors.error }]}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Text style={styles.quantityButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addToCartButton, !product.inStock && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={!product.inStock}
        >
          <ShoppingCart size={20} color={Colors.white} />
          <Text style={styles.addToCartText}>
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  content: {
    flex: 1,
  },
  productImage: {
    width: width,
    height: width,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  discountText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  detailsContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  brandContainer: {
    flex: 1,
  },
  brandText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  reviewsText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  wishlistButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 20,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  saveBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saveText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '600' as const,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary + '10',
    padding: 12,
    borderRadius: 8,
  },
  deliveryText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },
  section: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quantityButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    backgroundColor: Colors.textSecondary,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
});
