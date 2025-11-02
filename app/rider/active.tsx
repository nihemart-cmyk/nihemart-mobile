import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Navigation, Phone, MapPin, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { DeliveryOrder } from '@/types';

export default function RiderActiveScreen() {
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);

  const handleCompleteDelivery = () => {
    if (!activeOrder) return;

    Alert.alert(
      'Complete Delivery?',
      'Confirm that the order has been delivered to the customer.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            Alert.alert('Success', 'Delivery completed! Payment has been added to your earnings.');
            setActiveOrder(null);
          }
        }
      ]
    );
  };

  if (!activeOrder) {
    return (
      <>
        <Stack.Screen options={{ title: 'Active Delivery' }} />
        <View style={styles.emptyContainer}>
          <CheckCircle size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>No active delivery</Text>
          <Text style={styles.emptyText}>Accept a delivery from the Available tab</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Active Delivery' }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>In Progress</Text>
          </View>
          <View style={styles.earningsBadge}>
            <Text style={styles.earningsLabel}>Earning</Text>
            <Text style={styles.earningsAmount}>₹{activeOrder.deliveryFee}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Customer Details</Text>
              <TouchableOpacity style={styles.callButton}>
                <Phone size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.customerName}>{activeOrder.customerName}</Text>
            <Text style={styles.customerPhone}>{activeOrder.customerPhone}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Route</Text>
            
            <View style={styles.locationSection}>
              <View style={styles.locationItem}>
                <View style={[styles.locationDot, { backgroundColor: Colors.primary }]} />
                <View style={styles.locationDetails}>
                  <Text style={styles.locationLabel}>Pickup Location</Text>
                  <Text style={styles.locationAddress}>{activeOrder.pickupAddress}</Text>
                </View>
              </View>

              <View style={styles.locationLine} />

              <View style={styles.locationItem}>
                <View style={[styles.locationDot, { backgroundColor: Colors.secondary }]} />
                <View style={styles.locationDetails}>
                  <Text style={styles.locationLabel}>Delivery Location</Text>
                  <Text style={styles.locationAddress}>{activeOrder.deliveryAddress}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.navigationButton}>
              <Navigation size={20} color={Colors.white} />
              <Text style={styles.navigationButtonText}>Navigate</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order Value</Text>
              <Text style={styles.infoValue}>₹{activeOrder.total}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoValue}>{activeOrder.distance}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Delivery Fee</Text>
              <Text style={[styles.infoValue, { color: Colors.secondary }]}>₹{activeOrder.deliveryFee}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.completeButton} onPress={handleCompleteDelivery}>
            <CheckCircle size={24} color={Colors.white} />
            <Text style={styles.completeButtonText}>Mark as Delivered</Text>
          </TouchableOpacity>
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
  header: {
    backgroundColor: Colors.secondary,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  earningsBadge: {
    alignItems: 'flex-end',
  },
  earningsLabel: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  content: {
    padding: 16,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  customerName: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
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
    height: 24,
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
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  navigationButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
});
