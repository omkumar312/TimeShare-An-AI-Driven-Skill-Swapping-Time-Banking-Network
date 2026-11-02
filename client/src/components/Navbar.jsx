import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import DemoUserSwitcher from './DemoUserSwitcher';
import UserAvatar from './UserAvatar';
import {
  Clock,
  Coins,
  UploadCloud,
  Bell,
  Shield,
  LayoutDashboard,
  Compass,
  LogOut,
  User,
  Sparkles,
  Check,
  CheckCircle2,
  Gift
} from 'lucide-react';

export default function Navbar({ onOpenUpload, onOpenReferral }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { wallet, notifications, unreadCount, markAllRead } = useWallet();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Explore Skills', path: '/', icon: Compass },
    { name: 'My Wallet', path: '/wallet', icon: Coins, highlight: true },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Admin Portal', path: '/admin', icon: Shield, badge: 'ADMIN' });
  }

  return (
    <nav className="sticky top-0 z-40 bg-[#0b0f19]/90 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 p-0.5 shadow-glow-brand group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                </div>
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                  Time<span className="text-indigo-400">Share</span>
                </span>
                <span className="text-[10px] block font-mono text-slate-400 uppercase tracking-widest -mt-1">
                  Skill Exchange
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-indigo-400" />
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="text-[9px] font-bold bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded uppercase">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Demo User Switcher Bar */}
            <DemoUserSwitcher />

            {/* Referral Free Credits Pill */}
            <button
              onClick={onOpenReferral}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-sm"
              title="Refer Friends & Get 25 Free Credits"
            >
              <Gift className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span className="hidden sm:inline">Referral</span>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                +25 Free
              </span>
            </button>

            {isAuthenticated ? (
              <>
                {/* Upload Skill Video Button */}
                <button
                  onClick={onOpenUpload}
                  className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-glow-brand transition-all active:scale-95"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Share Skill</span>
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                    +5 Credits
                  </span>
                </button>

                {/* Credit Wallet Pill */}
                <Link
                  to="/wallet"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 text-amber-300 text-xs font-bold transition-all shadow-glow-credit"
                  title="View Secure Credit Wallet"
                >
                  <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="font-mono text-sm">{user?.credits ?? wallet?.currentBalance ?? 0}</span>
                  <span className="text-[10px] text-amber-400/80 uppercase font-mono">Credits</span>
                </Link>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      if (!showNotifications && unreadCount > 0) {
                        markAllRead();
                      }
                    }}
                    className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    )}
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-slate-900"></span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Notifications & Activity
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {notifications.length} updates
                          </span>
                        </div>

                        <div className="max-h-72 overflow-y-auto mt-2 space-y-2">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-400">
                              No notifications yet.
                            </div>
                          ) : (
                            notifications.slice(0, 10).map((n) => (
                              <div
                                key={n.id}
                                className={`p-2.5 rounded-xl border text-xs transition-colors ${
                                  !n.read
                                    ? 'bg-indigo-950/40 border-indigo-500/30 text-slate-200'
                                    : 'bg-slate-800/40 border-slate-800 text-slate-300'
                                }`}
                              >
                                <div className="font-bold text-slate-100 flex items-center justify-between">
                                  <span>{n.title}</span>
                                  <span className="text-[9px] text-slate-400 font-mono">
                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{n.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 p-0.5 rounded-2xl border border-slate-700 hover:border-indigo-500 transition-all"
                  >
                    <UserAvatar
                      src={user?.avatar}
                      name={user?.name}
                      role={user?.role}
                      size="sm"
                    />
                  </button>

                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                      <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-2 border-b border-slate-800">
                          <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                        </div>
                        <div className="pt-1">
                          <Link
                            to="/dashboard"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                            My Dashboard
                          </Link>
                          <Link
                            to="/wallet"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                          >
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                            Credit Wallet
                          </Link>
                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-rose-300 hover:text-white hover:bg-rose-950/40 rounded-xl transition-colors"
                            >
                              <Shield className="w-3.5 h-3.5 text-rose-400" />
                              Admin Portal
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl transition-colors mt-1"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-glow-brand"
                >
                  Join (Get 50 Credits)
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
