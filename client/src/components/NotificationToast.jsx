import React from 'react';
import { Sparkles, Coins, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export default function NotificationToast() {
  const { toast, closeToast } = useWallet();

  if (!toast) return null;

  const isPositive = toast.amount && toast.amount > 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce-subtle">
      <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-start gap-3 ${
        isPositive
          ? 'bg-amber-950/90 border-amber-500/50 text-amber-100 shadow-amber-500/20'
          : 'bg-slate-900/90 border-slate-700 text-slate-100 shadow-black/40'
      }`}>
        <div className={`p-2.5 rounded-xl shrink-0 ${
          isPositive ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'
        }`}>
          {isPositive ? <Coins className="w-6 h-6 animate-pulse" /> : <Sparkles className="w-6 h-6" />}
        </div>

        <div className="flex-1 pr-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide uppercase text-amber-300">
              {isPositive ? `+${toast.amount} Credits Received!` : 'TimeShare Update'}
            </span>
          </div>
          <p className="text-sm mt-0.5 text-slate-200 leading-snug">{toast.message}</p>
        </div>

        <button
          onClick={closeToast}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
