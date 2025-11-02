import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function CartScreen() {
  const { cart, updateCartQuantity, removeFromCart, cartTotal, placeOrder } = useApp();
  const router = useRouter();
  const { t } = useTranslation();
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert(t('cart.empty'), t('cart.emptyMessage'));
      return;
    }

    Alert.alert(
      t('checkout.title'),
      `${t('cart.total')}: ₹${cartTotal}\n\n${t('checkout.deliveryAddress')}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            setIsPlacingOrder(true);
            try {
              await placeOrder('Default Address: 123 Main St, City, State 123456');
              Alert.alert(t('checkout.orderPlaced'), t('checkout.orderSuccess'), [
                { text: 'OK', onPress: () => router.push('/orders' as any) }
              ]);
            } catch {
              Alert.alert(t('common.error'), 'Failed to place order. Please try again.');
            } finally {
              setIsPlacingOrder(false);
            }
          }
        }
      ]
    );
  };

  const handleRemove = (productId: string, productName: string) => {
    Alert.alert(
      t('cart.remove'),
      `${t('cart.remove')} ${productName}?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('cart.remove'), style: 'destructive', onPress: () => removeFromCart(productId) }
      ]
    );
  };

  if (cart.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyContainer}>
          <ShoppingBag size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>{t('cart.empty')}</Text>
          <Text style={styles.emptyText}>{t('cart.emptyMessage')}</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)' as any)}
          >
            <Text style={styles.shopButtonText}>{t('home.viewAll')}</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {cart.map((item) => (
            <View key={item.product.id} style={styles.cartItem}>
              <Image
                source={{ uri: item.product.image }}
                style={styles.productImage}
                contentFit="cover"
              />
              <View style={styles.itemDetails}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text style={styles.productPrice}>
                  ₹{item.product.discountPrice || item.product.price}
                </Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus size={16} color={Colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Plus size={16} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(item.product.id, item.product.name)}
              >
                <Trash2 size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>{t('cart.total')}:</Text>
            <Text style={styles.totalAmount}>₹{cartTotal}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.checkoutButton, isPlacingOrder && styles.checkoutButtonDisabled]}
            onPress={handleCheckout}
            disabled={isPlacingOrder}
          >
            <Text style={styles.checkoutButtonText}>
              {isPlacingOrder ? t('common.loading') : t('cart.proceedToCheckout')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    justifyContent: 'center',
  },
  footer: {
    backgroundColor: Colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
});