import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { getImageUrl } from '../../utils/imageUtils';
import { userService } from '../../services/userService';
import { useFavoriteGM } from '../../hooks/useFavoriteGM';

interface UserProfile {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  role: string;
  timezone: string;
  createdAt: string | Date;
  pronouns?: string[];
  identityTags?: string[];
  stats: {
    gamesPlayed: number;
    gamesHosted: number;
    averageRating: number;
    totalReviews: number;
  };
  preferences?: {
    systems: string[];
    experienceLevel: string;
    platforms: string[];
  };
  profile?: {
    languages?: string[];
    favoriteGenres?: string[];
    experienceLevel?: string;
  };
  featuredPrompts?: Array<{
    promptId: string;
    customText: string;
  }>;
}

const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  // Favorite functionality - only initialize if profile exists and is a GM
  const { isFavorite, isLoading: favoriteLoading, toggleFavorite } = useFavoriteGM(
    (profile && (profile.role === 'approved_gm' || profile.role === 'admin') && !isOwnProfile) 
      ? profile._id 
      : ''
  );

  useEffect(() => {
    fetchProfile();
  }, [userId, currentUser]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let profileData;
      let targetUserId = userId;
      
      // If no userId in URL, we're viewing our own profile
      if (!targetUserId && currentUser) {
        targetUserId = currentUser._id;
        setIsOwnProfile(true);
      } else if (targetUserId && currentUser) {
        setIsOwnProfile(currentUser._id === targetUserId);
      } else {
        // No user ID and not logged in
        navigate('/login');
        return;
      }
      
      if (!targetUserId) {
        throw new Error('No user ID available');
      }
      
      profileData = await userService.getUserProfile(targetUserId);
      setProfile(profileData);
    } catch (error) {
      console.error('Fetch profile error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getFullName = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return profile?.username || 'Unknown User';
  };

  const getYearsOnPlatform = () => {
    if (!profile?.createdAt) return 0;
    return Math.floor((new Date().getTime() - new Date(profile.createdAt).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const handleMessage = () => {
    if (!profile?._id) return;
    
    // Navigate to messages with the user ID as a query parameter
    navigate(`/messages?user=${profile._id}`);
  };

  const getSystemDisplayName = (system: string) => {
    const systemNames = {
      'dnd_5e': 'D&D 5th Edition',
      'pathfinder_2e': 'Pathfinder 2nd Edition',
      'call_of_cthulhu': 'Call of Cthulhu',
      'vampire_masquerade': 'Vampire: The Masquerade',
      'cyberpunk_red': 'Cyberpunk Red',
      'other': 'Other Systems'
    };
    return systemNames[system as keyof typeof systemNames] || system;
  };

  const isGameMaster = profile?.role === 'approved_gm' || profile?.role === 'admin';

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Profile Not Found</h2>
          <p className="text-slate-600 mb-6">
            {error || 'The profile you\'re looking for doesn\'t exist.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Area - Large Banner like in reference image */}
      <div className="relative">
        <div className="h-80 bg-gradient-to-r from-amber-50 via-blue-50 to-purple-50 relative overflow-hidden">
          {/* Background design inspired by the reference */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-20 w-32 h-24 bg-amber-200 opacity-30 rounded-lg transform rotate-12"></div>
            <div className="absolute top-20 right-32 w-20 h-32 bg-blue-200 opacity-30 rounded-lg transform -rotate-12"></div>
            <div className="absolute bottom-10 left-1/3 w-24 h-16 bg-purple-200 opacity-30 rounded-lg transform rotate-45"></div>
            {/* Character-like circle */}
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-purple-300 to-blue-300 rounded-full opacity-40"></div>
          </div>
          
          {/* Large stylized name */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-8xl font-bold text-gray-800 tracking-wider" style={{
                fontFamily: 'serif',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
              }}>
                {getFullName()}
              </h1>
              {/* Decorative elements */}
              <div className="flex justify-center space-x-6 mt-6">
                <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile info section - White background like reference */}
        <div className="bg-white relative">
          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Avatar positioned over the banner */}
            <div className="flex justify-center -mt-16 mb-6">
              <div className="relative">
                {profile.avatar ? (
                  <img
                    src={getImageUrl(profile.avatar)}
                    alt={getFullName()}
                    className="w-40 h-40 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                    onError={(e) => {
                      console.error('Avatar failed to load:', profile.avatar);
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                      if (fallback) {
                        (fallback as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className={`avatar-fallback w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg border-4 border-white ${profile.avatar ? 'hidden' : ''}`}>
                  {getFullName().charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
            
            {/* Name and details */}
            <div className="text-center mb-6">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">{getFullName()}</h2>
              {profile.pronouns && profile.pronouns.length > 0 && (
                <p className="text-gray-600 text-lg mb-3">{profile.pronouns.join(', ')}</p>
              )}
              {profile.stats.averageRating > 0 ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className={`w-5 h-5 ${star <= profile.stats.averageRating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600 font-medium">{profile.stats.averageRating.toFixed(1)} ({profile.stats.totalReviews})</span>
                </div>
              ) : (
                <div className="text-gray-500">No ratings yet</div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-center items-center space-x-4">
              {/* Only show favorite button for GMs and if not viewing own profile */}
              {isGameMaster && !isOwnProfile && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    if (!favoriteLoading) {
                      toggleFavorite();
                    }
                  }}
                  disabled={favoriteLoading}
                  className={`p-3 transition-colors border rounded-lg ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''} ${
                    isFavorite 
                      ? 'text-red-500 border-red-300 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-400 hover:text-red-500 border-gray-300 hover:border-red-300'
                  }`} 
                  title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                >
                  <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              )}
              {!isOwnProfile && (
                <button className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                  Request Booking
                </button>
              )}
              {isGameMaster && !isOwnProfile && (
                <button 
                  onClick={handleMessage}
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Message
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-12">
        {/* Timezone column */}
        <div>
          <div className="text-xs font-bold text-gray-500 mb-2 text-left">TIMEZONE</div>
          <div className="flex flex-wrap gap-2">
            <span className="bg-gray-100 text-gray-800 font-semibold px-3 py-1 rounded-full text-xs">
              {profile.timezone || 'UTC'}
            </span>
          </div>
        </div>
        {/* Identity column */}
        <div>
          <div className="text-xs font-bold text-gray-500 mb-2 text-left">IDENTITY</div>
          <div className="flex flex-wrap gap-2">
            {profile.identityTags && profile.identityTags.length > 0 ? (
              profile.identityTags.map((tag: string, index: number) => (
                <span key={index} className="bg-gray-100 text-gray-800 font-semibold px-3 py-1 rounded-full text-xs">
                  {tag.toUpperCase()}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-xs italic">No identity tags set</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - At a Glance Sidebar (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">At a glance</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-1">
                  <div className="w-6 h-6 -mt-0.5">
                    <svg className="w-full h-full text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 26">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-small text-gray-600 text-sm">{getYearsOnPlatform()} years on KazRPG</p>
                  </div>
                </div>
                
                {isGameMaster && (
                  <div className="flex items-start space-x-1">
                    <div className="w-6 h-6 -mt-0.5">
                      <svg className="w-full h-full text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 26">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-small text-gray-600 text-sm">{profile.stats.gamesHosted} games hosted</p>
                    </div>
                  </div>
                )}

                {profile.stats.averageRating > 0 && (
                  <div className="pt-2">
                    <h4 className="font-bold text-gray-900 mb-4">
                      Top-rated for
                    </h4>
                    <div className="space-y-3">
                      {profile.stats.averageRating >= 4.5 && (
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5">
                            <svg className="w-full h-full text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-gray-700">Highly Rated</span>
                        </div>
                      )}
                      {profile.stats.gamesHosted > 10 && (
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5">
                            <svg className="w-full h-full text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-gray-700">Experienced GM</span>
                        </div>
                      )}
                      {isGameMaster && (
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5">
                            <svg className="w-full h-full text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-gray-700">Active Game Master</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - About Section (2/3 width) */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">About {getFullName()}</h3>
            <div className="prose prose-gray max-w-none mb-8">
              {profile.bio ? (
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                  {profile.bio}
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  This user hasn't added a bio yet.
                </div>
              )}
            </div>
              {/* Featured Prompts */}
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-6">
                    {/* Icon removed as requested */}
                    <h4 className="text-2xl font-bold text-black">
                      Featured Prompts
                    </h4>
                  </div>
                  {profile.featuredPrompts && profile.featuredPrompts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {profile.featuredPrompts.map((prompt: {promptId: string, customText: string}, index: number) => {
                        // Map promptId to display text and get colors
                        const getPromptData = (promptId: string) => {
                          const promptMap: {[key: string]: {text: string, gradient: string, icon: string}} = {
                            'became_gm_because': {
                              text: 'I became a GM because',
                              gradient: 'from-emerald-400 to-cyan-400',
                              icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                            },
                            'favorite_system': {
                              text: 'My favorite system of all time is',
                              gradient: 'from-rose-400 to-pink-400',
                              icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                            },
                            'best_moment': {
                              text: 'My best gaming moment was when',
                              gradient: 'from-amber-400 to-orange-400',
                              icon: 'M13 10V3L4 14h7v7l9-11h-7z'
                            },
                            'character_type': {
                              text: 'I always play the character who',
                              gradient: 'from-purple-400 to-indigo-400',
                              icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                            },
                            'dm_style': {
                              text: 'My DM style can best be described as',
                              gradient: 'from-blue-400 to-purple-400',
                              icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                            },
                            'game_goal': {
                              text: 'What I want most from a game is',
                              gradient: 'from-green-400 to-blue-400',
                              icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
                            },
                            'player_pet_peeve': {
                              text: 'My biggest pet peeve as a player is',
                              gradient: 'from-red-400 to-rose-400',
                              icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                            },
                            'memorable_npc': {
                              text: 'The most memorable NPC I created was',
                              gradient: 'from-teal-400 to-green-400',
                              icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                            },
                            'campaign_dream': {
                              text: 'My dream campaign would be',
                              gradient: 'from-indigo-400 to-cyan-400',
                              icon: 'M8 13v-1m4 1v-3m4 3V8M8 21l4-7 4 7M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z'
                            },
                            'gaming_philosophy': {
                              text: 'My gaming philosophy is',
                              gradient: 'from-violet-400 to-purple-400',
                              icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                            }
                          };
                          return promptMap[promptId] || {text: 'Featured prompt', gradient: 'from-gray-400 to-gray-500', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'};
                        };

                        const promptData = getPromptData(prompt.promptId);

                        return (
                          <div key={index} className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            {/* Gradient background overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${promptData.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
                            
                            {/* Icon */}
                            <div className={`inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br ${promptData.gradient} rounded-xl mb-3 shadow-lg`}>
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={promptData.icon} />
                              </svg>
                            </div>

                            {/* Content */}
                            <div className="relative z-10">
                              <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 leading-tight">
                                {promptData.text}
                              </h5>
                              <p className="text-lg font-medium text-gray-800 leading-relaxed group-hover:text-gray-900 transition-colors">
                                {prompt.customText}
                              </p>
                            </div>

                            {/* Decorative dots */}
                            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                              <div className="flex space-x-1">
                                <div className={`w-2 h-2 bg-gradient-to-br ${promptData.gradient} rounded-full`}></div>
                                <div className={`w-2 h-2 bg-gradient-to-br ${promptData.gradient} rounded-full`}></div>
                                <div className={`w-2 h-2 bg-gradient-to-br ${promptData.gradient} rounded-full`}></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">This user hasn't set up any featured prompts yet.</p>
                    </div>
                  )}
                </div>

              {/* Reviews */}
                <div className="mt-8">
                  <h4 className="text-3xl font-bold text-gray-900 mb-4">Reviews</h4>
                  <div className="flex flex-wrap gap-2">
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default PublicProfilePage;