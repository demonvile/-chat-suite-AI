import React, { useState, useEffect } from 'react';
import { X, Sparkles, Download, CheckCircle2, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { trackGrowthEvent } from '../seo/AnalyticsScript';

interface ExitIntentProps {
  onDismiss?: () => void;
}

export const ExitIntentPopup: React.FC<ExitIntentProps> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hasSeenExitPopup = sessionStorage.getItem('chatsuite_exit_seen');
    if (hasSeenExitPopup) return;

    // Detect mouse moving out of upper window boundary
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10) {
        setIsVisible(true);
        sessionStorage.setItem('chatsuite_exit_seen', 'true');
        trackGrowthEvent('exit_intent_triggered');
      }
    };

    // Backup timer trigger for high engagement (after 25s)
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem('chatsuite_exit_seen')) {
        setIsVisible(true);
        sessionStorage.setItem('chatsuite_exit_seen', 'true');
        trackGrowthEvent('engagement_lead_modal_triggered');
      }
    }, 25000);

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch('/api/leads/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, source: 'exit_intent_playbook' })
      });

      if (res.ok) {
        setSubmitted(true);
        trackGrowthEvent('lead_captured_exit_intent', { email, name });
      }
    } catch (err) {
      console.error('Exit intent submission failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {!submitted ? (
            <div className="space-y-5 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Sparkles size={12} /> Exclusive Enterprise Playbook
              </div>

              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                  Wait! Before you go, download our 2026 AI ROI Playbook
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Discover how 1,200+ fast-growing SaaS and e-commerce brands automate 82% of customer inquiries and double lead conversion rates.
                </p>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-1 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Prompt Engineering Templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>RAG Knowledge Optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>2026 Cost Reduction Metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Live Chat CRM Benchmarks</span>
                </div>
              </div>

              {/* Lead Capture Form */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                <div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Work Email Address"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download size={15} />
                  {loading ? 'Sending Playbook...' : 'Download Free PDF Playbook'}
                </button>
              </form>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>Zero Spam Guarantee. Unsubscribe anytime.</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Playbook Sent Successfully!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                Check your inbox (<strong>{email}</strong>). We've dispatched your copy of the 2026 Enterprise AI Automation Blueprint.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
