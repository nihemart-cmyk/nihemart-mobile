import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';
import Colors from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5 bg-background">
        <Text className="text-[64px] font-bold text-primary mb-4">404</Text>
        <Text className="text-xl text-text mb-6">This screen doesn't exist.</Text>
        <Link href="/" className="mt-4 py-3 px-6">
          <Text className="text-base text-primary font-semibold">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

// Original StyleSheet kept for reference
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 20,
//     backgroundColor: Colors.background,
//   },
//   title: {
//     fontSize: 64,
//     fontWeight: 'bold',
//     color: Colors.primary,
//     marginBottom: 16,
//   },
//   message: {
//     fontSize: 20,
//     color: Colors.text,
//     marginBottom: 24,
//   },
//   link: {
//     marginTop: 16,
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//   },
//   linkText: {
//     fontSize: 16,
//     color: Colors.primary,
//     fontWeight: '600',
//   },
// });