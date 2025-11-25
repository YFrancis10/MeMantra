import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/homeScreen';
import AdminScreen from '../screens/adminScreen';
import { storage } from '../utils/storage';
import { isAdminEmail } from '../utils/admin';
import ProfileScreen from '../screens/ProfileScreen';
import AppText from './UI/textWrapper';

const Tab = createBottomTabNavigator();

// Tab bar icon components defined outside to avoid recreation on each render
const LibraryTabIcon = ({ focused }: { focused: boolean }) => (
  <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} size={30} color={'white'} />
);

const HomeTabIcon = ({ focused }: { focused: boolean }) => (
  <Ionicons name={focused ? 'home' : 'home-outline'} size={30} color={'white'} />
);

const ProfileTabIcon = ({ focused }: { focused: boolean }) => (
  <Ionicons name={focused ? 'person' : 'person-outline'} size={30} color={'white'} />
);

const AdminTabIcon = ({ focused }: { focused: boolean }) => (
  <Ionicons name={focused ? 'settings' : 'settings-outline'} size={30} color={'white'} />
);

export default function BottomTabNavigator() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const determineAdminStatus = async () => {
      try {
        const userData = await storage.getUserData();
        if (isMounted) {
          setIsAdmin(isAdminEmail(userData?.email));
        }
      } catch (error) {
        console.error('Failed to determine admin status', error);
        if (isMounted) {
          setIsAdmin(false);
        }
      }
    };

    determineAdminStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarIcon: LibraryTabIcon,
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: HomeTabIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ProfileTabIcon,
        }}
      />
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{
            tabBarIcon: AdminTabIcon,
          }}
        />
      )}
    </Tab.Navigator>
  );
}

// Placeholder screens
function LibraryScreen() {
  return (
    <View style={styles.screenContainer}>
      <AppText>Library Screen</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A8B3A2',
  },
  tabBar: {
    backgroundColor: '#6d7e68',
    borderTopWidth: 0.5,
    borderTopColor: 'white',
    height: 105,
    paddingBottom: 12,
    paddingTop: 15,
  },
});
