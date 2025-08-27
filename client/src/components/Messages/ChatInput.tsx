import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (content: string, type?: 'text') => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message..."
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-slate-200 bg-white">
      <div className="flex items-start space-x-2">
        {/* Message Input */}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setIsTyping(e.target.value.length > 0);
            }}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 placeholder-slate-500"
            style={{
              minHeight: '40px',
              maxHeight: '120px',
              overflowY: message.split('\n').length > 3 ? 'scroll' : 'hidden'
            }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white p-3 rounded-lg transition-colors flex items-center justify-center"
          title="Send message"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="mt-2 text-xs text-slate-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      )}
    </div>
  );
};

export default ChatInput;
