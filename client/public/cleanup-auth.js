// Emergency authentication cleanup utility
// Run this in browser console to completely clear all auth data

console.log('🧹 Starting emergency auth cleanup...');

// Clear all localStorage items
const localStorageKeys = Object.keys(localStorage);
console.log('📦 Found localStorage keys:', localStorageKeys);

localStorageKeys.forEach(key => {
  if (key.includes('auth') || key.includes('token') || key.includes('user') || key.includes('jwt')) {
    console.log('🗑️ Removing localStorage key:', key);
    localStorage.removeItem(key);
  }
});

// Specific cleanup for known keys
const keysToRemove = [
  'authToken',
  'token', 
  'user',
  'jwt',
  'accessToken',
  'refreshToken',
  'userSession',
  'currentUser'
];

keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    console.log('🗑️ Removing known key:', key);
    localStorage.removeItem(key);
  }
});

// Clear sessionStorage
console.log('🧽 Clearing sessionStorage...');
sessionStorage.clear();

// Clear any cookies (if any)
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

console.log('✅ Auth cleanup complete! Refreshing page in 2 seconds...');

setTimeout(() => {
  window.location.reload();
}, 2000);