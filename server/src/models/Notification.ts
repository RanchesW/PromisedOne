import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'booking_confirmed', 
      'booking_cancelled', 
      'game_reminder', 
      'review_received', 
      'message_received', 
      'referral_credit',
      'friend_request',
      'friend_accepted',
      'system_announcement',
      'maintenance',
      'event_notification',
      'game_update',
      'admin_action'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['social', 'booking', 'system', 'game', 'payment'],
    required: true
  },
  actionUrl: {
    type: String
  },
  metadata: {
    icon: String,
    color: String,
    expiresAt: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ 'metadata.expiresAt': 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Notification', notificationSchema);
