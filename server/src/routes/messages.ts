import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import FriendRequest from '../models/FriendRequest';
import Friendship from '../models/Friendship';
import Notification from '../models/Notification';
import { User } from '../models/User';
import mongoose from 'mongoose';

// Extend Request interface to include user information
interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    username: string;
    role: string;
    email: string;
  };
}

const router = Router();

// Test endpoint without auth for debugging
router.post('/test-friend-request', async (req: Request, res: Response) => {
  try {
    // Create a notification for the player user (asd)
    const playerUser = await User.findOne({ username: 'asd' });
    if (!playerUser) {
      return res.status(404).json({ success: false, error: 'Player user not found' });
    }

    console.log('Creating test notification for user:', {
      userId: playerUser._id,
      username: playerUser.username
    });

    const notification = await Notification.create({
      user: playerUser._id,
      type: 'friend_request',
      title: 'New Friend Request (Test)',
      message: 'You have received a new friend request from admin_ali',
      category: 'social',
      priority: 'medium',
      isRead: false // Explicitly set as unread
    });

    console.log('Test notification created:', {
      notificationId: notification._id,
      userId: playerUser._id,
      isRead: notification.isRead,
      type: notification.type,
      title: notification.title
    });

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Error creating test friend request:', error);
    res.status(500).json({ success: false, error: 'Failed to create test friend request' });
  }
});

// Apply authentication to all routes below this point
router.use(authenticateToken);

// Get all conversations for the current user
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    console.log('Messages auth debug:', {
      hasUser: !!(req as AuthenticatedRequest).user,
      user: (req as AuthenticatedRequest).user ? {
        id: (req as AuthenticatedRequest).user._id,
        username: (req as AuthenticatedRequest).user.username,
        email: (req as AuthenticatedRequest).user.email
      } : null
    });
    
    const userId = (req as AuthenticatedRequest).user._id;
    
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'username firstName lastName avatar')
    .populate('lastMessage')
    .sort({ lastActivity: -1 });

    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user._id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'username firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Mark messages as read for the current user
    await Message.updateMany(
      { 
        conversation: conversationId, 
        recipient: userId, 
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json({ 
      success: true, 
      data: messages.reverse() // Reverse to show oldest first
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user._id;
    const { conversationId } = req.params;
    const { content, messageType = 'text', metadata } = req.body;

    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    console.log('Conversation participants debug:', {
      conversationId,
      participants: conversation.participants,
      participantCount: conversation.participants.length,
      senderId: userId
    });

    // Get the recipient (other participant)
    const recipient = conversation.participants.find(p => p.toString() !== userId.toString());

    console.log('Message creation debug:', {
      senderId: userId,
      senderUsername: (req as AuthenticatedRequest).user.username,
      recipientId: recipient,
      recipientFound: !!recipient,
      conversationId
    });

    const message = new Message({
      sender: userId,
      recipient,
      conversation: conversationId,
      content,
      messageType,
      metadata
    });

    await message.save();
    await message.populate('sender', 'username firstName lastName avatar');

    // Update conversation's last activity and last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastActivity: new Date()
    });

    // Create notification for recipient (only if recipient is different from sender)
    if (recipient && recipient.toString() !== userId.toString()) {
      const notification = await Notification.create({
        user: recipient,
        type: 'message_received',
        title: 'New Message',
        message: `You received a new message from ${(req as AuthenticatedRequest).user.username}`,
        relatedId: message._id,
        category: 'social',
        actionUrl: `/messages/${conversationId}`
      });

      console.log('Notification created debug:', {
        notificationId: notification._id,
        recipientId: recipient,
        senderUsername: (req as AuthenticatedRequest).user.username,
        type: 'message_received'
      });
    } else {
      console.log('Notification NOT created - recipient same as sender:', {
        senderId: userId,
        recipientId: recipient,
        senderUsername: (req as AuthenticatedRequest).user.username
      });
    }

    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// Find users by username
router.get('/users/search', async (req: Request, res: Response) => {
  try {
    const { username } = req.query;
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ success: false, error: 'Username is required' });
    }

    const users = await User.find({
      username: { $regex: username, $options: 'i' }
    })
    .select('username firstName lastName avatar')
    .limit(10);

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ success: false, error: 'Failed to search users' });
  }
});

// Send friend request
router.post('/friends/request', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user._id;
    const { recipientId, message } = req.body;

    if (userId === recipientId) {
      return res.status(400).json({ success: false, error: 'Cannot send friend request to yourself' });
    }

    // Check if users are already friends
    const existingFriendship = await Friendship.findOne({
      $or: [
        { user1: userId, user2: recipientId },
        { user1: recipientId, user2: userId }
      ]
    });

    if (existingFriendship) {
      return res.status(400).json({ success: false, error: 'Already friends' });
    }

    // Check if friend request already exists
    const existingRequest = await FriendRequest.findOne({
      sender: userId,
      recipient: recipientId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ success: false, error: 'Friend request already sent' });
    }

    const friendRequest = new FriendRequest({
      sender: userId,
      recipient: recipientId,
      message
    });

    await friendRequest.save();
    await friendRequest.populate('sender', 'username firstName lastName avatar');

    // Create notification for recipient
    await Notification.create({
      user: recipientId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${(req as AuthenticatedRequest).user.username} sent you a friend request`,
      relatedId: friendRequest._id,
      category: 'social',
      actionUrl: '/friends/requests'
    });

    res.json({ success: true, data: friendRequest });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ success: false, error: 'Failed to send friend request' });
  }
});

// Send friend request by username
router.post('/friends/request-by-username', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user._id;
    const { username, message } = req.body;

    // Remove @ symbol if user typed it
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username;

    // Find the user by username
    const recipient = await User.findOne({ username: cleanUsername });
    if (!recipient) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const recipientId = (recipient._id as any).toString();

    if (userId === recipientId) {
      return res.status(400).json({ success: false, error: 'Cannot send friend request to yourself' });
    }

    // Check if users are already friends
    const existingFriendship = await Friendship.findOne({
      $or: [
        { user1: userId, user2: recipientId },
        { user1: recipientId, user2: userId }
      ]
    });

    if (existingFriendship) {
      return res.status(400).json({ success: false, error: 'Already friends' });
    }

    // Check if friend request already exists
    const existingRequest = await FriendRequest.findOne({
      sender: userId,
      recipient: recipientId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ success: false, error: 'Friend request already sent' });
    }

    const friendRequest = new FriendRequest({
      sender: userId,
      recipient: recipientId,
      message: message || `Hi! I'd like to add you as a friend.`
    });

    await friendRequest.save();
    await friendRequest.populate('sender', 'username firstName lastName avatar');
    await friendRequest.populate('recipient', 'username firstName lastName avatar');

    // Create notification for recipient
    await Notification.create({
      user: recipientId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${(req as AuthenticatedRequest).user.username} sent you a friend request`,
      relatedId: friendRequest._id,
      category: 'social',
      actionUrl: '/friends/requests'
    });

    res.json({ success: true, data: friendRequest });
  } catch (error) {
    console.error('Error sending friend request by username:', error);
    res.status(500).json({ success: false, error: 'Failed to send friend request' });
  }
});

// Get pending friend requests
router.get('/friends/requests', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user._id;
    
    const receivedRequests = await FriendRequest.find({
      recipient: userId,
      status: 'pending'
    }).populate('sender', 'username firstName lastName avatar');

    const sentRequests = await FriendRequest.find({
      sender: userId,
      status: 'pending'
    }).populate('recipient', 'username firstName lastName avatar');

    res.json({ 
      success: true, 
      data: {
        received: receivedRequests,
        sent: sentRequests
      }
    });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch friend requests' });
  }
});

// Accept/Decline friend request
router.patch('/friends/requests/:requestId', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user._id;
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'decline'

    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      recipient: userId,
      status: 'pending'
    });

    if (!friendRequest) {
      return res.status(404).json({ success: false, error: 'Friend request not found' });
    }

    friendRequest.status = action === 'accept' ? 'accepted' : 'declined';
    await friendRequest.save();

    if (action === 'accept') {
      // Create friendship
      const friendship = new Friendship({
        user1: friendRequest.sender,
        user2: userId
      });
      await friendship.save();

      // Create notification for sender
      await Notification.create({
        user: friendRequest.sender,
        type: 'friend_accepted',
        title: 'Friend Request Accepted',
        message: `${(req as AuthenticatedRequest).user.username} accepted your friend request`,
        relatedId: friendship._id,
        category: 'social',
        actionUrl: `/profile/${userId}`
      });
    }

    res.json({ success: true, data: friendRequest });
  } catch (error) {
    console.error('Error handling friend request:', error);
    res.status(500).json({ success: false, error: 'Failed to handle friend request' });
  }
});

// Cancel friend request
router.delete('/friends/requests/:requestId', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user._id;
    const { requestId } = req.params;

    // Find the friend request and verify the current user is the sender
    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      sender: userId,
      status: 'pending'
    });

    if (!friendRequest) {
      return res.status(404).json({ success: false, error: 'Friend request not found or cannot be canceled' });
    }

    // Delete the friend request
    await FriendRequest.findByIdAndDelete(requestId);

    // Remove related notification if it exists
    await Notification.deleteMany({
      relatedId: requestId,
      type: 'friend_request'
    });

    res.json({ success: true, message: 'Friend request canceled successfully' });
  } catch (error) {
    console.error('Error canceling friend request:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel friend request' });
  }
});

// Get friends list
router.get('/friends', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user._id;
    
    const friendships = await Friendship.find({
      $or: [{ user1: userId }, { user2: userId }]
    })
    .populate('user1', 'username firstName lastName avatar')
    .populate('user2', 'username firstName lastName avatar');

    const friends = friendships.map(friendship => {
      // Convert both to strings for proper comparison
      // Type assertion needed because TypeScript doesn't recognize populated fields
      const user1 = friendship.user1 as any;
      const user2 = friendship.user2 as any;
      const isUser1 = user1._id.toString() === userId.toString();
      return isUser1 ? user2 : user1;
    });

    console.log('Friends mapping debug:', {
      userId: userId.toString(),
      friendships: friendships.map(f => ({
        id: f._id,
        user1: (f.user1 as any)._id.toString(),
        user2: (f.user2 as any)._id.toString()
      })),
      mappedFriends: friends.map(f => ({
        id: (f as any)._id.toString(),
        name: `${(f as any).firstName} ${(f as any).lastName}`
      }))
    });

    res.json({ success: true, data: friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch friends' });
  }
});

// Remove friend
router.delete('/friends/:friendId', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user._id;
    const { friendId } = req.params;

    console.log('Attempting to remove friendship:', { 
      userId: userId.toString(), 
      friendId,
      userIdType: typeof userId,
      friendIdType: typeof friendId 
    });

    // Convert to ObjectId for proper comparison
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const friendObjectId = new mongoose.Types.ObjectId(friendId);

    console.log('ObjectId conversion:', {
      userObjectId: userObjectId.toString(),
      friendObjectId: friendObjectId.toString()
    });

    // First, let's check if the friendship exists before trying to delete
    const existingFriendship = await Friendship.findOne({
      $or: [
        { user1: userObjectId, user2: friendObjectId },
        { user1: friendObjectId, user2: userObjectId }
      ]
    });

    console.log('Existing friendship found:', existingFriendship ? {
      id: existingFriendship._id,
      user1: existingFriendship.user1.toString(),
      user2: existingFriendship.user2.toString()
    } : 'No friendship found');

    if (!existingFriendship) {
      // Let's also check all friendships for this user to debug
      const allUserFriendships = await Friendship.find({
        $or: [{ user1: userObjectId }, { user2: userObjectId }]
      });
      
      console.log('All friendships for user:', allUserFriendships.map(f => ({
        id: f._id,
        user1: f.user1.toString(),
        user2: f.user2.toString()
      })));

      return res.status(404).json({ success: false, error: 'Friendship not found' });
    }

    // Now delete the friendship
    const deletedFriendship = await Friendship.findOneAndDelete({
      $or: [
        { user1: userObjectId, user2: friendObjectId },
        { user1: friendObjectId, user2: userObjectId }
      ]
    });

    console.log('Friendship removed successfully:', deletedFriendship ? deletedFriendship._id : 'None deleted');

    // After removing friendship, update any related pending/accepted friend requests to 'declined'
    // This allows users to send new friend requests later if they choose.
    await FriendRequest.updateMany(
      {
        $or: [
          { sender: userObjectId, recipient: friendObjectId },
          { sender: friendObjectId, recipient: userObjectId }
        ],
        status: { $in: ['pending', 'accepted'] } // Consider both pending and accepted requests
      },
      { status: 'declined' }
    );

    console.log(`Friend requests between ${userObjectId} and ${friendObjectId} updated to 'declined'.`);

    res.json({ success: true, message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ success: false, error: 'Failed to remove friend' });
  }
});

// Start conversation with a friend
router.post('/conversations', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user._id;
    const { participantId } = req.body;

    console.log('Create conversation request:', {
      userId,
      participantId,
      body: req.body
    });

    // Check if users are friends
    const friendship = await Friendship.findOne({
      $or: [
        { user1: userId, user2: participantId },
        { user1: participantId, user2: userId }
      ]
    });

    console.log('Friendship check:', {
      userId,
      participantId,
      friendship: !!friendship
    });

    if (!friendship) {
      console.log('Friendship not found - cannot create conversation');
      return res.status(400).json({ success: false, error: 'Can only start conversations with friends' });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
      isGroup: false
    }).populate('participants', 'username firstName lastName avatar');

    console.log('Existing conversation check:', {
      userId,
      participantId,
      existingConversation: !!existingConversation
    });

    if (existingConversation) {
      console.log('Returning existing conversation:', existingConversation._id);
      return res.json({ success: true, data: existingConversation });
    }

    // Create new conversation
    const conversation = new Conversation({
      participants: [userId, participantId],
      createdBy: userId,
      lastActivity: new Date()
    });

    await conversation.save();
    await conversation.populate('participants', 'username firstName lastName avatar');

    console.log('New conversation created:', conversation._id);
    res.json({ success: true, data: conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ success: false, error: 'Failed to create conversation' });
  }
});

// Create group conversation
router.post('/conversations/group', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user._id;
    const { name, description, memberIds } = req.body;

    console.log('Create group conversation request:', {
      userId,
      name,
      description,
      memberIds,
      body: req.body
    });

    if (!name || !memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Group name and member IDs are required' 
      });
    }

    // Check if all members are friends with the creator
    for (const memberId of memberIds) {
      const friendship = await Friendship.findOne({
        $or: [
          { user1: userId, user2: memberId },
          { user1: memberId, user2: userId }
        ]
      });

      if (!friendship) {
        return res.status(400).json({ 
          success: false, 
          error: 'Can only add friends to group conversations' 
        });
      }
    }

    // Create new group conversation
    const participants = [userId, ...memberIds];
    const conversation = new Conversation({
      groupName: name,
      groupDescription: description,
      participants,
      isGroup: true,
      createdBy: userId,
      lastActivity: new Date()
    });

    await conversation.save();
    await conversation.populate('participants', 'username firstName lastName avatar');

    console.log('New group conversation created:', conversation._id);
    res.json({ success: true, data: conversation });
  } catch (error) {
    console.error('Error creating group conversation:', error);
    res.status(500).json({ success: false, error: 'Failed to create group conversation' });
  }
});

// Get notifications
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    console.log('Notifications request debug:', {
      userId,
      username: (req as AuthenticatedRequest).user.username,
      page,
      limit
    });

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ 
      user: userId, 
      isRead: false 
    });

    // Additional debugging for notification details
    const allNotificationsForUser = await Notification.find({ user: userId });
    console.log('All notifications in database for user:', {
      userId,
      username: (req as AuthenticatedRequest).user.username,
      totalInDatabase: allNotificationsForUser.length,
      allNotifications: allNotificationsForUser.map(n => ({ 
        id: n._id, 
        type: n.type, 
        title: n.title, 
        isRead: n.isRead, 
        createdAt: n.createdAt 
      })),
      queryResult: notifications.length,
      unreadCount
    });

    console.log('Notifications found:', {
      userId,
      notificationCount: notifications.length,
      unreadCount,
      notifications: notifications.map(n => ({ type: n.type, title: n.title, createdAt: n.createdAt }))
    });

    res.json({ 
      success: true, 
      data: notifications,
      unreadCount 
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/notifications/:notificationId/read', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user._id;
    const { notificationId } = req.params;

    await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/notifications/mark-all-read', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user._id;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark all notifications as read' });
  }
});

// Clear all notifications
router.delete('/notifications/clear-all', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user._id;

    await Notification.deleteMany({ user: userId });

    res.json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to clear all notifications' });
  }
});

// Create system announcement (Admin only)
router.post('/notifications/system', async (req: Request, res: Response) => {
  try {
    const userRole = (req as AuthenticatedRequest).user.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { title, message, type, priority, targetUsers, expiresAt } = req.body;

    let users = [];
    if (targetUsers && targetUsers.length > 0) {
      users = targetUsers;
    } else {
      // Send to all users
      const allUsers = await User.find({}, '_id');
      users = allUsers.map(user => user._id);
    }

    const notifications = users.map((userId: any) => ({
      user: userId,
      type: type || 'system_announcement',
      title,
      message,
      priority: priority || 'medium',
      category: 'system',
      metadata: expiresAt ? { expiresAt: new Date(expiresAt) } : undefined
    }));

    await Notification.insertMany(notifications);

    res.json({ 
      success: true, 
      message: `System notification sent to ${users.length} users` 
    });
  } catch (error) {
    console.error('Error creating system notification:', error);
    res.status(500).json({ success: false, error: 'Failed to create system notification' });
  }
});

// Test message sending to debug notification creation
router.post('/test/send-message', async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user._id;
    const { recipientId, content = 'Test message for notification debugging' } = req.body;

    console.log('=== TEST MESSAGE SEND DEBUG ===');
    console.log('Sender:', {
      id: userId,
      username: (req as AuthenticatedRequest).user.username
    });
    console.log('Recipient ID:', recipientId);

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, recipientId]
      });
      await conversation.save();
      console.log('Created new conversation:', conversation._id);
    } else {
      console.log('Found existing conversation:', conversation._id);
    }

    // Create message
    const message = new Message({
      sender: userId,
      recipient: recipientId,
      conversation: conversation._id,
      content
    });

    await message.save();
    console.log('Message created:', message._id);

    // Create notification for recipient (only if recipient is different from sender)
    if (recipientId && recipientId.toString() !== userId.toString()) {
      console.log('Creating notification for recipient...');
      const notification = await Notification.create({
        user: recipientId,
        type: 'message_received',
        title: 'New Message (Test)',
        message: `You received a test message from ${(req as AuthenticatedRequest).user.username}`,
        relatedId: message._id,
        category: 'social',
        actionUrl: `/messages/${conversation._id}`
      });

      console.log('TEST: Notification created successfully:', {
        notificationId: notification._id,
        recipientId: recipientId,
        senderUsername: (req as AuthenticatedRequest).user.username
      });
    } else {
      console.log('TEST: Notification NOT created - sender and recipient are the same');
    }

    res.json({ 
      success: true, 
      message: message._id,
      conversation: conversation._id
    });
  } catch (error) {
    console.error('Error in test message send:', error);
    res.status(500).json({ success: false, error: 'Failed to send test message' });
  }
});

export default router;
