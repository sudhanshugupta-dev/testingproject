import { Platform } from 'react-native';
//NOTIFICATION FEATURE DISABLED - Commented out for now
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

interface NotificationData {
  [key: string]: any;
}

interface NotificationToken {
  os: string;
  token: string;
  userId?: string;
}

class NotificationHelper {
  private static instance: NotificationHelper;
  private notificationChannelCreated = false;

  static getInstance(): NotificationHelper {
    if (!NotificationHelper.instance) {
      NotificationHelper.instance = new NotificationHelper();
    }
    return NotificationHelper.instance;
  }

  configure() {
    // NOTIFICATION FEATURE DISABLED - Only badge functionality enabled
    
    // Configure the notification channel for Android
    if (Platform.OS === 'android' && !this.notificationChannelCreated) {
      // Use type assertion to bypass the TypeScript error for importance
      const channelConfig = {
        channelId: 'messages',
        channelName: 'Messages',
        channelDescription: 'Notifications for new messages',
        playSound: true,
        soundName: 'default',
        importance: 4, // IMPORTANCE_HIGH
        vibrate: true,
      };
      
      PushNotification.createChannel(
        channelConfig as any, // Type assertion to bypass the TypeScript error
        (created) => {
          console.log(`Notification channel created: ${created}`);
          this.notificationChannelCreated = true;
        },
      );
    }

    // Configure the notification handlers
    PushNotification.configure({
      // (optional) Called when Token is generated
      onRegister: function (token: NotificationToken) {
        console.log('TOKEN:', token);
      },

      // (required) Called when a remote or local notification is opened or received
      onNotification: function (notification: any) {
        console.log('NOTIFICATION:', notification);
        // Process the notification
        if (notification.finish) {
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },

      // Should the initial notification be popped automatically
      popInitialNotification: true,

      // Let us control requesting permissions explicitly
      requestPermissions: false,
    });
    
    console.log('Notification system disabled - badge functionality only');
  }

  // Set the application badge count
  setBadgeCount(count: number) {
    try {
      // NOTIFICATION FEATURE DISABLED - Only badge functionality enabled
      
      if (Platform.OS === 'ios') {
        PushNotificationIOS.setApplicationIconBadgeNumber(count);
      } else {
        // Prefer Launcher badge via ShortcutBadger; PushNotification number is not reliable across launchers
        try {
          const ShortcutBadger = require('react-native').NativeModules.ShortcutBadgeModule || null;
          if (ShortcutBadger && typeof ShortcutBadger.setCount === 'function') {
            ShortcutBadger.setCount(count);
          } else {
            // Fallback: setApplicationIconBadgeNumber (works on some launchers)
            PushNotification.setApplicationIconBadgeNumber(count);
          }
        } catch (e) {
          PushNotification.setApplicationIconBadgeNumber(count);
        }
      }
      
      console.log(`Badge count would be set to: ${count} (notifications disabled)`);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  // Schedule a local notification
  scheduleLocalNotification(title: string, message: string, data: NotificationData = {}) {
    // NOTIFICATION FEATURE DISABLED
    
    const notificationId = Math.floor(Math.random() * 1000);
    
    const notification = {
      channelId: 'messages',
      title: title,
      message: message,
      playSound: true,
      number: 0, // This can be used to show a badge count
      autoCancel: true,
      smallIcon: 'ic_notification',
      vibrate: true,
      vibration: 300,
      data: data,
      id: notificationId,
    };
    
    // Add Android-specific properties
    if (Platform.OS === 'android') {
      Object.assign(notification, {
        largeIcon: 'ic_launcher',
        bigText: message,
        subText: title,
      });
    }
    
    PushNotification.localNotification(notification);

    return notificationId;
    
    console.log(`Local notification would be sent: ${title} - ${message}`);
    return Math.floor(Math.random() * 1000);
  }

  // Cancel all notifications
  cancelAllNotifications() {
    // NOTIFICATION FEATURE DISABLED
    
    PushNotification.cancelAllLocalNotifications();
    if (Platform.OS === 'ios') {
      PushNotificationIOS.removeAllDeliveredNotifications();
    }
    
    console.log('All notifications would be canceled (disabled)');
  }

  // Cancel a specific notification by ID
  cancelNotification(notificationId: string | number) {
    // NOTIFICATION FEATURE DISABLED
    
    if (typeof notificationId === 'number') {
      notificationId = notificationId.toString();
    }
    // On Android, we can only cancel all notifications or by tag
    if (Platform.OS === 'ios') {
      // Use type assertion to bypass TypeScript error
      (PushNotification as any).cancelLocalNotifications({ id: notificationId });
      PushNotificationIOS.removeDeliveredNotifications([notificationId]);
    }
    
    console.log(`Notification would be canceled: ${notificationId} (disabled)`);
  }

  // Request notification permissions (iOS)
  async requestPermissions() {
    // NOTIFICATION FEATURE DISABLED
    
    if (Platform.OS === 'ios') {
      const result = await PushNotificationIOS.requestPermissions({
        alert: true,
        badge: true,
        sound: true,
      });
      return result;
    }
    // Android 13+ requires runtime notification permission
    if (Platform.OS === 'android') {
      try {
        const res = await (PushNotification as any).requestPermissions();
        return res || { granted: true };
      } catch (e) {
        return { granted: false };
      }
    }
    
    console.log('Notification permissions would be requested (disabled)');
    return { granted: true };
  }
}

export default NotificationHelper.getInstance();
