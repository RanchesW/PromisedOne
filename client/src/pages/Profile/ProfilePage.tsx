import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { userService, UpdateProfileData } from '../../services/userService';
import { getAvatarUrl } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select options..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(item => item !== option)
      : [...selectedValues, option];
    onSelectionChange(newValues);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 cursor-pointer bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex justify-between items-center">
          <div className="flex-1">
            {selectedValues.length === 0 ? (
              <span className="text-gray-500">{placeholder}</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedValues.map(value => (
                  <span
                    key={value}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {value}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOption(value);
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map(option => (
            <div
              key={option}
              onClick={() => toggleOption(option)}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center ${
                selectedValues.includes(option) ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={() => {}} // Handled by the div onClick
                className="mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  timezone: string;
  location: string;
  dateOfBirth: string;
  about: string;
  pronouns: string[];
  identityTags: string[];
  experienceLevel: string;
  languages: string[];
  gameSystemsPreferred: string[];
  gamePlatformsPreferred: string[];
  gameStylesPreferred: string[];
  gameThemesPreferred: string[];
  availability: {
    [key: string]: {
      morning: boolean;
      afternoon: boolean;
      evening: boolean;
      night: boolean;
    };
  };
}

// Helper functions to convert between display labels and values
const styleOptions = [
  { label: 'Rule of Cool', value: 'rule_of_cool' },
  { label: 'Combat Heavy', value: 'combat_heavy' },
  { label: 'Combat Lite', value: 'combat_lite' },
  { label: 'Dungeon Crawl', value: 'dungeon_crawl' },
  { label: 'Puzzle / Mystery Focused', value: 'puzzle_mystery' },
  { label: 'Hexcrawl / Exploration', value: 'hexcrawl_exploration' },
  { label: 'Roleplay Heavy', value: 'roleplay_heavy' },
  { label: 'Realm Building', value: 'realm_building' }
];

const themeOptions = [
  { label: 'Anime', value: 'anime' },
  { label: 'Battle Royale', value: 'battle_royale' },
  { label: 'Comedy', value: 'comedy' },
  { label: 'Cosmic Horror', value: 'cosmic_horror' },
  { label: 'Cozy', value: 'cozy' },
  { label: 'Cyberpunk', value: 'cyberpunk' },
  { label: 'Dark Fantasy', value: 'dark_fantasy' },
  { label: 'Detective', value: 'detective' },
  { label: 'Epic Fantasy', value: 'epic_fantasy' },
  { label: 'Historical', value: 'historical' },
  { label: 'Horror', value: 'horror' },
  { label: 'Medieval', value: 'medieval' },
  { label: 'Modern', value: 'modern' },
  { label: 'Mystery', value: 'mystery' },
  { label: 'Noir', value: 'noir' },
  { label: 'Pirates', value: 'pirates' },
  { label: 'Post-Apocalyptic', value: 'post_apocalyptic' },
  { label: 'Pulp Adventure', value: 'pulp_adventure' },
  { label: 'Romance', value: 'romance' },
  { label: 'Sci-Fi', value: 'sci_fi' },
  { label: 'Space Opera', value: 'space_opera' },
  { label: 'Steampunk', value: 'steampunk' },
  { label: 'Superhero', value: 'superhero' },
  { label: 'Survival', value: 'survival' },
  { label: 'Urban Fantasy', value: 'urban_fantasy' },
  { label: 'Western', value: 'western' },
  { label: 'Zombie', value: 'zombie' }
];

const getStyleLabelsFromValues = (values: string[]): string[] => {
  return values.map(value => {
    const option = styleOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  });
};

const getStyleValuesFromLabels = (labels: string[]): string[] => {
  return labels.map(label => {
    const option = styleOptions.find(opt => opt.label === label);
    return option ? option.value : label;
  });
};

const getThemeLabelsFromValues = (values: string[]): string[] => {
  return values.map(value => {
    const option = themeOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  });
};

const getThemeValuesFromLabels = (labels: string[]): string[] => {
  return labels.map(label => {
    const option = themeOptions.find(opt => opt.label === label);
    return option ? option.value : label;
  });
};

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  
  // Map URL paths to tab names
  const pathToTab: { [key: string]: string } = {
    '/settings/profile': 'Player Profile',
    '/settings/featured-prompts': 'Featured Prompts', 
    '/settings/payment': 'Payment',
    '/settings/refer-a-friend': 'Refer a Friend',
    '/settings/notifications': 'Notifications',
    '/settings/privacy': 'Privacy',
    '/settings/social-login': 'Social Login'
  };

  const tabToPath: { [key: string]: string } = {
    'Player Profile': '/settings/profile',
    'Featured Prompts': '/settings/featured-prompts',
    'Payment': '/settings/payment', 
    'Refer a Friend': '/settings/refer-a-friend',
    'Notifications': '/settings/notifications',
    'Privacy': '/settings/privacy',
    'Social Login': '/settings/social-login'
  };

  // Get active tab from URL, default to Player Profile
  const getActiveTabFromUrl = () => {
    return pathToTab[location.pathname] || 'Player Profile';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl());
  const [profileImage, setProfileImage] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availablePrompts, setAvailablePrompts] = useState<Array<{id: string, text: string}>>([]);
  const [selectedPrompts, setSelectedPrompts] = useState<Array<{promptId: string, customText: string}>>([]);
  const [pricingData, setPricingData] = useState({
    sessionPrice: 15.00,
    currency: 'USD'
  });
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    timezone: '',
    location: '',
    dateOfBirth: '',
    about: '',
    pronouns: [],
    identityTags: [],
    experienceLevel: '',
    languages: [],
    gameSystemsPreferred: [],
    gamePlatformsPreferred: [],
    gameStylesPreferred: [],
    gameThemesPreferred: [],
    availability: {
      Sunday: { morning: false, afternoon: false, evening: false, night: false },
      Monday: { morning: false, afternoon: false, evening: false, night: false },
      Tuesday: { morning: false, afternoon: false, evening: false, night: false },
      Wednesday: { morning: false, afternoon: false, evening: false, night: false },
      Thursday: { morning: false, afternoon: false, evening: false, night: false },
      Friday: { morning: false, afternoon: false, evening: false, night: false },
      Saturday: { morning: false, afternoon: false, evening: false, night: false },
    }
  });

  // Load profile data on component mount
  useEffect(() => {
    if (user) {
      loadProfileData();
      loadFeaturedPromptsData();
    }
  }, [user]);

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTabFromUrl());
  }, [location.pathname]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading profile data...');
      
      // Load user profile from backend
      const userProfile = await userService.getProfile();
      console.log('Backend user profile loaded:', userProfile);
      
      // Load extended profile data from localStorage
      const localData = userService.getProfileDataLocally();
      console.log('LocalStorage profile data loaded:', localData);
      
      // Merge backend data with local extended data
      const mergedData = {
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        timezone: userProfile.timezone || '',
        location: localData?.location || '',
        dateOfBirth: localData?.dateOfBirth || '',
        about: userProfile.bio || localData?.about || '',
        pronouns: userProfile.pronouns || [],
        identityTags: userProfile.identityTags || [],
        experienceLevel: userProfile.preferences?.experienceLevel || localData?.experienceLevel || '',
        languages: localData?.languages || [],
        gameSystemsPreferred: localData?.gameSystemsPreferred || [],
        gamePlatformsPreferred: localData?.gamePlatformsPreferred || [],
        gameStylesPreferred: getStyleLabelsFromValues(userProfile.gameStyles || localData?.gameStylesPreferred || []),
        gameThemesPreferred: getThemeLabelsFromValues(userProfile.themes || localData?.gameThemesPreferred || []),
        availability: localData?.availability || {
          Sunday: { morning: false, afternoon: false, evening: false, night: false },
          Monday: { morning: false, afternoon: false, evening: false, night: false },
          Tuesday: { morning: false, afternoon: false, evening: false, night: false },
          Wednesday: { morning: false, afternoon: false, evening: false, night: false },
          Thursday: { morning: false, afternoon: false, evening: false, night: false },
          Friday: { morning: false, afternoon: false, evening: false, night: false },
          Saturday: { morning: false, afternoon: false, evening: false, night: false },
        }
      };
      
      console.log('Merged profile data:', mergedData);
      setProfileData(mergedData);

      // Set profile image if available
      if (userProfile.avatar) {
        console.log('Setting profile image from backend:', userProfile.avatar);
        const fullAvatarUrl = getAvatarUrl(userProfile.avatar);
        console.log('Full avatar URL:', fullAvatarUrl);
        console.log('ProfilePage avatar debug:', { 
          originalPath: userProfile.avatar, 
          fullUrl: fullAvatarUrl,
          baseUrl: 'http://localhost:5000'
        });
        setProfileImage(fullAvatarUrl || '');
      } else {
        console.log('No avatar found in backend data');
        setProfileImage('');
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFeaturedPromptsData = async () => {
    try {
      const prompts = await userService.getFeaturedPrompts();
      setAvailablePrompts(prompts);
      
      // Load user's current selections from profile
      const userProfile = await userService.getProfile();
      if (userProfile.featuredPrompts) {
        setSelectedPrompts(userProfile.featuredPrompts);
      }
      if (userProfile.pricing) {
        setPricingData({
          sessionPrice: userProfile.pricing.sessionPrice || 15.00,
          currency: userProfile.pricing.currency || 'USD'
        });
      }
    } catch (error) {
      console.error('Error loading featured prompts:', error);
    }
  };

  const handlePromptSelection = (promptId: string, promptText: string, isSelected: boolean) => {
    if (isSelected) {
      if (selectedPrompts.length >= 2) {
        alert('You can only select up to 2 featured prompts');
        return;
      }
      // Start with empty custom text so user completes the prompt
      setSelectedPrompts([...selectedPrompts, { promptId, customText: '' }]);
    } else {
      setSelectedPrompts(selectedPrompts.filter(p => p.promptId !== promptId));
    }
  };

  const handleCustomTextChange = (promptId: string, customText: string) => {
    setSelectedPrompts(selectedPrompts.map(p => 
      p.promptId === promptId ? { ...p, customText } : p
    ));
  };

  const savePricingData = async () => {
    try {
      setIsSaving(true);
      await userService.updateProfile({
        pricing: pricingData
      });
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error saving pricing data:', error);
      // Could add error handling here
    } finally {
      setIsSaving(false);
    }
  };

  const saveFeaturedPrompts = async () => {
    try {
      setIsSaving(true);
      await userService.updateFeaturedPrompts(selectedPrompts);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error saving featured prompts:', error);
      alert('Error saving featured prompts: ' + error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = ['Player Profile', 'Featured Prompts', 'Payment', 'Refer a Friend', 'Notifications', 'Privacy', 'Social Login'];

  const timezones = [
    'UTC-12:00 - Baker Island',
    'UTC-11:00 - American Samoa',
    'UTC-10:00 - Hawaii',
    'UTC-09:00 - Alaska',
    'UTC-08:00 - Pacific Time',
    'UTC-07:00 - Mountain Time',
    'UTC-06:00 - Central Time',
    'UTC-05:00 - Eastern Time',
    'UTC-04:00 - Atlantic Time',
    'UTC-03:00 - Argentina',
    'UTC-02:00 - South Georgia',
    'UTC-01:00 - Azores',
    'UTC+00:00 - London',
    'UTC+01:00 - Central Europe',
    'UTC+02:00 - Eastern Europe',
    'UTC+03:00 - Moscow',
    'UTC+04:00 - Gulf',
    'UTC+05:00 - Pakistan',
    'UTC+06:00 - Kazakhstan',
    'UTC+07:00 - Thailand',
    'UTC+08:00 - China',
    'UTC+09:00 - Japan',
    'UTC+10:00 - Australia East',
    'UTC+11:00 - Solomon Islands',
    'UTC+12:00 - New Zealand'
  ];

  const pronounOptions = ['he/him', 'she/her', 'they/them', 'xe/xem', 'ze/zir', 'Other'];
  const identityOptions = [
    'LGBTQ+', 
    'Queer',
    'Neurodivergent', 
    'Accessibility Needs', 
    'New Player Friendly', 
    'Family Friendly',
    'Streamer',
    'Content Creator',
    'Veteran',
    'Disabled',
    'Published Writer',
    'Game Designer',
    'Artist',
    'Voice Actor',
    'Musician',
    'Teacher/Educator',
    'Parent',
    'Student',
    'Mental Health Advocate',
    'Inclusive Gaming',
    'Safety Tools User',
    'International Player'
  ];
  const experienceOptions = ['New to TTRPGs', 'Some Experience', 'Experienced Player', 'Veteran', 'Game Master'];
  const languageOptions = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Japanese', 'Chinese', 'Korean'];
  const gameSystemOptions = ['D&D 5e', 'Pathfinder 2e', 'Call of Cthulhu', 'Vampire: The Masquerade', 'Cyberpunk Red', 'FATE', 'Savage Worlds', 'Other'];
  const platformOptions = ['Roll20', 'Foundry VTT', 'Discord', 'Zoom', 'In-Person', 'Fantasy Grounds', 'Other'];


  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelectChange = (field: string, option: string) => {
    setProfileData(prev => {
      const fieldValue = prev[field as keyof ProfileData];
      if (Array.isArray(fieldValue)) {
        return {
          ...prev,
          [field]: fieldValue.includes(option)
            ? fieldValue.filter(item => item !== option)
            : [...fieldValue, option]
        };
      }
      return prev;
    });
  };

  const handleAvailabilityChange = (day: string, timeSlot: string) => {
    setProfileData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [timeSlot]: !prev.availability[day][timeSlot as keyof typeof prev.availability[typeof day]]
        }
      }
    }));
  };

  const handleRemoveAvatar = async () => {
    try {
      console.log('Removing avatar...');
      await userService.removeAvatar();
      console.log('Avatar removed successfully');
      
      // Clear local state
      setProfileImage('');
      
      // Update user context to remove avatar
      await updateUser({ avatar: undefined });
      console.log('User context updated - avatar removed');
      
      // Force a user context refresh by re-fetching user data
      try {
        const updatedProfile = await userService.getProfile();
        await updateUser(updatedProfile);
        console.log('User profile refreshed after avatar removal');
      } catch (refreshError) {
        console.warn('Could not refresh user profile:', refreshError);
      }
      
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      alert('Failed to remove avatar. Please try again.');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Determine max size based on user role
      const isAdmin = user?.role === 'admin';
      const maxSizeMB = isAdmin ? 5 : 2;
      const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
      
      if (file.size > maxSize) {
        alert(`File is too large! Please choose an image smaller than ${maxSizeMB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type! Please upload a JPEG, PNG, WebP, or GIF image.');
        return;
      }
      
      try {
        console.log('Uploading avatar image...');
        
        // Upload image to server
        const uploadResult = await userService.uploadAvatar(file);
        console.log('Avatar upload successful:', uploadResult);
        
        // Convert to full URL and set the uploaded image
        const fullAvatarUrl = getAvatarUrl(uploadResult.avatar);
        console.log('Full avatar URL after upload:', fullAvatarUrl);
        setProfileImage(fullAvatarUrl || '');
        
        // Update user context with new avatar
        await updateUser({ avatar: uploadResult.avatar });
        console.log('User avatar updated in context');
        
        // Force a user context refresh by re-fetching user data
        try {
          const updatedProfile = await userService.getProfile();
          await updateUser(updatedProfile);
          console.log('User profile refreshed after avatar upload');
        } catch (refreshError) {
          console.warn('Could not refresh user profile:', refreshError);
        }
        
      } catch (error: any) {
        console.error('Error uploading avatar:', error);
        
        // Parse error message from server response
        let errorMessage = 'Failed to upload avatar. Please try again.';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.status === 401) {
          errorMessage = 'You need to be logged in to upload an avatar.';
        } else if (error.response?.status === 400) {
          const isAdmin = user?.role === 'admin';
          const maxSizeMB = isAdmin ? 5 : 2;
          errorMessage = `Invalid file. Please upload a JPEG, PNG, WebP, or GIF image under ${maxSizeMB}MB.`;
        } else if (error.response?.status === 413) {
          const isAdmin = user?.role === 'admin';
          const maxSizeMB = isAdmin ? 5 : 2;
          errorMessage = `File is too large. Please upload an image smaller than ${maxSizeMB}MB.`;
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.message?.includes('File too large')) {
          const isAdmin = user?.role === 'admin';
          const maxSizeMB = isAdmin ? 5 : 2;
          errorMessage = `Image file is too large. Please choose a file smaller than ${maxSizeMB}MB.`;
        } else if (error.message?.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
        
        // Show user-friendly error message
        alert(errorMessage);
      }
    }
  };

  const handleSave = async () => {
    console.log('Save button clicked!');
    try {
      setIsSaving(true);
      console.log('Starting save process...');
      
      // Prepare data for backend (standard user fields)
      const backendData: UpdateProfileData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        bio: profileData.about,
        timezone: profileData.timezone,
        pronouns: profileData.pronouns,
        identityTags: profileData.identityTags,
        gameStyles: getStyleValuesFromLabels(profileData.gameStylesPreferred),
        themes: getThemeValuesFromLabels(profileData.gameThemesPreferred),
      };

      // Prepare extended profile data for local storage
      const extendedData = {
        location: profileData.location,
        dateOfBirth: profileData.dateOfBirth,
        about: profileData.about,
        experienceLevel: profileData.experienceLevel,
        languages: profileData.languages,
        gameSystemsPreferred: profileData.gameSystemsPreferred,
        gamePlatformsPreferred: profileData.gamePlatformsPreferred,
        gameStylesPreferred: profileData.gameStylesPreferred,
        gameThemesPreferred: profileData.gameThemesPreferred,
        availability: profileData.availability,
      };

      console.log('Saving to backend:', backendData);
      console.log('Saving to localStorage:', extendedData);

      // Save to backend
      const updatedUser = await userService.updateProfile(backendData);
      console.log('Backend save successful!');
      
      // Save extended data locally
      userService.saveProfileDataLocally(extendedData);
      console.log('LocalStorage save successful!');
      
      // Update the user context with the new data to ensure it persists
      await updateUser({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        bio: profileData.about,
        timezone: profileData.timezone,
        pronouns: profileData.pronouns,
        identityTags: profileData.identityTags,
        gameStyles: getStyleValuesFromLabels(profileData.gameStylesPreferred),
        themes: getThemeValuesFromLabels(profileData.gameThemesPreferred),
      });
      console.log('User context updated!');
      
      setShowSuccessMessage(true);
      console.log('Success message should be visible now');
      
      // Hide the message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        console.log('Success message hidden');
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile: ' + error);
    } finally {
      setIsSaving(false);
      console.log('Save process completed');
    }
  };

  const renderPlayerProfile = () => (
    <div className="space-y-8">
      {/* Profile Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Player Profile</h2>
        <p className="text-gray-600 mb-6">
          Fill out your player profile so game masters and other players can get to know you. 
          You can control who sees your profile in your <a href="#" className="text-blue-600 hover:underline">privacy settings</a>.
        </p>
      </div>

      {/* Profile Image */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center overflow-hidden">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            )}
          </div>
        </div>
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="profile-image-upload"
          />
          <label
            htmlFor="profile-image-upload"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            {profileImage ? 'Change Image' : 'Upload Image'}
          </label>
          {profileImage && (
            <button
              onClick={handleRemoveAvatar}
              className="ml-3 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Remove
            </button>
          )}
          <p className="text-sm text-gray-500 mt-2">
            You can upload jpeg or png image files.<br />
            Max size of {user?.role === 'admin' ? '5MB' : '2MB'}{user?.role === 'admin' ? ' (Admin)' : ''}.
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First name</label>
          <input
            type="text"
            value={profileData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="First name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last name</label>
          <input
            type="text"
            value={profileData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Last name"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          type="email"
          value={profileData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="your.email@example.com"
        />
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
        <select
          value={profileData.timezone}
          onChange={(e) => handleInputChange('timezone', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select your timezone</option>
          {timezones.map(tz => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-1">
          To learn more about time zones on KazRPG, <a href="#" className="text-blue-600 hover:underline">check out this Help Article</a>.
        </p>
      </div>

      {/* Location and Date of Birth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={profileData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Location"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of birth</label>
          <input
            type="date"
            value={profileData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* About */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">About</label>
        <textarea
          value={profileData.about}
          onChange={(e) => handleInputChange('about', e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="I like playing games and having epic adventures!"
        />
      </div>

      {/* Pronouns and Identity Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <MultiSelectDropdown
            label="Pronouns"
            options={pronounOptions}
            selectedValues={profileData.pronouns}
            onSelectionChange={(values) => setProfileData(prev => ({ ...prev, pronouns: values }))}
            placeholder="Select your pronouns"
          />
        </div>
        <div>
          <MultiSelectDropdown
            label="Identity tags"
            options={identityOptions}
            selectedValues={profileData.identityTags}
            onSelectionChange={(values) => setProfileData(prev => ({ ...prev, identityTags: values }))}
            placeholder="Select your identity tags"
          />
        </div>
      </div>

      {/* Experience Level and Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your experience level</label>
          <select
            value={profileData.experienceLevel}
            onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select your experience</option>
            {experienceOptions.map(exp => (
              <option key={exp} value={exp}>{exp}</option>
            ))}
          </select>
        </div>
        <div>
          <MultiSelectDropdown
            label="Languages"
            options={languageOptions}
            selectedValues={profileData.languages}
            onSelectionChange={(values) => setProfileData(prev => ({ ...prev, languages: values }))}
            placeholder="Select your languages"
          />
        </div>
      </div>

      {/* Game Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <MultiSelectDropdown
            label="Preferred game systems"
            options={gameSystemOptions}
            selectedValues={profileData.gameSystemsPreferred}
            onSelectionChange={(values) => setProfileData(prev => ({ ...prev, gameSystemsPreferred: values }))}
            placeholder="Select your game systems"
          />
        </div>
        <div>
          <MultiSelectDropdown
            label="Preferred game platforms"
            options={platformOptions}
            selectedValues={profileData.gamePlatformsPreferred}
            onSelectionChange={(values) => setProfileData(prev => ({ ...prev, gamePlatformsPreferred: values }))}
            placeholder="Select your game platforms"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <MultiSelectDropdown
            label="Preferred game styles"
            options={styleOptions.map(opt => opt.label)}
            selectedValues={profileData.gameStylesPreferred}
            onSelectionChange={(values) => setProfileData(prev => ({ ...prev, gameStylesPreferred: values }))}
            placeholder="Select your game styles"
          />
        </div>
        <div>
          <MultiSelectDropdown
            label="Preferred game themes"
            options={themeOptions.map(opt => opt.label)}
            selectedValues={profileData.gameThemesPreferred}
            onSelectionChange={(values) => setProfileData(prev => ({ ...prev, gameThemesPreferred: values }))}
            placeholder="Select your game themes"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="relative">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
          {isSaving && (
            <div className="flex items-center space-x-2 text-blue-600">
              <LoadingSpinner size="sm" />
              <span className="text-sm font-medium">Saving...</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-4">This will only be visible to you and may be used to tailor your search results.</p>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3"></th>
                <th className="text-center p-3 text-base font-medium text-gray-700">Sun</th>
                <th className="text-center p-3 text-base font-medium text-gray-700">Mon</th>
                <th className="text-center p-3 text-base font-medium text-gray-700">Tue</th>
                <th className="text-center p-3 text-base font-medium text-gray-700">Wed</th>
                <th className="text-center p-3 text-base font-medium text-gray-700">Thu</th>
                <th className="text-center p-3 text-base font-medium text-gray-700">Fri</th>
                <th className="text-center p-3 text-base font-medium text-gray-700">Sat</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'morning', label: '8am-12pm', icon: '🌅' },
                { key: 'afternoon', label: '12pm-5pm', icon: '☀️' },
                { key: 'evening', label: '5pm-10pm', icon: '🌆' },
                { key: 'night', label: '10pm-8am', icon: '🌙' }
              ].map(timeSlot => (
                <tr key={timeSlot.key}>
                  <td className="p-3 text-base text-gray-700 flex items-center">
                    <span className="text-2xl mr-3">{timeSlot.icon}</span>
                    <span className="font-medium">{timeSlot.label}</span>
                  </td>
                  {Object.keys(profileData.availability).map(day => (
                    <td key={day} className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={profileData.availability[day][timeSlot.key as keyof typeof profileData.availability[typeof day]]}
                        onChange={() => handleAvailabilityChange(day, timeSlot.key)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        disabled={isSaving}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-start">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>
    </div>
  );

  const renderFeaturedPrompts = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Featured Prompts</h2>
        <p className="text-gray-600 mb-6">
          Choose up to 2 prompts to display on your profile. Complete the thought to show other users what kind of player or GM you are.
        </p>
      </div>

      <div className="space-y-4">
        {availablePrompts.map((prompt) => {
          const isSelected = selectedPrompts.some(p => p.promptId === prompt.id);
          const selectedPrompt = selectedPrompts.find(p => p.promptId === prompt.id);
          
          return (
            <div key={prompt.id} className={`border rounded-lg p-4 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handlePromptSelection(prompt.id, prompt.text, e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">{prompt.text}</span>
                  </div>
                  
                  {isSelected && (
                    <div className="mt-3">
                      <textarea
                        value={selectedPrompt?.customText || ''}
                        onChange={(e) => handleCustomTextChange(prompt.id, e.target.value)}
                        rows={3}
                        maxLength={100}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="complete your thought..."
                      />
                      <div className="text-sm text-gray-500 mt-1">
                        {(selectedPrompt?.customText || '').length}/100 characters
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium">Tips for great featured prompts:</p>
            <ul className="text-sm text-blue-700 mt-1 ml-4 list-disc">
              <li>Be specific and personal</li>
              <li>Show your personality</li>
              <li>Keep it engaging and concise</li>
              <li>Use examples when possible</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-start space-x-4">
        <button
          onClick={saveFeaturedPrompts}
          disabled={isSaving || selectedPrompts.length !== 2}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSaving && <LoadingSpinner />}
          <span>{isSaving ? 'Saving...' : 'Save Featured Prompts'}</span>
        </button>
        <div className="flex items-center text-sm text-gray-500">
          {selectedPrompts.length}/2 prompts selected
        </div>
      </div>
    </div>
  );

  const renderPaymentSection = () => {
    const isGM = user?.role === 'approved_gm';
    
    if (isGM) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">GM Payment Settings</h2>
            <div className="text-sm text-gray-500">
              Set your session pricing for players to book your games
            </div>
          </div>

          {/* GM Pricing Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Session Pricing</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Session
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricingData.sessionPrice}
                    onChange={(e) => setPricingData({...pricingData, sessionPrice: parseFloat(e.target.value) || 0})}
                    className="block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="15.00"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{pricingData.currency}</span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  This is what players will see when booking your sessions
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={pricingData.currency}
                  onChange={(e) => setPricingData({...pricingData, currency: e.target.value})}
                  className="block w-full sm:text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => savePricingData()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Save Pricing
            </button>
          </div>

          {/* Payout Information */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payout Information</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">Payout Setup Coming Soon</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    We're working on integrating secure payout methods. You'll be able to add your bank account or PayPal information here soon.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction History</h3>
            <div className="text-center py-8">
              <div className="text-4xl mb-2">💰</div>
              <p className="text-gray-600">No transactions yet</p>
              <p className="text-sm text-gray-500 mt-1">Your completed session payouts will appear here</p>
            </div>
          </div>
        </div>
      );
    } else {
      // Regular user payment section
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Payment Settings</h2>
            <div className="text-sm text-gray-500">
              Manage your payment methods and view transaction history
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <h4 className="mt-2 text-lg font-medium text-gray-900">No payment methods</h4>
              <p className="mt-1 text-sm text-gray-500">Add a credit card or PayPal account to book sessions</p>
              <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Add Payment Method
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction History</h3>
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🧾</div>
              <p className="text-gray-600">No transactions yet</p>
              <p className="text-sm text-gray-500 mt-1">Your game session bookings and payments will appear here</p>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderReferAFriend = () => {
    const generateReferralCode = () => {
      if (!user) return 'guest-user';
      // Use existing referralCode if available, otherwise generate one
      if (user.referralCode) return user.referralCode;
      const userId = user._id;
      const username = user.username || 'user';
      const timestamp = Date.now().toString().slice(-6);
      return `${username}-${userId.slice(-4)}-${timestamp}`;
    };

    const copyReferralLink = () => {
      const referralCode = generateReferralCode();
      const referralLink = `${window.location.origin}/refer/${referralCode}`;
      navigator.clipboard.writeText(referralLink).then(() => {
        showNotification('Referral link copied to clipboard!', 'success');
      }).catch(() => {
        showNotification('Failed to copy referral link', 'error');
      });
    };

    return (
      <div className="space-y-8">
        {/* Available Credit Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Available Credit: $0.00</h2>
          <p className="text-gray-600 text-sm mb-6">Amount of credit available to use for adventures or game masters.</p>
        </div>

        {/* Give $10, Get $10 Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Give $10, Get $10!</h2>
          <p className="text-gray-600 text-sm mb-4">Refer a friend to Start Playing and get $10 credit when they spend $10 or more.</p>
          
          <button 
            onClick={copyReferralLink}
            className="inline-flex items-center px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Referral Link
          </button>
        </div>

        {/* Share on Social Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Share on social</h2>
          <p className="text-gray-600 text-sm mb-6">Share on your favorite social platform.</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Share on Facebook
            </button>
            
            <button className="flex items-center justify-center px-4 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Share on X
            </button>
            
            <button className="flex items-center justify-center px-4 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
              Share on Reddit
            </button>
            
            <button className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.162-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
              </svg>
              Share on Pinterest
            </button>
            
            <button className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Share via email
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Player Profile':
        return renderPlayerProfile();
      case 'Featured Prompts':
        return renderFeaturedPrompts();
      case 'Payment':
        return renderPaymentSection();
      case 'Refer a Friend':
        return renderReferAFriend();
      case 'Notifications':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Notification Settings</h2>
            <p className="text-gray-600">Notification preferences will be implemented here.</p>
          </div>
        );
      case 'Privacy':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Privacy Settings</h2>
            <p className="text-gray-600">Privacy controls will be implemented here.</p>
          </div>
        );
      case 'Social Login':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Social Login</h2>
            <p className="text-gray-600">Social login options will be implemented here.</p>
          </div>
        );
      default:
        return renderPlayerProfile();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => navigate(tabToPath[tab])}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
              <span className="ml-3 text-gray-600">Loading profile...</span>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>

        {/* Success Message Toast */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-medium">Profile saved successfully!</p>
                <p className="text-sm text-green-100">Your changes have been saved.</p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="text-green-100 hover:text-white ml-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
