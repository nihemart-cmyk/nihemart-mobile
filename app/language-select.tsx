import Flag from "@/components/Flag";
import Colors from "@/constants/colors";
import i18n from "@/locales/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Check, Globe } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Language = "en" | "rw";

export default function LanguageSelectScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 9,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLanguageSelect = async (language: Language) => {
    setSelectedLanguage(language);
    await i18n.changeLanguage(language);
  };

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem("language", selectedLanguage);
      await AsyncStorage.setItem("hasSelectedLanguage", "true");
      router.replace("/(tabs)");
    } catch (error) {
      console.log("Error saving language:", error);
    }
  };

  const languages = [
    {
      code: "en" as Language,
      name: t("languageSelection.english"),
      nativeName: t("languageSelection.nativeEnglish"),
    },
    {
      code: "rw" as Language,
      name: t("languageSelection.kinyarwanda"),
      nativeName: t("languageSelection.nativeKinyarwanda"),
    },
  ];

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.background }}
      edges={["top", "bottom"]}
    >
      <Animated.View
        className="flex-1 px-6 justify-center"
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        {/* Icon */}
        <View className="items-center mb-8">
          <View
            className="w-24 h-24 rounded-full items-center justify-center"
            style={{
              backgroundColor: Colors.primary + "15",
            }}
          >
            <Globe size={48} color={Colors.primary} strokeWidth={1.8} />
          </View>
        </View>

        {/* Title */}
        <Text
          className="text-3xl font-bold text-center mb-3"
          style={{ color: Colors.text }}
        >
          {t("languageSelection.title")}
        </Text>
        <Text
          className="text-base text-center mb-12 px-4"
          style={{ color: Colors.textSecondary }}
        >
          {t("languageSelection.subtitle")}
        </Text>

        {/* Language Options */}
        <View className="w-full max-w-[400px] mx-auto gap-3 mb-8">
          {languages.map((language) => {
            const isSelected = selectedLanguage === language.code;
            return (
              <TouchableOpacity
                key={language.code}
                onPress={() => handleLanguageSelect(language.code)}
                activeOpacity={0.7}
                className="flex-row items-center justify-between rounded-2xl p-2 bg-white border"
                style={{
                  borderColor: isSelected ? Colors.primary : Colors.border,
                  borderWidth: isSelected ? 2 : 1,
                }}
              >
                <View className="flex-row items-center flex-1">
                  <View style={{ marginRight: 12 }}>
                    <Flag code={language.code} size={36} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-semibold mb-0.5"
                      style={{ color: Colors.text }}
                    >
                      {language.nativeName}
                    </Text>
                    <Text
                      className="text-sm"
                      style={{ color: Colors.textSecondary }}
                    >
                      {language.name}
                    </Text>
                  </View>
                </View>
                {isSelected ? (
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center"
                    style={{ backgroundColor: Colors.primary }}
                  >
                    <Check size={16} color="#fff" strokeWidth={3} />
                  </View>
                ) : (
                  <View
                    className="w-6 h-6 rounded-full border-2"
                    style={{ borderColor: Colors.border }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={0.8}
          className="items-center rounded-2xl py-3 "
          style={{
            backgroundColor: Colors.secondary,
          }}
        >
          <Text
            className="text-lg font-semibold"
            style={{ color: Colors.white }}
          >
            {t("languageSelection.continue")}
          </Text>
        </TouchableOpacity>
        <Text className="text-center">
          You can change this later in the settings
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}
