import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { User, Star, Package, DollarSign, Settings, LogOut, ShoppingBag, Bell } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useNotifications } from '@/contexts/NotificationContext';
import Colors from '@/constants/colors';
import { Stack } from 'expo-router';

export default function RiderProfileScreen() {
  const { mode, switchMode } = useApp();
  const { scheduleLocalNotification } = useNotifications();

  const riderStats = {
    rating: 4.8,
    totalDeliveries: 156,
    totalEarnings: 8950,
  };

  const handleModeSwitch = (value: boolean) => {
    const newMode = value ? 'user' : 'rider';
    Alert.alert(
      `Switch to ${newMode === 'user' ? 'Customer' : 'Rider'} Mode?`,
      `You will be switched to the ${newMode} panel.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => switchMode(newMode)
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Rider Profile' }} />
      <ScrollView className="flex-1 bg-[${Colors.background}]" showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View className={`bg-[${Colors.secondary}] items-center rounded-b-3xl px-6 py-8`}>
          <View className="mb-4 relative">
            <View className="w-20 h-20 rounded-full border-4 border-white bg-white/20 items-center justify-center">
              <User size={40} color={Colors.white} />
            </View>
            <View className={`absolute bottom-0 right-0 bg-[${Colors.warning}] flex-row items-center px-2 py-1 rounded-xl`}>
              <Star size={14} color={Colors.white} fill={Colors.white} />
              <Text className="text-white font-bold text-sm ml-1">{riderStats.rating}</Text>
            </View>
          </View>
          <Text className="text-2xl font-bold text-white mb-1">John Rider</Text>
          <Text className="text-white/90 text-base">Delivery Partner</Text>
        </View>

        {/* Stats Section */}
        <View className="flex-row p-4 space-x-3">
          <View className="flex-1 bg-white rounded-xl p-4 items-center shadow">
            <Package size={24} color={Colors.secondary} />
            <Text className="text-xl font-bold text-gray-800 mt-2">{riderStats.totalDeliveries}</Text>
            <Text className="text-xs text-gray-500 mt-1">Deliveries</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 items-center shadow">
            <DollarSign size={24} color={Colors.success} />
            <Text className="text-xl font-bold text-gray-800 mt-2">₹{riderStats.totalEarnings}</Text>
            <Text className="text-xs text-gray-500 mt-1">Earnings</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 items-center shadow">
            <Star size={24} color={Colors.warning} />
            <Text className="text-xl font-bold text-gray-800 mt-2">{riderStats.rating}</Text>
            <Text className="text-xs text-gray-500 mt-1">Rating</Text>
          </View>
        </View>

        {/* Settings Section */}
        <View className="p-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Settings</Text>

          {/* Customer Mode Switch */}
          <View className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between shadow">
            <View className="flex-row items-center flex-1">
              <View className={`w-10 h-10 rounded-full bg-[${Colors.primary}] bg-opacity-10 items-center justify-center mr-3`}>
                <ShoppingBag size={20} color={Colors.primary} />
              </View>
              <View>
                <Text className="text-base font-semibold text-gray-800">Customer Mode</Text>
                <Text className="text-sm text-gray-500 mt-0.5">Switch to shopping experience</Text>
              </View>
            </View>
            <Switch
              value={mode === 'user'}
              onValueChange={handleModeSwitch}
              trackColor={{ false: Colors.border, true: Colors.secondary }}
              thumbColor={Colors.white}
            />
          </View>

          {/* Test Notification */}
          <TouchableOpacity
            className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow"
            onPress={() => {
              scheduleLocalNotification(
                'New Delivery Available',
                'A delivery order is waiting for you nearby. Tap to accept!',
                {},
                'delivery'
              );
              Alert.alert('Success', 'Test delivery notification sent!');
            }}
          >
            <View className={`w-10 h-10 rounded-full bg-[${Colors.background}] items-center justify-center mr-3`}>
              <Bell size={20} color={Colors.secondary} />
            </View>
            <Text className="text-base font-medium text-gray-800">Test Notification</Text>
          </TouchableOpacity>

          {/* Account Settings */}
          <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow">
            <View className={`w-10 h-10 rounded-full bg-[${Colors.background}] items-center justify-center mr-3`}>
              <Settings size={20} color={Colors.text} />
            </View>
            <Text className="text-base font-medium text-gray-800">Account Settings</Text>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity className="bg-white rounded-xl p-4 flex-row items-center shadow">
            <View className={`w-10 h-10 rounded-full bg-[${Colors.background}] items-center justify-center mr-3`}>
              <LogOut size={20} color={Colors.error} />
            </View>
            <Text className={`text-base font-medium text-[${Colors.error}]`}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}