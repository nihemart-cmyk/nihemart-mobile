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
      <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
        <View className="bg-primary py-8 px-6 items-center rounded-b-3xl">
          <View className="mb-4">
            <View className="w-20 h-20 rounded-full bg-white bg-opacity-20 items-center justify-center border-4 border-white">
              <User size={40} color={Colors.white} />
            </View>
          </View>
          <Text className="text-2xl font-bold text-white mb-1">John Doe</Text>
          <Text className="text-lg text-white opacity-90">john.doe@email.com</Text>
        </View>

        <View className="p-4">
          <Text className="text-xl font-bold text-text mb-3">{t('profile.accountInfo')}</Text>

          <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm">
            <View className="w-10 h-10 rounded-full bg-primary bg-opacity-15 items-center justify-center mr-3">
              <Phone size={20} color={Colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-textSecondary mb-1">{t('profile.phoneNumber')}</Text>
              <Text className="text-base text-text font-medium">+91 98765 43210</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm">
            <View className="w-10 h-10 rounded-full bg-primary bg-opacity-15 items-center justify-center mr-3">
              <Mail size={20} color={Colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-textSecondary mb-1">{t('profile.emailAddress')}</Text>
              <Text className="text-base text-text font-medium">john.doe@email.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm">
            <View className="w-10 h-10 rounded-full bg-primary bg-opacity-15 items-center justify-center mr-3">
              <MapPin size={20} color={Colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-textSecondary mb-1">{t('profile.defaultAddress')}</Text>
              <Text className="text-base text-text font-medium">123 Main St, City, State 123456</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="p-4">
          <Text className="text-xl font-bold text-text mb-3">{t('profile.settings')}</Text>

          <View className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between shadow-sm">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-secondary bg-opacity-15 items-center justify-center mr-3">
                <Bike size={20} color={Colors.secondary} />
              </View>
              <View>
                <Text className="text-base font-semibold text-text">{t('profile.riderMode')}</Text>
                <Text className="text-sm text-textSecondary mt-1">{t('profile.riderModeSubtext')}</Text>
              </View>
            </View>
            <Switch
              value={mode === 'rider'}
              onValueChange={handleModeSwitch}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm" onPress={handleLanguageSwitch}>
            <View className="w-10 h-10 rounded-full bg-primary bg-opacity-15 items-center justify-center mr-3">
              <Languages size={20} color={Colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-base text-text font-medium">{t('profile.language')}</Text>
              <Text className="text-sm text-textSecondary mt-1">{language === 'en' ? 'English' : 'Ikinyarwanda'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm"
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
            <View className="w-10 h-10 rounded-full bg-primary bg-opacity-15 items-center justify-center mr-3">
              <Bell size={20} color={Colors.primary} />
            </View>
            <Text className="text-base text-text font-medium">{t('profile.testNotification')}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm">
            <View className="w-10 h-10 rounded-full bg-background items-center justify-center mr-3">
              <Settings size={20} color={Colors.text} />
            </View>
            <Text className="text-base text-text font-medium">{t('profile.appSettings')}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm">
            <View className="w-10 h-10 rounded-full bg-error bg-opacity-15 items-center justify-center mr-3">
              <LogOut size={20} color={Colors.error} />
            </View>
            <Text className="text-base text-error font-medium">{t('profile.logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: Colors.background },
//   header: { backgroundColor: Colors.primary, paddingVertical: 32, paddingHorizontal: 24, alignItems: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
//   avatarContainer: { marginBottom: 16 },
//   avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.white },
//   name: { fontSize: 24, fontWeight: 'bold', color: Colors.white, marginBottom: 4 },
//   email: { fontSize: 16, color: Colors.white, opacity: 0.9 },
//   section: { padding: 16 },
//   sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
//   infoCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
//   infoIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
//   infoContent: { flex: 1 },
//   infoLabel: { fontSize: 14, color: Colors.textSecondary, marginBottom: 4 },
//   infoValue: { fontSize: 16, color: Colors.text, fontWeight: '500' },
//   settingCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
//   settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
//   settingLabel: { fontSize: 16, color: Colors.text, fontWeight: '600' },
//   settingSubtext: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
//   menuItem: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
//   menuIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
//   menuText: { fontSize: 16, color: Colors.text, fontWeight: '500' },
//   menuContent: { flex: 1 },
//   menuSubtext: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
// });
