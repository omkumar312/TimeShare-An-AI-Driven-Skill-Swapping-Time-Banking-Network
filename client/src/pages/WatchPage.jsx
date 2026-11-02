import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import VideoPlayer from '../components/VideoPlayer';
import QuizModal from '../components/QuizModal';
import UnlockSkillModal from '../components/UnlockSkillModal';
import UserAvatar from '../components/UserAvatar';
import { generatePermanentAvatarSvg } from '../utils/avatarUtils';
import { formatDuration } from '../components/VideoCard';
import {
  Lock,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  Users,
  ShieldCheck,
  Coins,
  ChevronLeft
} from 'lucide-react';

export default function WatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { fetchWallet } = useWallet();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [eligibleForQuiz, setEligibleForQuiz] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [autoQuizShown, setAutoQuizShown] = useState(false);

  // Live Peer Study Room Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [peerCount, setPeerCount] = useState(3);

  const fetchVideoDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getVideoById(id);
      setVideo(data);
      setCurrentProgress(data.currentProgress || 0);
      if (data.currentProgress >= 90 && !data.isCompleted && !data.isCreator) {
        setEligibleForQuiz(true);
      }
    } catch (err) {
      setError(err.message || 'Video not found or access error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoDetails();
  }, [id]);

  // Socket.io Video Study Room connection
  useEffect(() => {
    if (!id || !user) return;
    const socket = getSocket();

    socket.emit('join:video', {
      videoId: id,
      userName: user.name,
      userAvatar: user.avatar
    });

    // Seed realistic study room messages for peer learning vibe
    setChatMessages([
      {
        id: 'msg_seed_1',
        senderName: 'Rahul Sharma',
        senderAvatar: generatePermanentAvatarSvg('Rahul Sharma'),
        text: 'Welcome everyone! Focus especially on the second half of the lesson where we implement the core algorithm.',
        createdAt: new Date(Date.now() - 15 * 60000).toISOString()
      },
      {
        id: 'msg_seed_2',
        senderName: 'Ananya Patel',
        senderAvatar: generatePermanentAvatarSvg('Ananya Patel'),
        text: 'The explanation at 12:40 clarifies the entire architecture. Taking detailed notes!',
        createdAt: new Date(Date.now() - 8 * 60000).toISOString()
      }
    ]);

    const handleNewMessage = (msg) => {
      setChatMessages(prev => [...prev, msg]);
    };

    const handlePeerJoined = (peer) => {
      setPeerCount(prev => prev + 1);
    };

    socket.on('chat:new_message', handleNewMessage);
    socket.on('peer:joined', handlePeerJoined);

    return () => {
      socket.emit('leave:video', id);
      socket.off('chat:new_message', handleNewMessage);
      socket.off('peer:joined', handlePeerJoined);
    };
  }, [id, user]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !user) return;

    const socket = getSocket();
    socket.emit('chat:message', {
      videoId: id,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      text: messageInput.trim()
    });
    setMessageInput('');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="aspect-video bg-slate-900/60 rounded-3xl animate-pulse border border-slate-800" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Course Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'This video might have been removed.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
        >
          Back to Skills Catalog
        </button>
      </div>
    );
  }

  // If user has not unlocked this video yet
  if (!video.isUnlocked) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
              Locked Skill Course
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{video.title}</h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              This ~{Math.round(video.duration / 60)} minute educational masterclass is locked. Spend 5 credits from your wallet to unlock full lifelong access.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowUnlockModal(true)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-credit transition-all transform hover:scale-[1.02]"
            >
              Unlock Now for 5 Credits
            </button>
            <Link
              to="/"
              className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
            >
              Back to Catalog
            </Link>
          </div>
        </div>

        {showUnlockModal && (
          <UnlockSkillModal
            video={video}
            onClose={() => setShowUnlockModal(false)}
            onUnlocked={() => {
              fetchVideoDetails();
              fetchWallet();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Skills</span>
        </Link>

        {video.isCompleted && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" /> You Mastered This Skill (+1 Credit Earned)
          </span>
        )}
      </div>

      {/* Main Grid: Video Player on Left, Live Study Room Chat on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Player & Quiz Trigger */}
        <div className="lg:col-span-2 space-y-6">
          {/* Internal Video Player */}
          <VideoPlayer
            video={video}
            initialProgress={currentProgress}
            isCompleted={video.isCompleted}
            isCreator={video.isCreator}
            onProgressUpdate={(pct) => {
              setCurrentProgress(pct);
              if (pct >= 90 && !video?.isCompleted && !video?.isCreator && !autoQuizShown) {
                setEligibleForQuiz(true);
                setAutoQuizShown(true);
                setShowQuizModal(true);
              }
            }}
            onEligibleForQuiz={(isEligible) => {
              setEligibleForQuiz(isEligible);
              if (isEligible && !video?.isCompleted && !video?.isCreator && !autoQuizShown) {
                setAutoQuizShown(true);
                setShowQuizModal(true);
              }
            }}
            onVideoEnded={() => {
              setEligibleForQuiz(true);
              if (!video?.isCompleted && !video?.isCreator) {
                setShowQuizModal(true);
              }
            }}
            onOpenQuiz={() => setShowQuizModal(true)}
          />

          {/* Quiz Unlock Banner (After video completion or reaching 90%) */}
          {eligibleForQuiz && !video.isCompleted && !video.isCreator && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-glow-brand">
                  <Award className="w-7 h-7 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    🎉 Video Completed! Skill Quiz Ready
                  </h3>
                  <p className="text-xs text-slate-300">
                    Complete the short 3-question skill quiz to claim your <span className="text-amber-400 font-bold">1 Credit</span> reward and send <span className="text-indigo-400 font-bold">2 Credits</span> royalty to the creator!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowQuizModal(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-glow-credit transition-all shrink-0 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>Take Quiz & Earn 1 Credit</span>
                <span>&rarr;</span>
              </button>
            </div>
          )}

          {/* Self-Watching Notice */}
          {video.isCreator && (
            <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>
                You are the creator of this video! You earn <strong className="text-amber-400">2 credits</strong> whenever a unique learner completes your lesson.
              </span>
            </div>
          )}

          {/* Video Metadata & Syllabus */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                {video.category}
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Duration: {formatDuration(video.duration)} (20+ min)
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
              {video.title}
            </h1>

            {/* Creator Profile */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <UserAvatar
                src={video.creatorAvatar}
                name={video.creatorName}
                size="md"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-200">{video.creatorName}</h4>
                <p className="text-[11px] text-slate-400">TimeShare Verified Skill Instructor</p>
              </div>
            </div>

            {/* Description & Learning Outcomes */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Course Syllabus & Objectives
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {video.description}
              </p>
            </div>

            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                {video.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Study Room & Peer Chat */}
        <div className="space-y-6">
          <div className="h-[600px] flex flex-col rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl">
            {/* Chat Header */}
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Live Peer Study Room
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{peerCount} active learners</span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <UserAvatar
                      src={msg.senderAvatar}
                      name={msg.senderName}
                      size="xs"
                    />
                    <span className="text-[11px] font-bold text-indigo-300">{msg.senderName}</span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 leading-snug">
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Ask fellow learners or share a note..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuizModal && (
        <QuizModal
          video={video}
          quiz={video.quiz}
          onClose={() => setShowQuizModal(false)}
          onSuccess={() => {
            fetchVideoDetails();
            fetchWallet();
          }}
        />
      )}
    </div>
  );
}
