# TimeShare ⏳ - AI-Powered Skill-Learning Platform

**TimeShare** is a modern full-stack web application designed for a peer-to-peer educational skill micro-economy. Users upload educational skill videos, earn credits, and spend those credits to learn new skills from other users—without any paywalls.

---

## ⚡ The TimeShare Credit Protocol

| Action | Credits | Verified By |
|---|---|---|
| **New User Registration** | **+50 Credits** | Automated Welcome Bonus |
| **Referral Link Activation** | **+25 Free Credits** | 1-Click Referral Link Claim |
| **Share Educational Video** | **+5 Credits** | AI Educational Classifier or Admin Review |
| **Watch 90% + Pass Quiz** | **+1 Credit** | Anti-Cheat Watch Engine + Interactive Quiz |
| **Unique Learner Completion** | **+2 Credits** | Creator Royalty per Finished Student |
| **Unlock New Skill Course** | **-5 Credits** | Lifelong access to 20+ min masterclass |

---

## 🤖 AI Learning Advisor Chatbot (24/7)

TimeShare features a built-in **AI Skill Mentor**:
- **Smart Recommendations:** Context-aware suggestions matching user requests (e.g., coding, design, quant finance, music, cloud DevOps).
- **Credit Guidance:** Clarifies all platform rules, referral perks, and anti-cheat policies.
- **Direct Navigation:** Clickable course cards directly inside the conversation drawer.
- **Instant Launcher:** Floating button accessible on any page with quick prompt chips.

---

## 🎁 1-Click Referral System (25 Free Credits)

- Every user receives a unique referral code and link (e.g. `/?ref=RAHUL25`).
- **Claim 25 Free Credits by clicking the link:** When a friend clicks the link, TimeShare detects the code and offers a **1-click claim** for 25 free credits!
- **Creator Kickback:** The referrer also receives **10 credits** for growing the community.
- Includes 1-click share to **WhatsApp**, **Twitter/X**, and **Telegram**.

---

## 🔍 Multi-Dimensional Filter & Discovery Engine

- **Duration Filter:**
  - All Durations (20m+)
  - 20 - 30 Minutes
  - 30 - 45 Minutes
  - 45+ Minutes (Deep Dive)
- **Skill Level Filter:** Beginner, Intermediate, Advanced.
- **Category Filter:** Technology, UI/UX Design, Finance & Quant, AI & Data Science, DevOps & Cloud, Marketing & SEO, Music.
- **Access Filter:** All Courses, Unlocked Only, Available to Unlock (5 Credits), Mastered (+1 Credit Earned).
- **Sort By:** Most Popular, Longest Duration (20m+), Newest.

---

## 👥 Peer Skill Upload & Real-Time Community Distribution

TimeShare is built on a vibrant peer-to-peer learning ecosystem:
- **Instant Community Availability:** Whenever **any user** uploads a new skill course, it is processed by the AI content verifier. Upon approval, it is **immediately broadcast across all connected users** via WebSockets (`platform:new_video`).
- **Live Feed Updates:** Other learners see a live alert banner: *"🔥 New Skill Added by [Creator]: [Title]! Learn This Skill →"* and the course appears at the top of their feed ready to be unlocked for 5 credits.
- **Creator Royalties:** Whenever any other user completes their lesson and passes the quiz, the creator automatically earns **+2 Credits** royalty in real time.

---

## 🎯 End-of-Video Skill Mastery Quiz (Auto-Triggered)

- **Automatic Completion Trigger:** When a student finishes watching the 20+ min lesson (or reaches $\ge 90\%$ playback threshold), the in-player completion overlay activates and automatically prompts the **Skill Mastery Quiz**.
- **Always-Present 3-Question Quiz:** Every course (including newly uploaded peer videos) automatically includes or generates a tailored 3-question skill verification test.
- **Instant Credit Settlement:** Passing the quiz with $\ge 60\%$ immediately deposits **+1 Credit** into the student's wallet, awards **+2 Credits** royalty to the course instructor, triggers a confetti celebration, and marks the skill as *Mastered*.

---

## 🎬 20+ Minute Educational Video Masterclasses (In-App Playback)

All videos play **directly inside TimeShare** using our custom embedded dual-mode player (supporting YouTube channel videos and uploaded mp4 files). Users **never leave the platform** or redirect to external sites. The player continuously logs genuine watch time, enforcing the **90% watch threshold** before unlocking the quiz:

1. **Full-Stack React & Node.js: Production Architecture & Performance** (24 mins) - *Rahul Sharma*
2. **Complete Advanced Figma Design System & Micro-Interactions** (26 mins) - *Priya Verma*
3. **Algorithmic Trading & Financial Risk Modeling in Python** (28 mins) - *Aman Singh*
4. **Indian Classical Fusion & Acoustic Fingerstyle Guitar Masterclass** (25 mins) - *Ananya Patel*
5. **Real-Time Distributed Event Streaming with Apache Kafka** (30 mins) - *Arjun Kumar*
6. **Modern Technical SEO & Semantic Content Architecture Masterclass** (22 mins) - *Sneha Gupta*
7. **Machine Learning Math: Linear Algebra & Gradient Descent from Scratch** (32 mins) - *Rahul Sharma*
8. **Building Production REST APIs with Express, Socket.IO & JWT** (27 mins) - *Rahul Sharma*
9. **Advanced CSS Grid, Flexbox & Responsive Layout Engineering** (21 mins) - *Priya Verma*
10. **Deep Learning & Neural Networks: Building GPT from Scratch** (48 mins) - *Aman Singh*
11. **Cloud Architecture & Docker Containerization Crash Course** (35 mins) - *Arjun Kumar*
12. **Next.js 14 Full Course: Server Actions & App Router** (42 mins) - *Sneha Gupta*
13. **Golang Backend Development Crash Course: High Concurrency** (36 mins) - *Vikram Aditya*

---

## 🎨 Permanent Vector Monogram Profile Avatars

All temporary, broken, or placeholder profile images have been replaced with **permanent, high-resolution SVG monogram avatars**:
- Deterministic vector graphics rendered directly in client and server with zero external network dependencies.
- Distinct color gradients per user with custom two-letter monogram initials.
- Special crimson & gold insignia for Platform Administrators.
- Automatic image error fallback handlers via `UserAvatar.jsx`.

---

## 🛡️ Anti-Cheat & Fraud Prevention Engine

1. **Anti-Fake Views & 90% Threshold Enforcement:** Continuous heartbeat tracking; skipping forward does not count towards the 90% milestone.
2. **Self-Watching Rewards Disallowed:** Creators cannot claim completion rewards or royalties on their own lessons.
3. **Idempotency & Duplicate Prevention:** Learners can only claim completion credits once per video.
4. **Playback Speed Abuse Monitoring:** Playback speeds $> 3.0\times$ are blocked and logged.

---

## 👥 Realistic Indian Demo Accounts (1-Click Switcher)

- **Rahul Sharma** (Full-Stack Architect) — `RAHUL25`
- **Priya Verma** (Principal Product Designer) — `PRIYA25`
- **Aman Singh** (Quantitative Analyst & Trader) — `AMAN25`
- **Ananya Patel** (Classical Musician & Producer) — `ANANYA25`
- **Arjun Kumar** (Staff Data Engineer) — `ARJUN25`
- **Sneha Gupta** (Growth Marketing Director) — `SNEHA25`
- **Vikram Aditya** (Platform Admin) — `ADMIN25`

---

## 🚀 How to Run

### Install & Seed
```bash
npm run install:all
npm run seed
```

### Start Development Server
```bash
npm run dev
```
- API & Socket.IO: `http://localhost:5000`
- React Client: `http://localhost:5173`

### Run 14-Step Integration Test Suite
```bash
cd server && node test_e2e.js
```
=======
# TimeShare-An-AI-Driven-Skill-Swapping-Time-Banking-Network

**PREVIEW IMG:**

<img width="1656" height="1035" alt="Screenshot 2026-11-02 230714" src="https://github.com/user-attachments/assets/bf7c4f42-aa6e-4bbf-829c-e904d9992e7f" />

<img width="1422" height="1132" alt="Screenshot 2026-11-02 230846" src="https://github.com/user-attachments/assets/8513f31c-af41-416e-8e09-2bbda6882c2a" />

<img width="632" height="587" alt="Screenshot 2026-11-02 230824" src="https://github.com/user-attachments/assets/42d487d9-8919-4753-918b-6aeb498885b4" />

<img width="1512" height="1045" alt="Screenshot 2026-11-02 230935" src="https://github.com/user-attachments/assets/15b0eafa-ed76-40ce-b584-63c5971af301" />

<img width="1141" height="916" alt="Screenshot 2026-11-02 231010" src="https://github.com/user-attachments/assets/daba6826-da38-44e7-940a-f537b927dbe3" />

<img width="498" height="697" alt="Screenshot 2026-11-02 230812" src="https://github.com/user-attachments/assets/774246d5-3e41-4889-a33f-301c37c90de6" />

<img width="1421" height="866" alt="Screenshot 2026-11-02 231111" src="https://github.com/user-attachments/assets/10f4950b-69b9-4ff8-94ae-dbbed491a26e" />

<img width="916" height="677" alt="Screenshot 2026-11-02 231131" src="https://github.com/user-attachments/assets/2bff7b94-cc9d-4ed2-8719-d6035156a93d" />

<img width="695" height="593" alt="Screenshot 2026-11-02 231053" src="https://github.com/user-attachments/assets/7dd20535-8952-4995-9d88-e3f33b90aa71" />
>>>>>>> b9de57632d80d496a010bc6c5d70c8bc9e6238a3
