import React from 'react';
import { formatRelativeTime } from '../../utils/dateUtils';

interface NotificationItemProps {
  notification: {
    _id: string;
    type: string;
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    isRead: boolean;
    createdAt: string;
    metadata?: any;
  };
  onClick: () => void;
  onMarkRead?: () => void;
  onDismiss?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onMarkRead,
  onDismiss
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'friend_request': return '👤';
      case 'friend_accepted': return '✅';
      case 'message_received': return '💬';
      case 'game_invitation': return '🎲';
      case 'booking_confirmed': return '📅';
      case 'system': return '⚙️';
      case 'payment': return '💳';
      default: return '📢';
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-slate-300 bg-slate-50';
    }
  };

  const getCategoryColor = () => {
    switch (notification.category) {
      case 'social': return 'bg-blue-500';
      case 'game': return 'bg-green-500';
      case 'system': return 'bg-purple-500';
      case 'payment': return 'bg-yellow-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 border-l-4 ${
        notification.isRead ? 'bg-white border-gray-300' : getPriorityColor()
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Icon */}
          <div className="text-2xl flex-shrink-0 mt-1">
            {getIcon()}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`font-medium truncate ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                {notification.title}
              </h3>
              
              {/* Priority Badge */}
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  notification.priority === 'urgent'
                    ? 'bg-red-500 text-white'
                    : notification.priority === 'high'
                    ? 'bg-orange-500 text-white'
                    : notification.priority === 'medium'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-slate-500 text-white'
                }`}
              >
                {notification.priority.toUpperCase()}
              </span>
              
              {/* Category Badge */}
              <span className={`px-2 py-1 rounded text-xs text-white ${getCategoryColor()}`}>
                {notification.category}
              </span>
            </div>
            
            <p className={`text-sm mb-2 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {formatRelativeTime(notification.createdAt)}
              </p>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notification.isRead && onMarkRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead();
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700"
                    title="Mark as read"
                  >
                    Mark Read
                  </button>
                )}
                {onDismiss && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss();
                    }}
                    className="text-xs text-gray-500 hover:text-red-500"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Unread Indicator */}
        {!notification.isRead && (
          <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
