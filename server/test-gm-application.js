const mongoose = require('mongoose');

// Define the schema inline
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  dmApplication: {
    experience: String,
    availability: String,
    specialties: [String],
    submissionDate: Date,
    status: String
  }
});

const User = mongoose.model('User', userSchema);

mongoose.connect('mongodb://localhost:27017/kazrpg', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Find testuser and give them a GM application
    const testUser = await User.findOne({ username: 'testuser' });
    if (testUser) {
      testUser.role = 'gm_applicant';
      testUser.dmApplication = {
        experience: 'I have 5 years of experience running D&D campaigns',
        availability: 'Weekends and evenings',
        specialties: ['D&D 5e', 'Pathfinder'],
        submissionDate: new Date(),
        status: 'pending'
      };
      await testUser.save();
      console.log('Test user updated with GM application:', {
        userId: testUser._id,
        username: testUser.username,
        role: testUser.role,
        applicationStatus: testUser.dmApplication?.status
      });
    } else {
      console.log('Test user not found');
    }
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
  });
