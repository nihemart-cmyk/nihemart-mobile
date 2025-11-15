import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { useNotifications } from "@/contexts/NotificationContext";
import useProfile from "@/hooks/useProfile";
import useRequireAuth from "@/hooks/useRequireAuth";
import { useAuthStore } from "@/store/auth.store";
import { Stack, useRouter } from "expo-router";
import {
   Bell,
   ChevronDown,
   ChevronRight,
   Languages,
   LogOut,
   Mail,
   MapPin,
   Phone,
   Settings,
   Shield,
   User,
   HelpCircle,
   FileText,
} from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
   Alert,
   ScrollView,
   Text,
   TouchableOpacity,
   View,
   Animated,
} from "react-native";

interface CollapsibleSectionProps {
   title: string;
   children: React.ReactNode;
   defaultExpanded?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
   title,
   children,
   defaultExpanded = false,
}) => {
   const [expanded, setExpanded] = useState(defaultExpanded);
   const [animation] = useState(new Animated.Value(defaultExpanded ? 1 : 0));

   const toggleExpand = () => {
      const toValue = expanded ? 0 : 1;
      Animated.spring(animation, {
         toValue,
         useNativeDriver: false,
         tension: 50,
         friction: 8,
      }).start();
      setExpanded(!expanded);
   };

   const rotateInterpolate = animation.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
   });

   return (
      <View className="mb-3">
         <TouchableOpacity
            className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-sm"
            onPress={toggleExpand}
            activeOpacity={0.7}
         >
            <Text className="text-lg font-bold text-text">{title}</Text>
            <Animated.View
               style={{ transform: [{ rotate: rotateInterpolate }] }}
            >
               <ChevronDown
                  size={24}
                  color={Colors.text}
               />
            </Animated.View>
         </TouchableOpacity>
         {expanded && (
            <View className="bg-white rounded-2xl mt-2 overflow-hidden shadow-sm">
               {children}
            </View>
         )}
      </View>
   );
};

export default function ProfileScreen() {
   const { language, changeLanguage } = useApp();
   const { scheduleLocalNotification } = useNotifications();
   const { t } = useTranslation();
   const { loading: authLoading, user } = useRequireAuth();

   const handleLanguageSwitch = () => {
      Alert.alert(t("profile.language"), t("profile.languageSubtext"), [
         {
            text: "English",
            onPress: () => changeLanguage("en"),
            style: language === "en" ? "default" : "cancel",
         },
         {
            text: "Ikinyarwanda",
            onPress: () => changeLanguage("rw"),
            style: language === "rw" ? "default" : "cancel",
         },
         { text: t("common.cancel"), style: "cancel" },
      ]);
   };

   const { profile, isLoading: profileLoading } = useProfile();
   const signOut = useAuthStore((s) => s.signOut);
   const router = useRouter();

   const displayName =
      profile?.full_name ??
      user?.user_metadata?.full_name ??
      user?.email ??
      "John Doe";

   if (authLoading) return null;

   return (
      <>
         <Stack.Screen options={{ title: t("profile.title") }} />
         <ScrollView
            className="flex-1 bg-background pb-20"
            showsVerticalScrollIndicator={false}
         >
            {/* Modern Header with Gradient Effect */}
            <View className="bg-primary pt-12 pb-8 px-6 items-center">
               <View className="mb-4 relative">
                  <View className="w-24 h-24 rounded-full bg-white items-center justify-center shadow-lg">
                     <User
                        size={48}
                        color={Colors.primary}
                     />
                  </View>
                  <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary items-center justify-center border-2 border-white">
                     <Settings
                        size={16}
                        color={Colors.white}
                     />
                  </View>
               </View>
               <Text className="text-2xl font-bold text-white mb-1">
                  {displayName}
               </Text>
               <Text className="text-base text-white opacity-80">
                  {user?.email ?? "john.doe@email.com"}
               </Text>
            </View>

            <View className="p-4 -mt-4">
               {/* Account Information - Collapsible */}
               <CollapsibleSection
                  title={t("profile.accountInfo")}
                  defaultExpanded={true}
               >
                  <TouchableOpacity className="p-4 border-b border-gray-100 flex-row items-center">
                     <View className="w-10 h-10 rounded-full bg-primary bg-opacity-10 items-center justify-center mr-3">
                        <Phone
                           size={20}
                           color={Colors.primary}
                        />
                     </View>
                     <View className="flex-1">
                        <Text className="text-xs text-textSecondary mb-1">
                           {t("profile.phoneNumber")}
                        </Text>
                        <Text className="text-base text-text font-medium">
                           {profile?.phone ?? "+91 98765 43210"}
                        </Text>
                     </View>
                     <ChevronRight
                        size={20}
                        color={Colors.textSecondary}
                     />
                  </TouchableOpacity>

                  <TouchableOpacity className="p-4 border-b border-gray-100 flex-row items-center">
                     <View className="w-10 h-10 rounded-full bg-primary bg-opacity-10 items-center justify-center mr-3">
                        <Mail
                           size={20}
                           color={Colors.primary}
                        />
                     </View>
                     <View className="flex-1">
                        <Text className="text-xs text-textSecondary mb-1">
                           {t("profile.emailAddress")}
                        </Text>
                        <Text className="text-base text-text font-medium">
                           {user?.email ?? "john.doe@email.com"}
                        </Text>
                     </View>
                     <ChevronRight
                        size={20}
                        color={Colors.textSecondary}
                     />
                  </TouchableOpacity>

                  <TouchableOpacity className="p-4 flex-row items-center">
                     <View className="w-10 h-10 rounded-full bg-primary bg-opacity-10 items-center justify-center mr-3">
                        <MapPin
                           size={20}
                           color={Colors.primary}
                        />
                     </View>
                     <View className="flex-1">
                        <Text className="text-xs text-textSecondary mb-1">
                           {t("profile.defaultAddress")}
                        </Text>
                        <Text className="text-base text-text font-medium">
                           123 Main St, City, State 123456
                        </Text>
                     </View>
                     <ChevronRight
                        size={20}
                        color={Colors.textSecondary}
                     />
                  </TouchableOpacity>
               </CollapsibleSection>

               {/* Preferences - Collapsible */}
               <CollapsibleSection title={t("profile.settings")}>
                  <TouchableOpacity
                     className="p-4 border-b border-gray-100 flex-row items-center"
                     onPress={handleLanguageSwitch}
                  >
                     <View className="w-10 h-10 rounded-full bg-secondary bg-opacity-10 items-center justify-center mr-3">
                        <Languages
                           size={20}
                           color={Colors.secondary}
                        />
                     </View>
                     <View className="flex-1">
                        <Text className="text-base text-text font-medium">
                           {t("profile.language")}
                        </Text>
                        <Text className="text-xs text-textSecondary mt-1">
                           {language === "en" ? "English" : "Ikinyarwanda"}
                        </Text>
                     </View>
                     <ChevronRight
                        size={20}
                        color={Colors.textSecondary}
                     />
                  </TouchableOpacity>

                  <TouchableOpacity
                     className="p-4 border-b border-gray-100 flex-row items-center"
                     onPress={() => {
                        scheduleLocalNotification(
                           t("notifications.testTitle"),
                           t("notifications.testMessage"),
                           {},
                           "system"
                        );
                        Alert.alert(
                           t("common.done"),
                           t("notifications.testSuccess")
                        );
                     }}
                  >
                     <View className="w-10 h-10 rounded-full bg-secondary bg-opacity-10 items-center justify-center mr-3">
                        <Bell
                           size={20}
                           color={Colors.secondary}
                        />
                     </View>
                     <View className="flex-1">
                        <Text className="text-base text-text font-medium">
                           {t("profile.testNotification")}
                        </Text>
                        <Text className="text-xs text-textSecondary mt-1">
                           Test push notifications
                        </Text>
                     </View>
                     <ChevronRight
                        size={20}
                        color={Colors.textSecondary}
                     />
                  </TouchableOpacity>

                  <TouchableOpacity className="p-4 flex-row items-center">
                     <View className="w-10 h-10 rounded-full bg-secondary bg-opacity-10 items-center justify-center mr-3">
                        <Settings
                           size={20}
                           color={Colors.secondary}
                        />
                     </View>
                     <View className="flex-1">
                        <Text className="text-base text-text font-medium">
                           {t("profile.appSettings")}
                        </Text>
                        <Text className="text-xs text-textSecondary mt-1">
                           Advanced settings
                        </Text>
                     </View>
                     <ChevronRight
                        size={20}
                        color={Colors.textSecondary}
                     />
                  </TouchableOpacity>
               </CollapsibleSection>

               {/* Support & Legal - Collapsible */}
               <CollapsibleSection title="Support & Legal">
                  <TouchableOpacity className="p-4 border-b border-gray-100 flex-row items-center">
                     <View className="w-10 h-10 rounded-full bg-primary bg-opacity-10 items-center justify-center mr-3">
                        <HelpCircle
                           size={20}
                           color={Colors.primary}
                        />
                     </View>
                     <View className="flex-1">
                        <Text className="text-base text-text font-medium">
                           Help Center
                        </Text>
                        <Text className="text-xs text-textSecondary mt-1">
                           Get help and support
                        </Text>
                     </View>
                     <ChevronRight
                        size={20}
                        color={Colors.textSecondary}
                     />
                  </TouchableOpacity>

                  <TouchableOpacity className="p-4 border-b border-gray-100 flex-row items-center">
                     <View className="w-10 h-10 rounded-full bg-primary bg-opacity-10 items-center justify-center mr-3">
                        <Shield
                           size={20}
                           color={Colors.primary}
                        />
                     </View>
                     <View className="flex-1">
                        <Text className="text-base text-text font-medium">
                           Privacy Policy
                        </Text>
                        <Text className="text-xs text-textSecondary mt-1">
                           View our privacy policy
                        </Text>
                     </View>
                     <ChevronRight
                        size={20}
                        color={Colors.textSecondary}
                     />
                  </TouchableOpacity>

                  <TouchableOpacity className="p-4 flex-row items-center">
                     <View className="w-10 h-10 rounded-full bg-primary bg-opacity-10 items-center justify-center mr-3">
                        <FileText
                           size={20}
                           color={Colors.primary}
                        />
                     </View>
                     <View className="flex-1">
                        <Text className="text-base text-text font-medium">
                           Terms of Service
                        </Text>
                        <Text className="text-xs text-textSecondary mt-1">
                           Read our terms
                        </Text>
                     </View>
                     <ChevronRight
                        size={20}
                        color={Colors.textSecondary}
                     />
                  </TouchableOpacity>
               </CollapsibleSection>

               {/* Logout Button - Standalone */}
               <TouchableOpacity
                  className="bg-white rounded-2xl p-4 flex-row items-center shadow-sm mt-2"
                  onPress={async () => {
                     Alert.alert(
                        t("profile.logout"),
                        "Are you sure you want to log out?",
                        [
                           { text: t("common.cancel"), style: "cancel" },
                           {
                              text: t("profile.logout"),
                              onPress: async () => {
                                 try {
                                    await signOut();
                                    // Ensure immediate navigation even if auth listener delays
                                    try {
                                       router.replace("/signin" as any);
                                    } catch (navErr) {
                                       console.warn(
                                          "Router replace failed:",
                                          navErr
                                       );
                                    }
                                 } catch (err: any) {
                                    Alert.alert(
                                       t("common.error") || "Error",
                                       err?.message || "Failed to sign out"
                                    );
                                 }
                              },
                              style: "destructive",
                           },
                        ]
                     );
                  }}
               >
                  <View className="w-10 h-10 rounded-full bg-error bg-opacity-10 items-center justify-center mr-3">
                     <LogOut
                        size={20}
                        color={Colors.error}
                     />
                  </View>
                  <Text className="text-base text-error font-semibold">
                     {t("profile.logout")}
                  </Text>
               </TouchableOpacity>

               <View className="mt-6 mb-8 items-center">
                  <Text className="text-xs text-textSecondary">
                     Version 1.0.0
                  </Text>
               </View>
            </View>
         </ScrollView>
      </>
   );
}
