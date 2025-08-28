import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { auth } from '../middleware/auth';
import { User } from '../models/User';

const router = Router();

console.log('Upload routes loading...');

// Configure multer for local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.fieldname === 'avatar' 
      ? path.join(__dirname, '../../uploads/avatars')
      : path.join(__dirname, '../../uploads/games');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  console.log('File filter check:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype
  });
  
  // Check if file is an image
  if (!file.mimetype.startsWith('image/')) {
    console.log('File rejected: not an image');
    return cb(new Error('Only image files are allowed'));
  }

  // Allowed image types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.mimetype)) {
    console.log('File rejected: unsupported type');
    return cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
  }

  console.log('File accepted');
  cb(null, true);
};

// Helper function to generate public URL for uploaded file
const getPublicURL = (filePath: string): string => {
  // Extract just the filename and subfolder from the full path
  const uploadsDir = path.join(__dirname, '../../uploads');
  const relativePath = path.relative(uploadsDir, filePath);
  return `/uploads/${relativePath.replace(/\\/g, '/')}`;
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 2 // Maximum 2 files (banner + icon)
  }
});

// Create upload instances with different limits based on user role
const createAvatarUpload = (maxSizeMB: number) => multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSizeMB * 1024 * 1024, // Convert MB to bytes
    files: 1
  }
});

// Upload avatar image
router.post('/avatar', auth, (req: Request, res: Response) => {
  // Store user info before multer processes the request
  const userFromAuth = (req as any).user;
  
  // Determine upload limits based on user role
  const isAdmin = userFromAuth?.role === 'admin';
  const maxSizeMB = isAdmin ? 5 : 2; // 5MB for admins, 2MB for regular users
  const avatarUpload = createAvatarUpload(maxSizeMB);
  
  console.log(`Avatar upload for user role: ${userFromAuth?.role}, max size: ${maxSizeMB}MB`);
  
  avatarUpload.single('avatar')(req, res, async (err) => {
    try {
      console.log('Avatar upload request received');
      
      // Restore user info after multer
      (req as any).user = userFromAuth;
      console.log('User from auth:', userFromAuth);
      
      if (err) {
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File too large. Maximum size allowed is ${maxSizeMB}MB for your account type.`
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed'
        });
      }
      
      console.log('File info:', req.file);
      
      if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      if (!userFromAuth?._id) {
        console.log('No user found in request');
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Generate public URL for the uploaded file
      const avatarURL = getPublicURL(req.file.path);
      console.log('Avatar URL created:', avatarURL);
      
      // Update user's avatar in database with file URL
      const { User } = await import('../models/User');
      const userId = userFromAuth._id;
      console.log('Updating user with ID:', userId);
      
      const updatedUser = await User.findByIdAndUpdate(userId, { 
        avatar: avatarURL 
      }, { new: true });
      
      console.log('User updated with avatar URL');

      res.json({
        success: true,
        data: {
          avatar: avatarURL
        },
        message: 'Avatar uploaded successfully'
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload avatar'
      });
    }
  });
});

// Upload game images (banner and/or icon)
router.post('/game-images', auth, upload.fields([
  { name: 'banner', maxCount: 1 },
  { name: 'icon', maxCount: 1 }
]), (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const uploadedFiles: { [key: string]: string } = {};

    if (files.banner && files.banner[0]) {
      const bannerURL = getPublicURL(files.banner[0].path);
      uploadedFiles.bannerImage = bannerURL;
      console.log('Banner image URL created:', bannerURL);
    }

    if (files.icon && files.icon[0]) {
      const iconURL = getPublicURL(files.icon[0].path);
      uploadedFiles.iconImage = iconURL;
      console.log('Icon image URL created:', iconURL);
    }

    res.json({
      success: true,
      data: uploadedFiles,
      message: 'Images uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images'
    });
  }
});

// Remove avatar image
router.delete('/avatar', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    console.log('Remove avatar request for user:', {
      userId: user._id,
      userIdString: user._id?.toString()
    });

    // Find the user in database
    const userRecord = await User.findById(user._id);
    if (!userRecord) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete the actual file if it exists
    if (userRecord.avatar && userRecord.avatar.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../', userRecord.avatar);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Avatar file deleted:', filePath);
      }
    }

    // Update user record to remove avatar
    await User.findByIdAndUpdate(
      user._id,
      { $unset: { avatar: 1 } },
      { new: true }
    );

    console.log('Avatar removed from user record');

    res.json({
      success: true,
      message: 'Avatar removed successfully'
    });

  } catch (error) {
    console.error('Error removing avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing avatar'
    });
  }
});

export default router;
