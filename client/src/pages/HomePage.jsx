import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import UnlockSkillModal from '../components/UnlockSkillModal';
import LiveActivityFeed from '../components/LiveActivityFeed';
import {
  Sparkles,
  Search,
  Coins,
  Award,
  UploadCloud,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  Filter,
  Clock,
  SlidersHorizontal,
  Gift,
  XCircle,
  BarChart2
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Technology & Code',
  'Design & UI/UX',
  'Finance & Business',
  'Music & Audio',
  'Data Science & AI',
  'Marketing & Growth'
];

export default function HomePage({ onOpenUpload, onOpenReferral }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSkillAlert, setNewSkillAlert] = useState(null);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [durationRange, setDurationRange] = useState('All'); // 'All' | '20-30' | '30-45' | '45plus' | 'under20'
  const [selectedLevel, setSelectedLevel] = useState('All'); // 'All' | 'Beginner' | 'Intermediate' | 'Advanced'
  const [accessFilter, setAccessFilter] = useState('All'); // 'All' | 'unlocked' | 'locked' | 'completed'
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'duration_desc' | 'newest'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [unlockTargetVideo, setUnlockTargetVideo] = useState(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await api.getVideos({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        durationRange: durationRange === 'All' ? undefined : durationRange,
        level: selectedLevel === 'All' ? undefined : selectedLevel,
        sortBy
      });

      let filtered = data;
      if (accessFilter === 'unlocked') {
        filtered = filtered.filter(v => v.isUnlocked);
      } else if (accessFilter === 'locked') {
        filtered = filtered.filter(v => !v.isUnlocked);
      } else if (accessFilter === 'completed') {
        filtered = filtered.filter(v => v.isCompleted);
      }

      setVideos(filtered);
    } catch (err) {
      console.error('[HomePage] Error loading videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [selectedCategory, searchQuery, durationRange, selectedLevel, accessFilter, sortBy]);

  // Real-time Socket.IO: when ANY user uploads a new skill, update the catalog live!
  useEffect(() => {
    const socket = getSocket();
    const handleLiveSkillPublished = (payload) => {
      if (payload.status === 'APPROVED') {
        setNewSkillAlert(payload);
        fetchVideos();
        if (payload.video) {
          setVideos(prev => [payload.video, ...prev.filter(v => v.id !== payload.video.id)]);
        }
      }
    };
    socket.on('platform:new_video', handleLiveSkillPublished);
    return () => {
      socket.off('platform:new_video', handleLiveSkillPublished);
    };
  }, []);

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    durationRange !== 'All' ||
    selectedLevel !== 'All' ||
    accessFilter !== 'All' ||
    searchQuery !== '' ||
    sortBy !== 'popular';

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setDurationRange('All');
    setSelectedLevel('All');
    setAccessFilter('All');
    setSortBy('popular');
  };

  return (
    <div className="min-h-screen pb-16">
      {/* 25 Free Referral Credits Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-indigo-600 to-indigo-700 py-2.5 px-4 text-center text-xs text-white font-semibold flex items-center justify-center gap-2 shadow-md">
        <Gift className="w-4 h-4 text-amber-300 animate-bounce shrink-0" />
        <span>
          🎁 <strong>Special Promotion:</strong> Get <strong>25 Free Credits</strong> simply by clicking a referral link!
        </span>
        <button
          onClick={onOpenReferral}
          className="ml-2 px-3 py-1 rounded-full bg-white text-slate-900 font-extrabold text-[11px] hover:bg-amber-100 transition-colors shadow-sm"
        >
          Claim & Share &rarr;
        </button>
      </div>

      {/* Real-time New Skill Notification Banner (When ANY user uploads a skill) */}
      {newSkillAlert && (
        <div className="bg-gradient-to-r from-emerald-600 via-indigo-600 to-indigo-700 py-3 px-4 text-center text-xs text-white font-semibold flex flex-wrap items-center justify-center gap-3 shadow-lg border-b border-white/10 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              🔥 <strong>New Skill Added by {newSkillAlert.creatorName}:</strong> "{newSkillAlert.title}"
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigate(`/watch/${newSkillAlert.videoId}`);
                setNewSkillAlert(null);
              }}
              className="px-3.5 py-1 rounded-full bg-white text-slate-900 font-extrabold text-[11px] hover:bg-emerald-100 transition-colors shadow-sm flex items-center gap-1"
            >
              Learn This Skill &rarr;
            </button>
            <button
              onClick={() => setNewSkillAlert(null)}
              className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10"
              title="Dismiss"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-indigo-950/20 via-slate-950 to-slate-950 pt-10 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left Hero Pitch */}
            <div className="max-w-2xl text-center lg:text-left space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                AI-Verified Peer Skill Exchange • 20+ Min Lessons
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Master High-Value Skills. <br />
                <span className="text-gradient-gold">Earn & Exchange Credits.</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                TimeShare is an educational micro-economy where you earn credits by sharing skills and watching verified educational masterclasses. No paywalls—learn purely with the credits you earn.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={onOpenUpload}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-glow-brand flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95"
                >
                  <UploadCloud className="w-4 h-4 text-amber-300" />
                  <span>Share Skill Video</span>
                  <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                    +5 Credits
                  </span>
                </button>

                <button
                  onClick={onOpenReferral}
                  className="px-5 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span>Refer Friends (+25 Credits Free)</span>
                </button>
              </div>
            </div>

            {/* Right Hero: Credit Economy Flow Cards */}
            <div className="w-full lg:w-96 space-y-3">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-2.5">
                <h3 className="text-xs font-extrabold uppercase font-mono tracking-wider text-slate-300 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" /> TimeShare Credit Protocol
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">1. Share Skill Lesson</div>
                      <div className="text-[11px] text-slate-400">AI / Admin verified educational video</div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      +5 Credits
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">2. Watch 90% + Pass Quiz</div>
                      <div className="text-[11px] text-slate-400">Anti-cheat threshold verification</div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      +1 Credit
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">3. Creator Royalty</div>
                      <div className="text-[11px] text-slate-400">Every unique learner who completes</div>
                    </div>
                    <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                      +2 Credits
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">4. Referral Link Bonus</div>
                      <div className="text-[11px] text-slate-400">1-click free credits via link</div>
                    </div>
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                      +25 Credits
                    </span>
                  </div>
                </div>
              </div>

              {/* Live activity ticker */}
              <LiveActivityFeed />
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Section */}
      <div id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Controls Toolbar: Search & Filter Options */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <span>Available 20+ Minute Skill Masterclasses</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold">
                  {videos.length} Courses
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                In-depth comprehensive lectures uploaded by peers & instructors. When any video is watched to completion, the skill quiz automatically appears!
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search skills, topics, tags..."
                  className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Advanced Filter Toggle Button */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all ${
                  showAdvancedFilters || hasActiveFilters
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                )}
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-glow-brand'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Advanced Filters Expandable Drawer */}
          {showAdvancedFilters && (
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                {/* 1. Duration Filter (20+ min videos) */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" /> Duration (20m+ Learning)
                  </label>
                  <select
                    value={durationRange}
                    onChange={(e) => setDurationRange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500"
                  >
                    <option value="All">All Durations (20m+)</option>
                    <option value="20-30">20 - 30 Minutes</option>
                    <option value="30-45">30 - 45 Minutes</option>
                    <option value="45plus">45+ Minutes (Deep Dive)</option>
                    <option value="under20">Under 20 Minutes</option>
                  </select>
                </div>

                {/* 2. Skill Level */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                    <BarChart2 className="w-3 h-3 text-emerald-400" /> Skill Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500"
                  >
                    <option value="All">All Levels</option>
                    <option value="Beginner">Beginner Friendly</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced / Production</option>
                  </select>
                </div>

                {/* 3. Access Status */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                    <Coins className="w-3 h-3 text-amber-400" /> Course Access
                  </label>
                  <select
                    value={accessFilter}
                    onChange={(e) => setAccessFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500"
                  >
                    <option value="All">All Courses</option>
                    <option value="unlocked">Unlocked / Ready to Watch</option>
                    <option value="locked">Available to Unlock (5 Credits)</option>
                    <option value="completed">Mastered (+1 Credit Earned)</option>
                  </select>
                </div>

                {/* 4. Sort By */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-indigo-400" /> Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="duration_desc">Longest Duration (20m+)</option>
                    <option value="newest">Newest Added</option>
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400 font-mono">
                    Showing {videos.length} matching masterclasses
                  </span>
                  <button
                    onClick={resetFilters}
                    className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Video Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-video bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="py-16 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No skill videos match these filters</h3>
            <p className="text-xs text-slate-400">
              Try adjusting your duration, level, or category filter to discover available 20+ minute lessons.
            </p>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-glow-brand"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onUnlockClick={(v) => setUnlockTargetVideo(v)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Unlock Modal */}
      {unlockTargetVideo && (
        <UnlockSkillModal
          video={unlockTargetVideo}
          onClose={() => setUnlockTargetVideo(null)}
          onUnlocked={() => {
            fetchVideos();
          }}
        />
      )}
    </div>
  );
}
