import Flag from "@/components/Flag";
import Colors from "@/constants/colors";
import i18n from "@/locales/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ArrowRight, Check, Search } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Language = "en" | "rw" | "id" | "zh" | "de";

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flagCode: "en" | "rw";
}

export default function LanguageSelectScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("language");
        if (savedLanguage && (savedLanguage === "en" || savedLanguage === "rw")) {
          setSelectedLanguage(savedLanguage as Language);
          await i18n.changeLanguage(savedLanguage);
        }
      } catch (error) {
        console.log("Error loading saved language:", error);
      }
    };
    loadSavedLanguage();
  }, []);

  const allLanguages: LanguageOption[] = [
    {
      code: "en",
      name: "English",
      nativeName: "English",
      flagCode: "en",
    },
    {
      code: "rw",
      name: "Kinyarwanda",
      nativeName: "Ikinyarwanda",
      flagCode: "rw",
    },
    // {
    //   code: "id",
    //   name: "Bahasa Indonesia",
    //   nativeName: "Bahasa Indonesia",
    //   flagCode: "en", // Using placeholder flag
    // },
    // {
    //   code: "zh",
    //   name: "Chinese",
    //   nativeName: "中文",
    //   flagCode: "en", // Using placeholder flag
    // },
    // {
    //   code: "de",
    //   name: "Deutsch",
    //   nativeName: "Deutsch",
    //   flagCode: "en", // Using placeholder flag
    // },
  ];

  const filteredLanguages = allLanguages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageSelect = async (language: Language) => {
    setSelectedLanguage(language);
    // Only change i18n for supported languages
    if (language === "en" || language === "rw") {
      await i18n.changeLanguage(language);
    }
  };

  const handleContinue = async () => {
    try {
      // Only save supported languages
      if (selectedLanguage === "en" || selectedLanguage === "rw") {
        await AsyncStorage.setItem("language", selectedLanguage);
      }
      await AsyncStorage.setItem("hasSelectedLanguage", "true");
      
      // Check if onboarding has been completed
      const hasCompletedOnboarding = await AsyncStorage.getItem(
        "hasCompletedOnboarding"
      );
      
      if (!hasCompletedOnboarding) {
        router.replace("/onboarding");
      } else {
        // Check auth state
        const { useAuthStore } = await import("@/store/auth.store");
        const user = useAuthStore.getState().user;
        if (user) {
          router.replace("/(tabs)");
        } else {
          router.replace("/signin");
        }
      }
    } catch (error) {
      console.log("Error saving language:", error);
    }
  };

  const renderLanguageItem = ({ item }: { item: LanguageOption }) => {
    const isSelected = selectedLanguage === item.code;
    const isSupported = item.code === "en" || item.code === "rw";

    return (
      <TouchableOpacity
        onPress={() => handleLanguageSelect(item.code)}
        activeOpacity={0.7}
        style={[
          styles.languageItem,
          isSelected && styles.languageItemSelected,
        ]}
      >
        <View style={styles.languageItemContent}>
          <View style={styles.flagContainer}>
            <Flag code={item.flagCode} size={32} />
          </View>
          <Text style={styles.languageName}>{item.nativeName}</Text>
        </View>
        {isSelected && (
          <View style={styles.checkmarkContainer}>
            <Check size={20} color={Colors.primary} strokeWidth={3} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View style={styles.header}>
        {/* <View style={styles.headerButton} /> */}
        <Text style={styles.headerTitle}>Select Language</Text>
        <TouchableOpacity
          onPress={handleContinue}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Text style={styles.continueText}>Continue</Text>
          <ArrowRight size={20} color={Colors.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textSecondary} strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search language"
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Language List */}
      <FlatList
        data={filteredLanguages}
        renderItem={renderLanguageItem}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    minWidth: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  continueText: {
    fontSize: 16,
    color: Colors.primary,
    fontFamily: "Poppins-SemiBold",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Poppins-SemiBold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontFamily: "Poppins-Regular",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  languageItemSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.primary + "08",
  },
  languageItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flagContainer: {
    marginRight: 16,
  },
  languageName: {
    fontSize: 16,
    color: Colors.text,
    fontFamily: "Poppins-Medium",
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
