import { db } from '../config/db.js';

export function handleChatbotMessage({ message, history = [], user = null }) {
  const q = (message || '').toLowerCase();
  const allVideos = db.getAllVideos({ status: 'APPROVED' });

  // 1. Check for Credit & Economy Questions
  if (
    q.includes('credit') ||
    q.includes('earn') ||
    q.includes('how to earn') ||
    q.includes('spend') ||
    q.includes('wallet') ||
    q.includes('free credit') ||
    q.includes('rule') ||
    q.includes('economy')
  ) {
    return {
      text: `**Here is how the TimeShare Credit Economy works:**\n\n` +
        `• **🎁 Welcome Bonus:** Get **50 credits** immediately upon registration!\n` +
        `• **🤝 Referral Bonus:** Claim **25 free credits** simply by clicking a friend's referral link!\n` +
        `• **🎥 Video Approval:** Earn **5 credits** when your educational skill video is approved by AI or Admin.\n` +
        `• **🎓 Watch & Learn:** Earn **1 credit** by watching at least **90%** of any course and passing the 3-question quiz.\n` +
        `• **💰 Creator Royalty:** Earn **2 credits** whenever another student successfully completes your course!\n` +
        `• **🚀 Unlock Courses:** Spend **5 credits** to permanently unlock any 20+ minute masterclass.\n\n` +
        `*All transactions are securely audited and updated automatically in your Credit Wallet.*`,
      suggestedTopics: ['How does referral work?', 'Show 20+ min coding masterclasses', 'How does anti-cheat work?'],
      recommendations: []
    };
  }

  // 2. Check for Referral Questions
  if (q.includes('refer') || q.includes('referral') || q.includes('invite') || q.includes('25 credit')) {
    return {
      text: `**🎁 TimeShare Referral Program (Free 25 Credits!):**\n\n` +
        `1. Every user has a unique referral link (e.g., \`?ref=RAHUL25\`).\n` +
        `2. When a friend clicks your referral link, they receive **25 free credits** added to their wallet with just 1 click!\n` +
        `3. You also receive **10 creator credits** as a token of appreciation for growing the community.\n\n` +
        `Click **"Referral Program"** in the top navigation bar to copy your unique referral link!`,
      suggestedTopics: ['Show my referral link', 'Explore all skill videos', 'How to upload a video?'],
      recommendations: []
    };
  }

  // 3. Check for Anti-Cheat Questions
  if (q.includes('anti-cheat') || q.includes('fake view') || q.includes('90%') || q.includes('cheat') || q.includes('threshold')) {
    return {
      text: `**🛡️ TimeShare Anti-Cheat Protocol:**\n\n` +
        `• **90% Watch Barrier:** The embedded player sends authenticated heartbeats to verify continuous playback. Skipping straight to the end is prevented from advancing verified watch time.\n` +
        `• **No Self-Rewards:** Creators cannot claim learner credits or royalties by watching their own courses.\n` +
        `• **Speed Verification:** Playback speed $>3.0\\times$ is flagged as speed abuse.\n` +
        `• **Idempotency:** Only 1 completion reward per student per course is allowed in the database.`,
      suggestedTopics: ['Show courses ready to learn', 'How to earn 5 credits for uploading?'],
      recommendations: []
    };
  }

  // 4. Match specific skills / categories
  let matches = [];

  if (q.includes('react') || q.includes('code') || q.includes('web') || q.includes('javascript') || q.includes('program') || q.includes('node')) {
    matches = allVideos.filter(v => v.title.toLowerCase().includes('react') || v.category === 'Technology & Code');
  } else if (q.includes('design') || q.includes('figma') || q.includes('ui') || q.includes('ux')) {
    matches = allVideos.filter(v => v.title.toLowerCase().includes('figma') || v.category === 'Design & UI/UX');
  } else if (q.includes('trading') || q.includes('finance') || q.includes('quant') || q.includes('stock') || q.includes('money')) {
    matches = allVideos.filter(v => v.category === 'Finance & Business');
  } else if (q.includes('music') || q.includes('guitar') || q.includes('raga') || q.includes('song')) {
    matches = allVideos.filter(v => v.category === 'Music & Audio');
  } else if (q.includes('ai') || q.includes('data') || q.includes('spark') || q.includes('kafka') || q.includes('machine learning')) {
    matches = allVideos.filter(v => v.category === 'Data Science & AI');
  } else if (q.includes('seo') || q.includes('marketing') || q.includes('growth')) {
    matches = allVideos.filter(v => v.category === 'Marketing & Growth');
  } else if (q.includes('20 min') || q.includes('long') || q.includes('masterclass') || q.includes('recommend')) {
    matches = allVideos.slice(0, 4);
  }

  if (matches.length > 0) {
    const list = matches.slice(0, 3);
    const names = list.map(m => `• **${m.title}** (~${Math.round(m.duration / 60)} mins) by ${m.creatorName}`).join('\n');
    return {
      text: `Here are the top high-quality educational masterclasses matching your learning goals:\n\n${names}\n\n*Click on any course below to start watching and earning credits!*`,
      suggestedTopics: ['How do I unlock a course?', 'How to earn 1 credit?', 'How to earn 5 credits by uploading?'],
      recommendations: list.map(m => ({
        id: m.id,
        title: m.title,
        creatorName: m.creatorName,
        duration: m.duration,
        category: m.category,
        thumbnailUrl: m.thumbnailUrl
      }))
    };
  }

  // Default fallback answer
  return {
    text: `Hello! I am your **TimeShare AI Learning Advisor**. 🎓\n\n` +
      `I can help you:\n` +
      `1. Find top-rated **20+ minute skill masterclasses** across Tech, Design, Finance, AI, Marketing, and Music.\n` +
      `2. Explain how to **earn credits** (50 welcome bonus, 25 referral bonus, 5 upload credits, 1 learner completion credit, 2 creator royalties).\n` +
      `3. Prepare for **skill quizzes** to earn your credits faster.\n\n` +
      `What would you like to explore today?`,
    suggestedTopics: [
      'Recommend 20+ min coding masterclasses',
      'How do I claim 25 free referral credits?',
      'How does the 90% watch quiz work?',
      'How to earn 5 credits uploading a video?'
    ],
    recommendations: allVideos.slice(0, 2).map(m => ({
      id: m.id,
      title: m.title,
      creatorName: m.creatorName,
      duration: m.duration,
      category: m.category,
      thumbnailUrl: m.thumbnailUrl
    }))
  };
}
