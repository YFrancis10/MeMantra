import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type Collection = {
  collection_id: number;
  name: string;
  description?: string | null;
};

type Props = {
  visible: boolean;
  collections: Collection[];
  onClose: () => void;
  onSelectCollection: (collectionId: number) => void | Promise<void>;
  onCreateCollection: (name: string) => void | Promise<void>;
  title?: string;
};

const { height: H } = Dimensions.get('window');
const MAX_H = H * 0.5;
const OFFSCREEN = H;
const THRESHOLD = 140;

export default function CollectionsSheet({
  visible,
  collections,
  onClose,
  onSelectCollection,
  onCreateCollection,
  title = 'Save to collection',
}: Props) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const closeSheet = () => {
    setIsDragging(false);
    Animated.parallel([
      Animated.timing(dragY, { toValue: OFFSCREEN, duration: 220, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(({ finished }) => finished && (dragY.setValue(0), onClose()));
  };

  const snapBack = () => {
    setIsDragging(false);
    Animated.spring(dragY, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 18 }).start();
  };

  useEffect(() => {
    if (visible) {
      dragY.setValue(0);
      Animated.timing(slide, { toValue: 1, duration: 260, useNativeDriver: true }).start();
    } else {
      dragY.setValue(0);
      slide.setValue(0);
      setIsCreating(false);
      setNewName('');
      setIsDragging(false);
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 4 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderGrant: () => setIsDragging(true),
      onPanResponderMove: (_e, g) => dragY.setValue(Math.max(-18, g.dy)),
      onPanResponderRelease: (_e, g) =>
        g.dy > THRESHOLD || g.vy > 1.2 ? closeSheet() : snapBack(),
      onPanResponderTerminate: snapBack,
    }),
  ).current;

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    await onCreateCollection(name);
    setNewName('');
    setIsCreating(false);
    closeSheet();
  };

  const handleSelect = async (id: number) => {
    await onSelectCollection(id);
    closeSheet();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={closeSheet}>
      <Pressable className="absolute inset-0" onPress={closeSheet}>
        <Animated.View
          className="absolute inset-0"
          style={{
            backgroundColor: '#000',
            opacity: slide.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }),
          }}
        />
      </Pressable>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
      >
        <Animated.View
          className="rounded-t-2xl px-4 pt-3 border"
          style={{
            transform: [
              {
                translateY: Animated.add(
                  slide.interpolate({ inputRange: [0, 1], outputRange: [OFFSCREEN, 0] }),
                  dragY.interpolate({
                    inputRange: [-18, 0, 1000],
                    outputRange: [-18, 0, 1000],
                    extrapolate: 'clamp',
                  }),
                ),
              },
            ],
            backgroundColor: '#FFF',
            borderColor: '#E5E7EB',
            paddingBottom: insets.bottom + 14,
            maxHeight: MAX_H,
          }}
        >
          <View {...panResponder.panHandlers}>
            <View className="items-center mb-3">
              <View className="h-1 w-10 rounded-full" style={{ backgroundColor: '#9CA3AF' }} />
            </View>
            <View className="mb-3">
              <Text className="text-[22px] font-bold" style={{ color: '#111827' }}>
                {title}
              </Text>
            </View>
          </View>

          {isCreating ? (
            <View className="flex-row items-center gap-2 mb-3">
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="New collection name"
                placeholderTextColor="#9CA3AF"
                className="flex-1 rounded-xl px-3 py-3 border text-[15px]"
                style={{ color: '#111827', borderColor: '#E5E7EB' }}
                returnKeyType="done"
                onSubmitEditing={handleCreate}
              />
              <Pressable
                onPress={handleCreate}
                className="rounded-xl px-4 py-3 border"
                style={{ borderColor: '#E5E7EB' }}
              >
                <Text className="font-semibold" style={{ color: '#111827' }}>
                  Create
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setIsCreating(true)}
              className="rounded-xl px-4 py-3 mb-3 border"
              style={{ borderColor: '#E5E7EB' }}
            >
              <Text className="font-semibold" style={{ color: '#111827' }}>
                + Create new collection
              </Text>
            </Pressable>
          )}

          <FlatList
            data={collections}
            keyExtractor={(c) => String(c.collection_id)}
            showsVerticalScrollIndicator
            scrollEnabled={!isDragging}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelect(item.collection_id)}
                className="py-4 border-b"
                style={{ borderBottomColor: '#E5E7EB' }}
              >
                <Text className="text-[15px] font-semibold" style={{ color: '#111827' }}>
                  {item.name}
                </Text>
                {!!item.description && (
                  <Text className="text-[12px] mt-1" style={{ color: '#6B7280' }}>
                    {item.description}
                  </Text>
                )}
              </Pressable>
            )}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
