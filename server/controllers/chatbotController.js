import { handleChatbotMessage } from '../services/chatbotService.js';

export function chatWithAI(req, res) {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Message string is required.' });
    }

    const response = handleChatbotMessage({
      message,
      history,
      user: req.user || null
    });

    return res.json(response);
  } catch (err) {
    console.error('[Chatbot error]:', err);
    return res.status(500).json({ message: 'Chatbot service error.', error: err.message });
  }
}
