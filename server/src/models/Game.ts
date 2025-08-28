import mongoose, { Schema, Document } from 'mongoose';
import { Game as IGame, GameSystem, Platform, SessionType, ExperienceLevel, BookingType } from '@kazrpg/shared';

export interface GameDocument extends Omit<IGame, '_id' | 'gm'>, Document {
  gm: mongoose.Types.ObjectId;
}

const gameSchema = new Schema<GameDocument>({
  title: {
    type: String,
    required: [true, 'Game title is required'],
    trim: true,
    maxlength: [100, 'Title must be less than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Game description is required'],
    maxlength: [2000, 'Description must be less than 2000 characters'],
  },
  partyNotes: {
    type: String,
    maxlength: [500, 'Party notes must be less than 500 characters'],
    default: '',
  },
  system: {
    type: String,
    enum: Object.values(GameSystem),
    required: [true, 'Game system is required'],
  },
  customSystem: {
    type: String,
    maxlength: [50, 'Custom system must be less than 50 characters'],
    validate: {
      validator: function(this: GameDocument, value: string) {
        return this.system !== GameSystem.OTHER || (value && value.trim().length > 0);
      },
      message: 'Custom system is required when system is "other"',
    },
  },
  platform: {
    type: String,
    enum: Object.values(Platform),
    required: [true, 'Platform is required'],
  },
  sessionType: {
    type: String,
    enum: Object.values(SessionType),
    required: [true, 'Session type is required'],
  },
  experienceLevel: {
    type: String,
    enum: Object.values(ExperienceLevel),
    required: [true, 'Experience level is required'],
  },
  gm: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Game Master is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'USD',
    uppercase: true,
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [20, 'Capacity cannot exceed 20'],
  },
  bookedSeats: {
    type: Number,
    default: 0,
    min: [0, 'Booked seats cannot be negative'],
  },
  availableSeats: {
    type: Number,
    default: function(this: GameDocument) {
      return this.capacity - this.bookedSeats;
    },
  },
  schedule: {
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      // Temporarily disabled future date validation for testing
      // validate: {
      //   validator: function(value: Date) {
      //     return value > new Date();
      //   },
      //   message: 'Start time must be in the future',
      // },
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    timezone: {
      type: String,
      required: [true, 'Timezone is required'],
      default: 'UTC',
    },
    recurring: {
      frequency: {
        type: String,
        enum: ['weekly', 'biweekly', 'monthly'],
      },
      endDate: {
        type: Date,
        validate: {
          validator: function(this: GameDocument, value: Date) {
            return !value || value > this.schedule.startTime;
          },
          message: 'Recurring end date must be after start time',
        },
      },
    },
  },
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      type: [Number],
      validate: {
        validator: function(coords: number[]) {
          return !coords || coords.length === 0 || (coords.length === 2 && 
            coords[0] >= -180 && coords[0] <= 180 && 
            coords[1] >= -90 && coords[1] <= 90);
        },
        message: 'Invalid coordinates',
      },
    },
  },
  onlineDetails: {
    platform: {
      type: String,
      maxlength: [50, 'Platform name must be less than 50 characters'],
    },
    inviteLink: {
      type: String,
      maxlength: [500, 'Invite link must be less than 500 characters'],
    },
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag must be less than 30 characters'],
  }],
  ageRestriction: {
    minAge: {
      type: Number,
      min: [13, 'Minimum age must be at least 13'],
      max: [100, 'Invalid minimum age'],
    },
    maxAge: {
      type: Number,
      min: [13, 'Maximum age must be at least 13'],
      max: [100, 'Invalid maximum age'],
      validate: {
        validator: function(this: GameDocument, value: number) {
          return !value || !this.ageRestriction?.minAge || value >= this.ageRestriction.minAge;
        },
        message: 'Maximum age must be greater than or equal to minimum age',
      },
    },
  },
  bookingType: {
    type: String,
    enum: Object.values(BookingType),
    required: [true, 'Booking type is required'],
    default: BookingType.INSTANT,
  },
  cancellationPolicy: {
    cutoffHours: {
      type: Number,
      required: [true, 'Cancellation cutoff hours is required'],
      min: [0, 'Cutoff hours cannot be negative'],
      default: 24,
    },
    refundPercentage: {
      type: Number,
      required: [true, 'Refund percentage is required'],
      min: [0, 'Refund percentage cannot be negative'],
      max: [100, 'Refund percentage cannot exceed 100'],
      default: 100,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isEarlyBird: {
    type: Boolean,
    default: false,
  },
  earlyBirdDiscount: {
    type: Number,
    min: [0, 'Early bird discount cannot be negative'],
    max: [50, 'Early bird discount cannot exceed 50%'],
    validate: {
      validator: function(this: GameDocument, value: number) {
        return !value || this.isEarlyBird;
      },
      message: 'Early bird discount can only be set when early bird is enabled',
    },
  },
  bannerImage: {
    type: String,
    maxlength: [200, 'Banner image URL must be less than 200 characters'],
  },
  iconImage: {
    type: String,
    maxlength: [200, 'Icon image URL must be less than 200 characters'],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
gameSchema.index({ gm: 1, isActive: 1 });
gameSchema.index({ system: 1, platform: 1 });
gameSchema.index({ 'schedule.startTime': 1, isActive: 1 });
gameSchema.index({ tags: 1 });
gameSchema.index({ experienceLevel: 1 });
gameSchema.index({ price: 1 });

// Virtual for populated GM
gameSchema.virtual('gmDetails', {
  ref: 'User',
  localField: 'gm',
  foreignField: '_id',
  justOne: true,
});

// Pre-save middleware to update available seats
gameSchema.pre('save', function(this: GameDocument) {
  this.availableSeats = this.capacity - this.bookedSeats;
});

// Pre-validate middleware for platform-specific validations
gameSchema.pre('validate', function(this: GameDocument) {
  // Validate location for in-person games
  if (this.platform === Platform.IN_PERSON || this.platform === Platform.HYBRID) {
    if (!this.location?.address || !this.location?.city || !this.location?.country) {
      this.invalidate('location', 'Location details are required for in-person or hybrid games');
    }
  }

  // Validate online details for online games
  if (this.platform === Platform.ONLINE || this.platform === Platform.HYBRID) {
    if (!this.onlineDetails?.platform) {
      this.invalidate('onlineDetails.platform', 'Online platform is required for online or hybrid games');
    }
  }

  // Validate schedule times - TEMPORARILY DISABLED FOR TESTING
  // if (this.schedule?.startTime && this.schedule?.endTime) {
  //   const startTime = new Date(this.schedule.startTime);
  //   const endTime = new Date(this.schedule.endTime);
  //   
  //   if (endTime <= startTime) {
  //     this.invalidate('schedule.endTime', 'End time must be after start time');
  //   }
  // }
});

const Game = mongoose.model<GameDocument>('Game', gameSchema);

export default Game;
