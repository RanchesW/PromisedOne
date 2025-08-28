import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import Notification from '../models/Notification';
import { UserRole } from '@kazrpg/shared';
import { getJwtSecret } from '../config/jwt';

const router = Router();

// Auth middleware for admin routes
interface AuthRequest extends Request {
  user?: any;
}

const authenticateAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Admin auth attempt:', { 
    hasAuthHeader: !!authHeader, 
    hasToken: !!token,
    authHeader: authHeader?.substring(0, 20) + '...' 
  });

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const jwtSecret = getJwtSecret();
    const decoded = jwt.verify(token, jwtSecret) as any;
    console.log('Token decoded:', { userId: decoded.userId });
    
    const user = await User.findById(decoded.userId).select('-password');
    console.log('User found:', { 
      userId: user?._id, 
      role: user?.role, 
      email: user?.email 
    });
    
    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (user.role !== UserRole.ADMIN) {
      console.log('User is not admin:', { role: user.role });
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    req.user = user;
    console.log('Admin authentication successful');
    next();
  } catch (error) {
    console.log('Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

// Apply authentication to all admin routes
router.use(authenticateAdmin);

// Get admin dashboard stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    // Import Game model
    const { default: Game } = await import('../models/Game');

    const [
      totalUsers,
      totalPlayers,
      totalGMs,
      pendingGMApplications,
      activeGames,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: UserRole.PLAYER }),
      User.countDocuments({ role: UserRole.APPROVED_GM }),
      User.countDocuments({ role: UserRole.GM_APPLICANT }),
      Game.countDocuments({ isActive: true }),
    ]);

    const stats = {
      totalUsers,
      totalPlayers,
      totalGMs,
      pendingGMApplications,
      activeGames,
      monthlyRevenue: 4567, // Placeholder
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
});

// Get recent activity
router.get('/activity', async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    // Get recent user registrations
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('firstName lastName email role createdAt')
      .lean();

    // Transform to activity format
    const activities = recentUsers.map((user: any) => ({
      id: user._id,
      type: 'user_registration',
      message: `New user registration: ${user.email}`,
      details: {
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        userRole: user.role,
      },
      timestamp: user.createdAt,
      icon: '👥',
      color: 'green',
    }));

    // Sort activities by timestamp (most recent first)
    const allActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(skip, skip + limit);

    const totalActivities = activities.length;

    res.json({
      success: true,
      data: {
        activities: allActivities,
        pagination: {
          page,
          limit,
          total: totalActivities,
          totalPages: Math.ceil(totalActivities / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching admin activity:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin activity' });
  }
});

// GM Application Management Routes

// Update GM application status (approve/reject)
router.put('/gm-applications/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { action, notes } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid action. Must be "approve" or "reject"' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.role !== UserRole.GM_APPLICANT) {
      return res.status(400).json({ 
        success: false, 
        message: 'User is not a GM applicant' 
      });
    }

    // Update user role and application status
    if (action === 'approve') {
      user.role = UserRole.APPROVED_GM;
      if (user.dmApplication) {
        user.dmApplication.status = 'approved';
        user.dmApplication.reviewedBy = req.user._id;
        user.dmApplication.reviewedAt = new Date();
        user.dmApplication.reviewNotes = notes || '';
      }
    } else {
      user.role = UserRole.PLAYER; // Revert to player if rejected
      if (user.dmApplication) {
        user.dmApplication.status = 'rejected';
        user.dmApplication.reviewedBy = req.user._id;
        user.dmApplication.reviewedAt = new Date();
        user.dmApplication.reviewNotes = notes || '';
      }
    }

    await user.save();

    // Create notification for the user
    let notificationTitle = '';
    let notificationMessage = '';
    let notificationType = 'system_announcement';
    
    if (action === 'approve') {
      notificationTitle = '🎉 GM Application Approved!';
      notificationMessage = `Congratulations! Your GM application has been approved. You are now an approved Game Master and can start creating and hosting games on the platform.${notes ? `\n\n📝 Admin Message:\n${notes}` : ''}`;
    } else {
      notificationTitle = '❌ GM Application Not Approved';
      notificationMessage = `Your GM application has been reviewed and unfortunately was not approved at this time. ${notes ? `\n\n📝 Admin Feedback:\n${notes}\n\nWe encourage you to address this feedback and reapply when ready.` : 'Please review your application and feel free to apply again in the future with additional experience or information.'}`;
    }

    // Create the notification
    const notification = new Notification({
      user: user._id,
      type: notificationType,
      category: 'system',
      title: notificationTitle,
      message: notificationMessage,
      isRead: false,
      priority: 'high',
      metadata: {
        icon: action === 'approve' ? '🎉' : '📋',
        color: action === 'approve' ? '#10B981' : '#F59E0B'
      }
    });

    await notification.save();

    console.log('GM application notification created:', {
      userId: user._id,
      username: user.username,
      action,
      notificationId: notification._id,
      title: notificationTitle
    });

    res.json({
      success: true,
      message: `GM application ${action}d successfully`,
      data: {
        userId: user._id,
        newRole: user.role,
        applicationStatus: user.dmApplication?.status,
        notificationSent: true
      }
    });
  } catch (error) {
    console.error('Error updating GM application:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update GM application' 
    });
  }
});

// Get all users with pagination and filtering
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as string;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    console.log('Admin users query debug:', {
      page,
      limit,
      role,
      search,
      skip
    });

    // Build filter object
    const filter: any = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    console.log('Admin users filter:', filter);

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password')
        .lean(),
      User.countDocuments(filter),
    ]);

    console.log('Admin users result:', {
      usersFound: users.length,
      total,
      users: users.map(u => ({ id: u._id, username: u.username, role: u.role, email: u.email }))
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Update user role
router.put('/users/:userId/role', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
});

// Update user status (activate/deactivate)
router.put('/users/:userId/status', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
});

// Delete game with admin comments and notification
router.delete('/games/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, adminNotes } = req.body;
    
    // Import Game model
    const { default: Game } = await import('../models/Game');
    
    // Find the game
    const game = await Game.findById(id).populate('gm', 'firstName lastName username email');
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    const gmDetails = game.gm as any;
    
    // Create notification for the GM
    let notificationTitle = '🚨 Game Removed by Admin';
    let notificationMessage = `Your game "${game.title}" has been removed by an administrator.`;
    
    if (reason) {
      notificationMessage += `\n\n📋 Reason: ${reason}`;
    }
    
    if (adminNotes) {
      notificationMessage += `\n\n📝 Admin Notes:\n${adminNotes}`;
    }
    
    notificationMessage += `\n\nIf you have any questions about this action, please contact our support team.`;

    // Create notification
    const Notification = (await import('../models/Notification')).default;
    await Notification.create({
      user: game.gm,
      title: notificationTitle,
      message: notificationMessage,
      type: 'admin_action',
      category: 'system',
      isRead: false,
      priority: 'high'
    });

    // Delete the game
    await Game.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Game deleted successfully and GM has been notified',
      data: {
        gameTitle: game.title,
        gmName: `${gmDetails.firstName || ''} ${gmDetails.lastName || ''}`.trim() || gmDetails.username,
        gmEmail: gmDetails.email
      }
    });

  } catch (error) {
    console.error('Error deleting game with admin comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete game'
    });
  }
});

// Get all games for admin management
router.get('/games', async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Import Game model
    const { default: Game } = await import('../models/Game');

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
    }

    // Get games with GM details
    const games = await Game.find(query)
      .populate('gm', 'firstName lastName username email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Game.countDocuments(query);

    res.json({
      success: true,
      data: {
        games,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching games for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch games'
    });
  }
});

// Platform Settings endpoints
interface PlatformSettings {
  siteName: string;
  description: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxGamesPerUser: number;
  sessionDuration: number;
  autoApproveGMs: boolean;
  emailNotifications: boolean;
  systemNotifications: boolean;
}

// Default settings
const defaultSettings: PlatformSettings = {
  siteName: 'KazRPG',
  description: 'Connect with Game Masters and join amazing RPG sessions',
  maintenanceMode: false,
  registrationEnabled: true,
  maxGamesPerUser: 5,
  sessionDuration: 240,
  autoApproveGMs: false,
  emailNotifications: true,
  systemNotifications: true
};

// Get platform settings
router.get('/settings', async (req: AuthRequest, res: Response) => {
  try {
    // For now, return default settings. In production, you'd store these in a database
    // You could create a Settings model or store in a configuration collection
    res.json({
      success: true,
      data: defaultSettings
    });
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch platform settings' 
    });
  }
});

// Update platform settings
router.put('/settings', async (req: AuthRequest, res: Response) => {
  try {
    const settings = req.body as Partial<PlatformSettings>;
    
    // Validate settings
    if (settings.maxGamesPerUser && (settings.maxGamesPerUser < 1 || settings.maxGamesPerUser > 20)) {
      return res.status(400).json({
        success: false,
        message: 'Max games per user must be between 1 and 20'
      });
    }
    
    if (settings.sessionDuration && (settings.sessionDuration < 60 || settings.sessionDuration > 480)) {
      return res.status(400).json({
        success: false,
        message: 'Session duration must be between 60 and 480 minutes'
      });
    }
    
    // In production, you would save these to a database
    // For now, we'll just return success
    
    console.log('Platform settings update requested:', settings);
    
    res.json({
      success: true,
      message: 'Platform settings updated successfully',
      data: { ...defaultSettings, ...settings }
    });
  } catch (error) {
    console.error('Error updating platform settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update platform settings' 
    });
  }
});

export default router;
