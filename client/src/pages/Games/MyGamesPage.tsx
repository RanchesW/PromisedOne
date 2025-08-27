import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Game, Booking, UserRole } from '../../types/shared';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import gameService from '../../services/gameService';
import bookingService from '../../services/bookingService';
import { getImageUrl } from '../../utils/imageUtils';

const MyGamesPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'hosting'>('bookings');
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [myGames, setMyGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch user's bookings
      const bookings = await bookingService.getUserBookings();
      setMyBookings(bookings);

      // If user is a GM, also fetch their hosted games
      if (user?.role === UserRole.APPROVED_GM) {
        const games = await gameService.getMyGames();
        setMyGames(games);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load your games');
    } finally {
      setIsLoading(false);
    }
  };

  const isGM = user?.role === UserRole.APPROVED_GM;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Games</h1>
          <p className="text-gray-600">Manage your game bookings and hosted sessions</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bookings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Bookings
                {myBookings.length > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {myBookings.length}
                  </span>
                )}
              </button>
              
              {isGM && (
                <button
                  onClick={() => setActiveTab('hosting')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'hosting'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Hosting Games
                  {myGames.length > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                      {myGames.length}
                    </span>
                  )}
                </button>
              )}
            </nav>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'bookings' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Game Bookings</h2>
                <Link
                  to="/games"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Find More Games
                </Link>
              </div>

              {myBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🎲</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No game bookings yet</h3>
                  <p className="text-gray-500 mb-6">Start your adventure by joining a campaign or one-shot!</p>
                  <Link
                    to="/games"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Browse Games
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {myBookings.map((booking) => (
                    <BookingCard key={booking._id} booking={booking} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'hosting' && isGM && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Games You're Hosting</h2>
                <Link
                  to="/create-game"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Create New Game
                </Link>
              </div>

              {myGames.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🎯</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hosted games yet</h3>
                  <p className="text-gray-500 mb-6">Create your first game and start building your player community!</p>
                  <Link
                    to="/create-game"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Create Game
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {myGames.map((game) => (
                    <GameCard key={game._id} game={game} isOwner={true} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Booking Card Component
const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate">
            Game Booking
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            booking.status === 'confirmed' 
              ? 'bg-green-100 text-green-800'
              : booking.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          {booking.numberOfSeats} seat{booking.numberOfSeats > 1 ? 's' : ''} • ${booking.totalAmount} {booking.currency}
        </p>
        <div className="text-xs text-gray-500">
          Booked {new Date(booking.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

// Game Card Component  
const GameCard: React.FC<{ game: Game; isOwner: boolean }> = ({ game, isOwner }) => {
  const getSystemDisplayName = (system: string) => {
    const systemNames: { [key: string]: string } = {
      'dnd_5e': 'D&D 5th Edition',
      'pathfinder_2e': 'Pathfinder 2nd Edition',
      'call_of_cthulhu': 'Call of Cthulhu',
      'vampire_masquerade': 'Vampire: The Masquerade',
      'cyberpunk_red': 'Cyberpunk Red',
      'other': game.customSystem || 'Other'
    };
    return systemNames[system] || system;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      {game.bannerImage ? (
        <div className="h-32 bg-gray-200">
          <img
            src={getImageUrl(game.bannerImage)}
            alt={game.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-r from-purple-600 to-blue-600"></div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate flex-1 pr-2">
            {game.title}
          </h3>
          {isOwner && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium whitespace-nowrap">
              Hosting
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-3">
          {game.bookedSeats || 0}/{game.capacity} players • ${game.price} {game.currency}
        </p>
        <div className="space-y-1 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>{getSystemDisplayName(game.system)}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              game.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {game.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            Next session: {new Date(game.schedule.startTime).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </div>
        </div>
        <div className="mt-3 flex space-x-2">
          <Link 
            to={`/games/${game._id}`}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-2 px-3 rounded-md text-sm font-medium transition-colors"
          >
            View Details
          </Link>
          {isOwner && (
            <Link 
              to={`/games/${game._id}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors"
            >
              Edit
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyGamesPage;
