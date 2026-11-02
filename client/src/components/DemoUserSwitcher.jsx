import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, ShieldCheck, ChevronDown, Coins, Sparkles } from 'lucide-react';
import UserAvatar from './UserAvatar';

export default function DemoUserSwitcher() {
  const { user, demoUsers, switchDemoUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleSwitch = async (email) => {
    try {
      setSwitching(true);
      await switchDemoUser(email);
      setOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-all shadow-sm"
        title="Quick Demo Account Switcher"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="hidden sm:inline text-slate-400">Demo User:</span>
        <span className="font-semibold text-indigo-300">
          {user ? user.name.split(' ')[0] : 'Select Demo'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1.5 border-b border-slate-800 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Indian Demo Accounts
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                  1-Click Test
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Switch users to test peer unlocking, creator royalties (+2 credits), and admin approvals.
              </p>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1">
              {demoUsers.map((du) => {
                const isActive = user?.email === du.email;
                const isAdmin = du.role === 'admin';

                return (
                  <button
                    key={du.id}
                    onClick={() => handleSwitch(du.email)}
                    disabled={switching}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                        : 'hover:bg-slate-800 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar
                        src={du.avatar}
                        name={du.name}
                        role={du.role}
                        size="sm"
                      />
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate">{du.name}</span>
                          {isAdmin && (
                            <span className="bg-rose-500/20 text-rose-300 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" /> ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{du.headline}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2 font-mono text-xs font-bold text-amber-400">
                      <Coins className="w-3 h-3" />
                      {du.credits}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
