import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications, AppNotification } from '@/contexts/NotificationContext';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import { Bell, Package, Truck, Tag, Info, Trash2, CheckCheck } from 'lucide-react-native';

const getNotificationIcon = (type: AppNotification['type']) => {
  switch (type) {
    case 'order':
      return Package;
    case 'delivery':
      return Truck;
    case 'promotion':
      return Tag;
    default:
      return Info;
  }
};

const formatTimestamp = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

interface NotificationItemProps {
  notification: AppNotification;
  onPress: () => void;
  onDelete: () => void;
}

function NotificationItem({ notification, onPress, onDelete }: NotificationItemProps) {
  const [opacity] = useState(new Animated.Value(1));
  const IconComponent = getNotificationIcon(notification.type);

  const handleDelete = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDelete();
    });
  };

  return (
    <Animated.View className="overflow-hidden" style={{ opacity }}>
      <TouchableOpacity
        className={`flex-row items-start p-4 border-b ${!notification.read ? 'bg-[#FFF5F0]' : 'bg-white'}`}
        style={{ borderBottomColor: Colors.border, borderBottomWidth: 1 }}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View
          className="w-10 h-10 rounded-full justify-center items-center mr-3"
          style={{ backgroundColor: notification.read ? Colors.border : Colors.primary }}
        >
          <IconComponent
            size={20}
            color={notification.read ? Colors.textSecondary : Colors.white}
          />
        </View>

        <View className="flex-1 mr-2">
          <Text
            numberOfLines={1}
            className="text-[16px] mb-1"
            style={{ fontFamily: Fonts.semiBold, color: Colors.text }}
          >
            {notification.title}
          </Text>
          <Text
            numberOfLines={2}
            className="text-[14px] mb-1 leading-5"
            style={{ fontFamily: Fonts.regular, color: Colors.textSecondary }}
          >
            {notification.body}
          </Text>
          <Text
            className="text-[12px]"
            style={{ fontFamily: Fonts.regular, color: Colors.textSecondary }}
          >
            {formatTimestamp(notification.timestamp)}
          </Text>
        </View>

        <TouchableOpacity
          className="p-1"
          onPress={handleDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function NotificationsScreen() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const handleNotificationPress = (notification: AppNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAllNotifications,
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.background }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontFamily: Fonts.semiBold },
          headerRight: () =>
            notifications.length > 0 ? (
              <View className="flex-row items-center gap-3 mr-2">
                {unreadCount > 0 && (
                  <TouchableOpacity onPress={markAllAsRead} className="p-1">
                    <CheckCheck size={20} color={Colors.white} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleClearAll} className="p-1">
                  <Trash2 size={20} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ) : null,
        }}
      />
      {notifications.length === 0 ? (
        <View className="flex-1 justify-center items-center p-8">
          <Bell size={64} color={Colors.border} />
          <Text
            className="text-[20px] mt-4 mb-2"
            style={{ fontFamily: Fonts.semiBold, color: Colors.text }}
          >
            No Notifications
          </Text>
          <Text
            className="text-[14px] text-center leading-5"
            style={{ fontFamily: Fonts.regular, color: Colors.textSecondary }}
          >
            You&apos;re all caught up! We&apos;ll notify you when something new happens.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={() => handleNotificationPress(item)}
              onDelete={() => handleDeleteNotification(item.id)}
            />
          )}
          contentContainerClassName="py-2"
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ORIGINAL STYLES (COMMENTED OUT)
/*
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 8,
  },
  headerButton: {
    padding: 4,
  },
  listContent: {
    paddingVertical: 8,
  },
  notificationWrapper: {
    overflow: 'hidden',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  unreadNotification: {
    backgroundColor: '#FFF5F0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
*/