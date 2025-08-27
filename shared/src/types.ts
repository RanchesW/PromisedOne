export enum UserRole {
  PLAYER = 'player',
  GM_APPLICANT = 'gm_applicant',
  APPROVED_GM = 'approved_gm',
  ADMIN = 'admin'
}

export enum GameSystem {
  DND_5E = 'dnd_5e',
  PATHFINDER_2E = 'pathfinder_2e',
  CALL_OF_CTHULHU = 'call_of_cthulhu',
  VAMPIRE_MASQUERADE = 'vampire_masquerade',
  CYBERPUNK_RED = 'cyberpunk_red',
  OTHER = 'other'
}

export enum Platform {
  ONLINE = 'online',
  IN_PERSON = 'in_person',
  HYBRID = 'hybrid'
}

export enum SessionType {
  ONE_SHOT = 'one_shot',
  CAMPAIGN = 'campaign',
  MINI_SERIES = 'mini_series'
}

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  ALL_LEVELS = 'all_levels'
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export enum BookingType {
  INSTANT = 'instant',
  REQUEST = 'request'
}

export interface User {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  timezone: string;
  pronouns?: string[];
  identityTags?: string[];
  gameStyles?: string[];
  themes?: string[];
  preferences: {
    systems: GameSystem[];
    experienceLevel: ExperienceLevel;
    platforms: Platform[];
  };
  stats: {
    gamesPlayed: number;
    gamesHosted: number;
    averageRating: number;
    totalReviews: number;
  };
  pricing?: {
    sessionPrice: number;
    currency: string;
  };
  referralCode: string;
  referralCredits: number;
  isEmailVerified: boolean;
  featuredPrompts?: Array<{
    promptId: string;
    customText: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Game {
  _id: string;
  title: string;
  description: string;
  partyNotes?: string; // GM can set party notes for players
  system: GameSystem;
  customSystem?: string;
  platform: Platform;
  sessionType: SessionType;
  experienceLevel: ExperienceLevel;
  gm: string; // User ID
  gmDetails?: Partial<User>; // Populated GM details
  price: number;
  currency: string;
  capacity: number;
  bookedSeats: number;
  availableSeats: number;
  schedule: {
    startTime: Date;
    endTime: Date;
    timezone: string;
    recurring?: {
      frequency: 'weekly' | 'biweekly' | 'monthly';
      endDate?: Date;
    };
  };
  location?: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };
  onlineDetails?: {
    platform: string; // Discord, Roll20, etc.
    inviteLink?: string;
  };
  tags: string[];
  ageRestriction?: {
    minAge: number;
    maxAge?: number;
  };
  bookingType: BookingType;
  cancellationPolicy: {
    cutoffHours: number;
    refundPercentage: number;
  };
  isActive: boolean;
  isEarlyBird: boolean;
  earlyBirdDiscount?: number;
  bannerImage?: string;
  iconImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  _id: string;
  game: string; // Game ID
  player: string; // User ID
  numberOfSeats: number;
  companions?: {
    name: string;
    email?: string;
  }[];
  status: BookingStatus;
  totalAmount: number;
  currency: string;
  paymentIntentId?: string;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  _id: string;
  game: string; // Game ID
  reviewer: string; // User ID (player)
  gm: string; // User ID (GM)
  rating: number; // 1-5
  title: string;
  comment: string;
  privateFeedback?: string;
  isPublic: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: string;
  sender: string; // User ID
  recipient: string; // User ID
  content: string;
  messageType: 'text' | 'image' | 'file' | 'game_invitation';
  isRead: boolean;
  readAt?: Date;
  conversation: string; // Conversation ID
  relatedGame?: string; // Game ID
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    imageUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  _id: string;
  participants: string[]; // User IDs
  lastMessage?: string; // Message ID
  lastActivity: Date;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendRequest {
  _id: string;
  sender: string; // User ID
  recipient: string; // User ID
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Friendship {
  _id: string;
  user1: string; // User ID
  user2: string; // User ID
  createdAt: Date;
}

export interface GameRequest {
  _id: string;
  requester: string; // User ID
  title: string;
  description: string;
  preferredSystem: GameSystem;
  preferredPlatform: Platform;
  preferredSessionType: SessionType;
  experienceLevel: ExperienceLevel;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  schedule: {
    preferredDays: string[];
    preferredTimes: string[];
    timezone: string;
  };
  groupSize: number;
  isActive: boolean;
  responses: {
    gm: string; // User ID
    message: string;
    proposedPrice: number;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id: string;
  user: string; // User ID
  type: 'booking_confirmed' | 'booking_cancelled' | 'game_reminder' | 'review_received' | 'message_received' | 'referral_credit' | 'friend_request' | 'friend_accepted' | 'system_announcement' | 'maintenance' | 'event_notification' | 'game_update';
  title: string;
  message: string;
  relatedId?: string; // Related entity ID
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'social' | 'booking' | 'system' | 'game' | 'payment';
  actionUrl?: string; // URL to navigate when notification is clicked
  metadata?: {
    icon?: string;
    color?: string;
    expiresAt?: Date;
  };
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Search and Filter types
export interface GameSearchFilters {
  keyword?: string;
  system?: GameSystem;
  platform?: Platform;
  sessionType?: SessionType;
  experienceLevel?: ExperienceLevel;
  priceRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  timezone?: string;
  tags?: string[];
  ageAppropriate?: boolean;
  availableSeats?: number;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'price' | 'rating' | 'created';
  sortOrder?: 'asc' | 'desc';
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  timezone: string;
}

export interface UpdateProfileData {
  username?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  timezone?: string;
  preferences?: {
    emailNotifications: boolean;
    publicProfile: boolean;
    showTimezone: boolean;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Payment types
export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface ReferralCredit {
  _id: string;
  user: string; // User ID
  referredUser: string; // User ID
  amount: number;
  currency: string;
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
}
