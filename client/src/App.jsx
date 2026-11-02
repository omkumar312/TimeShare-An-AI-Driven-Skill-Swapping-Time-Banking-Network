import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';

import Navbar from './components/Navbar';
import NotificationToast from './components/NotificationToast';
import VideoUploadModal from './components/VideoUploadModal';
import ReferralModal from './components/ReferralModal';
import AIChatbot from './components/AIChatbot';

import HomePage from './pages/HomePage';
import WatchPage from './pages/WatchPage';
import WalletPage from './pages/WalletPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import { Clock } from 'lucide-react';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppContent() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [urlReferralCode, setUrlReferralCode] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Detect ?ref=... parameter in the URL and prompt the 25 free credits modal automatically!
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      setUrlReferralCode(ref);
      setIsReferralOpen(true);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenReferral={() => setIsReferralOpen(true)}
      />

      {/* Global Real-time Notification Toast */}
      <NotificationToast />

      {/* 24/7 AI Learning Advisor & Mentor Chatbot */}
      <AIChatbot />

      {/* Referral Free Credits Modal */}
      <ReferralModal
        isOpen={isReferralOpen}
        initialReferralCode={urlReferralCode}
        onClose={() => {
          setIsReferralOpen(false);
          setUrlReferralCode(null);
        }}
      />

      {/* Global Video Upload Modal */}
      <VideoUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onVideoCreated={(video) => {
          if (video && video.id) {
            navigate(`/watch/${video.id}`);
          }
        }}
      />

      {/* Main Content Pages */}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onOpenUpload={() => setIsUploadOpen(true)}
                onOpenReferral={() => setIsReferralOpen(true)}
              />
            }
          />
          <Route path="/watch/:id" element={<WatchPage />} />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage onOpenUpload={() => setIsUploadOpen(true)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-white text-sm">
              Time<span className="text-indigo-400">Share</span>
            </span>
            <span className="text-slate-500">| AI-Powered Skill-Learning Platform</span>
          </div>

          <div className="flex items-center gap-6 text-[11px] font-mono text-slate-400">
            <span>• 5 CR Video Approval</span>
            <span>• 1 CR 90% Watch + Quiz</span>
            <span>• 2 CR Creator Royalty</span>
            <span>• 25 CR Free Referral Link</span>
            <span>• 5 CR Skill Unlock</span>
          </div>

          <div className="text-[11px] text-slate-500">
            Designed for seamless peer skill sharing & anti-cheat learning.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <WalletProvider>
          <AppContent />
        </WalletProvider>
      </AuthProvider>
    </Router>
  );
}
