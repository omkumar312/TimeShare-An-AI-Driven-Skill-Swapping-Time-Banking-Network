import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';
import {
  Clock,
  Coins,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('timeshare123');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, switchDemoUser, demoUsers } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demoEmail) => {
    try {
      setLoading(true);
      await switchDemoUser(demoEmail);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-500 p-0.5 shadow-glow-brand mx-auto">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Clock className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Sign In to TimeShare
          </h2>
          <p className="text-xs text-slate-400">
            Access your skills, wallet, and learning history.
          </p>
        </div>

        {/* 1-Click Demo Accounts Quick Access */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase font-mono tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 1-Click Indian Demo Accounts
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
              Instant
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {demoUsers.slice(0, 6).map((du) => (
              <button
                key={du.id}
                type="button"
                onClick={() => handleDemoClick(du.email)}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/70 hover:bg-indigo-950/40 border border-slate-800/80 hover:border-indigo-500/40 text-left transition-all group"
              >
                <UserAvatar
                  src={du.avatar}
                  name={du.name}
                  size="xs"
                />
                <div className="truncate">
                  <div className="font-bold text-white group-hover:text-indigo-300 text-[11px] truncate">
                    {du.name.split(' ')[0]}
                  </div>
                  <div className="text-[9px] text-amber-400 font-mono">{du.credits} Credits</div>
                </div>
              </button>
            ))}
          </div>

          {/* Admin Login Button */}
          {demoUsers.find(u => u.role === 'admin') && (
            <button
              type="button"
              onClick={() => handleDemoClick('admin@timeshare.ai')}
              className="w-full flex items-center justify-between p-2 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-950/50 border border-rose-500/30 text-rose-200 text-xs font-semibold transition-colors"
            >
              <span className="flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-rose-400" /> Login as Admin (Vikram Aditya)
              </span>
              <span className="text-[10px] font-mono text-rose-300">Admin Portal &rarr;</span>
            </button>
          )}
        </div>

        {/* Credentials Form */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@timeshare.ai"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="timeshare123"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-glow-brand transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800">
            Don't have an account?{' '}
            <Link to="/register" className="text-amber-400 hover:underline font-bold">
              Register (+50 Bonus Credits)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
