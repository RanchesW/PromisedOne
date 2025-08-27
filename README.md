# KazRPG - TRPG Enthusiast Platform

A full-stack web application connecting tabletop role-playing game enthusiasts, players, and game masters.

## 🎲 Features

### User Roles
- **Players**: Browse games, join sessions, book seats, review sessions, earn referral credits
- **GM Applicants**: Submit applications with resume/portfolio  
- **Approved GMs**: Create/manage game listings, tag campaigns
- **Admins**: Review applications, manage refunds and disputes

### Core Features
- **Search & Filter**: Keyword search, system/platform filters, date/time, price range, session type, experience level
- **Game Listings**: System info, platform, price, seat availability, booking options
- **Booking System**: Instant booking with Stripe, request to join with GM approval
- **Messaging**: Direct messaging, custom matchmaking requests
- **Reviews**: Public ratings and private GM feedback
- **Incentives**: Referral credits, Early Bird discounts
- **Time Zone Support**: Local time display and filtering
- **Campaign Tags**: Labels like "roleplay-heavy", "newbie-friendly"

## 🛠 Tech Stack

- **Frontend**: React 18 with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with role-based access control
- **Payment**: Stripe integration
- **Real-time**: Socket.io for messaging
- **Deployment**: Docker containers

## 📁 Project Structure

```
KazRPG/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.tsx
│   ├── public/
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   └── index.ts
│   └── package.json
├── shared/                 # Shared types and utilities
│   ├── src/
│   │   ├── types.ts        # TypeScript interfaces
│   │   └── utils.ts        # Utility functions
│   └── package.json
├── docker-compose.yml      # Development environment
├── mongo-init.js          # MongoDB initialization
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- MongoDB 7+ ([Download](https://www.mongodb.com/try/download/community))
- Git ([Download](https://git-scm.com/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd KazRPG
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ../shared && npm install && npm run build
   ```

3. **Set up environment variables:**
   ```bash
   # Server environment
   cp server/.env.example server/.env
   # Edit server/.env with your configuration
   
   # Client environment  
   cp client/.env.example client/.env
   # Edit client/.env with your API URL
   ```

4. **Start MongoDB:**
   - Using MongoDB Compass or command line
   - Default connection: `mongodb://localhost:27017/kazrpg`

5. **Start development servers:**
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev
   
   # Terminal 2 - Frontend  
   cd client && npm start
   ```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

## 🔧 Configuration

### Server Environment Variables (server/.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kazrpg
JWT_SECRET=your-super-secret-jwt-key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
CORS_ORIGIN=http://localhost:3000
```

### Client Environment Variables (client/.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

## 📡 API Documentation

The API follows RESTful conventions with the following main endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token

### Games
- `GET /api/games` - List games with filters
- `POST /api/games` - Create new game (GM only)
- `GET /api/games/:id` - Get game details
- `PUT /api/games/:id` - Update game (GM only)
- `DELETE /api/games/:id` - Delete game (GM only)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Reviews
- `GET /api/reviews/game/:gameId` - Get game reviews
- `POST /api/reviews` - Submit review
- `PUT /api/reviews/:id` - Update review

## 🎨 UI/UX Features

### Fantasy Theme
- **Dark/Light Mode**: Toggle between themes
- **Fantasy Typography**: Cinzel font for headings
- **Color Scheme**: Orange/amber accents with slate backgrounds
- **Animations**: Hover effects, floating elements, glow effects
- **Responsive Design**: Mobile-first approach

### Components
- **Layout**: Header, footer, navigation with mobile menu
- **Forms**: Styled inputs, validation, loading states
- **Cards**: Game cards, user cards with hover effects
- **Buttons**: Primary, secondary, outline variants
- **Loading**: Spinners and skeleton states

## 🐳 Docker Development

Use Docker Compose for a complete development environment:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services included:
- MongoDB with initialization script
- Redis for session storage
- Backend API server
- Frontend React app

## 🧪 Testing

```bash
# Run client tests
cd client && npm test

# Run server tests  
cd server && npm test

# Run all tests
npm test
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Server-side validation with Joi
- **Rate Limiting**: API endpoint protection
- **CORS Protection**: Configured origins
- **Helmet**: Security headers middleware

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secrets
4. Configure Stripe production keys
5. Set up SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Email: support@kazrpg.com

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced GM tools
- [ ] Integration with VTT platforms
- [ ] Community forums
- [ ] Tournament system
- [ ] Streaming integration

---

**Happy Gaming! 🎲**
