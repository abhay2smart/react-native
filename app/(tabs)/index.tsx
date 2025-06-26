import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export default function HomeScreen() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📲 Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('📨 Notification response received:', response);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const sendPushNotification = async () => {
    if (!expoPushToken) {
      Alert.alert('Error', 'Push token not available');
      return;
    }

    const message = {
      to: expoPushToken,
      sound: 'default',
      title: title || 'Default Title',
      body: body || 'Default Body',
      data: { customData: 'self-sent' },
    };

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const data = await response.json();
      console.log('✅ Notification sent:', data);
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>📬 Push Notification Test</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Body"
        value={body}
        onChangeText={setBody}
      />

      <Button title="Send Push Notification" onPress={sendPushNotification} />

      {expoPushToken && (
        <Text style={styles.token} selectable>
          Expo Push Token: {expoPushToken}
        </Text>
      )}
    </ScrollView>
  );
}

// Register for Push Notifications
async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    Alert.alert('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (finalStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Permission not granted for push notifications!');
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: '90315087-c360-4629-8e6f-e17d39500eaf', // Your project ID
  });

  return tokenData.data;
}

// Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
  },
  token: {
    marginTop: 20,
    fontSize: 12,
    color: '#444',
  },
});
