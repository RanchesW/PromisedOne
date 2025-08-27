import express from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import Favorite from '../models/Favorite';
import { User } from '../models/User';
import mongoose from 'mongoose';

const router = express.Router();

// Get user's favorite game masters
router.get('/game-masters', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;

    const favorites = await Favorite.find({ userId })
      .populate({
        path: 'gameMasterId',
        select: 'username firstName lastName avatar bio stats createdAt',
        match: { role: { $in: ['approved_gm', 'admin'] } } // Only return actual GMs
      })
      .sort({ createdAt: -1 });

    // Filter out favorites where the GM no longer exists or isn't a GM
    const validFavorites = favorites
      .filter(fav => fav.gameMasterId)
      .map(fav => fav.gameMasterId);

    res.json({
      success: true,
      data: validFavorites
    });
  } catch (error) {
    console.error('Error fetching favorite game masters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorite game masters'
    });
  }
});

// Add a game master to favorites
router.post('/game-masters', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    const { gmId } = req.body;

    if (!gmId) {
      return res.status(400).json({
        success: false,
        message: 'Game Master ID is required'
      });
    }

    // Validate GM exists and is actually a GM
    const gameMaster = await User.findById(gmId);
    if (!gameMaster) {
      return res.status(404).json({
        success: false,
        message: 'Game Master not found'
      });
    }

    if (!['approved_gm', 'admin'].includes(gameMaster.role)) {
      return res.status(400).json({
        success: false,
        message: 'User is not a Game Master'
      });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      userId,
      gameMasterId: gmId
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Game Master is already in favorites'
      });
    }

    // Create favorite
    const favorite = new Favorite({
      userId,
      gameMasterId: gmId
    });

    await favorite.save();

    res.status(201).json({
      success: true,
      message: 'Game Master added to favorites'
    });
  } catch (error) {
    console.error('Error adding game master to favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add game master to favorites'
    });
  }
});

// Remove a game master from favorites
router.delete('/game-masters/:gmId', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    const { gmId } = req.params;

    const result = await Favorite.findOneAndDelete({
      userId,
      gameMasterId: gmId
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    res.json({
      success: true,
      message: 'Game Master removed from favorites'
    });
  } catch (error) {
    console.error('Error removing game master from favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove game master from favorites'
    });
  }
});

// Check if a game master is favorited
router.get('/game-masters/:gmId/status', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    const { gmId } = req.params;

    const favorite = await Favorite.findOne({
      userId,
      gameMasterId: gmId
    });

    res.json({
      success: true,
      data: {
        isFavorite: !!favorite
      }
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check favorite status'
    });
  }
});

// Toggle favorite status
router.post('/game-masters/:gmId/toggle', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?._id;
    const { gmId } = req.params;

    // Validate GM exists and is actually a GM
    const gameMaster = await User.findById(gmId);
    if (!gameMaster) {
      return res.status(404).json({
        success: false,
        message: 'Game Master not found'
      });
    }

    if (!['approved_gm', 'admin'].includes(gameMaster.role)) {
      return res.status(400).json({
        success: false,
        message: 'User is not a Game Master'
      });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      userId,
      gameMasterId: gmId
    });

    let isFavorite: boolean;

    if (existingFavorite) {
      // Remove from favorites
      await Favorite.findOneAndDelete({
        userId,
        gameMasterId: gmId
      });
      isFavorite = false;
    } else {
      // Add to favorites
      const favorite = new Favorite({
        userId,
        gameMasterId: gmId
      });
      await favorite.save();
      isFavorite = true;
    }

    res.json({
      success: true,
      data: {
        isFavorite
      }
    });
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle favorite status'
    });
  }
});

export default router;