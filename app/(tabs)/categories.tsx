import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { categories } from '@/mocks/categories';
import Colors from '@/constants/colors';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';

export default function CategoriesScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Categories' }} />
      <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap p-2">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className="w-[47%] h-36 m-[1.5%] rounded-xl overflow-hidden shadow-lg"
              onPress={() => router.push(`/category/${category.id}` as any)}
            >
              <Image
                source={{ uri: category.image }}
                className="w-full h-full"
                contentFit="cover"
              />
              <View className="absolute inset-0 bg-black opacity-35 flex justify-center items-center">
                <Text className="text-white text-xl font-bold text-center">{category.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: Colors.background },
//   grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
//   categoryCard: { width: '47%', height: 140, margin: '1.5%', borderRadius: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
//   categoryImage: { width: '100%', height: '100%' },
//   categoryOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.35)', justifyContent: 'center', alignItems: 'center' },
//   categoryName: { fontSize: 18, fontWeight: 'bold', color: Colors.white, textAlign: 'center' },
// });