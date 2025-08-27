import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User as IUser, UserRole } from '@kazrpg/shared';

export interface DMApplication {
  experience: string;
  preferredSystems: string[];
  availability: string;
  sampleGameDescription: string;
  references?: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

export interface UserDocument extends Omit<IUser, '_id'>, Document {
  password: string;
  dmApplication?: DMApplication;
  isActive: boolean;
  lastLoginAt?: Date;
  pronouns?: string[];
  identityTags?: string[];
  gameStyles?: string[];
  themes?: string[];
  profile?: {
    timeZone?: string;
    languages?: string[];
    favoriteGenres?: string[];
    experienceLevel?: string;
  };
  featuredPrompts?: Array<{
    promptId: string;
    customText: string;
  }>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username must be less than 30 characters'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.PLAYER,
  },
  avatar: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    maxlength: [2500, 'Bio must be less than 500 characters'],
  },
  pronouns: [{
    type: String,
  }],
  identityTags: [{
    type: String,
  }],
  gameStyles: [{
    type: String,
    enum: [
      'rule_of_cool', 'combat_heavy', 'combat_lite', 'dungeon_crawl', 
      'puzzle_mystery', 'hexcrawl_exploration', 'roleplay_heavy', 'realm_building'
    ]
  }],
  themes: [{
    type: String,
    enum: [
      'anime', 'battle_royale', 'comedy', 'cosmic_horror', 'cozy', 'cyberpunk',
      'dark_fantasy', 'detective', 'epic_fantasy', 'historical', 'horror',
      'medieval', 'modern', 'mystery', 'noir', 'pirates', 'post_apocalyptic',
      'pulp_adventure', 'romance', 'sci_fi', 'space_opera', 'steampunk',
      'superhero', 'survival', 'urban_fantasy', 'western', 'zombie'
    ]
  }],
  timezone: {
    type: String,
    required: [true, 'Timezone is required'],
    default: 'UTC',
  },
  preferences: {
    systems: [{
      type: String,
      enum: ['dnd_5e', 'pathfinder_2e', 'call_of_cthulhu', 'vampire_masquerade', 'cyberpunk_red', 'other'],
    }],
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all_levels'],
      default: 'beginner',
    },
    platforms: [{
      type: String,
      enum: ['online', 'in_person', 'hybrid'],
    }],
  },
  stats: {
    gamesPlayed: {
      type: Number,
      default: 0,
    },
    gamesHosted: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  pricing: {
    sessionPrice: {
      type: Number,
      default: 15.00,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  referralCredits: {
    type: Number,
    default: 0,
    min: 0,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
  profile: {
    timeZone: String,
    languages: [String],
    favoriteGenres: [String],
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    },
  },
  featuredPrompts: [{
    promptId: {
      type: String,
      required: true,
    },
    customText: {
      type: String,
      required: true,
    }
  }],
  dmApplication: {
    experience: String,
    preferredSystems: [String],
    availability: String,
    sampleGameDescription: String,
    references: String,
    submittedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String
  },
}, {
  timestamps: true,
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate referral code before saving
userSchema.pre('save', function(next) {
  if (!this.referralCode && this.isNew) {
    const prefix = this.username.substring(0, 3).toUpperCase();
    const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.referralCode = `${prefix}${suffix}`;
  }
  next();
});

export const User = mongoose.model<UserDocument>('User', userSchema);
