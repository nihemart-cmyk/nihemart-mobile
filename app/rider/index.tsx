import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MapPin, DollarSign, Navigation, Phone } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { DeliveryOrder } from '@/types';

const mockOrders: DeliveryOrder[] = [
  {
    id: '1',
    date: new Date().toISOString(),
    status: 'pending',
    items: [],
    total: 1250,
    deliveryAddress: '456 Oak Avenue, Downtown Area',
    pickupAddress: 'Nihemart Store, Main Street',
    customerName: 'Sarah Johnson',
    customerPhone: '+91 98765 43210',
    deliveryFee: 50,
    distance: '3.2 km',
  },
  {
    id: '2',
    date: new Date().toISOString(),
    status: 'pending',
    items: [],
    total: 2480,
    deliveryAddress: '789 Pine Road, Green Valley',
    pickupAddress: 'Nihemart Store, Main Street',
    customerName: 'Michael Chen',
    customerPhone: '+91 98765 43211',
    deliveryFee: 75,
    distance: '5.8 km',
  },
  {
    id: '3',
    date: new Date().toISOString(),
    status: 'pending',
    items: [],
    total: 890,
    deliveryAddress: '321 Elm Street, City Center',
    pickupAddress: 'Nihemart Store, Main Street',
    customerName: 'Emily Davis',
    customerPhone: '+91 98765 43212',
    deliveryFee: 40,
    distance: '2.1 km',
  },
];

export default function RiderAvailableScreen() {
  const [orders] = useState<DeliveryOrder[]>(mockOrders);

  const handleAcceptOrder = (order: DeliveryOrder) => {
    Alert.alert(
      'Accept Delivery?',
      `Customer: ${order.customerName}\nDelivery Fee: ₹${order.deliveryFee}\nDistance: ${order.distance}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            Alert.alert('Success', 'Delivery accepted! Check Active tab for details.');
          }
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Available Deliveries' }} />
      <View style={styles.container}>
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹350</Text>
            <Text style={styles.statLabel}>Potential Earnings</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.earningsBadge}>
                  <DollarSign size={16} color={Colors.white} />
                  <Text style={styles.earningsText}>₹{order.deliveryFee}</Text>
                </View>
                <View style={styles.distanceBadge}>
                  <Navigation size={14} color={Colors.secondary} />
                  <Text style={styles.distanceText}>{order.distance}</Text>
                </View>
              </View>

              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <TouchableOpacity style={styles.phoneButton}>
                  <Phone size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.locationSection}>
                <View style={styles.locationItem}>
                  <View style={[styles.locationDot, { backgroundColor: Colors.primary }]} />
                  <View style={styles.locationDetails}>
                    <Text style={styles.locationLabel}>Pickup</Text>
                    <Text style={styles.locationAddress}>{order.pickupAddress}</Text>
                  </View>
                </View>

                <View style={styles.locationLine} />

                <View style={styles.locationItem}>
                  <View style={[styles.locationDot, { backgroundColor: Colors.secondary }]} />
                  <View style={styles.locationDetails}>
                    <Text style={styles.locationLabel}>Delivery</Text>
                    <Text style={styles.locationAddress}>{order.deliveryAddress}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.orderFooter}>
                <View>
                  <Text style={styles.orderTotalLabel}>Order Value</Text>
                  <Text style={styles.orderTotal}>₹{order.total}</Text>
                </View>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAcceptOrder(order)}
                >
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  statsBar: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.secondary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  content: {
    flex: 1,
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
    marginBottom: 16,
  },
  earningsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  earningsText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.secondary,
  },
  customerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  phoneButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationSection: {
    marginBottom: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  locationLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  locationDetails: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  orderTotalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  acceptButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
});
