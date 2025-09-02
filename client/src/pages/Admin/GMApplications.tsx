import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';

interface GMApplication {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  pronouns?: string[];
  identityTags?: string[];
  gameStyles?: string[];
  themes?: string[];
  timezone?: string;
  preferences?: {
    systems?: string[];
    experienceLevel?: string;
    platforms?: string[];
  };
  stats?: {
    gamesPlayed: number;
    gamesHosted: number;
    averageRating: number;
    totalReviews: number;
  };
  pricing?: {
    sessionPrice: number;
    currency: string;
  };
  dmApplication: {
    experience: string;
    preferredSystems: string[];
    availability: string;
    sampleGameDescription: string;
    references?: string;
    submittedAt: string;
    status: string;
  };
}

const GMApplications: React.FC = () => {
  const [applications, setApplications] = useState<GMApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<GMApplication | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://promisedone.onrender.com/api'}/admin/users?role=gm_applicant`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.data?.users || []);
      }
    } catch (error) {
      console.error('Error loading GM applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://promisedone.onrender.com/api'}/admin/gm-applications/${userId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        loadApplications();
        setSelectedApplication(null);
      }
    } catch (error) {
      console.error(`Error ${action}ing application:`, error);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">GM Applications</h1>
        <p className="text-gray-600">Review pending Game Master applications</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No pending GM applications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {application.firstName && application.lastName 
                      ? `${application.firstName} ${application.lastName}`
                      : application.username}
                  </h3>
                  <p className="text-sm text-gray-600">{application.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Applied: {application.dmApplication?.submittedAt ? new Date(application.dmApplication.submittedAt).toLocaleDateString() : 'N/A'}
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {application.dmApplication?.status || 'pending'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setSelectedApplication(application)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Review
                  </button>
                  <button
                    onClick={() => handleApplicationAction(application._id, 'approve')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleApplicationAction(application._id, 'reject')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-4">
                {selectedApplication.avatar ? (
                  <img
                    src={selectedApplication.avatar.startsWith('http') 
                      ? selectedApplication.avatar 
                      : `${process.env.REACT_APP_API_URL || 'https://promisedone.onrender.com'}/uploads/avatars/${selectedApplication.avatar}`}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {selectedApplication.firstName?.[0] || selectedApplication.username?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedApplication.firstName && selectedApplication.lastName 
                      ? `${selectedApplication.firstName} ${selectedApplication.lastName}`
                      : selectedApplication.username}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedApplication.email}</p>
                  <p className="text-xs text-gray-500">@{selectedApplication.username}</p>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h4>
                
                {/* Bio */}
                {selectedApplication.bio && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{selectedApplication.bio}</p>
                  </div>
                )}

                {/* Pronouns */}
                {selectedApplication.pronouns && selectedApplication.pronouns.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pronouns</label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedApplication.pronouns.map((pronoun, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {pronoun}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Identity Tags */}
                {selectedApplication.identityTags && selectedApplication.identityTags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Identity Tags</label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedApplication.identityTags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timezone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApplication.timezone || 'Not specified'}</p>
                </div>

                {/* Player Stats */}
                {selectedApplication.stats && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Player Statistics</label>
                    <div className="mt-1 bg-gray-50 p-3 rounded-md">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Games Played:</span>
                          <span className="ml-1 font-medium">{selectedApplication.stats.gamesPlayed}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Games Hosted:</span>
                          <span className="ml-1 font-medium">{selectedApplication.stats.gamesHosted}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Rating:</span>
                          <span className="ml-1 font-medium">{selectedApplication.stats.averageRating}/5</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Reviews:</span>
                          <span className="ml-1 font-medium">{selectedApplication.stats.totalReviews}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* GM Application Details */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">GM Application</h4>
                
                {selectedApplication.dmApplication ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">GM Experience</label>
                      <p className="mt-1 text-sm text-gray-900 bg-blue-50 p-3 rounded-md whitespace-pre-wrap">{selectedApplication.dmApplication.experience}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Preferred Systems</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedApplication.dmApplication.preferredSystems?.map((system, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {system}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Availability</label>
                      <p className="mt-1 text-sm text-gray-900 bg-green-50 p-3 rounded-md">{selectedApplication.dmApplication.availability}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sample Game/Scenario Description</label>
                      <p className="mt-1 text-sm text-gray-900 bg-yellow-50 p-3 rounded-md whitespace-pre-wrap">{selectedApplication.dmApplication.sampleGameDescription}</p>
                    </div>

                    {selectedApplication.dmApplication.references && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">References</label>
                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{selectedApplication.dmApplication.references}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Application Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedApplication.dmApplication.submittedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 bg-gray-50 p-6 rounded-md">
                    <p>No GM application data available</p>
                  </div>
                )}
              </div>

              {/* Gaming Preferences */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Gaming Profile</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Game Styles */}
                  {selectedApplication.gameStyles && selectedApplication.gameStyles.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Preferred Game Styles</label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedApplication.gameStyles.map((style, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {style.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Themes */}
                  {selectedApplication.themes && selectedApplication.themes.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Favorite Themes</label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedApplication.themes.map((theme, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                            {theme.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* System Preferences */}
                  {selectedApplication.preferences?.systems && selectedApplication.preferences.systems.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">System Preferences</label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedApplication.preferences.systems.map((system, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {system.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing */}
                {selectedApplication.pricing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Proposed Pricing</label>
                    <p className="mt-1 text-lg font-semibold text-green-600">
                      ${selectedApplication.pricing.sessionPrice} {selectedApplication.pricing.currency} per session
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleApplicationAction(selectedApplication._id, 'reject')}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                ❌ Reject
              </button>
              <button
                onClick={() => handleApplicationAction(selectedApplication._id, 'approve')}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                ✅ Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GMApplications;