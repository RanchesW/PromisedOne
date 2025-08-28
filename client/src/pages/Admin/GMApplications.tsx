import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';

interface GMApplication {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
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
                    {application.user.firstName && application.user.lastName 
                      ? `${application.user.firstName} ${application.user.lastName}`
                      : application.user.username}
                  </h3>
                  <p className="text-sm text-gray-600">{application.user.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Applied: {new Date(application.dmApplication.submittedAt).toLocaleDateString()}
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {application.dmApplication.status}
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">GM Application Details</h3>
              <p className="text-sm text-gray-600">
                {selectedApplication.user.firstName && selectedApplication.user.lastName 
                  ? `${selectedApplication.user.firstName} ${selectedApplication.user.lastName}`
                  : selectedApplication.user.username}
              </p>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Experience</label>
                <p className="mt-1 text-sm text-gray-900">{selectedApplication.dmApplication.experience}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Systems</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedApplication.dmApplication.preferredSystems.map((system, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {system}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Availability</label>
                <p className="mt-1 text-sm text-gray-900">{selectedApplication.dmApplication.availability}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sample Game Description</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedApplication.dmApplication.sampleGameDescription}</p>
              </div>
              {selectedApplication.dmApplication.references && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">References</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApplication.dmApplication.references}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
              <button
                onClick={() => handleApplicationAction(selectedApplication._id, 'reject')}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reject
              </button>
              <button
                onClick={() => handleApplicationAction(selectedApplication._id, 'approve')}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GMApplications;