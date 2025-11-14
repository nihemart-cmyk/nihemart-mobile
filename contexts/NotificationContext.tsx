import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useRef, useCallback } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import toast from "@/utils/toast";

export interface AppNotification {
   id: string;
   title: string;
   body?: string;
   data?: any;
   timestamp: number;
   created_at?: string;
   read: boolean;
   type: "order" | "delivery" | "promotion" | "system";
   meta?: any;
}

Notifications.setNotificationHandler({
   handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
   }),
});

export const [NotificationProvider, useNotifications] = createContextHook(
   () => {
      const [expoPushToken, setExpoPushToken] = useState<string>("");
      const [notifications, setNotifications] = useState<AppNotification[]>([]);
      const [isLoading, setIsLoading] = useState<boolean>(true);
      const notificationListener = useRef<
         Notifications.Subscription | undefined
      >(undefined);
      const responseListener = useRef<Notifications.Subscription | undefined>(
         undefined
      );
      const channelRef = useRef<any | null>(null);
      const heartbeatIntervalRef = useRef<any | null>(null);
      const lastEventAtRef = useRef<number>(Date.now());

      const user = useAuthStore((s) => s.user);
      const hasRole = useAuthStore((s) => s.hasRole);
      const isAdmin = Boolean(hasRole && hasRole("admin"));

      const addNotification = useCallback((notification: AppNotification) => {
         setNotifications((prev) => {
            const newNotifications = [notification, ...prev].slice(0, 100);
            saveNotifications(newNotifications);
            return newNotifications;
         });
      }, []);

      const markAsRead = useCallback(async (notificationId: string) => {
         // Update locally first for immediate UI feedback
         setNotifications((prev) => {
            const updated = prev.map((n) =>
               n.id === notificationId ? { ...n, read: true } : n
            );
            saveNotifications(updated);
            return updated;
         });

         // Sync with backend
         try {
            const apiUrl =
               process.env.EXPO_PUBLIC_API_URL ||
               process.env.EXPO_PUBLIC_SITE_URL ||
               "";
            const endpoint = apiUrl
               ? `${apiUrl}/api/notifications/mark-read`
               : "/api/notifications/mark-read";

            await fetch(endpoint, {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify({ ids: [notificationId] }),
            });
         } catch (error) {
            console.warn(
               "Failed to mark notification as read on backend:",
               error
            );
         }
      }, []);

      // Convert backend notification to AppNotification format
      const normalizeBackendNotification = useCallback(
         (row: any): AppNotification => {
            const createdAt = row.created_at
               ? new Date(row.created_at).getTime()
               : Date.now();

            // Determine type from notification type or meta
            let type: AppNotification["type"] = "system";
            if (row.type) {
               if (row.type.includes("order")) type = "order";
               else if (
                  row.type.includes("delivery") ||
                  row.type.includes("assignment")
               )
                  type = "delivery";
               else if (row.type.includes("promotion")) type = "promotion";
            }

            try {
               const meta =
                  typeof row.meta === "string"
                     ? JSON.parse(row.meta)
                     : row.meta || {};
               if (meta.type) {
                  if (meta.type.includes("order")) type = "order";
                  else if (
                     meta.type.includes("delivery") ||
                     meta.type.includes("assignment")
                  )
                     type = "delivery";
                  else if (meta.type.includes("promotion")) type = "promotion";
               }
            } catch (e) {
               // ignore parse errors
            }

            return {
               id: row.id,
               title: row.title || "",
               body: row.body || "",
               meta: row.meta,
               timestamp: createdAt,
               created_at: row.created_at,
               read: Boolean(row.read),
               type,
            };
         },
         []
      );

      // Fetch notifications from backend
      const fetchPersistedNotifications = useCallback(async () => {
         if (!user) return;

         try {
            const apiUrl =
               process.env.EXPO_PUBLIC_API_URL ||
               process.env.EXPO_PUBLIC_SITE_URL ||
               "";

            // Fetch user-specific notifications
            const userEndpoint = apiUrl
               ? `${apiUrl}/api/notifications?userId=${encodeURIComponent(user.id)}&limit=100`
               : `/api/notifications?userId=${encodeURIComponent(user.id)}&limit=100`;

            const userRes = await fetch(userEndpoint);
            const userJson = userRes.ok
               ? await userRes.json()
               : { notifications: [] };
            let combined: any[] = userJson.notifications || [];

            // Fetch role-based notifications if admin
            if (isAdmin) {
               const adminEndpoint = apiUrl
                  ? `${apiUrl}/api/notifications?role=admin&limit=100`
                  : `/api/notifications?role=admin&limit=100`;
               const adminRes = await fetch(adminEndpoint);
               if (adminRes.ok) {
                  const adminJson = await adminRes.json();
                  combined = [...(adminJson.notifications || []), ...combined];
               }
            }

            // Dedupe by id
            const seen = new Set<string>();
            const deduped = combined.filter((n: any) => {
               if (!n || !n.id) return false;
               if (seen.has(n.id)) return false;
               seen.add(n.id);
               return true;
            });

            // Normalize and update state
            const normalized = deduped.map(normalizeBackendNotification);

            setNotifications((prev) => {
               // Merge with existing, dedupe by id
               const merged: AppNotification[] = [];
               const seenIds = new Set<string>();

               // Add fetched (newest first)
               for (const n of normalized) {
                  if (!seenIds.has(n.id)) {
                     merged.push(n);
                     seenIds.add(n.id);
                  }
               }

               // Add existing that aren't in fetched
               for (const p of prev) {
                  if (!seenIds.has(p.id)) {
                     merged.push(p);
                     seenIds.add(p.id);
                  }
               }

               const sorted = merged.sort((a, b) => {
                  const aTime = a.created_at
                     ? new Date(a.created_at).getTime()
                     : a.timestamp;
                  const bTime = b.created_at
                     ? new Date(b.created_at).getTime()
                     : b.timestamp;
                  return bTime - aTime;
               });

               saveNotifications(sorted.slice(0, 200));
               return sorted.slice(0, 200);
            });
         } catch (error) {
            console.warn("Error fetching persisted notifications:", error);
         }
      }, [user, isAdmin, normalizeBackendNotification]);

      const scheduleLocalNotification = useCallback(
         async (
            title: string,
            body: string,
            data?: any,
            type: AppNotification["type"] = "system"
         ) => {
            try {
               await Notifications.scheduleNotificationAsync({
                  content: {
                     title,
                     body,
                     data: { ...data, type },
                     sound: true,
                  },
                  trigger: null,
               });
            } catch (error) {
               console.log("Error scheduling notification:", error);
            }
         },
         []
      );

      // Handle realtime notification row
      const handleRealtimeRow = useCallback(
         (row: any) => {
            if (!user) return;

            const recipientUser = row.recipient_user_id;
            const recipientRole = row.recipient_role;

            const isForUser =
               recipientUser && String(recipientUser) === String(user.id);
            const isForAdmin = recipientRole === "admin" && isAdmin;

            // Check meta for user match (legacy support)
            let metaUserMatch = false;
            try {
               const meta =
                  typeof row.meta === "string"
                     ? JSON.parse(row.meta)
                     : row.meta || {};
               const possibleIds = [
                  meta.user_id,
                  meta.recipient_user_id,
                  meta.order?.user_id,
               ];
               for (const idCandidate of possibleIds) {
                  if (!idCandidate) continue;
                  if (String(idCandidate) === String(user.id)) {
                     metaUserMatch = true;
                     break;
                  }
               }
            } catch (e) {
               // ignore parse errors
            }

            if (!(isForUser || isForAdmin || metaUserMatch)) return;

            const normalized = normalizeBackendNotification(row);

            setNotifications((prev) => {
               // Replace if exists, otherwise add to front
               const idx = prev.findIndex((p) => p.id === normalized.id);
               if (idx >= 0) {
                  const copy = [...prev];
                  copy[idx] = normalized;
                  return copy;
               }

               // Dedupe by type and order/assignment ID if present
               try {
                  const newMeta =
                     typeof normalized.meta === "string"
                        ? JSON.parse(normalized.meta || "null")
                        : normalized.meta || {};

                  const keyCandidates = [
                     newMeta?.assignment?.id,
                     newMeta?.assignment_id,
                     newMeta?.order?.id,
                     newMeta?.order_id,
                  ].filter(Boolean);

                  if (keyCandidates.length > 0) {
                     const exists = prev.some((p) => {
                        if (p.type !== normalized.type) return false;
                        try {
                           const pm =
                              typeof p.meta === "string"
                                 ? JSON.parse(p.meta || "null")
                                 : p.meta || {};
                           const pKeys = [
                              pm?.assignment?.id,
                              pm?.assignment_id,
                              pm?.order?.id,
                              pm?.order_id,
                           ].filter(Boolean);
                           return pKeys.some((k) => keyCandidates.includes(k));
                        } catch (e) {
                           return false;
                        }
                     });
                     if (exists) return prev;
                  }
               } catch (e) {
                  // ignore
               }

               const updated = [normalized, ...prev].slice(0, 200);
               saveNotifications(updated);
               return updated;
            });

            // Show local Expo notification
            scheduleLocalNotification(
               normalized.title,
               normalized.body || "",
               normalized.meta,
               normalized.type
            );

            // Show toast for important notifications
            if (
               normalized.type === "order" &&
               normalized.title.includes("confirmed")
            ) {
               toast.success(normalized.title);
            } else if (normalized.type === "delivery") {
               toast.info(normalized.title);
            }
         },
         [
            user,
            isAdmin,
            normalizeBackendNotification,
            scheduleLocalNotification,
         ]
      );

      // Set up Supabase realtime subscription
      const setupRealtimeSubscription = useCallback(() => {
         if (!user) return;

         // Clean up existing channel
         if (channelRef.current) {
            try {
               supabase.removeChannel(channelRef.current);
            } catch (e) {
               channelRef.current?.unsubscribe?.();
            }
            channelRef.current = null;
         }

         const channel = supabase.channel(
            `public:notifications:user:${user.id}`
         );

         // Subscribe to INSERT events
         channel.on(
            "postgres_changes",
            {
               event: "INSERT",
               schema: "public",
               table: "notifications",
            },
            (payload: any) => {
               try {
                  lastEventAtRef.current = Date.now();
                  handleRealtimeRow(payload.new);
               } catch (e) {
                  console.warn("Error handling realtime notification:", e);
               }
            }
         );

         // Subscribe to UPDATE events
         channel.on(
            "postgres_changes",
            {
               event: "UPDATE",
               schema: "public",
               table: "notifications",
            },
            (payload: any) => {
               try {
                  lastEventAtRef.current = Date.now();
                  handleRealtimeRow(payload.new);
               } catch (e) {
                  console.warn("Error handling realtime update:", e);
               }
            }
         );

         channel.subscribe();
         channelRef.current = channel;

         // Start heartbeat for fallback polling
         if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
         }

         heartbeatIntervalRef.current = setInterval(() => {
            const now = Date.now();
            if (now - lastEventAtRef.current > 12000) {
               // No realtime events in last 12s, poll as fallback
               fetchPersistedNotifications();
            }
         }, 8000);
      }, [user, fetchPersistedNotifications, handleRealtimeRow]);

      useEffect(() => {
         if (!user) {
            setNotifications([]);
            setIsLoading(false);
            return;
         }

         // Initial load
         setIsLoading(true);
         loadNotifications();
         fetchPersistedNotifications();
         registerForPushNotificationsAsync();

         // Set up realtime subscription
         setupRealtimeSubscription();

         // Expo notification listeners
         notificationListener.current =
            Notifications.addNotificationReceivedListener((notification) => {
               console.log("Expo notification received:", notification);

               const newNotification: AppNotification = {
                  id: notification.request.identifier,
                  title: notification.request.content.title || "",
                  body: notification.request.content.body || "",
                  data: notification.request.content.data,
                  timestamp: Date.now(),
                  read: false,
                  type:
                     (notification.request.content.data
                        ?.type as AppNotification["type"]) || "system",
               };

               addNotification(newNotification);
            });

         responseListener.current =
            Notifications.addNotificationResponseReceivedListener(
               (response) => {
                  console.log("Expo notification tapped:", response);
                  const notificationId =
                     response.notification.request.identifier;
                  markAsRead(notificationId);
               }
            );

         return () => {
            if (notificationListener.current) {
               notificationListener.current.remove();
            }
            if (responseListener.current) {
               responseListener.current.remove();
            }
            if (channelRef.current) {
               try {
                  supabase.removeChannel(channelRef.current);
               } catch (e) {
                  channelRef.current?.unsubscribe?.();
               }
               channelRef.current = null;
            }
            if (heartbeatIntervalRef.current) {
               clearInterval(heartbeatIntervalRef.current);
               heartbeatIntervalRef.current = null;
            }
         };
      }, [
         user?.id,
         isAdmin,
         addNotification,
         markAsRead,
         fetchPersistedNotifications,
         setupRealtimeSubscription,
      ]);

      const loadNotifications = async () => {
         try {
            const stored = await AsyncStorage.getItem("notifications");
            if (stored) {
               setNotifications(JSON.parse(stored));
            }
         } catch (error) {
            console.log("Error loading notifications:", error);
         } finally {
            setIsLoading(false);
         }
      };

      const saveNotifications = async (notifs: AppNotification[]) => {
         try {
            await AsyncStorage.setItem("notifications", JSON.stringify(notifs));
         } catch (error) {
            console.log("Error saving notifications:", error);
         }
      };

      const registerForPushNotificationsAsync = async () => {
         let token = "";

         if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
               name: "default",
               importance: Notifications.AndroidImportance.MAX,
               vibrationPattern: [0, 250, 250, 250],
               lightColor: "#FF6B35",
            });
         }

         if (Device.isDevice) {
            const { status: existingStatus } =
               await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== "granted") {
               const { status } = await Notifications.requestPermissionsAsync();
               finalStatus = status;
            }

            if (finalStatus !== "granted") {
               console.log("Failed to get push token for push notification!");
               return;
            }

            try {
               const projectId =
                  Constants.expoConfig?.extra?.eas?.projectId ||
                  "wb85bt3o2ulha2cdv7zt5";
               token = (
                  await Notifications.getExpoPushTokenAsync({ projectId })
               ).data;
               console.log("Push token:", token);
            } catch (error) {
               console.log("Error getting push token:", error);
            }
         } else {
            console.log("Must use physical device for Push Notifications");
         }

         setExpoPushToken(token);
         return token;
      };

      const markAllAsRead = useCallback(async () => {
         // Update locally first
         const unreadIds = notifications
            .filter((n) => !n.read)
            .map((n) => n.id);
         if (unreadIds.length === 0) return;

         setNotifications((prev) => {
            const updated = prev.map((n) => ({ ...n, read: true }));
            saveNotifications(updated);
            return updated;
         });

         // Sync with backend
         try {
            const apiUrl =
               process.env.EXPO_PUBLIC_API_URL ||
               process.env.EXPO_PUBLIC_SITE_URL ||
               "";
            const endpoint = apiUrl
               ? `${apiUrl}/api/notifications/mark-read`
               : "/api/notifications/mark-read";

            await fetch(endpoint, {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify({ ids: unreadIds }),
            });
         } catch (error) {
            console.warn(
               "Failed to mark all notifications as read on backend:",
               error
            );
         }
      }, [notifications]);

      const deleteNotification = useCallback(async (notificationId: string) => {
         setNotifications((prev) => {
            const updated = prev.filter((n) => n.id !== notificationId);
            saveNotifications(updated);
            return updated;
         });
      }, []);

      const clearAllNotifications = useCallback(async () => {
         // Clear locally
         setNotifications([]);
         try {
            await AsyncStorage.removeItem("notifications");
            await Notifications.dismissAllNotificationsAsync();
         } catch (error) {
            console.log("Error clearing local notifications:", error);
         }

         // Optionally clear on backend (if API supports it)
         if (user) {
            try {
               const apiUrl =
                  process.env.EXPO_PUBLIC_API_URL ||
                  process.env.EXPO_PUBLIC_SITE_URL ||
                  "";
               const endpoint = apiUrl
                  ? `${apiUrl}/api/notifications/clear`
                  : "/api/notifications/clear";

               await fetch(endpoint, {
                  method: "POST",
                  headers: {
                     "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ userId: user.id }),
               });
            } catch (error) {
               console.warn("Failed to clear notifications on backend:", error);
            }
         }
      }, [user]);

      const unreadCount = notifications.filter((n) => !n.read).length;

      return {
         expoPushToken,
         notifications,
         unreadCount,
         isLoading,
         scheduleLocalNotification,
         markAsRead,
         markAllAsRead,
         deleteNotification,
         clearAllNotifications,
         addNotification,
      };
   }
);
