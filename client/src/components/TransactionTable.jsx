import React, { useState } from 'react';
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Award,
  Lock,
  Gift,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';

export default function TransactionTable({ transactions = [] }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter(tx => {
    if (filter === 'EARNED' && tx.type !== 'EARNED') return false;
    if (filter === 'SPENT' && tx.type !== 'SPENT') return false;
    if (search) {
      const q = search.toLowerCase();
      const desc = (tx.description || '').toLowerCase();
      const reason = (tx.reason || '').toLowerCase();
      const title = (tx.videoTitle || '').toLowerCase();
      return desc.includes(q) || reason.includes(q) || title.includes(q);
    }
    return true;
  });

  const getReasonMeta = (reason) => {
    switch (reason) {
      case 'WELCOME_BONUS':
        return { label: 'Welcome Bonus', icon: Gift, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'VIDEO_APPROVED':
        return { label: 'Video Approved', icon: Sparkles, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'VIDEO_COMPLETED':
        return { label: 'Learner Reward', icon: Award, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'CREATOR_ROYALTY':
        return { label: 'Creator Royalty', icon: Coins, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
      case 'SKILL_UNLOCKED':
        return { label: 'Skill Unlocked', icon: Lock, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case 'ADMIN_ADJUSTMENT':
        return { label: 'Admin Adjustment', icon: ShieldCheck, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
      default:
        return { label: reason || 'Transaction', icon: Coins, color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs self-stretch sm:self-auto justify-center">
          {['ALL', 'EARNED', 'SPENT'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filter === type
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4 sm:px-6">Transaction / Description</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-right">Balance After</th>
              <th className="py-3 px-4 sm:px-6 text-right">Date & Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No transactions found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const isEarned = tx.amount >= 0;
                const meta = getReasonMeta(tx.reason);
                const Icon = meta.icon;

                return (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Description */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border shrink-0 ${meta.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 line-clamp-1">
                            {tx.description || meta.label}
                          </div>
                          {tx.videoTitle && (
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">
                              Course: {tx.videoTitle}
                            </div>
                          )}
                          <div className="text-[9px] font-mono text-slate-400">ID: {tx.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.color}`}>
                        {meta.label}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right">
                      <div className={`inline-flex items-center gap-1 font-mono font-bold text-sm ${
                        isEarned ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isEarned ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                        <span>{isEarned ? `+${tx.amount}` : tx.amount}</span>
                      </div>
                    </td>

                    {/* Balance After */}
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-300">
                      {tx.balanceAfter} <span className="text-[10px] text-slate-500">CR</span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 sm:px-6 text-right font-mono text-[11px] text-slate-400">
                      <div>{new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
