import { useState, useCallback } from 'react';
import { likeService } from '../services/like.service';
import { Alert } from 'react-native';

export const useLike = () => {
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleLike = useCallback(async (mantraId: number, currentState: { isLiked: boolean; likes: number }, token: string) => {
    if (loading === mantraId) return null;

    setLoading(mantraId);
    setError(null);

    try {
      if (!token) {
        Alert.alert('Login Required', 'Please login to like mantras');
        return null;
      }

      const newIsLiked = !currentState.isLiked;
      const newLikes = currentState.likes + (newIsLiked ? 1 : -1);

      if (newIsLiked) {
        await likeService.likeMantra(mantraId, token);
      } else {
        await likeService.unlikeMantra(mantraId, token);
      }

      setLoading(null);
      return {
        isLiked: newIsLiked,
        likes: newLikes,
      };
    } catch (err) {
      setLoading(null);
      setError('Failed to update like status');
      Alert.alert('Error', 'Failed to update like status');
      return null;
    }
  }, [loading]);

  const checkLikeStatus = useCallback(async (mantraId: number, token: string) => {
    try {
      if (!token) return false;
      return await likeService.checkIfLiked(mantraId, token);
    } catch (err) {
      console.error('Error checking like status:', err);
      return false;
    }
  }, []);

  return {
    toggleLike,
    checkLikeStatus,
    loading,
    error,
  };
};