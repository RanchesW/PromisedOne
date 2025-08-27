import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Game, 
  Booking, 
  Review, 
  Message,
  Conversation,
  FriendRequest,
  Friendship,
  Notification,
  GameRequest,
  GameSearchFilters,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ApiResponse,
  PaginatedResponse
} from '../types/shared';

// Base API configuration
// For production, use public IP. For local dev, use localhost
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction 
  ? 'http://95.141.138.162:5000/api'
  : process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SERVER_BASE_URL = isProduction 
  ? 'http://95.141.138.162:5000'
  : process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

// Utility function to convert avatar paths to full URLs or return base64 data URLs
export const getAvatarUrl = (avatarPath: string | undefined): string | null => {
  if (!avatarPath) return null;
  
  // If it's a base64 data URL, return as is (new format)
  if (avatarPath.startsWith('data:')) {
    return avatarPath;
  }
  
  // If it's already a full URL, return as is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  
  // Legacy support: If it starts with /uploads, convert to full URL
  if (avatarPath.startsWith('/uploads/')) {
    console.log('Legacy avatar path detected:', avatarPath);
    return `${SERVER_BASE_URL}${avatarPath}`;
  }
  
  // Legacy support: If it's just a filename, assume it's in uploads/avatars
  if (!avatarPath.startsWith('/')) {
    console.log('Legacy avatar filename detected:', avatarPath);
    return `${SERVER_BASE_URL}/uploads/avatars/${avatarPath}`;
  }
  
  console.log('Unknown avatar path format:', avatarPath);
  return `${SERVER_BASE_URL}${avatarPath}`;
};

class APIService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else if (error.response?.status === 403 && error.response?.data?.message?.includes('invalid')) {
          // JWT signature error - dispatch custom event
          window.dispatchEvent(new CustomEvent('jwt-signature-error', { detail: { status: 403 } }));
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic API methods
  private async get<T>(url: string): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.get(url);
  }

  private async post<T>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.post(url, data);
  }

  private async put<T>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.put(url, data);
  }

  private async delete<T>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.delete(url, { data });
  }

  private async patch<T>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.patch(url, data);
  }

  // Authentication endpoints
  auth = {
    login: (credentials: LoginCredentials) => 
      this.post<AuthResponse>('/auth/login', credentials),
    
    register: (userData: RegisterData) => 
      this.post<AuthResponse>('/auth/register', userData),
    
    logout: () => 
      this.post('/auth/logout'),
    
    refreshToken: () => 
      this.post<AuthResponse>('/auth/refresh'),
    
    forgotPassword: (email: string) => 
      this.post('/auth/forgot-password', { email }),
    
    resetPassword: (token: string, password: string) => 
      this.post('/auth/reset-password', { token, password }),
    
    verifyToken: () => 
      this.get<{ user: User }>('/auth/verify'),
    
    updateProfile: (userData: Partial<User>) => 
      this.put<{ user: User }>('/users/profile', userData),
  };

  // Games endpoints
  games = {
    getAll: (filters?: GameSearchFilters) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (typeof value === 'object' && !Array.isArray(value)) {
              // Handle nested objects like priceRange, dateRange
              Object.entries(value).forEach(([subKey, subValue]) => {
                if (subValue !== undefined && subValue !== null) {
                  params.append(`${key}.${subKey}`, subValue.toString());
                }
              });
            } else if (Array.isArray(value)) {
              value.forEach(item => params.append(key, item.toString()));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }
      return this.get<PaginatedResponse<Game>>(`/games?${params.toString()}`);
    },
    
    getById: (id: string) => 
      this.get<Game>(`/games/${id}`),
    
    create: (gameData: Partial<Game>) => 
      this.post<Game>('/games', gameData),
    
    update: (id: string, gameData: Partial<Game>) => 
      this.put<Game>(`/games/${id}`, gameData),
    
    delete: (id: string) => 
      this.delete(`/games/${id}`),
    
    getMyGames: () => 
      this.get<Game[]>('/games/my-games'),
    
    join: (id: string, bookingData: Partial<Booking>) => 
      this.post<Booking>(`/games/${id}/join`, bookingData),
  };

  // Bookings endpoints
  bookings = {
    getAll: () => 
      this.get<Booking[]>('/bookings'),
    
    getById: (id: string) => 
      this.get<Booking>(`/bookings/${id}`),
    
    create: (bookingData: Partial<Booking>) => 
      this.post<Booking>('/bookings', bookingData),
    
    update: (id: string, bookingData: Partial<Booking>) => 
      this.put<Booking>(`/bookings/${id}`, bookingData),
    
    cancel: (id: string) => 
      this.post(`/bookings/${id}/cancel`),
    
    confirm: (id: string, paymentIntentId: string) => 
      this.post<Booking>(`/bookings/${id}/confirm`, { paymentIntentId }),
    
    getMyBookings: () => 
      this.get<Booking[]>('/bookings/user'),
  };

  // Reviews endpoints
  reviews = {
    getAll: () => 
      this.get<Review[]>('/reviews'),
    
    getByGame: (gameId: string) => 
      this.get<Review[]>(`/reviews/game/${gameId}`),
    
    getByGM: (gmId: string) => 
      this.get<Review[]>(`/reviews/gm/${gmId}`),
    
    create: (reviewData: Partial<Review>) => 
      this.post<Review>('/reviews', reviewData),
    
    update: (id: string, reviewData: Partial<Review>) => 
      this.put<Review>(`/reviews/${id}`, reviewData),
    
    delete: (id: string) => 
      this.delete(`/reviews/${id}`),
  };

  // Messages endpoints
  messages = {
    // Conversations
    getConversations: () => 
      this.get<Conversation[]>('/messages/conversations'),
    
    getConversationMessages: (conversationId: string, page = 1) => 
      this.get<Message[]>(`/messages/conversations/${conversationId}/messages?page=${page}`),
    
    sendMessage: (conversationId: string, content: string, messageType = 'text', metadata?: any) => 
      this.post<Message>(`/messages/conversations/${conversationId}/messages`, {
        content,
        messageType,
        metadata
      }),
    
    createConversation: (participantId: string) => 
      this.post<Conversation>('/messages/conversations', { participantId }),
    
    createGroupConversation: (name: string, description: string, memberIds: string[]) => 
      this.post<Conversation>('/messages/conversations/group', { name, description, memberIds }),
    
    // Friends
    searchUsers: (username: string) => 
      this.get<any[]>(`/messages/users/search?username=${encodeURIComponent(username)}`),
    
    sendFriendRequest: (recipientId: string, message?: string) => 
      this.post<FriendRequest>('/messages/friends/request', { recipientId, message }),
    
    sendFriendRequestByUsername: (username: string, message?: string) => 
      this.post<FriendRequest>('/messages/friends/request-by-username', { username, message }),
    
    getFriendRequests: () => 
      this.get<{ received: FriendRequest[]; sent: FriendRequest[] }>('/messages/friends/requests'),
    
    handleFriendRequest: (requestId: string, action: 'accept' | 'decline') => 
      this.patch<FriendRequest>(`/messages/friends/requests/${requestId}`, { action }),
    
    cancelFriendRequest: (requestId: string) => 
      this.delete(`/messages/friends/requests/${requestId}`),
    
    getFriends: () => 
      this.get<any[]>('/messages/friends'),
    
    removeFriend: (friendId: string) => 
      this.delete(`/messages/friends/${friendId}`),
    
    // Notifications
    getNotifications: (page = 1) => 
      this.get<Notification[]>(`/messages/notifications?page=${page}`),
    
    markNotificationAsRead: (notificationId: string) => 
      this.patch(`/messages/notifications/${notificationId}/read`),
    
    markAllNotificationsAsRead: () => 
      this.patch('/messages/notifications/mark-all-read'),
    
    clearAllNotifications: () => 
      this.delete('/messages/notifications/clear-all'),
    
    createSystemNotification: (data: {
      title: string;
      message: string;
      type?: string;
      priority?: string;
      targetUsers?: string[];
      expiresAt?: string;
    }) => 
      this.post('/messages/notifications/system', data),
  };

  // Game requests endpoints
  requests = {
    getAll: () => 
      this.get<GameRequest[]>('/requests'),
    
    getById: (id: string) => 
      this.get<GameRequest>(`/requests/${id}`),
    
    create: (requestData: Partial<GameRequest>) => 
      this.post<GameRequest>('/requests', requestData),
    
    update: (id: string, requestData: Partial<GameRequest>) => 
      this.put<GameRequest>(`/requests/${id}`, requestData),
    
    delete: (id: string) => 
      this.delete(`/requests/${id}`),
    
    respond: (id: string, responseData: any) => 
      this.post(`/requests/${id}/respond`, responseData),
  };

  // Payment endpoints
  payments = {
    createPaymentIntent: (gameId: string, numberOfSeats: number) => 
      this.post('/payments/create-payment-intent', { gameId, numberOfSeats }),
    
    confirmPayment: (paymentIntentId: string, bookingId: string) => 
      this.post('/payments/confirm', { paymentIntentId, bookingId }),
  };

  // Upload endpoints
  uploads = {
    uploadAvatar: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return this.api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },

    removeAvatar: () => {
      return this.api.delete('/upload/avatar');
    },
    
    uploadGameImage: (file: File) => {
      const formData = new FormData();
      formData.append('gameImage', file);
      return this.api.post('/upload/game-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  };

  // Users endpoints
  users = {
    getProfile: () => 
      this.get<User>('/users/profile'),
    
    updateProfile: (userData: Partial<User>) => 
      this.put<User>('/users/profile', userData),
    
    getPublicProfile: (userId: string) => 
      this.get<User>(`/users/${userId}/public`),
    
    getStats: () => 
      this.get('/users/stats'),
    
    submitDMApplication: (applicationData: {
      experience: string;
      preferredSystems: string[];
      availability: string;
      sampleGameDescription: string;
      references?: string;
    }) => 
      this.post<User>('/users/apply-dm', applicationData),
    
    getFeaturedPrompts: () => 
      this.get<Array<{id: string, text: string}>>('/users/featured-prompts'),
    
    updateFeaturedPrompts: (data: { featuredPrompts: Array<{promptId: string, customText: string}> }) => 
      this.put<User>('/users/featured-prompts', data),
  };

  // Favorites endpoints
  favorites = {
    getGameMasters: () => 
      this.get<any[]>('/favorites/game-masters'),
    
    addGameMaster: (gmId: string) => 
      this.post('/favorites/game-masters', { gmId }),
    
    removeGameMaster: (gmId: string) => 
      this.delete(`/favorites/game-masters/${gmId}`),
    
    checkGameMasterStatus: (gmId: string) => 
      this.get<{ isFavorite: boolean }>(`/favorites/game-masters/${gmId}/status`),
    
    toggleGameMaster: (gmId: string) => 
      this.post<{ isFavorite: boolean }>(`/favorites/game-masters/${gmId}/toggle`),
  };

  // Admin endpoints
  admin = {
    getStats: () => 
      this.get('/admin/stats'),
    
    getActivity: (limit = 10, page = 1) => 
      this.get(`/admin/activity?limit=${limit}&page=${page}`),
    
    getUsers: (params: { page?: number; limit?: number; role?: string; search?: string } = {}) => {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.role) queryParams.append('role', params.role);
      if (params.search) queryParams.append('search', params.search);
      return this.get(`/admin/users?${queryParams.toString()}`);
    },
    
    updateUserRole: (userId: string, role: string) => 
      this.patch(`/admin/users/${userId}/role`, { role }),
    
    getApplications: () => 
      this.get('/admin/applications'),
    
    approveApplication: (applicationId: string) => 
      this.post(`/admin/applications/${applicationId}/approve`),
    
    rejectApplication: (applicationId: string) => 
      this.post(`/admin/applications/${applicationId}/reject`),
    
    getReports: () => 
      this.get('/admin/reports'),
    
    handleReport: (reportId: string, action: string) => 
      this.post(`/admin/reports/${reportId}/handle`, { action }),
    
    // Game management
    getGames: (params: { page?: number; limit?: number; search?: string; status?: string } = {}) => {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      return this.get(`/admin/games?${queryParams.toString()}`);
    },
    
    deleteGame: (gameId: string, reason: string, adminNotes?: string) => 
      this.delete(`/admin/games/${gameId}`, { reason, adminNotes }),
  };
}

// Create and export API instance
const apiService = new APIService();

// Export individual API groups for convenience
export const authAPI = apiService.auth;
export const gamesAPI = apiService.games;
export const bookingsAPI = apiService.bookings;
export const reviewsAPI = apiService.reviews;
export const messagesAPI = apiService.messages;
export const requestsAPI = apiService.requests;
export const paymentsAPI = apiService.payments;
export const uploadsAPI = apiService.uploads;
export const usersAPI = apiService.users;
export const favoritesAPI = apiService.favorites;
export const adminAPI = apiService.admin;

export default apiService;
