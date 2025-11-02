import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CheckCircle, Calendar, DollarSign } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Stack } from 'expo-router';

const mockHistory = [
  {
    id: '1',
    date: '2025-10-27',
    deliveries: 8,
    earnings: 420,
  },
  {
    id: '2',
    date: '2025-10-26',
    deliveries: 12,
    earnings: 640,
  },
  {
    id: '3',
    date: '2025-10-25',
    deliveries: 6,
    earnings: 310,
  },
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
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.statCard}>
            <CheckCircle size={32} color={Colors.success} />
            <Text style={styles.statValue}>{totalDeliveries}</Text>
            <Text style={styles.statLabel}>Total Deliveries</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={32} color={Colors.secondary} />
            <Text style={styles.statValue}>₹{totalEarnings}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {mockHistory.map((day) => (
            <View key={day.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.dateContainer}>
                  <Calendar size={20} color={Colors.primary} />
                  <Text style={styles.dateText}>{formatDate(day.date)}</Text>
                </View>
              </View>

              <View style={styles.historyStats}>
                <View style={styles.historyStat}>
                  <Text style={styles.historyStatValue}>{day.deliveries}</Text>
                  <Text style={styles.historyStatLabel}>Deliveries</Text>
                </View>
                <View style={styles.historyDivider} />
                <View style={styles.historyStat}>
                  <Text style={[styles.historyStatValue, { color: Colors.secondary }]}>
                    ₹{day.earnings}
                  </Text>
                  <Text style={styles.historyStatLabel}>Earned</Text>
                </View>
                <View style={styles.historyDivider} />
                <View style={styles.historyStat}>
                  <Text style={styles.historyStatValue}>
                    ₹{Math.round(day.earnings / day.deliveries)}
                  </Text>
                  <Text style={styles.historyStatLabel}>Avg/Order</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
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
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyHeader: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  historyStat: {
    alignItems: 'center',
    flex: 1,
  },
  historyStatValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  historyStatLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  historyDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
});