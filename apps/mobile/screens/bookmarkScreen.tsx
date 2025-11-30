import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AppText from '../components/UI/textWrapper';
import MantraCarousel from '../components/carousel';
import { storage } from '../utils/storage';
import { mantraService, Mantra } from '../services/mantra.service';

export default function BookmarkScreen({ navigation }: any) {
  const [savedMantras, setSavedMantras] = useState<Mantra[]>([]);
  const { colors } = useTheme();

  useEffect(() => {
    loadSavedMantras();
  }, []);

  const loadSavedMantras = async () => {
    try {
      const token = await storage.getToken();
      const res = await mantraService.getSavedMantras(token || 'mock-token');

      if (res.status === 'success') {
        setSavedMantras(res.data);
      }
    } catch (err) {
      console.log('Error fetching saved mantras:', err);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.primary }}>
      {savedMantras.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <AppText style={{ color: colors.text }}>You have no saved mantras yet.</AppText>
        </View>
      ) : (
        <FlatList
          data={savedMantras}
          keyExtractor={(item) => item.mantra_id.toString()}
          renderItem={({ item }) => (
            <MantraCarousel
              item={item}
              onPress={() =>
                navigation.navigate('Focus', {
                  mantra: item,
                })
              }
            />
          )}
        />
      )}
    </View>
  );
}
