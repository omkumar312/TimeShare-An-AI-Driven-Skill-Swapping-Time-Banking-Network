import express from 'express';
import {
  getVideos,
  getVideoById,
  createVideo,
  unlockVideo,
  recordProgress,
  submitQuizAndClaim,
  streamVideo
} from '../controllers/videoController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getVideos);
router.get('/:id', optionalAuth, getVideoById);
router.get('/stream/:id', streamVideo);
router.post('/', requireAuth, createVideo);
router.post('/:id/unlock', requireAuth, unlockVideo);
router.post('/:id/progress', requireAuth, recordProgress);
router.post('/:id/submit-quiz', requireAuth, submitQuizAndClaim);

export default router;
