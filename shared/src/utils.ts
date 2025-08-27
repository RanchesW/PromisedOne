// Format currency values
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
};

// Format date and time with timezone
export const formatDateTime = (date: Date, timezone: string = 'UTC'): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
    timeZoneName: 'short',
  }).format(new Date(date));
};

// Format date only
export const formatDate = (date: Date, timezone: string = 'UTC'): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  }).format(new Date(date));
};

// Format time only
export const formatTime = (date: Date, timezone: string = 'UTC'): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  }).format(new Date(date));
};

// Calculate time until a specific date
export const getTimeUntil = (targetDate: Date): string => {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) return 'Started';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// Calculate duration between two dates
export const calculateDuration = (startDate: Date, endDate: Date): string => {
  const diff = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Generate a random referral code
export const generateReferralCode = (username: string): string => {
  const prefix = username.substring(0, 3).toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${suffix}`;
};

// Calculate referral credit amount
export const calculateReferralCredit = (gamePrice: number): number => {
  // 10% of game price, minimum $1, maximum $10
  return Math.min(Math.max(gamePrice * 0.1, 1), 10);
};

// Sanitize HTML content
export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '');
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Convert timezone names to readable format
export const formatTimezone = (timezone: string): string => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(now);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || timezone;
    return `${timezone.replace('_', ' ')} (${timeZoneName})`;
  } catch {
    return timezone;
  }
};

// Get common timezones
export const getCommonTimezones = (): { value: string; label: string }[] => {
  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Toronto',
    'America/Vancouver',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney',
    'Australia/Melbourne',
  ];
  
  return timezones.map(tz => ({
    value: tz,
    label: formatTimezone(tz),
  }));
};

// Calculate Early Bird discount
export const calculateEarlyBirdPrice = (originalPrice: number, discountPercentage: number): number => {
  return originalPrice * (1 - discountPercentage / 100);
};

// Get age-appropriate label
export const getAgeLabel = (minAge?: number, maxAge?: number): string => {
  if (!minAge && !maxAge) return 'All Ages';
  if (minAge && !maxAge) return `${minAge}+`;
  if (!minAge && maxAge) return `Under ${maxAge}`;
  return `${minAge}-${maxAge}`;
};

// Convert game system enum to display name
export const getSystemDisplayName = (system: string): string => {
  const systemNames: Record<string, string> = {
    dnd_5e: 'D&D 5th Edition',
    pathfinder_2e: 'Pathfinder 2E',
    call_of_cthulhu: 'Call of Cthulhu',
    vampire_masquerade: 'Vampire: The Masquerade',
    cyberpunk_red: 'Cyberpunk RED',
    other: 'Other System',
  };
  
  return systemNames[system] || system.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Generate game slug for URLs
export const generateGameSlug = (title: string, gameId: string): string => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  return `${slug}-${gameId.slice(-6)}`;
};

// Parse game slug to get ID
export const parseGameSlug = (slug: string): string | null => {
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  return lastPart.length === 6 ? lastPart : null;
};
