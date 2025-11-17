import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mantraService, Mantra } from '../services/mantra.service';
import { storage } from '../utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BookmarksScreen() {
  const [savedMantras, setSavedMantras] = useState<Mantra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedMantras();
  }, []);

  const loadSavedMantras = async () => {
    try {
      const token = await storage.getToken();
      if (!token) {
        Alert.alert('Error', 'You must be logged in to save mantras.');
        return;
      }
      const response = await mantraService.getFeedMantras(token); // reuse feed API

      if (response.status === 'success') {
        const bookmarked = response.data.filter((m: Mantra) => m.isSaved);
        setSavedMantras(bookmarked);
      }
    } catch (err) {
      console.error('Error fetching saved mantras:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToggle = async (mantraId: number) => {
    try {
      const token = await storage.getToken();
      if (!token) {
        Alert.alert('Error', 'You must be logged in to save mantras.');
        return;
      }
      const isCurrentlySaved = savedMantras.find((m) => m.mantra_id === mantraId)?.isSaved || false;

      // Optimistically update UI
      setSavedMantras((prev) =>
        prev.map((m) => (m.mantra_id === mantraId ? { ...m, isSaved: !m.isSaved } : m)),
      );

      if (isCurrentlySaved) {
        await mantraService.unsaveMantra(mantraId, token);
      } else {
        await mantraService.saveMantra(mantraId, token);
      }

      // If we just unsaved it, remove from grid
      if (isCurrentlySaved) {
        setSavedMantras((prev) => prev.filter((m) => m.mantra_id !== mantraId));
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      Alert.alert('Error', 'Failed to update bookmark');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#9AA793]">
        <ActivityIndicator size="large" color="#E6D29C" />
        <Text className="text-white mt-4 text-base">Loading bookmarks...</Text>
      </View>
    );
  }

  if (savedMantras.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-[#9AA793] px-6">
        <Ionicons name="bookmark-outline" size={64} color="#E6D29C" />
        <Text className="text-white mt-4 text-lg font-semibold text-center">
          No bookmarked mantras
        </Text>
        <TouchableOpacity
          className="bg-[#E6D29C] rounded-full px-6 py-3 mt-6"
          onPress={loadSavedMantras}
        >
          <Text className="text-[#6D7E68] font-semibold text-base">Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#9AA793] px-2 pt-4">
      <FlatList
        data={savedMantras}
        keyExtractor={(item) => item.mantra_id.toString()}
        numColumns={2} // grid layout
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flex: 1,
              margin: 8,
              backgroundColor: '#E6D29C',
              borderRadius: 12,
              height: SCREEN_WIDTH / 2 - 24, // roughly square
              justifyContent: 'center',
              alignItems: 'center',
              padding: 12,
            }}
          >
            <Text
              style={{
                color: '#6D7E68',
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              {item.title}
            </Text>

            <TouchableOpacity
              style={{ position: 'absolute', top: 8, right: 8 }}
              onPress={() => handleSaveToggle(item.mantra_id)}
            >
              <Ionicons
                name={item.isSaved ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color="#6D7E68"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
