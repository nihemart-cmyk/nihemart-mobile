import { View, Text, ScrollView } from 'react-native';
import { CheckCircle, Calendar, DollarSign } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Stack } from 'expo-router';

const mockHistory = [
  { id: '1', date: '2025-10-27', deliveries: 8, earnings: 420 },
  { id: '2', date: '2025-10-26', deliveries: 12, earnings: 640 },
  { id: '3', date: '2025-10-25', deliveries: 6, earnings: 310 },
];

export default function RiderHistoryScreen() {
  const totalDeliveries = mockHistory.reduce((sum, day) => sum + day.deliveries, 0);
  const totalEarnings = mockHistory.reduce((sum, day) => sum + day.earnings, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Delivery History' }} />
      <View className="flex-1 bg-gray-50">
        {/* Header Stats */}
        <View className="flex-row p-4 space-x-3">
          <View className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm">
            <CheckCircle size={32} color={Colors.success} />
            <Text className="text-2xl font-bold text-gray-800 mt-2">{totalDeliveries}</Text>
            <Text className="text-sm text-gray-500 mt-1 text-center">Total Deliveries</Text>
          </View>

          <View className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm">
            <DollarSign size={32} color={Colors.secondary} />
            <Text className="text-2xl font-bold text-gray-800 mt-2">₹{totalEarnings}</Text>
            <Text className="text-sm text-gray-500 mt-1 text-center">Total Earnings</Text>
          </View>
        </View>

        {/* Recent History */}
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <Text className="text-xl font-bold text-gray-800 mb-4">Recent Activity</Text>

          {mockHistory.map((day) => (
            <View
              key={day.id}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm"
            >
              {/* Date */}
              <View className="flex-row items-center mb-4 space-x-2">
                <Calendar size={20} color={Colors.primary} />
                <Text className="text-base font-semibold text-gray-800">
                  {formatDate(day.date)}
                </Text>
              </View>

              {/* Stats Row */}
              <View className="flex-row justify-around">
                <View className="items-center flex-1">
                  <Text className="text-xl font-bold text-blue-500 mb-1">
                    {day.deliveries}
                  </Text>
                  <Text className="text-sm text-gray-500">Deliveries</Text>
                </View>

                <View className="w-px bg-gray-200" />

                <View className="items-center flex-1">
                  <Text className="text-xl font-bold text-orange-500 mb-1">
                    ₹{day.earnings}
                  </Text>
                  <Text className="text-sm text-gray-500">Earned</Text>
                </View>

                <View className="w-px bg-gray-200" />

                <View className="items-center flex-1">
                  <Text className="text-xl font-bold text-blue-500 mb-1">
                    ₹{Math.round(day.earnings / day.deliveries)}
                  </Text>
                  <Text className="text-sm text-gray-500">Avg/Order</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );
}