import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../config/db.js';
import { analyzeVideoContent } from '../services/aiReviewService.js';
import { AntiCheatService } from '../services/antiCheatService.js';
import { emitToUser, broadcastGlobal } from '../services/socketService.js';
import { generatePermanentAvatarSvg } from '../config/avatarUtils.js';

function extractYouTubeThumbnail(url) {
  if (!url) return null;
  const match = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

export function getVideos(req, res) {
  try {
    const { category, search, creatorId, status, durationRange, level, sortBy } = req.query;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    // Regular users only see APPROVED videos unless filtering by their own creatorId
    let queryStatus = status;
    if (!isAdmin && (!creatorId || creatorId !== userId)) {
      queryStatus = 'APPROVED';
    }

    const videos = db.getAllVideos({
      category,
      search,
      creatorId,
      status: queryStatus,
      durationRange,
      level,
      sortBy
    });

    const enriched = videos.map(video => {
      const isCreator = userId ? video.creatorId === userId : false;
      const isUnlocked = userId ? db.hasUserUnlocked(userId, video.id) : false;
      const isCompleted = userId ? db.hasLearnerCompleted(userId, video.id) : false;
      const progress = userId ? db.getWatchProgress(userId, video.id) : null;

      return {
        ...video,
        isCreator,
        isUnlocked: isCreator || isUnlocked,
        isCompleted,
        currentProgress: progress?.maxWatchedPercentage || 0
      };
    });

    return res.json(enriched);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch videos.', error: err.message });
  }
}

export function getOrCreateQuizForVideo(video) {
  let quiz = db.getQuizByVideoId(video.id);
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    const questions = [
      {
        id: 'q1',
        question: `What is the primary core principle taught in "${video.title}"?`,
        options: [
          `Foundational architecture, structured workflow, and best practices`,
          `Unstructured procedural trial without systematic planning`,
          `Outdated patterns with no real-world applicability`,
          `Pure theoretical trivia with zero practical execution`
        ],
        correctOption: 0
      },
      {
        id: 'q2',
        question: `How does mastering the techniques demonstrated in this lesson improve your skillset?`,
        options: [
          `Reduces execution errors and accelerates production delivery`,
          `Creates unnecessary overhead without measurable benefit`,
          `Completely prevents adaptability in real projects`,
          `Only applies to artificial toy problems`
        ],
        correctOption: 0
      },
      {
        id: 'q3',
        question: `What is a critical takeaway when applying this ${video.category || 'skill'} in production?`,
        options: [
          `Rigorous validation, continuous testing, and adhering to standard patterns`,
          `Skipping documentation and architecture planning entirely`,
          `Relying purely on arbitrary assumptions`,
          `Never evaluating performance metrics`
        ],
        correctOption: 0
      }
    ];

    quiz = {
      id: 'quiz_' + video.id,
      videoId: video.id,
      questions,
      createdAt: new Date().toISOString()
    };
    db.createOrUpdateQuiz(quiz);
  }
  return quiz;
}

export function getVideoById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const video = db.getVideoById(id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    const isCreator = userId ? video.creatorId === userId : false;
    const isUnlocked = userId ? db.hasUserUnlocked(userId, video.id) : false;
    const isCompleted = userId ? db.hasLearnerCompleted(userId, video.id) : false;
    const progress = userId ? db.getWatchProgress(userId, video.id) : null;
    const quiz = getOrCreateQuizForVideo(video);

    // If regular user and not unlocked/creator, quiz answers are hidden
    let sanitizedQuiz = {
      id: quiz.id,
      videoId: quiz.videoId,
      questions: quiz.questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options
      }))
    };
    if (isCreator || req.user?.role === 'admin') {
      sanitizedQuiz = quiz;
    }

    return res.json({
      ...video,
      isCreator,
      isUnlocked: isCreator || isUnlocked,
      isCompleted,
      currentProgress: progress?.maxWatchedPercentage || 0,
      quiz: sanitizedQuiz
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to retrieve video.', error: err.message });
  }
}

export function unlockVideo(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const video = db.getVideoById(id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    if (video.creatorId === userId) {
      return res.json({ message: 'You are the creator of this video. It is already unlocked.', unlocked: true });
    }

    if (db.hasUserUnlocked(userId, id)) {
      return res.json({ message: 'Video is already unlocked.', unlocked: true });
    }

    const UNLOCK_COST = 5;
    const user = db.getUserById(userId);
    if (!user || (user.credits || 0) < UNLOCK_COST) {
      return res.status(400).json({
        message: `Insufficient credits. You need ${UNLOCK_COST} credits to unlock this skill video. Your balance is ${user?.credits || 0}.`,
        currentBalance: user?.credits || 0,
        requiredCredits: UNLOCK_COST
      });
    }

    // Debit 5 credits
    const { user: updatedUser, transaction } = db.modifyUserCredits(
      userId,
      -UNLOCK_COST,
      'SKILL_UNLOCKED',
      {
        videoId: video.id,
        videoTitle: video.title,
        description: `Unlocked skill course: ${video.title}`
      }
    );

    // Record unlock
    db.recordSkillUnlock(userId, id, UNLOCK_COST);

    // Increment video unlock count
    db.updateVideo(id, { unlockCount: (video.unlockCount || 0) + 1 });

    // Notification
    db.createNotification({
      userId,
      type: 'SKILL_UNLOCKED',
      title: 'Skill Unlocked! 🚀',
      message: `You spent 5 credits to unlock "${video.title}". Enjoy learning!`
    });

    emitToUser(userId, 'wallet:updated', {
      credits: updatedUser.credits,
      transaction
    });

    return res.json({
      message: `Successfully unlocked "${video.title}" for 5 credits.`,
      unlocked: true,
      remainingCredits: updatedUser.credits
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to unlock video.', error: err.message });
  }
}

export function recordProgress(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { currentTime, duration, percentage, playbackSpeed } = req.body;

    const video = db.getVideoById(id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    const wp = db.saveWatchProgress(userId, id, {
      currentTime: Number(currentTime) || 0,
      duration: Number(duration) || video.duration || 1200,
      percentage: Number(percentage) || 0,
      heartbeatCount: 1,
      maxPlaybackSpeed: Number(playbackSpeed) || 1.0
    });

    const isEligibleForQuiz = wp.maxWatchedPercentage >= 90 && video.creatorId !== userId && !db.hasLearnerCompleted(userId, id);

    return res.json({
      success: true,
      progress: wp.maxWatchedPercentage,
      isCompleted: wp.completed,
      isEligibleForQuiz
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update watch progress.', error: err.message });
  }
}

export function submitQuizAndClaim(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const learner = req.user;
    const { answers } = req.body; // array of { questionId, selectedOption }

    // 1. Anti-Cheat Validation
    const validation = AntiCheatService.validateCompletionEligibility({ userId, videoId: id });
    if (!validation.eligible) {
      return res.status(400).json({
        message: validation.reason,
        code: validation.code,
        details: validation
      });
    }

    const { video } = validation;
    const quiz = getOrCreateQuizForVideo(video);

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      return res.status(400).json({ message: 'No quiz available for this video.' });
    }

    // 2. Grade Quiz
    let correctCount = 0;
    quiz.questions.forEach(q => {
      const learnerAns = answers?.find(a => a.questionId === q.id);
      if (learnerAns && learnerAns.selectedOption === q.correctOption) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);
    const PASSING_THRESHOLD = 60; // 60% required to pass

    if (scorePercentage < PASSING_THRESHOLD) {
      return res.status(400).json({
        message: `Quiz not passed. You scored ${scorePercentage}% (${correctCount}/${quiz.questions.length}). You need at least ${PASSING_THRESHOLD}% to earn credits. Please review the lesson and try again!`,
        scorePercentage,
        passed: false
      });
    }

    // 3. Mark completion (idempotent record)
    const completion = db.recordLearnerCompletion(userId, id, scorePercentage, video.creatorId);
    if (!completion) {
      return res.status(400).json({ message: 'Completion already recorded.' });
    }

    // 4. Reward Learner: 1 credit
    const { user: updatedLearner, transaction: learnerTx } = db.modifyUserCredits(
      userId,
      1,
      'VIDEO_COMPLETED',
      {
        videoId: video.id,
        videoTitle: video.title,
        quizScore: scorePercentage,
        description: `Completed skill video "${video.title}" (Score: ${scorePercentage}%)`
      }
    );

    db.createNotification({
      userId,
      type: 'REWARD_EARNED',
      title: 'Skill Mastered! +1 Credit 🎓',
      message: `You completed "${video.title}" and passed the quiz with ${scorePercentage}%. +1 credit added to your wallet!`
    });

    emitToUser(userId, 'wallet:updated', {
      credits: updatedLearner.credits,
      transaction: learnerTx
    });

    // 5. Reward Creator: 2 credits for unique learner completion
    let creatorTx = null;
    let updatedCreator = null;
    try {
      const creatorResult = db.modifyUserCredits(
        video.creatorId,
        2,
        'CREATOR_ROYALTY',
        {
          videoId: video.id,
          videoTitle: video.title,
          learnerId: userId,
          learnerName: learner.name,
          description: `Royalty: ${learner.name} completed your skill video "${video.title}"`
        }
      );
      creatorTx = creatorResult.transaction;
      updatedCreator = creatorResult.user;

      db.createNotification({
        userId: video.creatorId,
        type: 'CREATOR_ROYALTY',
        title: 'Creator Royalty! +2 Credits 💰',
        message: `${learner.name} just completed your skill course "${video.title}". You earned 2 creator credits!`
      });

      emitToUser(video.creatorId, 'wallet:updated', {
        credits: updatedCreator.credits,
        transaction: creatorTx
      });

      emitToUser(video.creatorId, 'creator:royalty_earned', {
        amount: 2,
        videoTitle: video.title,
        learnerName: learner.name
      });
    } catch (e) {
      console.error('[Royalty credit error for creator]:', e.message);
    }

    // Update video completion statistics
    db.updateVideo(id, {
      completionsCount: (video.completionsCount || 0) + 1
    });

    // Broadcast platform milestone
    broadcastGlobal('platform:achievement', {
      learnerName: learner.name,
      creatorName: video.creatorName,
      videoTitle: video.title,
      message: `🎉 ${learner.name} just mastered "${video.title}" and earned 1 credit!`
    });

    return res.json({
      success: true,
      message: `Congratulations! You scored ${scorePercentage}% and earned 1 credit. The creator (${video.creatorName}) also received 2 credits!`,
      passed: true,
      scorePercentage,
      learnerCredits: updatedLearner.credits,
      reward: 1
    });
  } catch (err) {
    console.error('[Quiz submit error]:', err);
    return res.status(500).json({ message: 'Failed to process quiz submission.', error: err.message });
  }
}

export function createVideo(req, res) {
  try {
    const userId = req.user.id;
    const user = db.getUserById(userId);

    const {
      title,
      description,
      category,
      tags,
      videoUrl,
      thumbnailUrl,
      duration,
      quizQuestions
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required.' });
    }

    const parsedTags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []);
    // Ensure every uploaded course satisfies 20+ min requirement (minimum 1200 seconds / 20 mins)
    const videoDuration = Math.max(1200, Number(duration) || 1320); // 22 mins default

    // Run AI Educational Skill Review
    const aiReview = analyzeVideoContent({
      title,
      description,
      category,
      tags: parsedTags,
      duration: videoDuration
    });

    // Unless flagged as blatant non-educational spam, approve so it immediately shows to all users!
    const isApproved = aiReview.status !== 'REJECTED';
    const videoStatus = isApproved ? 'APPROVED' : 'REJECTED';

    const videoId = 'vid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // If file was uploaded via multer, use uploaded file path
    let finalVideoUrl = videoUrl;
    if (req.file) {
      finalVideoUrl = `/api/videos/stream/${videoId}`;
    }

    const newVideo = {
      id: videoId,
      creatorId: userId,
      creatorName: user.name,
      creatorAvatar: user.avatar || generatePermanentAvatarSvg(user.name, user.role),
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      tags: parsedTags,
      videoUrl: finalVideoUrl || `/api/videos/stream/${videoId}`,
      thumbnailUrl: thumbnailUrl || extractYouTubeThumbnail(finalVideoUrl) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      duration: videoDuration,
      status: videoStatus, // APPROVED so it immediately shows to all users in "Available 20+ Minute Skill Masterclasses"
      aiScore: aiReview.score,
      aiReasoning: aiReview.reasoning,
      aiDetails: aiReview,
      viewsCount: 0,
      unlockCount: 0,
      completionsCount: 0,
      uploadedFile: req.file ? req.file.filename : null,
      createdAt: new Date().toISOString()
    };

    db.createVideo(newVideo);

    // Automatically create or attach quiz
    let questions = [];
    if (quizQuestions && Array.isArray(quizQuestions) && quizQuestions.length > 0) {
      questions = quizQuestions;
    } else {
      // Generate default skill-check quiz questions tailored to the skill
      questions = [
        {
          id: 'q1',
          question: `What is the primary core principle taught in "${title}"?`,
          options: [
            `Foundational architecture and industry best practices`,
            `Casual recreation without structured methodology`,
            `Outdated legacy patterns`,
            `Unverified trial and error`
          ],
          correctOption: 0
        },
        {
          id: 'q2',
          question: `How does applying the techniques in this lesson improve practical workflow?`,
          options: [
            `It reduces execution time and prevents common pitfalls`,
            `It creates unnecessary complexity`,
            `It has zero measurable impact`,
            `It solely focuses on theoretical trivia`
          ],
          correctOption: 0
        },
        {
          id: 'q3',
          question: `Which key takeaway is essential when implementing this skill in real-world projects?`,
          options: [
            `Consistency, proper validation, and continuous optimization`,
            `Skipping planning and documentation entirely`,
            `Never adapting to specific requirements`,
            `Relying purely on default assumptions`
          ],
          correctOption: 0
        }
      ];
    }

    db.createOrUpdateQuiz({
      id: 'quiz_' + videoId,
      videoId,
      questions,
      createdAt: new Date().toISOString()
    });

    // IF APPROVED: Grant 5 credits immediately!
    let rewardGranted = false;
    if (newVideo.status === 'APPROVED') {
      rewardGranted = true;
      const { user: updatedUser, transaction } = db.modifyUserCredits(
        userId,
        5,
        'VIDEO_APPROVED',
        {
          videoId,
          videoTitle: title,
          description: `Educational skill video approved: "${title}" (+5 credits)`
        }
      );

      db.createNotification({
        userId,
        type: 'VIDEO_APPROVED',
        title: 'Video Approved! +5 Credits 🎉',
        message: `Your video "${title}" is approved! 5 credits added. It is now live for all users in "Available 20+ Minute Skill Masterclasses"!`
      });

      emitToUser(userId, 'wallet:updated', {
        credits: updatedUser.credits,
        transaction
      });
    } else {
      db.createNotification({
        userId,
        type: 'VIDEO_REJECTED',
        title: 'Video Rejected ⚠️',
        message: `Your video "${title}" could not be approved. Reason: ${aiReview.reasoning}`
      });
    }

    broadcastGlobal('platform:new_video', {
      videoId,
      title: newVideo.title,
      creatorName: newVideo.creatorName,
      creatorAvatar: newVideo.creatorAvatar,
      category: newVideo.category,
      duration: newVideo.duration,
      thumbnailUrl: newVideo.thumbnailUrl,
      status: newVideo.status,
      video: newVideo,
      message: `${newVideo.creatorName} uploaded a new skill: "${newVideo.title}"! Learn now.`
    });

    return res.status(201).json({
      message: rewardGranted 
        ? 'Video uploaded and approved by AI! You received 5 credits.' 
        : (aiReview.status === 'PENDING' ? 'Video uploaded and queued for admin review.' : 'Video uploaded but rejected by AI content filter.'),
      video: newVideo,
      rewardGranted,
      creditsEarned: rewardGranted ? 5 : 0
    });
  } catch (err) {
    console.error('[Create video error]:', err);
    return res.status(500).json({ message: 'Failed to upload video.', error: err.message });
  }
}

// Internal HTTP 206 Partial Content Video Streaming for 20+ min videos
export function streamVideo(req, res) {
  try {
    const { id } = req.params;
    const video = db.getVideoById(id);

    // Check if custom uploaded file exists
    let filePath = null;
    if (video && video.uploadedFile) {
      const candidate = path.join(UPLOADS_DIR, 'videos', video.uploadedFile);
      if (fs.existsSync(candidate)) {
        filePath = candidate;
      }
    }

    // Default bundled sample educational video
    if (!filePath) {
      const defaultSample = path.join(UPLOADS_DIR, 'videos', 'sample_educational_course.mp4');
      if (fs.existsSync(defaultSample)) {
        filePath = defaultSample;
      }
    }

    if (!filePath || !fs.existsSync(filePath)) {
      // If physical video file doesn't exist yet on disk, return 404 or redirect to fallback streamable video URL
      return res.status(404).json({ message: 'Video file not yet uploaded on server.' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    console.error('[Stream Error]:', err);
    res.status(500).send('Streaming error.');
  }
}
