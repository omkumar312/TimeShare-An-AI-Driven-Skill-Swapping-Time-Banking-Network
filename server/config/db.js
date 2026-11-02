import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'timeshare_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial state schema
const initialData = {
  users: [],
  videos: [],
  quizzes: [],
  watchProgress: [],
  completions: [], // { userId, videoId, completedAt, quizScore }
  unlocks: [],     // { userId, videoId, unlockedAt, cost }
  transactions: [],
  notifications: [],
  fraudLogs: [],
  referralClaims: [] // { id, code, referrerId, claimedByUserId, amount, claimedAt }
};

class Database {
  constructor() {
    this.data = { ...initialData };
    this.isSaving = false;
    this.saveQueued = false;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = { ...initialData, ...JSON.parse(raw) };
      } else {
        this.saveSync();
      }
    } catch (err) {
      console.error('[DB] Failed to read database file, initializing fresh:', err.message);
      this.data = { ...initialData };
      this.saveSync();
    }
  }

  saveSync() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Save error:', err.message);
    }
  }

  scheduleSave() {
    if (this.isSaving) {
      this.saveQueued = true;
      return;
    }
    this.isSaving = true;
    setTimeout(() => {
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (err) {
        console.error('[DB] Scheduled save error:', err.message);
      } finally {
        this.isSaving = false;
        if (this.saveQueued) {
          this.saveQueued = false;
          this.scheduleSave();
        }
      }
    }, 50);
  }

  // --- Users ---
  getAllUsers() {
    return this.data.users.map(({ password, ...u }) => u);
  }

  getUserById(id) {
    return this.data.users.find(u => u.id === id) || null;
  }

  getUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  }

  getUserByReferralCode(code) {
    if (!code) return null;
    const clean = code.trim().toUpperCase();
    return this.data.users.find(u => (u.referralCode || '').toUpperCase() === clean || u.id === code.trim()) || null;
  }

  hasUserClaimedReferral(userId) {
    return (this.data.referralClaims || []).some(rc => rc.claimedByUserId === userId);
  }

  claimReferral(code, claimingUserId) {
    const referrer = this.getUserByReferralCode(code);
    if (!referrer) {
      throw new Error(`Referral code "${code}" is invalid.`);
    }

    if (referrer.id === claimingUserId) {
      throw new Error("You cannot claim your own referral link.");
    }

    if (this.hasUserClaimedReferral(claimingUserId)) {
      throw new Error("You have already claimed a referral bonus on your account.");
    }

    const REFERRAL_BONUS = 25;
    const REFERRER_REWARD = 10;

    // 1. Credit 25 credits to claiming user
    const { user: updatedClaimer, transaction: claimerTx } = this.modifyUserCredits(
      claimingUserId,
      REFERRAL_BONUS,
      'REFERRAL_BONUS',
      {
        referralCode: code,
        referrerId: referrer.id,
        referrerName: referrer.name,
        description: `🎁 Claimed 25 Free Referral Credits from ${referrer.name}'s link!`
      }
    );

    // 2. Credit 10 credits to referrer
    let referrerTx = null;
    try {
      const { transaction } = this.modifyUserCredits(
        referrer.id,
        REFERRER_REWARD,
        'REFERRAL_REWARD',
        {
          referredUserId: claimingUserId,
          referredUserName: updatedClaimer.name,
          description: `🤝 Friend Referral: ${updatedClaimer.name} joined via your link (+10 Credits)`
        }
      );
      referrerTx = transaction;
    } catch (e) {
      console.error('[Referral reward error for referrer]:', e.message);
    }

    // 3. Record claim
    const claimRecord = {
      id: 'rc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      code,
      referrerId: referrer.id,
      referrerName: referrer.name,
      claimedByUserId: claimingUserId,
      amount: REFERRAL_BONUS,
      claimedAt: new Date().toISOString()
    };
    if (!this.data.referralClaims) this.data.referralClaims = [];
    this.data.referralClaims.push(claimRecord);
    this.scheduleSave();

    return {
      claimer: updatedClaimer,
      claimerTx,
      referrer,
      referrerTx,
      amount: REFERRAL_BONUS
    };
  }

  createUser(user) {
    this.data.users.push(user);
    this.scheduleSave();
    return user;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
    this.scheduleSave();
    return this.data.users[idx];
  }

  // Atomic credit transfer / adjustment
  modifyUserCredits(userId, delta, reason, metadata = {}) {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error(`User ${userId} not found`);

    const currentBalance = Number(user.credits || 0);
    const newBalance = currentBalance + Number(delta);

    if (newBalance < 0) {
      throw new Error(`Insufficient credits: current ${currentBalance}, required ${Math.abs(delta)}`);
    }

    user.credits = newBalance;
    if (delta > 0) {
      user.totalEarned = (Number(user.totalEarned) || 0) + Number(delta);
    } else {
      user.totalSpent = (Number(user.totalSpent) || 0) + Math.abs(Number(delta));
    }
    user.updatedAt = new Date().toISOString();

    const tx = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      userId,
      amount: delta,
      balanceAfter: newBalance,
      type: delta >= 0 ? 'EARNED' : 'SPENT',
      reason,
      ...metadata,
      createdAt: new Date().toISOString()
    };

    this.data.transactions.unshift(tx);
    this.scheduleSave();
    return { user, transaction: tx };
  }

  // --- Videos ---
  getAllVideos(filter = {}) {
    let list = [...this.data.videos];
    if (filter.status) {
      list = list.filter(v => v.status === filter.status);
    }
    if (filter.category && filter.category !== 'All') {
      list = list.filter(v => v.category.toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.creatorId) {
      list = list.filter(v => v.creatorId === filter.creatorId);
    }
    if (filter.level && filter.level !== 'All') {
      list = list.filter(v => (v.level || 'Intermediate').toLowerCase() === filter.level.toLowerCase());
    }
    if (filter.durationRange && filter.durationRange !== 'All') {
      if (filter.durationRange === 'under20') {
        list = list.filter(v => (v.duration || 0) < 1200);
      } else if (filter.durationRange === '20-30') {
        list = list.filter(v => (v.duration || 0) >= 1200 && (v.duration || 0) <= 1800);
      } else if (filter.durationRange === '30-45') {
        list = list.filter(v => (v.duration || 0) > 1800 && (v.duration || 0) <= 2700);
      } else if (filter.durationRange === '45plus') {
        list = list.filter(v => (v.duration || 0) > 2700);
      }
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(v => 
        v.title.toLowerCase().includes(q) || 
        v.description.toLowerCase().includes(q) ||
        (v.tags && v.tags.some(t => t.toLowerCase().includes(q))) ||
        (v.creatorName && v.creatorName.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (filter.sortBy === 'duration_desc') {
      list.sort((a, b) => (b.duration || 0) - (a.duration || 0));
    } else if (filter.sortBy === 'duration_asc') {
      list.sort((a, b) => (a.duration || 0) - (b.duration || 0));
    } else if (filter.sortBy === 'popular') {
      list.sort((a, b) => ((b.completionsCount || 0) + (b.unlockCount || 0)) - ((a.completionsCount || 0) + (a.unlockCount || 0)));
    } else if (filter.sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }

  getVideoById(id) {
    return this.data.videos.find(v => v.id === id) || null;
  }

  createVideo(video) {
    this.data.videos.unshift(video);
    this.scheduleSave();
    return video;
  }

  updateVideo(id, updates) {
    const idx = this.data.videos.findIndex(v => v.id === id);
    if (idx === -1) return null;
    this.data.videos[idx] = { ...this.data.videos[idx], ...updates, updatedAt: new Date().toISOString() };
    this.scheduleSave();
    return this.data.videos[idx];
  }

  // --- Quizzes ---
  getQuizByVideoId(videoId) {
    return this.data.quizzes.find(q => q.videoId === videoId) || null;
  }

  createOrUpdateQuiz(quiz) {
    const idx = this.data.quizzes.findIndex(q => q.videoId === quiz.videoId);
    if (idx >= 0) {
      this.data.quizzes[idx] = { ...this.data.quizzes[idx], ...quiz, updatedAt: new Date().toISOString() };
    } else {
      this.data.quizzes.push(quiz);
    }
    this.scheduleSave();
    return quiz;
  }

  // --- Watch Progress & Anti-Cheat ---
  getWatchProgress(userId, videoId) {
    return this.data.watchProgress.find(wp => wp.userId === userId && wp.videoId === videoId) || null;
  }

  saveWatchProgress(userId, videoId, { currentTime, duration, percentage, heartbeatCount, maxPlaybackSpeed }) {
    let wp = this.data.watchProgress.find(p => p.userId === userId && p.videoId === videoId);
    const now = new Date().toISOString();
    if (!wp) {
      wp = {
        id: 'wp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        userId,
        videoId,
        maxWatchedPercentage: percentage,
        lastPosition: currentTime,
        duration,
        heartbeatCount: heartbeatCount || 1,
        maxPlaybackSpeed: maxPlaybackSpeed || 1.0,
        completed: percentage >= 90,
        firstWatchedAt: now,
        updatedAt: now
      };
      this.data.watchProgress.push(wp);
    } else {
      wp.maxWatchedPercentage = Math.max(wp.maxWatchedPercentage || 0, percentage);
      wp.lastPosition = currentTime;
      wp.duration = duration || wp.duration;
      wp.heartbeatCount = (wp.heartbeatCount || 0) + (heartbeatCount || 1);
      wp.maxPlaybackSpeed = Math.max(wp.maxPlaybackSpeed || 1.0, maxPlaybackSpeed || 1.0);
      if (wp.maxWatchedPercentage >= 90) {
        wp.completed = true;
      }
      wp.updatedAt = now;
    }
    this.scheduleSave();
    return wp;
  }

  // --- Completions (Idempotency check: 1 reward per user per video) ---
  hasLearnerCompleted(userId, videoId) {
    return this.data.completions.some(c => c.userId === userId && c.videoId === videoId);
  }

  recordLearnerCompletion(userId, videoId, quizScore, creatorId) {
    if (this.hasLearnerCompleted(userId, videoId)) {
      return null; // Already completed
    }
    const completion = {
      id: 'comp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId,
      videoId,
      creatorId,
      quizScore,
      completedAt: new Date().toISOString()
    };
    this.data.completions.push(completion);
    this.scheduleSave();
    return completion;
  }

  // --- Skill Unlocks (5 credits spend) ---
  hasUserUnlocked(userId, videoId) {
    // Creator automatically has their own video unlocked
    const video = this.getVideoById(videoId);
    if (video && video.creatorId === userId) return true;
    return this.data.unlocks.some(u => u.userId === userId && u.videoId === videoId);
  }

  recordSkillUnlock(userId, videoId, cost = 5) {
    if (this.hasUserUnlocked(userId, videoId)) return null;
    const unlock = {
      id: 'unl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId,
      videoId,
      cost,
      unlockedAt: new Date().toISOString()
    };
    this.data.unlocks.push(unlock);
    this.scheduleSave();
    return unlock;
  }

  getUserUnlockedVideoIds(userId) {
    return this.data.unlocks.filter(u => u.userId === userId).map(u => u.videoId);
  }

  // --- Transactions ---
  getUserTransactions(userId) {
    return this.data.transactions
      .filter(tx => tx.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getAllTransactions(limit = 100) {
    return this.data.transactions
      .slice(0, limit)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // --- Notifications ---
  createNotification(notif) {
    const item = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      ...notif,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.unshift(item);
    this.scheduleSave();
    return item;
  }

  getUserNotifications(userId) {
    return this.data.notifications.filter(n => n.userId === userId);
  }

  markNotificationsAsRead(userId) {
    this.data.notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    this.scheduleSave();
  }

  // --- Fraud Logs ---
  logFraudAttempt(log) {
    const entry = {
      id: 'fraud_' + Date.now(),
      ...log,
      timestamp: new Date().toISOString()
    };
    this.data.fraudLogs.unshift(entry);
    this.scheduleSave();
    return entry;
  }

  getFraudLogs() {
    return this.data.fraudLogs;
  }

  // Clear / Reset for seed
  resetAll() {
    this.data = { ...initialData };
    this.saveSync();
  }
}

export const db = new Database();
