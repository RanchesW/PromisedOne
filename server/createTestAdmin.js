const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
async function createAdminUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/kazrpg');
    console.log('Connected to MongoDB');

    // User schema (simplified for this script)
    const userSchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: { type: String, unique: true },
      username: { type: String, unique: true },
      password: String,
      role: { type: String, default: 'player' },
      isVerified: { type: Boolean, default: false },
      timezone: String,
      bio: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    const User = mongoose.model('User', userSchema);

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@kazrpg.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('📧 Email: admin@kazrpg.com');
      console.log('🔑 Password: admin123');
      console.log('👑 Role:', existingAdmin.role);
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@kazrpg.com',
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      timezone: 'UTC',
      bio: 'System Administrator for KazRPG platform'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@kazrpg.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Role: admin');
    console.log('');
    console.log('🚀 You can now login with these credentials to test the admin panel.');

  } catch (error) {
    if (error.code === 11000) {
      console.log('⚠️ User already exists. Checking if it\'s an admin...');
      const User = mongoose.model('User');
      const existingUser = await User.findOne({ email: 'admin@kazrpg.com' });
      if (existingUser && existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log('✅ Updated existing user to admin role!');
        console.log('📧 Email: admin@kazrpg.com');
        console.log('🔑 Use your existing password');
        console.log('👑 Role: admin');
      } else {
        console.log('✅ Admin user already exists!');
        console.log('📧 Email: admin@kazrpg.com');
      }
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser();
