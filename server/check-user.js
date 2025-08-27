const mongoose = require('mongoose');

// Import the models
const User = require('./src/models/User').User;

async function checkUser() {
    try {
        await mongoose.connect('mongodb://localhost:27017/kazrpg');
        console.log('Connected to MongoDB');

        // Find the user that was trying to submit DM application
        const user = await User.findById('68a6c2bae7b0c122946e7457');
        
        if (user) {
            console.log('User found:', {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                hasDmApplication: !!user.dmApplication
            });
            
            if (user.dmApplication) {
                console.log('DM Application details:', user.dmApplication);
            }
        } else {
            console.log('User not found');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkUser();
