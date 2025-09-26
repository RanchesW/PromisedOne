// Clear all authentication data from browser storage
console.log('🧹 Clearing authentication data...');

// Remove all possible token keys
localStorage.removeItem('authToken');
localStorage.removeItem('token');
localStorage.removeItem('user');

// Clear session storage
sessionStorage.clear();

// Clear any other auth-related items
Object.keys(localStorage).forEach(key => {
  if (key.includes('auth') || key.includes('token') || key.includes('user')) {
    localStorage.removeItem(key);
  }
});

console.log('✅ All authentication data cleared!');
console.log('📍 Please refresh the page and try logging in again.');

// Optional: Redirect to login page
if (window.location.pathname !== '/login') {
  window.location.href = '/login';
}