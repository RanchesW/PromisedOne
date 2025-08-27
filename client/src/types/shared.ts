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