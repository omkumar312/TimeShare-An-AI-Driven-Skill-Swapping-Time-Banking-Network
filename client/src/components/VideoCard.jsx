import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Lock, CheckCircle, Clock, Users, Sparkles, Award } from 'lucide-react';
import UserAvatar from './UserAvatar';

export function formatDuration(seconds) {
  if (!seconds) return '20:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function VideoCard({ video, onUnlockClick }) {
  const navigate = useNavigate();

  const isUnlocked = video.isUnlocked;
  const isCompleted = video.isCompleted;
  const progress = Math.min(100, Math.round(video.currentProgress || 0));

  const handleClick = (e) => {
    e.preventDefault();
    if (isUnlocked) {
      navigate(`/watch/${video.id}`);
    } else {
      onUnlockClick(video);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />

        {/* Duration Badge (approx 20min+ video) */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[11px] font-mono font-medium text-slate-200 flex items-center gap-1 border border-white/10">
          <Clock className="w-3 h-3 text-indigo-400" />
          <span>{formatDuration(video.duration)}</span>
        </div>

        {/* Category Pill */}
        <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 backdrop-blur-md text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
          {video.category}
        </div>

        {/* Lock / Unlock Overlay Badge */}
        <div className="absolute top-2.5 right-2.5">
          {isCompleted ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Mastered (+1)
            </span>
          ) : isUnlocked ? (
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/40 flex items-center gap-1">
              <Play className="w-3 h-3" /> Ready
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 flex items-center gap-1 shadow-sm">
              <Lock className="w-3 h-3" /> 5 Credits
            </span>
          )}
        </div>

        {/* Progress Bar if watched */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                progress >= 90 ? 'bg-emerald-400' : 'bg-indigo-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Creator info */}
          <div className="flex items-center gap-2 mb-2">
            <UserAvatar
              src={video.creatorAvatar}
              name={video.creatorName}
              size="xs"
            />
            <span className="text-xs text-slate-400 font-medium truncate">
              {video.creatorName}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
            {video.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
            {video.description}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" title="Learners who completed this video">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>{video.completionsCount || 0} completed</span>
            </span>
          </div>

          <div>
            {isUnlocked ? (
              <span className="text-indigo-400 font-semibold flex items-center gap-1">
                {progress >= 90 ? 'Quiz Ready' : 'Watch Now'} &rarr;
              </span>
            ) : (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                Unlock Skill &rarr;
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
