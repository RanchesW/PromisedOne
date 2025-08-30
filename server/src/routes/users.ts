import { Router, Request, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { UserRole } from '../../../shared/src/types';

const router = Router();

// Get user profile
router.get('/profile', auth, async (req: AuthRequest, res: Response) => {
  try {
    console.log('Profile route debug:', {
      hasUser: !!req.user,
      userId: req.user?._id,
      userIdType: typeof req.user?._id,
      userIdString: req.user?._id?.toString()
    });
    
    const user = await User.findById(req.user?._id?.toString()).select('-password');
    
    console.log('Profile user lookup result:', {
      userFound: !!user,
      searchedUserId: req.user?._id?.toString()
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, bio, timezone, preferences, pronouns, identityTags, gameStyles, themes, pricing } = req.body;
    
    const user = await User.findById(req.user?._id?.toString());
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update fields if provided
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (timezone !== undefined) user.timezone = timezone;
    if (pronouns !== undefined) user.pronouns = pronouns;
    if (identityTags !== undefined) user.identityTags = identityTags;
    if (gameStyles !== undefined) user.gameStyles = gameStyles;
    if (themes !== undefined) user.themes = themes;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }
    if (pricing) {
      user.pricing = { ...user.pricing, ...pricing };
    }

    await user.save();
    
    // Return user without password
    const updatedUser = await User.findById(user._id).select('-password');
    res.json({ 
      success: true, 
      data: updatedUser 
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Apply to become a DM
router.post('/apply-dm', auth, async (req: AuthRequest, res: Response) => {
  console.log('APPLY-DM ROUTE CALLED - START');
  try {
    console.log('DM application submission debug:', {
      hasUser: !!req.user,
      userId: req.user?._id,
      userEmail: req.user?.email,
      body: req.body
    });

    const { experience, preferredSystems, availability, sampleGameDescription, references } = req.body;
    
    // Validation
    if (!experience || !preferredSystems || !availability || !sampleGameDescription) {
      console.log('DM application validation failed: Missing required fields');
      return res.status(400).json({ 
        message: 'Experience, preferred systems, availability, and sample game description are required' 
      });
    }

    if (!Array.isArray(preferredSystems) || preferredSystems.length === 0) {
      console.log('DM application validation failed: Invalid preferred systems');
      return res.status(400).json({ 
        message: 'At least one preferred game system must be selected' 
      });
    }

    const user = await User.findById(req.user?._id?.toString());
    if (!user) {
      console.log('DM application error: User not found for ID:', req.user?._id?.toString());
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('DM application user check:', {
      userFound: !!user,
      userRole: user.role,
      hasExistingApplication: !!user.dmApplication
    });

    // Check if user is already a GM or applicant
    if (user.role === UserRole.APPROVED_GM) {
      console.log('DM application error: User is already approved GM');
      return res.status(400).json({ message: 'You are already an approved GM' });
    }

    if (user.role === UserRole.GM_APPLICANT) {
      console.log('DM application error: User already has pending application');
      return res.status(400).json({ message: 'You have already submitted a GM application' });
    }

    // Update user role to GM_APPLICANT
    user.role = UserRole.GM_APPLICANT;
    
    // Store application data in user document (you might want to create a separate DMApplication model)
    user.dmApplication = {
      experience,
      preferredSystems,
      availability,
      sampleGameDescription,
      references: references || '',
      submittedAt: new Date(),
      status: 'pending'
    };

    console.log('DM application saving:', {
      newRole: user.role,
      applicationData: user.dmApplication
    });

    await user.save();

    console.log('DM application saved successfully');

    // In a real application, you might want to:
    // 1. Send notification to admins
    // 2. Create a separate DMApplication document
    // 3. Send confirmation email to user

    res.json({ 
      message: 'GM application submitted successfully',
      user: await User.findById(user._id).select('-password')
    });
  } catch (error) {
    console.error('Error submitting DM application:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: req.user?._id
    });
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available featured prompts
router.get('/featured-prompts', auth, async (req: AuthRequest, res: Response) => {
  try {
    const prompts = [
      { id: 'became_gm_because', text: 'I became a GM because' },
      { id: 'favorite_system', text: 'My favorite system of all time is' },
      { id: 'best_moment', text: 'My best gaming moment was when' },
      { id: 'character_type', text: 'I always play the character who' },
      { id: 'dm_style', text: 'My DM style can best be described as' },
      { id: 'game_goal', text: 'What I want most from a game is' },
      { id: 'player_pet_peeve', text: 'My biggest pet peeve as a player is' },
      { id: 'memorable_npc', text: 'The most memorable NPC I created was' },
      { id: 'campaign_dream', text: 'My dream campaign would be' },
      { id: 'gaming_philosophy', text: 'My gaming philosophy is' }
    ];
    
    res.json({
      success: true,
      data: prompts
    });
  } catch (error) {
    console.error('Error fetching featured prompts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update user's featured prompts
router.put('/featured-prompts', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { featuredPrompts } = req.body;
    
    // Validate that we have exactly 2 featured prompts
    if (!Array.isArray(featuredPrompts) || featuredPrompts.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'You must select exactly 2 featured prompts'
      });
    }
    
    // Validate each prompt has required fields
    for (const prompt of featuredPrompts) {
      if (!prompt.promptId || !prompt.customText) {
        return res.status(400).json({
          success: false,
          message: 'Each featured prompt must have promptId and customText'
        });
      }
      if (prompt.customText.length > 200) {
        return res.status(400).json({
          success: false,
          message: 'Featured prompt text must be 200 characters or less'
        });
      }
    }
    
    const user = await User.findById(req.user?._id?.toString());
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.featuredPrompts = featuredPrompts;
    await user.save();
    
    const updatedUser = await User.findById(user._id).select('-password');
    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating featured prompts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get public user profile (accessible to authenticated users)
router.get('/:userId/public', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    console.log('Public profile request:', {
      requestedUserId: userId,
      requestingUser: req.user?._id
    });
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Return user data (without sensitive information)
    res.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    console.error('Error fetching public user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get all users (admin only)
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    const currentUser = await User.findById(req.user?._id);
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { page = 1, limit = 10, role, search } = req.query;
    const query: any = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all Game Masters (public endpoint)
router.get('/game-masters', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 12, search, priceRange, timezone, language, gameStyles, themes, system } = req.query;
    
    // Build query for approved GMs
    const query: any = { 
      role: UserRole.APPROVED_GM,
      // Optionally filter out inactive users
      isActive: { $ne: false }
    };

    // Search filter
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    // Price range filter (this would need to be calculated from their games)
    // For now, we'll skip this filter

    // Timezone filter
    if (timezone) {
      query.timezone = timezone;
    }

    // Language filter
    if (language) {
      const languageArray = Array.isArray(language) ? language : (typeof language === 'string' ? language.split(',') : []);
      query['profile.languages'] = { $in: languageArray };
    }

    // Game styles filter
    if (gameStyles) {
      const styleArray = Array.isArray(gameStyles) ? gameStyles : (typeof gameStyles === 'string' ? gameStyles.split(',') : []);
      query.gameStyles = { $in: styleArray };
    }

    // Themes filter
    if (themes) {
      const themeArray = Array.isArray(themes) ? themes : (typeof themes === 'string' ? themes.split(',') : []);
      query.themes = { $in: themeArray };
    }

    // System filter (from preferences)
    if (system) {
      const systemArray = Array.isArray(system) ? system : (typeof system === 'string' ? system.split(',') : []);
      query['preferences.systems'] = { $in: systemArray };
    }

    const gameMasters = await User.find(query)
      .select('username firstName lastName avatar bio pronouns stats identityTags gameStyles themes createdAt timezone pricing')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        data: gameMasters,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching game masters:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

export default router;
