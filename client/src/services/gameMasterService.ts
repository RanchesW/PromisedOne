import { PaginatedResponse, ApiResponse } from '@kazrpg/shared';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export interface GameMaster {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  pronouns?: string[];
  stats?: {
    averageRating?: number;
    totalReviews?: number;
    gamesHosted?: number;
    yearsOnPlatform?: number;
  };
  pricing?: {
    sessionPrice: number;
    currency: string;
  };
  specialties?: string[];
  identityTags?: string[];
  createdAt?: string;
  timezone?: string;
}

export interface GameMasterFilters {
  search?: string;
  priceRange?: string;
  timezone?: string;
  language?: string;
  gameStyles?: string;
  themes?: string;
  system?: string;
  page?: number;
  limit?: number;
}

class GameMasterService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async getGameMasters(filters: GameMasterFilters = {}): Promise<PaginatedResponse<GameMaster>> {
    const params = new URLSearchParams();
    
    // Convert filters to query parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/users/game-masters?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch game masters' }));
      throw new Error(errorData.message || 'Failed to fetch game masters');
    }

    const data: ApiResponse<PaginatedResponse<GameMaster>> = await response.json();
    if (!data.data) {
      throw new Error('No data received from server');
    }
    return data.data;
  }

  async getGameMaster(id: string): Promise<GameMaster> {
    const response = await fetch(`${API_BASE_URL}/users/${id}/public`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Game master not found' }));
      throw new Error(errorData.message || 'Game master not found');
    }

    const data: ApiResponse<GameMaster> = await response.json();
    if (!data.data) {
      throw new Error('No data received from server');
    }
    return data.data;
  }
}

export const gameMasterService = new GameMasterService();
export default gameMasterService;