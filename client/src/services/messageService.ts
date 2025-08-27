import { messagesAPI } from './api';

export const messageService = {
  // Conversations
  getConversations: () => messagesAPI.getConversations(),
  getConversationMessages: (conversationId: string, page?: number) => 
    messagesAPI.getConversationMessages(conversationId, page),
  sendMessage: (conversationId: string, content: string, messageType?: string, metadata?: any) => 
    messagesAPI.sendMessage(conversationId, content, messageType, metadata),
  createConversation: (participantId: string) => messagesAPI.createConversation(participantId),
  createGroupConversation: (name: string, description: string, memberIds: string[]) => 
    messagesAPI.createGroupConversation(name, description, memberIds),

  // Friends
  searchUsers: (username: string) => messagesAPI.searchUsers(username),
  sendFriendRequest: (recipientId: string, message?: string) => 
    messagesAPI.sendFriendRequest(recipientId, message),
  sendFriendRequestByUsername: (username: string, message?: string) => 
    messagesAPI.sendFriendRequestByUsername(username, message),
  getFriendRequests: () => messagesAPI.getFriendRequests(),
  handleFriendRequest: (requestId: string, action: 'accept' | 'decline') => 
    messagesAPI.handleFriendRequest(requestId, action),
  cancelFriendRequest: (requestId: string) => 
    messagesAPI.cancelFriendRequest(requestId),
  getFriends: () => messagesAPI.getFriends(),
  removeFriend: (friendId: string) => messagesAPI.removeFriend(friendId),

  // Notifications
  getNotifications: (page?: number) => messagesAPI.getNotifications(page),
  markNotificationAsRead: (notificationId: string) => 
    messagesAPI.markNotificationAsRead(notificationId),
  markAllNotificationsAsRead: () => messagesAPI.markAllNotificationsAsRead(),
  clearAllNotifications: () => messagesAPI.clearAllNotifications(),
  createSystemNotification: (data: any) => messagesAPI.createSystemNotification(data),
};
