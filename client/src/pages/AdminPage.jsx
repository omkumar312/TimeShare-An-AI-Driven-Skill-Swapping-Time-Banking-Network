import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import UserAvatar from '../components/UserAvatar';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Users,
  Film,
  Coins,
  ShieldAlert,
  Search,
  Check,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const { showToast } = useWallet();

  const [stats, setStats] = useState(null);
  const [pendingVideos, setPendingVideos] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [fraudLogs, setFraudLogs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'videos' | 'fraud' | 'users'

  // Adjustment modal state
  const [adjustTargetUser, setAdjustTargetUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(10);
  const [adjustReason, setAdjustReason] = useState('Platform contributor reward');
  const [adjusting, setAdjusting] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, pendingData, allVids, fraudData, usersData] = await Promise.all([
        api.getAdminStats(),
        api.getPendingVideos(),
        api.getAllAdminVideos(),
        api.getFraudLogs(),
        api.getAdminUsers()
      ]);
      setStats(statsData);
      setPendingVideos(pendingData);
      setAllVideos(allVids);
      setFraudLogs(fraudData);
      setUsersList(usersData);
    } catch (err) {
      console.error('[Admin] Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const handleApprove = async (videoId) => {
    try {
      const res = await api.approveVideo(videoId, { adminNote: 'Verified high educational quality by Admin.' });
      showToast(res.message, 'success', 5);
      fetchAdminData();
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  const handleReject = async (videoId) => {
    const reason = window.prompt(
      'Enter rejection reason for the creator:',
      'Non-educational or entertainment content. Only structured educational skill courses qualify.'
    );
    if (!reason) return;

    try {
      const res = await api.rejectVideo(videoId, { reason });
      showToast(res.message, 'info');
      fetchAdminData();
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  const handleReanalyze = async (videoId) => {
    try {
      const res = await api.reanalyzeVideo(videoId);
      showToast(`AI Re-analysis complete (Score: ${res.analysis.score}/100)`, 'info');
      fetchAdminData();
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  const handleAdjustCredits = async (e) => {
    e.preventDefault();
    if (!adjustTargetUser) return;
    try {
      setAdjusting(true);
      const res = await api.adjustCredits({
        userId: adjustTargetUser.id,
        amount: Number(adjustAmount),
        reason: adjustReason
      });
      showToast(res.message, 'success', Number(adjustAmount));
      setAdjustTargetUser(null);
      fetchAdminData();
    } catch (err) {
      showToast(err.message, 'info');
    } finally {
      setAdjusting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400">
          You must be logged in with an admin account (e.g. Vikram Aditya). Use the Demo Switcher in the navbar to switch to Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform Administration & Verification
            </h1>
            <p className="text-xs text-slate-400">
              Audit educational course quality, moderate rewards, and protect against fraudulent credit claims.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
        >
          Refresh Live Audits
        </button>
      </div>

      {/* Global Platform Analytics Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] uppercase font-mono text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-400" /> Active Users
            </span>
            <div className="text-2xl font-mono font-extrabold text-white">{stats.totalUsers}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] uppercase font-mono text-slate-400 flex items-center gap-1">
              <Film className="w-3.5 h-3.5 text-emerald-400" /> Approved Lessons
            </span>
            <div className="text-2xl font-mono font-extrabold text-emerald-400">
              {stats.approvedVideos} <span className="text-xs font-normal text-slate-500">/ {stats.totalVideos}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] uppercase font-mono text-slate-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> Circulating Credits
            </span>
            <div className="text-2xl font-mono font-extrabold text-amber-400">{stats.totalCreditsInCirculation}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] uppercase font-mono text-slate-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Blocked Frauds
            </span>
            <div className="text-2xl font-mono font-extrabold text-rose-400">{stats.flaggedFraudCount}</div>
          </div>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'pending'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Pending Verifications ({pendingVideos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'videos'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Film className="w-4 h-4 text-indigo-400" />
          <span>All Lessons ({allVideos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fraud')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'fraud'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Fraud Prevention Logs ({fraudLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-400" />
          <span>User Credit Management ({usersList.length})</span>
        </button>
      </div>

      {/* Tab: Pending Verifications */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingVideos.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-2">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Verification Queue Clean</h3>
              <p className="text-xs text-slate-400">All submitted skill videos have been processed and rewarded.</p>
            </div>
          ) : (
            pendingVideos.map((video) => (
              <div
                key={video.id}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={video.creatorAvatar}
                      name={video.creatorName}
                      size="md"
                    />
                    <div>
                      <h3 className="text-base font-bold text-white">{video.title}</h3>
                      <p className="text-xs text-slate-400">
                        Uploaded by <strong className="text-indigo-300">{video.creatorName}</strong> • {video.category} • {Math.round(video.duration / 60)} mins
                      </p>
                    </div>
                  </div>

                  {/* AI Score Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      AI Score: <strong className="text-white">{video.aiScore || 50}/100</strong>
                    </span>
                  </div>
                </div>

                {/* AI Reasoning explanation */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Automated Audit:
                  </div>
                  <p className="text-slate-400 leading-relaxed">{video.aiReasoning}</p>
                </div>

                <p className="text-xs text-slate-300">{video.description}</p>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleApprove(video.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve & Grant 5 Credits</span>
                  </button>

                  <button
                    onClick={() => handleReject(video.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Video</span>
                  </button>

                  <button
                    onClick={() => handleReanalyze(video.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-evaluate with AI</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: All Lessons */}
      {activeTab === 'videos' && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Title / Creator</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">AI Score</th>
                  <th className="py-3 px-4">Completions</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {allVideos.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white line-clamp-1">{v.title}</div>
                      <div className="text-[11px] text-slate-400">{v.creatorName}</div>
                    </td>
                    <td className="py-3 px-4">{v.category}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' :
                        v.status === 'PENDING' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-rose-500/20 text-rose-300'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-300">{v.aiScore || 50}/100</td>
                    <td className="py-3 px-4 font-mono">{v.completionsCount || 0}</td>
                    <td className="py-3 px-4 text-right">
                      {v.status !== 'APPROVED' ? (
                        <button
                          onClick={() => handleApprove(v.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 text-xs font-semibold"
                        >
                          Approve (+5)
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500">Live</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Fraud Prevention Logs */}
      {activeTab === 'fraud' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-300">
            <span className="font-bold text-white">Automated Anti-Fraud Sentinel: </span>
            Monitors self-watching reward attempts, playback speed abusers, and users attempting to skip ahead to 90% without watching.
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Fraud Type</th>
                  <th className="py-3 px-4">User ID / Reason</th>
                  <th className="py-3 px-4">Video Ref</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {fraudLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No fraudulent attempts detected. System operating securely.
                    </td>
                  </tr>
                ) : (
                  fraudLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white font-medium">{log.reason}</div>
                        <div className="text-[10px] text-slate-400 font-mono">User: {log.userId}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{log.videoId || 'N/A'}</td>
                      <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: User Credit Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Available Credits</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          src={u.avatar}
                          name={u.name}
                          role={u.role}
                          size="xs"
                        />
                        <span className="font-bold text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        u.role === 'admin' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                      {u.credits} CR
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setAdjustTargetUser(u)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 text-xs font-semibold"
                      >
                        Adjust Credits
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Credit Adjustment Modal */}
      {adjustTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              Adjust Credits for {adjustTargetUser.name}
            </h3>
            <p className="text-xs text-slate-400">
              Current balance: <strong className="text-amber-400 font-mono">{adjustTargetUser.credits} Credits</strong>
            </p>

            <form onSubmit={handleAdjustCredits} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Credit Delta (Positive to add, Negative to deduct)
                </label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Reason / Audit Note</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustTargetUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow-brand"
                >
                  {adjusting ? 'Saving...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
