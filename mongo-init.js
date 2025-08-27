// MongoDB initialization script
db = db.getSiblingDB('kazrpg');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'username', 'firstName', 'lastName', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
        },
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 30
        },
        role: {
          enum: ['player', 'gm_applicant', 'approved_gm', 'admin']
        }
      }
    }
  }
});

db.createCollection('games');
db.createCollection('bookings');
db.createCollection('reviews');
db.createCollection('messages');
db.createCollection('requests');
db.createCollection('notifications');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ referralCode: 1 }, { unique: true, sparse: true });

db.games.createIndex({ gm: 1 });
db.games.createIndex({ 'schedule.startTime': 1 });
db.games.createIndex({ system: 1 });
db.games.createIndex({ platform: 1 });
db.games.createIndex({ isActive: 1 });

db.bookings.createIndex({ game: 1 });
db.bookings.createIndex({ player: 1 });
db.bookings.createIndex({ status: 1 });

db.reviews.createIndex({ game: 1 });
db.reviews.createIndex({ gm: 1 });
db.reviews.createIndex({ reviewer: 1 });

console.log('KazRPG database initialized successfully!');
