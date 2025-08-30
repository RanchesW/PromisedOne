import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../types/shared';

export interface GMApplicationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  experience: string;
  preferredSystems: string[];
  availability: string;
  sampleGameDescription: string;
  references?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNotes?: string;
}

const gmApplicationSchema = new Schema<GMApplicationDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true, // Each user can only have one application
  },
  experience: {
    type: String,
    required: [true, 'Experience description is required'],
    maxlength: [2000, 'Experience description must be less than 2000 characters'],
  },
  preferredSystems: [{
    type: String,
    required: true,
  }],
  availability: {
    type: String,
    required: [true, 'Availability is required'],
    maxlength: [1000, 'Availability description must be less than 1000 characters'],
  },
  sampleGameDescription: {
    type: String,
    required: [true, 'Sample game description is required'],
    maxlength: [2000, 'Sample game description must be less than 2000 characters'],
  },
  references: {
    type: String,
    maxlength: [1000, 'References must be less than 1000 characters'],
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: {
    type: Date,
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewNotes: {
    type: String,
    maxlength: [1000, 'Review notes must be less than 1000 characters'],
  },
}, {
  timestamps: true,
});

// Indexes
gmApplicationSchema.index({ userId: 1 });
gmApplicationSchema.index({ status: 1 });
gmApplicationSchema.index({ submittedAt: -1 });

const GMApplication = mongoose.model<GMApplicationDocument>('GMApplication', gmApplicationSchema);

export default GMApplication;