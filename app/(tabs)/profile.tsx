import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { User, MapPin, Phone, Mail, Settings, LogOut, Bike, Bell, Languages } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useNotifications } from '@/contexts/NotificationContext';
import Colors from '@/constants/colors';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen() {
  const { mode, switchMode, language, changeLanguage } = useApp();
  const { scheduleLocalNotification } = useNotifications();
  const { t } = useTranslation();

  const handleModeSwitch = (value: boolean) => {
    const newMode = value ? 'rider' : 'user';
    Alert.alert(
      `${t('profile.switchTo')} ${newMode === 'rider' ? t('profile.riderMode_short') : t('profile.userMode')} ${t('profile.mode')}?`,
      `${t('profile.switchMessage')} ${newMode} ${t('profile.panel')}.`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: () => switchMode(newMode)
        }
      ]
    );
  };

  const handleLanguageSwitch = () => {
    Alert.alert(
      t('profile.language'),
      t('profile.languageSubtext'),
      [
        {
          text: 'English',
          onPress: () => changeLanguage('en'),
          style: language === 'en' ? 'default' : 'cancel'
        },
        {
          text: 'Ikinyarwanda',
          onPress: () => changeLanguage('rw'),
          style: language === 'rw' ? 'default' : 'cancel'
        },
        { text: t('common.cancel'), style: 'cancel' }
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: t('profile.title') }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color={Colors.white} />
            </View>
          </View>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@email.com</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.accountInfo')}</Text>
          
          <TouchableOpacity style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Phone size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('profile.phoneNumber')}</Text>
              <Text style={styles.infoValue}>+91 98765 43210</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Mail size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('profile.emailAddress')}</Text>
              <Text style={styles.infoValue}>john.doe@email.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <MapPin size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('profile.defaultAddress')}</Text>
              <Text style={styles.infoValue}>123 Main St, City, State 123456</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.infoIcon}>
                <Bike size={20} color={Colors.secondary} />
              </View>
              <View>
                <Text style={styles.settingLabel}>{t('profile.riderMode')}</Text>
                <Text style={styles.settingSubtext}>{t('profile.riderModeSubtext')}</Text>
              </View>
            </View>
            <Switch
              value={mode === 'rider'}
              onValueChange={handleModeSwitch}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          <TouchableOpacity style={styles.menuItem} onPress={handleLanguageSwitch}>
            <View style={styles.menuIcon}>
              <Languages size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>{t('profile.language')}</Text>
              <Text style={styles.menuSubtext}>
                {language === 'en' ? 'English' : 'Ikinyarwanda'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              scheduleLocalNotification(
                t('notifications.testTitle'),
                t('notifications.testMessage'),
                {},
                'system'
              );
              Alert.alert(t('common.done'), t('notifications.testSuccess'));
            }}
          >
            <View style={styles.menuIcon}>
              <Bell size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuText}>{t('profile.testNotification')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Settings size={20} color={Colors.text} />
            </View>
            <Text style={styles.menuText}>{t('profile.appSettings')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <LogOut size={20} color={Colors.error} />
            </View>
            <Text style={[styles.menuText, { color: Colors.error }]}>{t('profile.logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  settingCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  settingSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  menuContent: {
    flex: 1,
  },
  menuSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
