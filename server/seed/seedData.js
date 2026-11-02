import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { PERMANENT_DEMO_AVATARS } from '../config/avatarUtils.js';

export async function runSeed() {
  console.log('[Seed] Seeding TimeShare database with realistic Indian demo users and 20+ min YouTube courses...');
  db.resetAll();

  const saltRounds = 10;
  const defaultPassword = await bcrypt.hash('timeshare123', saltRounds);

  // 1. Seed Realistic Indian Demo Users & Admin with Permanent Monogram Avatars
  const users = [
    {
      id: 'usr_admin',
      name: 'Vikram Aditya (Admin)',
      email: 'admin@timeshare.ai',
      password: defaultPassword,
      role: 'admin',
      avatar: PERMANENT_DEMO_AVATARS.admin,
      headline: 'Platform Admin & Content Moderator',
      bio: 'Overseeing educational curriculum quality and platform integrity on TimeShare.',
      credits: 100,
      totalEarned: 100,
      totalSpent: 0,
      referralCode: 'ADMIN25',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr_rahul',
      name: 'Rahul Sharma',
      email: 'rahul@timeshare.ai',
      password: defaultPassword,
      role: 'user',
      avatar: PERMANENT_DEMO_AVATARS.rahul,
      headline: 'Full-Stack Architect & Open Source Contributor',
      bio: 'Bengaluru-based senior engineer passionate about microservices, React, and scalable backend design.',
      credits: 65,
      totalEarned: 75,
      totalSpent: 10,
      referralCode: 'RAHUL25',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr_priya',
      name: 'Priya Verma',
      email: 'priya@timeshare.ai',
      password: defaultPassword,
      role: 'user',
      avatar: PERMANENT_DEMO_AVATARS.priya,
      headline: 'Principal Product Designer & Design System Architect',
      bio: 'Crafting intuitive UI/UX systems and interaction design with Figma and Webflow.',
      credits: 58,
      totalEarned: 68,
      totalSpent: 10,
      referralCode: 'PRIYA25',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr_aman',
      name: 'Aman Singh',
      email: 'aman@timeshare.ai',
      password: defaultPassword,
      role: 'user',
      avatar: PERMANENT_DEMO_AVATARS.aman,
      headline: 'Quantitative Analyst & Financial Modeling Mentor',
      bio: 'Ex-quant researcher teaching algorithmic trading, options pricing, and Excel financial modeling.',
      credits: 72,
      totalEarned: 82,
      totalSpent: 10,
      referralCode: 'AMAN25',
      createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr_ananya',
      name: 'Ananya Patel',
      email: 'ananya@timeshare.ai',
      password: defaultPassword,
      role: 'user',
      avatar: PERMANENT_DEMO_AVATARS.ananya,
      headline: 'Classical Musician & Guitar Fusion Producer',
      bio: 'Exploring traditional Indian ragas blended with modern blues and acoustic fingerstyle arrangements.',
      credits: 60,
      totalEarned: 70,
      totalSpent: 10,
      referralCode: 'ANANYA25',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr_arjun',
      name: 'Arjun Kumar',
      email: 'arjun@timeshare.ai',
      password: defaultPassword,
      role: 'user',
      avatar: PERMANENT_DEMO_AVATARS.arjun,
      headline: 'Staff Data Engineer & Distributed Systems Lead',
      bio: 'Specialist in Apache Spark, Kafka streaming pipelines, and real-time event analytics.',
      credits: 64,
      totalEarned: 74,
      totalSpent: 10,
      referralCode: 'ARJUN25',
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr_sneha',
      name: 'Sneha Gupta',
      email: 'sneha@timeshare.ai',
      password: defaultPassword,
      role: 'user',
      avatar: PERMANENT_DEMO_AVATARS.sneha,
      headline: 'Growth Marketing Director & Technical SEO Consultant',
      bio: 'Helping startups scale organically through semantic SEO, content funnels, and data analytics.',
      credits: 54,
      totalEarned: 59,
      totalSpent: 5,
      referralCode: 'SNEHA25',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  users.forEach(u => db.createUser(u));

  // Welcome bonus transactions for each user
  users.forEach(u => {
    db.data.transactions.push({
      id: 'tx_init_' + u.id,
      userId: u.id,
      amount: 50,
      balanceAfter: 50,
      type: 'EARNED',
      reason: 'WELCOME_BONUS',
      description: 'Initial 50 welcome bonus credits for joining TimeShare.',
      createdAt: u.createdAt
    });
  });

  // 2. High-Quality Real 20+ Minute Educational Videos (Top YouTube channels, play directly on site!)
  const videos = [
    {
      id: 'vid_react_architecture',
      creatorId: 'usr_rahul',
      creatorName: 'Rahul Sharma',
      creatorAvatar: PERMANENT_DEMO_AVATARS.rahul,
      title: 'Full-Stack React & Node.js: Production Architecture & Performance',
      description: 'Comprehensive 24-minute masterclass covering full-stack system architecture, WebSocket integration, custom React state hooks, and memory leak prevention in mission-critical applications. Built with practical live code walkthroughs.',
      category: 'Technology & Code',
      level: 'Advanced',
      tags: ['React', 'Node.js', 'System Design', 'WebSockets', 'Full Stack'],
      videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
      duration: 1440, // 24 minutes
      status: 'APPROVED',
      aiScore: 96,
      aiReasoning: 'AI Verified: High-density educational programming lecture. Demonstrates production architectural patterns and algorithmic efficiency. Verified for 5 credits reward.',
      unlockCount: 28,
      completionsCount: 12,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
    },
    {
      id: 'vid_genai_llms',
      creatorId: 'usr_rahul',
      creatorName: 'Rahul Sharma',
      creatorAvatar: PERMANENT_DEMO_AVATARS.rahul,
      title: 'Generative AI, Large Language Models & Prompt Engineering Masterclass',
      description: 'In-depth 32-minute deep dive into building production LLM pipelines. Master semantic caching, retrieval-augmented generation (RAG), vector embeddings, token optimization, and autonomous multi-agent tool execution by Andrej Karpathy.',
      category: 'Data Science & AI',
      level: 'Advanced',
      tags: ['AI', 'LLM', 'RAG', 'Prompt Engineering', 'LangChain'],
      videoUrl: 'https://www.youtube.com/watch?v=zjkBMFhNj_g',
      thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
      duration: 1920, // 32 minutes
      status: 'APPROVED',
      aiScore: 98,
      aiReasoning: 'AI Verified: Cutting-edge artificial intelligence lecture with vector databases and structured retrieval pipelines.',
      unlockCount: 42,
      completionsCount: 19,
      createdAt: new Date(Date.now() - 19 * 86400000).toISOString()
    },
    {
      id: 'vid_figma_systems',
      creatorId: 'usr_priya',
      creatorName: 'Priya Verma',
      creatorAvatar: PERMANENT_DEMO_AVATARS.priya,
      title: 'Design Systems & Interactive Prototyping in Figma: Zero to Production',
      description: 'Learn how to build resilient multi-brand design systems in Figma. Covers auto-layout 5.0, variables, responsive typography tokens, component variants, and handoff protocols for engineering teams in this 22-minute masterclass.',
      category: 'Design & UI/UX',
      level: 'Intermediate',
      tags: ['Figma', 'UI/UX', 'Design Systems', 'Prototyping', 'Variables'],
      videoUrl: 'https://www.youtube.com/watch?v=jwCmIBJ8J_4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
      duration: 1320, // 22 minutes
      status: 'APPROVED',
      aiScore: 94,
      aiReasoning: 'AI Verified: Structured design education with tokenization, component hierarchy, and accessibility guidelines.',
      unlockCount: 34,
      completionsCount: 16,
      createdAt: new Date(Date.now() - 17 * 86400000).toISOString()
    },
    {
      id: 'vid_flutter_mobile',
      creatorId: 'usr_priya',
      creatorName: 'Priya Verma',
      creatorAvatar: PERMANENT_DEMO_AVATARS.priya,
      title: 'Cross-Platform Mobile App Architecture with Flutter & Dart',
      description: 'A 27-minute complete guide to building fluid 120 FPS iOS and Android applications. Learn Riverpod state management, custom painting, background isolates, and clean architecture boundaries.',
      category: 'Technology & Code',
      level: 'Intermediate',
      tags: ['Flutter', 'Mobile', 'Dart', 'iOS', 'Android'],
      videoUrl: 'https://www.youtube.com/watch?v=VPvVD8t02U8',
      thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
      duration: 1620, // 27 minutes
      status: 'APPROVED',
      aiScore: 93,
      aiReasoning: 'AI Verified: Cross-platform mobile development tutorial with state management and native bridge integration.',
      unlockCount: 25,
      completionsCount: 11,
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
    },
    {
      id: 'vid_algorithmic_trading',
      creatorId: 'usr_aman',
      creatorName: 'Aman Singh',
      creatorAvatar: PERMANENT_DEMO_AVATARS.aman,
      title: 'Algorithmic Trading & Quantitative Financial Modeling with Python',
      description: 'Master quantitative finance fundamentals in 25 minutes: backtesting momentum strategies, risk management, Sharpe ratio calculations, and building automated execution pipelines using Pandas and NumPy.',
      category: 'Finance & Business',
      level: 'Advanced',
      tags: ['Finance', 'Trading', 'Python', 'Quant', 'Algorithms'],
      videoUrl: 'https://www.youtube.com/watch?v=xfzGZB4HhEE',
      thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
      duration: 1500, // 25 minutes
      status: 'APPROVED',
      aiScore: 92,
      aiReasoning: 'AI Verified: Advanced financial analytics and programming curriculum. Clear mathematical formulas and strategy backtesting.',
      unlockCount: 22,
      completionsCount: 9,
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
    },
    {
      id: 'vid_cybersecurity',
      creatorId: 'usr_aman',
      creatorName: 'Aman Singh',
      creatorAvatar: PERMANENT_DEMO_AVATARS.aman,
      title: 'Ethical Hacking, Network Penetration & Cyber Defense Mastery',
      description: 'Extensive 38-minute hands-on security masterclass. Covers OWASP Top 10 vulnerabilities, packet inspection with Wireshark, SQL injection mitigation, JWT exploitation defense, and zero-trust perimeter configuration.',
      category: 'Technology & Code',
      level: 'Advanced',
      tags: ['Cybersecurity', 'Ethical Hacking', 'Security', 'OWASP', 'Penetration Testing'],
      videoUrl: 'https://www.youtube.com/watch?v=3Kq1MIfTWCE',
      thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
      duration: 2280, // 38 minutes
      status: 'APPROVED',
      aiScore: 97,
      aiReasoning: 'AI Verified: In-depth defensive cybersecurity course with threat models and cryptographic validation.',
      unlockCount: 36,
      completionsCount: 15,
      createdAt: new Date(Date.now() - 13 * 86400000).toISOString()
    },
    {
      id: 'vid_classical_raga_fusion',
      creatorId: 'usr_ananya',
      creatorName: 'Ananya Patel',
      creatorAvatar: PERMANENT_DEMO_AVATARS.ananya,
      title: 'Indian Classical Ragas & Contemporary Guitar Fusion Mastery',
      description: 'Discover how to apply Raag Yaman and Bhairav scales across standard guitar tuning. Includes 21 minutes of fretboard visualization, meend (sliding techniques), microtonal embellishments, and rhythm cycles (Teentaal).',
      category: 'Music & Audio',
      level: 'Intermediate',
      tags: ['Music Theory', 'Guitar', 'Indian Classical', 'Raga', 'Fusion'],
      videoUrl: 'https://www.youtube.com/watch?v=gYq95F2Q91E',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      duration: 1260, // 21 minutes
      status: 'APPROVED',
      aiScore: 89,
      aiReasoning: 'AI Verified: High educational music pedagogy. Teaches scale degrees, microtones, and improvisational framework.',
      unlockCount: 19,
      completionsCount: 8,
      createdAt: new Date(Date.now() - 11 * 86400000).toISOString()
    },
    {
      id: 'vid_data_pipelines_spark',
      creatorId: 'usr_arjun',
      creatorName: 'Arjun Kumar',
      creatorAvatar: PERMANENT_DEMO_AVATARS.arjun,
      title: 'Distributed Data Pipelines, Kafka & Apache Spark Fundamentals',
      description: 'A deep-dive 26-minute lecture into stream processing. Learn partitioned topics in Kafka, exactly-once processing semantics, Spark Structured Streaming transformations, and real-time dashboard analytics.',
      category: 'Data Science & AI',
      level: 'Advanced',
      tags: ['Data Engineering', 'Apache Spark', 'Kafka', 'Big Data', 'Streaming'],
      videoUrl: 'https://www.youtube.com/watch?v=_C8kWso4ne4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      duration: 1560, // 26 minutes
      status: 'APPROVED',
      aiScore: 95,
      aiReasoning: 'AI Verified: Highly technical distributed engineering guide with clear architectural diagrams and code demonstrations.',
      unlockCount: 31,
      completionsCount: 14,
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
    },
    {
      id: 'vid_devops_k8s',
      creatorId: 'usr_arjun',
      creatorName: 'Arjun Kumar',
      creatorAvatar: PERMANENT_DEMO_AVATARS.arjun,
      title: 'Kubernetes, Docker Containers & Cloud DevOps on AWS',
      description: 'A practical 28-minute masterclass covering multi-stage Docker builds, Kubernetes Pod scheduling, ingress controllers, Helm charts, and continuous delivery with GitHub Actions.',
      category: 'Technology & Code',
      level: 'Intermediate',
      tags: ['DevOps', 'Kubernetes', 'Docker', 'AWS', 'Cloud'],
      videoUrl: 'https://www.youtube.com/watch?v=X48VuDVv0do',
      thumbnailUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
      duration: 1680, // 28 minutes
      status: 'APPROVED',
      aiScore: 96,
      aiReasoning: 'AI Verified: Practical infrastructure engineering tutorial with declarative manifests and cluster scaling.',
      unlockCount: 30,
      completionsCount: 13,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
    },
    {
      id: 'vid_technical_seo_growth',
      creatorId: 'usr_sneha',
      creatorName: 'Sneha Gupta',
      creatorAvatar: PERMANENT_DEMO_AVATARS.sneha,
      title: 'Technical SEO, Core Web Vitals & Data-Driven Growth Marketing',
      description: 'Master enterprise search optimization in 23 minutes. Analyze crawl budgets, schema markups, JavaScript rendering for search engines, and conversion rate optimization (CRO) funnel experiments.',
      category: 'Marketing & Growth',
      level: 'Beginner',
      tags: ['SEO', 'Core Web Vitals', 'Growth Marketing', 'Analytics', 'CRO'],
      videoUrl: 'https://www.youtube.com/watch?v=DvwS7cV9GmQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      duration: 1380, // 23 minutes
      status: 'APPROVED',
      aiScore: 91,
      aiReasoning: 'AI Verified: Data-backed growth methodology, algorithmic ranking factors, and structured markup guidelines.',
      unlockCount: 18,
      completionsCount: 7,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: 'vid_financial_statements',
      creatorId: 'usr_sneha',
      creatorName: 'Sneha Gupta',
      creatorAvatar: PERMANENT_DEMO_AVATARS.sneha,
      title: 'Financial Statement Analysis, Balance Sheets & Equity Valuation',
      description: 'Demystifying corporate finance in 29 minutes: read cash flow statements, analyze operating margins, compute DCF models, and evaluate company fundamentals like an equity research analyst.',
      category: 'Finance & Business',
      level: 'Beginner',
      tags: ['Finance', 'Accounting', 'Valuation', 'Investing', 'Balance Sheet'],
      videoUrl: 'https://www.youtube.com/watch?v=WEDIj9JBTC8',
      thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
      duration: 1740, // 29 minutes
      status: 'APPROVED',
      aiScore: 93,
      aiReasoning: 'AI Verified: Core accounting literacy, financial ratios, and valuation methodologies.',
      unlockCount: 21,
      completionsCount: 10,
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
    },
    // Seed an example PENDING video awaiting Admin human review
    {
      id: 'vid_quantum_pending',
      creatorId: 'usr_rahul',
      creatorName: 'Rahul Sharma',
      creatorAvatar: PERMANENT_DEMO_AVATARS.rahul,
      title: 'Quantum Computing Algorithms & Qiskit Fundamentals',
      description: 'Introductory overview of qubits, superposition, entanglement, and Shor algorithm simulation using IBM Qiskit framework.',
      category: 'Data Science & AI',
      level: 'Advanced',
      tags: ['Quantum', 'Qiskit', 'Physics', 'Algorithms'],
      videoUrl: 'https://www.youtube.com/watch?v=RrUTwq5XCwg',
      thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
      duration: 1250, // 20.8 minutes
      status: 'PENDING',
      aiScore: 68,
      aiReasoning: 'AI Classification: Moderate educational confidence (Score: 68/100). Queued for Admin Human Review to verify lesson quality and prerequisite clarity.',
      unlockCount: 0,
      completionsCount: 0,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    // Seed an example REJECTED entertainment video
    {
      id: 'vid_meme_rejected',
      creatorId: 'usr_aman',
      creatorName: 'Aman Singh',
      creatorAvatar: PERMANENT_DEMO_AVATARS.aman,
      title: 'Funny Gaming Fails & Meme Compilation #42',
      description: 'Just some funny clips and gaming moments recorded during weekend gameplay. Hope you guys laugh!',
      category: 'Entertainment',
      level: 'Beginner',
      tags: ['Meme', 'Funny', 'Gaming'],
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
      duration: 600,
      status: 'REJECTED',
      aiScore: 18,
      aiReasoning: 'AI Classification: Non-educational content detected (meme, funny moments). Content resembles entertainment instead of a structured educational skill lesson.',
      unlockCount: 0,
      completionsCount: 0,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ];

  videos.forEach(v => db.createVideo(v));

  // 3. Quizzes for all approved educational courses
  const quizzes = [
    {
      id: 'quiz_react',
      videoId: 'vid_react_architecture',
      questions: [
        {
          id: 'q1',
          question: 'What is the most effective approach to prevent state tearing and unnecessary re-renders in large React applications?',
          options: [
            'Using memoization with useMemo/useCallback and atomic state slices',
            'Storing all application state inside a single monolithic window global',
            'Calling forceUpdate() after every component render',
            'Completely avoiding functional components'
          ],
          correctOption: 0
        },
        {
          id: 'q2',
          question: 'When establishing persistent WebSocket connections with Node.js, how should heartbeat pings be managed?',
          options: [
            'Client sends periodic heartbeat tokens, and server disconnects stale sockets after timeout threshold',
            'Heartbeats are unnecessary if HTTP/2 is enabled',
            'Closing and reconnecting the socket every 2 seconds',
            'Relying exclusively on browser refresh'
          ],
          correctOption: 0
        },
        {
          id: 'q3',
          question: 'In production Express architectures, what layer ensures idempotency for credit transactions?',
          options: [
            'Database atomic constraints and unique transaction reference tokens',
            'Pure client-side localStorage checks',
            'Arbitrary setTimeout delays before sending responses',
            'Allowing concurrent duplicate write requests'
          ],
          correctOption: 0
        }
      ]
    },
    {
      id: 'quiz_genai',
      videoId: 'vid_genai_llms',
      questions: [
        {
          id: 'q1',
          question: 'What is the primary role of Retrieval-Augmented Generation (RAG) in LLM applications?',
          options: [
            'Supplying relevant contextual knowledge from private vector databases before prompting the model',
            'Training neural networks entirely from scratch with zero data',
            'Decreasing GPU temperature without fans',
            'Converting audio directly to analog FM radio waves'
          ],
          correctOption: 0
        },
        {
          id: 'q2',
          question: 'Which similarity metric is most commonly computed across dense vector embeddings in high dimensions?',
          options: [
            'Cosine Similarity or Dot Product',
            'Levenshtein string edit distance',
            'Alphabetical sorting',
            'Simple addition of integer indices'
          ],
          correctOption: 0
        },
        {
          id: 'q3',
          question: 'Why are Autonomous Agents equipped with Tool-Use interfaces?',
          options: [
            'To execute external APIs, search databases, and calculate deterministic mathematical computations',
            'To render video games at 60 FPS',
            'To replace human keyboard hardware',
            'To bypass authentication security'
          ],
          correctOption: 0
        }
      ]
    },
    {
      id: 'quiz_figma',
      videoId: 'vid_figma_systems',
      questions: [
        {
          id: 'q1',
          question: 'What advantage do Figma Variables offer over standard Style tokens?',
          options: [
            'Variables allow dynamic mode switching (e.g. Light/Dark mode) and scoping to specific property types',
            'Variables can only store raw hex codes without aliases',
            'Variables cannot be shared across team libraries',
            'Variables automatically generate backend SQL queries'
          ],
          correctOption: 0
        },
        {
          id: 'q2',
          question: 'How does Auto-Layout "Min/Max width" constraints improve responsive design?',
          options: [
            'It prevents components from breaking viewport bounds on varying screen resolutions',
            'It forces all elements to remain fixed at 1920px',
            'It disables touch gestures on mobile devices',
            'It removes component padding automatically'
          ],
          correctOption: 0
        },
        {
          id: 'q3',
          question: 'What is the purpose of Component Variants in design system architecture?',
          options: [
            'Grouping related states (hover, active, disabled) under a unified component entity',
            'Duplicating entire design frames for every single button',
            'Converting raster bitmaps to vector SVG paths',
            'Executing client-side JavaScript in Figma'
          ],
          correctOption: 0
        }
      ]
    },
    {
      id: 'quiz_flutter',
      videoId: 'vid_flutter_mobile',
      questions: [
        {
          id: 'q1',
          question: 'What rendering architecture allows Flutter to achieve smooth 120 FPS across platforms?',
          options: [
            'Impeller / Skia rendering engine that directly draws UI onto the screen without native OEM view bridges',
            'Translating code to HTML/CSS inside a hidden webview',
            'Using remote cloud streaming for every frame',
            'Executing interpreted Python scripts'
          ],
          correctOption: 0
        },
        {
          id: 'q2',
          question: 'Why are Dart Isolates preferred for heavy CPU operations in Flutter?',
          options: [
            'Isolates run on separate threads with independent memory heaps, preventing UI jank on the main event loop',
            'Isolates disable battery consumption',
            'Isolates allow unlimited background memory usage',
            'Isolates require zero Dart code'
          ],
          correctOption: 0
        },
        {
          id: 'q3',
          question: 'What is the main benefit of the Riverpod state management package?',
          options: [
            'Compile-safe provider access without BuildContext dependency and built-in caching/disposal',
            'It writes raw SQLite tables automatically',
            'It replaces the Dart compiler',
            'It forces all widgets to be stateless'
          ],
          correctOption: 0
        }
      ]
    },
    {
      id: 'quiz_quant',
      videoId: 'vid_algorithmic_trading',
      questions: [
        {
          id: 'q1',
          question: 'What does the Sharpe Ratio measure in portfolio evaluation?',
          options: [
            'Risk-adjusted return relative to the risk-free rate and portfolio volatility',
            'The total number of executed transactions per minute',
            'The absolute maximum gross revenue irrespective of drawdowns',
            'The brokerage fee discount percentage'
          ],
          correctOption: 0
        },
        {
          id: 'q2',
          question: 'Why is survivorship bias a critical hazard when backtesting historical market data?',
          options: [
            'Ignoring delisted or bankrupt companies creates an artificially optimistic performance illusion',
            'It causes Python arrays to overflow memory limits',
            'It guarantees positive returns on every trade',
            'It only affects foreign currency pairs'
          ],
          correctOption: 0
        },
        {
          id: 'q3',
          question: 'Which risk mitigation mechanism restricts the maximum loss on an open position?',
          options: [
            'Strict Stop-Loss orders and position-sizing allocation rules',
            'Doubling leverage after every losing trade',
            'Trading only during volatile market open moments',
            'Disabling trade logging'
          ],
          correctOption: 0
        }
      ]
    },
    {
      id: 'quiz_cyber',
      videoId: 'vid_cybersecurity',
      questions: [
        {
          id: 'q1',
          question: 'Which defense effectively neutralizes SQL Injection vulnerabilities in web applications?',
          options: [
            'Parameterized queries and prepared statements that treat inputs strictly as data, never code',
            'Storing passwords in plaintext for faster lookup',
            'Disabling SSL certificates',
            'Allowing unfiltered user input directly into SQL strings'
          ],
          correctOption: 0
        },
        {
          id: 'q2',
          question: 'What is the purpose of HTTP-Only and SameSite cookie flags?',
          options: [
            'Protecting session tokens from Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF)',
            'Accelerating 4K video downloads',
            'Allowing third-party advertisers to track browsing history',
            'Disabling HTTPS encryption'
          ],
          correctOption: 0
        },
        {
          id: 'q3',
          question: 'In Zero Trust Network Architecture, what is the core premise?',
          options: [
            'Never trust, always verify: every request is authenticated and authorized regardless of origin',
            'Trust all traffic originating from within the local office Wi-Fi',
            'Disable all firewalls to boost bandwidth',
            'Share root credentials across all servers'
          ],
          correctOption: 0
        }
      ]
    },
    {
      id: 'quiz_music',
      videoId: 'vid_classical_raga_fusion',
      questions: [
        {
          id: 'q1',
          question: 'What is the defining characteristic note of Raag Yaman in Indian Classical music?',
          options: [
            'Teevra Ma (augmented fourth / sharp 4th)',
            'Komal Re (minor second)',
            'Komal Dha (minor sixth)',
            'Omission of the tonic Sa'
          ],
          correctOption: 0
        },
        {
          id: 'q2',
          question: 'How is "Meend" executed on the guitar fretboard to evoke classical vocal ornamentation?',
          options: [
            'A smooth continuous slide or fret bend connecting two notes without discrete pick attacks',
            'Aggressive staccato palm muting',
            'Playing open strings out of tune',
            'Striking the strings with a wooden bow'
          ],
          correctOption: 0
        },
        {
          id: 'q3',
          question: 'In Teentaal, how many beats (Matras) comprise one complete rhythmic cycle?',
          options: [
            '16 beats divided into 4 equal vibhags',
            '7 beats',
            '10 beats',
            '12 beats'
          ],
          correctOption: 0
        }
      ]
    },
    {
      id: 'quiz_spark',
      videoId: 'vid_data_pipelines_spark',
      questions: [
        {
          id: 'q1',
          question: 'What is the role of Kafka Consumer Groups in distributed event streaming?',
          options: [
            'Allowing parallel processing by assigning specific partitions exclusively to individual consumers in the group',
            'Encrypting HTTP headers before sending payloads',
            'Deleting messages immediately after the first read',
            'Compressing audio files for podcast delivery'
          ],
          correctOption: 0
        },
        {
          id: 'q2',
          question: 'What ensures fault tolerance and data recovery in Apache Spark Resilient Distributed Datasets (RDDs)?',
          options: [
            'Lineage graphs that record the exact sequence of transformations to recompute lost partitions',
            'Writing all intermediate data to magnetic tape backup',
            'Restarting the entire cluster from scratch on any error',
            'Disabling memory caching'
          ],
          correctOption: 0
        },
        {
          id: 'q3',
          question: 'What technique mitigates data skew during heavy Spark shuffle operations?',
          options: [
            'Salting join keys and adjusting shuffle partition counts',
            'Eliminating all filter clauses before joins',
            'Decreasing executor memory to 256MB',
            'Using single-threaded execution'
          ],
          correctOption: 0
        }
      ]
    },
    {
      id: 'quiz_devops',
      videoId: 'vid_devops_k8s',
      questions: [
        {
          id: 'q1',
          question: 'What is the function of a Kubernetes Ingress Controller?',
          options: [
            'Managing external HTTP/S routing and load balancing into cluster services based on host and path rules',
            'Storing database passwords in unencrypted plain text files',
            'Restarting physical server motherboards',
            'Converting Dockerfiles to zip archives'
          ],
          correctOption: 0
        },
        {
          id: 'q2',
          question: 'Why are Multi-Stage Docker builds beneficial in container productionization?',
          options: [
            'They exclude build dependencies and compilers from the final image, radically minimizing container size and attack surface',
            'They run multiple operating systems simultaneously in one container',
            'They disable Docker security patches',
            'They require no container registry'
          ],
          correctOption: 0
        },
        {
          id: 'q3',
          question: 'What does a Kubernetes Horizontal Pod Autoscaler (HPA) monitor to scale replicas?',
          options: [
            'CPU/Memory utilization metrics or custom application metrics like requests per second',
            'The total number of git commits in the main branch',
            'The physical office room temperature',
            'The speed of user mouse movements'
          ],
          correctOption: 0
        }
      ]
    },
    {
      id: 'quiz_seo',
      videoId: 'vid_technical_seo_growth',
      questions: [
        {
          id: 'q1',
          question: 'Which metric measures the visual stability of a webpage as elements load?',
          options: [
            'Cumulative Layout Shift (CLS)',
            'First Input Delay (FID)',
            'Largest Contentful Paint (LCP)',
            'Time to First Byte (TTFB)'
          ],
          correctOption: 0
        },
        {
          id: 'q2',
          question: 'Why is canonical URL specification crucial in ecommerce websites?',
          options: [
            'It tells search crawlers which master URL to index, preventing duplicate content penalties',
            'It makes images load at 4K resolution',
            'It removes CSS stylesheets for faster indexing',
            'It automatically creates backlink outreach emails'
          ],
          correctOption: 0
        },
        {
          id: 'q3',
          question: 'What schema markup format is strongly recommended by Google for semantic structured data?',
          options: [
            'JSON-LD embedded in script tags',
            'Flash SWF objects',
            'Inline PDF frames',
            'Unformatted plain text comments'
          ],
          correctOption: 0
        }
      ]
    },
    {
      id: 'quiz_finance_statements',
      videoId: 'vid_financial_statements',
      questions: [
        {
          id: 'q1',
          question: 'What is the fundamental accounting equation that must always balance on a balance sheet?',
          options: [
            'Assets = Liabilities + Shareholders Equity',
            'Revenue = Gross Profit - Income Tax',
            'Cash Flow = Total Debt * Interest Rate',
            'Inventory = Accounts Payable / 2'
          ],
          correctOption: 0
        },
        {
          id: 'q2',
          question: 'Why is Free Cash Flow (FCF) often considered more informative than Net Income?',
          options: [
            'FCF reflects actual cash generated after capital expenditures, undistorted by non-cash accrual accounting items',
            'Net Income is always equal to cash in the bank',
            'FCF ignores all taxes and debts',
            'FCF is only used for cryptocurrency companies'
          ],
          correctOption: 0
        },
        {
          id: 'q3',
          question: 'In Discounted Cash Flow (DCF) valuation, what does the Discount Rate (WACC) represent?',
          options: [
            'The required rate of return that compensates investors for risk and the time value of money',
            'The percentage discount offered during sales promotions',
            'The annual depreciation rate of office desks',
            'The bank overdraft penalty fee'
          ],
          correctOption: 0
        }
      ]
    }
  ];

  quizzes.forEach(q => db.createOrUpdateQuiz(q));

  // 4. Pre-unlock courses & establish active transaction history
  db.recordSkillUnlock('usr_rahul', 'vid_figma_systems', 5);
  db.data.transactions.push({
    id: 'tx_seed_rahul_unlock',
    userId: 'usr_rahul',
    amount: -5,
    balanceAfter: 65,
    type: 'SPENT',
    reason: 'SKILL_UNLOCKED',
    videoId: 'vid_figma_systems',
    videoTitle: 'Design Systems & Interactive Prototyping in Figma',
    description: 'Unlocked skill course: Design Systems in Figma',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
  });

  db.recordSkillUnlock('usr_priya', 'vid_algorithmic_trading', 5);
  db.data.transactions.push({
    id: 'tx_seed_priya_unlock',
    userId: 'usr_priya',
    amount: -5,
    balanceAfter: 58,
    type: 'SPENT',
    reason: 'SKILL_UNLOCKED',
    videoId: 'vid_algorithmic_trading',
    videoTitle: 'Algorithmic Trading & Quantitative Financial Modeling',
    description: 'Unlocked skill course: Algorithmic Trading with Python',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  });

  // Sneha Gupta watches and completes Rahul's React course
  db.saveWatchProgress('usr_sneha', 'vid_react_architecture', {
    currentTime: 1400,
    duration: 1440,
    percentage: 97.2,
    heartbeatCount: 45,
    maxPlaybackSpeed: 1.25
  });
  db.recordLearnerCompletion('usr_sneha', 'vid_react_architecture', 100, 'usr_rahul');
  db.data.transactions.push({
    id: 'tx_seed_sneha_learner',
    userId: 'usr_sneha',
    amount: 1,
    balanceAfter: 54,
    type: 'EARNED',
    reason: 'VIDEO_COMPLETED',
    videoId: 'vid_react_architecture',
    videoTitle: 'Full-Stack React & Node.js: Production Architecture & Performance',
    description: 'Completed skill video "Full-Stack React & Node.js" (Score: 100%)',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  });
  db.data.transactions.push({
    id: 'tx_seed_rahul_royalty',
    userId: 'usr_rahul',
    amount: 2,
    balanceAfter: 70,
    type: 'EARNED',
    reason: 'CREATOR_ROYALTY',
    videoId: 'vid_react_architecture',
    videoTitle: 'Full-Stack React & Node.js: Production Architecture & Performance',
    counterpartyId: 'usr_sneha',
    description: 'Royalty: Sneha Gupta completed your skill video',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  });

  // Save changes to disk
  db.saveSync();
  console.log(`[Seed] Database successfully populated with permanent monogram avatars and real 20+ min YouTube courses!`);
}

// Run if called directly
runSeed().catch(console.error);
