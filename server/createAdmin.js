import fetch from 'node-fetch';

const createAdminUser = async () => {
  try {
    console.log('🌱 Creating admin user via API...');

    const adminUserData = {
      email: 'rancheswest777@gmail.com',
      password: 'Ali256652!',
      username: 'admin_ali',
      firstName: 'Ali',
      lastName: 'Admin',
      timezone: 'UTC',
      experienceLevel: 'advanced',
      preferredSystems: ['dnd_5e', 'pathfinder_2e', 'call_of_cthulhu', 'vampire_masquerade', 'cyberpunk_red']
    };

    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminUserData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: rancheswest777@gmail.com');
      console.log('🔑 Password: Ali256652!');
      console.log('👤 Username:', result.data.user.username);
      console.log('🎭 Role:', result.data.user.role);
      
      // Now update the user to admin role manually in database
      console.log('\n⚠️ Note: User was created with PLAYER role. Updating to ADMIN role...');
      
      // Import and update the user role directly
      const mongoose = require('mongoose');
      const { User } = require('./src/models/User');
      
      await mongoose.connect('mongodb://localhost:27017/kazrpg');
      
      const updatedUser = await User.findOneAndUpdate(
        { email: 'rancheswest777@gmail.com' },
        { role: 'admin' },
        { new: true }
      );
      
      console.log('✅ User role updated to ADMIN successfully!');
      console.log('👑 Final role:', updatedUser.role);
      
      await mongoose.connection.close();
      
    } else {
      console.log('❌ Failed to create admin user:', result.message);
      if (result.message.includes('already exists')) {
        console.log('📝 User might already exist. Login credentials:');
        console.log('📧 Email: rancheswest777@gmail.com');
        console.log('🔑 Password: Ali256652!');
      }
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

createAdminUser();
