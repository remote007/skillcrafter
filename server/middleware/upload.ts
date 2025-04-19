import multer from "multer";
import path from "path";
import { Request } from "express";

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store files temporarily before uploading to Cloudinary
    cb(null, path.join(__dirname, '../../temp'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Filter files by type
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Only images and videos are allowed.'));
  }
};

// Create multer instance with size limits
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter
});

// Specific upload middleware for different use cases
export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 10); // Max 10 files
export const uploadFields = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 5 }
]);
