import { Router, Request, Response } from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth';
import { User } from '../models/User';
import cloudinary from '../config/cloudinary';

const router = Router();

console.log('Cloudinary upload routes loading...');

// Configure multer for memory storage (no local files)
const storage = multer.memoryStorage();

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

// Create upload instances with different limits based on user role
const createUpload = (maxSizeMB: number, maxFiles: number = 1) => multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSizeMB * 1024 * 1024, // Convert MB to bytes
    files: maxFiles
  }
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer: Buffer, options: any = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good' }, // Auto optimize quality
          { fetch_format: 'auto' }  // Auto select best format
        ],
        ...options
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

// Upload avatar image
router.post('/avatar', auth, (req: Request, res: Response) => {
  const userFromAuth = (req as any).user;
  
  // Determine upload limits based on user role
  const isAdmin = userFromAuth?.role === 'admin';
  const maxSizeMB = isAdmin ? 5 : 2; // 5MB for admins, 2MB for regular users
  const avatarUpload = createUpload(maxSizeMB);
  
  console.log(`Avatar upload for user role: ${userFromAuth?.role}, max size: ${maxSizeMB}MB`);
  
  avatarUpload.single('avatar')(req, res, async (err) => {
    try {
      console.log('Avatar upload request received');
      
      // Restore user info after multer
      (req as any).user = userFromAuth;
      
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

      console.log('Uploading to Cloudinary...');
      
      // Upload to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'kazrpg/avatars',
        public_id: `avatar_${userFromAuth._id}_${Date.now()}`,
        width: 400,
        height: 400,
        crop: 'fill'
      });
      
      const avatarURL = (cloudinaryResult as any).secure_url;
      console.log('Avatar uploaded to Cloudinary:', avatarURL);
      
      // Update user's avatar in database with Cloudinary URL
      const userId = userFromAuth._id;
      const updatedUser = await User.findByIdAndUpdate(userId, { 
        avatar: avatarURL 
      }, { new: true });
      
      console.log('User updated with Cloudinary avatar URL');

      res.json({
        success: true,
        data: {
          avatar: avatarURL
        },
        message: 'Avatar uploaded successfully to cloud storage'
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload avatar to cloud storage'
      });
    }
  });
});

// Upload game images (banner and/or icon)
router.post('/game-images', auth, (req: Request, res: Response) => {
  const userFromAuth = (req as any).user;
  const gameUpload = createUpload(5, 2); // 5MB max, 2 files max
  
  gameUpload.fields([
    { name: 'banner', maxCount: 1 },
    { name: 'icon', maxCount: 1 }
  ])(req, res, async (err) => {
    try {
      (req as any).user = userFromAuth;
      
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed'
        });
      }
      
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const uploadedFiles: { [key: string]: string } = {};

      // Upload banner if provided
      if (files.banner && files.banner[0]) {
        console.log('Uploading banner to Cloudinary...');
        const bannerResult = await uploadToCloudinary(files.banner[0].buffer, {
          folder: 'kazrpg/games/banners',
          public_id: `banner_${userFromAuth._id}_${Date.now()}`,
          width: 1200,
          height: 400,
          crop: 'fill'
        });
        uploadedFiles.bannerImage = (bannerResult as any).secure_url;
        console.log('Banner uploaded to Cloudinary:', uploadedFiles.bannerImage);
      }

      // Upload icon if provided
      if (files.icon && files.icon[0]) {
        console.log('Uploading icon to Cloudinary...');
        const iconResult = await uploadToCloudinary(files.icon[0].buffer, {
          folder: 'kazrpg/games/icons',
          public_id: `icon_${userFromAuth._id}_${Date.now()}`,
          width: 200,
          height: 200,
          crop: 'fill'
        });
        uploadedFiles.iconImage = (iconResult as any).secure_url;
        console.log('Icon uploaded to Cloudinary:', uploadedFiles.iconImage);
      }

      res.json({
        success: true,
        data: uploadedFiles,
        message: 'Images uploaded successfully to cloud storage'
      });
    } catch (error) {
      console.error('Game images upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload images to cloud storage'
      });
    }
  });
});

// Remove avatar image (from Cloudinary)
router.delete('/avatar', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Find the user in database
    const userRecord = await User.findById(user._id);
    if (!userRecord) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete from Cloudinary if it's a Cloudinary URL
    if (userRecord.avatar && userRecord.avatar.includes('cloudinary.com')) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = userRecord.avatar.split('/');
        const publicIdWithExtension = urlParts.slice(-2).join('/').split('.')[0]; // folder/filename
        
        await cloudinary.uploader.destroy(publicIdWithExtension);
        console.log('Avatar deleted from Cloudinary:', publicIdWithExtension);
      } catch (cloudError) {
        console.error('Error deleting from Cloudinary:', cloudError);
        // Continue anyway to remove from database
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
      message: 'Avatar removed successfully from cloud storage'
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