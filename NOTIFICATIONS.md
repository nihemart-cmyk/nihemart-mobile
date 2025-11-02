# Nihemart Notification System

## Overview
The Nihemart app now features a comprehensive real-time notification system that works for both regular users and delivery riders. Notifications can be displayed even when the app is not in the foreground, providing a seamless experience.

## Features

### ✅ Implemented Features

1. **Real-time Push Notifications**
   - Push notifications using Expo Notifications
   - Works on both iOS and Android
   - Notifications appear even when app is in background or killed

2. **In-App Notification Banner**
   - Beautiful animated notification banner
   - Appears at the top when app is in foreground
   - Auto-dismisses after 4 seconds
   - Tap to view details or dismiss manually

3. **Notification Center**
   - Dedicated notifications screen (`/notifications`)
   - View all notifications in one place
   - Unread notifications highlighted
   - Individual notification deletion
   - Mark all as read
   - Clear all notifications

4. **Notification Bell Icon**
   - Appears in headers of both user and rider panels
   - Shows unread count badge
   - Animated when new notifications arrive
   - Tap to open notification center

5. **Notification Types**
   - 📦 **Order** - Order status updates
   - 🚚 **Delivery** - Delivery updates for riders
   - 🏷️ **Promotion** - Special offers and discounts
   - ℹ️ **System** - General app notifications

6. **Persistent Storage**
   - Notifications stored locally using AsyncStorage
   - Persist across app restarts
   - Keeps last 100 notifications

## Usage

### For Users
1. **Receive Notifications**: Order confirmations, status updates, and promotions
2. **View Notifications**: Tap the bell icon in the header
3. **Test Notifications**: Go to Profile → Test Notification

### For Riders
1. **Receive Notifications**: New delivery requests, pickup/drop-off updates
2. **View Notifications**: Tap the bell icon in the header
3. **Test Notifications**: Go to Rider Profile → Test Notification

## Technical Implementation

### Key Components

1. **NotificationContext** (`contexts/NotificationContext.tsx`)
   - Manages notification state
   - Handles permission requests
   - Stores and retrieves notifications
   - Provides hooks for notification operations

2. **NotificationBell** (`components/NotificationBell.tsx`)
   - Header icon with unread badge
   - Animated on new notifications
   - Opens notification center

3. **InAppNotificationBanner** (`components/InAppNotificationBanner.tsx`)
   - Foreground notification display
   - Animated slide-in from top
   - Tap to view or dismiss

4. **NotificationsScreen** (`app/notifications.tsx`)
   - Full notification list
   - Mark as read/unread
   - Delete individual or all notifications

### API Methods

```typescript
// Send a local notification
scheduleLocalNotification(
  title: string,
  body: string,
  data?: any,
  type?: 'order' | 'delivery' | 'promotion' | 'system'
)

// Mark notification as read
markAsRead(notificationId: string)

// Mark all notifications as read
markAllAsRead()

// Delete a notification
deleteNotification(notificationId: string)

// Clear all notifications
clearAllNotifications()
```

### Integration Example

```typescript
import { useNotifications } from '@/contexts/NotificationContext';

function MyComponent() {
  const { scheduleLocalNotification } = useNotifications();
  
  // Send an order notification
  scheduleLocalNotification(
    'Order Confirmed',
    'Your order #12345 has been confirmed and is being prepared.',
    { orderId: '12345' },
    'order'
  );
}
```

## Setup Requirements

### Permissions
- **iOS**: Notification permissions requested automatically
- **Android**: Automatic with notification channel setup
- **Web**: Limited support (in-app banner works, push notifications don't)

### Configuration
The notification system is automatically configured with:
- Android notification channel with high priority
- Custom vibration pattern
- Brand color (orange #FF6B35)
- Sound enabled

### Push Token
The app generates an Expo Push Token for each device, which can be used with a backend service to send push notifications remotely.

## Future Enhancements

Potential improvements for production:

1. **Backend Integration**
   - Connect to real-time notification service
   - Send push notifications from server
   - Store notification history on server

2. **Advanced Features**
   - Notification scheduling
   - Quiet hours/Do Not Disturb
   - Notification preferences by type
   - Rich notifications with images
   - Action buttons (Accept/Reject delivery)

3. **Analytics**
   - Track notification open rates
   - Measure user engagement
   - A/B testing for notification content

## Testing

### Test Notifications
1. Open the app
2. Go to Profile (user) or Rider Profile
3. Tap "Test Notification"
4. Observe:
   - In-app banner appears (if app is open)
   - Notification appears in notification center
   - Bell icon shows unread badge
   - System notification (if app is closed/background)

### Permission Testing
- First launch: Permission dialog appears
- Denied: Console logs permission failure
- Granted: Notifications work normally

## Notes

- Notifications work best on physical devices
- Simulator/emulator has limited notification support
- Web platform has partial support (no push notifications)
- Maximum 100 notifications stored locally
- Old notifications automatically removed when limit exceeded
