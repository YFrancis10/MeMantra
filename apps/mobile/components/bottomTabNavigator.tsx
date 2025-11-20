import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/homeScreen';
import AdminScreen from '../screens/adminScreen';
import { storage } from '../utils/storage';
import { isAdminEmail } from '../utils/admin';
import AppText from './UI/textWrapper';

const Tab = createBottomTabNavigator();

// icons def
const LibraryIcon = ({ color }: { color: string }) => (
  <Ionicons name="bookmark-outline" size={28} color={color} />
);

const HomeIcon = ({ color }: { color: string }) => (
  <Ionicons name="home-outline" size={28} color={color} />
);

const LikedIcon = ({ color }: { color: string }) => (
  <Ionicons name="heart-outline" size={28} color={color} />
);

const AdminIcon = ({ color }: { color: string }) => (
  <Ionicons name="construct-outline" size={28} color={color} />
);

// options def
const libraryOptions = {
  tabBarIcon: ({ color }: { color: string }) => <LibraryIcon color={color} />,
};

const homeOptions = {
  tabBarIcon: ({ color }: { color: string }) => <HomeIcon color={color} />,
};

const likedOptions = {
  tabBarIcon: ({ color }: { color: string }) => <LikedIcon color={color} />,
};

const adminOptions = {
  tabBarIcon: ({ color }: { color: string }) => <AdminIcon color={color} />,
};

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
          ...libraryOptions,
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} size={30} color={'white'} />
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          ...homeOptions,
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={30} color={'white'} />
          ),
        }}
      />
      <Tab.Screen name="Liked" component={LikedScreen} options={likedOptions} />
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{
            ...adminOptions,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? 'settings' : 'settings-outline'}
                size={30}
                color={'white'}
              />
            ),
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

function LikedScreen() {
  return (
    <View style={styles.screenContainer}>
      <AppText>Liked Screen</AppText>
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
