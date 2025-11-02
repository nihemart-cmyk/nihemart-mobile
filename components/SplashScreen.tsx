import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

type SplashScreenProps = {
  onAnimationComplete: () => void;
};

export default function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1200),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onAnimationComplete();
    });
  }, [fadeAnim, scaleAnim, slideAnim, onAnimationComplete]);

  return (
    <View style={styles.container}>
      <View style={styles.backgroundPattern}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
      </View>
      
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        <Image
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/lkj9rvhc6ov8sfil2ntcf' }}
          style={styles.logo}
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.05,
  },
  circle1: {
    width: width * 1.5,
    height: width * 1.5,
    backgroundColor: '#00bcd4',
    top: -width * 0.5,
    left: -width * 0.3,
  },
  circle2: {
    width: width * 1.2,
    height: width * 1.2,
    backgroundColor: '#ff6b35',
    bottom: -width * 0.4,
    right: -width * 0.4,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.6,
    height: width * 0.6,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});
