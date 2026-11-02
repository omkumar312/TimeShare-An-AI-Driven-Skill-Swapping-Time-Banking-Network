import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle, XCircle, AlertCircle, X, Sparkles, Coins, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useWallet } from '../context/WalletContext';

export default function QuizModal({ video, quiz, onClose, onSuccess }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { fetchWallet } = useWallet();

  const fallbackQuestions = [
    {
      id: 'q1',
      question: `What is the core principle taught in "${video?.title || 'this lesson'}"?`,
      options: [
        'Structured methodology and industry best practices',
        'Casual trial without proper technique',
        'Outdated patterns with no practical relevance',
        'Pure theoretical trivia'
      ]
    },
    {
      id: 'q2',
      question: 'How do you apply the concepts from this video in real projects?',
      options: [
        'By testing components and validating outcomes iteratively',
        'By avoiding planning and documentation',
        'By guessing solutions randomly',
        'By skipping error handling'
      ]
    },
    {
      id: 'q3',
      question: 'What is essential for mastering this skill long-term?',
      options: [
        'Consistent deliberate practice and continuous refinement',
        'Watching once without practicing',
        'Copying code without understanding',
        'Ignoring performance optimizations'
      ]
    }
  ];

  const questions = (quiz?.questions && quiz.questions.length > 0) ? quiz.questions : fallbackQuestions;

  const handleSelect = (questionId, optionIndex) => {
    if (result) return; // Locked once submitted
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Verify all questions answered
    const unanswered = questions.some(q => selectedAnswers[q.id] === undefined);
    if (unanswered) {
      setError('Please answer all questions before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = Object.entries(selectedAnswers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption
      }));

      const res = await api.submitQuiz(video.id, payload);
      setResult(res);

      if (res.passed) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        await fetchWallet();
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Skill Knowledge Check
            </h2>
            <p className="text-xs text-slate-400">
              Pass this quiz to claim your <span className="text-amber-400 font-bold">1 Credit</span> reward!
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success / Result State */}
        {result ? (
          <div className="my-auto py-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-white">Skill Mastered!</h3>
              <p className="text-sm text-slate-300">
                You passed with a score of <span className="font-bold text-emerald-400">{result.scorePercentage}%</span>!
              </p>
            </div>

            {/* Reward Breakdown Card */}
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-left text-xs">
              <div className="flex items-center justify-between text-slate-200">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Coins className="w-4 h-4 text-amber-400" /> Learner Reward
                </span>
                <span className="font-mono font-bold text-emerald-400">+1 Credit (Added to Wallet)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 border-t border-slate-800/80 pt-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Creator Royalty
                </span>
                <span className="font-mono text-indigo-300">+2 Credits sent to {video?.creatorName}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-glow-brand"
            >
              Continue Learning
            </button>
          </div>
        ) : (
          /* Quiz Question Form */
          <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 space-y-6 flex-1">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <p className="text-sm font-semibold text-slate-200 mb-3">
                  <span className="text-indigo-400 font-mono mr-2">Q{idx + 1}.</span>
                  {q.question}
                </p>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[q.id] === optIdx;
                    return (
                      <button
                        type="button"
                        key={optIdx}
                        onClick={() => handleSelect(q.id, optIdx)}
                        className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-start gap-3 border ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white font-medium'
                            : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] shrink-0 border ${
                          isSelected ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-slate-700 text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs text-slate-400">
                All {questions.length} questions answered
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-credit transition-all disabled:opacity-50"
              >
                {submitting ? 'Verifying Answers...' : 'Submit Quiz & Claim 1 Credit'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
