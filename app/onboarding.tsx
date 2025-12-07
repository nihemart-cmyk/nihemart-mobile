import Colors from "@/constants/colors";
import { useAuthStore } from "@/store/auth.store";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const onboardingData = [
  {
    id: "1",
    title: "Various Collections Of The Latest Products",
    description:
      "Urna amet, suspendisse ullamcorper ac elit diam facilisis cursus vestibulum.",
    image: require("@/assets/images/1.webp"),
  },
  {
    id: "2",
    title: "Various Collections Of The Latest Products",
    description:
      "Urna amet, suspendisse ullamcorper ac elit diam facilisis cursus vestibulum.",
    image: require("@/assets/images/2.webp"),
  },
  {
    id: "3",
    title: "Find The Most Suitable Outfit For You",
    description:
      "Urna amet, suspendisse ullamcorper ac elit diam facilisis cursus vestibulum.",
    image: require("@/assets/images/3.webp"),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // If user is already authenticated, skip onboarding and go to home
  useEffect(() => {
    if (user) {
      const markOnboardingComplete = async () => {
        const AsyncStorage = (
          await import("@react-native-async-storage/async-storage")
        ).default;
        await AsyncStorage.setItem("hasCompletedOnboarding", "true");
        router.replace("/(tabs)");
      };
      markOnboardingComplete();
    }
  }, [user]);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentIndex(nextIndex);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    const AsyncStorage = (
      await import("@react-native-async-storage/async-storage")
    ).default;
    await AsyncStorage.setItem("hasCompletedOnboarding", "true");
    router.replace("/signin");
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const renderItem = ({ item }: { item: (typeof onboardingData)[0] }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {onboardingData.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                  backgroundColor:
                    index === currentIndex ? Colors.primary : "#E5E7EB",
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {renderPagination()}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {currentIndex === onboardingData.length - 1
              ? "Create Account"
              : "Next"}
          </Text>
        </TouchableOpacity>

        {currentIndex === onboardingData.length - 1 && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/signin")}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>
              Already Have an Account
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  skipContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: "flex-end",
  },
  skipText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  slide: {
    width,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: width * 0.85,
    height: height * 0.4,
    marginBottom: 40,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "Poppins-Bold",
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    fontFamily: "Poppins-Regular",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
  },
});
