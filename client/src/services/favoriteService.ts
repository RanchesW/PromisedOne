import apiService from './api';

export interface FavoriteGameMaster {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  stats?: {
    averageRating: number;
    totalReviews: number;
    gamesHosted: number;
  };
  createdAt: string;
}

class FavoriteService {
  async getFavoriteGameMasters(): Promise<FavoriteGameMaster[]> {
    try {
      const response = await apiService.favorites.getGameMasters();
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching favorite game masters:', error);
      throw error;
    }
  }

  async addFavoriteGameMaster(gmId: string): Promise<void> {
    try {
      await apiService.favorites.addGameMaster(gmId);
    } catch (error) {
      console.error('Error adding favorite game master:', error);
      throw error;
    }
  }

  async removeFavoriteGameMaster(gmId: string): Promise<void> {
    try {
      await apiService.favorites.removeGameMaster(gmId);
    } catch (error) {
      console.error('Error removing favorite game master:', error);
      throw error;
    }
  }

  async isFavoriteGameMaster(gmId: string): Promise<boolean> {
    try {
      const response = await apiService.favorites.checkGameMasterStatus(gmId);
      return response.data.data?.isFavorite || false;
    } catch (error) {
      console.error('Error checking favorite game master status:', error);
      return false;
    }
  }

  async toggleFavoriteGameMaster(gmId: string): Promise<boolean> {
    try {
      const response = await apiService.favorites.toggleGameMaster(gmId);
      return response.data.data?.isFavorite || false;
    } catch (error) {
      console.error('Error toggling favorite game master:', error);
      throw error;
    }
  }
}

export const favoriteService = new FavoriteService();
export default favoriteService;