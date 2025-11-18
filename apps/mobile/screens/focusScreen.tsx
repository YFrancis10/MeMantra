import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MantraCarousel from '../components/carousel';
import { Mantra } from '../services/mantra.service';

export default function FocusScreen({ route, navigation }: any) {
  const { mantra, onLike, onSave } = route.params as {
    mantra: Mantra;
    onLike: (id: number) => void;
    onSave: (id: number) => void;
  };

  return (
    <View className="flex-1 bg-[#9AA793]">
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: 'absolute',
          top: 60,
          left: 20,
          zIndex: 20,
          padding: 8,
        }}
      >
        <Ionicons name="chevron-back" size={32} color="white" />
      </TouchableOpacity>

      <MantraCarousel
        item={mantra}
        onLike={onLike}
        onSave={onSave}
        showButtons={false}
        onPress={() => {}}
      />
    </View>
  );
}
