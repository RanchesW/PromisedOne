import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  GameController2Icon,
  ClipboardDocumentListIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface AdminStats {
  totalUsers: number;
  totalGames: number;
  pendingApplications: number;
  activeUsers: number;
}

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalGames: 0,
    pendingApplications: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Load various stats in parallel
      const [usersRes, gamesRes, applicationsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL || 'https://promisedone.onrender.com/api'}/admin/users`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }),
        fetch(`${process.env.REACT_APP_API_URL || 'https://promisedone.onrender.com/api'}/admin/games`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }),
        fetch(`${process.env.REACT_APP_API_URL || 'https://promisedone.onrender.com/api'}/admin/users?role=gm_applicant`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        })
      ]);

      const users = usersRes.ok ? await usersRes.json() : { data: [] };
      const games = gamesRes.ok ? await gamesRes.json() : { data: [] };
      const applications = applicationsRes.ok ? await applicationsRes.json() : { data: [] };

      setStats({
        totalUsers: users.data?.length || 0,
        totalGames: games.data?.length || 0,
        pendingApplications: applications.data?.length || 0,
        activeUsers: users.data?.filter((user: any) => user.isActive !== false).length || 0
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: UsersIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Active Games',
      value: stats.totalGames,
      icon: GameController2Icon,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'positive'
    },
    {
      name: 'Pending GM Applications',
      value: stats.pendingApplications,
      icon: ClipboardDocumentListIcon,
      color: 'bg-yellow-500',
      change: '+3',
      changeType: 'neutral'
    },
    {
      name: 'Active Users',
      value: stats.activeUsers,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'positive'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome to the KazRPG admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Review Applications</h4>
            <p className="text-sm text-gray-600 mt-1">Review pending GM applications</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Send Notification</h4>
            <p className="text-sm text-gray-600 mt-1">Send platform-wide announcement</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">View Reports</h4>
            <p className="text-sm text-gray-600 mt-1">Generate platform reports</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;