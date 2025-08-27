import mongoose from 'mongoose';

const friendshipSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Ensure unique friendships and efficient queries
friendshipSchema.index({ user1: 1, user2: 1 }, { unique: true });
friendshipSchema.index({ user1: 1 });
friendshipSchema.index({ user2: 1 });

export default mongoose.model('Friendship', friendshipSchema);
