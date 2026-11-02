import express from 'express';
import { chatWithAI } from '../controllers/chatbotController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/message', optionalAuth, chatWithAI);

export default router;
