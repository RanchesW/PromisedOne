import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kazrpg';
    
    console.log('🔌 Attempting to connect to MongoDB:', mongoUri);
    
    await mongoose.connect(mongoUri);
    
    console.log('✅ MongoDB connected successfully');
    
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    console.log('💡 To fix this issue:');
    console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
    console.log('2. Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas');
    console.log('3. Or use Docker: docker run -p 27017:27017 mongo:latest');
    
    // Don't exit the process, continue without database for development
    console.log('⚠️ Continuing without database connection for now...');
  }
};
