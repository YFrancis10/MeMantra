import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/homeScreen';
import AdminScreen from '../screens/adminScreen';
import { storage } from '../utils/storage';
import { isAdminEmail } from '../utils/admin';

const Tab = createBottomTabNavigator();

// icons def
const LibraryIcon = ({ color }: { color: string }) => (
  <Ionicons name="bookmark-outline" size={28} color={color} />
);

const HomeIcon = ({ color }: { color: string }) => (
  <Ionicons name="home-outline" size={28} color={color} />
);

const ProfileIcon = ({ color }: { color: string }) => (
  <Ionicons name="person-circle-outline" size={28} color={color} />
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

const profileOptions = {
  tabBarIcon: ({ color }: { color: string }) => <ProfileIcon color={color} />,
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
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.7)',
        headerShown: false,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen name="Library" component={LibraryScreen} options={libraryOptions} />
      <Tab.Screen name="Home" component={HomeScreen} options={homeOptions} />
      <Tab.Screen name="profile" component={ProfileScreen} options={profileOptions} />
      {isAdmin && <Tab.Screen name="Admin" component={AdminScreen} options={adminOptions} />}
    </Tab.Navigator>
  );
}

// Placeholder screens
function LibraryScreen() {
  return (
    <View style={styles.screenContainer}>
      <Text>Library Screen</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.screenContainer}>
      <Text>Profile Screen</Text>
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
    paddingTop: 8,
  },
  tabLabel: {
    fontFamily: 'Red_Hat_Text-SemiBold',
    fontWeight: '600',
    fontSize: 15,
    marginTop: 4,
  },
});
