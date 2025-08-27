import React, { useState } from 'react';
import { messageService } from '../../services/messageService';

const SystemNotifications: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'system_announcement',
    priority: 'medium',
    expiresAt: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await messageService.createSystemNotification({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        priority: formData.priority,
        expiresAt: formData.expiresAt || undefined
      });
      
      setSuccess(true);
      setFormData({
        title: '',
        message: '',
        type: 'system_announcement',
        priority: 'medium',
        expiresAt: ''
      });
    } catch (error) {
      setError('Failed to send notification. Please try again.');
      console.error('Error sending notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Send System Notification</h2>
        
        {success && (
          <div className="bg-green-600 text-white p-4 rounded-lg mb-6">
            Notification sent successfully to all users!
          </div>
        )}
        
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notification title..."
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notification message..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-300 mb-2">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="system_announcement">System Announcement</option>
                <option value="maintenance">Maintenance</option>
                <option value="event_notification">Event Notification</option>
                <option value="game_update">Game Update</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-slate-300 mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="expiresAt" className="block text-sm font-medium text-slate-300 mb-2">
              Expires At (Optional)
            </label>
            <input
              type="datetime-local"
              id="expiresAt"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleChange}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-slate-400 text-sm mt-1">
              If set, the notification will automatically expire and be removed at this time.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.title || !formData.message}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Sending...' : 'Send Notification'}
          </button>
        </form>

        <div className="mt-8 bg-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Quick Templates</h3>
          <div className="space-y-2">
            <button
              onClick={() => setFormData({
                title: 'Scheduled Maintenance',
                message: 'KazRPG will be undergoing scheduled maintenance on [DATE] from [TIME] to [TIME]. During this time, the platform may be temporarily unavailable.',
                type: 'maintenance',
                priority: 'high',
                expiresAt: ''
              })}
              className="w-full text-left bg-slate-600 hover:bg-slate-500 text-white p-3 rounded text-sm transition-colors"
            >
              Maintenance Notification
            </button>
            <button
              onClick={() => setFormData({
                title: 'New Feature Available',
                message: 'We\'ve just released a new feature that enhances your gaming experience. Check it out in your dashboard!',
                type: 'system_announcement',
                priority: 'medium',
                expiresAt: ''
              })}
              className="w-full text-left bg-slate-600 hover:bg-slate-500 text-white p-3 rounded text-sm transition-colors"
            >
              Feature Announcement
            </button>
            <button
              onClick={() => setFormData({
                title: 'Special Event This Weekend',
                message: 'Join us for a special community event this weekend! Extra rewards and exclusive games available.',
                type: 'event_notification',
                priority: 'medium',
                expiresAt: ''
              })}
              className="w-full text-left bg-slate-600 hover:bg-slate-500 text-white p-3 rounded text-sm transition-colors"
            >
              Event Notification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemNotifications;
