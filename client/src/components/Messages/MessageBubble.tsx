import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '../../utils/dateUtils';
import { getAvatarUrl } from '../../services/api';

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
  showAvatar?: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  onEdit,
  onDelete,
  onReact
}) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showReactions, setShowReactions] = useState(false);

  const reactions = ['👍', '😄', '❤️', '😮', '😢', '😡'];

  const handleEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message._id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleReaction = (emoji: string) => {
    if (onReact) {
      onReact(message._id, emoji);
    }
    setShowReactions(false);
  };

  const handleProfileClick = () => {
    if (message.sender?._id) {
      navigate(`/profile/${message.sender._id}`);
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {showAvatar && !isOwn && (
          <button
            onClick={handleProfileClick}
            className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer"
            title={`View ${message.sender.firstName || message.sender.username}'s profile`}
          >
            {message.sender.avatar ? (
              <img
                src={getAvatarUrl(message.sender.avatar) || ''}
                alt={message.sender.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-semibold">
                {message.sender.firstName?.[0]}{message.sender.lastName?.[0]}
              </span>
            )}
          </button>
        )}
        
        <div className="relative">
          <div
            className={`px-4 py-2 rounded-lg relative ${
              isOwn
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-900 shadow-sm'
            }`}
          >
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
                  className="w-full bg-transparent border-b border-gray-400 text-white focus:outline-none"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleEdit}
                    className="text-xs bg-green-600 px-2 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-xs bg-gray-600 px-2 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p>{message.content}</p>
                {message.isEdited && (
                  <span className="text-xs opacity-75 italic">(edited)</span>
                )}
                
                {/* Message Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {message.reactions.map((reaction: any, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-1 bg-slate-600 rounded-full px-2 py-1 text-xs"
                      >
                        <span>{reaction.emoji}</span>
                        <span>{reaction.count}</span>
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs font-medium text-slate-600">
              {formatTime(message.createdAt)}
              {isOwn && (
                <>
                  {message.isRead && <span className="ml-2 text-blue-500">Read</span>}
                  {!message.isRead && message.isDelivered && <span className="ml-2 text-gray-500">Delivered</span>}
                  {!message.isRead && !message.isDelivered && <span className="ml-2 text-gray-500">Sent</span>}
                </>
              )}
            </p>
            
            {/* Message Actions */}
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 ${isOwn ? 'order-first' : ''}`}>
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="text-xs text-gray-400 hover:text-white"
                title="Add reaction"
              >
                😊
              </button>
              {isOwn && onEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-gray-400 hover:text-white"
                  title="Edit message"
                >
                  ✏️
                </button>
              )}
              {isOwn && onDelete && (
                <button
                  onClick={() => onDelete(message._id)}
                  className="text-xs text-gray-400 hover:text-red-400"
                  title="Delete message"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
          
          {/* Reaction Picker */}
          {showReactions && (
            <div className="absolute bottom-full mb-2 bg-slate-700 rounded-lg p-2 shadow-lg z-10">
              <div className="flex space-x-1">
                {reactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="hover:bg-slate-600 p-1 rounded text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
