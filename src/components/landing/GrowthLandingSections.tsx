import React, { useState } from 'react';
import {
  Star, CheckCircle2, ShieldCheck, ArrowRight, Building, Layers, Zap,
  Globe, HelpCircle, Sparkles, Award, TrendingUp, Users, Check, X, Calendar
} from 'lucide-react';
import { trackGrowthEvent } from '../seo/AnalyticsScript';

interface GrowthSectionsProps {
  onRequestDemo: () => void;
  onRegisterClick: () => void;
}

export const GrowthLandingSections: React.FC<GrowthSectionsProps> = ({
  onRequestDemo,
  onRegisterClick
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('SaaS & Tech');

  // Industry-specific showcase data
  const industries = [
    {
      id: 'SaaS & Tech',
      title: 'SaaS & Software Platforms',
      desc: 'Automate trial user onboarding, answer complex technical document queries via RAG, and convert visitor traffic to product demos.',
      metric: '+142% Demo Bookings',
      exampleQuery: 'How do I integrate webhooks with my custom REST API?',
      botReply: 'ChatSuite supports HMAC-SHA256 signed webhook payloads. You can register your endpoint in Dashboard > Integrations in under 2 minutes!'
    },
    {
      id: 'E-Commerce',
      title: 'E-Commerce & Online Retail',
      desc: 'Recommend personalized products, answer order status tracking questions, and handle instant return policies 24/7.',
      metric: '84% First-Contact Resolution',
      exampleQuery: 'Where is my order #CS-94021 and what is your return policy?',
      botReply: 'Order #CS-94021 is out for delivery with FedEx (Tracking: 1Z999). Returns are 100% free within 30 days of delivery!'
    },
    {
      id: 'Financial Services',
      title: 'Financial & Wealth Services',
      desc: 'SOC2 and GDPR compliant assistant answering fee structures, account opening steps, and mortgage rate queries.',
      metric: '3.4x Faster Qualification',
      exampleQuery: 'What are your current fixed-rate mortgage options for first-time buyers?',
      botReply: 'Our 30-year fixed rates currently start at 5.85% APY with zero pre-payment penalties. Would you like to check pre-approval requirements?'
    },
    {
      id: 'Healthcare',
      title: 'Healthcare & Wellness Clinics',
      desc: 'Schedule patient appointments, answer insurance coverage FAQs, and route emergency inquiries to live staff.',
      metric: '72% Call Volume Reduction',
      exampleQuery: 'Do you accept Blue Cross PPO for preventative care consultations?',
      botReply: 'Yes! We are an in-network provider for Blue Cross PPO. Annual preventative checkups are covered at 100% with no co-pay.'
    },
    {
      id: 'Legal',
      title: 'Legal Practices & Advisory',
      desc: 'Qualify prospective case clients, collect intake details securely, and book initial consultations automatically.',
      metric: '$320k Additional Pipeline',
      exampleQuery: 'I need assistance with a corporate patent trademark filing in California.',
      botReply: 'Our IP law team specializes in CA state and USPTO filings. Let me gather 2 quick details to match you with a senior partner.'
    }
  ];

  const currentInd = industries.find((i) => i.id === selectedIndustry) || industries[0];

  // Feature Comparison Matrix Data
  const comparisonMatrix = [
    { feature: 'RAG PDF & URL Document Knowledge Base', chatsuite: true, liveChat: false, ruleBot: false },
    { feature: '24/7 Autonomous Lead Capture & Qualification', chatsuite: true, liveChat: false, ruleBot: 'Partial' },
    { feature: '100% White-Label Agency Reselling', chatsuite: true, liveChat: false, ruleBot: false },
    { feature: 'Sub-250ms Response Latency', chatsuite: true, liveChat: false, ruleBot: true },
    { feature: 'Multi-Language Auto Translation (50+ languages)', chatsuite: true, liveChat: false, ruleBot: false },
    { feature: 'Zero Human Operator Salary / Staffing Cost', chatsuite: true, liveChat: false, ruleBot: true },
    { feature: 'Zero Hallucination Grounding Safeguards', chatsuite: true, liveChat: false, ruleBot: true }
  ];

  // Testimonials
  const testimonials = [
    {
      quote: 'ChatSuite AI reduced our support ticket inbox by 78% in the first two weeks while doubling our inbound trial conversion rate.',
      author: 'David Sterling',
      role: 'VP of Customer Success',
      company: 'TechFlow SaaS',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    {
      quote: 'The white-label agency portal allowed us to launch branded AI assistants for 14 local business clients within 48 hours. Phenomenal ROI!',
      author: 'Elena Rostova',
      role: 'Agency Founder',
      company: 'Apex Digital Growth',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80'
    },
    {
      quote: 'Our patients love getting instant answers to insurance coverage questions at midnight. It saved our front-desk 25 hours every week.',
      author: 'Dr. Michael Vance',
      role: 'Clinical Director',
      company: 'Vance Health Partners',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="space-y-20 py-12">
      {/* SECTION 1: INDUSTRY USE CASES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-6 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Building size={13} /> Industry-Tailored AI Operations
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            Tailored Automation Solutions for Every Sector
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            See how ChatSuite AI's grounding engine adapts to domain-specific knowledge bases.
          </p>
        </div>

        {/* Industry Switcher Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {industries.map((ind) => (
            <button
              key={ind.id}
              onClick={() => {
                setSelectedIndustry(ind.id);
                trackGrowthEvent('industry_tab_clicked', { industry: ind.id });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedIndustry === ind.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                  : 'bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {ind.id}
            </button>
          ))}
        </div>

        {/* Active Industry Showcase Card */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-block uppercase">
              {currentInd.metric}
            </span>
            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
              {currentInd.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {currentInd.desc}
            </p>

            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={onRequestDemo}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Calendar size={14} /> Request {currentInd.id} Demo
              </button>
            </div>
          </div>

          {/* Interactive Chat Conversation Simulation */}
          <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 space-y-3 font-sans">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
              <span>Live Assistant Simulation ({currentInd.id})</span>
              <span className="text-emerald-500 flex items-center gap-1">● Grounded RAG</span>
            </div>

            {/* Visitor message */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-3 rounded-xl text-xs text-slate-800 dark:text-slate-200 max-w-[85%] self-start shadow-xs">
              <p className="font-bold text-[10px] text-slate-400 mb-0.5">Website Visitor:</p>
              {currentInd.exampleQuery}
            </div>

            {/* Bot response */}
            <div className="bg-blue-600 text-white p-3 rounded-xl text-xs ml-auto max-w-[85%] shadow-md">
              <p className="font-bold text-[10px] text-blue-200 mb-0.5 flex items-center gap-1">
                <Sparkles size={11} /> ChatSuite Assistant:
              </p>
              {currentInd.botReply}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: FEATURE COMPARISON MATRIX */}
      <section className="max-w-7xl mx-auto px-6 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Layers size={13} /> Competitive Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            Why Modern SaaS Brands Choose ChatSuite AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            A side-by-side comparison between ChatSuite AI, legacy human live chat, and basic decision-tree bots.
          </p>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold">
                  <th className="p-4 sm:p-5">Platform Capability</th>
                  <th className="p-4 sm:p-5 text-center text-blue-600 dark:text-blue-400 font-display font-extrabold text-sm bg-blue-500/5">
                    ChatSuite AI
                  </th>
                  <th className="p-4 sm:p-5 text-center text-slate-500">Traditional Live Chat</th>
                  <th className="p-4 sm:p-5 text-center text-slate-500">Basic Rule Chatbots</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {comparisonMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4 sm:p-5 font-bold text-slate-800 dark:text-slate-200">{row.feature}</td>
                    
                    <td className="p-4 sm:p-5 text-center bg-blue-500/5">
                      <CheckCircle2 size={18} className="text-blue-600 dark:text-blue-400 mx-auto" />
                    </td>

                    <td className="p-4 sm:p-5 text-center text-slate-400">
                      {row.liveChat === false ? (
                        <X size={16} className="text-slate-300 dark:text-slate-600 mx-auto" />
                      ) : (
                        row.liveChat
                      )}
                    </td>

                    <td className="p-4 sm:p-5 text-center text-slate-400">
                      {row.ruleBot === false ? (
                        <X size={16} className="text-slate-300 dark:text-slate-600 mx-auto" />
                      ) : row.ruleBot === true ? (
                        <Check size={16} className="text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-[10px] font-mono text-amber-500">{row.ruleBot}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 3: TESTIMONIALS & SOCIAL PROOF */}
      <section className="max-w-7xl mx-auto px-6 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Star size={13} className="fill-amber-500" /> Rated 4.9/5 by 1,200+ Businesses
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            Trusted by Growth & Engineering Leaders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.author}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{t.role}, {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: DEMO CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 sm:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-3 max-w-2xl relative z-10">
            <h2 className="text-2xl sm:text-3xl font-display font-bold">
              Ready to automate 80%+ of your customer inquiries?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Join 1,200+ companies deploying AI assistants in under 5 minutes. No credit card required to start your 14-day free trial.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 relative z-10 shrink-0 w-full md:w-auto">
            <button
              onClick={onRegisterClick}
              className="px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer text-center"
            >
              Start Free Trial Now
            </button>
            <button
              onClick={onRequestDemo}
              className="px-6 py-3 bg-blue-700/80 hover:bg-blue-800 text-white border border-blue-400/30 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <Calendar size={14} /> Request Enterprise Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
