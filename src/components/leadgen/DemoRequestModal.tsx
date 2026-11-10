import React, { useState } from 'react';
import { X, Calendar, Clock, Building2, Users, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { trackGrowthEvent } from '../seo/AnalyticsScript';

interface DemoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoRequestModal: React.FC<DemoRequestModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [companySize, setCompanySize] = useState('11-50');
  const [useCase, setUseCase] = useState('Customer Support Automation');
  const [preferredDate, setPreferredDate] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setLoading(true);
    try {
      const res = await fetch('/api/leads/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company,
          companySize,
          useCase,
          preferredDate
        })
      });

      if (res.ok) {
        setSubmitted(true);
        trackGrowthEvent('demo_requested', { company, companySize, useCase });
      }
    } catch (err) {
      console.error('Demo request submission failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {!submitted ? (
            <div className="space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Calendar size={12} /> 1-on-1 Product Strategy Consultation
              </div>

              <div>
                <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Request a Personalized Demo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  See ChatSuite AI in action on your website. Get a custom proof-of-concept configured for your exact business knowledge base.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme Corp"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                      Company Size
                    </label>
                    <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                    >
                      <option value="1-10">1-10 Employees</option>
                      <option value="11-50">11-50 Employees</option>
                      <option value="51-200">51-200 Employees</option>
                      <option value="201-1000">201-1000 Employees</option>
                      <option value="1000+">1000+ Employees</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                    Primary Goal / Use Case
                  </label>
                  <select
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                  >
                    <option value="Customer Support Automation">Customer Support Automation (24/7 Deflection)</option>
                    <option value="Inbound Lead Qualification">Inbound Lead Capture & Qualification</option>
                    <option value="Internal HR & Knowledge Assistant">Internal HR & Team Knowledge Assistant</option>
                    <option value="E-Commerce Conversational Sales">E-Commerce Conversational Product Recommender</option>
                    <option value="White Label Agency Deployment">White Label Agency Reseller Deployment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                >
                  <Send size={14} />
                  {loading ? 'Submitting Demo Request...' : 'Schedule Live Demo Session'}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Demo Request Confirmed!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong>{name}</strong>. An AI Solutions Engineer has received your request and will reach out to <strong>{email}</strong> within 2 hours to confirm your calendar invitation.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Close Window
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
