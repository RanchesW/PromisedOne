import React, { useState, useEffect } from 'react';
import { formatTime, formatDate } from '../../utils/dateUtils';

interface MessageSearchProps {
  conversationId: string;
  onClose: () => void;
  onMessageSelect: (messageId: string) => void;
}

interface SearchResult {
  _id: string;
  content: string;
  sender: {
    firstName: string;
    lastName: string;
    username: string;
  };
  createdAt: string;
}

const MessageSearch: React.FC<MessageSearchProps> = ({
  conversationId,
  onClose,
  onMessageSelect
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchMessages = async () => {
      setLoading(true);
      try {
        // Mock search - replace with actual API call
        const mockResults: SearchResult[] = [
          {
            _id: '1',
            content: `Sample message containing "${query}"`,
            sender: { firstName: 'John', lastName: 'Doe', username: 'johndoe' },
            createdAt: new Date().toISOString()
          }
        ];
        setResults(mockResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchMessages, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, conversationId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      onMessageSelect(results[selectedIndex]._id);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-400 text-black rounded px-1">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="absolute top-0 left-0 right-0 bg-slate-800 border-b border-slate-700 z-50">
      <div className="p-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search messages..."
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            {loading && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="mt-4 max-h-96 overflow-y-auto space-y-2">
            {results.map((result, index) => (
              <div
                key={result._id}
                onClick={() => {
                  onMessageSelect(result._id);
                  onClose();
                }}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">
                        {result.sender.firstName} {result.sender.lastName}
                      </span>
                      <span className="text-xs opacity-75">
                        @{result.sender.username}
                      </span>
                    </div>
                    <p className="text-sm">
                      {highlightText(result.content, query)}
                    </p>
                  </div>
                  <div className="text-xs opacity-75 ml-2">
                    <div>{formatDate(result.createdAt)}</div>
                    <div>{formatTime(result.createdAt)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {query.trim().length >= 2 && !loading && results.length === 0 && (
          <div className="mt-4 text-center text-slate-400 py-8">
            <p>No messages found for "{query}"</p>
          </div>
        )}

        {query.trim().length > 0 && query.trim().length < 2 && (
          <div className="mt-4 text-center text-slate-400 py-4">
            <p>Type at least 2 characters to search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageSearch;
