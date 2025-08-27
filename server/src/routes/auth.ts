import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserDocument } from '../models/User';
import { UserRole } from '@kazrpg/shared';
import { getJwtSecret, getJwtExpiresIn } from '../config/jwt';

const router = Router();

// Generate JWT token
const generateToken = (userId: string): string => {
  const jwtSecret = getJwtSecret();
  const expiresIn = getJwtExpiresIn();
  console.log('Generate token: Using JWT secret length:', jwtSecret.length, 'First 10 chars:', jwtSecret.substring(0, 10));
  return jwt.sign({ userId }, jwtSecret as string, { expiresIn } as jwt.SignOptions);
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { 
      email, 
      password, 
      username, 
      firstName, 
      lastName, 
      timezone,
      experienceLevel = 'beginner',
      preferredSystems = []
    } = req.body;

    // Validation
    if (!email || !password || !username || !firstName || !lastName || !timezone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
        errors: {
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null,
          username: !username ? 'Username is required' : null,
          firstName: !firstName ? 'First name is required' : null,
          lastName: !lastName ? 'Last name is required' : null,
          timezone: !timezone ? 'Timezone is required' : null,
        }
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Username length validation
    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      username,
      firstName,
      lastName,
      role: UserRole.PLAYER,
      timezone,
      lastLoginAt: new Date(), // Set initial login time on registration
      preferences: {
        experienceLevel,
        systems: preferredSystems,
        platforms: ['online'] // Default to online
      }
    });

    await user.save();

    // Generate token
    const token = generateToken((user._id as string).toString());

    // Remove password from response
    const userResponse = { ...user.toObject() };
    const { password: _, ...userWithoutPassword } = userResponse;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if user exists and get password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login time
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = generateToken((user._id as string).toString());

    // Remove password from response
    const userResponse = { ...user.toObject() };
    const { password: _, ...userWithoutPassword } = userResponse;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', (req, res) => {
  res.json({ message: 'Refresh token endpoint' });
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint' });
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', (req, res) => {
  res.json({ message: 'Forgot password endpoint' });
});

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', (req, res) => {
  res.json({ message: 'Reset password endpoint' });
});

export default router;
