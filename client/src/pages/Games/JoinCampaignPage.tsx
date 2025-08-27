import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Game } from '../../types/shared';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import gameService from '../../services/gameService';
import { getImageUrl } from '../../utils/imageUtils';
import { useFavoriteGM } from '../../hooks/useFavoriteGM';

const JoinCampaignPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerCount, setPlayerCount] = useState(1);
  const [noteToGM, setNoteToGM] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancellationPolicy, setShowCancellationPolicy] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  
  // Get GM ID from game data
  const getGMId = () => {
    if (!game) return '';
    const gmInfo = game.gmDetails || (game.gm as any);
    return gmInfo?._id || '';
  };
  
  // Favorite functionality
  const { isFavorite, isLoading: favoriteLoading, toggleFavorite } = useFavoriteGM(getGMId());

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

  const getSystemDisplayName = (system: string, customSystem?: string) => {
    const systemNames: { [key: string]: string } = {
      'dnd_5e': 'D&D 5th Edition',
      'pathfinder_2e': 'Pathfinder 2nd Edition',
      'call_of_cthulhu': 'Call of Cthulhu',
      'vampire_masquerade': 'Vampire: The Masquerade',
      'cyberpunk_red': 'Cyberpunk Red',
      'other': customSystem || 'Other'
    };
    return systemNames[system] || system;
  };

  const getNextSessionDate = () => {
    if (!game) return 'Wed, Aug 27 at 1:00 PM';
    
    const startTime = new Date(game.schedule.startTime);
    const now = new Date();
    
    // If the start time is in the future, use it
    if (startTime > now) {
      return startTime.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }) + ' at ' + startTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    // If it's a recurring game and start time has passed, calculate next occurrence
    if (game.schedule.recurring?.frequency === 'weekly') {
      const nextSession = new Date(startTime);
      while (nextSession <= now) {
        nextSession.setDate(nextSession.getDate() + 7);
      }
      
      return nextSession.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }) + ' at ' + nextSession.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    // Default fallback
    return startTime.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }) + ' at ' + startTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const calculateTotal = () => {
    if (!game) {
      return {
        basePrice: 0,
        serviceFee: 0,
        total: 0
      };
    }
    const basePrice = game.price * playerCount;
    const serviceFee = Math.round(basePrice * 0.112 * 100) / 100; // 11.2% service fee
    return {
      basePrice,
      serviceFee,
      total: basePrice + serviceFee
    };
  };

  const handleConfirmAndJoin = async () => {
    if (!game || !user || !ageConfirmed) return;
    
    setIsProcessing(true);
    
    try {
      // Here we would integrate with Stripe and create the booking
      // For now, just navigate to success or implement payment flow
      console.log('Processing payment for game:', game._id, 'players:', playerCount, 'note:', noteToGM);
      
      // Simulate payment processing
      setTimeout(() => {
        setIsProcessing(false);
        // Navigate to My Games page
        navigate('/my-games');
      }, 2000);
      
    } catch (error) {
      console.error('Booking error:', error);
      setIsProcessing(false);
    }
  };

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

  const pricing = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Request to join Campaign</h1>
        <div className="flex gap-8">
          {/* Left Column - Campaign Details */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Details</h2>
              
              {/* Game Type */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1 flex items-center">
                  GAME TYPE
                  <span className="ml-2 w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-xs text-gray-600">?</span>
                  </span>
                </div>
                <div className="text-base text-gray-900">Campaign</div>
              </div>
              
              {/* Schedule */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">SCHEDULE</div>
                <div className="text-base text-gray-900">
                  Weekly / {new Date(game.schedule.startTime).toLocaleDateString('en-US', { 
                    weekday: 'long' 
                  })} - {new Date(game.schedule.startTime).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true
                  })} GMT+5
                </div>
              </div>

              {/* Player Count */}
              <div className="mb-6">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-2">PLAYER COUNT</div>
                <div className="relative">
                  <select 
                    value={playerCount}
                    onChange={(e) => setPlayerCount(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 bg-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer shadow-sm"
                    style={{ 
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      backgroundImage: 'none'
                    }}
                  >
                    {Array.from({ length: Math.min(game.availableSeats, 4) }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Select the number of players you are booking for. You will be charged for each player.
                </p>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment</h2>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Powered by</div>
                <div className="text-blue-600 font-bold text-lg">stripe</div>
              </div>
              
              {/* Card Input Placeholder */}
              <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
                <input 
                  type="text" 
                  placeholder="Номер карты" 
                  className="w-full bg-transparent border-none outline-none text-gray-700"
                />
                <div className="flex gap-4 mt-2">
                  <input 
                    type="text" 
                    placeholder="MM / ГГ" 
                    className="flex-1 bg-transparent border-none outline-none text-gray-700"
                  />
                  <input 
                    type="text" 
                    placeholder="CVC" 
                    className="flex-1 bg-transparent border-none outline-none text-gray-700"
                  />
                </div>
              </div>
              
              {/* Payment Icons */}
              <div className="flex justify-center gap-2 mt-4">
                <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">AMEX</div>
                <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                <div className="w-8 h-5 bg-blue-800 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                <div className="w-8 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">DISC</div>
              </div>
            </div>

            {/* Leave a note section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Leave a note for your Game Master</h2>
              
              {/* GM Info */}
              <div className="flex items-start space-x-4 mb-6">
                {(() => {
                  // Use gmDetails if available, otherwise use the populated game.gm object
                  const gmInfo = game.gmDetails || (game.gm as any);
                  
                  return (
                    <>
                      <div className="relative">
                        {gmInfo?.avatar ? (
                          <img
                            src={getImageUrl(gmInfo.avatar)}
                            alt={`${gmInfo.firstName || gmInfo.username || 'Game Master'}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {gmInfo?.firstName?.[0] || gmInfo?.username?.[0] || 'GM'}
                            {gmInfo?.lastName?.[0] || ''}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-bold text-gray-900 text-base">
                              {gmInfo?.firstName && gmInfo?.lastName 
                                ? `${gmInfo.firstName} ${gmInfo.lastName}` 
                                : gmInfo?.username || 'Game Master'}
                              {gmInfo?.pronouns && (
                                <span className="text-gray-500 text-sm ml-2">({gmInfo.pronouns.join('/')})</span>
                              )}
                            </div>
                            <div className="flex items-center mt-1">
                              <span className="text-yellow-400 mr-1">★</span>
                              <span className="text-sm font-medium text-gray-700">
                                {gmInfo?.stats?.averageRating?.toFixed(1) || '0.0'} ({gmInfo?.stats?.totalReviews || 0})
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              if (!favoriteLoading && getGMId()) {
                                toggleFavorite();
                              }
                            }}
                            disabled={favoriteLoading || !getGMId()}
                            className={`flex items-center space-x-1 transition-colors ${favoriteLoading || !getGMId() ? 'opacity-50 cursor-not-allowed' : ''} ${
                              isFavorite 
                                ? 'text-red-500 hover:text-red-600' 
                                : 'text-gray-500 hover:text-blue-600'
                            }`}
                          >
                            <svg className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="text-sm">{isFavorite ? 'Following' : 'Follow'}</span>
                          </button>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span>
                              {gmInfo?.createdAt ? 
                                Math.max(0, Math.floor((new Date().getTime() - new Date(gmInfo.createdAt).getTime()) / (365.25 * 24 * 60 * 60 * 1000))) : 
                                0} years on KazRPG
                            </span>
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{gmInfo?.stats?.gamesHosted || 0} games hosted</span>
                          </div>
                        </div>
                        {gmInfo?.identityTags && gmInfo.identityTags.length > 0 && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>Highly rated for: <span className="font-medium">{gmInfo.identityTags.slice(0, 3).join(', ')}</span></span>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Party Notes */}
              {game.partyNotes && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-2">Party notes</h4>
                  <p className="text-sm text-gray-700">
                    {game.partyNotes}
                  </p>
                </div>
              )}

              {/* Note Input */}
              <div className="mb-4">
                <textarea
                  value={noteToGM}
                  onChange={(e) => setNoteToGM(e.target.value)}
                  placeholder="Note to Game Master"
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder-gray-400"
                />
              </div>
              <p className="text-sm text-gray-500">
                Let the Game Master know what you are excited about and what your experience level is.
              </p>
            </div>

            {/* Cancellation Policy */}
            <div className="mt-6">
              <button 
                className="flex items-center justify-between w-full text-left text-gray-800 hover:text-gray-900 text-base font-medium py-2"
                onClick={() => setShowCancellationPolicy(!showCancellationPolicy)}
              >
                <span>Cancellation / Refund Policy</span>
                <span className={`transform transition-transform ${showCancellationPolicy ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              
              {showCancellationPolicy && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border text-sm text-gray-700 leading-relaxed">
                  <p className="mb-4">
                    You can skip a session and/or leave a campaign/one-shot, without penalty, up to 24 hours before the start of the session. After that time, you will no longer be able to leave the campaign/one-shot or skip the session.
                  </p>
                  
                  <p className="mb-4">
                    If you need to skip a session or want to leave the campaign/one-shot less than 24 hours before the start of the session, you will need to reach out to your GM to request a session skip or to be removed from the campaign.
                  </p>
                  
                  <p className="mb-4">
                    All refunds are given as player credit.
                  </p>
                  
                  <p>
                    For more information, please review our{' '}
                    <a href="/refund-policy" className="text-blue-600 hover:underline font-medium">
                      Refund Policy
                    </a>.
                  </p>
                </div>
              )}
            </div>

            {/* Age Confirmation */}
            <div className="mt-6 flex items-center">
              <input 
                type="checkbox" 
                id="age-confirm" 
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mr-3 w-4 h-4" 
              />
              <label htmlFor="age-confirm" className="text-sm text-gray-700">
                Click here to confirm you are 18 or older to join this game.
              </label>
            </div>

            <div className="text-sm text-gray-500 mt-2">
              Search for "All Ages" games{' '}
              <a href="/games?age=all" className="text-blue-600 hover:underline">Here</a>.
            </div>

            <div className="text-sm text-gray-500 mt-4">
              By completing your purchase you agree to the{' '}
              <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a> and the{' '}
              <a href="/terms-of-service" className="text-blue-600 hover:underline">Terms of Service</a>.
            </div>

            {/* Action Button */}
            <button 
              onClick={handleConfirmAndJoin}
              disabled={isProcessing || !ageConfirmed}
              className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Confirm and Join'}
            </button>
          </div>

          {/* Right Column - Campaign Summary */}
          <div className="w-80">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden sticky top-8">
              {/* Campaign Image */}
              <div className="relative h-48 bg-gradient-to-r from-purple-600 to-blue-600">
                {game.bannerImage ? (
                  <img
                    src={getImageUrl(game.bannerImage)}
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                ) : null}
                <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                  {game.availableSeats} SEATS LEFT
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2">
                  {game.title.length > 50 ? `${game.title.substring(0, 50)}...` : game.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {getSystemDisplayName(game.system, game.customSystem)}
                </p>

                {/* Pricing Details */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">DETAILS</h4>
                  <div className="space-y-2 text-xs text-black">
                    <div className="flex justify-between">
                      <span>${game.price.toFixed(2)} × {playerCount} player{playerCount > 1 ? 's' : ''}</span>
                      <span>${pricing.basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Fee</span>
                      <span>${pricing.serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total (USD)</span>
                      <span>${pricing.total.toFixed(2)} / session</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">NOTES</h4>
                  <div className="text-xs text-black">
                    <div className="mb-2">
                      <strong>You will not be charged yet.</strong> You will be charged at the start of the session.
                    </div>
                    <div>
                      The first possible session could be <strong>{getNextSessionDate()}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinCampaignPage;