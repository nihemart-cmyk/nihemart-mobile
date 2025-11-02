import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color={Colors.white} />
            </View>
            <View style={styles.ratingBadge}>
              <Star size={14} color={Colors.white} fill={Colors.white} />
              <Text style={styles.ratingText}>{riderStats.rating}</Text>
            </View>
          </View>
          <Text style={styles.name}>John Rider</Text>
          <Text style={styles.subtitle}>Delivery Partner</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Package size={24} color={Colors.secondary} />
            <Text style={styles.statValue}>{riderStats.totalDeliveries}</Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={24} color={Colors.success} />
            <Text style={styles.statValue}>₹{riderStats.totalEarnings}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Star size={24} color={Colors.warning} />
            <Text style={styles.statValue}>{riderStats.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <ShoppingBag size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Customer Mode</Text>
                <Text style={styles.settingSubtext}>Switch to shopping experience</Text>
              </View>
            </View>
            <Switch
              value={mode === 'user'}
              onValueChange={handleModeSwitch}
              trackColor={{ false: Colors.border, true: Colors.secondary }}
              thumbColor={Colors.white}
            />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
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
            <View style={styles.menuIcon}>
              <Bell size={20} color={Colors.secondary} />
            </View>
            <Text style={styles.menuText}>Test Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Settings size={20} color={Colors.text} />
            </View>
            <Text style={styles.menuText}>Account Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <LogOut size={20} color={Colors.error} />
            </View>
            <Text style={[styles.menuText, { color: Colors.error }]}>Logout</Text>
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
  header: {
    backgroundColor: Colors.secondary,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: Colors.white,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  settingCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  settingSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
  },
});
