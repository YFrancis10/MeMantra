import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MantraCarousel from '../components/carousel';
import { mantraService, Mantra } from '../services/mantra.service';
import { storage } from '../utils/storage';
import SearchBar from '../components/UI/searchBar';
import IconButton from '../components/UI/iconButton';
import { useTheme } from '../context/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [feedData, setFeedData] = useState<Mantra[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  useEffect(() => {
    loadMantras();
  }, []);

  const loadMantras = async () => {
    try {
      const token = (await storage.getToken()) || 'mock-token';
      const response = await mantraService.getFeedMantras(token);

      if (response.status === 'success') {
        setFeedData(response.data);
      }
    } catch (err) {
      console.error('Error fetching mantras:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (mantraId: number) => {
    try {
      const token = (await storage.getToken()) || 'mock-token';
      const isCurrentlyLiked = feedData.find((m) => m.mantra_id === mantraId)?.isLiked || false;

      setFeedData((prev) =>
        prev.map((m) => (m.mantra_id === mantraId ? { ...m, isLiked: !m.isLiked } : m)),
      );

      if (isCurrentlyLiked) {
        await mantraService.unlikeMantra(mantraId, token);
      } else {
        await mantraService.likeMantra(mantraId, token);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      setFeedData((prev) =>
        prev.map((m) => (m.mantra_id === mantraId ? { ...m, isLiked: !m.isLiked } : m)),
      );
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  const handleSave = async (mantraId: number) => {
    try {
      const token = (await storage.getToken()) || 'mock-token';
      const isCurrentlySaved = feedData.find((m) => m.mantra_id === mantraId)?.isSaved || false;

      setFeedData((prev) =>
        prev.map((m) => (m.mantra_id === mantraId ? { ...m, isSaved: !m.isSaved } : m)),
      );

      if (isCurrentlySaved) {
        await mantraService.unsaveMantra(mantraId, token);
      } else {
        await mantraService.saveMantra(mantraId, token);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      setFeedData((prev) =>
        prev.map((m) => (m.mantra_id === mantraId ? { ...m, isSaved: !m.isSaved } : m)),
      );
      Alert.alert('Error', 'Failed to update save status');
    }
  };

  const handleLogout = async () => {
    try {
      if (typeof storage.removeToken === 'function') {
        await storage.removeToken();
      } else if (typeof storage.saveToken === 'function') {
        await storage.saveToken('');
      }

      if (typeof storage.removeUserData === 'function') {
        await storage.removeUserData();
      } else if (typeof storage.saveUserData === 'function') {
        await storage.saveUserData(null);
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err) {
      console.error('Logout error:', err);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const handleSearch = (query: string) => console.log('Searching for:', query);

  const handleUserPress = () => {
    Alert.alert(
      'Account',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => {
            void handleLogout();
          },
        },
      ],
      { cancelable: true },
    );
  };
  let content;

  if (loading) {
    content = (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: colors.primary }}
      >
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text className="mt-4 text-base" style={{ color: colors.text }}>
          Loading mantras...
        </Text>
      </View>
    );
  } else if (feedData.length === 0) {
    content = (
      <View
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: colors.primary }}
      >
        <Ionicons name="book-outline" size={64} color={colors.secondary} />
        <Text className="mt-4 text-lg font-semibold text-center" style={{ color: colors.text }}>
          No mantras available
        </Text>
        <TouchableOpacity
          className="rounded-full px-6 py-3 mt-6"
          onPress={loadMantras}
          accessibilityRole="button"
          style={{ backgroundColor: colors.secondary }}
        >
          <Text className="font-semibold text-base" style={{ color: colors.primary }}>
            Refresh
          </Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    content = (
      <FlatList
        data={feedData}
        renderItem={({ item }) => (
          <MantraCarousel
            item={item}
            onLike={handleLike}
            onSave={handleSave}
            onPress={() =>
              navigation.navigate('Focus', {
                mantra: item,
                onLike: handleLike,
                onSave: handleSave,
              })
            }
          />
        )}
        keyExtractor={(item) => item.mantra_id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={SCREEN_HEIGHT}
      />
    );
  }
  return (
    <View className="flex-1" style={{ backgroundColor: colors.primary }}>
      <View className="absolute top-5 left-0 right-0 z-10 flex-row justify-between items-center px-6 pt-14 pb-4">
        <SearchBar onSearch={handleSearch} placeholder="Search mantras..." />
        <IconButton type="profile" onPress={handleUserPress} testID="profile-btn" />
      </View>

      {/* Dynamic content */}
      {content}
    </View>
  );
}
