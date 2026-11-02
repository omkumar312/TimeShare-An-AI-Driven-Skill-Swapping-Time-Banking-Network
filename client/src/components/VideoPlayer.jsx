import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Award,
  Tv
} from 'lucide-react';
import { api } from '../services/api';
import { formatDuration } from './VideoCard';

// Utility to extract YouTube video ID from any YouTube URL
export function getYouTubeVideoId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=[&]v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  }
  // Alternate check for clean /watch?v=
  if (url.includes('v=')) {
    const parts = url.split('v=')[1]?.split('&')[0];
    if (parts && parts.length === 11) return parts;
  }
  if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/')[1]?.split('?')[0];
    if (parts && parts.length === 11) return parts;
  }
  if (url.includes('embed/')) {
    const parts = url.split('embed/')[1]?.split('?')[0];
    if (parts && parts.length === 11) return parts;
  }
  return null;
}

export default function VideoPlayer({
  video,
  initialProgress = 0,
  onProgressUpdate,
  onEligibleForQuiz,
  onVideoEnded,
  onOpenQuiz,
  isCompleted = false,
  isCreator = false
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const ytPlayerRef = useRef(null);

  const ytVideoId = getYouTubeVideoId(video?.videoUrl);

  const [isPlaying, setIsPlaying] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video?.duration || 1440); // 24 min default
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [maxPercentage, setMaxPercentage] = useState(initialProgress);
  const [watchWarning, setWatchWarning] = useState(null);
  const [videoError, setVideoError] = useState(false);

  // Sync duration when metadata loads (native video)
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const vidDur = videoRef.current.duration;
      if (vidDur && !isNaN(vidDur) && isFinite(vidDur)) {
        setDuration(vidDur);
      }
    }
  };

  // Heartbeat to server to record genuine progress & prevent fake views
  const sendHeartbeat = useCallback(async (time, dur, pct, speed) => {
    if (!video?.id) return;
    try {
      const res = await api.recordProgress(video.id, {
        currentTime: time,
        duration: dur,
        percentage: pct,
        playbackSpeed: speed
      });
      if (res.isEligibleForQuiz && onEligibleForQuiz) {
        onEligibleForQuiz(true);
      }
    } catch (err) {
      console.warn('[Heartbeat Error]:', err.message);
    }
  }, [video?.id, onEligibleForQuiz]);

  // YouTube IFrame API Setup for 20+ min YouTube channel videos
  useEffect(() => {
    if (!ytVideoId) return;

    // Load YouTube API script if not present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    let progressInterval = null;

    const initPlayer = () => {
      try {
        if (!window.YT || !window.YT.Player) return;

        ytPlayerRef.current = new window.YT.Player(`yt-embed-${video.id}`, {
          videoId: ytVideoId,
          playerVars: {
            rel: 0,
            modestbranding: 1,
            controls: 1,
            disablekb: 0,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              const dur = event.target.getDuration();
              if (dur && dur > 0) {
                setDuration(dur);
              }
            },
            onStateChange: (event) => {
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === 1) {
                setIsPlaying(true);
              } else if (event.data === 0) {
                setIsPlaying(false);
                setVideoEnded(true);
                setMaxPercentage(100);
                if (onProgressUpdate) onProgressUpdate(100);
                if (onEligibleForQuiz) onEligibleForQuiz(true);
                if (onVideoEnded) onVideoEnded();
              } else {
                setIsPlaying(false);
              }
            }
          }
        });
      } catch (e) {
        console.warn('YouTube Player init error:', e);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    // Periodic watcher for YouTube playback
    progressInterval = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const curr = ytPlayerRef.current.getCurrentTime();
          const dur = ytPlayerRef.current.getDuration() || duration || 1440;
          setCurrentTime(curr);
          if (dur > 0 && dur !== duration) setDuration(dur);

          const pct = Math.min(100, (curr / dur) * 100);
          if (pct > maxPercentage) {
            setMaxPercentage(pct);
            if (onProgressUpdate) onProgressUpdate(pct);
            if (pct >= 90 && onEligibleForQuiz) {
              onEligibleForQuiz(true);
            }
          }

          // Check if user has reached the end or 99%+
          if (dur > 0 && (curr >= dur - 2 || pct >= 99)) {
            setVideoEnded(true);
            if (onProgressUpdate) onProgressUpdate(100);
            if (onEligibleForQuiz) onEligibleForQuiz(true);
            if (onVideoEnded) onVideoEnded();
          }

          if (isPlaying) {
            sendHeartbeat(curr, dur, pct, playbackRate);
          }
        } catch (e) {
          // ignore transient poll error
        }
      }
    }, 4000);

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      try {
        if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
          ytPlayerRef.current.destroy();
        }
      } catch (e) {}
    };
  }, [ytVideoId, video.id, maxPercentage, isPlaying, duration, playbackRate, onProgressUpdate, onEligibleForQuiz, sendHeartbeat]);

  // Native HTML5 Video Playback Handler
  const togglePlay = () => {
    if (ytVideoId) return; // YouTube handles controls internally
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Auto-play error or video stream fallback:', err);
        setVideoError(true);
        setIsPlaying(true);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    const dur = duration > 0 ? duration : 1440;
    const currentPercent = Math.min(100, (curr / dur) * 100);

    if (currentPercent > maxPercentage) {
      setMaxPercentage(currentPercent);
      if (onProgressUpdate) onProgressUpdate(currentPercent);
      if (currentPercent >= 90 && onEligibleForQuiz) {
        onEligibleForQuiz(true);
      }
    }
  };

  // Periodic heartbeat timer for Native video
  useEffect(() => {
    if (ytVideoId || !isPlaying) return;

    const interval = setInterval(() => {
      const curr = videoRef.current ? videoRef.current.currentTime : currentTime;
      const dur = duration || 1440;
      const pct = Math.min(100, (curr / dur) * 100);
      sendHeartbeat(curr, dur, pct, playbackRate);
    }, 6000);

    return () => clearInterval(interval);
  }, [ytVideoId, isPlaying, currentTime, duration, playbackRate, sendHeartbeat]);

  // Handle seeking with Anti-Skip validation for native player
  const handleSeek = (e) => {
    if (ytVideoId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    const targetPercent = (newTime / duration) * 100;
    if (targetPercent > maxPercentage + 5 && !isCompleted && !isCreator) {
      setWatchWarning('Anti-Cheat Notice: Skipping ahead does not count towards the 90% watch threshold for earning credits.');
      setTimeout(() => setWatchWarning(null), 5000);
    }

    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const thresholdReached = maxPercentage >= 90;

  return (
    <div className="flex flex-col rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
      {/* 90% Watch Threshold Progress Header Bar */}
      <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-300">
            Course Length: <span className="font-mono text-white">{formatDuration(duration)}</span> (20+ min internal video play)
          </span>
          {ytVideoId && (
            <span className="text-[10px] font-mono bg-red-600/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/30 flex items-center gap-1">
              <Tv className="w-3 h-3" /> YouTube Channel Source
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {thresholdReached ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>90% Watched: Quiz Unlocked (+1 Credit)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Watch Progress:</span>
              <span className="font-mono font-bold text-amber-400">{Math.round(maxPercentage)}% / 90%</span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">(Watch 90% to earn 1 credit)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Video Viewport */}
      <div
        ref={containerRef}
        className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden group select-none"
      >
        {/* Anti-cheat warning alert banner */}
        {watchWarning && (
          <div className="absolute top-4 left-4 right-4 z-30 p-3 rounded-xl bg-rose-950/90 border border-rose-500/60 text-rose-200 text-xs flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{watchWarning}</span>
          </div>
        )}

        {/* 1. YouTube Embedded Video Player directly inside TimeShare */}
        {ytVideoId ? (
          <div className="w-full h-full relative">
            <div id={`yt-embed-${video.id}`} className="w-full h-full" />
            {/* Direct fallback iframe if YouTube API script takes a moment */}
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ytVideoId}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&rel=0&modestbranding=1`}
              title={video.title}
              className="w-full h-full border-0 absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : !videoError ? (
          /* 2. Native HTML5 Video Element for MP4/WebM uploads */
          <video
            ref={videoRef}
            src={video?.videoUrl}
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => {
              setIsPlaying(false);
              setVideoEnded(true);
              setMaxPercentage(100);
              if (onProgressUpdate) onProgressUpdate(100);
              if (onEligibleForQuiz) onEligibleForQuiz(true);
              if (onVideoEnded) onVideoEnded();
            }}
            onError={() => {
              console.log('[Player] Native video error, activating lecture slide mode');
              setVideoError(true);
            }}
            playsInline
          />
        ) : (
          /* 3. Fallback High-Fidelity Educational Lecture Stream */
          <div
            onClick={togglePlay}
            className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-between p-8 cursor-pointer relative"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-xs uppercase font-mono tracking-widest text-indigo-300">
                  Live Masterclass Feed
                </span>
              </div>
              <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-lg">
                TimeShare HD Video Engine
              </span>
            </div>

            <div className="my-auto text-center max-w-2xl mx-auto space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-mono font-bold border border-amber-500/30">
                {video?.category}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {video?.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
                {video?.description}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/10">
              <span>Internal 20+ Min Session</span>
              <span>Playing on site</span>
            </div>
          </div>
        )}

        {/* End-of-Video Skill Mastery Quiz Trigger Overlay */}
        {videoEnded && !isCompleted && !isCreator && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-3 shadow-glow-brand">
              <Award className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-extrabold text-white mb-1.5 flex items-center gap-2">
              🎉 Video Completed! Skill Quiz Ready
            </h3>
            <p className="text-xs text-slate-300 max-w-md mb-4 leading-relaxed">
              You finished watching this skill lesson! Complete the short 3-question quiz to verify what you learned, claim your <strong className="text-amber-400">+1 Credit</strong> reward, and award <strong className="text-indigo-400">+2 Credits</strong> royalty to {video?.creatorName}!
            </p>
            <button
              onClick={() => {
                if (onOpenQuiz) onOpenQuiz();
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-glow-credit transition-all scale-105 active:scale-95 flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Take Skill Quiz Now & Claim 1 Credit</span>
              <span>&rarr;</span>
            </button>
          </div>
        )}

        {/* Big Center Play/Pause Overlay for Native Video */}
        {!ytVideoId && !isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer z-10 transition-opacity"
          >
            <div className="w-20 h-20 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-glow-brand transform hover:scale-110 transition-all">
              <Play className="w-8 h-8 ml-1" />
            </div>
          </div>
        )}

        {/* Video Controls Bar Overlay for Native Video */}
        {!ytVideoId && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Progress Slider with 90% Threshold Pin */}
            <div
              onClick={handleSeek}
              className="relative w-full h-2.5 bg-slate-800/80 rounded-full cursor-pointer mb-3 overflow-hidden group/bar"
            >
              <div
                className={`h-full transition-all ${
                  thresholdReached ? 'bg-emerald-400' : 'bg-indigo-500'
                }`}
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
              <div
                className="absolute top-0 bottom-0 bg-indigo-300/30 pointer-events-none"
                style={{ width: `${maxPercentage}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-1 bg-amber-400 z-10"
                style={{ left: '90%' }}
                title="90% threshold for credit reward"
              />
            </div>

            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime = Math.max(0, currentTime - 10);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  title="Rewind 10s"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5">
                  <button onClick={toggleMute} className="p-1 hover:text-indigo-300">
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="font-mono text-slate-300 text-xs ml-2">
                  <span>{formatDuration(currentTime)}</span>
                  <span className="text-slate-500 mx-1">/</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white/10 rounded-lg p-0.5 font-mono text-[11px]">
                  {[1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`px-1.5 py-0.5 rounded ${
                        playbackRate === speed
                          ? 'bg-indigo-600 font-bold text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar Footer for YouTube Videos */}
      {ytVideoId && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Course Watch Progress:</span>
            <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  thresholdReached ? 'bg-emerald-400' : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(100, maxPercentage)}%` }}
              />
            </div>
            <span className="font-mono font-bold text-amber-400">{Math.round(maxPercentage)}%</span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            {thresholdReached
              ? '🎉 90% Completed - Click "Take Quiz" below!'
              : `${Math.max(0, 90 - Math.round(maxPercentage))}% more needed for quiz unlock`}
          </div>
        </div>
      )}
    </div>
  );
}
