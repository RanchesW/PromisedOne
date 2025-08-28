import React, { useState, useEffect } from 'react';
import { CogIcon, ServerIcon, ShieldCheckIcon, BellIcon } from '@heroicons/react/24/outline';

interface PlatformSettings {
  siteName: string;
  description: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxGamesPerUser: number;
  sessionDuration: number;
  autoApproveGMs: boolean;
  emailNotifications: boolean;
  systemNotifications: boolean;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings>({
    siteName: 'KazRPG',
    description: 'Connect with Game Masters and join amazing RPG sessions',
    maintenanceMode: false,
    registrationEnabled: true,
    maxGamesPerUser: 5,
    sessionDuration: 240,
    autoApproveGMs: false,
    emailNotifications: true,
    systemNotifications: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://promisedone.onrender.com/api'}/admin/settings`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings({ ...settings, ...data.data });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://promisedone.onrender.com/api'}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof PlatformSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-600">Configure platform settings and preferences</p>
      </div>

      {message && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <CogIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                id="siteName"
                value={settings.siteName}
                onChange={(e) => updateSetting('siteName', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="maxGamesPerUser" className="block text-sm font-medium text-gray-700 mb-2">
                Max Games Per User
              </label>
              <input
                type="number"
                id="maxGamesPerUser"
                min="1"
                max="20"
                value={settings.maxGamesPerUser}
                onChange={(e) => updateSetting('maxGamesPerUser', parseInt(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Site Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={settings.description}
                onChange={(e) => updateSetting('description', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="sessionDuration" className="block text-sm font-medium text-gray-700 mb-2">
                Default Session Duration (minutes)
              </label>
              <input
                type="number"
                id="sessionDuration"
                min="60"
                max="480"
                step="30"
                value={settings.sessionDuration}
                onChange={(e) => updateSetting('sessionDuration', parseInt(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <ServerIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="maintenanceMode" className="block text-sm font-medium text-gray-700">
                  Maintenance Mode
                </label>
                <p className="text-sm text-gray-500">
                  When enabled, only admins can access the platform
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="registrationEnabled" className="block text-sm font-medium text-gray-700">
                  Registration Enabled
                </label>
                <p className="text-sm text-gray-500">
                  Allow new users to register accounts
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  id="registrationEnabled"
                  checked={settings.registrationEnabled}
                  onChange={(e) => updateSetting('registrationEnabled', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">User Management</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="autoApproveGMs" className="block text-sm font-medium text-gray-700">
                  Auto-approve GM Applications
                </label>
                <p className="text-sm text-gray-500">
                  Automatically approve GM applications without manual review
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  id="autoApproveGMs"
                  checked={settings.autoApproveGMs}
                  onChange={(e) => updateSetting('autoApproveGMs', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <BellIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="emailNotifications" className="block text-sm font-medium text-gray-700">
                  Email Notifications
                </label>
                <p className="text-sm text-gray-500">
                  Send email notifications for important events
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="systemNotifications" className="block text-sm font-medium text-gray-700">
                  System Notifications
                </label>
                <p className="text-sm text-gray-500">
                  Enable in-app system notifications
                </p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  id="systemNotifications"
                  checked={settings.systemNotifications}
                  onChange={(e) => updateSetting('systemNotifications', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;