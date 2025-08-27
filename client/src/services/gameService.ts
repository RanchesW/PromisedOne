import { Game, GameSearchFilters, ApiResponse, PaginatedResponse } from '../types/shared';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

class GameService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async getGames(filters: GameSearchFilters = {}): Promise<PaginatedResponse<Game>> {
    const params = new URLSearchParams();
    
    // Convert filters to query parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (key === 'priceRange' && typeof value === 'object') {
          if (value.min !== undefined) params.append('priceMin', value.min.toString());
          if (value.max !== undefined) params.append('priceMax', value.max.toString());
        } else if (key === 'dateRange' && typeof value === 'object') {
          if (value.start) params.append('startDate', value.start.toISOString());
          if (value.end) params.append('endDate', value.end.toISOString());
        } else if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await fetch(`${API_BASE_URL}/games?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch games' }));
      throw new Error(errorData.message || 'Failed to fetch games');
    }

    const data = await response.json();
    return data.data;
  }

  async getGame(id: string): Promise<Game> {
    const response = await fetch(`${API_BASE_URL}/games/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Game not found' }));
      throw new Error(errorData.message || 'Game not found');
    }

    const data = await response.json();
    return data.data;
  }

  async createGame(gameData: Partial<Game>): Promise<Game> {
    console.log('Creating game with data:', JSON.stringify(gameData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/games`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(gameData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create game' }));
      console.error('Game creation error response:', errorData);
      
      if (errorData.errors && Array.isArray(errorData.errors)) {
        throw new Error(`Validation failed: ${errorData.errors.join(', ')}`);
      }
      
      throw new Error(errorData.message || 'Failed to create game');
    }

    const data = await response.json();
    return data.data;
  }

  async updateGame(id: string, gameData: Partial<Game>): Promise<Game> {
    const response = await fetch(`${API_BASE_URL}/games/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(gameData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to update game' }));
      throw new Error(errorData.message || 'Failed to update game');
    }

    const data = await response.json();
    return data.data;
  }

  async deleteGame(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/games/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete game' }));
      throw new Error(errorData.message || 'Failed to delete game');
    }
  }

  async getGamesByGM(gmId: string, page = 1, limit = 12): Promise<PaginatedResponse<Game>> {
    const response = await fetch(`${API_BASE_URL}/games/gm/${gmId}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch GM games' }));
      throw new Error(errorData.message || 'Failed to fetch GM games');
    }

    const data = await response.json();
    return data.data;
  }

  async uploadGameImages(files: { banner?: File; icon?: File }): Promise<{ bannerImage?: string; iconImage?: string }> {
    const formData = new FormData();
    
    if (files.banner) {
      formData.append('banner', files.banner);
    }
    
    if (files.icon) {
      formData.append('icon', files.icon);
    }

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/upload/game-images`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to upload images' }));
      throw new Error(errorData.message || 'Failed to upload images');
    }

    const data = await response.json();
    return data.data;
  }

  async getMyGames(): Promise<Game[]> {
    const response = await fetch(`${API_BASE_URL}/games/my-games`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch my games' }));
      throw new Error(errorData.message || 'Failed to fetch my games');
    }

    const data = await response.json();
    return data.data;
  }
}

export const gameService = new GameService();
export default gameService;
