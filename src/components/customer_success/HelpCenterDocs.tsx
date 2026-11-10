import React, { useState } from 'react';
import { 
  Search, BookOpen, Play, HelpCircle, FileText, Code, Check, 
  Copy, ExternalLink, Keyboard, Sparkles, ChevronRight, Video, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HelpCenterDocsProps {
  addToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  onNavigateToSection: (section: string) => void;
}

export const HelpCenterDocs: React.FC<HelpCenterDocsProps> = ({
  addToast,
  onNavigateToSection
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<any | null>(null);
  const [showKeyboardModal, setShowKeyboardModal] = useState(false);
  
  // Troubleshooting Wizard State
  const [troubleIssue, setTroubleIssue] = useState<string | null>(null);

  const faqCategories = [
    { id: 'all', label: 'All Articles' },
    { id: 'quickstart', label: 'Quick Start' },
    { id: 'embedding', label: 'Website Embeds' },
    { id: 'rag', label: 'RAG Knowledge' },
    { id: 'api', label: 'API & Webhooks' },
    { id: 'billing', label: 'Billing & Plans' }
  ];

  const articles = [
    {
      id: 1,
      category: 'quickstart',
      title: 'Platform Quick Start Guide',
      summary: 'Learn how ChatSuite AI initializes RAG models, ingests customer support files, and streams real-time responses.',
      code: `// Test ChatSuite AI REST endpoint
curl -X POST https://your-domain.com/api/chat/message \\
  -H "Content-Type: application/json" \\
  -d '{"message": "What is your refund policy?", "botId": "bot-default"}'`
    },
    {
      id: 2,
      category: 'embedding',
      title: 'Embedding Widget on WordPress & Shopify',
      summary: 'Detailed instructions for inserting the asynchronous ChatSuite widget script into Shopify theme.liquid or WordPress Header.',
      code: `<script src="https://chatsuite.ai/widget.js" data-bot-id="YOUR_BOT_ID" defer></script>`
    },
    {
      id: 3,
      category: 'rag',
      title: 'Optimizing PDF Document Ingestion for RAG Grounding',
      summary: 'Guidelines for uploading catalogues, policy documents, and manuals for optimal Gemini 3.6 Flash neural grounding.',
      code: `Tip: Ensure PDF documents contain searchable text layers and explicit section headers.`
    },
    {
      id: 4,
      category: 'api',
      title: 'Outbound Webhook Event Payloads & Zapier Connectors',
      summary: 'Structure of real-time JSON payloads emitted upon visitor lead capture or support ticket creation.',
      code: `{\n  "event": "lead_captured",\n  "botId": "bot-default",\n  "visitorName": "Alex Morgan",\n  "email": "alex@company.com"\n}`
    },
    {
      id: 5,
      category: 'billing',
      title: 'Understanding AI Token Usage & Credit Limits',
      summary: 'How Gemini 3.6 Flash prompt tokens, knowledge chunking, and voice audio streaming consume monthly plan credits.',
      code: `PRO Plan: Includes 100,000 monthly AI queries + unlimited PDF ingestion.`
    }
  ];

  const videoTutorials = [
    {
      id: 'vid-1',
      title: 'How to Build an AI Support Agent in 5 Minutes',
      duration: '4:12',
      thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80',
      chapters: [
        { time: '0:00', title: 'Introduction & Bot Persona' },
        { time: '1:15', title: 'Uploading Knowledge Base PDFs' },
        { time: '2:40', title: 'Configuring Gemini AI Model' },
        { time: '3:30', title: 'Testing & Deploying Widget' }
      ]
    },
    {
      id: 'vid-2',
      title: 'RAG Grounding & Website URL Crawling In-Depth',
      duration: '6:45',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
      chapters: [
        { time: '0:00', title: 'Understanding Vector Indexing' },
        { time: '2:10', title: 'Crawling Sitemap URLs' },
        { time: '4:50', title: 'Testing AI Citations' }
      ]
    }
  ];

  const keyboardShortcuts = [
    { keys: ['Cmd', 'K'], desc: 'Open Workspace Command Palette' },
    { keys: ['Cmd', 'B'], desc: 'Quick Jump to Chatbot Studio' },
    { keys: ['Cmd', 'R'], desc: 'Open RAG Knowledge Base Studio' },
    { keys: ['Cmd', 'I'], desc: 'Open Conversations Inbox' },
    { keys: ['Cmd', '/'], desc: 'Toggle Keyboard Shortcuts Guide' }
  ];

  const filteredArticles = articles.filter(art => {
    const matchCat = selectedCategory === 'all' || art.category === selectedCategory;
    const matchQuery = searchQuery === '' || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(idx);
    addToast('success', 'Code Snippet Copied!', 'Pasted to your clipboard.');
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Search Header Banner */}
      <div className="bg-gradient-to-tr from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <BookOpen size={14} /> Official Documentation & Technical Hub
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">How can we help you build today?</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Search developer documentation, widget installation scripts, RAG grounding guidelines, and video tutorials.
          </p>

          <div className="relative pt-2">
            <Search className="absolute left-4 top-5 text-slate-400" size={18} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search docs, e.g. WordPress, Shopify, Webhooks, RAG, API..."
              className="w-full pl-11 pr-24 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium shadow-inner"
            />
            <button
              onClick={() => setShowKeyboardModal(true)}
              className="absolute right-3 top-3.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-[10px] font-mono font-bold text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Keyboard size={13} /> Shortcuts
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {faqCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-[#0B1120] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map((art) => (
          <div key={art.id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[9px] uppercase font-bold tracking-wider font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                {art.category}
              </span>
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-snug">{art.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{art.summary}</p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 relative font-mono text-[11px] text-slate-300">
              <button 
                onClick={() => copyCode(art.code, art.id)}
                className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white cursor-pointer p-1"
                title="Copy snippet"
              >
                {copiedCodeIndex === art.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
              <pre className="overflow-x-auto max-w-full whitespace-pre-wrap pr-6">
                <code>{art.code}</code>
              </pre>
            </div>
          </div>
        ))}
      </div>

      {/* Video Tutorials Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase font-bold tracking-wider font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Video size={15} className="text-blue-500" /> Guided Video Tutorials
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {videoTutorials.map((vid) => (
            <div 
              key={vid.id}
              onClick={() => setActiveVideoModal(vid)}
              className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:border-blue-400 transition-all cursor-pointer group"
            >
              <div className="relative h-44 overflow-hidden bg-slate-900">
                <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play size={20} className="ml-1" />
                  </div>
                </div>
                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-mono font-bold backdrop-blur-xs">
                  {vid.duration}
                </span>
              </div>

              <div className="p-4 space-y-1">
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {vid.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {vid.chapters.length} Timed Chapters • Interactive Walkthrough
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Troubleshooting Wizard */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle size={18} className="text-amber-500" />
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
            Interactive Troubleshooting Diagnostics
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select an issue you are experiencing to run automated diagnostic checks:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'widget_missing', label: 'Widget not appearing on website' },
            { id: 'generic_answers', label: 'AI bot giving generic answers' },
            { id: 'webhook_failing', label: 'Webhook HTTP status non-200' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTroubleIssue(item.id)}
              className={`p-3.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                troubleIssue === item.id 
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500 text-amber-700 dark:text-amber-300' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-amber-300 text-slate-700 dark:text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {troubleIssue && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} 
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs"
          >
            <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-[10px] uppercase">Diagnostic Solution:</span>
            {troubleIssue === 'widget_missing' && (
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Check that the script tag includes <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">defer</code> and your domain is whitelisted in <strong>White-Label & Branding -&gt; Custom Domains</strong>.
              </p>
            )}
            {troubleIssue === 'generic_answers' && (
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Your Knowledge Base might need higher chunk density. Go to <strong>RAG Knowledge Base</strong> and click <em>Re-index Source Vectors</em>.
              </p>
            )}
            {troubleIssue === 'webhook_failing' && (
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Verify your receiver endpoint returns an HTTP <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">200 OK</code> within 5000ms. Check recent payloads in <strong>Chatbot Studio -&gt; Webhook Logs</strong>.
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* VIDEO MODAL */}
      <AnimatePresence>
        {activeVideoModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-4"
            >
              <div className="relative aspect-video bg-slate-950 flex items-center justify-center text-white">
                <img src={activeVideoModal.thumbnail} alt="" className="w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl cursor-pointer hover:scale-105 transition-transform">
                    <Play size={28} className="ml-1" />
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-900/80 px-3 py-1 rounded-full">
                    Streaming Interactive Player • {activeVideoModal.duration}
                  </span>
                </div>
                <button 
                  onClick={() => setActiveVideoModal(null)}
                  className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  {activeVideoModal.title}
                </h3>

                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-mono font-bold text-slate-400">Chapters & Timestamps</h4>
                  <div className="space-y-1">
                    {activeVideoModal.chapters.map((ch: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{ch.title}</span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{ch.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* KEYBOARD SHORTCUTS MODAL */}
      <AnimatePresence>
        {showKeyboardModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <Keyboard size={20} className="text-blue-600" />
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    Keyboard Shortcuts Guide
                  </h3>
                </div>
                <button onClick={() => setShowKeyboardModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
              </div>

              <div className="space-y-2">
                {keyboardShortcuts.map((sc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{sc.desc}</span>
                    <div className="flex items-center gap-1">
                      {sc.keys.map((k, kIdx) => (
                        <kbd key={kIdx} className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 shadow-xs">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
