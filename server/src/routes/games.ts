import { Router, Request, Response } from 'express';
import { auth } from '../middleware/auth';
import Game from '../models/Game';
import { User } from '../models/User';
import { UserRole, GameSearchFilters, ApiResponse, PaginatedResponse, Game as IGame } from '@kazrpg/shared';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    _id: string;
    username: string;
    role: UserRole;
  };
}

const router = Router();

// Get all games with search and filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      keyword,
      system,
      platform,
      sessionType,
      experienceLevel,
      priceMin,
      priceMax,
      startDate,
      endDate,
      timezone,
      tags,
      ageAppropriate,
      availableSeats,
      page = 1,
      limit = 12,
      sortBy = 'date',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query: any = { isActive: true };

    // Keyword search in title and description
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword as string, 'i')] } }
      ];
    }

    // Filter by system
    if (system) {
      query.system = system;
    }

    // Filter by platform
    if (platform) {
      query.platform = platform;
    }

    // Filter by session type
    if (sessionType) {
      query.sessionType = sessionType;
    }

    // Filter by experience level
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    // Price range filter
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    // Date range filter
    if (startDate || endDate) {
      query['schedule.startTime'] = {};
      if (startDate) query['schedule.startTime'].$gte = new Date(startDate as string);
      if (endDate) query['schedule.startTime'].$lte = new Date(endDate as string);
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    // Available seats filter
    if (availableSeats) {
      query.availableSeats = { $gte: Number(availableSeats) };
    }

    // Age appropriate filter (no age restriction or max age >= 18)
    if (ageAppropriate === 'true') {
      query.$or = [
        { 'ageRestriction.maxAge': { $exists: false } },
        { 'ageRestriction.maxAge': { $gte: 18 } }
      ];
    }

    // Sorting
    const sortOptions: any = {};
    switch (sortBy) {
      case 'date':
        sortOptions['schedule.startTime'] = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'price':
        sortOptions.price = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'created':
        sortOptions.createdAt = sortOrder === 'desc' ? -1 : 1;
        break;
      default:
        sortOptions['schedule.startTime'] = 1;
    }

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const games = await Game.find(query)
      .populate('gm', 'username firstName lastName avatar pronouns stats.averageRating stats.gamesHosted')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Game.countDocuments(query);

    const response: ApiResponse<PaginatedResponse<IGame>> = {
      success: true,
      data: {
        data: games.map(game => ({
          ...game.toObject(),
          gm: game.gm.toString()
        })) as IGame[],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    };

    res.json(response);
  } catch (error: any) {
    console.error('Get games error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch games'
    });
  }
});

// Get current user's games (games they host) - MUST BE BEFORE /:id route
router.get('/my-games', auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('My Games API: Request received');
    console.log('My Games API: User object:', { 
      _id: req.user?._id, 
      username: req.user?.username,
      role: req.user?.role 
    });

    if (!req.user) {
      console.log('My Games API: No user found in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userId = req.user._id;
    console.log('My Games API: Looking for games with GM ID:', userId);

    const games = await Game.find({ gm: userId })
      .populate('gm', 'firstName lastName username avatar stats pronouns')
      .sort({ createdAt: -1 });

    console.log('My Games API: Found games:', games.length);

    res.json({
      success: true,
      data: games.map(game => ({
        ...game.toObject(),
        gm: game.gm.toString()
      })),
      message: 'My games fetched successfully'
    });
  } catch (error) {
    console.error('My Games API: Error fetching games:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch my games'
    });
  }
});

// Get single game by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate('gm', 'username firstName lastName avatar bio timezone pronouns stats');

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...game.toObject(),
        gm: game.gm.toString()
      }
    });
  } catch (error: any) {
    console.error('Get game error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game'
    });
  }
});

// Create new game (GM only)
router.post('/', auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if user is an approved GM
    if (user.role !== UserRole.APPROVED_GM && user.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Only approved GMs can create games'
      });
    }

    const gameData = {
      ...req.body,
      gm: user._id
    };

    // Validate required fields
    const requiredFields = [
      'title', 'description', 'system', 'platform', 'sessionType', 
      'experienceLevel', 'price', 'capacity', 'schedule'
    ];

    for (const field of requiredFields) {
      if (!gameData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Validate schedule
    if (!gameData.schedule.startTime || !gameData.schedule.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Start time and end time are required'
      });
    }

    // Debug logging
    console.log('Game creation debug:', {
      startTime: gameData.schedule.startTime,
      endTime: gameData.schedule.endTime,
      startTimeType: typeof gameData.schedule.startTime,
      endTimeType: typeof gameData.schedule.endTime,
      startTimeDate: new Date(gameData.schedule.startTime),
      endTimeDate: new Date(gameData.schedule.endTime),
      isEndTimeAfterStart: new Date(gameData.schedule.endTime) > new Date(gameData.schedule.startTime)
    });

    const game = new Game(gameData);
    await game.save();

    // Populate GM details before sending response
    await game.populate('gm', 'username firstName lastName avatar pronouns stats.averageRating stats.gamesHosted');

    res.status(201).json({
      success: true,
      data: game,
      message: 'Game created successfully'
    });
  } catch (error: any) {
    console.error('Create game error:', error);
    console.error('Game data received:', JSON.stringify(req.body, null, 2));
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      console.error('Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create game'
    });
  }
});

// Update game (GM only)
router.put('/:id', auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    // Check if user is the GM of this game or admin
    if (game.gm.toString() !== user._id.toString() && user.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own games'
      });
    }

    // Don't allow updating gm field
    delete req.body.gm;
    delete req.body.bookedSeats;

    Object.assign(game, req.body);
    await game.save();

    await game.populate('gm', 'username firstName lastName avatar pronouns stats.averageRating stats.gamesHosted');

    res.json({
      success: true,
      data: {
        ...game.toObject(),
        gm: game.gm.toString()
      },
      message: 'Game updated successfully'
    });
  } catch (error: any) {
    console.error('Update game error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update game'
    });
  }
});

// Delete game (GM only)
router.delete('/:id', auth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    // Check if user is the GM of this game or admin
    if (game.gm.toString() !== user._id.toString() && user.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own games'
      });
    }

    // Check if there are any bookings
    if (game.bookedSeats > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete game with existing bookings'
      });
    }

    await Game.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Game deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete game error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete game'
    });
  }
});

// Get games by GM
router.get('/gm/:gmId', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const games = await Game.find({ gm: req.params.gmId, isActive: true })
      .populate('gm', 'username firstName lastName avatar pronouns stats.averageRating stats.gamesHosted')
      .sort({ 'schedule.startTime': 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Game.countDocuments({ gm: req.params.gmId, isActive: true });

    res.json({
      success: true,
      data: {
        data: games.map(game => ({
          ...game.toObject(),
          gm: game.gm.toString()
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error: any) {
    console.error('Get GM games error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch GM games'
    });
  }
});

export default router;
