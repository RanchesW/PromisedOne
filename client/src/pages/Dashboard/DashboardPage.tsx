import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../types/shared';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

interface DMApplicationData {
  experience: string;
  preferredSystems: string[];
  availability: string;
  sampleGameDescription: string;
  references?: string;
}

const DashboardPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [dmApplication, setDmApplication] = useState<DMApplicationData>({
    experience: '',
    preferredSystems: [],
    availability: '',
    sampleGameDescription: '',
    references: ''
  });

  // Refresh user data on component mount to ensure we have latest role
  useEffect(() => {
    const refreshUserData = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('Refreshed user data:', userData);
          if (updateUser && userData.role !== user.role) {
            console.log('User role changed, updating:', { old: user.role, new: userData.role });
            // Update only the role to avoid overwriting other user data
            updateUser({ role: userData.role });
          }
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    };
    
    refreshUserData();
    
    // Set up interval to check for role changes every 30 seconds
    const interval = setInterval(refreshUserData, 30000);
    
    return () => clearInterval(interval);
  }, [user?._id, updateUser]);

  const gameSystems = [
    { value: 'dnd_5e', label: 'D&D 5th Edition' },
    { value: 'pathfinder_2e', label: 'Pathfinder 2nd Edition' },
    { value: 'call_of_cthulhu', label: 'Call of Cthulhu' },
    { value: 'vampire_masquerade', label: 'Vampire: The Masquerade' },
    { value: 'cyberpunk_red', label: 'Cyberpunk Red' },
    { value: 'other', label: 'Other Systems' }
  ];

  const handleSystemToggle = (system: string) => {
    setDmApplication(prev => ({
      ...prev,
      preferredSystems: prev.preferredSystems.includes(system)
        ? prev.preferredSystems.filter(s => s !== system)
        : [...prev.preferredSystems, system]
    }));
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/apply-dm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(dmApplication)
      });

      if (response.ok) {
        setApplicationSubmitted(true);
        // Update user role to GM_APPLICANT
        if (updateUser) {
          updateUser({ role: UserRole.GM_APPLICANT });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting DM application:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit application. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Manual refresh - Server user data:', userData);
        console.log('Manual refresh - Current local user data:', user);
        console.log('Manual refresh - Role comparison:', { 
          server: userData.role, 
          local: user.role,
          match: userData.role === user.role 
        });
        
        if (updateUser && userData.role !== user.role) {
          console.log('Manual refresh - Updating role:', { old: user.role, new: userData.role });
          updateUser({ role: userData.role });
        } else {
          console.log('Manual refresh - No role change needed');
        }
      }
    } catch (error) {
      console.error('Error in manual refresh:', error);
    }
  };

  const renderDashboardStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-slate-100 border border-slate-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-blue-600 font-fantasy font-semibold mb-2">Games Played</h3>
        <p className="text-3xl font-bold text-slate-900">{user?.stats.gamesPlayed || 0}</p>
      </div>
      <div className="bg-slate-100 border border-slate-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-blue-600 font-fantasy font-semibold mb-2">Games Hosted</h3>
        <p className="text-3xl font-bold text-slate-900">{user?.stats.gamesHosted || 0}</p>
      </div>
      <div className="bg-slate-100 border border-slate-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-blue-600 font-fantasy font-semibold mb-2">Average Rating</h3>
        <p className="text-3xl font-bold text-slate-900">
          {user?.stats.averageRating ? user.stats.averageRating.toFixed(1) : 'N/A'}
        </p>
      </div>
      <div className="bg-slate-100 border border-slate-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-blue-600 font-fantasy font-semibold mb-2">Referral Credits</h3>
        <p className="text-3xl font-bold text-slate-900">${user?.referralCredits || 0}</p>
      </div>
    </div>
  );

  const renderUserInfo = () => (
    <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-fantasy font-bold text-blue-600">User Information</h2>
        <button
          onClick={handleManualRefresh}
          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-600 font-semibold transition-colors"
        >
          🔄 Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-slate-700"><span className="font-semibold">Name:</span> {user?.firstName} {user?.lastName}</p>
          <p className="text-slate-700"><span className="font-semibold">Username:</span> {user?.username}</p>
          <p className="text-slate-700"><span className="font-semibold">Email:</span> {user?.email}</p>
        </div>
        <div>
          <p className="text-slate-700"><span className="font-semibold">Role:</span> 
            <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
              user?.role === UserRole.APPROVED_GM ? 'bg-green-100 text-green-700' :
              user?.role === UserRole.GM_APPLICANT ? 'bg-yellow-100 text-yellow-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {user?.role === UserRole.APPROVED_GM ? 'Approved GM' :
               user?.role === UserRole.GM_APPLICANT ? 'GM Applicant' :
               user?.role === UserRole.ADMIN ? 'Admin' : 'Player'}
            </span>
          </p>
          <p className="text-slate-700"><span className="font-semibold">Timezone:</span> {user?.timezone}</p>
          <p className="text-slate-700"><span className="font-semibold">Referral Code:</span> {user?.referralCode}</p>
        </div>
      </div>
    </div>
  );

  const renderDMApplication = () => {
    console.log('Dashboard - Current user role:', user?.role, 'Expected APPROVED_GM:', UserRole.APPROVED_GM);
    
    if (user?.role === UserRole.APPROVED_GM) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-fantasy font-bold text-green-700 mb-4">🎉 Congratulations!</h2>
          <p className="text-green-600">Your GM application has been approved! You can now create and host games.</p>
        </div>
      );
    }

    if (user?.role === UserRole.GM_APPLICANT) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-fantasy font-bold text-yellow-700 mb-4">Application Under Review</h2>
          <p className="text-yellow-600">Your GM application is currently being reviewed by our team. You'll receive an email notification once it's processed.</p>
        </div>
      );
    }

    if (applicationSubmitted) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-fantasy font-bold text-blue-700 mb-4">Application Submitted!</h2>
          <p className="text-blue-600">Thank you for applying to become a Game Master! Your application is now under review.</p>
        </div>
      );
    }

    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-2xl font-fantasy font-bold text-blue-600 mb-4">Apply to Become a Game Master</h2>
        <p className="text-slate-700 mb-6">Ready to host your own TRPG sessions? Apply to become a Game Master and start creating memorable adventures!</p>
        
        <form onSubmit={handleSubmitApplication} className="space-y-6">
          <div>
            <label className="block text-blue-600 font-semibold mb-2">
              Gaming Experience *
            </label>
            <textarea
              value={dmApplication.experience}
              onChange={(e) => setDmApplication(prev => ({ ...prev, experience: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={4}
              placeholder="Tell us about your TRPG experience as a player and/or GM. Include years of experience, systems you've played, and any notable campaigns."
              required
            />
          </div>

          <div>
            <label className="block text-blue-600 font-semibold mb-2">
              Preferred Game Systems *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {gameSystems.map((system) => (
                <label key={system.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dmApplication.preferredSystems.includes(system.value)}
                    onChange={() => handleSystemToggle(system.value)}
                    className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-slate-700">{system.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-blue-600 font-semibold mb-2">
              Availability *
            </label>
            <textarea
              value={dmApplication.availability}
              onChange={(e) => setDmApplication(prev => ({ ...prev, availability: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={3}
              placeholder="Describe your typical availability (days of the week, time slots, frequency). Be as specific as possible."
              required
            />
          </div>

          <div>
            <label className="block text-blue-600 font-semibold mb-2">
              Sample Game Description *
            </label>
            <textarea
              value={dmApplication.sampleGameDescription}
              onChange={(e) => setDmApplication(prev => ({ ...prev, sampleGameDescription: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={5}
              placeholder="Provide a sample game description for a session you'd like to run. Include the setting, hook, and what players can expect."
              required
            />
          </div>

          <div>
            <label className="block text-blue-600 font-semibold mb-2">
              References (Optional)
            </label>
            <textarea
              value={dmApplication.references}
              onChange={(e) => setDmApplication(prev => ({ ...prev, references: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={3}
              placeholder="Any references from previous players or fellow GMs? Include usernames, Discord handles, or brief testimonials."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !dmApplication.experience || !dmApplication.availability || !dmApplication.sampleGameDescription || dmApplication.preferredSystems.length === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
          >
            {loading ? <LoadingSpinner /> : 'Submit GM Application'}
          </button>
        </form>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-fantasy font-bold text-blue-600 mb-8">Dashboard</h1>
      
      {renderDashboardStats()}
      {renderUserInfo()}
      {renderDMApplication()}
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6 text-center shadow-sm">
          <h3 className="text-blue-600 font-fantasy font-semibold mb-3">Find Games</h3>
          <p className="text-slate-700 mb-4">Discover new adventures and join exciting campaigns.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            Browse Games
          </button>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-lg p-6 text-center shadow-sm">
          <h3 className="text-blue-600 font-fantasy font-semibold mb-3">My Bookings</h3>
          <p className="text-slate-700 mb-4">View and manage your upcoming game sessions.</p>
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            View Bookings
          </button>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-lg p-6 text-center shadow-sm">
          <h3 className="text-blue-600 font-fantasy font-semibold mb-3">Messages</h3>
          <p className="text-slate-700 mb-4">Connect with other players and GMs.</p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            View Messages
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
