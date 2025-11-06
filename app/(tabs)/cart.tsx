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
        <View className="flex-1 bg-background items-center justify-center p-6">
          <ShoppingBag size={64} color={Colors.textSecondary} />
          <Text className="text-text text-3xl font-bold mt-4">{t('cart.empty')}</Text>
          <Text className="text-textSecondary text-lg mt-2 mb-6">{t('cart.emptyMessage')}</Text>
          <TouchableOpacity 
            className="bg-primary px-8 py-3 rounded-xl"
            onPress={() => router.push('/(tabs)' as any)}
          >
            <Text className="text-white text-lg font-semibold">{t('home.viewAll')}</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-background">
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {cart.map((item) => (
            <View key={item.product.id} className="flex-row bg-white rounded-xl p-3 mb-3 shadow-md">
              <Image
                source={{ uri: item.product.image }}
                className="w-20 h-20 rounded-lg"
                contentFit="cover"
              />
              <View className="flex-1 ml-3 justify-between">
                <Text className="text-text text-base font-semibold" numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text className="text-primary text-lg font-bold">
                  ₹{item.product.discountPrice || item.product.price}
                </Text>
                <View className="flex-row items-center gap-3">
                  <TouchableOpacity
                    className="w-7 h-7 rounded-lg bg-background items-center justify-center border border-primary"
                    onPress={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus size={16} color={Colors.primary} />
                  </TouchableOpacity>
                  <Text className="text-text text-lg font-semibold min-w-6 text-center">{item.quantity}</Text>
                  <TouchableOpacity
                    className="w-7 h-7 rounded-lg bg-background items-center justify-center border border-primary"
                    onPress={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Plus size={16} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                className="p-2 justify-center"
                onPress={() => handleRemove(item.product.id, item.product.name)}
              >
                <Trash2 size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View className="bg-white p-4 border-t border-border">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-text text-xl font-semibold">{t('cart.total')}:</Text>
            <Text className="text-primary text-2xl font-bold">₹{cartTotal}</Text>
          </View>
          <TouchableOpacity 
            className={`bg-primary py-4 rounded-xl items-center ${isPlacingOrder && 'opacity-60'}`}
            onPress={handleCheckout}
            disabled={isPlacingOrder}
          >
            <Text className="text-white text-lg font-bold">
              {isPlacingOrder ? t('common.loading') : t('cart.proceedToCheckout')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: Colors.background },
//   emptyContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
//   emptyTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginTop: 16 },
//   emptyText: { fontSize: 16, color: Colors.textSecondary, marginTop: 8, marginBottom: 24 },
//   shopButton: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
//   shopButtonText: { fontSize: 16, fontWeight: '600', color: Colors.white },
//   content: { flex: 1, padding: 16 },
//   cartItem: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
//   productImage: { width: 80, height: 80, borderRadius: 8 },
//   itemDetails: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
//   productName: { fontSize: 14, color: Colors.text, fontWeight: '600' },
//   productPrice: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
//   quantityContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   quantityButton: { width: 28, height: 28, borderRadius: 6, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.primary },
//   quantityText: { fontSize: 16, fontWeight: '600', color: Colors.text, minWidth: 24, textAlign: 'center' },
//   removeButton: { padding: 8, justifyContent: 'center' },
//   footer: { backgroundColor: Colors.white, padding: 16, borderTopWidth: 1, borderTopColor: Colors.border },
//   totalContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
//   totalLabel: { fontSize: 18, color: Colors.text, fontWeight: '600' },
//   totalAmount: { fontSize: 24, fontWeight: 'bold', color: Colors.primary },
//   checkoutButton: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
//   checkoutButtonDisabled: { opacity: 0.6 },
//   checkoutButtonText: { fontSize: 16, fontWeight: 'bold', color: Colors.white },
// });