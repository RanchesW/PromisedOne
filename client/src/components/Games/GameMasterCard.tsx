import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUtils';
import { useFavoriteGM } from '../../hooks/useFavoriteGM';

interface GameMasterCardProps {
  gm: {
    _id?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    yearsOnPlatform?: number;
    stats?: {
      averageRating?: number;
      gamesHosted?: number;
      reviewCount?: number;
    };
    badges?: string[];
    specialties?: string[];
  };
}

const GameMasterCard: React.FC<GameMasterCardProps> = ({ gm }) => {
  const { isFavorite, isLoading, toggleFavorite } = useFavoriteGM(gm._id || '');
  
  const getFullName = () => {
    if (gm.firstName && gm.lastName) {
      return `${gm.firstName} ${gm.lastName}`;
    }
    return gm.username || 'Unknown User';
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">★</span>
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">☆</span>
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">☆</span>
      );
    }
    
    return stars;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Meet the Game Master</h3>
      
      <div className="flex items-start space-x-4 mb-6">
        {/* Avatar */}
        <div className="relative">
          {gm.avatar ? (
            <img
              src={getImageUrl(gm.avatar)}
              alt={getFullName()}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => {
                console.error('Avatar failed to load:', gm.avatar);
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                if (fallback) {
                  (fallback as HTMLElement).style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div className={`avatar-fallback w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl ${gm.avatar ? 'hidden' : ''}`}>
            {getFullName().charAt(0).toUpperCase()}
          </div>
        </div>

        {/* GM Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-lg font-bold text-gray-900">
              {getFullName()}
            </h4>
            {gm.username && (
              <span className="text-sm text-gray-500">({gm.username})</span>
            )}
          </div>
          
          {/* Rating */}
          {gm.stats?.averageRating && (
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center">
                {renderRatingStars(gm.stats.averageRating)}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {gm.stats.averageRating.toFixed(1)} ({gm.stats.reviewCount || 0})
              </span>
            </div>
          )}
          
          {/* Badges */}
          <div className="flex flex-wrap gap-1 mb-2">
            {gm.badges?.map((badge, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Follow Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isLoading && gm._id) {
              toggleFavorite();
            }
          }}
          disabled={isLoading || !gm._id}
          className={`flex items-center space-x-1 px-3 py-1 border rounded-lg text-sm transition-colors ${
            isFavorite 
              ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className={isFavorite ? 'text-red-500' : ''}>{isFavorite ? '♥' : '♡'}</span>
          <span>{isFavorite ? 'Following' : 'Follow'}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        {gm.yearsOnPlatform && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-4 h-4 mr-2">📅</span>
            <span>{gm.yearsOnPlatform} years on KazRPG</span>
          </div>
        )}
        
        {gm.stats?.gamesHosted && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-4 h-4 mr-2">🎲</span>
            <span>{gm.stats.gamesHosted} games hosted</span>
          </div>
        )}
        
        {gm.specialties && gm.specialties.length > 0 && (
          <div className="flex items-start text-sm text-gray-600">
            <span className="w-4 h-4 mr-2 mt-0.5">⭐</span>
            <span>Highly rated for: {gm.specialties.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Social Icons */}
      <div className="flex items-center space-x-3 mb-4">
        <button className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
          <span className="text-sm">💬</span>
        </button>
        <button className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
          <span className="text-sm">✕</span>
        </button>
      </div>

      {/* About Me Section */}
      <div className="mb-4">
        <h5 className="font-semibold text-gray-900 mb-2">About me</h5>
        <p className="text-sm text-gray-600 leading-relaxed">
          {gm.bio ? (
            gm.bio.length > 150 ? (
              <>
                {gm.bio.substring(0, 150)}...
              </>
            ) : (
              gm.bio
            )
          ) : (
            'This Game Master hasn\'t added a bio yet.'
          )}
        </p>
      </div>

      {/* View Profile Button */}
      {gm._id ? (
        <Link
          to={`/profile/${gm._id}`}
          className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <span>View Profile</span>
          <span>→</span>
        </Link>
      ) : (
        <span className="inline-flex items-center space-x-1 text-sm text-gray-400 cursor-not-allowed">
          <span>View Profile</span>
          <span>→</span>
        </span>
      )}

      {/* Message Button */}
      <div className="mt-4">
        <button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg font-medium transition-colors">
          Message
        </button>
      </div>
    </div>
  );
};

export default GameMasterCard;