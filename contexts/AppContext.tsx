import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppMode, CartItem, Product, Order } from '@/types';

export const [AppProvider, useApp] = createContextHook(() => {
  const [mode, setMode] = useState<AppMode>('user');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadPersistedData();
  }, []);

  const loadPersistedData = async () => {
    try {
      const [storedMode, storedCart, storedOrders] = await Promise.all([
        AsyncStorage.getItem('appMode'),
        AsyncStorage.getItem('cart'),
        AsyncStorage.getItem('orders'),
      ]);

      if (storedMode) setMode(storedMode as AppMode);
      if (storedCart) setCart(JSON.parse(storedCart));
      if (storedOrders) setOrders(JSON.parse(storedOrders));
    } catch (error) {
      console.log('Error loading persisted data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = useCallback(async (newMode: AppMode) => {
    setMode(newMode);
    try {
      await AsyncStorage.setItem('appMode', newMode);
    } catch (error) {
      console.log('Error saving mode:', error);
    }
  }, []);

  const addToCart = useCallback(async (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      let newCart: CartItem[] = [];
      
      if (existingItem) {
        newCart = prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...prev, { product, quantity }];
      }

      AsyncStorage.setItem('cart', JSON.stringify(newCart)).catch(console.log);
      return newCart;
    });
  }, []);

  const removeFromCart = useCallback(async (productId: string) => {
    setCart(prev => {
      const newCart = prev.filter(item => item.product.id !== productId);
      AsyncStorage.setItem('cart', JSON.stringify(newCart)).catch(console.log);
      return newCart;
    });
  }, []);

  const updateCartQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => {
      const newCart = prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      AsyncStorage.setItem('cart', JSON.stringify(newCart)).catch(console.log);
      return newCart;
    });
  }, [removeFromCart]);

  const clearCart = useCallback(async () => {
    setCart([]);
    try {
      await AsyncStorage.removeItem('cart');
    } catch (error) {
      console.log('Error clearing cart:', error);
    }
  }, []);

  const placeOrder = useCallback(async (deliveryAddress: string) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      status: 'pending',
      items: cart,
      total: cart.reduce((sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 0),
      deliveryAddress,
    };

    setOrders(prev => {
      const newOrders = [newOrder, ...prev];
      AsyncStorage.setItem('orders', JSON.stringify(newOrders)).catch(console.log);
      return newOrders;
    });

    clearCart();
    return newOrder;
  }, [cart, clearCart]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return {
    mode,
    switchMode,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal,
    cartItemsCount,
    orders,
    placeOrder,
    isLoading,
  };
});
