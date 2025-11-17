// components/product/ImageGallery.tsx
import React, { useState, useRef } from 'react';
import { View, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Image } from 'expo-image';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
// We are removing the magnifier for now to guarantee the layout is perfect first.
// We can add it back easily later.

const { width } = Dimensions.get('window');

interface ImageGalleryProps {
  images: string[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const carouselRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onThumbnailPress = (index: number) => {
    carouselRef.current?.scrollTo({ index, animated: true });
    setActiveIndex(index);
  };

  if (!images || images.length === 0) {
    return <View className="bg-gray-200" style={{ width, height: width }} />;
  }

  return (
    <View className="bg-white">
      <View className="relative">
        <Carousel
          ref={carouselRef}
          width={width}
          height={width}
          data={images}
          loop={images.length > 1}
          onSnapToItem={(index) => setActiveIndex(index)}
          renderItem={({ item }) => (
            // Each item is a simple, full-screen image
            <Image
              source={{ uri: item }}
              className="w-full h-full"
              contentFit="contain"
            />
          )}
        />
        {images.length > 1 && (
          <>
            {/* --- ARROW STYLING UPDATED --- */}
            <TouchableOpacity
              onPress={() => carouselRef.current?.prev()}
              // <-- CHANGED: Updated styles for the orange circle arrow
              className="absolute left-4 top-1/2 p-2 bg-primary/80 rounded-full shadow-lg"
              style={{ transform: [{ translateY: -20 }] }}
            >
              <ChevronLeft size={24} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => carouselRef.current?.next()}
              // <-- CHANGED: Updated styles for the orange circle arrow
              className="absolute right-4 top-1/2 p-2 bg-primary/80 rounded-full shadow-lg"
              style={{ transform: [{ translateY: -20 }] }}
            >
              <ChevronRight size={24} color={Colors.white} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {images.length > 1 && (
        <View className="py-3 border-t border-b border-gray-100">
          <FlatList
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `thumb-${item}-${index}`}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => onThumbnailPress(index)}
                // --- THUMBNAIL STYLING UPDATED ---
                // <-- CHANGED: Updated border logic for selected and unselected states
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 p-0.5 bg-white mr-3 ${
                  activeIndex === index ? 'border-primary' : 'border-gray-200'
                }`}
              >
                <Image
                  source={{ uri: item }}
                  className="w-full h-full rounded-md"
                  contentFit="cover"
                />
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default ImageGallery;