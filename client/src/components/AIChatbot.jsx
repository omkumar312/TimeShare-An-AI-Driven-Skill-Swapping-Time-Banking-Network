import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Bot,
  User,
  Send,
  X,
  Sparkles,
  ChevronRight,
  Clock,
  Coins,
  ArrowRight,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { api } from '../services/api';
import { formatDuration } from './VideoCard';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello! I'm your **TimeShare AI Learning Advisor**. 🎓\n\nI can recommend **20+ min skill courses**, explain our **credit economy**, guide you on **earning 25 referral credits**, or help you master skills!`,
      suggestedTopics: [
        'How do I earn credits?',
        'How do I get 25 free referral credits?',
        'Recommend 20+ min coding masterclasses',
        'How does anti-cheat 90% watch work?'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: text.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatWithAI(text.trim(), messages.slice(-4));
      const botMsg = {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        text: res.text,
        suggestedTopics: res.suggestedTopics,
        recommendations: res.recommendations
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'bot',
          text: 'Sorry, I encountered an issue connecting to the learning advisor service. Please try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecommendation = (courseId) => {
    navigate(`/watch/${courseId}`);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-glow-brand transition-all transform hover:scale-105 active:scale-95 border border-indigo-400/40"
          title="Open AI Skill Advisor"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-amber-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <span>Ask AI Mentor</span>
          <span className="bg-amber-400/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
            24/7
          </span>
        </button>
      )}

      {/* Chat Window Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-[92vw] sm:w-96 h-[560px] bg-slate-900/95 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Bot className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  TimeShare AI Mentor
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </h3>
                <p className="text-[10px] text-slate-400">Instant Skill & Credit Advisor</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[88%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-sm'
                  }`}
                >
                  <div className="whitespace-pre-line text-xs">{m.text}</div>

                  {/* Course Recommendations Cards */}
                  {m.recommendations && m.recommendations.length > 0 && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-slate-800">
                      <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider block">
                        Recommended 20+ Min Courses:
                      </span>
                      {m.recommendations.map((rec) => (
                        <div
                          key={rec.id}
                          onClick={() => handleSelectRecommendation(rec.id)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between gap-2 cursor-pointer transition-all group"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-white group-hover:text-indigo-300 truncate text-[11px]">
                              {rec.title}
                            </div>
                            <div className="text-[9px] text-slate-400 flex items-center gap-1.5 font-mono">
                              <span>{rec.creatorName}</span>
                              <span>•</span>
                              <span>{formatDuration(rec.duration)}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggested prompt chips */}
                {m.suggestedTopics && m.suggestedTopics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                    {m.suggestedTopics.map((topic, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(topic)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-[10px] font-medium transition-all text-left"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
                <Bot className="w-4 h-4 text-indigo-400 animate-spin" />
                <span>AI Mentor thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about courses or credits..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
