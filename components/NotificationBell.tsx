import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useNotifications } from '@/contexts/NotificationContext';
import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import { router } from 'expo-router';

interface NotificationBellProps {
  onPress?: () => void;
  color?: string;
}

export default function NotificationBell({ onPress, color = Colors.white }: NotificationBellProps) {
  const { unreadCount } = useNotifications();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (unreadCount > 0) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [unreadCount, scaleAnim]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/notifications' as any);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Bell size={24} color={color} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    position: 'relative' as const,
  },
  badge: {
    position: 'absolute' as const,
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: Fonts.bold,
  },
});
