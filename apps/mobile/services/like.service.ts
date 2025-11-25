import { apiClient } from './api.config';

const USE_MOCK_DATA = false;

const mockLikeService = {
  async likeMantra(mantraId: number, _token: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { status: 'success', message: 'Mantra liked successfully' };
  },

  async unlikeMantra(mantraId: number, _token: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { status: 'success', message: 'Mantra unliked successfully' };
  },

  async checkIfLiked(mantraId: number, _token: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return false;
  },

  async getLikedMantras(_token: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      status: 'success',
      data: { mantras: [] }
    };
  },

  async getPopularMantras(limit: number = 10) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      status: 'success',
      data: { mantras: [] }
    };
  },
};

const realLikeService = {
  async likeMantra(mantraId: number, token: string) {
    const response = await apiClient.post(
      `/likes/${mantraId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async unlikeMantra(mantraId: number, token: string) {
    const response = await apiClient.delete(
      `/likes/${mantraId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async checkIfLiked(mantraId: number, token: string): Promise<boolean> {
    const response = await apiClient.get(
      `/likes/${mantraId}/check`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data.hasLiked;
  },

  async getLikedMantras(token: string) {
    const response = await apiClient.get(
      '/likes/mantras',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  async getPopularMantras(limit: number = 10) {
    const response = await apiClient.get(
      `/likes/popular?limit=${limit}`
    );
    return response.data;
  },
};

export const likeService = USE_MOCK_DATA ? mockLikeService : realLikeService;