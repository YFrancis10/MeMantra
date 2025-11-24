import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import { ThemeProvider } from '../context/ThemeContext';
import { storage } from '../utils/storage';
import { notificationService } from '../services/notification.service';

// Import your screens
import Login from '../screens/login';
import Signup from '../screens/SignUp';
import BottomTabNavigator from '../components/bottomTabNavigator';

const Stack = createStackNavigator();

export default function MainNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await storage.getToken();
        setIsLoggedIn(!!token);
      } catch (err) {
        console.error('Failed to read token from storage', err);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  // Set up push notifications when user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      const setupNotifications = async () => {
        try {
          const pushToken = await notificationService.setupNotifications();
          if (pushToken) {
            console.log('Push notifications set up successfully');
          }
        } catch (error) {
          console.error('Failed to set up push notifications:', error);
        }
      };

      setupNotifications();
    }
  }, [isLoggedIn]);

  // Set up notification event listeners
  useEffect(() => {
    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received in foreground:', notification);
      // You can display a custom in-app notification UI here if needed
    });

    // This listener is fired whenever a user taps on or interacts with a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);

      // Handle notification tap - extract data for deep linking
      const data = response.notification.request.content.data;

      if (data.type === 'reminder' && data.reminderId) {
        // TODO: Navigate to reminder detail or mantra detail
        console.log('Navigate to reminder:', data.reminderId);
      }
    });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  if (isLoggedIn === null) {
    return (
      <ThemeProvider>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ffffff',
          }}
        >
          <ActivityIndicator size="large" color="#6D7E68" testID="loading-indicator" />
        </View>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? 'MainApp' : 'Login'}
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Always register MainApp so Login can navigate to it */}
        <Stack.Screen name="MainApp" component={BottomTabNavigator} />
        <Stack.Screen name="Login" component={Login} options={{ headerTitle: 'Login' }} />
        <Stack.Screen name="Signup" component={Signup} options={{ headerTitle: 'Signup' }} />
      </Stack.Navigator>
    </ThemeProvider>
  );
}
