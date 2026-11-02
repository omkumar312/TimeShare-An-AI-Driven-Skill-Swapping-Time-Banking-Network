import { db } from '../config/db.js';

export class AntiCheatService {
  /**
   * Validate if a learner is eligible to submit a quiz and claim completion rewards
   */
  static validateCompletionEligibility({ userId, videoId }) {
    const video = db.getVideoById(videoId);
    if (!video) {
      return { eligible: false, code: 'VIDEO_NOT_FOUND', reason: 'Video does not exist.' };
    }

    if (video.status !== 'APPROVED') {
      return { eligible: false, code: 'VIDEO_NOT_APPROVED', reason: 'Only approved educational skill videos are eligible for rewards.' };
    }

    // 1. Prevent self-watching rewards
    if (video.creatorId === userId) {
      db.logFraudAttempt({
        userId,
        videoId,
        type: 'SELF_WATCH_ATTEMPT',
        reason: 'Creator attempted to claim rewards on their own video.'
      });
      return {
        eligible: false,
        code: 'SELF_WATCHING_FORBIDDEN',
        reason: 'You cannot earn learner or creator rewards by watching your own video.'
      };
    }

    // 2. Prevent repeated credit claims (Idempotency)
    if (db.hasLearnerCompleted(userId, videoId)) {
      return {
        eligible: false,
        code: 'ALREADY_CLAIMED',
        reason: 'You have already completed this skill video and earned your credit reward.'
      };
    }

    // 3. Prevent fake views - verify watch progress
    const progress = db.getWatchProgress(userId, videoId);
    if (!progress || progress.maxWatchedPercentage < 90) {
      db.logFraudAttempt({
        userId,
        videoId,
        type: 'INSUFFICIENT_WATCH_TIME',
        recordedPercentage: progress?.maxWatchedPercentage || 0,
        reason: 'Attempted completion claim without reaching 90% watch threshold.'
      });
      return {
        eligible: false,
        code: 'INSUFFICIENT_WATCH_PERCENTAGE',
        currentPercentage: progress?.maxWatchedPercentage || 0,
        requiredPercentage: 90,
        reason: `You must watch at least 90% of the video. Current progress: ${Math.round(progress?.maxWatchedPercentage || 0)}%`
      };
    }

    // 4. Verify playback speed abuse
    if (progress.maxPlaybackSpeed > 3.0) {
      db.logFraudAttempt({
        userId,
        videoId,
        type: 'PLAYBACK_SPEED_ABUSE',
        speed: progress.maxPlaybackSpeed,
        reason: 'Excessive playback speed detected (>3.0x).'
      });
      return {
        eligible: false,
        code: 'SPEED_ABUSE',
        reason: 'Abnormal playback speed detected. Please watch at standard educational speeds (up to 2.0x).'
      };
    }

    return { eligible: true, video, progress };
  }
}
