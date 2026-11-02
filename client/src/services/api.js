const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('timeshare_token');
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, set Content-Type to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'API request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => apiRequest('/auth/me'),
  demoLogin: (body) => apiRequest('/auth/demo-login', { method: 'POST', body: JSON.stringify(body) }),
  getDemoUsers: () => apiRequest('/auth/demo-users'),
  claimReferral: (referralCode) => apiRequest('/auth/claim-referral', { method: 'POST', body: JSON.stringify({ referralCode }) }),
  getReferralInfo: (code) => apiRequest(`/auth/referral-info/${code}`),

  // Chatbot
  chatWithAI: (message, history = []) => apiRequest('/chatbot/message', { method: 'POST', body: JSON.stringify({ message, history }) }),

  // Videos
  getVideos: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/videos${query ? `?${query}` : ''}`);
  },
  getVideoById: (id) => apiRequest(`/videos/${id}`),
  createVideo: (body) => apiRequest('/videos', { method: 'POST', body: JSON.stringify(body) }),
  unlockVideo: (id) => apiRequest(`/videos/${id}/unlock`, { method: 'POST' }),
  recordProgress: (id, progressData) => apiRequest(`/videos/${id}/progress`, { method: 'POST', body: JSON.stringify(progressData) }),
  submitQuiz: (id, answers) => apiRequest(`/videos/${id}/submit-quiz`, { method: 'POST', body: JSON.stringify({ answers }) }),

  // Uploads
  uploadVideoFile: (formData) => apiRequest('/upload/video', { method: 'POST', body: formData }),
  uploadThumbnailFile: (formData) => apiRequest('/upload/thumbnail', { method: 'POST', body: formData }),

  // Wallet
  getWallet: () => apiRequest('/wallet'),
  getNotifications: () => apiRequest('/wallet/notifications'),
  markNotificationsRead: () => apiRequest('/wallet/notifications/read', { method: 'POST' }),

  // Admin
  getAdminStats: () => apiRequest('/admin/stats'),
  getPendingVideos: () => apiRequest('/admin/pending-videos'),
  getAllAdminVideos: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/videos${query ? `?${query}` : ''}`);
  },
  approveVideo: (id, body = {}) => apiRequest(`/admin/videos/${id}/approve`, { method: 'POST', body: JSON.stringify(body) }),
  rejectVideo: (id, body = {}) => apiRequest(`/admin/videos/${id}/reject`, { method: 'POST', body: JSON.stringify(body) }),
  reanalyzeVideo: (id) => apiRequest(`/admin/videos/${id}/reanalyze`, { method: 'POST' }),
  getFraudLogs: () => apiRequest('/admin/fraud-logs'),
  getAdminUsers: () => apiRequest('/admin/users'),
  adjustCredits: (body) => apiRequest('/admin/users/adjust-credits', { method: 'POST', body: JSON.stringify(body) }),
};
