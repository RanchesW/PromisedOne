import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, UserDocument } from '../models/User';
import { UserRole } from '@kazrpg/shared';
import { getJwtSecret, getJwtExpiresIn } from '../config/jwt';
import { emailService } from '../services/emailService';

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

    // Generate email verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create new user
    const user = new User({
      email,
      password,
      username,
      firstName,
      lastName,
      role: UserRole.PLAYER,
      timezone,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      isActive: false, // User inactive until email verified
      preferences: {
        experienceLevel,
        systems: preferredSystems,
        platforms: ['online'] // Default to online
      }
    });

    await user.save();

    // Send verification email
    const emailSent = await emailService.sendVerificationEmail(
      email, 
      verificationCode, 
      firstName
    );

    if (!emailSent) {
      console.warn('Failed to send verification email, but user was created');
    }

    // Store verification code temporarily (in production, use Redis or database)
    // For now, we'll use a simple in-memory store
    global.verificationCodes = global.verificationCodes || {};
    global.verificationCodes[verificationToken] = {
      code: verificationCode,
      userId: user._id.toString(),
      email,
      expires: verificationExpires
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for verification code.',
      data: {
        userId: user._id,
        email: user.email,
        verificationToken,
        emailSent,
        requiresVerification: true
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

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address before logging in',
        requiresVerification: true,
        email: user.email
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account is currently inactive. Please contact support.',
        accountInactive: true
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

// @route   POST /api/auth/verify-email
// @desc    Verify email address with code
// @access  Public
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { verificationToken, verificationCode } = req.body;

    if (!verificationToken || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Verification token and code are required'
      });
    }

    // Get verification data from memory store
    global.verificationCodes = global.verificationCodes || {};
    const verificationData = global.verificationCodes[verificationToken];

    if (!verificationData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Check if code matches and hasn't expired
    if (verificationData.code !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    if (new Date() > verificationData.expires) {
      delete global.verificationCodes[verificationToken];
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    // Find and update user
    const user = await User.findById(verificationData.userId);
    if (!user) {
      delete global.verificationCodes[verificationToken];
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify and activate user
    user.isEmailVerified = true;
    user.isActive = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    // Clean up verification data
    delete global.verificationCodes[verificationToken];

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.firstName);

    // Generate login token
    const token = generateToken(user._id.toString());

    // Remove sensitive data from response
    const userResponse = { ...user.toObject() };
    const { password: _, emailVerificationToken, emailVerificationExpires, ...userWithoutSensitiveData } = userResponse;

    res.json({
      success: true,
      message: 'Email verified successfully! Welcome to KazRPG!',
      data: {
        user: userWithoutSensitiveData,
        token
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

    // Update user with new token
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Store in memory
    global.verificationCodes = global.verificationCodes || {};
    global.verificationCodes[verificationToken] = {
      code: verificationCode,
      userId: user._id.toString(),
      email,
      expires: verificationExpires
    };

    // Send verification email
    const emailSent = await emailService.sendVerificationEmail(
      email,
      verificationCode,
      user.firstName
    );

    res.json({
      success: true,
      message: 'Verification email resent successfully',
      data: {
        verificationToken,
        emailSent
      }
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during resending verification'
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
