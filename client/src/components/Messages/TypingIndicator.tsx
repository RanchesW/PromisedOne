import React, { useEffect, useState } from 'react';

interface TypingIndicatorProps {
  users: Array<{ id: string; name: string }>;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (users.length === 0) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [users.length]);

  if (users.length === 0) return null;

  const displayText = () => {
    if (users.length === 1) {
      return `${users[0].name} is typing${dots}`;
    } else if (users.length === 2) {
      return `${users[0].name} and ${users[1].name} are typing${dots}`;
    } else {
      return `${users.length} people are typing${dots}`;
    }
  };

  return (
    <div className="px-4 py-2 text-slate-400 text-sm italic animate-pulse">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span>{displayText()}</span>
      </div>
    </div>
  );
};

export default TypingIndicator;
