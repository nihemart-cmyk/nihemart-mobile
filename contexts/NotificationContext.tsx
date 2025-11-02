import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: number;
  read: boolean;
  type: 'order' | 'delivery' | 'promotion' | 'system';
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  const addNotification = useCallback((notification: AppNotification) => {
    setNotifications(prev => {
      const newNotifications = [notification, ...prev].slice(0, 100);
      saveNotifications(newNotifications);
      return newNotifications;
    });
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      saveNotifications(updated);
      return updated;
    });
  }, []);

  useEffect(() => {
    loadNotifications();
    registerForPushNotificationsAsync();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      
      const newNotification: AppNotification = {
        id: notification.request.identifier,
        title: notification.request.content.title || '',
        body: notification.request.content.body || '',
        data: notification.request.content.data,
        timestamp: Date.now(),
        read: false,
        type: (notification.request.content.data?.type as AppNotification['type']) || 'system',
      };

      addNotification(newNotification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      const notificationId = response.notification.request.identifier;
      markAsRead(notificationId);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [addNotification, markAsRead]);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotifications = async (notifs: AppNotification[]) => {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(notifs));
    } catch (error) {
      console.log('Error saving notifications:', error);
    }
  };

  const registerForPushNotificationsAsync = async () => {
    let token = '';

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B35',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId || 'wb85bt3o2ulha2cdv7zt5';
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Push token:', token);
      } catch (error) {
        console.log('Error getting push token:', error);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    setExpoPushToken(token);
    return token;
  };

  const scheduleLocalNotification = useCallback(async (
    title: string,
    body: string,
    data?: any,
    type: AppNotification['type'] = 'system'
  ) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { ...data, type },
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.log('Error scheduling notification:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== notificationId);
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const clearAllNotifications = useCallback(async () => {
    setNotifications([]);
    try {
      await AsyncStorage.removeItem('notifications');
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.log('Error clearing notifications:', error);
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    expoPushToken,
    notifications,
    unreadCount,
    isLoading,
    scheduleLocalNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification,
  };
});