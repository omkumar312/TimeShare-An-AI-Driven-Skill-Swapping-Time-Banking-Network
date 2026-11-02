import { db } from '../config/db.js';
import { analyzeVideoContent } from '../services/aiReviewService.js';
import { emitToUser, broadcastGlobal } from '../services/socketService.js';

export function getDashboardStats(req, res) {
  try {
    const users = db.getAllUsers();
    const videos = db.data.videos;
    const transactions = db.data.transactions;
    const completions = db.data.completions;
    const fraudLogs = db.getFraudLogs();

    const stats = {
      totalUsers: users.length,
      totalVideos: videos.length,
      approvedVideos: videos.filter(v => v.status === 'APPROVED').length,
      pendingVideos: videos.filter(v => v.status === 'PENDING').length,
      rejectedVideos: videos.filter(v => v.status === 'REJECTED').length,
      totalCompletions: completions.length,
      totalTransactions: transactions.length,
      totalCreditsInCirculation: users.reduce((sum, u) => sum + (Number(u.credits) || 0), 0),
      totalCreditsEarned: users.reduce((sum, u) => sum + (Number(u.totalEarned) || 0), 0),
      totalCreditsSpent: users.reduce((sum, u) => sum + (Number(u.totalSpent) || 0), 0),
      flaggedFraudCount: fraudLogs.length
    };

    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to retrieve stats.', error: err.message });
  }
}

export function getPendingVideos(req, res) {
  try {
    const pending = db.getAllVideos({ status: 'PENDING' });
    return res.json(pending);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get pending videos.', error: err.message });
  }
}

export function getAllAdminVideos(req, res) {
  try {
    const { status, category } = req.query;
    const videos = db.getAllVideos({ status, category });
    return res.json(videos);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch videos.', error: err.message });
  }
}

export function approveVideo(req, res) {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    const video = db.getVideoById(id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    if (video.status === 'APPROVED') {
      return res.status(400).json({ message: 'Video is already approved.' });
    }

    // Update status
    const updated = db.updateVideo(id, {
      status: 'APPROVED',
      reviewedBy: req.user.name,
      reviewedAt: new Date().toISOString(),
      adminNote: adminNote || 'Approved by Admin for high educational value.'
    });

    // Check if creator was already rewarded for this video
    const existingTx = db.data.transactions.find(
      t => t.userId === video.creatorId && t.videoId === video.id && t.reason === 'VIDEO_APPROVED'
    );

    let creditsAwarded = false;
    let creatorBalance = null;

    if (!existingTx) {
      const { user: updatedCreator, transaction } = db.modifyUserCredits(
        video.creatorId,
        5,
        'VIDEO_APPROVED',
        {
          videoId: video.id,
          videoTitle: video.title,
          description: `Admin approved educational skill video: "${video.title}" (+5 credits)`
        }
      );
      creditsAwarded = true;
      creatorBalance = updatedCreator.credits;

      db.createNotification({
        userId: video.creatorId,
        type: 'VIDEO_APPROVED',
        title: 'Video Approved! +5 Credits 🎉',
        message: `Your video "${video.title}" was approved by an Admin! 5 credits added to your wallet.`
      });

      emitToUser(video.creatorId, 'wallet:updated', {
        credits: updatedCreator.credits,
        transaction
      });
    }

    broadcastGlobal('platform:new_video', {
      videoId: video.id,
      title: video.title,
      creatorName: video.creatorName,
      creatorAvatar: video.creatorAvatar,
      category: video.category,
      duration: video.duration,
      thumbnailUrl: video.thumbnailUrl,
      status: 'APPROVED',
      video: updated,
      message: `Admin approved new skill: "${video.title}" by ${video.creatorName}! Learn now.`
    });

    return res.json({
      message: `Video "${video.title}" approved successfully.${creditsAwarded ? ' 5 credits awarded to creator.' : ''}`,
      video: updated,
      creditsAwarded
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to approve video.', error: err.message });
  }
}

export function rejectVideo(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const video = db.getVideoById(id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    const rejectionReason = reason || 'Non-educational or entertainment content. TimeShare only rewards structured educational skill courses.';

    const updated = db.updateVideo(id, {
      status: 'REJECTED',
      reviewedBy: req.user.name,
      reviewedAt: new Date().toISOString(),
      rejectionReason
    });

    db.createNotification({
      userId: video.creatorId,
      type: 'VIDEO_REJECTED',
      title: 'Video Submission Declined ⚠️',
      message: `Your video "${video.title}" was rejected by Admin. Reason: ${rejectionReason}`
    });

    return res.json({
      message: `Video "${video.title}" was rejected.`,
      video: updated
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to reject video.', error: err.message });
  }
}

export function reanalyzeVideo(req, res) {
  try {
    const { id } = req.params;
    const video = db.getVideoById(id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    const analysis = analyzeVideoContent({
      title: video.title,
      description: video.description,
      category: video.category,
      tags: video.tags || [],
      duration: video.duration
    });

    const updated = db.updateVideo(id, {
      aiScore: analysis.score,
      aiReasoning: analysis.reasoning,
      aiDetails: analysis,
      lastAnalyzedAt: new Date().toISOString()
    });

    return res.json({
      message: 'AI re-analysis completed.',
      analysis,
      video: updated
    });
  } catch (err) {
    return res.status(500).json({ message: 'Re-analysis failed.', error: err.message });
  }
}

export function getFraudLogs(req, res) {
  try {
    const logs = db.getFraudLogs();
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to retrieve fraud logs.', error: err.message });
  }
}

export function getAllUsersAdmin(req, res) {
  try {
    const users = db.getAllUsers();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch users.', error: err.message });
  }
}

export function adjustCredits(req, res) {
  try {
    const { userId, amount, reason } = req.body;
    if (!userId || amount === undefined) {
      return res.status(400).json({ message: 'userId and amount are required.' });
    }

    const delta = Number(amount);
    const { user, transaction } = db.modifyUserCredits(
      userId,
      delta,
      'ADMIN_ADJUSTMENT',
      {
        adminName: req.user.name,
        description: reason || `Admin balance adjustment (${delta >= 0 ? '+' : ''}${delta} credits)`
      }
    );

    db.createNotification({
      userId,
      type: 'ADMIN_ADJUSTMENT',
      title: 'Credit Balance Updated ⚡',
      message: `An admin updated your credit balance by ${delta >= 0 ? '+' : ''}${delta} credits. (${reason || 'Administrative adjustment'})`
    });

    emitToUser(userId, 'wallet:updated', {
      credits: user.credits,
      transaction
    });

    return res.json({
      message: `Updated credits for ${user.name}. New balance: ${user.credits}`,
      user,
      transaction
    });
  } catch (err) {
    return res.status(500).json({ message: 'Adjustment failed.', error: err.message });
  }
}
