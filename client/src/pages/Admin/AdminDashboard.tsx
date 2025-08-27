import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import SystemNotifications from './SystemNotifications';
import { UserRole } from '@kazrpg/shared';

interface AdminStats {
  totalUsers: number;
  totalPlayers: number;
  totalGMs: number;
  pendingGMApplications: number;
  activeGames: number;
  monthlyRevenue: number;
}

interface Activity {
  id: string;
  type: string;
  message: string;
  details: any;
  timestamp: string;
  icon: string;
  color: string;
}

interface GMApplication {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  dmApplication: {
    experience: string;
    preferredSystems: string[];
    availability: string;
    sampleGameDescription: string;
    references?: string;
    submittedAt: string;
    status: 'pending' | 'approved' | 'rejected';
  };
}

interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  profile?: {
    timeZone?: string;
    languages?: string[];
    favoriteGenres?: string[];
    experienceLevel?: string;
  };
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [applications, setApplications] = useState<GMApplication[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'users' | 'games' | 'notifications'>('overview');
  const [selectedApplication, setSelectedApplication] = useState<GMApplication | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFilter, setUserFilter] = useState<string>('all');
  const [showApprovalModal, setShowApprovalModal] = useState<{ application: GMApplication; action: 'approve' | 'reject' } | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [showGameDeleteModal, setShowGameDeleteModal] = useState<any | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>('');
  const [deleteNotes, setDeleteNotes] = useState<string>('');

  useEffect(() => {
    if (activeTab === 'overview') {
      loadDashboardData();
    } else if (activeTab === 'applications') {
      loadGMApplications();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'games') {
      loadGames();
    }
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activityData] = await Promise.all([
        adminService.getStats(),
        adminService.getActivity(5, 1)
      ]);
      
      setStats(statsData);
      setActivities(activityData.activities);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGMApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/users?role=gm_applicant', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch GM applications');
      }

      const data = await response.json();
      setApplications(data.data.users);
    } catch (err) {
      setError('Failed to load GM applications');
      console.error('Error loading GM applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data.users);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGames = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/games', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }

      const data = await response.json();
      setGames(data.data.games);
    } catch (err) {
      setError('Failed to load games');
      console.error('Error loading games:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/gm-applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ action, notes })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} application`);
      }

      // Refresh applications list
      loadGMApplications();
      setSelectedApplication(null);
      setShowApprovalModal(null);
      setAdminNotes('');
      
      // Show success message
      alert(`Application ${action}${action.endsWith('e') ? 'd' : 'ed'} successfully! ${notes ? 'The user will receive your feedback.' : ''}`);
    } catch (err) {
      console.error(`Error ${action}ing application:`, err);
      alert(`Failed to ${action} application. Please try again.`);
    }
  };

  const openApprovalModal = (application: GMApplication, action: 'approve' | 'reject') => {
    setShowApprovalModal({ application, action });
    setAdminNotes('');
  };

  const closeApprovalModal = () => {
    setShowApprovalModal(null);
    setAdminNotes('');
  };

  const confirmApplicationAction = () => {
    if (showApprovalModal) {
      handleApplicationAction(showApprovalModal.application._id, showApprovalModal.action, adminNotes.trim() || undefined);
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      // Refresh users list
      loadUsers();
      setSelectedUser(null);
    } catch (err) {
      console.error('Error updating user role:', err);
      alert('Failed to update user role. Please try again.');
    }
  };

  const handleUserStatusToggle = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      // Refresh users list
      loadUsers();
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('Failed to update user status. Please try again.');
    }
  };

  const handleGameDelete = (game: any) => {
    setShowGameDeleteModal(game);
    setDeleteReason('');
    setDeleteNotes('');
  };

  const confirmGameDelete = async () => {
    if (!showGameDeleteModal || !deleteReason.trim()) {
      alert('Please provide a reason for deletion');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/games/${showGameDeleteModal._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ 
          reason: deleteReason.trim(),
          adminNotes: deleteNotes.trim() || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete game');
      }

      const result = await response.json();
      alert(`Game "${result.data.gameTitle}" has been deleted successfully. The GM has been notified.`);
      
      // Refresh games list
      loadGames();
      setShowGameDeleteModal(null);
      setDeleteReason('');
      setDeleteNotes('');
    } catch (err) {
      console.error('Error deleting game:', err);
      alert('Failed to delete game. Please try again.');
    }
  };

  const closeGameDeleteModal = () => {
    setShowGameDeleteModal(null);
    setDeleteReason('');
    setDeleteNotes('');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6 text-center">
          <h2 className="text-xl font-fantasy font-bold text-red-400 mb-2">Error</h2>
          <p className="text-slate-300">{error}</p>
        </div>
      </div>
    );
  }

  const overviewStats = [
    {
      title: 'Total Users',
      value: stats?.totalUsers?.toLocaleString() || '0',
      icon: '👥',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Games',
      value: stats?.activeGames?.toString() || '0',
      icon: '🎲',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Applications',
      value: stats?.pendingGMApplications?.toString() || '0',
      icon: '📋',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats?.monthlyRevenue?.toLocaleString() || '0'}`,
      icon: '💰',
      color: 'text-purple-600',
      bgColor: 'bg-white-100'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-xl bg-white`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide mb-2">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.color} group-hover:scale-105 transition-transform duration-300`}>{stat.value}</p>
                <div className="mt-3 flex items-center text-xs text-gray-500">
                  <div className="h-1 w-16 bg-gradient-to-r from-blue-300/40 to-blue-400/60 rounded-full"></div>
                  <span className="ml-2">vs last month</span>
                </div>
              </div>
              <div className="text-4xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Recent Activities */}
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">📊</span>
            </div>
            <h2 className="text-2xl font-fantasy font-bold text-gray-900">Recent Activities</h2>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-300">
            View All →
          </button>
        </div>
        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50/60 hover:bg-gray-100/60 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200">
                <div className={`text-2xl ${activity.color} w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm`}>
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{activity.message}</p>
                      <p className="text-gray-600 text-sm">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {activity.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📭</span>
              </div>
              <p className="text-gray-600 text-lg">No recent activities</p>
              <p className="text-gray-500 text-sm">Activity will appear here as users interact with your platform</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-fantasy font-bold text-gray-900">GM Applications</h2>
      
      {applications.length > 0 ? (
        <div className="grid gap-6">
          {applications.map((application) => (
            <div key={application._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {application.firstName || ''} {application.lastName || ''} (@{application.username || 'Unknown'})
                  </h3>
                  <p className="text-gray-600">{application.email || 'No email'}</p>
                  <p className="text-gray-600 text-sm">
                    Applied: {application.dmApplication?.submittedAt 
                      ? new Date(application.dmApplication.submittedAt).toLocaleDateString()
                      : 'Date unknown'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedApplication(application)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => openApprovalModal(application, 'approve')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => openApprovalModal(application, 'reject')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 font-semibold">Preferred Systems:</span>
                  <p className="text-gray-900">
                    {application.dmApplication.preferredSystems && Array.isArray(application.dmApplication.preferredSystems) 
                      ? application.dmApplication.preferredSystems.join(', ') 
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className="text-blue-600 font-semibold">Status:</span>
                  <span className="ml-2 px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-600">
                    {application.dmApplication.status || 'pending'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No pending GM applications</p>
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-fantasy font-bold text-gray-900">
                Application Details - {selectedApplication.firstName || ''} {selectedApplication.lastName || ''}
              </h3>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-600 hover:text-gray-900 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-blue-600 mb-2">Gaming Experience</h4>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                  {selectedApplication.dmApplication?.experience || 'No experience provided'}
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-blue-600 mb-2">Availability</h4>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                  {selectedApplication.dmApplication?.availability || 'No availability provided'}
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-blue-600 mb-2">Sample Game Description</h4>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                  {selectedApplication.dmApplication?.sampleGameDescription || 'No description provided'}
                </p>
              </div>
              
              {selectedApplication.dmApplication?.references && (
                <div>
                  <h4 className="text-lg font-semibold text-blue-600 mb-2">References</h4>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                    {selectedApplication.dmApplication.references}
                  </p>
                </div>
              )}
              
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => openApprovalModal(selectedApplication, 'approve')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                >
                  Approve Application
                </button>
                <button
                  onClick={() => openApprovalModal(selectedApplication, 'reject')}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                >
                  Reject Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval/Rejection Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl w-full shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-fantasy font-bold text-gray-900">
                {showApprovalModal.action === 'approve' ? '✅ Approve' : '❌ Reject'} GM Application
              </h3>
              <button
                onClick={closeApprovalModal}
                className="text-gray-600 hover:text-gray-900 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {showApprovalModal.application.firstName?.charAt(0)}{showApprovalModal.application.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {showApprovalModal.application.firstName} {showApprovalModal.application.lastName}
                    </h4>
                    <p className="text-gray-600">@{showApprovalModal.application.username}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {showApprovalModal.action === 'approve' 
                    ? '📝 Approval Message (Optional)' 
                    : '📝 Rejection Reason (Optional)'}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    showApprovalModal.action === 'approve'
                      ? 'Welcome to the team! You can start creating games right away. Feel free to reach out if you have any questions...'
                      : 'Please provide specific feedback to help the applicant improve their application. For example: lack of experience, unclear sample game, availability concerns...'
                  }
                />
                <div className="mt-2 text-sm text-gray-500">
                  {showApprovalModal.action === 'approve'
                    ? '💡 A welcoming message can help new GMs feel confident and supported.'
                    : '💡 Constructive feedback helps applicants improve and reapply successfully.'}
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${
                showApprovalModal.action === 'approve' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <h4 className="font-semibold mb-2">
                  {showApprovalModal.action === 'approve' ? '✅ This will:' : '❌ This will:'}
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Change user role to {showApprovalModal.action === 'approve' ? '"Approved GM"' : '"Player"'}</li>
                  <li>• Send notification to the applicant</li>
                  {adminNotes.trim() && <li>• Include your message in the notification</li>}
                  {showApprovalModal.action === 'approve' && <li>• Grant access to game creation features</li>}
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={confirmApplicationAction}
                  className={`flex-1 px-6 py-3 rounded-lg transition-colors font-semibold ${
                    showApprovalModal.action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {showApprovalModal.action === 'approve' ? '✅ Confirm Approval' : '❌ Confirm Rejection'}
                </button>
                <button
                  onClick={closeApprovalModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderUsers = () => {
    const getRoleColor = (role: UserRole) => {
      switch (role) {
        case UserRole.ADMIN: return 'bg-purple-600/20 text-purple-400';
        case UserRole.APPROVED_GM: return 'bg-green-600/20 text-green-400';
        case UserRole.GM_APPLICANT: return 'bg-yellow-600/20 text-yellow-400';
        case UserRole.PLAYER: return 'bg-blue-600/20 text-blue-400';
        default: return 'bg-gray-600/20 text-gray-400';
      }
    };

    const filteredUsers = users.filter(user => {
      if (userFilter === 'all') return true;
      return user.role === userFilter;
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-fantasy font-bold text-gray-900">User Management</h2>
          <div className="flex items-center space-x-4">
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            >
              <option value="all">All Users</option>
              <option value={UserRole.PLAYER}>Players</option>
              <option value={UserRole.GM_APPLICANT}>GM Applicants</option>
              <option value={UserRole.APPROVED_GM}>Approved GMs</option>
              <option value={UserRole.ADMIN}>Admins</option>
            </select>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-600">@{user.username}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getRoleColor(user.role)}`}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.isActive 
                          ? 'bg-green-600/20 text-green-400' 
                          : 'bg-red-600/20 text-red-400'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleUserStatusToggle(user._id, !user.isActive)}
                          className={user.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No users found</p>
            </div>
          )}
        </div>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-fantasy font-bold text-gray-900">
                  User Details - {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-600 hover:text-gray-900 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-600 mb-2">Username</label>
                    <p className="text-gray-900">{selectedUser.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-600 mb-2">Email</label>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-600 mb-2">Current Role</label>
                    <p className="text-gray-900">{selectedUser.role.replace('_', ' ').toUpperCase()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-600 mb-2">Status</label>
                    <p className="text-gray-900">{selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-600 mb-2">Member Since</label>
                    <p className="text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-600 mb-2">Last Login</label>
                    <p className="text-gray-900">
                      {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
                
                {selectedUser.profile && (
                  <div>
                    <h4 className="text-lg font-semibold text-blue-600 mb-4">Profile Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedUser.profile.timeZone && (
                        <div>
                          <label className="block text-sm font-medium text-blue-600 mb-2">Time Zone</label>
                          <p className="text-gray-900">{selectedUser.profile.timeZone}</p>
                        </div>
                      )}
                      {selectedUser.profile.experienceLevel && (
                        <div>
                          <label className="block text-sm font-medium text-blue-600 mb-2">Experience Level</label>
                          <p className="text-gray-900">{selectedUser.profile.experienceLevel}</p>
                        </div>
                      )}
                      {selectedUser.profile.languages && selectedUser.profile.languages.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-blue-600 mb-2">Languages</label>
                          <p className="text-gray-900">{selectedUser.profile.languages.join(', ')}</p>
                        </div>
                      )}
                      {selectedUser.profile.favoriteGenres && selectedUser.profile.favoriteGenres.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-blue-600 mb-2">Favorite Genres</label>
                          <p className="text-gray-900">{selectedUser.profile.favoriteGenres.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-lg font-semibold text-blue-600 mb-4">Admin Actions</h4>
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-600 mb-2">Change Role</label>
                      <select
                        value={selectedUser.role}
                        onChange={(e) => handleUserRoleChange(selectedUser._id, e.target.value as UserRole)}
                        className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        disabled={selectedUser._id === user?._id} // Can't change own role
                      >
                        <option value={UserRole.PLAYER}>Player</option>
                        <option value={UserRole.GM_APPLICANT}>GM Applicant</option>
                        <option value={UserRole.APPROVED_GM}>Approved GM</option>
                        <option value={UserRole.ADMIN}>Admin</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => handleUserStatusToggle(selectedUser._id, !selectedUser.isActive)}
                        className={`px-6 py-2 rounded-lg transition-colors font-semibold ${
                          selectedUser.isActive
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                        disabled={selectedUser._id === user?._id} // Can't deactivate own account
                      >
                        {selectedUser.isActive ? 'Deactivate User' : 'Activate User'}
                      </button>
                    </div>
                  </div>
                  {selectedUser._id === user?._id && (
                    <p className="text-orange-600 text-sm mt-2">
                      ⚠️ You cannot modify your own account
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGames = () => {
    return (
      <div className="space-y-6">
        {/* Games Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Games Management</h2>
            <p className="text-gray-600">Manage games created on the platform</p>
          </div>
        </div>

        {/* Games List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game Master</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Players</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {games.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No games found
                    </td>
                  </tr>
                ) : (
                  games.map((game) => (
                    <tr key={game._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{game.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">{game.description}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            Created: {new Date(game.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {game.gm.firstName} {game.gm.lastName}
                          </div>
                          <div className="text-sm text-gray-500">@{game.gm.username}</div>
                          <div className="text-xs text-gray-400">{game.gm.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {game.system}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {game.capacity - game.availableSeats}/{game.capacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          game.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {game.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleGameDelete(game)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Game Delete Modal */}
        {showGameDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl w-full shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-fantasy font-bold text-gray-900">
                  ⚠️ Delete Game
                </h3>
                <button
                  onClick={closeGameDeleteModal}
                  className="text-gray-600 hover:text-gray-900 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Game: "{showGameDeleteModal.title}"
                  </h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div>GM: {showGameDeleteModal.gm.firstName} {showGameDeleteModal.gm.lastName} (@{showGameDeleteModal.gm.username})</div>
                    <div>Players: {showGameDeleteModal.capacity - showGameDeleteModal.availableSeats}/{showGameDeleteModal.capacity}</div>
                    <div>System: {showGameDeleteModal.system}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    🚨 Reason for Deletion (Required)
                  </label>
                  <select
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Select a reason...</option>
                    <option value="Inappropriate Content">Inappropriate Content</option>
                    <option value="Violates Community Guidelines">Violates Community Guidelines</option>
                    <option value="Spam or Misleading">Spam or Misleading</option>
                    <option value="Copyright Violation">Copyright Violation</option>
                    <option value="User Request">User Request</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    📝 Additional Notes (Optional)
                  </label>
                  <textarea
                    value={deleteNotes}
                    onChange={(e) => setDeleteNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Provide additional context or feedback for the GM..."
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    💡 These notes will be sent to the GM along with the deletion notification.
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-yellow-800">⚠️ This action will:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Permanently delete the game from the platform</li>
                    <li>• Send a notification to the GM with your reason and notes</li>
                    <li>• This action cannot be undone</li>
                  </ul>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={confirmGameDelete}
                    disabled={!deleteReason.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🗑️ Confirm Deletion
                  </button>
                  <button
                    onClick={closeGameDeleteModal}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">⚡</span>
            </div>
            <div>
              <h1 className="text-4xl font-fantasy font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your TRPG platform</p>
            </div>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-2 shadow-lg">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                <span>📊</span>
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                  activeTab === 'applications'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                <span>📋</span>
                <span>GM Applications</span>
                {applications.length > 0 && (
                  <span className="bg-orange-400 text-orange-900 text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                    {applications.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                  activeTab === 'users'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                <span>👥</span>
                <span>User Management</span>
                {stats && (
                  <span className="bg-blue-400 text-blue-900 text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                    {stats.totalUsers}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('games')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                  activeTab === 'games'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                <span>🎲</span>
                <span>Games Management</span>
                {stats && (
                  <span className="bg-blue-400 text-blue-900 text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                    {stats.activeGames}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                  activeTab === 'notifications'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                <span>🔔</span>
                <span>System Notifications</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="relative">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'applications' && renderApplications()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'games' && renderGames()}
          {activeTab === 'notifications' && <SystemNotifications />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
