import express from 'express';
import {
  register,
  login,
  getMe,
  demoLogin,
  getDemoUsers,
  claimReferral,
  getReferralInfo
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.post('/demo-login', demoLogin);
router.get('/demo-users', getDemoUsers);
router.post('/claim-referral', requireAuth, claimReferral);
router.get('/referral-info/:code', getReferralInfo);

export default router;
