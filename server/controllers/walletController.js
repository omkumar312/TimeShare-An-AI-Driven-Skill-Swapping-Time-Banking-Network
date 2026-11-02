import { db } from '../config/db.js';

export function getWallet(req, res) {
  try {
    const userId = req.user.id;
    const user = db.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const transactions = db.getUserTransactions(userId);

    // Compute category breakdown
    const breakdown = {
      welcomeBonus: 0,
      referralBonus: 0,
      videoApprovals: 0,
      learnerCompletions: 0,
      creatorRoyalties: 0,
      skillsUnlocked: 0
    };

    transactions.forEach(tx => {
      if (tx.reason === 'WELCOME_BONUS') breakdown.welcomeBonus += Number(tx.amount || 0);
      else if (tx.reason === 'REFERRAL_BONUS' || tx.reason === 'REFERRAL_REWARD') breakdown.referralBonus += Number(tx.amount || 0);
      else if (tx.reason === 'VIDEO_APPROVED') breakdown.videoApprovals += Number(tx.amount || 0);
      else if (tx.reason === 'VIDEO_COMPLETED') breakdown.learnerCompletions += Number(tx.amount || 0);
      else if (tx.reason === 'CREATOR_ROYALTY') breakdown.creatorRoyalties += Number(tx.amount || 0);
      else if (tx.reason === 'SKILL_UNLOCKED') breakdown.skillsUnlocked += Math.abs(Number(tx.amount || 0));
    });

    const stats = {
      currentBalance: user.credits || 0,
      totalEarned: user.totalEarned || 0,
      totalSpent: user.totalSpent || 0,
      transactionsCount: transactions.length,
      breakdown
    };

    return res.json({
      wallet: stats,
      transactions
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch wallet details.', error: err.message });
  }
}

export function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const notifications = db.getUserNotifications(userId);
    const unreadCount = notifications.filter(n => !n.read).length;
    return res.json({ notifications, unreadCount });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch notifications.', error: err.message });
  }
}

export function markNotificationsRead(req, res) {
  try {
    const userId = req.user.id;
    db.markNotificationsAsRead(userId);
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to mark notifications.', error: err.message });
  }
}
