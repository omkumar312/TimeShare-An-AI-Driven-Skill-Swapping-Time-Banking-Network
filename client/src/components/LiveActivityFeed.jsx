import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Video, UserPlus, Radio } from 'lucide-react';
import { getSocket } from '../services/socket';

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState([
    {
      id: 'act_init_1',
      type: 'achievement',
      text: 'Sneha Gupta completed Full-Stack React Architecture and earned 1 credit!',
      time: 'Just now'
    },
    {
      id: 'act_init_2',
      type: 'royalty',
      text: 'Rahul Sharma received 2 creator credits as Sneha finished the course.',
      time: '2m ago'
    },
    {
      id: 'act_init_3',
      type: 'video',
      text: 'AI Content Analyzer verified "Design Systems in Figma" (+5 credits to Priya).',
      time: '5m ago'
    }
  ]);

  useEffect(() => {
    const socket = getSocket();

    const handleAchievement = (data) => {
      setActivities(prev => [
        {
          id: 'act_' + Date.now(),
          type: 'achievement',
          text: data.message || `${data.learnerName} mastered "${data.videoTitle}"!`,
          time: 'Just now'
        },
        ...prev.slice(0, 5)
      ]);
    };

    const handleNewVideo = (data) => {
      if (data.status === 'APPROVED') {
        setActivities(prev => [
          {
            id: 'act_' + Date.now(),
            type: 'video',
            text: `Skill course "${data.title}" by ${data.creatorName} is now live!`,
            time: 'Just now'
          },
          ...prev.slice(0, 5)
        ]);
      }
    };

    const handleNewUser = (data) => {
      setActivities(prev => [
        {
          id: 'act_' + Date.now(),
          type: 'user',
          text: data.message || `${data.name} joined TimeShare (+50 Bonus)!`,
          time: 'Just now'
        },
        ...prev.slice(0, 5)
      ]);
    };

    socket.on('platform:achievement', handleAchievement);
    socket.on('platform:new_video', handleNewVideo);
    socket.on('platform:new_user', handleNewUser);

    return () => {
      socket.off('platform:achievement', handleAchievement);
      socket.off('platform:new_video', handleNewVideo);
      socket.off('platform:new_user', handleNewUser);
    };
  }, []);

  return (
    <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 font-mono">
          Live Skill Exchange Network
        </span>
      </div>

      <div className="space-y-1.5">
        {activities.slice(0, 3).map((act) => (
          <div
            key={act.id}
            className="flex items-center justify-between text-xs text-slate-300 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 animate-in fade-in slide-in-from-right-2"
          >
            <div className="flex items-center gap-2 truncate">
              {act.type === 'achievement' && <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              {act.type === 'royalty' && <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
              {act.type === 'video' && <Video className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              {act.type === 'user' && <UserPlus className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
              <span className="truncate">{act.text}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{act.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
