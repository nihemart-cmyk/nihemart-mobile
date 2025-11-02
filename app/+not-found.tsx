import { Link, Stack } from 'expo-router';
import { View, StyleSheet, Text } from 'react-native';
import Colors from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.message}>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold' as const,
    color: Colors.primary,
    marginBottom: 16,
  },
  message: {
    fontSize: 20,
    color: Colors.text,
    marginBottom: 24,
  },
  link: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  linkText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
});
