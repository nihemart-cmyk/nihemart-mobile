import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Globe, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/locales/i18n';
import { useTranslation } from 'react-i18next';

type Language = 'en' | 'rw';

export default function LanguageSelectScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleLanguageSelect = async (language: Language) => {
    setSelectedLanguage(language);
    await i18n.changeLanguage(language);
  };

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem('language', selectedLanguage);
      await AsyncStorage.setItem('hasSelectedLanguage', 'true');
      router.replace('/(tabs)');
    } catch (error) {
      console.log('Error saving language:', error);
    }
  };

  const languages = [
    { code: 'en' as Language, name: t('languageSelection.english'), nativeName: 'English' },
    { code: 'rw' as Language, name: t('languageSelection.kinyarwanda'), nativeName: 'Ikinyarwanda' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Globe size={64} color={Colors.primary} strokeWidth={1.5} />
          </View>
        </View>

        <Text style={styles.title}>{t('languageSelection.title')}</Text>
        <Text style={styles.subtitle}>{t('languageSelection.subtitle')}</Text>

        <View style={styles.languageList}>
          {languages.map((language) => {
            const isSelected = selectedLanguage === language.code;
            return (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageCard,
                  isSelected && styles.languageCardSelected,
                ]}
                onPress={() => handleLanguageSelect(language.code)}
                activeOpacity={0.7}
              >
                <View style={styles.languageInfo}>
                  <Text style={[styles.languageName, isSelected && styles.languageNameSelected]}>
                    {language.nativeName}
                  </Text>
                  <Text style={[styles.languageSubname, isSelected && styles.languageSubnameSelected]}>
                    {language.name}
                  </Text>
                </View>
                {isSelected && (
                  <View style={styles.checkContainer}>
                    <Check size={24} color={Colors.white} strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>{t('languageSelection.continue')}</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary + '20',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 48,
    textAlign: 'center',
  },
  languageList: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
    marginBottom: 32,
  },
  languageCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  languageCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  languageNameSelected: {
    color: Colors.white,
  },
  languageSubname: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  languageSubnameSelected: {
    color: Colors.white,
    opacity: 0.9,
  },
  checkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  continueButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
});
