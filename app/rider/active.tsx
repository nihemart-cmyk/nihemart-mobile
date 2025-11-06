import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Navigation, Phone, CheckCircle } from 'lucide-react-native';
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
          },
        },
      ]
    );
  };

  if (!activeOrder) {
    return (
      <>
        <Stack.Screen options={{ title: 'Active Delivery' }} />
        <View className="flex-1 bg-white items-center justify-center p-6">
          <CheckCircle size={64} color={Colors.textSecondary} />
          <Text className="text-2xl font-bold text-gray-800 mt-4">No active delivery</Text>
          <Text className="text-base text-gray-500 mt-2">
            Accept a delivery from the Available tab
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Active Delivery' }} />
      <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-orange-500 p-5 flex-row justify-between items-center">
          <View className="flex-row items-center bg-white/20 px-4 py-2 rounded-full space-x-2">
            <View className="w-2 h-2 rounded-full bg-white" />
            <Text className="text-white text-base font-semibold">In Progress</Text>
          </View>

          <View className="items-end">
            <Text className="text-white text-sm opacity-90 mb-1">Earning</Text>
            <Text className="text-2xl font-bold text-white">₹{activeOrder.deliveryFee}</Text>
          </View>
        </View>

        {/* Content */}
        <View className="p-4 space-y-4">

          {/* Customer Details */}
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-bold text-gray-800">Customer Details</Text>
              <TouchableOpacity className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center">
                <Phone size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <Text className="text-xl font-semibold text-gray-800 mb-1">
              {activeOrder.customerName}
            </Text>
            <Text className="text-base text-gray-500">{activeOrder.customerPhone}</Text>
          </View>

          {/* Delivery Route */}
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-4">Delivery Route</Text>

            <View className="mb-4">
              {/* Pickup */}
              <View className="flex-row items-start">
                <View className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 mr-3" />
                <View className="flex-1">
                  <Text className="text-sm text-gray-500 mb-1">Pickup Location</Text>
                  <Text className="text-base font-medium text-gray-800">{activeOrder.pickupAddress}</Text>
                </View>
              </View>

              <View className="w-0.5 h-6 bg-gray-200 ml-1.5 my-2" />

              {/* Delivery */}
              <View className="flex-row items-start">
                <View className="w-3 h-3 rounded-full bg-orange-500 mt-1.5 mr-3" />
                <View className="flex-1">
                  <Text className="text-sm text-gray-500 mb-1">Delivery Location</Text>
                  <Text className="text-base font-medium text-gray-800">{activeOrder.deliveryAddress}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity className="flex-row items-center justify-center bg-blue-500 py-3 rounded-lg space-x-2">
              <Navigation size={20} color={Colors.white} />
              <Text className="text-white text-base font-semibold">Navigate</Text>
            </TouchableOpacity>
          </View>

          {/* Order Information */}
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-3">Order Information</Text>

            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-base text-gray-500">Order Value</Text>
              <Text className="text-base font-semibold text-gray-800">₹{activeOrder.total}</Text>
            </View>

            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-base text-gray-500">Distance</Text>
              <Text className="text-base font-semibold text-gray-800">{activeOrder.distance}</Text>
            </View>

            <View className="flex-row justify-between py-2">
              <Text className="text-base text-gray-500">Delivery Fee</Text>
              <Text className="text-base font-semibold text-orange-500">₹{activeOrder.deliveryFee}</Text>
            </View>
          </View>

          {/* Complete Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center bg-green-500 py-4 rounded-xl space-x-3"
            onPress={handleCompleteDelivery}
          >
            <CheckCircle size={24} color={Colors.white} />
            <Text className="text-lg font-bold text-white">Mark as Delivered</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}