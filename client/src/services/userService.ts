import apiService, { usersAPI, uploadsAPI } from './api';
import { User } from '../types/shared';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  timezone?: string;
  pronouns?: string[];
  identityTags?: string[];
  gameStyles?: string[];
  themes?: string[];
  pricing?: {
    sessionPrice: number;
    currency: string;
  };
  // Store additional profile data that's not in the main User model
  profileExtras?: {
    languages?: string[];
    gameSystemsPreferred?: string[];
    gamePlatformsPreferred?: string[];
    gameStylesPreferred?: string[];
    gameThemesPreferred?: string[];
    location?: string;
    dateOfBirth?: string;
    about?: string;
    availability?: {
      [key: string]: {
        morning: boolean;
        afternoon: boolean;
        evening: boolean;
        night: boolean;
      };
    };
  };
}

class UserService {
  async getProfile(): Promise<User> {
    const response = await usersAPI.getProfile();
    const user = response.data.data;
    if (!user) {
      throw new Error('User profile not found');
    }
    return user;
  }

  async getUserProfile(userId: string): Promise<User> {
    const response = await usersAPI.getPublicProfile(userId);
    const user = response.data.data;
    if (!user) {
      throw new Error('User profile not found');
    }
    return user;
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    // Separate the standard User fields from the extras
    const { profileExtras, ...standardFields } = data;
    
    // For now, we'll store the extras in the preferences or bio field
    // In the future, you might want to extend the backend User model
    const updateData: Partial<User> = {
      ...standardFields,
    };

    // Store profile extras in bio as JSON for now (temporary solution)
    if (profileExtras) {
      updateData.bio = updateData.bio || '';
      // You could store extras in a custom field or extend the User model
    }

    const response = await usersAPI.updateProfile(updateData);
    const user = response.data.data;
    if (!user) {
      throw new Error('Failed to update user profile');
    }
    return user;
  }

  async uploadAvatar(file: File): Promise<{ avatar: string }> {
    const response = await uploadsAPI.uploadAvatar(file);
    return response.data;
  }

  async removeAvatar(): Promise<{ message: string }> {
    const response = await uploadsAPI.removeAvatar();
    return response.data;
  }

  // Save profile data to localStorage as a fallback for extended profile data
  saveProfileDataLocally(data: any) {
    console.log('Saving to localStorage with key "profileExtras":', data);
    localStorage.setItem('profileExtras', JSON.stringify(data));
    // Verify the save
    const saved = localStorage.getItem('profileExtras');
    console.log('Verification - data saved to localStorage:', saved);
  }

  getProfileDataLocally() {
    const data = localStorage.getItem('profileExtras');
    console.log('Loading from localStorage with key "profileExtras":', data);
    const parsed = data ? JSON.parse(data) : null;
    console.log('Parsed localStorage data:', parsed);
    return parsed;
  }

  // Featured Prompts methods
  async getFeaturedPrompts(): Promise<Array<{id: string, text: string}>> {
    const response = await usersAPI.getFeaturedPrompts();
    const prompts = response.data.data;
    if (!prompts) {
      throw new Error('Failed to fetch featured prompts');
    }
    return prompts;
  }

  async updateFeaturedPrompts(featuredPrompts: Array<{promptId: string, customText: string}>): Promise<User> {
    const response = await usersAPI.updateFeaturedPrompts({ featuredPrompts });
    const user = response.data.data;
    if (!user) {
      throw new Error('Failed to update featured prompts');
    }
    return user;
  }
}

export const userService = new UserService();
