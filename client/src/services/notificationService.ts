import { messageService } from './messageService';

export interface NotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category: 'social' | 'booking' | 'system' | 'game' | 'payment';
  relatedId?: string;
  actionUrl?: string;
}

class NotificationService {
  // Send notification when a booking is confirmed
  async sendBookingConfirmedNotification(userId: string, bookingId: string, gameTitle: string) {
    try {
      // This would be handled server-side, but for demo purposes:
      console.log('Booking confirmed notification would be sent to:', userId);
    } catch (error) {
      console.error('Error sending booking notification:', error);
    }
  }

  // Send notification when a booking is cancelled
  async sendBookingCancelledNotification(userId: string, bookingId: string, gameTitle: string) {
    try {
      console.log('Booking cancelled notification would be sent to:', userId);
    } catch (error) {
      console.error('Error sending booking cancellation notification:', error);
    }
  }

  // Send notification when a user receives a review
  async sendReviewReceivedNotification(userId: string, reviewId: string, reviewerName: string, rating: number) {
    try {
      console.log('Review received notification would be sent to:', userId);
    } catch (error) {
      console.error('Error sending review notification:', error);
    }
  }

  // Send notification when a game is updated
  async sendGameUpdateNotification(userIds: string[], gameId: string, gameTitle: string, updateType: string) {
    try {
      console.log('Game update notification would be sent to:', userIds.length, 'users');
    } catch (error) {
      console.error('Error sending game update notification:', error);
    }
  }

  // Send notification when a friend request is received
  async sendFriendRequestNotification(userId: string, requestId: string, senderName: string) {
    try {
      console.log('Friend request notification would be sent to:', userId);
    } catch (error) {
      console.error('Error sending friend request notification:', error);
    }
  }

  // Send notification when a friend request is accepted
  async sendFriendAcceptedNotification(userId: string, friendshipId: string, accepterName: string) {
    try {
      console.log('Friend accepted notification would be sent to:', userId);
    } catch (error) {
      console.error('Error sending friend accepted notification:', error);
    }
  }

  // Send welcome notification to new users
  async sendWelcomeNotification(userId: string) {
    try {
      console.log('Welcome notification would be sent to:', userId);
    } catch (error) {
      console.error('Error sending welcome notification:', error);
    }
  }

  // Send system announcement (admin only)
  async sendSystemAnnouncement(data: {
    title: string;
    message: string;
    type?: string;
    priority?: string;
    targetUsers?: string[];
    expiresAt?: string;
  }) {
    try {
      return await messageService.createSystemNotification(data);
    } catch (error) {
      console.error('Error sending system announcement:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
