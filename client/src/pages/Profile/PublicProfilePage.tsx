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
              <button className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                Request Booking
              </button>
              {isGameMaster && (
                <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
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
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">Featured Prompts</h4>
                  {profile.featuredPrompts && profile.featuredPrompts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.featuredPrompts.map((prompt: {promptId: string, customText: string}, index: number) => {
                        // Map promptId to display text
                        const getPromptText = (promptId: string) => {
                          const promptMap: {[key: string]: string} = {
                            'became_gm_because': 'I became a GM because',
                            'favorite_system': 'My favorite system of all time is',
                            'best_moment': 'My best gaming moment was when',
                            'character_type': 'I always play the character who',
                            'dm_style': 'My DM style can best be described as',
                            'game_goal': 'What I want most from a game is',
                            'player_pet_peeve': 'My biggest pet peeve as a player is',
                            'memorable_npc': 'The most memorable NPC I created was',
                            'campaign_dream': 'My dream campaign would be',
                            'gaming_philosophy': 'My gaming philosophy is'
                          };
                          return promptMap[promptId] || 'Featured prompt';
                        };

                        return (
                          <div key={index} className="border border-gray-200 rounded-xl p-4 shadow-sm" style={{width: '369px', height: '82px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                            <div className="text-lg font-semibold text-gray-800 mb-1">
                              {getPromptText(prompt.promptId)}
                            </div>
                            <div className="text-gray-600 leading-relaxed text-base">
                              {prompt.customText}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">
                      This user hasn't set up any featured prompts yet.
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