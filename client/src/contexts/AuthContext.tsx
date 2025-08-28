import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, ExperienceLevel, GameSystem } from '../types/shared';
import socketService from '../services/socketService';
import { useNotification } from './NotificationContext';

// Re-export types for backward compatibility
export type { User };
export { UserRole, ExperienceLevel, GameSystem };

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<RegisterResponse>;
  verifyEmail: (verificationToken: string, verificationCode: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  verificationToken: string;
  emailSent: boolean;
  requiresVerification: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  timezone: string;
  experienceLevel: ExperienceLevel;
  preferredSystems: GameSystem[];
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotification();

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
        // Connect Socket.IO for existing logged-in users
        socketService.connect(storedToken);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Periodic role check to sync with server changes
  useEffect(() => {
    if (!token || !user) return;

    const checkUserRole = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://promisedone.onrender.com/api'}/users/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const serverUser = data.data || data;
          
          // Check if role has changed
          if (serverUser.role !== user.role) {
            console.log('Role change detected:', user.role, '->', serverUser.role);
            setUser(serverUser);
            localStorage.setItem('user', JSON.stringify(serverUser));
            
            // Force page reload to update UI components
            window.location.reload();
          }
        }
      } catch (error) {
        console.error('Role check error:', error);
      }
    };

    // Check immediately, then every 5 seconds
    checkUserRole();
    const interval = setInterval(checkUserRole, 5000);

    return () => clearInterval(interval);
  }, [token, user?.role]);

  // Add API response interceptor to handle JWT signature errors
  useEffect(() => {
    const handleUnauthorized = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.status === 403) {
        console.log('JWT signature error detected, logging out...');
        logout();
        window.location.href = '/login';
      }
    };

    window.addEventListener('jwt-signature-error', handleUnauthorized);
    return () => window.removeEventListener('jwt-signature-error', handleUnauthorized);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://promisedone.onrender.com/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.data) {
        // Show success notification
        showNotification(`Welcome back, ${data.data.user.firstName}!`, 'success', 3000);
        
        setUser(data.data.user);
        setToken(data.data.token);
        
        // Store in localStorage
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Connect Socket.IO for real-time features
        socketService.connect(data.data.token);
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Show error notification based on specific error types
      let errorMessage = 'Login failed. Please try again.';
      if (error.message?.includes('verify your email')) {
        errorMessage = 'Please verify your email address before logging in.';
      } else if (error.message?.includes('Invalid credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, 'error', 5000);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<RegisterResponse> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://promisedone.onrender.com/api'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.success && data.data) {
        // Show success notification
        showNotification('Registration successful! Check your email for verification code.', 'success', 4000);
        
        // Don't log in automatically - user needs to verify email first
        return {
          userId: data.data.userId,
          email: data.data.email,
          verificationToken: data.data.verificationToken,
          emailSent: data.data.emailSent,
          requiresVerification: data.data.requiresVerification
        };
      } else {
        throw new Error('Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Show error notification
      const errorMessage = error.message || 'Registration failed. Please try again.';
      showNotification(errorMessage, 'error', 5000);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (verificationToken: string, verificationCode: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://promisedone.onrender.com/api'}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verificationToken, verificationCode }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Email verification failed');
      }

      if (data.success && data.data) {
        // Show success notification
        showNotification('Email verified successfully! Welcome to KazRPG!', 'success', 4000);
        
        // After successful verification, log the user in
        setUser(data.data.user);
        setToken(data.data.token);
        
        // Store in localStorage
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Connect Socket.IO for real-time features
        socketService.connect(data.data.token);
      } else {
        throw new Error('Email verification failed');
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      
      // Show error notification
      const errorMessage = error.message || 'Email verification failed. Please try again.';
      showNotification(errorMessage, 'error', 5000);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email: string): Promise<void> => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://promisedone.onrender.com/api'}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification code');
      }

      if (!data.success) {
        throw new Error('Failed to resend verification code');
      }
      
      // Show success notification
      showNotification('New verification code sent to your email!', 'success', 4000);
    } catch (error: any) {
      console.error('Resend verification error:', error);
      
      // Show error notification
      const errorMessage = error.message || 'Failed to resend verification code. Please try again.';
      showNotification(errorMessage, 'error', 5000);
      
      throw error;
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Disconnect Socket.IO
    socketService.disconnect();
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    console.log('updateUser called with:', userData);
    console.log('Current user:', user);
    
    // For direct user data updates (like role changes from admin approval)
    // we can update directly without API call since the data is already validated
    if (userData && Object.keys(userData).length > 0) {
      const updatedUser = { ...user!, ...userData };
      console.log('Updating user locally to:', updatedUser);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('User updated locally, localStorage updated');
      return;
    }

    // For other updates that need API validation
    if (!token) {
      throw new Error('No authentication token');
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://promisedone.onrender.com/api'}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    verifyEmail,
    resendVerification,
    logout,
    updateUser,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
