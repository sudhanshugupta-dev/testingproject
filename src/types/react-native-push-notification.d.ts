declare module 'react-native-push-notification' {
  import { EmitterSubscription } from 'react-native';

  export type Importance = 'default' | 'high' | 'low' | 'max' | 'min' | 'none' | 'unspecified';

  export interface ChannelObject {
    channelId: string;
    channelName: string;
    channelDescription?: string;
    playSound?: boolean;
    soundName?: string;
    importance?: Importance;
    vibrate?: boolean | number[];
  }

  export interface NotificationObject {
    channelId: string;
    title: string;
    message: string;
    playSound?: boolean;
    number?: number;
    autoCancel?: boolean;
    smallIcon?: string;
  }

  export interface PushNotification {
    configure: (options: any) => void;
    createChannel: (
      channel: ChannelObject,
      callback: (created: boolean) => void
    ) => void;
    setApplicationIconBadgeNumber: (number: number) => void;
    localNotification: (details: NotificationObject) => void;
    cancelAllLocalNotifications: () => void;
    requestPermissions: () => Promise<{
      alert?: boolean;
      badge?: boolean;
      sound?: boolean;
      lockScreen?: boolean;
      notificationCenter?: boolean;
    }>;
    addEventListener: (
      type: string,
      handler: (notification: any) => void
    ) => EmitterSubscription;
    removeEventListener: (type: string) => void;
  }

  const PushNotification: PushNotification;
  export default PushNotification;
}
