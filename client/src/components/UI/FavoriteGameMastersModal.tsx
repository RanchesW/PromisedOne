import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoriteService, FavoriteGameMaster } from '../../services/favoriteService';
import { getImageUrl } from '../../utils/imageUtils';
import LoadingSpinner from './LoadingSpinner';

interface FavoriteGameMastersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FavoriteGameMastersModal: React.FC<FavoriteGameMastersModalProps> = ({ isOpen, onClose }) => {
  const [favorites, setFavorites] = useState<FavoriteGameMaster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFavorites();
    }
  }, [isOpen]);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const favoriteGMs = await favoriteService.getFavoriteGameMasters();
      setFavorites(favoriteGMs);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Failed to load favorite game masters');
    } finally {
      setIsLoading(false);
    }
  };

  const getFullName = (gm: FavoriteGameMaster) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-lg p-6 mx-4 relative shadow-lg"
        style={{ width: '630px', height: '525px' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal content */}
        <div className="flex flex-col h-full">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Favorite Game Masters</h2>
            <p className="text-sm text-gray-600">
              You can filter by your favorite Game Masters on the Find Games page.
            </p>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadFavorites}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : favorites.length === 0 ? (
              // Empty state
              <div className="text-center flex-1 flex flex-col justify-center py-8">
                <div className="mb-6 flex items-center justify-center">
                  <img
                    src="/images/empty-state.jpg"
                    alt="Empty treasure chest"
                    className="max-w-full h-auto"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
                <p className="text-lg font-medium text-gray-700">You're not following anyone yet.</p>
              </div>
            ) : (
              // Favorites list
              <div className="space-y-4">
                {favorites.map((gm) => (
                  <div key={gm._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    {/* Avatar */}
                    <div className="relative">
                      {gm.avatar ? (
                        <img
                          src={getImageUrl(gm.avatar)}
                          alt={getFullName(gm)}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                            if (fallback) {
                              (fallback as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className={`avatar-fallback w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm ${gm.avatar ? 'hidden' : ''}`}>
                        {getFullName(gm).charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* GM Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{getFullName(gm)}</p>
                      {gm.stats && (
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex">
                            {renderRatingStars(gm.stats.averageRating)}
                          </div>
                          <span className="text-xs text-gray-600">
                            {gm.stats.averageRating.toFixed(1)} ({gm.stats.totalReviews})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* View Profile Button */}
                    <Link
                      to={`/profile/${gm._id}`}
                      onClick={onClose}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Close button at bottom */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium border border-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoriteGameMastersModal;