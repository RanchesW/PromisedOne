import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { messageService } from '../../services/messageService';
import { useRouteTransition } from '../../hooks/useRouteTransition';
import { getAvatarUrl } from '../../services/api';
import FavoriteGameMastersModal from '../UI/FavoriteGameMastersModal';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { navigateWithTransition } = useRouteTransition();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showFavoriteGMsModal, setShowFavoriteGMsModal] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await messageService.getNotifications(1);
      const responseData = response.data;
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        setRecentNotifications((responseData as any).data?.slice(0, 5) || []);
        setUnreadNotifications((responseData as any).unreadCount || 0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleSpecialNavigation = (path: string, message: string) => {
    setIsMobileMenuOpen(false);
    navigateWithTransition(path, message, 2000);
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await messageService.markNotificationAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification._id);
    }
    setShowNotificationDropdown(false);
    
    // Always navigate to the notifications tab in messages for any notification
    navigate('/messages?tab=notifications');
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleLogout = () => {
    logout();
    navigateWithTransition('/', '🎲 Returning to the tavern... farewell, adventurer!', 2500);
    setIsMobileMenuOpen(false);
  };

  const handleAdminNavigation = () => {
    navigateWithTransition('/admin/overview', '🎲 Entering the sacred halls of administration...', 2500);
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/games', label: 'Find Games' },
    { path: '/find-game-masters', label: 'Find Game Masters' },
  ];

  const getAuthenticatedLinks = () => {
    // No additional authenticated links needed - everything is in the user dropdown
    return [];
  };

  const gmLinks = [
    { path: '/create-game', label: 'Create Game' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left side - Logo + Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-4 text-3xl font-fantasy font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span>StartPlaying</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {/* Navigation Links */}
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={isActivePath(link.path) ? 'nav-link-active text-lg' : 'nav-link text-lg'}
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated && (
                <>
                  {user?.role === 'approved_gm' && gmLinks.map(link => (
                    <button
                      key={link.path}
                      onClick={() => handleSpecialNavigation(link.path, '🎲 Rolling into ' + link.label + '...')}
                      className={isActivePath(link.path) ? 'nav-link-active text-lg' : 'nav-link text-lg'}
                    >
                      {link.label}
                    </button>
                  ))}
                </>
              )}
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center">
            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="flex items-center">
                {/* Separator */}
                <div className="hidden md:block h-6 w-px bg-gray-300 mx-3"></div>
                
                {/* Messages Icon */}
                <Link
                  to="/messages"
                  className="p-3 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors relative"
                  aria-label="Messages"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </Link>

                {/* Notifications Bell */}
                <div className="relative -ml-1" ref={notificationDropdownRef}>
                  <button
                    onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                    className="p-3 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors relative"
                    aria-label="Notifications"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 17H7a2 2 0 01-2-2V7a2 2 0 012-2h8a2 2 0 012 2v6.5M8 11h6M8 7h6" />
                    </svg>
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotificationDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h3 className="text-gray-900 font-semibold">Notifications</h3>
                          <Link
                            to="/messages?tab=notifications"
                            onClick={() => setShowNotificationDropdown(false)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            View All
                          </Link>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {recentNotifications.length > 0 ? (
                          recentNotifications.map((notification) => (
                            <div
                              key={notification._id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                                !notification.isRead ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="text-gray-900 font-medium text-sm">{notification.title}</h4>
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                  </div>
                                  <p className="text-gray-600 text-sm line-clamp-2">{notification.message}</p>
                                  <p className="text-gray-500 text-xs mt-1">
                                    {formatNotificationTime(notification.createdAt)}
                                  </p>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    notification.category === 'social'
                                      ? 'bg-blue-500 text-white'
                                      : notification.category === 'system'
                                      ? 'bg-purple-500 text-white'
                                      : 'bg-green-500 text-white'
                                  }`}
                                >
                                  {notification.category}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-gray-500">
                            <p>No notifications yet</p>
                          </div>
                        )}
                      </div>
                      {unreadNotifications > 0 && (
                        <div className="p-4 border-t border-gray-200">
                          <button
                            onClick={async () => {
                              if (isMarkingAllRead) return;
                              setIsMarkingAllRead(true);
                              try {
                                await messageService.markAllNotificationsAsRead();
                                await loadNotifications();
                              } catch (error: any) {
                                console.error('Error marking notifications as read:', error);
                              } finally {
                                setIsMarkingAllRead(false);
                              }
                            }}
                            disabled={isMarkingAllRead}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-2 rounded text-sm transition-colors"
                          >
                            {isMarkingAllRead ? 'Marking...' : 'Mark All Read'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Avatar Dropdown */}
                <div className="relative ml-4" ref={userDropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg overflow-hidden">
                      {(() => {
                        const avatarUrl = getAvatarUrl(user?.avatar);
                        console.log('Header avatar debug:', { 
                          userAvatar: user?.avatar, 
                          avatarUrl, 
                          hasAvatarUrl: !!avatarUrl 
                        });
                        return avatarUrl ? (
                          <img 
                            src={avatarUrl} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Failed to load avatar:', user?.avatar);
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <>
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                          </>
                        );
                      })()}
                    </div>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Dropdown */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg overflow-hidden">
                            {getAvatarUrl(user?.avatar) ? (
                              <img 
                                src={getAvatarUrl(user?.avatar) || ''} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error('Failed to load avatar in dropdown:', user?.avatar);
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <>
                                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                              </>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-lg">{user?.firstName} {user?.lastName}</p>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <Link
                          to="/my-games"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-base">My Games</span>
                        </Link>
                        <Link
                          to="/bookings"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-base">My Calendar</span>
                        </Link>
                        <button
                          onClick={() => {
                            setShowFavoriteGMsModal(true);
                            setShowUserDropdown(false);
                          }}
                          className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="text-base">Favorite Game Masters</span>
                        </button>
                        <Link
                          to="/settings/refer-a-friend"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span className="text-base">Credit Balance: $0.00</span>
                        </Link>
                        <div className="border-t border-gray-200 my-2"></div>
                        <Link
                          to="/settings/refer-a-friend"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-base">Refer a Friend</span>
                        </Link>
                        <Link
                          to="/become-gm"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span className="text-base">Become a Game Master</span>
                        </Link>
                        <Link
                          to="/support"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-base">Support</span>
                        </Link>
                        <div className="border-t border-gray-200 my-2"></div>
                        <Link
                          to="/profile/public"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-base">My Profile</span>
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-base">Account Settings</span>
                        </Link>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => {
                              handleAdminNavigation();
                              setShowUserDropdown(false);
                            }}
                            className="flex items-center w-full px-4 py-3 text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                          >
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-base">Admin Panel</span>
                          </button>
                        )}
                        <div className="border-t border-gray-200 my-2"></div>
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowUserDropdown(false);
                          }}
                          className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span className="text-base">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center">
                {/* Separator */}
                <div className="h-6 w-px bg-gray-300 ml-1 mr-3"></div>
                
                <div className="flex items-center space-x-6">
                  <Link
                    to="/login"
                    className="text-slate-700 hover:text-blue-600 transition-colors font-medium text-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-3 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Navigation Links */}
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                {/* Messages Link for Mobile */}
                <Link
                  to="/messages"
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Messages
                </Link>
                
                {user?.role === 'approved_gm' && gmLinks.map(link => (
                  <button
                    key={link.path}
                    onClick={() => handleSpecialNavigation(link.path, '🎲 Rolling into ' + link.label + '...')}
                    className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {link.label}
                  </button>
                ))}

                <Link
                  to="/profile"
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                
                {/* Admin Panel Mobile Link */}
                {user?.role === 'admin' && (
                  <button
                    onClick={handleAdminNavigation}
                    className="block w-full text-left px-3 py-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-md transition-colors font-semibold"
                  >
                    Admin Panel
                  </button>
                )}
                
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-md transition-colors text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Favorite Game Masters Modal */}
      <FavoriteGameMastersModal 
        isOpen={showFavoriteGMsModal} 
        onClose={() => setShowFavoriteGMsModal(false)} 
      />
    </header>
  );
};

export default Header;
