const mongoose = require('mongoose');

const updateUserToAdmin = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect('mongodb+srv://ranchesw:Ali256652@kazrpg.obl4ctn.mongodb.net/?retryWrites=true&w=majority&appName=KazRPG');
    
    console.log('🔍 Finding user with email: rancheswest777@gmail.com');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const user = await User.findOne({ email: 'rancheswest777@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('👤 Current user role:', user.role);
    
    const updatedUser = await User.findOneAndUpdate(
      { email: 'rancheswest777@gmail.com' },
      { role: 'admin' },
      { new: true }
    );
    
    console.log('✅ User role updated successfully!');
    console.log('👑 New role:', updatedUser.role);
    console.log('📧 Email:', updatedUser.email);
    console.log('👤 Username:', updatedUser.username);
    
    console.log('\n🎉 Admin account is ready!');
    console.log('Login credentials:');
    console.log('📧 Email: rancheswest777@gmail.com');
    console.log('🔑 Password: Ali256652!');
    
  } catch (error) {
    console.error('❌ Error updating user role:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

updateUserToAdmin();
