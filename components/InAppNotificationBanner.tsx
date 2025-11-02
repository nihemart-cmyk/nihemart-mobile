import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { Package, Truck, Tag, Info } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import { router } from 'expo-router';

interface NotificationData {
  title: string;
  body: string;
  type?: 'order' | 'delivery' | 'promotion' | 'system';
}

const getNotificationIcon = (type: string | undefined) => {
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

export default function InAppNotificationBanner() {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(-200)).current;
  const insets = useSafeAreaInsets();
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideNotification = useCallback(() => {
    Animated.timing(translateY, {
      toValue: -200,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setNotification(null);
    });
  }, [translateY]);

  const showNotification = useCallback((data: NotificationData) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    setNotification(data);
    setVisible(true);

    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    hideTimeoutRef.current = setTimeout(() => {
      hideNotification();
    }, 4000);
  }, [translateY, hideNotification]);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notif) => {
      if (Platform.OS !== 'web') {
        const title = notif.request.content.title || '';
        const body = notif.request.content.body || '';
        const type = notif.request.content.data?.type as NotificationData['type'];

        showNotification({ title, body, type });
      }
    });

    return () => {
      subscription.remove();
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [showNotification]);

  const handlePress = () => {
    hideNotification();
    router.push('/notifications' as any);
  };

  if (!visible || !notification) {
    return null;
  }

  const IconComponent = getNotificationIcon(notification.type);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 8,
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.banner}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>
          <IconComponent size={20} color={Colors.primary} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {notification.body}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={(e) => {
            e.stopPropagation();
            hideNotification();
          }}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as const,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  banner: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    marginBottom: 2,
  },
  body: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
    marginLeft: 4,
  },
  closeText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
});
