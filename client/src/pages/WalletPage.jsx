import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import TransactionTable from '../components/TransactionTable';
import ReferralModal from '../components/ReferralModal';
import {
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Gift,
  Award,
  Lock,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Share2
} from 'lucide-react';

export default function WalletPage() {
  const { user } = useAuth();
  const { wallet, transactions, loading, fetchWallet } = useWallet();
  const [showReferralModal, setShowReferralModal] = useState(false);

  const currentBalance = user?.credits ?? wallet?.currentBalance ?? 0;
  const totalEarned = user?.totalEarned ?? wallet?.totalEarned ?? 0;
  const totalSpent = user?.totalSpent ?? wallet?.totalSpent ?? 0;
  const breakdown = wallet?.breakdown || {
    welcomeBonus: 50,
    referralBonus: 0,
    videoApprovals: 0,
    learnerCompletions: 0,
    creatorRoyalties: 0,
    skillsUnlocked: 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Coins className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Secure Credit Wallet
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time balance, earnings breakdown, and immutable transaction ledger.
          </p>
        </div>

        <button
          onClick={fetchWallet}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Balance Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Available Balance */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 shadow-glow-credit relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2">
            <span>Available Balance</span>
            <Coins className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold font-mono text-white tracking-tight">
            {currentBalance}
            <span className="text-sm font-sans font-medium text-amber-300/80 ml-2">Credits</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Spend 5 credits to unlock any 20+ minute masterclass.
          </p>
        </div>

        {/* Total Earned */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2">
            <span>Total Earned</span>
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">
            +{totalEarned}
            <span className="text-sm font-sans font-medium text-slate-400 ml-2">Credits</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            From welcome bonus, approved videos, learner milestones & royalties.
          </p>
        </div>

        {/* Total Spent */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-400 uppercase tracking-wider mb-2">
            <span>Total Spent</span>
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-rose-400">
            -{totalSpent}
            <span className="text-sm font-sans font-medium text-slate-400 ml-2">Credits</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Invested into unlocking new skills and educational courses.
          </p>
        </div>
      </div>

      {/* Credit Breakdown Strip */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-indigo-400" /> Earnings & Expenditure Breakdown
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
          {/* Welcome Bonus */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Gift className="w-3.5 h-3.5 text-amber-400" /> Welcome Bonus
            </span>
            <div className="font-mono font-bold text-amber-300 text-sm">+{breakdown.welcomeBonus} CR</div>
          </div>

          {/* Referral Bonus */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5 text-amber-400" /> Referral (+25)
            </span>
            <div className="font-mono font-bold text-amber-300 text-sm">+{breakdown.referralBonus} CR</div>
          </div>

          {/* Video Approvals */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Video Approvals (+5)
            </span>
            <div className="font-mono font-bold text-emerald-400 text-sm">+{breakdown.videoApprovals} CR</div>
          </div>

          {/* Learner Milestones */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-400" /> Watched & Quiz (+1)
            </span>
            <div className="font-mono font-bold text-emerald-400 text-sm">+{breakdown.learnerCompletions} CR</div>
          </div>

          {/* Creator Royalties */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-indigo-400" /> Creator Royalties (+2)
            </span>
            <div className="font-mono font-bold text-indigo-300 text-sm">+{breakdown.creatorRoyalties} CR</div>
          </div>

          {/* Unlocked Skills */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-rose-400" /> Skill Unlocks (-5)
            </span>
            <div className="font-mono font-bold text-rose-400 text-sm">-{breakdown.skillsUnlocked} CR</div>
          </div>
        </div>
      </div>

      {/* Referral Promo Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>Referral Program: Give 25 Credits, Get 10 Credits!</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h4>
            <p className="text-xs text-slate-400">
              Anyone who clicks your personal referral link claims 25 credits free to learn skills on TimeShare.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowReferralModal(true)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 text-slate-950 font-extrabold text-xs shadow-glow-credit transition-all shrink-0"
        >
          View & Copy My Referral Link
        </button>
      </div>

      {/* Transaction History Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <span>Complete Transaction Ledger</span>
          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-sans font-normal">
            {transactions.length} records
          </span>
        </h3>
        <TransactionTable transactions={transactions} />
      </div>

      <ReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
      />
    </div>
  );
}
