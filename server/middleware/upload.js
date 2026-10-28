import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = 'uploads/raw';
    if (file.fieldname === 'thumbnail') {
      dest = 'uploads/thumbnails';
    }
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    const allowedVideoExts = ['.mp4', '.mkv', '.avi', '.mov', '.webm'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedVideoExts.includes(ext) || file.mimetype.startsWith('video/')) {
      return cb(null, true);
    }
    return cb(new Error('Invalid video format. Allowed: .mp4, .mkv, .avi, .mov, .webm'), false);
  } else if (file.fieldname === 'thumbnail') {
    const allowedImageExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedImageExts.includes(ext) || file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    return cb(new Error('Invalid thumbnail format. Allowed: .jpg, .jpeg, .png, .webp'), false);
  }
  cb(null, true);
};

export const uploadMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500 MB max for video uploads
  }
});
