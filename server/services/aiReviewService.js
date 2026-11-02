// AI Skill Analyzer & Educational Content Verifier

const EDUCATIONAL_KEYWORDS = [
  'how to', 'tutorial', 'course', 'guide', 'learn', 'master', 'fundamentals',
  'basics', 'advanced', 'introduction', 'full stack', 'react', 'javascript',
  'python', 'data structures', 'algorithms', 'finance', 'excel', 'design',
  'figma', 'ui/ux', 'guitar', 'music theory', 'sitar', 'photography', 'seo',
  'marketing', 'trading', 'system design', 'machine learning', 'cloud', 'aws',
  'docker', 'kubernetes', 'solidity', 'blockchain', 'speaking', 'presentation',
  'animation', 'editing', 'accounting', 'math', 'calculus', 'physics', 'ai'
];

const NON_EDUCATIONAL_KEYWORDS = [
  'prank', 'funny moments', 'roast', 'vlog', 'tiktok', 'reel', 'meme',
  'gaming montage', 'gameplay no commentary', 'fails compilation',
  'gossip', 'reaction video', 'drama', 'challenge', 'asmr eating',
  'unboxing toys', 'cat video', 'dog video', 'clickbait'
];

export function analyzeVideoContent({ title, description, category, tags = [], duration = 0 }) {
  const combinedText = `${title} ${description} ${category} ${tags.join(' ')}`.toLowerCase();

  let educationalHits = [];
  let nonEducationalHits = [];

  for (const kw of EDUCATIONAL_KEYWORDS) {
    if (combinedText.includes(kw)) {
      educationalHits.push(kw);
    }
  }

  for (const kw of NON_EDUCATIONAL_KEYWORDS) {
    if (combinedText.includes(kw)) {
      nonEducationalHits.push(kw);
    }
  }

  // Calculate educational score
  let score = 50; // base

  // Bonus for clear skill title & description length
  if (title.length >= 10) score += 10;
  if (description.length >= 50) score += 15;
  if (description.length >= 150) score += 10;

  // Keyword weights
  score += Math.min(educationalHits.length * 8, 30);
  score -= nonEducationalHits.length * 35;

  // Category boost
  const validCategories = [
    'Technology & Code',
    'Design & UI/UX',
    'Finance & Business',
    'Music & Audio',
    'Data Science & AI',
    'Marketing & Growth',
    'Photography & Video',
    'Personal Development'
  ];
  if (validCategories.map(c => c.toLowerCase()).includes(category.toLowerCase())) {
    score += 10;
  }

  // Normalize score 0 - 100
  score = Math.max(5, Math.min(99, score));

  // Determine status and detailed reasoning
  let status = 'PENDING';
  let reasoning = '';
  let autoApproved = false;

  if (nonEducationalHits.length > 0 && educationalHits.length === 0) {
    status = 'REJECTED';
    reasoning = `AI Classification: Non-educational keywords detected (${nonEducationalHits.slice(0, 3).join(', ')}). Content resembles entertainment or random media instead of a structured educational lesson.`;
  } else if (score >= 75) {
    status = 'APPROVED';
    autoApproved = true;
    reasoning = `AI Classification: High-confidence educational skill video (Score: ${score}/100). Clear learning objectives identified (${educationalHits.slice(0, 4).join(', ')}). Verified eligible for 5 credits reward.`;
  } else if (score < 40) {
    status = 'REJECTED';
    reasoning = `AI Classification: Insufficient educational depth (Score: ${score}/100). Description lacks structured syllabus or skill-learning outcomes.`;
  } else {
    status = 'PENDING';
    reasoning = `AI Classification: Moderate educational confidence (Score: ${score}/100). Queued for Admin Human Review to verify lesson quality.`;
  }

  return {
    score,
    status,
    autoApproved,
    reasoning,
    matchedKeywords: educationalHits,
    flaggedKeywords: nonEducationalHits,
    analyzedAt: new Date().toISOString()
  };
}
