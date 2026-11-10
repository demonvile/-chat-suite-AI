import React, { useState } from 'react';
import { 
  Bot, Shield, BarChart3, Languages, Headphones, Code, Zap, 
  ArrowRight, Users, CheckCircle2, MessageSquare, Play, HelpCircle,
  Cpu, LayoutGrid, FileInput, Globe, Menu, X, ArrowUpRight, Sparkles,
  Calculator, ChevronRight, BookOpen, Calendar, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatbotConfig } from '../types';
import { ChatbotWidget } from './ChatbotWidget';
import { SEOHead } from './seo/SEOHead';
import { AnalyticsScript } from './seo/AnalyticsScript';
import { ExitIntentPopup } from './leadgen/ExitIntentPopup';
import { DemoRequestModal } from './leadgen/DemoRequestModal';
import { BlogView } from './blog/BlogView';
import { ResourceLibrary } from './leadgen/ResourceLibrary';
import { GrowthLandingSections } from './landing/GrowthLandingSections';

interface LandingPageProps {
  demoBotConfig: ChatbotConfig;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  demoBotConfig,
  onLoginClick,
  onRegisterClick
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'blog' | 'resources'>('home');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProductTour, setShowProductTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [locale, setLocale] = useState('en');

  // Interactive ROI Calculator State
  const [monthlyInquiries, setMonthlyInquiries] = useState(4500);
  const [costPerTicket, setCostPerTicket] = useState(5);

  // Derived ROI calculations
  const automatedTickets = Math.round(monthlyInquiries * 0.82);
  const monthlySavings = automatedTickets * costPerTicket;
  const annualSavings = monthlySavings * 12;
  const hoursSavedPerMonth = Math.round((automatedTickets * 8) / 60);

  // Local state for contact message submission
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // Marketing pricing plans
  const plans = [
    {
      name: 'Starter Plan',
      desc: 'Perfect for small blogs and local companies looking to automate customer replies.',
      priceMonthly: 29,
      priceAnnual: 19,
      features: [
        '1 Active Custom Chatbot',
        '2,000 AI Messages / Month',
        'Standard Ground FAQ base',
        'Basic Leads Capture Form',
        'Dark & Light Mode Widget styling',
        'Standard Email Support'
      ]
    },
    {
      name: 'Professional Plan',
      desc: 'Our most popular tier. Full white-label capabilities and larger AI processing allowances.',
      priceMonthly: 79,
      priceAnnual: 59,
      features: [
        '3 Active Custom Chatbots',
        '10,000 AI Messages / Month',
        'Trained PDF & Knowledge uploads',
        'Full Custom branding (No "Powered by")',
        'Integrated Contact Ticket Form',
        'Dedicated Analytics Dashboard',
        'API Keys programmatic access'
      ],
      popular: true
    },
    {
      name: 'Enterprise Plan',
      desc: 'Designed for scaled teams requiring full custom deployments and multi-language models.',
      priceMonthly: 249,
      priceAnnual: 189,
      features: [
        'Unlimited Active Chatbots',
        'Unlimited AI Messages',
        'Trained Website URL Crawling',
        'Multi-Language Translation support',
        'Priority Phone & Video support',
        'Custom Service-Level Agreements',
        'Dedicated server scaling assistance'
      ]
    }
  ];

  // Landing FAQs
  const landingFaqs = [
    { q: 'How does ChatSuite AI help my business?', a: 'ChatSuite AI acts as your tireless 24/7 sales agent. It answers repetitive questions instantly, captures customer lead contact information, and channels complicated support inquiries to your dashboard via tickets.' },
    { q: 'Do I need coding experience to install the chatbot?', a: 'No coding is required! Once you design your chatbot in our intuitive builder, we generate a simple script code. Just copy and paste that script into your website editor, and the bot launches instantly.' },
    { q: 'Can I change my bot appearance to match my brand?', a: 'Absolutely! Our professional visual editor lets you alter colors, choose light/dark templates, position the floating launcher, and customize all greetings and placeholders.' },
    { q: 'What is the PDF knowledge feature?', a: 'You can drag and drop any text or PDF file (like pricing catalogues, company briefs, or product instructions) into your dashboard. Our AI parses and trains on this text instantly, allowing visitors to ask highly detailed inquiries about your specific documents.' }
  ];

  const tourSteps = [
    {
      title: '1. Instant RAG & Document Knowledge Base',
      desc: 'Upload PDFs, Word docs, spreadsheets, or paste page URLs. Our vector engine instantly indexes your data with zero manual model training.',
      icon: FileInput,
      highlight: '99.4% factual accuracy without hallucinations.'
    },
    {
      title: '2. 100% White-Label Customization',
      desc: 'Match your exact brand design. Tailor launcher colors, dark/light modes, floating positions, avatars, and welcome triggers.',
      icon: LayoutGrid,
      highlight: 'Remove vendor branding completely for agency reselling.'
    },
    {
      title: '3. Autonomous Multi-channel Voice & AI Agents',
      desc: 'Deploy natural sounding speech synthesis and live voice transcription so visitors can speak or listen naturally on mobile and desktop.',
      icon: Headphones,
      highlight: 'Sub-250ms latency response times across 50+ languages.'
    },
    {
      title: '4. Automated Lead Capture & CRM Sync',
      desc: 'Trigger interactive lead forms mid-chat, collect contact cards, and sync incoming prospects directly to your CRM and inbox.',
      icon: Users,
      highlight: 'Convert up to 4.8x more traffic into qualified leads.'
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactMsg) return;
    setContactSent(true);
    setContactEmail('');
    setContactMsg('');
    setTimeout(() => setContactSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* 0. SEO & Analytics System */}
      <SEOHead
        title="ChatSuite AI - Professional AI Chatbot & RAG Automation Platform"
        description="Deploy white-labeled AI virtual agents trained on custom PDFs and websites. Automate 82%+ of customer support and double lead conversion rates."
        canonicalUrl="https://chatsuite.ai"
        schemas={[
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: landingFaqs.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a
              }
            }))
          }
        ]}
      />
      <AnalyticsScript />
      <ExitIntentPopup />
      <DemoRequestModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />

      {/* 1. Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-md shadow-teal-700/10">
            <Bot size={20} />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900">ChatSuite AI</span>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('home')}
            className={`transition-colors cursor-pointer ${activeTab === 'home' ? 'text-teal-700 font-bold border-b-2 border-teal-700 pb-0.5' : 'hover:text-teal-700'}`}
          >
            Platform Overview
          </button>
          <a href="#features" onClick={() => setActiveTab('home')} className="hover:text-teal-700 transition-colors">Features</a>
          <a href="#calculator" onClick={() => setActiveTab('home')} className="hover:text-teal-700 transition-colors">ROI Calculator</a>
          <button
            onClick={() => setActiveTab('blog')}
            className={`transition-colors cursor-pointer flex items-center gap-1 ${activeTab === 'blog' ? 'text-teal-700 font-bold border-b-2 border-teal-700 pb-0.5' : 'hover:text-teal-700'}`}
          >
            <BookOpen size={13} /> Blog & AI Articles
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`transition-colors cursor-pointer flex items-center gap-1 ${activeTab === 'resources' ? 'text-teal-700 font-bold border-b-2 border-teal-700 pb-0.5' : 'hover:text-teal-700'}`}
          >
            <Download size={13} /> Resource Playbooks
          </button>
          <a href="#pricing" onClick={() => setActiveTab('home')} className="hover:text-teal-700 transition-colors">Pricing</a>
          <a href="#faqs" onClick={() => setActiveTab('home')} className="hover:text-teal-700 transition-colors">FAQs</a>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {/* Locale Switcher */}
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
            <Globe size={12} className="text-slate-400" />
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-slate-700 font-bold"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="fr">FR</option>
              <option value="de">DE</option>
              <option value="ja">JA</option>
            </select>
          </div>

          <button 
            onClick={() => setDemoModalOpen(true)}
            className="text-xs font-bold px-3 py-2 text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Calendar size={13} /> Request Demo
          </button>
          <button 
            onClick={onLoginClick}
            className="text-xs font-bold px-3.5 py-2 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Log In
          </button>
          <button 
            onClick={onRegisterClick}
            className="text-xs font-bold px-4.5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-md shadow-teal-700/10 hover:shadow-lg transition-all cursor-pointer flex items-center gap-1"
          >
            Get Started Free <ArrowUpRight size={13} />
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer rounded-lg hover:bg-slate-100"
          aria-label="Toggle Mobile Menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 p-5 space-y-2 text-xs font-bold text-slate-600 flex flex-col">
          <button onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }} className="text-left py-2.5 px-3 min-h-[44px] flex items-center rounded-lg hover:bg-slate-50 hover:text-teal-700">Platform Overview</button>
          <button onClick={() => { setActiveTab('blog'); setMobileMenuOpen(false); }} className="text-left py-2.5 px-3 min-h-[44px] flex items-center rounded-lg hover:bg-slate-50 hover:text-teal-700">Blog Articles</button>
          <button onClick={() => { setActiveTab('resources'); setMobileMenuOpen(false); }} className="text-left py-2.5 px-3 min-h-[44px] flex items-center rounded-lg hover:bg-slate-50 hover:text-teal-700">Resource Playbooks</button>
          <button onClick={() => { setDemoModalOpen(true); setMobileMenuOpen(false); }} className="text-left py-2.5 px-3 min-h-[44px] flex items-center rounded-lg hover:bg-indigo-50 text-indigo-600">Request Demo Session</button>
          <hr className="border-slate-100 my-2" />
          <div className="flex gap-3 pt-1">
            <button onClick={() => { onLoginClick(); setMobileMenuOpen(false); }} className="text-slate-600 flex-1 py-3 min-h-[44px] rounded-xl border border-slate-200 text-center font-bold">Log In</button>
            <button onClick={() => { onRegisterClick(); setMobileMenuOpen(false); }} className="bg-teal-700 text-white flex-1 py-3 min-h-[44px] rounded-xl text-center font-bold shadow-sm">Get Started</button>
          </div>
        </div>
      )}

      {/* TAB RENDERING */}
      {activeTab === 'blog' ? (
        <div className="py-8">
          <BlogView />
        </div>
      ) : activeTab === 'resources' ? (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <ResourceLibrary />
        </div>
      ) : (
        <>
          {/* Main Landing Page Flow */}


      {/* 2. Hero Section */}
      <section className="px-6 py-16 sm:py-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side Copy */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-teal-50 via-emerald-50 to-indigo-50 border border-teal-200/60 text-teal-800 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs">
            <Cpu size={14} className="text-teal-700 animate-spin" style={{ animationDuration: '8s' }} /> 
            <span>Enterprise AI Engine Powered by Gemini 3.5 Turbo</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Deploy Autonomous <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-700 via-indigo-600 to-teal-800 bg-clip-text text-transparent">AI Virtual Agents</span> for Any Enterprise
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed font-normal">
            The white-label AI platform built for scale. Train models on custom PDFs, web knowledge graphs, and live APIs. Automate 85%+ of customer inquiries, capture qualified leads, and deliver instant 24/7 resolution.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button 
              onClick={onRegisterClick}
              className="w-full sm:w-auto px-7 py-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-xl shadow-teal-700/20 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:translate-y-[-2px] transition-all duration-200 active:translate-y-0"
            >
              <span>Build Autonomous Agent Free</span>
              <ArrowRight size={15} />
            </button>
            <button 
              onClick={() => setShowProductTour(true)}
              className="w-full sm:w-auto px-7 py-4 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl font-bold text-xs text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
            >
              <Sparkles size={15} className="text-teal-700" />
              <span>Take Interactive Product Tour</span>
            </button>
          </div>

          {/* Social Proof Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" /> 
              <span>Full White-label Customization</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" /> 
              <span>Instant 1-Line Website Script</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" /> 
              <span>No Credit Card Required</span>
            </div>
          </div>
        </div>

        {/* Right Side Dashboard Graphic or Teaser */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-[400px] bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-500 via-indigo-500 to-teal-700" />
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Live Interactive Representative</span>
              </div>
              <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold">250ms Latency</span>
            </div>
            
            <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
              Test our autonomous salesperson directly below. Inquire about custom RAG training, pricing plans, or agency white-labeling options.
            </p>

            <div className="h-[410px] border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50 shadow-inner">
              <ChatbotWidget config={demoBotConfig} inline={true} />
            </div>
          </div>
        </div>

      </section>

      {/* Animated Live Platform Statistics Counter Section */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-6 border-y border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-teal-400 font-mono">1,420,000+</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">AI Messages Handled</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-teal-400 font-mono">99.4%</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Resolution Accuracy</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-teal-400 font-mono">4.8x</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Lead Conversion Lift</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-teal-400 font-mono">&lt; 250ms</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Average Response Time</div>
          </div>
        </div>
      </section>

      {/* Trust & Enterprise Compliance Badges Banner */}
      <section className="bg-slate-100/60 border-b border-slate-200/60 py-10 px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <p className="text-center text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">
            Bank-grade enterprise security & global compliance standards
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 items-center justify-items-center opacity-75">
            <div className="flex items-center gap-2 font-bold text-slate-700 text-xs sm:text-sm">
              <Shield size={16} className="text-teal-700" />
              <span>SOC 2 TYPE II</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-slate-700 text-xs sm:text-sm">
              <CheckCircle2 size={16} className="text-teal-700" />
              <span>ISO 27001 CERTIFIED</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-slate-700 text-xs sm:text-sm">
              <Globe size={16} className="text-teal-700" />
              <span>GDPR COMPLIANT</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-slate-700 text-xs sm:text-sm">
              <Zap size={16} className="text-teal-700" />
              <span>256-BIT ENCRYPTION</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-slate-700 text-xs sm:text-sm">
              <Users size={16} className="text-teal-700" />
              <span>99.99% SLA UPTIME</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Business ROI & Cost Savings Calculator */}
      <section id="calculator" className="py-20 px-6 max-w-7xl mx-auto space-y-12 bg-white">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] uppercase font-bold tracking-widest text-teal-700 bg-teal-50 px-3.5 py-1 rounded-full font-mono border border-teal-200/50">
            Interactive Business ROI Estimator
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Calculate How Much Time & Support Cost You'll Save
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Adjust the sliders below based on your current customer support volumes to estimate annual savings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
          {/* Sliders Area */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Slider 1 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Monthly Customer Inquiries / Chats</span>
                <span className="text-teal-700 font-mono text-sm bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200/60">
                  {monthlyInquiries.toLocaleString()} / mo
                </span>
              </div>
              <input 
                type="range"
                min={500}
                max={25000}
                step={500}
                value={monthlyInquiries}
                onChange={(e) => setMonthlyInquiries(Number(e.target.value))}
                className="w-full accent-teal-700 cursor-pointer"
              />
            </div>

            {/* Slider 2 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Estimated Cost per Human Support Reply ($)</span>
                <span className="text-teal-700 font-mono text-sm bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200/60">
                  ${costPerTicket}.00
                </span>
              </div>
              <input 
                type="range"
                min={2}
                max={20}
                step={1}
                value={costPerTicket}
                onChange={(e) => setCostPerTicket(Number(e.target.value))}
                className="w-full accent-teal-700 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>Automated Resolution Rate: 82%</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Based on real customer telemetry, ChatSuite AI automatically answers 82% of routine website and catalog inquiries instantly without human intervention.
              </p>
            </div>

          </div>

          {/* Results Summary Box */}
          <div className="lg:col-span-5 bg-gradient-to-br from-teal-800 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-200 font-mono">Estimated Annual Savings</span>
              <div className="text-4xl font-extrabold text-teal-300 font-mono">${annualSavings.toLocaleString()}</div>
              <p className="text-[11px] text-teal-100/80">Net support expenditure saved annually</p>
            </div>

            <hr className="border-white/10" />

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-teal-200/80 block text-[10px]">Monthly Hours Saved</span>
                <span className="text-xl font-bold font-mono text-white">{hoursSavedPerMonth} hrs</span>
              </div>
              <div>
                <span className="text-teal-200/80 block text-[10px]">Automated Replies</span>
                <span className="text-xl font-bold font-mono text-white">{automatedTickets.toLocaleString()} / mo</span>
              </div>
            </div>

            <button
              onClick={onRegisterClick}
              className="w-full py-3 bg-teal-400 hover:bg-teal-300 text-teal-950 font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <span>Unlock Your ROI Free Trial</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Value Proposition Grid */}
      <section id="features" className="bg-white border-y border-slate-200/50 py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Everything you need to sell custom AI chatbots</h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Our SaaS platform equips you with state-of-the-art enterprise tools allowing you to configure, train, embed, and monetize chatbot virtual assistants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {/* Visual branding */}
            <div className="p-6 bg-slate-50 border border-slate-150 rounded-xl space-y-3.5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
                <LayoutGrid size={18} />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Deep Visual Customization</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Brand chatbots to look fully native. Alter theme styles, choose floating launcher locations, pick color profiles, and customize all greetings.
              </p>
            </div>

            {/* Document Knowledge Training */}
            <div className="p-6 bg-slate-50 border border-slate-150 rounded-xl space-y-3.5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <FileInput size={18} />
              </div>
              <h3 className="font-bold text-sm text-slate-900">PDF & URL Knowledge Base</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Drag and drop PDFs, textual documents, or paste reference page URLs. The AI chatbot trains instantly, serving as a custom encyclopedia.
              </p>
            </div>

            {/* Leads Automation */}
            <div className="p-6 bg-slate-50 border border-slate-150 rounded-xl space-y-3.5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Users size={18} />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Interactive Lead Forms</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automatically capture customer contact cards. Trigger beautiful intake overlays mid-chat or require them before the session begins.
              </p>
            </div>

            {/* Voice messaging */}
            <div className="p-6 bg-slate-50 border border-slate-150 rounded-xl space-y-3.5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                <Headphones size={18} />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Integrated Voice Core</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Empower dynamic accessibility! Toggle on speech synthesis to listen to replies or talk directly to the bot using integrated voice transcription.
              </p>
            </div>

            {/* Performance Analytics */}
            <div className="p-6 bg-slate-50 border border-slate-150 rounded-xl space-y-3.5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <BarChart3 size={18} />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Deep Performance Analytics</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Display analytics charts. Monitor chat volumes, lead conversion ratios, satisfaction index rates, popular FAQ targets, and multi-language use.
              </p>
            </div>

            {/* Code Embed */}
            <div className="p-6 bg-slate-50 border border-slate-150 rounded-xl space-y-3.5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
                <Code size={18} />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Programmatic APIs & Embeds</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Get a clean 1-line script code tag to embed anywhere, or access secret credentials to query our chatbot backend APIs programmatically.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Comparison Matrix Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-12 bg-slate-50 border-b border-slate-200/60">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] uppercase font-bold tracking-widest text-teal-700 bg-teal-50 px-3.5 py-1 rounded-full font-mono border border-teal-200/50">
            Platform Capabilities Matrix
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Enterprise CX Teams Choose ChatSuite AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Compare ChatSuite AI against traditional rule-based chatbots and generic AI wrappers.
          </p>
        </div>

        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 font-bold text-slate-700">
                <th className="p-4 sm:p-5 w-2/5">Capability / Feature</th>
                <th className="p-4 sm:p-5 text-center text-teal-700 font-extrabold bg-teal-50/50 border-x border-teal-100/60">ChatSuite AI</th>
                <th className="p-4 sm:p-5 text-center text-slate-400 font-medium">Legacy Live Chat</th>
                <th className="p-4 sm:p-5 text-center text-slate-400 font-medium">Static Rule-Based Bots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
              <tr>
                <td className="p-4 sm:p-5 font-bold text-slate-900">Custom PDF & URL RAG Training</td>
                <td className="p-4 sm:p-5 text-center bg-teal-50/30 border-x border-teal-100/30 text-emerald-600 font-bold">✓ Instant Vector Ingestion</td>
                <td className="p-4 sm:p-5 text-center text-rose-500 font-medium">✕ Manual Training</td>
                <td className="p-4 sm:p-5 text-center text-rose-500 font-medium">✕ Not Supported</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-bold text-slate-900">Response Latency</td>
                <td className="p-4 sm:p-5 text-center bg-teal-50/30 border-x border-teal-100/30 text-emerald-600 font-bold">&lt; 250ms Instant AI</td>
                <td className="p-4 sm:p-5 text-center text-slate-500 font-medium">5-15 Minutes (Human)</td>
                <td className="p-4 sm:p-5 text-center text-slate-500 font-medium">Immediate (Rigid)</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-bold text-slate-900">Multi-language Context Translation</td>
                <td className="p-4 sm:p-5 text-center bg-teal-50/30 border-x border-teal-100/30 text-emerald-600 font-bold">✓ 50+ Languages Auto</td>
                <td className="p-4 sm:p-5 text-center text-rose-500 font-medium">✕ Requires Multilingual Staff</td>
                <td className="p-4 sm:p-5 text-center text-rose-500 font-medium">✕ Static Script Only</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-bold text-slate-900">Interactive Lead Intake & Appointment Booking</td>
                <td className="p-4 sm:p-5 text-center bg-teal-50/30 border-x border-teal-100/30 text-emerald-600 font-bold">✓ Native Overlays & Sync</td>
                <td className="p-4 sm:p-5 text-center text-slate-500 font-medium">Manual Copy/Paste</td>
                <td className="p-4 sm:p-5 text-center text-rose-500 font-medium">✕ Basic Form Only</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-bold text-slate-900">Voice Synthesis & Speech Recognition</td>
                <td className="p-4 sm:p-5 text-center bg-teal-50/30 border-x border-teal-100/30 text-emerald-600 font-bold">✓ Integrated Voice Engine</td>
                <td className="p-4 sm:p-5 text-center text-rose-500 font-medium">✕ Text Only</td>
                <td className="p-4 sm:p-5 text-center text-rose-500 font-medium">✕ Text Only</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-bold text-slate-900">Full White-label Branding Rights</td>
                <td className="p-4 sm:p-5 text-center bg-teal-50/30 border-x border-teal-100/30 text-emerald-600 font-bold">✓ 100% Brandable</td>
                <td className="p-4 sm:p-5 text-center text-slate-500 font-medium">Vendor Co-branding</td>
                <td className="p-4 sm:p-5 text-center text-slate-500 font-medium">Vendor Co-branding</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Pricing grid area */}
      <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Flexible plans built to grow with your business</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Choose the perfect plan to deploy custom chatbots. Switch billing periods to save up to 20% on annual commitments.
          </p>

          {/* Monthly / annual billing slider toggle */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className={`text-xs font-bold ${billingPeriod === 'monthly' ? 'text-teal-700' : 'text-slate-400'}`}>Monthly Billing</span>
            <button 
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
              className="w-11 h-6 bg-teal-700 rounded-full relative cursor-pointer p-0.5 transition-colors"
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${billingPeriod === 'annual' ? 'translate-x-5' : ''}`} />
            </button>
            <span className={`text-xs font-bold flex items-center gap-1 ${billingPeriod === 'annual' ? 'text-teal-700' : 'text-slate-400'}`}>
              Annual Commits <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 items-stretch">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`bg-white border rounded-2xl p-6 shadow-xs relative flex flex-col justify-between ${
                plan.popular 
                  ? 'border-teal-500 ring-2 ring-teal-500/10' 
                  : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <span className="absolute top-0 right-6 -translate-y-1/2 bg-teal-700 text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Highly Recommended
                </span>
              )}

              <div className="space-y-4">
                <h3 className="font-extrabold text-base text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{plan.desc}</p>
                
                <div className="pt-2 border-b border-slate-100 pb-4">
                  <span className="text-4xl font-extrabold text-slate-900">${billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceAnnual}</span>
                  <span className="text-xs text-slate-400 font-medium"> / Month</span>
                </div>

                <ul className="space-y-2.5 pt-2 text-xs text-slate-600">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={onRegisterClick}
                className={`w-full py-2.5 mt-8 font-bold text-xs rounded-xl cursor-pointer transition-all text-center flex items-center justify-center gap-1.5 ${
                  plan.popular 
                    ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-md shadow-teal-700/10' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Select {plan.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Testimonials Social Proof */}
      <section className="bg-white border-t border-slate-200/50 py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-[10px] uppercase font-bold tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full font-mono">
              Proven Results
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              What customer experience leaders say
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Read how companies are automating FAQ support, qualifying hot leads, and offering seamless white-label integrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Testimonial 1 */}
            <div className="p-6 bg-slate-50 border border-slate-150 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="flex text-amber-400">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-650 italic leading-relaxed">
                  "Since deploying ChatSuite on our landing pages, our average customer support reply time dropped from 12 hours to instant. We captured over 400 qualified customer leads in our first month alone."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-3.5 border-t border-slate-200/60">
                <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  SJ
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Sarah Jenkins</h4>
                  <p className="text-[10px] text-slate-400">Head of CX, TechFlow Inc</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-6 bg-slate-50 border border-slate-150 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="flex text-amber-400">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-650 italic leading-relaxed">
                  "As a marketing agency, white-labeling is everything. Our buyers believe we engineered this custom virtual representative in-house. It has added a completely new recurring monthly revenue pipeline."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-3.5 border-t border-slate-200/60">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  MT
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Marcus Thorne</h4>
                  <p className="text-[10px] text-slate-400">CEO, Thorne Agency Group</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-6 bg-slate-50 border border-slate-150 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="flex text-amber-400">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-650 italic leading-relaxed">
                  "The instant document training is unbelievable. We dragged and dropped our complex 50-page pricing and catalog manuals, and the chatbot instantly answers specific technical requests without hallucinating."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-3.5 border-t border-slate-200/60">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  DL
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">David Liang</h4>
                  <p className="text-[10px] text-slate-400">Operations Lead, Apex Hardware</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Growth Sections: Industry Use Cases, Comparison Matrix, Testimonials Wall */}
      <GrowthLandingSections
        onRequestDemo={() => setDemoModalOpen(true)}
        onRegisterClick={onRegisterClick}
      />

      {/* 5. FAQs section */}
      <section id="faqs" className="bg-slate-100 border-t border-slate-200/50 py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-slate-500">Got questions about white-label support capabilities? We have answers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {landingFaqs.map((faq) => (
              <div key={faq.q} className="p-5 bg-white rounded-xl border border-slate-150 space-y-2">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                  <HelpCircle size={15} className="text-teal-700 shrink-0" /> {faq.q}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Lead Contact Form section */}
      <section className="py-20 px-6 max-w-4xl mx-auto space-y-10">
        <div className="bg-gradient-to-r from-teal-800 to-indigo-900 text-white rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.1),transparent)]" />
          
          <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-7 space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Need a custom enterprise setup?</h3>
              <p className="text-xs text-teal-100/85 leading-relaxed">
                Are you looking to white-label this entire application to sell custom sub-account access to thousands of companies? Contact our architect team directly.
              </p>
              
              <div className="text-xs text-teal-200/75 space-y-2 font-semibold">
                <p>✓ Custom SLA contracts</p>
                <p>✓ Dedicated database sharding guidance</p>
                <p>✓ Dedicated multi-tenant domain mapping help</p>
              </div>
            </div>

            <div className="md:col-span-5 bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/10">
              {contactSent ? (
                <div className="text-center py-6 text-teal-200 text-xs font-bold animate-bounce">
                  ✓ Your message has been sent. We'll be in touch!
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <input 
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full text-xs px-3 py-2 bg-white/10 text-white placeholder-teal-200 border border-white/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400 focus:bg-white/15"
                  />
                  <textarea 
                    rows={3}
                    required
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Describe your request..."
                    className="w-full text-xs px-3 py-2 bg-white/10 text-white placeholder-teal-200 border border-white/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400 focus:bg-white/15 resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-white text-teal-900 hover:bg-slate-50 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Submit Request
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>
      </>
      )}

      {/* 7. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6 border-t border-slate-850">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center shadow-md">
              <Bot size={18} />
            </div>
            <span className="font-bold text-sm tracking-tight">ChatSuite AI</span>
          </div>

          <p className="text-[11px] text-slate-500 font-mono">
            © 2026 ChatSuite AI. All rights reserved. Built with Gemini 3.5 Turbo.
          </p>
        </div>
      </footer>

      {/* Interactive Product Tour Modal */}
      <AnimatePresence>
        {showProductTour && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 relative overflow-hidden"
            >
              <button 
                onClick={() => setShowProductTour(false)} 
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 text-teal-700 font-mono text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} /> Interactive Product Guided Tour
              </div>

              {/* Step Content */}
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-xs">
                  {React.createElement(tourSteps[tourStep].icon, { size: 24 })}
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">{tourSteps[tourStep].title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{tourSteps[tourStep].desc}</p>
                <div className="p-3 bg-teal-50 border border-teal-200/60 rounded-xl text-xs font-bold text-teal-800 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
                  <span>{tourSteps[tourStep].highlight}</span>
                </div>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  {tourSteps.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${idx === tourStep ? 'bg-teal-700 w-6' : 'bg-slate-200'}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {tourStep > 0 && (
                    <button
                      onClick={() => setTourStep(tourStep - 1)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  {tourStep < tourSteps.length - 1 ? (
                    <button
                      onClick={() => setTourStep(tourStep + 1)}
                      className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
                    >
                      <span>Next Step</span>
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => { setShowProductTour(false); onRegisterClick(); }}
                      className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
                    >
                      <span>Start Free Account</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
