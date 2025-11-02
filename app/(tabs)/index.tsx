import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Search, ShoppingBag, TrendingUp } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { categories } from '@/mocks/categories';
import { products } from '@/mocks/products';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import { useRouter } from 'expo-router';
import { useState } from 'react';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { cartItemsCount } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const featuredProducts = products.filter(p => p.discountPrice).slice(0, 6);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello!</Text>
            <Text style={styles.welcomeText}>Welcome to Nihemart</Text>
          </View>
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => router.push('/(tabs)/cart' as any)}
          >
            <ShoppingBag size={24} color={Colors.white} />
            {cartItemsCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/categories' as any)}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => router.push(`/category/${category.id}` as any)}
              >
                <Image
                  source={{ uri: category.image }}
                  style={styles.categoryImage}
                  contentFit="cover"
                />
                <View style={styles.categoryOverlay}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
              <TrendingUp size={20} color={Colors.secondary} />
              <Text style={styles.sectionTitle}>Hot Deals</Text>
            </View>
          </View>
          <View style={styles.productsGrid}>
            {featuredProducts.map((product) => (
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Products</Text>
            <TouchableOpacity onPress={() => router.push('/products' as any)}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productsGrid}>
            {products.slice(0, 8).map((product) => (
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
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    ₹{product.discountPrice || product.price}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
    fontFamily: Fonts.regular,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginTop: 2,
  },
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.secondary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: Fonts.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontFamily: Fonts.regular,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: Fonts.semiBold,
  },
  categoriesScroll: {
    paddingLeft: 16,
  },
  categoryCard: {
    width: 140,
    height: 100,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  productCard: {
    width: (width - 48) / 2,
    marginHorizontal: 8,
    marginBottom: 16,
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
    fontFamily: Fonts.bold,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    height: 40,
    fontFamily: Fonts.medium,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productPrice: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 14,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
    fontFamily: Fonts.regular,
  },
});
