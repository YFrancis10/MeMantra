import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MantraCarousel from '../components/carousel';
import { mantraService, Mantra } from '../services/mantra.service';
import { storage } from '../utils/storage';
import SearchBar from '../components/UI/searchBar';
import IconButton from '../components/UI/iconButton';
import { logoutUser } from '../utils/auth';
import AppText from '../components/UI/textWrapper';
import { useTheme } from '../context/ThemeContext';
import { useSavedMantras } from '../context/SavedContext';
import SavedPopupBar from '../components/UI/savedPopupBar';
import CollectionsSheet, { Collection } from '../components/collectionsSheet';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [feedData, setFeedData] = useState<Mantra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSavedPopup, setShowSavedPopup] = useState(false);
  const [showCollectionsSheet, setShowCollectionsSheet] = useState(false);

  // TEMP: replace with backend fetch later
  const [collections, setCollections] = useState<Collection[]>([
    { collection_id: 1, name: 'Saved', description: 'Default collection' },
  ]);

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

  const { setSavedMantras } = useSavedMantras();

  const handleSave = async (mantraId: number) => {
    try {
      const token = (await storage.getToken()) || 'mock-token';
      const isCurrentlySaved = feedData.find((m) => m.mantra_id === mantraId)?.isSaved || false;

      setFeedData((prev) =>
        prev.map((m) => (m.mantra_id === mantraId ? { ...m, isSaved: !m.isSaved } : m)),
      );

      if (isCurrentlySaved) {
        await mantraService.unsaveMantra(mantraId, token);
        setSavedMantras((prev) => prev.filter((m) => m.mantra_id !== mantraId));
        // no popup on unsave
      } else {
        await mantraService.saveMantra(mantraId, token);
        const savedMantra = feedData.find((m) => m.mantra_id === mantraId);
        if (savedMantra) setSavedMantras((prev) => [...prev, savedMantra]);

        setShowSavedPopup(true);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      setFeedData((prev) =>
        prev.map((m) => (m.mantra_id === mantraId ? { ...m, isSaved: !m.isSaved } : m)),
      );
      Alert.alert('Error', 'Failed to update save status');
    }
  };

  const handleLogout = () => logoutUser(navigation);

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
        <AppText className="mt-4 text-base" style={{ color: colors.text }}>
          Loading mantras...
        </AppText>
      </View>
    );
  } else if (feedData.length === 0) {
    content = (
      <View
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: colors.primary }}
      >
        <Ionicons name="book-outline" size={64} color={colors.secondary} />
        <AppText className="mt-4 text-lg font-semibold text-center" style={{ color: colors.text }}>
          No mantras available
        </AppText>
        <TouchableOpacity
          className="rounded-full px-6 py-3 mt-6"
          onPress={loadMantras}
          accessibilityRole="button"
          style={{ backgroundColor: colors.secondary }}
        >
          <AppText className="font-semibold text-base" style={{ color: colors.primary }}>
            Refresh
          </AppText>
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

      {/* Main feed */}
      {content}

      <SavedPopupBar
        visible={showSavedPopup}
        onHide={() => setShowSavedPopup(false)}
        onPressCollections={() => {
          setShowSavedPopup(false);
          setShowCollectionsSheet(true);
        }}
      />
      <CollectionsSheet
        visible={showCollectionsSheet}
        collections={collections}
        onClose={() => setShowCollectionsSheet(false)}
        onSelectCollection={async (collectionId) => {
          //next steps bellow... when ready to be connected to backend
          console.log('Selected collection:', collectionId);
        }}
        onCreateCollection={async (name) => {
          console.log('Create collection:', name);

          // TEMP local add
          setCollections((prev) => [{ collection_id: Date.now(), name }, ...prev]);
        }}
      />
    </View>
  );
}
