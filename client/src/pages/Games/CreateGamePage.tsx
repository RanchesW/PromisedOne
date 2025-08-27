import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GameSystem, Platform, SessionType, ExperienceLevel, BookingType, UserRole } from '../../types/shared';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ImageUploadWithCrop from '../../components/UI/ImageUploadWithCrop';
import gameService from '../../services/gameService';

interface GameFormData {
  title: string;
  description: string;
  partyNotes: string;
  system: GameSystem;
  customSystem: string;
  platform: Platform;
  sessionType: SessionType;
  experienceLevel: ExperienceLevel;
  price: number;
  currency: string;
  capacity: number;
  schedule: {
    startTime: string;
    endTime: string;
    timezone: string;
    recurring?: {
      frequency: 'weekly' | 'biweekly' | 'monthly';
      endDate?: string;
    };
  };
  location?: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  onlineDetails?: {
    platform: string;
    inviteLink?: string;
  };
  tags: string[];
  ageRestriction?: {
    minAge: number;
    maxAge?: number;
  };
  bookingType: BookingType;
  cancellationPolicy: {
    cutoffHours: number;
    refundPercentage: number;
  };
  isEarlyBird: boolean;
  earlyBirdDiscount?: number;
}

const CreateGamePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [currentTag, setCurrentTag] = useState('');

  const [formData, setFormData] = useState<GameFormData>({
    title: '',
    description: '',
    partyNotes: '',
    system: GameSystem.DND_5E,
    customSystem: '',
    platform: Platform.ONLINE,
    sessionType: SessionType.ONE_SHOT,
    experienceLevel: ExperienceLevel.ALL_LEVELS,
    price: 0,
    currency: 'USD',
    capacity: 4,
    schedule: {
      startTime: '',
      endTime: '',
      timezone: user?.timezone || 'UTC',
      recurring: undefined
    },
    location: {
      address: '',
      city: '',
      state: '',
      country: ''
    },
    onlineDetails: {
      platform: '',
      inviteLink: ''
    },
    tags: [],
    ageRestriction: {
      minAge: 13
    },
    bookingType: BookingType.INSTANT,
    cancellationPolicy: {
      cutoffHours: 24,
      refundPercentage: 100
    },
    isEarlyBird: false,
    earlyBirdDiscount: 0
  });

  // Check if user can create games
  if (user?.role !== UserRole.APPROVED_GM && user?.role !== UserRole.ADMIN) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-fantasy font-bold text-white mb-4">Access Denied</h1>
          <p className="text-slate-400 mb-6">
            Only approved Game Masters can create games. Please apply to become a GM first.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof GameFormData] as any),
          [child]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
      }));
    }
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(currentTag.trim()) && formData.tags.length < 10) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, currentTag.trim()]
        }));
        setCurrentTag('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let imageUrls = {};

      // Upload images if present
      if (bannerFile || iconFile) {
        imageUrls = await gameService.uploadGameImages({
          banner: bannerFile || undefined,
          icon: iconFile || undefined
        });
      }

      // Create game
      const gameData = {
        ...formData,
        ...imageUrls,
        schedule: {
          ...formData.schedule,
          startTime: new Date(formData.schedule.startTime),
          endTime: new Date(formData.schedule.endTime),
          recurring: formData.schedule.recurring ? {
            ...formData.schedule.recurring,
            endDate: formData.schedule.recurring.endDate ? new Date(formData.schedule.recurring.endDate) : undefined
          } : undefined
        },
        // Only include location if it's in-person
        ...(formData.platform === Platform.IN_PERSON ? {
          location: formData.location
        } : {
          location: undefined
        })
      };

      const createdGame = await gameService.createGame(gameData);
      navigate(`/games/${createdGame._id}`);
    } catch (error) {
      console.error('Create game error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create game');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-fantasy font-bold text-slate-900 mb-8">Create New Game</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Basic Information</h2>
            
            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Game Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter an exciting game title"
                required
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your game, setting, style, and what players can expect..."
                required
                maxLength={2000}
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.description.length}/2000 characters
              </p>
            </div>

            {/* Party Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Party Notes
              </label>
              <textarea
                name="partyNotes"
                value={formData.partyNotes}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional notes for players about the current party status, ongoing story, or session expectations..."
                maxLength={500}
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.partyNotes.length}/500 characters • These notes will be shown to players when they join your campaign
              </p>
            </div>

            {/* Game System */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game System *
                </label>
                <select
                  name="system"
                  value={formData.system}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={GameSystem.DND_5E}>D&D 5th Edition</option>
                  <option value={GameSystem.PATHFINDER_2E}>Pathfinder 2nd Edition</option>
                  <option value={GameSystem.CALL_OF_CTHULHU}>Call of Cthulhu</option>
                  <option value={GameSystem.VAMPIRE_MASQUERADE}>Vampire: The Masquerade</option>
                  <option value={GameSystem.CYBERPUNK_RED}>Cyberpunk Red</option>
                  <option value={GameSystem.OTHER}>Other</option>
                </select>
              </div>

              {formData.system === GameSystem.OTHER && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom System *
                  </label>
                  <input
                    type="text"
                    name="customSystem"
                    value={formData.customSystem}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Specify the game system"
                    required={formData.system === GameSystem.OTHER}
                    maxLength={50}
                  />
                </div>
              )}
            </div>

            {/* Platform and Session Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform *
                </label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={Platform.ONLINE}>Online</option>
                  <option value={Platform.IN_PERSON}>In Person</option>
                  <option value={Platform.HYBRID}>Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Type *
                </label>
                <select
                  name="sessionType"
                  value={formData.sessionType}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={SessionType.ONE_SHOT}>One Shot</option>
                  <option value={SessionType.MINI_SERIES}>Mini Series</option>
                  <option value={SessionType.CAMPAIGN}>Campaign</option>
                </select>
              </div>
            </div>

            {/* Experience Level */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level *
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={ExperienceLevel.ALL_LEVELS}>All Levels Welcome</option>
                <option value={ExperienceLevel.BEGINNER}>Beginner Friendly</option>
                <option value={ExperienceLevel.INTERMEDIATE}>Intermediate</option>
                <option value={ExperienceLevel.ADVANCED}>Advanced</option>
              </select>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Game Images</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Banner Image */}
              <ImageUploadWithCrop
                label="Banner Image"
                onImageChange={(file) => setBannerFile(file)}
                aspectRatio={16 / 9}
                description="Recommended: 16:9 ratio for best appearance. You can crop and position your image exactly how you want it to appear."
                minWidth={400}
                minHeight={225}
              />

              {/* Icon Image */}
              <ImageUploadWithCrop
                label="Icon Image"
                onImageChange={(file) => setIconFile(file)}
                aspectRatio={1}
                cropShape="round"
                description="Square image that will be displayed as your game's icon. Perfect for logos or character portraits."
                minWidth={100}
                minHeight={100}
              />
            </div>
          </div>

          {/* Pricing and Capacity */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing & Capacity</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Players *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Early Bird */}
            <div className="flex items-center space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isEarlyBird"
                  checked={formData.isEarlyBird}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-gray-700">Enable Early Bird Discount</span>
              </label>
              
              {formData.isEarlyBird && (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="earlyBirdDiscount"
                    value={formData.earlyBirdDiscount}
                    onChange={handleInputChange}
                    min="0"
                    max="50"
                    className="w-20 bg-white border border-gray-300 rounded-lg px-2 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10"
                  />
                  <span className="text-gray-700">% off</span>
                </div>
              )}
            </div>
          </div>

          {/* Continue with other sections... */}

          {/* Schedule */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="schedule.startTime"
                  value={formData.schedule.startTime}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="schedule.endTime"
                  value={formData.schedule.endTime}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone *
              </label>
              <select
                name="schedule.timezone"
                value={formData.schedule.timezone}
                onChange={handleInputChange}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">GMT</option>
                <option value="Europe/Paris">CET</option>
                <option value="Asia/Tokyo">JST</option>
                <option value="Australia/Sydney">AEDT</option>
              </select>
            </div>
          </div>

          {/* Location/Online Details */}
          {(formData.platform === Platform.IN_PERSON || formData.platform === Platform.HYBRID) && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location?.address || ''}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Street address"
                    required={formData.platform === Platform.IN_PERSON || formData.platform === Platform.HYBRID}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location?.city || ''}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City"
                    required={formData.platform === Platform.IN_PERSON || formData.platform === Platform.HYBRID}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="location.state"
                    value={formData.location?.state || ''}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="State/Province"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="location.country"
                    value={formData.location?.country || ''}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Country"
                    required={formData.platform === Platform.IN_PERSON || formData.platform === Platform.HYBRID}
                  />
                </div>
              </div>
            </div>
          )}

          {(formData.platform === Platform.ONLINE || formData.platform === Platform.HYBRID) && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Online Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform *
                  </label>
                  <input
                    type="text"
                    name="onlineDetails.platform"
                    value={formData.onlineDetails?.platform || ''}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Discord, Roll20, Foundry VTT, etc."
                    required={formData.platform === Platform.ONLINE || formData.platform === Platform.HYBRID}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invite Link (Optional)
                  </label>
                  <input
                    type="url"
                    name="onlineDetails.inviteLink"
                    value={formData.onlineDetails?.inviteLink || ''}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://discord.gg/..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Tags (Press Enter to add)
              </label>
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={addTag}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="horror, investigation, roleplay heavy..."
                maxLength={30}
              />
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-200 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Age Restrictions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Age Restrictions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Age
                </label>
                <input
                  type="number"
                  name="ageRestriction.minAge"
                  value={formData.ageRestriction?.minAge || 13}
                  onChange={handleInputChange}
                  min="13"
                  max="100"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Age (Optional)
                </label>
                <input
                  type="number"
                  name="ageRestriction.maxAge"
                  value={formData.ageRestriction?.maxAge || ''}
                  onChange={handleInputChange}
                  min="13"
                  max="100"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="No maximum"
                />
              </div>
            </div>
          </div>

          {/* Booking Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Type *
                </label>
                <select
                  name="bookingType"
                  value={formData.bookingType}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={BookingType.INSTANT}>Instant Book</option>
                  <option value={BookingType.REQUEST}>Request to Join</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Cutoff (hours)
                </label>
                <input
                  type="number"
                  name="cancellationPolicy.cutoffHours"
                  value={formData.cancellationPolicy.cutoffHours}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Percentage (%)
                </label>
                <input
                  type="number"
                  name="cancellationPolicy.refundPercentage"
                  value={formData.cancellationPolicy.refundPercentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading && <LoadingSpinner />}
              <span>{isLoading ? 'Creating...' : 'Create Game'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGamePage;
