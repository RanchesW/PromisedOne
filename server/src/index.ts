import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import gameRoutes from './routes/games';
import bookingRoutes from './routes/bookings';
import messageRoutes from './routes/messages';
import uploadRoutes from './routes/upload';
import paymentRoutes from './routes/payments';
import adminRoutes from './routes/admin';
import favoritesRoutes from './routes/favorites';
import path from 'path';

// Load environment variables from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Debug environment loading
console.log('Environment loaded:');
console.log('- JWT_SECRET loaded:', !!process.env.JWT_SECRET);
console.log('- JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
console.log('- JWT_SECRET first 10 chars:', process.env.JWT_SECRET?.substring(0, 10) || 'undefined');

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'http://localhost:3000',
        'http://95.141.138.162:3000',
        'https://promised-one-client.vercel.app',
        'https://promised-one-client-3zyz5hl0k-ranchesws-projects.vercel.app'
      ];
      
      const isVercelPreview = origin.includes('promised-one-client') && origin.includes('vercel.app');
      
      if (allowedOrigins.includes(origin) || isVercelPreview) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable CSP for development
}));
app.use(compression());
app.use(morgan('combined'));

// CORS - apply CORS before static files
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (same-origin requests in production)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000', // Local development
      'http://95.141.138.162:3000', // Development IP
      'https://promised-one-client.vercel.app', // Old Vercel URLs
      'https://promised-one-client-3zyz5hl0k-ranchesws-projects.vercel.app',
      'https://kazrpg-fullstack.onrender.com' // New Render URL
    ];
    
    // Allow any Vercel preview deployment or Render URLs
    const isVercelPreview = origin.includes('promised-one-client') && origin.includes('vercel.app');
    const isRenderURL = origin.includes('.onrender.com');
    
    if (allowedOrigins.includes(origin) || isVercelPreview || isRenderURL) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting - temporarily disabled for debugging
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // Increased for development
//   message: 'Too many requests from this IP, please try again later.',
// });
// app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Test API route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'KazRPG API is running',
    version: '1.0.0',
    endpoints: [
      'GET /health',
      'GET /api',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/games',
      'GET /api/users'
    ]
  });
});

// Debug route imports
console.log('Route imports check:');
console.log('- authRoutes:', typeof authRoutes, Object.keys(authRoutes || {}));
console.log('- userRoutes:', typeof userRoutes, Object.keys(userRoutes || {}));
console.log('- gameRoutes:', typeof gameRoutes, Object.keys(gameRoutes || {}));

// API Routes
console.log('Registering API routes...');
app.use('/api/auth', authRoutes);
console.log('✓ Auth routes registered');
app.use('/api/users', userRoutes);
console.log('✓ User routes registered');
app.use('/api/games', gameRoutes);
console.log('✓ Game routes registered');
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoritesRoutes);
console.log('All routes registered!');

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, '../../client/build')));
  
  // Catch-all handler for React Router
  app.get('*', (req, res) => {
    // Don't serve React app for API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
  
  console.log('Production mode: Serving React build from /client/build');
} else {
  console.log('Development mode: React served separately on port 3000');
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on('send-message', (data) => {
    // Emit to other users in the room
    socket.to(data.roomId).emit('receive-message', data);
    
    // Also emit delivery confirmation back to sender
    socket.emit('message-delivered-update', {
      messageId: data.messageId,
      deliveredAt: new Date()
    });
  });

  socket.on('message-read', (data: { messageId: string; roomId: string }) => {
    // Mark message as read and notify other users in the room
    socket.to(data.roomId).emit('message-read-update', {
      messageId: data.messageId,
      readBy: socket.id,
      readAt: new Date()
    });
    console.log(`Message ${data.messageId} marked as read in room ${data.roomId}`);
  });

  socket.on('message-delivered', (data: { messageId: string; roomId: string }) => {
    // Mark message as delivered and notify sender
    socket.to(data.roomId).emit('message-delivered-update', {
      messageId: data.messageId,
      deliveredTo: socket.id,
      deliveredAt: new Date()
    });
    console.log(`Message ${data.messageId} marked as delivered in room ${data.roomId}`);
  });

  socket.on('typing', (data: { roomId: string; isTyping: boolean }) => {
    socket.to(data.roomId).emit('user-typing', {
      userId: socket.id,
      isTyping: data.isTyping
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Try to connect to MongoDB, but don't fail if it's not available
    await connectDatabase();
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN}`);
      console.log(`💾 Database: MongoDB connected`);
    });
  } catch (error) {
    console.warn('⚠️ MongoDB not available, starting server anyway...');
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN}`);
      console.log(`💾 Database: Using JSON file storage (development mode)`);
      console.log(`💡 To use MongoDB:`);
      console.log(`   1. Install MongoDB: https://www.mongodb.com/try/download/community`);
      console.log(`   2. Or run: docker run -p 27017:27017 mongo:latest`);
      console.log(`   3. Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas`);
    });
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Process terminated');
  });
});

startServer();

export default app;
