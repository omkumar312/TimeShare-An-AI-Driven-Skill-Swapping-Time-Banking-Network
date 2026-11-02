import express from 'express';
import { getWallet, getNotifications, markNotificationsRead } from '../controllers/walletController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getWallet);
router.get('/notifications', requireAuth, getNotifications);
router.post('/notifications/read', requireAuth, markNotificationsRead);

export default router;
