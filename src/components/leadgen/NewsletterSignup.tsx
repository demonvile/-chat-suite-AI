import React, { useState } from 'react';
import { Mail, Sparkles, CheckCircle2, Send, ArrowRight } from 'lucide-react';
import { trackGrowthEvent } from '../seo/AnalyticsScript';

export const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch('/api/leads/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer_newsletter' })
      });

      if (res.ok) {
        setSubmitted(true);
        trackGrowthEvent('newsletter_subscribed', { email });
      }
    } catch (err) {
      console.error('Newsletter error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
            <Sparkles size={11} /> Growth & AI Intelligence Weekly
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
            Join 15,000+ Product Strategists & SEO Engineers
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Get our weekly teardown of high-converting AI prompts, RAG architecture guides, and customer service automation playbooks.
          </p>
        </div>

        <div className="w-full md:w-auto shrink-0">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email"
                  className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
              >
                {loading ? 'Subscribing...' : 'Subscribe Free'}
                <ArrowRight size={14} />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-bold">
              <CheckCircle2 size={16} /> Subscribed! Check your inbox for confirmation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
