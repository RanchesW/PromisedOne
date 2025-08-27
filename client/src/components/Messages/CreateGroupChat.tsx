import React, { useState } from 'react';
import { getAvatarUrl } from '../../services/api';

interface CreateGroupChatProps {
  friends: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar?: string;
  }>;
  onCreateGroup: (name: string, description: string, memberIds: string[]) => void;
  onCancel: () => void;
}

const CreateGroupChat: React.FC<CreateGroupChatProps> = ({
  friends,
  onCreateGroup,
  onCancel
}) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreate = () => {
    if (groupName.trim() && selectedMembers.length > 0) {
      onCreateGroup(groupName.trim(), groupDescription.trim(), selectedMembers);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Create Group Chat</h2>
        
        {/* Group Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Group Name *
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name..."
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-500"
          />
        </div>

        {/* Group Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            placeholder="What's this group about?"
            rows={2}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder-slate-500"
          />
        </div>

        {/* Member Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Add Members ({selectedMembers.length} selected)
          </label>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {friends.map((friend) => (
              <div
                key={friend._id}
                onClick={() => toggleMember(friend._id)}
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedMembers.includes(friend._id)
                    ? 'bg-blue-100 border-2 border-blue-500 text-blue-900'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  {friend.avatar ? (
                    <img
                      src={getAvatarUrl(friend.avatar) || ''}
                      alt={friend.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-semibold">
                      {friend.firstName[0]}{friend.lastName[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {friend.firstName} {friend.lastName}
                  </p>
                  <p className="text-sm opacity-75">@{friend.username}</p>
                </div>
                {selectedMembers.includes(friend._id) && (
                  <div className="text-blue-600 font-bold">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedMembers.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupChat;
