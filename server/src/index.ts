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
import reviewRoutes from './routes/reviews';
import messageRoutes from './routes/messages';
import requestRoutes from './routes/requests';
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
    origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
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
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoritesRoutes);

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
    socket.to(data.roomId).emit('receive-message', data);
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
