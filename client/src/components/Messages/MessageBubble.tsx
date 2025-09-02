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
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 160; // min-w-[160px]
    const menuHeight = 320; // approximate height based on menu items
    
    // Calculate position to keep menu within viewport
    let x = e.clientX;
    let y = e.clientY;
    
    // Adjust horizontal position if menu would go off-screen
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10; // 10px padding from edge
    }
    
    // Adjust vertical position if menu would go off-screen
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10; // 10px padding from edge
    }
    
    // Ensure minimum distance from edges
    x = Math.max(10, x);
    y = Math.max(10, y);
    
    setContextMenuPosition({ x, y });
    setShowContextMenu(true);
    setShowReactions(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowContextMenu(false);
  };

  const handleReply = () => {
    // TODO: Implement reply functionality
    setShowContextMenu(false);
  };

  const handleForward = () => {
    // TODO: Implement forward functionality
    setShowContextMenu(false);
  };

  const handlePin = () => {
    // TODO: Implement pin functionality
    setShowContextMenu(false);
  };

  const handleSelect = () => {
    // TODO: Implement select functionality
    setShowContextMenu(false);
  };

  return (
    <>
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}>
        <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : ''}`}>
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
              onContextMenu={handleContextMenu}
              className={`px-3 py-2 rounded-2xl relative cursor-pointer ${
                isOwn
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }`}
            >
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
                    className="w-full bg-transparent border-b border-gray-400 text-current focus:outline-none"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEdit}
                      className="text-xs bg-green-600 text-white px-2 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-xs bg-gray-600 text-white px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="break-words">{message.content}</p>
                  {message.isEdited && (
                    <span className="text-xs opacity-75 italic ml-2">(edited)</span>
                  )}
                  
                  {/* Message Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {message.reactions.map((reaction: any, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center space-x-1 bg-gray-200 rounded-full px-2 py-1 text-xs"
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
            
            {/* Timestamp and Status */}
            <div className={`flex items-center mt-1 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <span>
                {formatTime(message.createdAt)}
                {isOwn && (
                  <>
                    {message.isRead && <span className="ml-2 text-blue-500">Read</span>}
                    {!message.isRead && message.isDelivered && <span className="ml-2 text-gray-500">Delivered</span>}
                    {!message.isRead && !message.isDelivered && <span className="ml-2 text-gray-500">Sent</span>}
                  </>
                )}
              </span>
            </div>
            
            {/* Reaction Picker */}
            {showReactions && (
              <div className="absolute bottom-full mb-2 bg-white border border-gray-200 rounded-lg p-2 shadow-lg z-10">
                <div className="flex space-x-1">
                  {reactions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(emoji)}
                      className="hover:bg-gray-100 p-1 rounded text-lg transition-colors"
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

      {/* Context Menu */}
      {showContextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowContextMenu(false)}
          />
          <div
            className="fixed bg-gray-800 text-white rounded-lg shadow-lg py-2 z-50 min-w-[160px]"
            style={{
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
            }}
          >
            <button
              onClick={handleReply}
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
            >
              <span className="mr-3">↩️</span>
              Reply
            </button>
            <button
              onClick={() => {
                setIsEditing(true);
                setShowContextMenu(false);
              }}
              className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${!isOwn ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isOwn}
            >
              <span className="mr-3">✏️</span>
              Edit
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
            >
              <span className="mr-3">📋</span>
              Copy
            </button>
            <button
              onClick={handlePin}
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
            >
              <span className="mr-3">📌</span>
              Pin
            </button>
            <button
              onClick={handleForward}
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
            >
              <span className="mr-3">↗️</span>
              Forward
            </button>
            <button
              onClick={handleSelect}
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
            >
              <span className="mr-3">☑️</span>
              Select
            </button>
            {isOwn && onDelete && (
              <button
                onClick={() => {
                  onDelete(message._id);
                  setShowContextMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-red-600 transition-colors text-red-400"
              >
                <span className="mr-3">🗑️</span>
                Delete
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default MessageBubble;
