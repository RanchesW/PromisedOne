import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Game, GameSystem, Platform, SessionType, ExperienceLevel, UserRole } from '../types/shared';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import gameService from '../../services/gameService';
import { getImageUrl } from '../../utils/imageUtils';

const GameDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchGame();
    }
  }, [id]);

  const fetchGame = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const gameData = await gameService.getGame(id);
      setGame(gameData);
    } catch (error) {
      console.error('Fetch game error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch game');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price);
  };

  const getSystemDisplayName = (system: GameSystem, customSystem?: string) => {
    const systemNames = {
      [GameSystem.DND_5E]: 'D&D 5th Edition',
      [GameSystem.PATHFINDER_2E]: 'Pathfinder 2nd Edition',
      [GameSystem.CALL_OF_CTHULHU]: 'Call of Cthulhu',
      [GameSystem.VAMPIRE_MASQUERADE]: 'Vampire: The Masquerade',
      [GameSystem.CYBERPUNK_RED]: 'Cyberpunk Red',
      [GameSystem.OTHER]: customSystem || 'Other'
    };
    return systemNames[system] || system;
  };

  const canEditGame = user && game && (
    user._id === game.gm || user.role === UserRole.ADMIN
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Game Not Found</h2>
          <p className="text-slate-600 mb-6">
            {error || 'The game you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <button
            onClick={() => navigate('/games')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Browse Other Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <nav className="flex items-center space-x-4 text-sm text-gray-600">
              <Link to="/games" className="hover:text-blue-600">All Games</Link>
              <span>/</span>
              <span>{getSystemDisplayName(game.system, game.customSystem)}</span>
              <span>/</span>
              <span className="text-gray-900 font-medium truncate max-w-xs">{game.title}</span>
            </nav>
            {canEditGame && (
              <Link
                to={`/games/${game._id}/edit`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Edit Game
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Hero Banner and Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-start" style={{ gap: '40px' }}>
          <div className="flex flex-col">
            {/* Banner */}
            <div className="relative bg-gray-900 overflow-hidden rounded-lg" style={{ height: '423px', width: '752px' }}>
              {game.bannerImage ? (
                <img
                  src={getImageUrl(game.bannerImage)}
                  alt={game.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg"></div>
              )}
            </div>
            
            {/* Game Title and Description - Below Banner */}
            <div className="mt-6" style={{ width: '752px' }}>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{game.title}</h1>
              <p className="text-gray-700 text-lg leading-relaxed mb-0">
                {game.description}
              </p>
            </div>
          </div>
          
          {/* Right Sidebar - Booking (at banner level) */}
          <div style={{ width: '332px', height: '560px' }}>
            <div className="bg-white rounded-lg shadow-sm border sticky top-8 h-full">
              {/* Price Section */}
              <div className="p-4 pb-3">
                <div className="text-left">
                  <div className="text-sm text-blue-600 font-medium mb-1">
                    {game.availableSeats} NEEDED TO START
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(game.price, game.currency)}
                    </span>
                    <span className="text-gray-600 text-sm ml-1">/ Session</span>
                  </div>
                </div>
              </div>
              
              <hr className="border-gray-200" />
              
              {/* Details Section */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">DETAILS</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      {game.schedule.recurring?.frequency ? 
                        `Weekly / ${new Date(game.schedule.startTime).toLocaleDateString('en-US', { 
                          weekday: 'long' 
                        })} - ${new Date(game.schedule.startTime).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          timeZone: game.schedule.timezone
                        })} GMT+5` :
                        `${new Date(game.schedule.startTime).toLocaleDateString()} - ${new Date(game.schedule.startTime).toLocaleTimeString()}`
                      }
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Session Duration / {(() => {
                      const start = new Date(game.schedule.startTime);
                      const end = new Date(game.schedule.endTime);
                      const diffHours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
                      return `${diffHours}-${diffHours + 1} hours`;
                    })()}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Campaign Length / {game.sessionType === SessionType.CAMPAIGN ? '15-18 Sessions' : 
                         game.sessionType === SessionType.MINI_SERIES ? '3-5 Sessions' : '1 Session'}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 01 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{game.bookedSeats || 0} / {game.capacity} Seats Filled</span>
                  </div>
                </div>
              </div>
              
              <hr className="border-gray-200" />
              
              {/* Game Master Section */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">GAME MASTER</h3>
                {(() => {
                  // Use gmDetails if available, otherwise use the populated game.gm object
                  const gmInfo = game.gmDetails || (game.gm as any);
                  
                  console.log('Selected gmInfo:', gmInfo);
                  console.log('All gmInfo keys:', Object.keys(gmInfo || {}));
                  console.log('gmInfo.pronouns:', gmInfo?.pronouns);
                  console.log('gmInfo.profile:', gmInfo?.profile);
                  
                  if (gmInfo) {
                    return (
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          {gmInfo.avatar ? (
                            <img
                              src={getImageUrl(gmInfo.avatar)}
                              alt={`${gmInfo.firstName} ${gmInfo.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {gmInfo.firstName?.[0] || gmInfo.username?.[0] || 'GM'}
                              {gmInfo.lastName?.[0] || ''}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">
                                {gmInfo.firstName && gmInfo.lastName 
                                  ? `${gmInfo.firstName} ${gmInfo.lastName}` 
                                  : gmInfo.username || 'Game Master'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {/* Use current user's pronouns if viewing own game, otherwise try gmInfo pronouns */}
                                {user && user._id === (game.gm as any)?._id 
                                  ? (user.pronouns?.join('/') || (user as any).profile?.pronouns?.join('/'))
                                  : (gmInfo.pronouns?.join('/'))
                                }
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="text-yellow-400 text-sm mr-1">★</span>
                              <span className="text-xs font-medium text-gray-700">
                                {gmInfo.stats?.averageRating?.toFixed(1) || '5.0'}
                                {typeof gmInfo.stats?.totalReviews === 'number' ? ` (${gmInfo.stats.totalReviews})` : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // Fallback when no GM info is available
                  return (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        GM
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">
                              Game Master
                            </div>
                            <div className="text-xs text-gray-500">
                              they/them
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-yellow-400 text-sm mr-1">★</span>
                            <span className="text-xs font-medium text-gray-700">
                              5.0 (7)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              <hr className="border-gray-200" />
              
              {/* Join Section */}
              <div className="p-4">
                <div className="mb-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800 text-center">
                      This game will begin once {game.availableSeats} players have joined
                    </p>
                  </div>
                </div>
                
                {game.availableSeats > 0 ? (
                  <button 
                    onClick={() => navigate(`/games/${game._id}/join`)}
                    className="w-full text-white py-3 rounded-lg font-semibold transition-colors mb-4 hover:opacity-90"
                    style={{ backgroundColor: '#0B7DB8' }}
                  >
                    Join Campaign
                  </button>
                ) : (
                  <button disabled className="w-full bg-gray-400 text-gray-600 py-3 rounded-lg font-semibold cursor-not-allowed mb-4">
                    Fully Booked
                  </button>
                )}
                
                <div className="text-xs text-gray-500 text-center">
                  Each player will be charged when a session starts.
                </div>
              </div>
            </div>
            
            {/* Report Adventure - Outside booking card */}
            <div className="mt-4" style={{ width: '332px' }}>
              <button className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 text-sm transition-colors">
                <span>🚩</span>
                <span className="underline">Report Adventure</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content - Game Details and GM Info */}
        <div className="flex justify-center mt-8">
          <div className="flex" style={{ gap: '40px', width: 'fit-content' }}>
            {/* Left Column - Game Details aligned under banner */}
            <div style={{ width: '752px' }}>
              {/* Game Details Grid */}
                   <div className="grid grid-cols-4 gap-0" style={{ marginTop: '-8px' }}>
                <div className="text-left">
                  <div className="text-xs text-gray-600 uppercase tracking-wide mb-1 font-bold" style={{ fontSize: '12px' }}>TYPE</div>
                  <div className="font-semibold text-gray-900 uppercase" style={{ fontSize: '12px' }}>
                    {game.sessionType.replace('_', ' ')}
                  </div>
                </div>
                
                <div className="text-left">
                  <div className="text-xs text-gray-600 uppercase tracking-wide mb-1 font-bold" style={{ fontSize: '12px' }}>SYSTEM</div>
                  <div className="font-semibold text-gray-900 uppercase" style={{ fontSize: '12px' }}>
                    {getSystemDisplayName(game.system, game.customSystem)}
                  </div>
                </div>
                
                <div className="text-left">
                  <div className="text-xs text-gray-600 uppercase tracking-wide mb-0.5 font-bold" style={{ fontSize: '12px' }}>EXPERIENCE</div>
                  <div className="font-semibold text-gray-900 uppercase" style={{ fontSize: '12px' }}>
                    {game.experienceLevel.replace('_', ' ')}
                  </div>
                </div>
                
                <div className="text-left">
                  <div className="text-xs text-gray-600 uppercase tracking-wide mb-0.5 font-bold" style={{ fontSize: '12px' }}>AGE</div>
                  <div className="font-semibold text-gray-900 uppercase" style={{ fontSize: '12px' }}>
                    {game.ageRestriction ? `${game.ageRestriction.minAge}+` : 'ALL AGES'}
                  </div>
                </div>
              </div>

              {/* Money Back Guarantee */}
              <div className="rounded-xl mt-6 flex items-center" style={{ backgroundColor: '#EFFBFF', padding: '20px 24px' }}>
                <img src={process.env.PUBLIC_URL + '/images/weapon-pile-coins.jpg'} alt="Money Back Guarantee" style={{ width: 70, height: 50, display: 'block', marginRight: 20 }} />
                <div>
                  <div className="font-bold text-lg mb-1" style={{ lineHeight: '1.2', color: '#00334E' }}>KazRPG Money Back Guarantee</div>
                  <div className="text-blue-900 text-sm" style={{ lineHeight: '1.4' }}>
                    If your game doesn't happen, we guarantee a refund. Just reach out to KazRPG Support.
                    <a href="/refund-policy" className="font-semibold underline ml-1 text-sm" style={{color: '#015782' }}>Refund Policy</a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Game Master aligned under sidebar */}
            <div style={{ width: '332px' }} className="space-y-6">
              {game.gmDetails && (
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Meet the Game Master</h3>
                  
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="relative">
                      {game.gmDetails.avatar ? (
                        <img
                          src={getImageUrl(game.gmDetails.avatar)}
                          alt={`${game.gmDetails.firstName} ${game.gmDetails.lastName}`}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {game.gmDetails.firstName?.[0]}{game.gmDetails.lastName?.[0]}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-bold text-gray-900">
                          {game.gmDetails.firstName} {game.gmDetails.lastName}
                        </h4>
                        <span className="text-gray-500 text-sm">({game.gmDetails.pronouns?.join('/')})</span>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star}>
                              {star <= (game.gmDetails?.stats?.averageRating || 0) ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {game.gmDetails.stats?.averageRating?.toFixed(1) || '5.0'}
                          {typeof game.gmDetails.stats?.totalReviews === 'number' ? ` (${game.gmDetails.stats.totalReviews})` : ''}
                        </span>
                      </div>
                      
                      {/* Identity Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(game.gmDetails.identityTags || ['STREAMER', 'LGBTQ+', 'QUEER', 'VETERAN', 'DISABLED', 'PUBLISHED WRITER', 'GAME DESIGNER']).slice(0, 4).map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                          >
                            {tag.toUpperCase()}
                          </span>
                        ))}
                      </div>
                      
                      <button className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <span>♡</span>
                        <span>Follow</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-4 h-4 mr-2">📅</span>
                      <span>{game.gmDetails.createdAt ? 
                        Math.floor((new Date().getTime() - new Date(game.gmDetails.createdAt).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
                        2} years on KazRPG</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-4 h-4 mr-2">🎲</span>
                      <span>{game.gmDetails.stats?.gamesHosted || 83} games hosted</span>
                    </div>
                    <div className="flex items-start text-sm text-gray-600">
                      <span className="w-4 h-4 mr-2 mt-0.5">⭐</span>
                      <span>Highly rated for: Inclusive, Sets the Mood, Creativity</span>
                    </div>
                  </div>
                  
                  {/* Social Icons */}
                  <div className="flex items-center space-x-3 mb-6">
                    <button className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <span className="text-sm">💬</span>
                    </button>
                    <button className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <span className="text-sm">✕</span>
                    </button>
                  </div>
                  
                  {/* About Section */}
                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-900 mb-3">About me</h5>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {game.gmDetails.bio ? (
                        game.gmDetails.bio.length > 200 ? (
                          <>
                            {game.gmDetails.bio.substring(0, 200)}...
                          </>
                        ) : (
                          game.gmDetails.bio
                        )
                      ) : (
                        'This Game Master has years of experience running engaging campaigns and welcomes players of all levels.'
                      )}
                    </p>
                    <div className="text-sm">
                      <span>...</span>
                    </div>
                  </div>
                  
                  {/* View Profile Link */}
                  <Link
                    to={`/profile/${game.gmDetails._id}`}
                    className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors mb-4"
                  >
                    <span>View Profile</span>
                    <span>→</span>
                  </Link>
                  
                  {/* Message Button */}
                  <button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg font-medium transition-colors">
                    Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetailPage;