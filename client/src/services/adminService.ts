import apiService from './api';

interface AdminStats {
  totalUsers: number;
  totalPlayers: number;
  totalGMs: number;
  pendingGMApplications: number;
  activeGames: number;
  monthlyRevenue: number;
}

interface Activity {
  id: string;
  type: string;
  message: string;
  details: any;
  timestamp: string;
  icon: string;
  color: string;
}

interface ActivityResponse {
  activities: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const adminService = {
  // Get admin dashboard statistics
  getStats: async (): Promise<AdminStats> => {
    const response = await apiService.admin.getStats();
    return response.data.data as AdminStats;
  },

  // Get recent activity
  getActivity: async (limit = 10, page = 1): Promise<ActivityResponse> => {
    const response = await apiService.admin.getActivity(limit, page);
    return response.data.data as ActivityResponse;
  },

  // Get all users with pagination and filtering
  getUsers: async (params: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  } = {}): Promise<UsersResponse> => {
    const response = await apiService.admin.getUsers(params);
    return response.data.data as UsersResponse;
  },

  // Update user role
  updateUserRole: async (userId: string, role: string): Promise<User> => {
    const response = await apiService.admin.updateUserRole(userId, role);
    return response.data.data as User;
  },
};
