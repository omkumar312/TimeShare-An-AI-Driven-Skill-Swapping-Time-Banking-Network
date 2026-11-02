import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { requireAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const VIDEOS_DIR = path.join(UPLOADS_DIR, 'videos');
const THUMBS_DIR = path.join(UPLOADS_DIR, 'thumbnails');

[UPLOADS_DIR, VIDEOS_DIR, THUMBS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, VIDEOS_DIR);
    } else {
      cb(null, THUMBS_DIR);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video and image files are supported!'));
    }
  }
});

const router = express.Router();

router.post('/video', requireAuth, upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No video file provided.' });
  }
  const fileUrl = `/uploads/videos/${req.file.filename}`;
  return res.json({
    message: 'Video file uploaded successfully.',
    filename: req.file.filename,
    fileUrl,
    size: req.file.size
  });
});

router.post('/thumbnail', requireAuth, upload.single('thumbnail'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No thumbnail file provided.' });
  }
  const fileUrl = `/uploads/thumbnails/${req.file.filename}`;
  return res.json({
    message: 'Thumbnail uploaded successfully.',
    filename: req.file.filename,
    fileUrl
  });
});

export default router;
