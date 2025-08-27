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
  partyNotes?: string;
  system: GameSystem;
  customSystem?: string;
  platform: Platform;
  sessionType: SessionType;
  experienceLevel: ExperienceLevel;
  gm: string;
  gmDetails?: Partial<User>;
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
    coordinates?: [number, number];
  };
  onlineDetails?: {
    platform: string;
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
  game: string;
  player: string;
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
  game: string;
  reviewer: string;
  gm: string;
  rating: number;
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
  sender: string;
  recipient: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'game_invitation';
  isRead: boolean;
  readAt?: Date;
  conversation: string;
  relatedGame?: string;
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
  participants: string[];
  lastMessage?: string;
  lastActivity: Date;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendRequest {
  _id: string;
  sender: string;
  recipient: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Friendship {
  _id: string;
  user1: string;
  user2: string;
  createdAt: Date;
}

export interface GameRequest {
  _id: string;
  requester: string;
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
    gm: string;
    message: string;
    proposedPrice: number;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id: string;
  user: string;
  type: 'booking_confirmed' | 'booking_cancelled' | 'game_reminder' | 'review_received' | 'message_received' | 'referral_credit' | 'friend_request' | 'friend_accepted' | 'system_announcement' | 'maintenance' | 'event_notification' | 'game_update';
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'social' | 'booking' | 'system' | 'game' | 'payment';
  actionUrl?: string;
  metadata?: {
    icon?: string;
    color?: string;
    expiresAt?: Date;
  };
  createdAt: Date;
}

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
  user: string;
  referredUser: string;
  amount: number;
  currency: string;
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
}