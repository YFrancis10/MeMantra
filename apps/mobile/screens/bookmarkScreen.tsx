import React from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AppText from '../components/UI/textWrapper';
import { Mantra } from '../services/mantra.service';
import { useSavedMantras } from '../context/SavedContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_MARGIN = 12;
const NUM_COLUMNS = 2;
const ITEM_SIZE = (SCREEN_WIDTH - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

export default function BookmarkScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { savedMantras } = useSavedMantras();

  const renderItem = ({ item }: { item: Mantra }) => (
    <TouchableOpacity
      style={[styles.itemContainer, { backgroundColor: colors.primaryDark }]}
      onPress={() =>
        navigation.navigate('Focus', {
          mantra: item,
        })
      }
    >
      <AppText style={[styles.itemText, { color: colors.text }]} numberOfLines={3}>
        {item.title}
      </AppText>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.primary, paddingTop: 40 }]}>
      <View
        className="pt-12 pb-4 px-4"
        style={{ backgroundColor: colors.primary, paddingLeft: 30 }}
      >
        <AppText style={{ color: colors.text, fontSize: 30, fontWeight: 'bold' }}>Library</AppText>
      </View>

      {savedMantras.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AppText style={{ color: colors.text }}>You have no saved mantras yet.</AppText>
        </View>
      ) : (
        <FlatList
          data={savedMantras}
          keyExtractor={(item) => item.mantra_id.toString()}
          renderItem={renderItem}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: ITEM_MARGIN }}
          contentContainerStyle={{ padding: ITEM_MARGIN }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  itemContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
