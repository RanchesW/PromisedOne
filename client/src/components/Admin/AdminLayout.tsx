import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  ChartBarIcon, 
  UsersIcon, 
  RectangleStackIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const AdminLayout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      name: 'Overview',
      href: '/admin/overview',
      icon: ChartBarIcon,
      description: 'Dashboard and statistics'
    },
    {
      name: 'GM Applications',
      href: '/admin/gm-applications',
      icon: ClipboardDocumentListIcon,
      description: 'Review Game Master applications'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: UsersIcon,
      description: 'Manage user accounts'
    },
    {
      name: 'Games',
      href: '/admin/games',
      icon: RectangleStackIcon,
      description: 'Manage games and sessions'
    },
    {
      name: 'System Notifications',
      href: '/admin/notifications',
      icon: BellIcon,
      description: 'Send platform-wide notifications'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: CogIcon,
      description: 'Platform settings and configuration'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            <p className="text-sm text-gray-600 mt-1">Platform Management</p>
          </div>

          <nav className="mt-6">
            <div className="px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg mb-1 transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;