import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import AdvancedFilterDropdown from '../../components/UI/AdvancedFilterDropdown';
import { getImageUrl } from '../../utils/imageUtils';
import gameMasterService, { GameMaster, GameMasterFilters } from '../../services/gameMasterService';
import { useFavoriteGM } from '../../hooks/useFavoriteGM';

const GameMastersPage: React.FC = () => {
  const [gameMasters, setGameMasters] = useState<GameMaster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    gameSystem: [] as string[],
    priceRange: [] as string[],
    timezone: [] as string[],
    language: [] as string[],
    gameStyles: [] as string[],
    themes: [] as string[],
    searchName: ''
  });

  // Filter options data
  const gameSystemOptions = [
    { value: 'dnd_5e', label: 'D&D 5th Edition' },
    { value: 'pathfinder_2e', label: 'Pathfinder 2nd Edition' },
    { value: 'call_of_cthulhu', label: 'Call of Cthulhu' },
    { value: 'vampire_masquerade', label: 'Vampire: The Masquerade' },
    { value: 'cyberpunk_red', label: 'Cyberpunk Red' },
    { value: 'other', label: 'Other Systems' }
  ];

  const gameStyleOptions = [
    { value: 'rule_of_cool', label: 'Rule of Cool' },
    { value: 'combat_heavy', label: 'Combat Heavy' },
    { value: 'combat_lite', label: 'Combat Lite' },
    { value: 'dungeon_crawl', label: 'Dungeon Crawl' },
    { value: 'puzzle_mystery', label: 'Puzzle / Mystery Focused' },
    { value: 'hexcrawl_exploration', label: 'Hexcrawl / Exploration' },
    { value: 'roleplay_heavy', label: 'Roleplay Heavy' },
    { value: 'realm_building', label: 'Realm Building' }
  ];

  const themeOptions = [
    { value: 'anime', label: 'Anime' },
    { value: 'battle_royale', label: 'Battle Royale' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'cosmic_horror', label: 'Cosmic Horror' },
    { value: 'cozy', label: 'Cozy' },
    { value: 'cyberpunk', label: 'Cyberpunk' },
    { value: 'dark_fantasy', label: 'Dark Fantasy' },
    { value: 'detective', label: 'Detective' },
    { value: 'epic_fantasy', label: 'Epic Fantasy' },
    { value: 'historical', label: 'Historical' },
    { value: 'horror', label: 'Horror' },
    { value: 'medieval', label: 'Medieval' },
    { value: 'modern', label: 'Modern' },
    { value: 'mystery', label: 'Mystery' },
    { value: 'noir', label: 'Noir' },
    { value: 'pirates', label: 'Pirates' },
    { value: 'post_apocalyptic', label: 'Post-Apocalyptic' },
    { value: 'pulp_adventure', label: 'Pulp Adventure' },
    { value: 'romance', label: 'Romance' },
    { value: 'sci_fi', label: 'Sci-Fi' },
    { value: 'space_opera', label: 'Space Opera' },
    { value: 'steampunk', label: 'Steampunk' },
    { value: 'superhero', label: 'Superhero' },
    { value: 'survival', label: 'Survival' },
    { value: 'urban_fantasy', label: 'Urban Fantasy' },
    { value: 'western', label: 'Western' },
    { value: 'zombie', label: 'Zombie' }
  ];

  const priceRangeOptions = [
    { value: '0-10', label: '$0 - $10' },
    { value: '10-25', label: '$10 - $25' },
    { value: '25-50', label: '$25 - $50' },
    { value: '50+', label: '$50+' }
  ];

  const timezoneOptions = [
    { value: 'EST', label: 'Eastern Time (EST)' },
    { value: 'CST', label: 'Central Time (CST)' },
    { value: 'MST', label: 'Mountain Time (MST)' },
    { value: 'PST', label: 'Pacific Time (PST)' },
    { value: 'GMT', label: 'Greenwich Mean Time (GMT)' },
    { value: 'CET', label: 'Central European Time (CET)' }
  ];

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' },
    { value: 'italian', label: 'Italian' },
    { value: 'portuguese', label: 'Portuguese' }
  ];

  useEffect(() => {
    fetchGameMasters();
  }, []);

  const fetchGameMasters = async () => {
    try {
      setIsLoading(true);
      const response = await gameMasterService.getGameMasters({
        search: filters.searchName,
        timezone: filters.timezone.join(','),
        language: filters.language.join(','),
        gameStyles: filters.gameStyles.join(','),
        themes: filters.themes.join(','),
        system: filters.gameSystem.join(','),
        page: 1,
        limit: 50
      });
      setGameMasters(response.data);
    } catch (error) {
      console.error('Failed to fetch game masters:', error);
      setError('Failed to load game masters');
    } finally {
      setIsLoading(false);
    }
  };

  const getFullName = (gm: GameMaster) => {
    if (gm.firstName && gm.lastName) {
      return `${gm.firstName} ${gm.lastName}`;
    }
    return gm.username;
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">★</span>
      );
    }
    
    const emptyStars = 5 - fullStars;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">★</span>
      );
    }
    
    return stars;
  };

  const calculateYearsOnPlatform = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    return Math.floor((now.getTime() - created.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  // Individual GM Card Component to use the hook
  const GMCard: React.FC<{ gm: GameMaster }> = ({ gm }) => {
    const { isFavorite, isLoading: favoriteLoading, toggleFavorite } = useFavoriteGM(gm._id);

    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 hover:bg-gray-50 hover:border-gray-300">
        <div className="flex">
          {/* Avatar */}
          <div className="flex-shrink-0 mr-6">
            <div className="relative">
              {gm.avatar ? (
                <img
                  src={getImageUrl(gm.avatar)}
                  alt={getFullName(gm)}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div className={`avatar-fallback w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl ${gm.avatar ? 'hidden' : ''}`}>
                {getFullName(gm).charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-xl font-bold text-gray-900 mr-2">
                    {getFullName(gm)}
                  </h3>
                  <div className="flex">
                    {renderRatingStars(gm.stats?.averageRating || 0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700 ml-2">
                    {gm.stats?.averageRating?.toFixed(1)} ({gm.stats?.totalReviews})
                  </span>
                </div>
                
                {/* Price and Stats */}
                <div className="flex items-center text-sm text-gray-600 space-x-4 mb-3">
                  <span className="font-semibold text-lg text-gray-900">
                    {gm.pricing ? `$${gm.pricing.sessionPrice.toFixed(2)}` : '$15.00'}
                  </span>
                  <span>{gm.stats?.yearsOnPlatform || calculateYearsOnPlatform(gm.createdAt || '')} years as a TTRPG Player</span>
                  <span>{gm.stats?.yearsOnPlatform || 1} year as a GM</span>
                  <span>{gm.stats?.gamesHosted} games hosted</span>
                </div>
              </div>

              {/* Favorite Button */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!favoriteLoading && gm._id) {
                    toggleFavorite();
                  }
                }}
                disabled={favoriteLoading || !gm._id}
                className={`flex items-center space-x-1 px-3 py-1 border rounded-lg text-sm transition-colors ml-4 ${
                  isFavorite 
                    ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={isFavorite ? 'text-red-500' : ''}>{isFavorite ? '♥' : '♡'}</span>
                <span>{isFavorite ? 'Following' : 'Follow'}</span>
              </button>
            </div>

            {/* Bio */}
            <div className="mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {gm.bio && gm.bio.length > 400 ? (
                  <>
                    {gm.bio.substring(0, 400)}...
                  </>
                ) : (
                  gm.bio || 'This Game Master hasn\'t added a bio yet.'
                )}
              </p>
            </div>

            {/* View Profile Link */}
            <Link
              to={`/profile/${gm._id}`}
              className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <span>View Profile</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    );
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Error Loading Game Masters</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={fetchGameMasters}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Professional Game Masters</h1>
            <p className="text-gray-600">Find your perfect Pro Game Master! GMs are shown by soonest upcoming session.</p>
          </div>

          {/* Main Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <AdvancedFilterDropdown
              title="I want to play..."
              options={gameSystemOptions}
              selectedValues={filters.gameSystem}
              onSelectionChange={(values) => setFilters({...filters, gameSystem: values})}
              placeholder="Select game systems..."
            />

            <AdvancedFilterDropdown
              title="Price per session"
              options={priceRangeOptions}
              selectedValues={filters.priceRange}
              onSelectionChange={(values) => setFilters({...filters, priceRange: values})}
              placeholder="Select price range..."
            />

            <AdvancedFilterDropdown
              title="Timezone"
              options={timezoneOptions}
              selectedValues={filters.timezone}
              onSelectionChange={(values) => setFilters({...filters, timezone: values})}
              placeholder="Select timezone..."
            />

            <AdvancedFilterDropdown
              title="Language"
              options={languageOptions}
              selectedValues={filters.language}
              onSelectionChange={(values) => setFilters({...filters, language: values})}
              placeholder="Select language..."
            />
          </div>

          {/* Advanced Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="min-w-48">
              <AdvancedFilterDropdown
                title="Game Styles"
                description="Filter by the style of game you like to play."
                options={gameStyleOptions}
                selectedValues={filters.gameStyles}
                onSelectionChange={(values) => setFilters({...filters, gameStyles: values})}
                placeholder="Select game styles..."
              />
            </div>

            <div className="min-w-48">
              <AdvancedFilterDropdown
                title="Theme"
                description="Filter by the themes you would like to see in games."
                options={themeOptions}
                selectedValues={filters.themes}
                onSelectionChange={(values) => setFilters({...filters, themes: values})}
                placeholder="Select themes..."
              />
            </div>

            <div className="relative min-w-48">
              <input
                type="text"
                placeholder="Search by name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 bg-white text-sm"
                value={filters.searchName}
                onChange={(e) => setFilters({...filters, searchName: e.target.value})}
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setFilters({
                  gameSystem: [],
                  priceRange: [],
                  timezone: [],
                  language: [],
                  gameStyles: [],
                  themes: [],
                  searchName: ''
                })}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 text-sm"
              >
                Clear
              </button>
              <button
                onClick={fetchGameMasters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Masters List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {gameMasters.map((gm) => (
            <GMCard key={gm._id} gm={gm} />
          ))}
        </div>

        {gameMasters.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎲</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Game Masters Found</h3>
            <p className="text-gray-600">Try adjusting your search filters to find more Game Masters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameMastersPage;