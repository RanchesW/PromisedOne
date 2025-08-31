/**
 * Convert a relative image path to an absolute URL or return base64 data URL as is
 * @param imagePath - The path from the backend (could be base64 data URL or legacy file path)
 * @returns URL that can be used in img src attribute
 */
export const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return '';
  
  // If it's a data URL (base64), return as is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // If it's already an absolute HTTP URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Legacy support: for old file-based images, construct URL
  // This can be removed after migration is complete
  const BACKEND_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || '';
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  const fullUrl = `${BACKEND_URL}${cleanPath}`;
  
  console.log('Legacy image path detected:', {
    originalPath: imagePath,
    fullUrl
  });
  
  return fullUrl;
};

/**
 * Get initials avatar for a user
 */
export const getInitialsAvatar = (name?: string): string => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};
