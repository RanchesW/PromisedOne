import React from 'react';

interface OnlineStatusProps {
  isOnline: boolean;
  lastSeen?: string;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const OnlineStatus: React.FC<OnlineStatusProps> = ({
  isOnline,
  lastSeen,
  size = 'small',
  showText = false
}) => {
  const sizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  const formatLastSeen = (lastSeenDate: string) => {
    const date = new Date(lastSeenDate);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Active now';
    if (diffMinutes < 60) return `Active ${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Active ${diffDays}d ago`;
    
    return `Last seen ${date.toLocaleDateString()}`;
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full transition-colors ${
            isOnline ? 'bg-green-500' : 'bg-gray-500'
          }`}
        >
          {isOnline && (
            <div className={`${sizeClasses[size]} rounded-full bg-green-500 animate-ping absolute top-0 left-0 opacity-75`}></div>
          )}
        </div>
      </div>
      
      {showText && (
        <span className={`text-sm ${isOnline ? 'text-green-400' : 'text-gray-400'}`}>
          {isOnline ? 'Online' : lastSeen ? formatLastSeen(lastSeen) : 'Offline'}
        </span>
      )}
    </div>
  );
};

export default OnlineStatus;
