import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'game_invitation'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  relatedGame: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  },
  metadata: {
    fileName: String,
    fileSize: Number,
    fileType: String,
    imageUrl: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.model('Message', messageSchema);
