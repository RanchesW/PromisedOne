const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  username: String,
  avatar: String,
  isActive: Boolean
});

const User = mongoose.model('User', userSchema);

async function testSearch() {
  try {
    await mongoose.connect('mongodb://localhost:27017/kazrpg');
    console.log('Connected to MongoDB');

    const users = await User.find({
      username: { $regex: 'admin_ali', $options: 'i' }
    }).select('username firstName lastName avatar isActive');

    console.log('Search results for admin_ali:', JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testSearch();
