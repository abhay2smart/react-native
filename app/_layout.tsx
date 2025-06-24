import { Stack } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldAllowAnnouncements: false,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    console.log('hello')
    registerForPushNotificationsAsync().then(token => {
      console.log('Expo Push Token:', token);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }

        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      
    };
  }, []);

  return <Stack />;
}

async function registerForPushNotificationsAsync() {
  console.log('🔧 Checking device...');
  if (!Device.isDevice) {
    console.log('❌ Must use physical device');
    return;
  }

  console.log('🔧 Getting notification permissions...');
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    console.log('🔧 Requesting notification permission...');
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  console.log('🔧 Final permission status:', finalStatus);
  if (finalStatus !== 'granted') {
    console.log('❌ Notification permission not granted');
    return;
  }

  console.log('🔧 Getting Expo push token...');
  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync();
    console.log('✅ Got token:', token);
    return token;
  } catch (error) {
    console.log('❌ Error getting push token:', error);
  }
}

