// components/product/ImageMagnifier.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface ImageMagnifierProps {
  uri: string;
  zoomFactor?: number;
}

const ImageMagnifier: React.FC<ImageMagnifierProps> = ({ uri, zoomFactor = 2 }) => {
  // Shared values to track touch coordinates
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  // Shared value to control the opacity of the zoomed image (for fade-in/out)
  const opacity = useSharedValue(0);

  // The pan gesture handler
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      // Fade in the zoomed image when touch begins
      opacity.value = withTiming(1);
    })
    .onUpdate((event) => {
      // Update the focal point based on touch position
      focalX.value = event.x;
      focalY.value = event.y;
    })
    .onEnd(() => {
      // Fade out the zoomed image when touch ends
      opacity.value = withTiming(0);
    });

  // Animated style for the magnified image container
  const animatedZoomStyle = useAnimatedStyle(() => {
    // We move the magnified image in the *opposite* direction of the touch.
    // Centering the effect by subtracting half the container size.
    const translateX = -focalX.value * (zoomFactor - 1);
    const translateY = -focalY.value * (zoomFactor - 1);

    return {
      transform: [{ translateX }, { translateY }],
    };
  });

  // Animated style for the opacity fade
  const animatedOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        {/* The base, visible image */}
        <Image source={{ uri }} style={styles.image} contentFit="contain" />

        {/* The magnifier overlay, which is only visible on touch */}
        <Animated.View style={[styles.zoomContainer, animatedOpacityStyle]}>
          <Animated.View style={[{ transform: [{ scale: zoomFactor }] }, animatedZoomStyle]}>
            <Image source={{ uri }} style={styles.image} contentFit="contain" />
          </Animated.View>
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'hidden', // This is crucial to clip the magnified image
  },
  image: {
    width: '100%',
    height: '100%',
  },
  zoomContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
  },
});

export default ImageMagnifier;