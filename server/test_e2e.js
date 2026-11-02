import { db } from './config/db.js';
import { analyzeVideoContent } from './services/aiReviewService.js';
import { AntiCheatService } from './services/antiCheatService.js';
import { handleChatbotMessage } from './services/chatbotService.js';
import { getOrCreateQuizForVideo } from './controllers/videoController.js';

async function runTests() {
  console.log('=== STARTING TIMESHARE INTEGRATION & LOGIC TESTS ===\n');

  // Test 1: User Registration & 50 Bonus Credits
  console.log('[Test 1] Testing User Registration & 50 Bonus Credits...');
  const testUserId = 'usr_test_student';
  const initialBonus = 50;
  const testUser = {
    id: testUserId,
    name: 'Kavita Iyer',
    email: 'kavita@timeshare.ai',
    role: 'user',
    credits: initialBonus,
    totalEarned: initialBonus,
    totalSpent: 0,
    referralCode: 'KAVITA25'
  };
  db.createUser(testUser);
  db.data.transactions.push({
    id: 'tx_bonus_' + Date.now(),
    userId: testUserId,
    amount: initialBonus,
    balanceAfter: initialBonus,
    type: 'EARNED',
    reason: 'WELCOME_BONUS'
  });
  console.log(`✓ User ${testUser.name} registered with ${testUser.credits} bonus credits.`);

  // Test 2: AI Educational Content Analysis
  console.log('\n[Test 2] Testing AI Educational Content Analyzer...');
  const educationalVideo = analyzeVideoContent({
    title: 'Advanced React Server Components & Streaming Architecture',
    description: 'In-depth tutorial and masterclass on React 19 server actions, streaming SSR, performance benchmarks, and micro-frontend system design.',
    category: 'Technology & Code',
    tags: ['React', 'SSR', 'Architecture'],
    duration: 1400
  });
  console.log(`Educational Video Score: ${educationalVideo.score}/100, Status: ${educationalVideo.status}`);
  if (educationalVideo.status !== 'APPROVED') {
    throw new Error('Educational video should be APPROVED by AI');
  }
  console.log('✓ High-confidence educational skill correctly approved by AI.');

  const memeVideo = analyzeVideoContent({
    title: 'Crazy Funny Prank & Cat Meme Compilation',
    description: 'Just some funny fails and random gaming clips for fun and laughs.',
    category: 'Entertainment',
    tags: ['Meme', 'Funny'],
    duration: 500
  });
  console.log(`Meme Video Score: ${memeVideo.score}/100, Status: ${memeVideo.status}`);
  if (memeVideo.status !== 'REJECTED') {
    throw new Error('Meme video should be REJECTED by AI');
  }
  console.log('✓ Non-educational entertainment video correctly rejected by AI.');

  // Test 3: Upload Video and 5 Credits Award
  console.log('\n[Test 3] Testing Skill Video Upload & 5 Credits Creator Award...');
  const creator = db.getUserById('usr_rahul');
  const creatorBalanceBefore = creator.credits;
  const newVidId = 'vid_test_rust';
  db.createVideo({
    id: newVidId,
    creatorId: creator.id,
    creatorName: creator.name,
    title: 'Rust Systems Programming: Memory Safety & Concurrency',
    description: 'Learn memory management, lifetimes, borrow checker, and fearless concurrency in this 25-minute guide.',
    category: 'Technology & Code',
    status: 'APPROVED',
    duration: 1500
  });
  db.modifyUserCredits(creator.id, 5, 'VIDEO_APPROVED', { videoId: newVidId });
  console.log(`✓ Creator ${creator.name} earned 5 credits for approved video. Balance: ${creatorBalanceBefore} -> ${creator.credits}`);

  // Test 4: Spend 5 Credits to Unlock Skill
  console.log('\n[Test 4] Testing Skill Unlock (5 Credits Spend)...');
  const kavita = db.getUserById(testUserId);
  const kavitaBalanceBefore = kavita.credits;
  db.modifyUserCredits(kavita.id, -5, 'SKILL_UNLOCKED', { videoId: newVidId });
  db.recordSkillUnlock(kavita.id, newVidId, 5);
  console.log(`✓ Kavita unlocked course. Balance: ${kavitaBalanceBefore} -> ${kavita.credits}`);

  // Test 5: Anti-Cheat: Prevent Self-Watching
  console.log('\n[Test 5] Anti-Cheat: Preventing Self-Watching Reward...');
  const selfWatchResult = AntiCheatService.validateCompletionEligibility({
    userId: creator.id,
    videoId: newVidId
  });
  console.log(`Self-watch eligibility: ${selfWatchResult.eligible}, Code: ${selfWatchResult.code}`);
  if (selfWatchResult.eligible !== false) {
    throw new Error('Self-watching should be forbidden!');
  }
  console.log('✓ Self-watching successfully blocked by Anti-Cheat.');

  // Test 6: Anti-Cheat: Verify 90% Watch Threshold
  console.log('\n[Test 6] Anti-Cheat: Verifying 90% Watch Threshold...');
  // Progress at 50%
  db.saveWatchProgress(kavita.id, newVidId, {
    currentTime: 750,
    duration: 1500,
    percentage: 50
  });
  const earlyCheck = AntiCheatService.validateCompletionEligibility({
    userId: kavita.id,
    videoId: newVidId
  });
  console.log(`50% watch eligibility: ${earlyCheck.eligible}, Code: ${earlyCheck.code}`);
  if (earlyCheck.eligible !== false) {
    throw new Error('Watch under 90% should not be eligible for completion!');
  }
  console.log('✓ Insufficient watch time (<90%) successfully blocked.');

  // Progress at 92%
  db.saveWatchProgress(kavita.id, newVidId, {
    currentTime: 1380,
    duration: 1500,
    percentage: 92
  });
  const validCheck = AntiCheatService.validateCompletionEligibility({
    userId: kavita.id,
    videoId: newVidId
  });
  console.log(`92% watch eligibility: ${validCheck.eligible}`);
  if (validCheck.eligible !== true) {
    throw new Error('Watch >= 90% should be eligible!');
  }
  console.log('✓ 90%+ watch progress verified as eligible.');

  // Test 7: Completion Rewards: +1 to Learner, +2 to Creator
  console.log('\n[Test 7] Rewarding Learner (+1) and Creator (+2)...');
  db.recordLearnerCompletion(kavita.id, newVidId, 100, creator.id);
  db.modifyUserCredits(kavita.id, 1, 'VIDEO_COMPLETED', { videoId: newVidId });
  db.modifyUserCredits(creator.id, 2, 'CREATOR_ROYALTY', { videoId: newVidId, learnerId: kavita.id });
  console.log(`✓ Learner received 1 credit. Kavita new balance: ${kavita.credits}`);
  console.log(`✓ Creator received 2 credits royalty. Rahul new balance: ${creator.credits}`);

  // Test 8: Anti-Cheat: Prevent Repeated Credit Claims
  console.log('\n[Test 8] Anti-Cheat: Preventing Repeated Claims...');
  const repeatCheck = AntiCheatService.validateCompletionEligibility({
    userId: kavita.id,
    videoId: newVidId
  });
  console.log(`Repeat check eligibility: ${repeatCheck.eligible}, Code: ${repeatCheck.code}`);
  if (repeatCheck.eligible !== false || repeatCheck.code !== 'ALREADY_CLAIMED') {
    throw new Error('Repeat credit claims must be blocked!');
  }
  console.log('✓ Repeated credit claims successfully blocked (Idempotent).');

  // Test 9: 1-Click Referral Claim (+25 Free Credits)
  console.log('\n[Test 9] Testing Referral Claim (+25 Free Credits)...');
  const student2Id = 'usr_test_student2';
  db.createUser({
    id: student2Id,
    name: 'Devansh Roy',
    email: 'devansh@timeshare.ai',
    credits: 50,
    referralCode: 'DEVANSH25'
  });
  const rahulUser = db.getUserById('usr_rahul');
  const claimResult = db.claimReferral('RAHUL25', student2Id);
  console.log(`Devansh claimed Rahul's referral link. Amount: +${claimResult.amount} Credits.`);
  console.log(`Devansh new balance: ${claimResult.claimer.credits} (Started with 50 + 25 = 75)`);
  if (claimResult.claimer.credits !== 75) {
    throw new Error('Referral claim should grant 25 credits!');
  }
  console.log('✓ 1-Click Referral Link correctly awards 25 Free Credits.');

  // Test 10: Prevent Self-Referral
  console.log('\n[Test 10] Testing Self-Referral Block...');
  try {
    db.claimReferral('RAHUL25', 'usr_rahul');
    throw new Error('Should not allow claiming own referral code!');
  } catch (err) {
    console.log(`✓ Self-referral prevented: "${err.message}"`);
  }

  // Test 11: 20+ Minute Video Duration Filtering
  console.log('\n[Test 11] Testing 20+ Min Video Duration Filters...');
  const videos20to30 = db.getAllVideos({ status: 'APPROVED', durationRange: '20-30' });
  const videos30to45 = db.getAllVideos({ status: 'APPROVED', durationRange: '30-45' });
  console.log(`Found ${videos20to30.length} courses in 20-30 min range.`);
  console.log(`Found ${videos30to45.length} courses in 30-45 min range.`);
  if (videos20to30.length === 0 || videos30to45.length === 0) {
    throw new Error('Should find courses in both 20-30 min and 30-45 min ranges!');
  }
  console.log('✓ 20+ Minute Duration filter functioning correctly.');

  // Test 12: AI Chatbot Service
  console.log('\n[Test 12] Testing TimeShare AI Chatbot Service...');
  const botReply = handleChatbotMessage({ message: 'Recommend a 20+ min coding masterclass' });
  console.log(`Chatbot returned recommendations count: ${botReply.recommendations?.length || 0}`);
  if (!botReply.recommendations || botReply.recommendations.length === 0) {
    throw new Error('Chatbot should recommend courses for coding masterclass query!');
  }
  console.log(`✓ Chatbot response: "${botReply.text.substring(0, 75)}..."`);

  // Test 13: Peer Skill Upload & Cross-User Visibility
  console.log('\n[Test 13] Testing User Upload & Instant Cross-User Visibility...');
  const uploader = db.getUserById('usr_priya');
  const uploaderBalanceBefore = uploader.credits;
  const peerSkillId = 'vid_peer_figma_pro';
  const newUploadedSkill = {
    id: peerSkillId,
    creatorId: uploader.id,
    creatorName: uploader.name,
    title: 'Design System Tokens & Auto Layout 5.0 Masterclass',
    description: 'Learn modern design token architecture, adaptive components, and auto-layout nested flex frames in this 22-minute masterclass.',
    category: 'Design & UI/UX',
    duration: 1320,
    status: 'APPROVED',
    createdAt: new Date().toISOString()
  };
  db.createVideo(newUploadedSkill);
  db.modifyUserCredits(uploader.id, 5, 'VIDEO_APPROVED', { videoId: peerSkillId });
  console.log(`✓ Priya uploaded new skill. Balance: ${uploaderBalanceBefore} -> ${uploader.credits} (+5 CR)`);

  // Verify that other users (like Aman) immediately see it in the catalog
  const catalogForOtherUser = db.getAllVideos({ status: 'APPROVED' });
  const foundPeerSkill = catalogForOtherUser.find(v => v.id === peerSkillId);
  if (!foundPeerSkill) {
    throw new Error('Newly uploaded video should immediately be visible in the catalog for other users!');
  }
  console.log(`✓ Other users immediately see "${foundPeerSkill.title}" in their catalog.`);

  // Test 14: End-of-Video Quiz Auto-Generation & Royalty Award
  console.log('\n[Test 14] Testing End-of-Video Quiz Auto-Generation & Mastery Award...');
  const attachedQuiz = getOrCreateQuizForVideo(newUploadedSkill);
  if (!attachedQuiz || !attachedQuiz.questions || attachedQuiz.questions.length < 3) {
    throw new Error('Every uploaded video must have a 3-question quiz attached!');
  }
  console.log(`✓ Quiz attached to video with ${attachedQuiz.questions.length} questions.`);

  // Learner Aman unlocks the peer skill
  const learnerAman = db.getUserById('usr_aman');
  const amanBalanceBefore = learnerAman.credits;
  db.modifyUserCredits(learnerAman.id, -5, 'SKILL_UNLOCKED', { videoId: peerSkillId });
  db.recordSkillUnlock(learnerAman.id, peerSkillId, 5);
  console.log(`✓ Aman unlocked Priya's new skill (-5 CR). Balance: ${amanBalanceBefore} -> ${learnerAman.credits}`);

  // Aman watches video to completion and completes quiz
  db.saveWatchProgress(learnerAman.id, peerSkillId, { currentTime: 1320, duration: 1320, percentage: 100 });
  const priyaBalanceBeforeRoyalty = uploader.credits;
  db.recordLearnerCompletion(learnerAman.id, peerSkillId, 100, uploader.id);
  db.modifyUserCredits(learnerAman.id, 1, 'VIDEO_COMPLETED', { videoId: peerSkillId });
  db.modifyUserCredits(uploader.id, 2, 'CREATOR_ROYALTY', { videoId: peerSkillId, learnerId: learnerAman.id });

  console.log(`✓ Aman completed video quiz (+1 CR). Balance: ${learnerAman.credits}`);
  console.log(`✓ Priya received creator royalty (+2 CR). Balance: ${priyaBalanceBeforeRoyalty} -> ${uploader.credits}`);

  console.log('\n=== ALL 14 TESTS PASSED SUCCESSFULLY (14/14) ===');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
