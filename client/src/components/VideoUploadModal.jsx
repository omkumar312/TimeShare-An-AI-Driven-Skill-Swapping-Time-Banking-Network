import React, { useState } from 'react';
import {
  UploadCloud,
  FileVideo,
  Sparkles,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Trash2,
  Coins,
  ShieldCheck,
  Film
} from 'lucide-react';
import { api } from '../services/api';
import { useWallet } from '../context/WalletContext';

const CATEGORIES = [
  'Technology & Code',
  'Design & UI/UX',
  'Finance & Business',
  'Music & Audio',
  'Data Science & AI',
  'Marketing & Growth',
  'Photography & Video',
  'Personal Development'
];

function extractYouTubeThumb(url) {
  if (!url) return null;
  const match = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

export default function VideoUploadModal({ isOpen, onClose, onVideoCreated }) {
  const { fetchWallet, showToast } = useWallet();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState('React, Web Development, Full Stack');
  const [durationMinutes, setDurationMinutes] = useState(22); // 20+ min requirement
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Custom Quiz Questions Builder (Default 3 Skill Verification Questions)
  const [questions, setQuestions] = useState([
    {
      id: 'q1',
      question: 'What is the primary architectural concept taught in this lesson?',
      options: [
        'Modular scalable design patterns and best practices',
        'Unstructured procedural scripts',
        'Deprecated legacy approaches',
        'Casual entertainment trivia'
      ],
      correctOption: 0
    },
    {
      id: 'q2',
      question: 'How do learners effectively apply these principles in real projects?',
      options: [
        'By validating performance metrics and continuous testing',
        'By avoiding planning and documentation',
        'By memorizing syntax without building',
        'By ignoring error handlers'
      ],
      correctOption: 0
    },
    {
      id: 'q3',
      question: 'What is a critical consideration when implementing this skill in production?',
      options: [
        'Adhering to standard design patterns and robust error handling',
        'Skipping testing and validation altogether',
        'Hardcoding credentials and ignoring security',
        'Relying purely on arbitrary assumptions'
      ],
      correctOption: 0
    }
  ]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        id: 'q_' + Date.now(),
        question: '',
        options: ['Correct approach', 'Incorrect option A', 'Incorrect option B', 'Incorrect option C'],
        correctOption: 0
      }
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx, field, value) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[qIdx].options[optIdx] = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    if (description.trim().length < 25) {
      setError('Please provide a more detailed educational description (minimum 25 characters) to assist AI skill evaluation.');
      return;
    }

    try {
      setUploading(true);

      let finalVideoUrl = videoUrl;

      // If user uploaded a physical file, upload to server first
      if (videoFile) {
        const formData = new FormData();
        formData.append('video', videoFile);
        const uploadRes = await api.uploadVideoFile(formData);
        finalVideoUrl = uploadRes.fileUrl;
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        duration: Math.max(1200, Number(durationMinutes) * 60),
        videoUrl: finalVideoUrl || 'https://www.youtube.com/watch?v=bMknfKXIFA8',
        thumbnailUrl: thumbnailUrl.trim() || extractYouTubeThumb(finalVideoUrl) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
        quizQuestions: questions
      };

      const res = await api.createVideo(payload);

      await fetchWallet();

      if (res.rewardGranted) {
        showToast(`🎉 Skill published! Your 20+ min masterclass is now live for all users in "Available 20+ Minute Skill Masterclasses"! (+5 Credits)`, 'success', 5);
      } else if (res.video.status === 'PENDING') {
        showToast('⏳ Video uploaded & queued for Admin review. +5 credits upon approval.', 'info');
      } else {
        showToast(`⚠️ AI Content Filter: ${res.video.aiReasoning}`, 'info');
      }

      if (onVideoCreated) onVideoCreated(res.video);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to upload video.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-500 p-0.5 shadow-glow-brand shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <UploadCloud className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              Share Educational Skill Video
              <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
                Earn 5 Credits
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Only structured educational skill lessons qualify. Verified automatically by AI or Admin.
            </p>
          </div>
        </div>

        {/* AI Guarantee Badge */}
        <div className="mb-4 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3 text-xs">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-slate-300 leading-snug">
            <span className="font-bold text-white">AI Content Guard: </span>
            Our AI scans course title, description, and syllabus for genuine educational value. Approved videos immediately earn you <span className="text-amber-400 font-bold">5 credits</span>, plus <span className="text-amber-400 font-bold">2 credits</span> every time a unique learner completes your course!
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 space-y-5 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Skill Course Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next.js 15 Full-Stack App Architecture & Micro-frontends"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Category & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Skill Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 text-xs text-white transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Duration (Minutes, approx 20m+)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Detailed Educational Syllabus & Objectives *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the learning objectives, core methodologies, and practical outcomes students will achieve in this video..."
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 text-xs text-white placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Skill Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="React, TypeScript, Architecture, Docker"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 text-xs text-white placeholder-slate-500"
            />
          </div>

          {/* Video Media Source */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Video File / Direct Stream URL
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Upload MP4 / WebM File</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/30 file:text-indigo-300 hover:file:bg-indigo-600/50 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Or Direct Video URL</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://.../video.mp4 (optional)"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Thumbnail Image URL</label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... (optional)"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          {/* Interactive Quiz Builder */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Student Verification Quiz ({questions.length} Questions)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Learners must answer these correctly to master the skill and award you +2 creator credits!
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-600/40 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div key={q.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-400">Question #{qIdx + 1}</span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    required
                    value={q.question}
                    onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                    placeholder="Enter question text..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  />

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Options (Select radio for correct answer):</span>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct_${qIdx}`}
                          checked={q.correctOption === optIdx}
                          onChange={() => handleQuestionChange(qIdx, 'correctOption', optIdx)}
                          className="accent-emerald-500 cursor-pointer"
                        />
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                          placeholder={`Option ${optIdx + 1}`}
                          className="flex-1 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Footer */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-800 sticky bottom-0 bg-slate-900 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white font-bold text-xs shadow-glow-brand transition-all disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              {uploading ? 'Analyzing with AI...' : 'Submit & Analyze with AI (+5 Credits)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
