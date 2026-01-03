import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useLike } from '../../hooks/useLike';

interface LikeButtonProps {
  mantraId: number;
  isLiked: boolean;
  likeCount: number;
  onLikeToggle: (update: { isLiked: boolean; likes: number } | null) => void;
  token: string;
  size?: 'small' | 'medium' | 'large';
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  mantraId,
  isLiked,
  likeCount,
  onLikeToggle,
  token,
  size = 'medium',
}) => {
  const { colors } = useTheme();
  const { toggleLike, loading } = useLike();

  const handlePress = async () => {
    const result = await toggleLike(mantraId, { isLiked, likes: likeCount }, token);
    onLikeToggle(result);
  };

  const sizes = {
    small: { icon: 16, text: 12, container: 40 },
    medium: { icon: 24, text: 14, container: 55 },
    large: { icon: 32, text: 16, container: 70 },
  };

  const currentSize = sizes[size];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={loading === mantraId}
        style={[
          styles.button,
          {
            width: currentSize.container,
            height: currentSize.container,
            backgroundColor: colors.primaryDark,
          }
        ]}
      >
        {loading === mantraId ? (
          <ActivityIndicator size={currentSize.icon} color="#FF0000" />
        ) : (
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={currentSize.icon}
            color={isLiked ? colors.secondary : '#F5E6D3'}
          />
        )}
      </TouchableOpacity>
      <Text style={[
        styles.count,
        { 
          fontSize: currentSize.text, 
          color: isLiked ? colors.secondary : '#F5E6D3' 
        }
      ]}>
        {likeCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  button: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontWeight: '600',
  },
});