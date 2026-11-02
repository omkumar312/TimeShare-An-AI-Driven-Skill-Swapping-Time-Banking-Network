import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import VideoCard from '../components/VideoCard';
import UserAvatar from '../components/UserAvatar';
import {
  User,
  UploadCloud,
  CheckCircle2,
  Clock,
  Sparkles,
  Coins,
  Award,
  Video,
  AlertTriangle,
  Play
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage({ onOpenUpload }) {
  const { user } = useAuth();
  const [myVideos, setMyVideos] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' | 'learning'

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        setLoading(true);
        const [userVids, allVids] = await Promise.all([
          api.getVideos({ creatorId: user.id }),
          api.getVideos()
        ]);
        setMyVideos(userVids);
        setAllVideos(allVids);
      } catch (err) {
        console.error('[Dashboard] Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const completedVideos = allVideos.filter(v => v.isCompleted);
  const inProgressVideos = allVideos.filter(v => v.isUnlocked && !v.isCompleted && v.creatorId !== user?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <UserAvatar
            src={user?.avatar}
            name={user?.name}
            role={user?.role}
            size="xl"
            className="w-20 h-20 rounded-2xl border-2 border-indigo-500/40 shadow-glow-brand"
          />
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold text-white">{user?.name}</h1>
              {user?.role === 'admin' && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-indigo-400 font-medium">{user?.headline || 'TimeShare Skill Creator'}</p>
            <p className="text-xs text-slate-400 max-w-md">{user?.bio || 'Exploring skills and teaching others.'}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="p-3 px-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
            <span className="text-[10px] text-amber-400 uppercase font-mono font-bold block">Wallet Balance</span>
            <span className="text-2xl font-extrabold font-mono text-white flex items-center justify-center gap-1">
              <Coins className="w-5 h-5 text-amber-400" /> {user?.credits || 0}
            </span>
          </div>

          <button
            onClick={onOpenUpload}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 text-white font-bold text-xs shadow-glow-brand flex items-center gap-2 transition-all"
          >
            <UploadCloud className="w-4 h-4 text-amber-300" />
            <span>Upload New Skill</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('uploads')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'uploads'
              ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>My Uploaded Videos ({myVideos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('learning')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'learning'
              ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>My Learning Progress ({completedVideos.length + inProgressVideos.length})</span>
        </button>
      </div>

      {/* Tab Content: Uploads */}
      {activeTab === 'uploads' && (
        <div className="space-y-4">
          {myVideos.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
              <UploadCloud className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No skill videos uploaded yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload your first educational masterclass to earn 5 credits instantly upon AI approval and 2 credits for every learner completion!
              </p>
              <button
                onClick={onOpenUpload}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Upload Skill Video (+5 Credits)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between p-4 space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                        {video.category}
                      </span>
                      {video.status === 'APPROVED' ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> APPROVED (+5 CR)
                        </span>
                      ) : video.status === 'PENDING' ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> PENDING REVIEW
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> REJECTED
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white line-clamp-1">{video.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{video.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono">
                      {video.completionsCount || 0} unique completions
                    </span>
                    <Link
                      to={`/watch/${video.id}`}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      View &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Learning */}
      {activeTab === 'learning' && (
        <div className="space-y-6">
          {/* Mastered Skills */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Completed & Mastered Skills ({completedVideos.length})
            </h3>
            {completedVideos.length === 0 ? (
              <p className="text-xs text-slate-500">No mastered skills yet. Watch 90% of a video and pass the quiz to earn your credit reward!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {completedVideos.map(v => (
                  <VideoCard key={v.id} video={v} onUnlockClick={() => {}} />
                ))}
              </div>
            )}
          </div>

          {/* In-Progress / Unlocked */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-indigo-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> In-Progress / Unlocked Courses ({inProgressVideos.length})
            </h3>
            {inProgressVideos.length === 0 ? (
              <p className="text-xs text-slate-500">No other unlocked courses currently in progress.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {inProgressVideos.map(v => (
                  <VideoCard key={v.id} video={v} onUnlockClick={() => {}} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
