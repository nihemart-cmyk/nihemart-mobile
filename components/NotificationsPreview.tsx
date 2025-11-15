import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import {
   useNotifications,
   AppNotification,
} from "@/contexts/NotificationContext";
import Colors from "@/constants/colors";
import Fonts from "@/constants/fonts";
import {
   Bell,
   Package,
   Truck,
   Tag,
   Info,
   ChevronRight,
} from "lucide-react-native";

const getNotificationIcon = (type: AppNotification["type"]) => {
   switch (type) {
      case "order":
         return Package;
      case "delivery":
         return Truck;
      case "promotion":
         return Tag;
      default:
         return Info;
   }
};

const formatTimestamp = (timestamp: number) => {
   const now = Date.now();
   const diff = now - timestamp;
   const minutes = Math.floor(diff / 60000);
   const hours = Math.floor(diff / 3600000);
   const days = Math.floor(diff / 86400000);

   if (minutes < 1) return "Just now";
   if (minutes < 60) return `${minutes}m ago`;
   if (hours < 24) return `${hours}h ago`;
   if (days < 7) return `${days}d ago`;
   return new Date(timestamp).toLocaleDateString();
};

interface NotificationsPreviewProps {
   maxItems?: number;
}

function NotificationPreviewItem({
   notification,
}: {
   notification: AppNotification;
}) {
   const IconComponent = getNotificationIcon(notification.type);

   return (
      <View
         className="flex-row items-start p-3 border-b"
         style={{ borderBottomColor: Colors.border }}
      >
         <View
            className="w-8 h-8 rounded-full justify-center items-center mr-2"
            style={{
               backgroundColor: notification.read
                  ? Colors.border
                  : Colors.primary,
            }}
         >
            <IconComponent
               size={16}
               color={notification.read ? Colors.textSecondary : Colors.white}
            />
         </View>

         <View className="flex-1">
            <Text
               numberOfLines={1}
               className="text-[13px] mb-0.5"
               style={{ fontFamily: Fonts.semiBold, color: Colors.text }}
            >
               {notification.title}
            </Text>
            <Text
               numberOfLines={1}
               className="text-[12px]"
               style={{
                  fontFamily: Fonts.regular,
                  color: Colors.textSecondary,
               }}
            >
               {notification.body}
            </Text>
         </View>
      </View>
   );
}

export default function NotificationsPreview({
   maxItems = 3,
}: NotificationsPreviewProps) {
   const router = useRouter();
   const { notifications, unreadCount } = useNotifications();
   const previewNotifications = notifications.slice(0, maxItems);

   if (notifications.length === 0) {
      return null;
   }

   return (
      <TouchableOpacity
         className="bg-white rounded-2xl overflow-hidden shadow-sm"
         onPress={() => router.push("/notifications")}
         activeOpacity={0.7}
      >
         <View
            className="p-4 border-b"
            style={{ borderBottomColor: Colors.border }}
         >
            <View className="flex-row items-center justify-between">
               <View className="flex-row items-center gap-2">
                  <Bell
                     size={20}
                     color={Colors.primary}
                  />
                  <Text
                     className="text-lg font-bold"
                     style={{ fontFamily: Fonts.semiBold, color: Colors.text }}
                  >
                     Notifications
                  </Text>
                  {unreadCount > 0 && (
                     <View className="bg-primary rounded-full px-2 py-1 min-w-[24px] items-center justify-center">
                        <Text className="text-white text-xs font-bold">
                           {unreadCount > 99 ? "99+" : unreadCount}
                        </Text>
                     </View>
                  )}
               </View>
               <ChevronRight
                  size={20}
                  color={Colors.textSecondary}
               />
            </View>
         </View>

         <FlatList
            data={previewNotifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
               <NotificationPreviewItem notification={item} />
            )}
            scrollEnabled={false}
         />

         {notifications.length > maxItems && (
            <View
               className="p-3 items-center border-t"
               style={{ borderTopColor: Colors.border }}
            >
               <Text
                  className="text-[12px] font-semibold"
                  style={{ fontFamily: Fonts.semiBold, color: Colors.primary }}
               >
                  View all {notifications.length} notifications
               </Text>
            </View>
         )}
      </TouchableOpacity>
   );
}
