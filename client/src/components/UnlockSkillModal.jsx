import React, { useState } from 'react';
import { Lock, Coins, AlertCircle, Sparkles, X, Check } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';

export default function UnlockSkillModal({ video, onClose, onUnlocked }) {
  const { user, addUnlockedVideo } = useAuth();
  const { fetchWallet, showToast } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!video) return null;

  const currentBalance = user?.credits || 0;
  const UNLOCK_COST = 5;
  const canAfford = currentBalance >= UNLOCK_COST;
  const balanceAfter = currentBalance - UNLOCK_COST;

  const handleUnlock = async () => {
    setError(null);
    try {
      setLoading(true);
      const res = await api.unlockVideo(video.id);
      addUnlockedVideo(video.id);
      await fetchWallet();
      showToast(`🎉 Unlocked "${video.title}" for 5 credits!`, 'info', -5);
      if (onUnlocked) onUnlocked(video.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to unlock course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 mx-auto">
          <Lock className="w-7 h-7" />
        </div>

        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl font-extrabold text-white">Unlock Skill Course</h2>
          <p className="text-xs text-slate-400 leading-relaxed px-2">
            Spend <span className="text-amber-400 font-bold">5 Credits</span> to permanently unlock and learn:
          </p>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-left">
            <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{video.title}</h4>
            <p className="text-[11px] text-indigo-400 mt-0.5">Instructor: {video.creatorName}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Ledger preview */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs mb-6">
          <div className="flex items-center justify-between text-slate-300">
            <span>Your Available Balance:</span>
            <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" /> {currentBalance} Credits
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Unlock Cost:</span>
            <span className="font-mono font-bold text-rose-400">-5 Credits</span>
          </div>
          <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-slate-200 font-semibold">
            <span>Balance After Unlock:</span>
            <span className="font-mono text-indigo-300">{canAfford ? balanceAfter : 'Insufficient'} Credits</span>
          </div>
        </div>

        {canAfford ? (
          <div className="space-y-2">
            <button
              onClick={handleUnlock}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-glow-brand transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Processing Transaction...' : 'Confirm Unlock (Spend 5 Credits)'}
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-400 hover:text-white font-medium text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs text-center">
              You need at least 5 credits to unlock this course. Share a skill video to earn 5 credits!
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
