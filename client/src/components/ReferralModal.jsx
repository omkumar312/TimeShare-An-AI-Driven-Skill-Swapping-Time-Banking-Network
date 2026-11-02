import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Gift,
  Coins,
  Copy,
  Check,
  Share2,
  Sparkles,
  Users,
  X,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { api } from '../services/api';

export default function ReferralModal({ isOpen, onClose, initialReferralCode = null }) {
  const { user } = useAuth();
  const { fetchWallet, showToast } = useWallet();

  const [copied, setCopied] = useState(false);
  const [claimCode, setClaimCode] = useState(initialReferralCode || '');
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const referralCode = user?.referralCode || (user ? `${user.name.split(' ')[0].toUpperCase()}25` : 'TIMESHARE25');
  const referralLink = `${window.location.origin}/?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('Referral link copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleClaim = async (codeToClaim) => {
    const code = codeToClaim || claimCode;
    if (!code) {
      setError('Please enter a referral code.');
      return;
    }

    if (!user) {
      setError('Please sign in or register first to claim your 25 referral credits.');
      return;
    }

    setError(null);
    try {
      setClaiming(true);
      const res = await api.claimReferral(code.trim());
      setClaimSuccess(true);

      // Confetti celebration
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 }
      });

      await fetchWallet();
      showToast('🎉 25 Free Referral Credits added to your wallet!', 'success', 25);
    } catch (err) {
      setError(err.message || 'Failed to claim referral bonus.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 shadow-glow-credit mx-auto">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Gift className="w-8 h-8 text-amber-400 animate-bounce" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Referral Program: Get 25 Free Credits!
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Share learning with your network. Anyone who clicks your link receives <span className="text-amber-400 font-bold">25 credits free</span>, and you earn <span className="text-indigo-400 font-bold">10 credits</span>!
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Claim from invite link */}
        {initialReferralCode && !claimSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
            <div className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Referral Link Detected: <span className="font-mono text-white">{initialReferralCode}</span>
            </div>
            <p className="text-xs text-slate-300">
              Click below to claim your free 25 credits immediately!
            </p>
            <button
              onClick={() => handleClaim(initialReferralCode)}
              disabled={claiming}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 text-white font-extrabold text-xs shadow-glow-credit transition-all"
            >
              {claiming ? 'Claiming Credits...' : '🎁 Claim 25 Free Credits with 1 Click'}
            </button>
          </div>
        )}

        {claimSuccess ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">25 Credits Added to Your Wallet!</h3>
            <p className="text-xs text-slate-300">
              You can now unlock 5 new courses or share your own link with friends.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              Start Learning
            </button>
          </div>
        ) : (
          /* User's Own Share Link */
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Your Unique 25-Credit Referral Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-indigo-300 select-all"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-glow-brand flex items-center gap-1.5 transition-all shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Manual Code Entry if not already claimed */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-[11px] text-slate-400 mb-1">
                Have a referral code from a friend? Enter it here:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value)}
                  placeholder="e.g. RAHUL25"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleClaim()}
                  disabled={claiming || !claimCode.trim()}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-40 transition-colors"
                >
                  Claim 25 CR
                </button>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block text-center">
                Instant One-Click Share
              </span>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Join me on TimeShare! Click my link to get 25 free credits to learn skills: ${referralLink}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold text-center transition-colors"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Get 25 free credits to learn technical skills on TimeShare: ${referralLink}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-[11px] font-bold text-center transition-colors"
                >
                  Twitter / X
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Get 25 free credits on TimeShare!')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-bold text-center transition-colors"
                >
                  Telegram
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
