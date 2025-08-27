import mongoose from 'mongoose';
import { User } from '../models/User';
import { UserRole } from '@kazrpg/shared';
import '../config/database';

const seedAdmin = async () => {
  try {
    console.log('🌱 Starting admin user seeding...');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'rancheswest777@gmail.com' });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists with email: rancheswest777@gmail.com');
      console.log('User details:', {
        email: existingAdmin.email,
        username: existingAdmin.username,
        role: existingAdmin.role,
        firstName: existingAdmin.firstName,
        lastName: existingAdmin.lastName
      });
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      email: 'rancheswest777@gmail.com',
      password: 'Ali256652!',
      username: 'admin_ali',
      firstName: 'Ali',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      timezone: 'UTC',
      bio: 'System Administrator for KazRPG Platform',
      isEmailVerified: true,
      preferences: {
        experienceLevel: 'advanced',
        systems: ['dnd_5e', 'pathfinder_2e', 'call_of_cthulhu', 'vampire_masquerade', 'cyberpunk_red'],
        platforms: ['online', 'in_person', 'hybrid']
      },
      stats: {
        gamesPlayed: 50,
        gamesHosted: 25,
        averageRating: 4.8,
        totalReviews: 30
      }
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log('Credentials:');
    console.log('Email: rancheswest777@gmail.com');
    console.log('Password: Ali256652!');
    console.log('Role:', adminUser.role);
    console.log('Username:', adminUser.username);
    
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedAdmin();
}

export default seedAdmin;
