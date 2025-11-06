import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { DollarSign, Navigation, Phone } from 'lucide-react-native';
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
          onPress: () =>
            Alert.alert('Success', 'Delivery accepted! Check Active tab for details.'),
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Available Deliveries' }} />
      <View>
        {/* Summary Bar */}
        <View>
          <View>
            <Text>{orders.length}</Text>
            <Text>Available</Text>
          </View>

          <View />

          <View>
            <Text>₹350</Text>
            <Text>Potential Earnings</Text>
          </View>
        </View>

        {/* Orders List */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {orders.map((order) => (
            <View key={order.id}>
              {/* Header: Earnings & Distance */}
              <View>
                <View>
                  <DollarSign size={16} color={Colors.white} />
                  <Text>₹{order.deliveryFee}</Text>
                </View>

                <View>
                  <Navigation size={14} color={Colors.secondary} />
                  <Text>{order.distance}</Text>
                </View>
              </View>

              {/* Customer Info */}
              <View>
                <Text>{order.customerName}</Text>
                <TouchableOpacity>
                  <Phone size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Location Section */}
              <View>
                <View>
                  <View />
                  <View>
                    <Text>Pickup</Text>
                    <Text>{order.pickupAddress}</Text>
                  </View>
                </View>

                <View />

                <View>
                  <View />
                  <View>
                    <Text>Delivery</Text>
                    <Text>{order.deliveryAddress}</Text>
                  </View>
                </View>
              </View>

              {/* Footer: Total & Action */}
              <View>
                <View>
                  <Text>Order Value</Text>
                  <Text>₹{order.total}</Text>
                </View>

                <TouchableOpacity onPress={() => handleAcceptOrder(order)}>
                  <Text>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

/*
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
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
    borderRadius: 14,
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
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    marginRight: 12,
  },
  locationLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.border,
    marginLeft: 4.5,
    marginVertical: 4,
  },
  locationDetails: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500' as const,
  },

  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
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
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 10,
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
});
*/