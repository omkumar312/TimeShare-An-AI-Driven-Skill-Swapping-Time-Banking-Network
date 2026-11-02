import express from 'express';
import {
  getDashboardStats,
  getPendingVideos,
  getAllAdminVideos,
  approveVideo,
  rejectVideo,
  reanalyzeVideo,
  getFraudLogs,
  getAllUsersAdmin,
  adjustCredits
} from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/pending-videos', getPendingVideos);
router.get('/videos', getAllAdminVideos);
router.post('/videos/:id/approve', approveVideo);
router.post('/videos/:id/reject', rejectVideo);
router.post('/videos/:id/reanalyze', reanalyzeVideo);
router.get('/fraud-logs', getFraudLogs);
router.get('/users', getAllUsersAdmin);
router.post('/users/adjust-credits', adjustCredits);

export default router;
