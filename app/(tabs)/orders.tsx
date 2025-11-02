import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { Stack } from 'expo-router';
import { Order } from '@/types';

export default function OrdersScreen() {
  const { orders } = useApp();

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} color={Colors.warning} />;
      case 'processing':
        return <Package size={20} color={Colors.primary} />;
      case 'shipped':
        return <Truck size={20} color={Colors.primary} />;
      case 'delivered':
        return <CheckCircle size={20} color={Colors.success} />;
      case 'cancelled':
        return <XCircle size={20} color={Colors.error} />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return Colors.warning;
      case 'processing':
      case 'shipped':
        return Colors.primary;
      case 'delivered':
        return Colors.success;
      case 'cancelled':
        return Colors.error;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (orders.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: 'My Orders' }} />
        <View style={styles.emptyContainer}>
          <Package size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>Your order history will appear here</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'My Orders' }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>Order #{order.id.slice(-8)}</Text>
                  <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                  {getStatusIcon(order.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.orderItems}>
                {order.items.slice(0, 2).map((item) => (
                  <View key={item.product.id} style={styles.orderItem}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.product.name}
                    </Text>
                    <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  </View>
                ))}
                {order.items.length > 2 && (
                  <Text style={styles.moreItems}>+{order.items.length - 2} more items</Text>
                )}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalAmount}>₹{order.total}</Text>
              </View>

              <TouchableOpacity style={styles.trackButton}>
                <Text style={styles.trackButtonText}>Track Order</Text>
              </TouchableOpacity>
            </View>
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
  },
  content: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  orderDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  moreItems: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  trackButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});