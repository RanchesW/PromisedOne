// Server script to reset all user avatars to null (use default avatars)
// Run this in your server environment or add as a route

const mongoose = require('mongoose');

// Connect to your MongoDB
const resetAvatars = async () => {
  try {
    // Update all users to have null avatars
    const result = await mongoose.connection.db.collection('users').updateMany(
      { avatar: { $regex: /^\/uploads\/avatars\// } }, // Match legacy avatar paths
      { $set: { avatar: null } }
    );
    
    console.log(`✅ Reset ${result.modifiedCount} user avatars to default`);
  } catch (error) {
    console.error('❌ Error resetting avatars:', error);
  }
};

// Call the function
resetAvatars();