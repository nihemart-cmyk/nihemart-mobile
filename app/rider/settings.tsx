import Colors from "@/constants/colors";
import { useAuthStore } from "@/store/auth.store";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
   ScrollView,
   Text,
   View,
   TouchableOpacity,
   Switch,
   Alert,
} from "react-native";
import {
   ChevronLeft,
   User,
   Phone,
   MapPin,
   Car,
   Bell,
   Shield,
   HelpCircle,
   LogOut,
   Mail,
   Globe,
} from "lucide-react-native";

interface SettingItemProps {
   icon: React.ComponentType<any>;
   title: string;
   subtitle?: string;
   value?: boolean;
   onValueChange?: (value: boolean) => void;
   onPress?: () => void;
   showSwitch?: boolean;
   showChevron?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
   icon: Icon,
   title,
   subtitle,
   value,
   onValueChange,
   onPress,
   showSwitch = false,
   showChevron = true,
}) => (
   <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-4 px-1 border-b border-gray-100"
   >
      <View className="flex-row items-center flex-1">
         <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center mr-3">
            <Icon
               size={20}
               color={Colors.primary}
            />
         </View>
         <View className="flex-1">
            <Text className="text-gray-900 font-medium">{title}</Text>
            {subtitle && (
               <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>
            )}
         </View>
      </View>
      
      {showSwitch ? (
         <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: "#e5e7eb", true: Colors.primary }}
            thumbColor="#fff"
         />
      ) : showChevron ? (
         <ChevronLeft
            size={20}
            color={Colors.textSecondary}
            style={{ transform: [{ rotate: '180deg' }] }}
         />
      ) : null}
   </TouchableOpacity>
);

export default function RiderSettings() {
   const router = useRouter();
   const { signOut, user } = useAuthStore();
   const [notifications, setNotifications] = useState(true);
   const [availability, setAvailability] = useState(true);
   const [locationTracking, setLocationTracking] = useState(true);

   const handleSignOut = () => {
      Alert.alert(
         "Sign Out",
         "Are you sure you want to sign out?",
         [
            { text: "Cancel", style: "cancel" },
            { 
               text: "Sign Out", 
               style: "destructive",
               onPress: signOut
            },
         ]
      );
   };

   const sections = [
      {
         title: "Profile",
         data: [
            {
               icon: User,
               title: "Personal Information",
               subtitle: "Update your profile details",
               onPress: () => router.push("/rider/profile"),
            },
            {
               icon: Phone,
               title: "Contact Information",
               subtitle: "Phone number and email",
               onPress: () => {},
            },
            {
               icon: MapPin,
               title: "Service Areas",
               subtitle: "Manage your delivery zones",
               onPress: () => {},
            },
            {
               icon: Car,
               title: "Vehicle Information",
               subtitle: "Update your vehicle details",
               onPress: () => {},
            },
         ],
      },
      {
         title: "Preferences",
         data: [
            {
               icon: Bell,
               title: "Push Notifications",
               subtitle: "Order alerts and updates",
               value: notifications,
               onValueChange: setNotifications,
               showSwitch: true,
               showChevron: false,
            },
            {
               icon: Globe,
               title: "Availability Status",
               subtitle: "Go online/offline for orders",
               value: availability,
               onValueChange: setAvailability,
               showSwitch: true,
               showChevron: false,
            },
            {
               icon: MapPin,
               title: "Location Tracking",
               subtitle: "Share location during deliveries",
               value: locationTracking,
               onValueChange: setLocationTracking,
               showSwitch: true,
               showChevron: false,
            },
         ],
      },
      {
         title: "Support",
         data: [
            {
               icon: Shield,
               title: "Privacy & Security",
               subtitle: "Manage your data and security",
               onPress: () => {},
            },
            {
               icon: HelpCircle,
               title: "Help & Support",
               subtitle: "Get help with the app",
               onPress: () => {},
            },
            {
               icon: Mail,
               title: "Contact Support",
               subtitle: "Reach out to our team",
               onPress: () => {},
            },
         ],
      },
   ];

   return (
      <>
         <Stack.Screen 
            options={{ 
               headerShown: true,
               title: "Settings",
               headerLeft: () => (
                  <TouchableOpacity
                     onPress={() => router.back()}
                     className="mr-4"
                  >
                     <ChevronLeft
                        size={24}
                        color="#fff"
                     />
                  </TouchableOpacity>
               ),
               headerStyle: {
                  backgroundColor: Colors.primary,
               },
               headerTintColor: "#fff",
            }} 
         />
         
         <View className="flex-1 bg-gray-50">
            {/* Profile Header */}
            <View className="bg-white p-6 border-b border-gray-200">
               <View className="flex-row items-center">
                  <View className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl items-center justify-center mr-4">
                     <Text className="text-white font-bold text-2xl">
                        {user?.email?.charAt(0).toUpperCase()}
                     </Text>
                  </View>
                  
                  <View className="flex-1">
                     <Text className="text-xl font-bold text-gray-900 mb-1">
                        {user?.email?.split('@')[0]}
                     </Text>
                     <Text className="text-gray-600 text-sm mb-2">
                        Professional Delivery Rider
                     </Text>
                     <View className="flex-row">
                        <View className="bg-green-100 px-2 py-1 rounded-full mr-2">
                           <Text className="text-green-700 text-xs font-medium">
                              {availability ? "Online" : "Offline"}
                           </Text>
                        </View>
                        <View className="bg-blue-100 px-2 py-1 rounded-full">
                           <Text className="text-blue-700 text-xs font-medium">
                              4.8 ★
                           </Text>
                        </View>
                     </View>
                  </View>
               </View>
            </View>

            <ScrollView className="flex-1">
               {sections.map((section, index) => (
                  <View
                     key={section.title}
                     className="bg-white mt-4 first:mt-0"
                  >
                     <View className="px-4 py-3 border-b border-gray-100">
                        <Text className="text-gray-500 text-sm font-medium">
                           {section.title}
                        </Text>
                     </View>
                     
                     {section.data.map((item, itemIndex) => (
                        <SettingItem
                           key={item.title}
                           icon={item.icon}
                           title={item.title}
                           subtitle={item.subtitle}
                           value={item.value}
                           onValueChange={item.onValueChange}
                           onPress={item.onPress}
                           showSwitch={item.showSwitch}
                           showChevron={item.showChevron}
                        />
                     ))}
                  </View>
               ))}
               
               {/* Sign Out Button */}
               <TouchableOpacity
                  onPress={handleSignOut}
                  className="mx-4 my-6 bg-white rounded-2xl py-4 flex-row items-center justify-center shadow-sm border border-gray-100"
               >
                  <LogOut
                     size={20}
                     color="#ef4444"
                  />
                  <Text className="text-red-500 font-medium ml-2">
                     Sign Out
                  </Text>
               </TouchableOpacity>
               
               
            </ScrollView>
         </View>
      </>
   );
}