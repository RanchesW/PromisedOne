import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Game, GameSystem, Platform, SessionType, ExperienceLevel } from '../types/shared';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import gameService from '../../services/gameService';
import { formatDate } from '../../utils/dateUtils';
import { getImageUrl } from '../../utils/imageUtils';

interface GameSearchFilters {
  keyword?: string;
  system?: GameSystem;
  platform?: Platform;
  sessionType?: SessionType;
  experienceLevel?: ExperienceLevel;
  priceMin?: number;
  priceMax?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'price' | 'created';
  sortOrder?: 'asc' | 'desc';
}

const GamesPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GameSearchFilters>({
    sortBy: 'date',
    sortOrder: 'asc'
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      const result = await gameService.getGames(filters);
      console.log('Fetched games:', result.data?.map(game => ({
        id: game._id,
        title: game.title,
        bannerImage: game.bannerImage ? 'Has banner' : 'No banner',
        iconImage: game.iconImage ? 'Has icon' : 'No icon'
      })));
      setGames(result.data || []);
    } catch (error) {
      console.error('Fetch games error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch games');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [filters]);

  const handleFilterChange = (key: keyof GameSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'date',
      sortOrder: 'asc'
    });
  };

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      [GameSystem.DND_5E]: 'D&D 5e',
      [GameSystem.PATHFINDER_2E]: 'Pathfinder 2e',
      [GameSystem.CALL_OF_CTHULHU]: 'Call of Cthulhu',
      [GameSystem.VAMPIRE_MASQUERADE]: 'Vampire: The Masquerade',
      [GameSystem.CYBERPUNK_RED]: 'Cyberpunk Red',
      [GameSystem.OTHER]: customSystem || 'Other'
    };
    return systemNames[system] || system;
  };

  const getPlatformIcon = (platform: Platform) => {
    const icons = {
      [Platform.ONLINE]: '💻',
      [Platform.IN_PERSON]: '🏠',
      [Platform.HYBRID]: '🔄'
    };
    return icons[platform] || '❓';
  };

  const getSessionTypeColor = (sessionType: SessionType) => {
    const colors = {
      [SessionType.ONE_SHOT]: 'bg-green-600',
      [SessionType.MINI_SERIES]: 'bg-yellow-600',
      [SessionType.CAMPAIGN]: 'bg-purple-600'
    };
    return colors[sessionType] || 'bg-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Browse Games</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>⚙️</span>
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
        </div>

        {/* Category Tags */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors">
            Play Today
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
            Few Seats Left
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
            New Campaigns
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
            Learn to Play D&D
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
            Play by Post
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
            For Beginners
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
            High Level
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
            Dungeons & Dragons
          </button>
        </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white rounded-lg p-6 mb-8 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.keyword || ''}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                placeholder="Search games..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* System */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                System
              </label>
              <select
                value={filters.system || ''}
                onChange={(e) => handleFilterChange('system', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Systems</option>
                <option value={GameSystem.DND_5E}>D&D 5e</option>
                <option value={GameSystem.PATHFINDER_2E}>Pathfinder 2e</option>
                <option value={GameSystem.CALL_OF_CTHULHU}>Call of Cthulhu</option>
                <option value={GameSystem.VAMPIRE_MASQUERADE}>Vampire: The Masquerade</option>
                <option value={GameSystem.CYBERPUNK_RED}>Cyberpunk Red</option>
                <option value={GameSystem.OTHER}>Other</option>
              </select>
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Platform
              </label>
              <select
                value={filters.platform || ''}
                onChange={(e) => handleFilterChange('platform', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Platforms</option>
                <option value={Platform.ONLINE}>Online</option>
                <option value={Platform.IN_PERSON}>In Person</option>
                <option value={Platform.HYBRID}>Hybrid</option>
              </select>
            </div>

            {/* Session Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Session Type
              </label>
              <select
                value={filters.sessionType || ''}
                onChange={(e) => handleFilterChange('sessionType', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value={SessionType.ONE_SHOT}>One Shot</option>
                <option value={SessionType.MINI_SERIES}>Mini Series</option>
                <option value={SessionType.CAMPAIGN}>Campaign</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Min Price ($)
              </label>
              <input
                type="number"
                value={filters.priceMin || ''}
                onChange={(e) => handleFilterChange('priceMin', e.target.value ? Number(e.target.value) : undefined)}
                min="0"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Max Price ($)
              </label>
              <input
                type="number"
                value={filters.priceMax || ''}
                onChange={(e) => handleFilterChange('priceMax', e.target.value ? Number(e.target.value) : undefined)}
                min="0"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy || 'date'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Date</option>
                <option value="price">Price</option>
                <option value="created">Recently Added</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Order
              </label>
              <select
                value={filters.sortOrder || 'asc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          <button
            onClick={clearFilters}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-300"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-600 text-white p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {/* Games Grid */}
      {!isLoading && !error && (
        <>
          {games.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎲</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Games Found</h3>
              <p className="text-slate-600 mb-6">
                Try adjusting your filters or check back later for new games.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {games.map((game) => (
                <Link
                  key={game._id}
                  to={`/games/${game._id}`}
                  className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-200 group border-2 border-gray-200 hover:border-gray-300"
                  style={{ width: '325px', height: '480px' }}
                >
                  {/* Game Banner */}
                  {game.bannerImage ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getImageUrl(game.bannerImage)}
                        alt={game.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Banner image failed to load:', {
                            originalPath: game.bannerImage,
                            processedUrl: getImageUrl(game.bannerImage),
                            gameTitle: game.title
                          });
                          e.currentTarget.style.display = 'none';
                          const fallbackDiv = e.currentTarget.parentElement?.querySelector('.fallback-banner');
                          if (fallbackDiv) {
                            (fallbackDiv as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                      <div className="fallback-banner absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 items-center justify-center hidden">
                        <div className="text-white text-center">
                          <div className="text-4xl mb-2">🎲</div>
                          <div className="text-sm font-medium">{game.title}</div>
                        </div>
                      </div>
                      
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="text-4xl mb-2">🎲</div>
                        <div className="text-sm text-white text-center px-2 font-medium">{game.title}</div>
                      </div>
                      
                    </div>
                  )}

                  <div className="flex flex-col" style={{ height: 'calc(480px - 192px)' }}>
                    <div className="p-4 flex-1">
                      {/* Status Badge */}
                      <div className="mb-3">
                        {game.availableSeats <= 1 ? (
                          <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded uppercase font-semibold tracking-wide">
                            {game.availableSeats === 0 ? 'FULL' : `${game.availableSeats} NEEDED TO START`}
                          </span>
                        ) : game.availableSeats <= 4 ? (
                          <span className="inline-block bg-orange-500 text-white text-xs px-2 py-1 rounded uppercase font-semibold tracking-wide">
                            {game.availableSeats} NEEDED TO START
                          </span>
                        ) : (
                          <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded uppercase font-semibold tracking-wide">
                            {game.availableSeats} NEEDED TO START
                          </span>
                        )}
                      </div>

                      {/* Game Title */}
                      <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">
                        {game.title}
                      </h3>

                      {/* Game System */}
                      <div className="text-sm text-gray-600 mb-3 font-medium">
                        {getSystemDisplayName(game.system, game.customSystem)}
                      </div>

                      {/* Schedule */}
                      <div className="flex items-center gap-1 text-sm text-gray-700 mb-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {new Date(game.schedule.startTime).toLocaleDateString('en-US', {
                            weekday: 'long'
                          })} / {new Date(game.schedule.startTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })} - {new Date(game.schedule.startTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            timeZoneName: 'short'
                          })}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-1 text-sm text-gray-700 mb-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span className="font-semibold">
                          {formatPrice(game.price, game.currency)} / Session
                        </span>
                      </div>

                      {/* Seats */}
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{game.capacity - game.availableSeats} / {game.capacity} Seats Filled</span>
                      </div>
                    </div>

                    {/* GM Info - Always at bottom */}
                    <div className="px-4 pb-4 pt-3 border-t border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-3">
                        {/* GM Avatar - Real photo or fallback */}
                        {game.gm && typeof game.gm === 'object' && (game.gm as any).avatar ? (
                          <img
                            src={getImageUrl((game.gm as any).avatar)}
                            alt={(game.gm as any).firstName || (game.gm as any).username || 'GM'}
                            className="w-8 h-8 rounded-full object-cover border border-gray-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.parentElement?.querySelector('.gm-avatar-fallback');
                              if (fallback) {
                                (fallback as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div className={`gm-avatar-fallback w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-sm font-bold ${game.gm && typeof game.gm === 'object' && (game.gm as any).avatar ? 'hidden' : ''}`}>
                          {game.gm && typeof game.gm === 'object' 
                            ? ((game.gm as any).username?.charAt(0).toUpperCase() || (game.gm as any).firstName?.charAt(0).toUpperCase() || 'GM')
                            : 'GM'
                          }
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-base font-bold text-gray-900 truncate">
                            {game.gm && typeof game.gm === 'object' 
                              ? ((game.gm as any).firstName && (game.gm as any).lastName 
                                  ? `${(game.gm as any).firstName} ${(game.gm as any).lastName}`
                                  : (game.gm as any).username)
                              : 'Game Master'
                            }
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-yellow-400 text-lg">⭐</span>
                          <span className="font-bold text-gray-900 ml-1 text-base">
                            {game.gm && typeof game.gm === 'object' && (game.gm as any).stats?.averageRating
                              ? (game.gm as any).stats.averageRating.toFixed(1)
                              : '0.0'
                            }
                          </span>
                          <span className="text-gray-500 ml-1 text-sm font-medium">
                            ({game.gm && typeof game.gm === 'object' && (game.gm as any).stats?.totalReviews
                              ? (game.gm as any).stats.totalReviews
                              : '0'
                            })
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default GamesPage;
