import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { JWT_SECRET } from '../middleware/auth.js';
import { broadcastGlobal } from '../services/socketService.js';
import { generatePermanentAvatarSvg } from '../config/avatarUtils.js';

export async function register(req, res) {
  try {
    const { name, email, password, avatar, bio, headline } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // Initial 50 BONUS CREDITS
    const bonusCredits = 50;

    // Generate clean referral code
    const baseCode = name.trim().split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '') || 'USER';
    const referralCode = `${baseCode}${Math.floor(10 + Math.random() * 89)}`;

    const newUser = {
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'user',
      avatar: avatar || generatePermanentAvatarSvg(name.trim(), 'user'),
      bio: bio || 'Lifelong learner on TimeShare.',
      headline: headline || 'Skill Enthusiast',
      credits: bonusCredits,
      totalEarned: bonusCredits,
      totalSpent: 0,
      referralCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.createUser(newUser);

    // Record welcome bonus transaction
    db.data.transactions.unshift({
      id: 'tx_bonus_' + Date.now(),
      userId,
      amount: bonusCredits,
      balanceAfter: bonusCredits,
      type: 'EARNED',
      reason: 'WELCOME_BONUS',
      description: 'Welcome to TimeShare! 50 bonus credits to jumpstart your learning journey.',
      createdAt: new Date().toISOString()
    });
    db.scheduleSave();

    // Welcome Notification
    db.createNotification({
      userId,
      type: 'WELCOME',
      title: 'Welcome to TimeShare! 🎉',
      message: 'You received 50 bonus credits. Explore skills or share your own!'
    });

    broadcastGlobal('platform:new_user', {
      name: newUser.name,
      message: `${newUser.name} just joined TimeShare!`
    });

    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = newUser;

    return res.status(201).json({
      message: 'Registration successful! 50 bonus credits added.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    return res.status(500).json({ message: 'Server error during registration.', error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;

    return res.json({
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    return res.status(500).json({ message: 'Server error during login.', error: err.message });
  }
}

export function getMe(req, res) {
  const user = db.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  const { password, ...safeUser } = user;
  const unlockedVideoIds = db.getUserUnlockedVideoIds(user.id);
  return res.json({
    user: safeUser,
    unlockedVideoIds
  });
}

// Quick demo login for Indian demo users and Admin
export function demoLogin(req, res) {
  try {
    const { role, email } = req.body;
    let targetUser = null;

    if (email) {
      targetUser = db.getUserByEmail(email);
    } else if (role === 'admin') {
      targetUser = db.data.users.find(u => u.role === 'admin');
    } else {
      // Default to first demo user (e.g. Rahul Sharma)
      targetUser = db.data.users.find(u => u.role !== 'admin');
    }

    if (!targetUser) {
      return res.status(404).json({ message: 'Demo user not found.' });
    }

    const token = jwt.sign({ id: targetUser.id, role: targetUser.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password, ...safeUser } = targetUser;
    const unlockedVideoIds = db.getUserUnlockedVideoIds(targetUser.id);

    return res.json({
      message: `Signed in as ${safeUser.name}`,
      token,
      user: safeUser,
      unlockedVideoIds
    });
  } catch (err) {
    return res.status(500).json({ message: 'Demo login error.', error: err.message });
  }
}

export function getDemoUsers(req, res) {
  const users = db.getAllUsers().map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    headline: u.headline,
    credits: u.credits,
    referralCode: u.referralCode
  }));
  return res.json(users);
}

export function claimReferral(req, res) {
  try {
    const { referralCode } = req.body;
    const userId = req.user.id;

    if (!referralCode) {
      return res.status(400).json({ message: 'Referral code is required.' });
    }

    const result = db.claimReferral(referralCode, userId);

    // Notify Referrer in real-time
    db.createNotification({
      userId: result.referrer.id,
      type: 'REFERRAL_REWARD',
      title: 'Referral Reward! +10 Credits 🤝',
      message: `${result.claimer.name} claimed your referral link. You received 10 credits!`
    });

    broadcastGlobal('platform:achievement', {
      learnerName: result.claimer.name,
      creatorName: result.referrer.name,
      videoTitle: 'Referral Program',
      message: `🎁 ${result.claimer.name} claimed 25 free credits from ${result.referrer.name}'s referral link!`
    });

    return res.json({
      success: true,
      message: `🎉 Success! 25 Free Referral Credits added to your wallet!`,
      amount: result.amount,
      newBalance: result.claimer.credits,
      referrerName: result.referrer.name
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

export function getReferralInfo(req, res) {
  try {
    const { code } = req.params;
    const referrer = db.getUserByReferralCode(code);
    if (!referrer) {
      return res.status(404).json({ valid: false, message: 'Invalid or expired referral code.' });
    }
    return res.json({
      valid: true,
      code,
      bonusAmount: 25,
      referrerName: referrer.name,
      referrerAvatar: referrer.avatar,
      referrerHeadline: referrer.headline
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to look up referral info.' });
  }
}
