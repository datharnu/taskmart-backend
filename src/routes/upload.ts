import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/uploadController';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

// Configure multer to store files in memory (as buffers)
const storage = multer.memoryStorage();

// File filter to accept only images and videos
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'));
  }
};

// Configure multer with limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});

// Single file upload endpoint
router.post('/single', upload.single('file'), asyncHandler(UploadController.uploadFile));

// Multiple files upload endpoint (max 10 files at once)
router.post('/multiple', upload.array('files', 10), asyncHandler(UploadController.uploadFiles));

export default router;





