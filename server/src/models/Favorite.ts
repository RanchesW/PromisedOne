import mongoose, { Schema, Document } from 'mongoose';

export interface FavoriteDocument extends Document {
  userId: mongoose.Types.ObjectId;
  gameMasterId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<FavoriteDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gameMasterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only favorite a GM once
favoriteSchema.index({ userId: 1, gameMasterId: 1 }, { unique: true });

// Index for efficient queries
favoriteSchema.index({ userId: 1 });
favoriteSchema.index({ gameMasterId: 1 });

const Favorite = mongoose.model<FavoriteDocument>('Favorite', favoriteSchema);

export default Favorite;