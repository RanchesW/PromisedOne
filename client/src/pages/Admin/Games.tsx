import React, { useState, useEffect } from 'react';
import { RectangleStackIcon, UsersIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface Game {
  _id: string;
  title: string;
  system: string;
  description: string;
  gm: {
    _id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  maxPlayers: number;
  currentPlayers: number;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  price: number;
  status: string;
  createdAt: string;
}

const Games: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadGames();
  }, [statusFilter]);

  const loadGames = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://promisedone.onrender.com/api'}/admin/games?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setGames(data.data?.games || []);
      }
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    if (!status) {
      return 'bg-gray-100 text-gray-800';
    }
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'full':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleGameAction = async (gameId: string, action: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://promisedone.onrender.com'}/api/admin/games/${gameId}/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        await loadGames(); // Refresh games list
        setShowGameModal(false);
      } else {
        console.error('Failed to perform action');
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://promisedone.onrender.com'}/api/admin/games/${gameId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        await loadGames(); // Refresh games list
        setShowDeleteModal(false);
        setGameToDelete(null);
      } else {
        console.error('Failed to delete game');
      }
    } catch (error) {
      console.error('Error deleting game:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://promisedone.onrender.com'}/api/admin/games/bulk/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ gameIds: Array.from(selectedGames) }),
      });

      if (response.ok) {
        await loadGames(); // Refresh games list
        setSelectedGames(new Set());
        setShowBulkActions(false);
      } else {
        console.error('Failed to perform bulk action');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleGameSelection = (gameId: string) => {
    const newSelection = new Set(selectedGames);
    if (newSelection.has(gameId)) {
      newSelection.delete(gameId);
    } else {
      newSelection.add(gameId);
    }
    setSelectedGames(newSelection);
  };

  const selectAllGames = () => {
    if (selectedGames.size === games.length) {
      setSelectedGames(new Set());
    } else {
      setSelectedGames(new Set(games.map(game => game._id)));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Games</h1>
        <p className="text-gray-600">Manage games and sessions</p>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
              Filter by Status:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-48 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Games</option>
              <option value="active">Active</option>
              <option value="full">Full</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={selectAllGames}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {selectedGames.size === games.length && games.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {selectedGames.size > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-blue-900">
                  {selectedGames.size} game{selectedGames.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedGames(new Set())}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Games List */}
      {games.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <RectangleStackIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">No games found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {games.map((game) => (
            <div key={game._id} className={`bg-white rounded-lg shadow-sm border-2 p-6 transition-all ${
              selectedGames.has(game._id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedGames.has(game._id)}
                    onChange={() => toggleGameSelection(game._id)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{game.title}</h3>
                    <p className="text-sm text-gray-600">{game.system}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(game.status)}`}>
                  {game.status || 'Unknown'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  <span>GM: {game.gm.firstName && game.gm.lastName 
                    ? `${game.gm.firstName} ${game.gm.lastName}`
                    : game.gm.username}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  <span>{game.currentPlayers}/{game.maxPlayers} players</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>
                    {new Date(game.sessionDate).toLocaleDateString()} at {game.sessionTime}
                  </span>
                </div>

                {game.price > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">${game.price}</span> per session
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  Duration: {game.duration} hours
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {game.description}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                  <span>Created: {new Date(game.createdAt).toLocaleDateString()}</span>
                  <span>ID: {game._id.slice(-8)}</span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedGame(game);
                        setShowGameModal(true);
                      }}
                      className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      View Details
                    </button>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setGameToDelete(game);
                        setShowDeleteModal(true);
                      }}
                      disabled={actionLoading}
                      className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{games.length}</div>
          <div className="text-sm text-gray-600">Total Games</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {games.filter(g => g.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active Games</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {games.filter(g => g.status === 'full').length}
          </div>
          <div className="text-sm text-gray-600">Full Games</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">
            {games.filter(g => g.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Game Details Modal */}
      {showGameModal && selectedGame && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedGame.title}</h3>
                  <p className="text-sm text-gray-600">{selectedGame.system}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(selectedGame.status)}`}>
                    {selectedGame.status || 'Unknown'}
                  </span>
                  <button
                    onClick={() => setShowGameModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Game Information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{selectedGame.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Game Master</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedGame.gm.firstName && selectedGame.gm.lastName 
                      ? `${selectedGame.gm.firstName} ${selectedGame.gm.lastName}` 
                      : selectedGame.gm.username}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Players</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedGame.currentPlayers}/{selectedGame.maxPlayers} players
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Session Details</label>
                  <div className="mt-1 text-sm text-gray-900 space-y-1">
                    <p>Date: {new Date(selectedGame.sessionDate).toLocaleDateString()}</p>
                    <p>Time: {selectedGame.sessionTime}</p>
                    <p>Duration: {selectedGame.duration} hours</p>
                  </div>
                </div>

                {selectedGame.price > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <p className="mt-1 text-lg font-semibold text-green-600">
                      ${selectedGame.price} per session
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Admin Actions</h4>
                
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setGameToDelete(selectedGame);
                      setShowGameModal(false);
                      setShowDeleteModal(true);
                    }}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    Delete Game Permanently
                  </button>
                </div>

                <div className="pt-4 border-t text-xs text-gray-500">
                  <p>Created: {new Date(selectedGame.createdAt).toLocaleDateString()}</p>
                  <p>Game ID: {selectedGame._id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && gameToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Game</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete "{gameToDelete.title}"? This action cannot be undone and will:
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-1 list-disc list-inside">
                <li>Permanently remove the game</li>
                <li>Cancel all player bookings</li>
                <li>Remove all associated data</li>
              </ul>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setGameToDelete(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteGame(gameToDelete._id)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {actionLoading ? 'Deleting...' : 'Delete Game'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Games;