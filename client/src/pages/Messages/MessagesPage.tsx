import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { messageService } from '../../services/messageService';
import { useAuth } from '../../contexts/AuthContext';
import { getAvatarUrl } from '../../services/api';
import { Message, Conversation, FriendRequest, Notification, User } from '../../types/shared';
import { 
  MessageBubble, 
  ChatInput, 
  TypingIndicator,
  CreateGroupChat,
  NotificationItem,
  MessageSearch,
  VoiceRecorder,
  OnlineStatus,
  DateSeparator
} from '../../components/Messages';
import ConfirmationModal from '../../components/UI/ConfirmationModal';

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'conversations' | 'friends' | 'notifications'>('conversations');
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<{ received: any[]; sent: any[] }>({ received: [], sent: [] });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingFriendRequest, setSendingFriendRequest] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Enhanced messaging states
  const [showSearch, setShowSearch] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle URL query parameters to set active tab
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab === 'friends' || tab === 'notifications') {
      setActiveTab(tab);
    }
  }, [location]);

  // Auto-hide toast messages
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToastMessage({ message, type });
  };

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadConversations(),
        loadFriends(),
        loadFriendRequests(),
        loadNotifications()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await messageService.getConversations();
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadFriends = async () => {
    try {
      const response = await messageService.getFriends();
      const friendsData = response.data.data || [];
      console.log('Loaded friends:', friendsData.map(f => ({ id: f._id, name: `${f.firstName} ${f.lastName}` })));
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const removeFriend = async (friendId: string, friendName: string) => {
    console.log('Frontend: Attempting to remove friend:', { friendId, friendName });
    
    setConfirmModal({
      isOpen: true,
      title: 'Remove Friend',
      message: `Are you sure you want to remove ${friendName} from your friends list? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          console.log('Frontend: Calling API to remove friend:', friendId);
          await messageService.removeFriend(friendId);
          showToast('Friend removed successfully', 'success');
          await loadFriends();
        } catch (error: any) {
          console.error('Frontend: Error removing friend:', error);
          const errorMessage = error?.response?.data?.error || 'Failed to remove friend';
          showToast(errorMessage, 'error');
        }
      }
    });
  };

  const loadFriendRequests = async () => {
    try {
      const response = await messageService.getFriendRequests();
      setFriendRequests(response.data.data || { received: [], sent: [] });
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await messageService.getNotifications();
      const responseData = response.data as any; // Backend returns { success, data, unreadCount }
      setNotifications(responseData.data || []);
      setUnreadCount(responseData.unreadCount || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const selectConversation = async (conversation: any) => {
    setSelectedConversation(conversation);
    try {
      const response = await messageService.getConversationMessages(conversation._id);
      setMessages(response.data.data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (content: string, messageType = 'text', metadata?: any) => {
    if (!selectedConversation || !content.trim()) return;

    try {
      const response = await messageService.sendMessage(
        selectedConversation._id,
        content,
        messageType,
        metadata
      );
      
      // Add the new message to the messages array
      const newMsg = response.data.data;
      setMessages(prev => [...prev, newMsg]);
      
      // Refresh conversations to update last message
      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Failed to send message', 'error');
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      // Mock implementation - replace with actual API call
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, content: newContent, isEdited: true } : msg
      ));
      showToast('Message edited', 'success');
    } catch (error) {
      console.error('Error editing message:', error);
      showToast('Failed to edit message', 'error');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      // Mock implementation - replace with actual API call
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      showToast('Message deleted', 'success');
    } catch (error) {
      console.error('Error deleting message:', error);
      showToast('Failed to delete message', 'error');
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      // Mock implementation - replace with actual API call
      setMessages(prev => prev.map(msg => {
        if (msg._id === messageId) {
          const reactions = msg.reactions || [];
          const existingReaction = reactions.find((r: any) => r.emoji === emoji);
          
          if (existingReaction) {
            // Toggle reaction
            return {
              ...msg,
              reactions: reactions.filter((r: any) => r.emoji !== emoji)
            };
          } else {
            // Add reaction
            return {
              ...msg,
              reactions: [...reactions, { emoji, count: 1, users: [user?._id] }]
            };
          }
        }
        return msg;
      }));
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleCreateGroup = async (name: string, description: string, memberIds: string[]) => {
    try {
      const response = await messageService.createGroupConversation(name, description, memberIds);
      showToast(`Group "${name}" created successfully!`, 'success');
      setShowCreateGroup(false);
      await loadConversations();
      
      // Auto-select the new group conversation
      const newConversation = response.data.data;
      setSelectedConversation(newConversation);
      setMessages([]);
      setActiveTab('conversations');
    } catch (error: any) {
      console.error('Error creating group:', error);
      const errorMessage = error?.response?.data?.error || 'Failed to create group';
      showToast(errorMessage, 'error');
    }
  };

  const handleSendVoiceMessage = async (audioBlob: Blob, duration: number) => {
    try {
      const voiceMessage = `🎤 Voice message (${Math.floor(duration)}s)`;
      await handleSendMessage(voiceMessage, 'voice');
      setShowVoiceRecorder(false);
    } catch (error) {
      console.error('Error sending voice message:', error);
      showToast('Failed to send voice message', 'error');
    }
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('bg-yellow-200');
      setTimeout(() => messageElement.classList.remove('bg-yellow-200'), 2000);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const cleanQuery = query.startsWith('@') ? query.slice(1) : query;
      const response = await messageService.searchUsers(cleanQuery);
      // Filter out the current user from search results
      const filteredResults = (response.data.data || []).filter((searchUser: any) => searchUser._id !== user?._id);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    try {
      setSendingFriendRequest(true);
      await messageService.sendFriendRequest(userId, 'Hello! I would like to be your friend.');
      showToast('Friend request sent!', 'success');
      setSearchQuery('');
      setSearchResults([]);
      await loadFriendRequests();
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      const errorMessage = error?.response?.data?.error || 'Failed to send friend request. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setSendingFriendRequest(false);
    }
  };

  const sendFriendRequestByUsername = async (username: string) => {
    try {
      setSendingFriendRequest(true);
      await messageService.sendFriendRequestByUsername(username, 'Hello! I would like to be your friend.');
      showToast('Friend request sent!', 'success');
      setSearchQuery('');
      setSearchResults([]);
      await loadFriendRequests();
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      const errorMessage = error?.response?.data?.error || 'Failed to send friend request. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setSendingFriendRequest(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim() && !sendingFriendRequest) {
      if (searchResults.length > 0) {
        sendFriendRequest(searchResults[0]._id);
      } else {
        sendFriendRequestByUsername(searchQuery.trim());
      }
    }
  };

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      await messageService.handleFriendRequest(requestId, action);
      showToast(`Friend request ${action}ed successfully!`, 'success');
      await Promise.all([loadFriendRequests(), loadFriends()]);
    } catch (error: any) {
      console.error('Error handling friend request:', error);
      const errorMessage = error?.response?.data?.error || `Failed to ${action} friend request. Please try again.`;
      showToast(errorMessage, 'error');
    }
  };

  const handleCancelFriendRequest = async (requestId: string, recipientName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancel Friend Request',
      message: `Are you sure you want to cancel your friend request to ${recipientName}?`,
      onConfirm: async () => {
        try {
          await messageService.cancelFriendRequest(requestId);
          showToast('Friend request canceled successfully!', 'success');
          await loadFriendRequests();
        } catch (error: any) {
          console.error('Error canceling friend request:', error);
          const errorMessage = error?.response?.data?.error || 'Failed to cancel friend request. Please try again.';
          showToast(errorMessage, 'error');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const startConversation = async (friendId: string) => {
    try {
      console.log('Starting conversation with friend ID:', friendId);
      
      const existingConversation = conversations.find(conv => {
        const otherUser = getOtherParticipant(conv);
        return otherUser && otherUser._id === friendId;
      });

      if (existingConversation) {
        console.log('Found existing conversation:', existingConversation._id);
        setSelectedConversation(existingConversation);
        const response = await messageService.getConversationMessages(existingConversation._id);
        setMessages(response.data.data || []);
        setActiveTab('conversations');
        showToast('Switched to existing conversation', 'success');
        return;
      }

      showToast('Creating conversation...', 'info');
      
      const response = await messageService.createConversation(friendId);
      console.log('Conversation response:', response);
      
      const newConversation = response.data.data;
      setSelectedConversation(newConversation);
      setMessages([]);
      await loadConversations();
      setActiveTab('conversations');
      
      showToast('Conversation started successfully!', 'success');
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      const errorMessage = error?.response?.data?.error || 'Failed to start conversation. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await messageService.markNotificationAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification._id);
    }
    
    if (notification.type === 'friend_request') {
      setActiveTab('friends');
    } else if (notification.type === 'message_received') {
      setActiveTab('conversations');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const getOtherParticipant = (conversation: any) => {
    if (!conversation || !conversation.participants || !Array.isArray(conversation.participants)) {
      return null;
    }
    return conversation.participants.find((p: any) => p && p._id !== user?._id) || conversation.participants[0] || null;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-fantasy font-bold text-slate-900">Messages</h1>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('conversations')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'conversations'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Conversations
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'friends'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Friends
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-lg transition-colors relative ${
              activeTab === 'notifications'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area - Flexible height */}
      <div className="flex-1 flex bg-slate-50 overflow-hidden">
        {activeTab === 'conversations' && (
          <div className="flex h-full w-full">
            {/* Conversations List - Fixed width sidebar */}
            <div className="w-80 border-r border-slate-200 flex flex-col bg-white">
              <div className="flex-shrink-0 p-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Conversations</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => {
                  const isGroup = conversation.isGroup;
                  const otherUser = !isGroup ? getOtherParticipant(conversation) : null;
                  
                  // Skip rendering if we can't get the other user for non-group conversations
                  if (!isGroup && !otherUser) {
                    return null;
                  }
                  
                  const displayName = isGroup ? (conversation.groupName || 'Unnamed Group') : `${otherUser?.firstName || 'Unknown'} ${otherUser?.lastName || 'User'}`;
                  const displaySubtext = isGroup ? `${conversation.participants?.length || 0} members` : `@${otherUser?.username || 'unknown'}`;
                  
                  return (
                    <div
                      key={conversation._id}
                      onClick={() => selectConversation(conversation)}
                      className={`p-4 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedConversation?._id === conversation._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            {isGroup ? (
                              <span className="text-white font-semibold text-lg">👥</span>
                            ) : otherUser?.avatar ? (
                              <img
                                src={getAvatarUrl(otherUser.avatar) || ''}
                                alt={otherUser.username || 'User'}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-semibold">
                                {otherUser?.firstName?.[0] || '?'}{otherUser?.lastName?.[0] || '?'}
                              </span>
                            )}
                          </div>
                          {!isGroup && otherUser && (
                            <div className="absolute -bottom-1 -right-1">
                              <OnlineStatus 
                                isOnline={onlineUsers.has(otherUser._id)}
                                size="small"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-slate-900 font-medium truncate">
                              {displayName}
                            </h3>
                            {isGroup && (
                              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                                GROUP
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 text-sm truncate">{displaySubtext}</p>
                          {conversation.lastMessage && (
                            <p className="text-slate-500 text-sm truncate mt-1">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <div className="text-slate-500 text-xs">
                            {formatTime(conversation.lastActivity)}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {conversations.length === 0 && (
                  <div className="p-8 text-center text-slate-600">
                    <div className="text-4xl mb-4">💬</div>
                    <p>No conversations yet</p>
                    <p className="text-sm mt-2">Add friends to start chatting!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area - Flexible width */}
            <div className="flex-1 flex flex-col bg-white">
              {selectedConversation ? (
                <>
                  {/* Chat Header - Fixed at top */}
                  <div className="flex-shrink-0 p-4 border-b border-slate-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            {selectedConversation.isGroup ? (
                              <span className="text-white font-semibold text-lg">👥</span>
                            ) : (() => {
                              const otherUser = getOtherParticipant(selectedConversation);
                              return otherUser?.avatar ? (
                                <img
                                  src={getAvatarUrl(otherUser.avatar) || ''}
                                  alt={otherUser.username || 'User'}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-semibold">
                                  {otherUser?.firstName?.[0] || '?'}
                                  {otherUser?.lastName?.[0] || '?'}
                                </span>
                              );
                            })()}
                          </div>
                          {!selectedConversation.isGroup && (() => {
                            const otherUser = getOtherParticipant(selectedConversation);
                            return otherUser && (
                              <div className="absolute -bottom-1 -right-1">
                                <OnlineStatus 
                                  isOnline={onlineUsers.has(otherUser._id)}
                                  size="small"
                                />
                              </div>
                            );
                          })()}
                        </div>
                        <div>
                          <h3 className="text-slate-900 font-medium">
                            {selectedConversation.isGroup 
                              ? (selectedConversation.groupName || 'Unnamed Group')
                              : (() => {
                                  const otherUser = getOtherParticipant(selectedConversation);
                                  return `${otherUser?.firstName || 'Unknown'} ${otherUser?.lastName || 'User'}`;
                                })()
                            }
                          </h3>
                          <p className="text-slate-600 text-sm">
                            {selectedConversation.isGroup 
                              ? `${selectedConversation.participants?.length || 0} members`
                              : (() => {
                                  const otherUser = getOtherParticipant(selectedConversation);
                                  return `@${otherUser?.username || 'unknown'}`;
                                })()
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Typing Indicator */}
                    {typingUsers.length > 0 && (
                      <div className="mt-2">
                        <TypingIndicator users={typingUsers} />
                      </div>
                    )}
                  </div>

                  {/* Messages Area - Scrollable with proper height */}
                  <div 
                    className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50" 
                    style={{ 
                      height: 'calc(100vh - 320px)',
                      minHeight: '300px'
                    }}
                  >
                    {messages.map((message, index) => {
                      const isOwn = message.sender._id === user?._id;
                      const currentDate = new Date(message.createdAt).toDateString();
                      const previousDate = index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null;
                      const showDateSeparator = index === 0 || currentDate !== previousDate;

                      return (
                        <React.Fragment key={message._id}>
                          {showDateSeparator && (
                            <DateSeparator date={message.createdAt} />
                          )}
                          <MessageBubble
                            message={message}
                            isOwn={isOwn}
                            onReact={handleReaction}
                            onEdit={handleEditMessage}
                            onDelete={handleDeleteMessage}
                            showAvatar={
                              selectedConversation?.isGroup && 
                              !isOwn && 
                              (index === 0 || messages[index - 1].sender._id !== message.sender._id)
                            }
                          />
                        </React.Fragment>
                      );
                    })}
                    {messages.length === 0 && (
                      <div className="text-center text-slate-500 py-16">
                        <div className="text-6xl mb-4">👋</div>
                        <p className="text-lg">Start your conversation!</p>
                        <p className="text-sm mt-2">Send a message to get things going</p>
                      </div>
                    )}
                  </div>

                  {/* Message Input - Fixed at bottom */}
                  <div className="flex-shrink-0 p-4 border-t border-slate-200 bg-white">
                    <ChatInput
                      onSendMessage={handleSendMessage}
                      placeholder="Type a message..."
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-white">
                  <div className="text-center text-slate-600">
                    <div className="text-8xl mb-6">💬</div>
                    <p className="text-2xl mb-2 font-semibold">Select a conversation</p>
                    <p className="text-lg">Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="flex-1 p-6 bg-white">
            <div className="space-y-6">
              {/* Header with Create Group Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900">Add Friends</h2>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium">Create Group</span>
                </button>
              </div>
              
              {/* Search Users */}
              <div>
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchUsers(e.target.value);
                    }}
                    onKeyPress={handleSearchKeyPress}
                    placeholder="Search by @username..."
                    className="flex-1 bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchQuery.trim() && (
                    <button
                      onClick={() => {
                        if (!sendingFriendRequest) {
                          if (searchResults.length > 0) {
                            sendFriendRequest(searchResults[0]._id);
                          } else {
                            sendFriendRequestByUsername(searchQuery.trim());
                          }
                        }
                      }}
                      disabled={sendingFriendRequest}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
                    >
                      {sendingFriendRequest ? 'Adding...' : 'Add Friend'}
                    </button>
                  )}
                </div>
                {searchResults.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 shadow-sm">
                    {searchResults.filter(user => user && user._id).map((user) => (
                      <div key={user._id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            {user.avatar ? (
                              <img
                                src={getAvatarUrl(user.avatar) || ''}
                                alt={user.username || 'User'}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white text-sm">
                                {user.firstName?.[0] || '?'}{user.lastName?.[0] || '?'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-slate-900 font-medium">
                              {user.firstName || 'Unknown'} {user.lastName || 'User'}
                            </p>
                            <p className="text-slate-500 text-sm">@{user.username || 'unknown'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => sendFriendRequest(user._id)}
                          disabled={sendingFriendRequest}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-1 rounded text-sm transition-colors"
                        >
                          {sendingFriendRequest ? 'Sending...' : 'Add Friend'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Friend Requests */}
              {(friendRequests.received.length > 0 || friendRequests.sent.length > 0) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Friend Requests</h3>
                  {friendRequests.received.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-slate-900 mb-2">Received</h4>
                      <div className="space-y-2">
                        {friendRequests.received.filter(request => request && request.sender).map((request) => (
                          <div key={request._id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                {request.sender?.avatar ? (
                                  <img
                                    src={getAvatarUrl(request.sender.avatar) || ''}
                                    alt={request.sender.username || 'User'}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-white text-sm">
                                    {request.sender?.firstName?.[0] || '?'}{request.sender?.lastName?.[0] || '?'}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="text-slate-900 font-medium">
                                  {request.sender?.firstName || 'Unknown'} {request.sender?.lastName || 'User'}
                                </p>
                                <p className="text-slate-600 text-sm">@{request.sender?.username || 'unknown'}</p>
                                {request.message && (
                                  <p className="text-slate-300 text-sm mt-1">"{request.message}"</p>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleFriendRequest(request._id, 'accept')}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleFriendRequest(request._id, 'decline')}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {friendRequests.sent.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-slate-900 mb-2">Sent</h4>
                      <div className="space-y-2">
                        {friendRequests.sent.filter(request => request && request.recipient).map((request) => (
                          <div key={request._id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                {request.recipient?.avatar ? (
                                  <img
                                    src={getAvatarUrl(request.recipient.avatar) || ''}
                                    alt={request.recipient.username || 'User'}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-white text-sm">
                                    {request.recipient?.firstName?.[0] || '?'}{request.recipient?.lastName?.[0] || '?'}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="text-slate-900 font-medium">
                                  {request.recipient?.firstName || 'Unknown'} {request.recipient?.lastName || 'User'}
                                </p>
                                <p className="text-slate-500 text-sm">@{request.recipient?.username || 'unknown'}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-yellow-600 text-sm font-medium">Pending</span>
                              <button
                                onClick={() => handleCancelFriendRequest(
                                  request._id, 
                                  `${request.recipient?.firstName || 'Unknown'} ${request.recipient?.lastName || 'User'}`
                                )}
                                className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Friends List */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Friends ({friends.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {friends.filter(friend => friend && friend._id).map((friend) => (
                    <div key={friend._id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            {friend.avatar ? (
                              <img
                                src={getAvatarUrl(friend.avatar) || ''}
                                alt={friend.username || 'User'}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-semibold">
                                {friend.firstName?.[0] || '?'}{friend.lastName?.[0] || '?'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-slate-900 font-medium">
                              {friend.firstName || 'Unknown'} {friend.lastName || 'User'}
                            </p>
                            <p className="text-slate-500 text-sm">@{friend.username || 'unknown'}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Message button clicked for friend:', friend._id);
                              startConversation(friend._id);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Message
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeFriend(friend._id, `${friend.firstName || 'Unknown'} ${friend.lastName || 'User'}`);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                            title="Remove friend"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {friends.length === 0 && (
                  <div className="text-center text-slate-400 py-8">
                    <p>No friends yet. Start by adding some friends above!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={async () => {
                      await messageService.markAllNotificationsAsRead();
                      await loadNotifications();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
                  >
                    Mark All Read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
                        try {
                          await messageService.clearAllNotifications();
                          await loadNotifications();
                          showToast('All notifications cleared', 'success');
                        } catch (error) {
                          console.error('Error clearing notifications:', error);
                          showToast('Failed to clear notifications', 'error');
                        }
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                  onMarkRead={() => markNotificationAsRead(notification._id)}
                />
              ))}
              {notifications.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <div className="text-6xl mb-4">🔔</div>
                  <p className="text-xl mb-2">No notifications</p>
                  <p>You're all caught up!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          toastMessage.type === 'success' ? 'bg-green-600 text-white' :
          toastMessage.type === 'error' ? 'bg-red-600 text-white' :
          'bg-blue-600 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span>{toastMessage.message}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Create Group Chat Modal */}
      {showCreateGroup && (
        <CreateGroupChat
          friends={friends}
          onCreateGroup={handleCreateGroup}
          onCancel={() => setShowCreateGroup(false)}
        />
      )}

      {/* Message Search Modal */}
      {showMessageSearch && selectedConversation && (
        <MessageSearch
          conversationId={selectedConversation._id}
          onMessageSelect={scrollToMessage}
          onClose={() => setShowMessageSearch(false)}
        />
      )}

      {/* Voice Recorder Modal */}
      {showVoiceRecorder && (
        <VoiceRecorder
          onSendVoiceMessage={handleSendVoiceMessage}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Remove Friend"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default MessagesPage;