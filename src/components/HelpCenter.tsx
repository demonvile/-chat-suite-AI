import React, { useState } from 'react';
import { 
  LifeBuoy, Search, BookOpen, Code, FileText, Globe, Zap, 
  ChevronRight, ExternalLink, MessageSquare, Check, Copy
} from 'lucide-react';

interface HelpCenterProps {
  onAddToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  onNavigateToSection: (section: string) => void;
}

export const HelpCenter: React.FC<HelpCenterProps> = ({ onAddToast, onNavigateToSection }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const guides = [
    {
      id: 1,
      category: 'embedding',
      title: 'Embedding Chatbot on WordPress',
      summary: 'Learn how to insert your ChatSuite AI widget script snippet into WordPress themes using Header & Footer plugin or functions.php.',
      snippet: `<script src="https://your-domain.com/widget.js" data-bot-id="YOUR_BOT_ID" defer></script>`
    },
    {
      id: 2,
      category: 'embedding',
      title: 'Shopify Store Integration Guide',
      summary: 'Add instant AI customer assistance to your Shopify storefront via Theme Editor -> Edit Code -> theme.liquid template.',
      snippet: `<script src="https://your-domain.com/widget.js" data-bot-id="YOUR_BOT_ID" defer></script>`
    },
    {
      id: 3,
      category: 'knowledge',
      title: 'Optimizing PDF Document Ingestion',
      summary: 'Guidelines for uploading catalogues, policy documents, and manuals for optimal Gemini 3.5 Turbo neural grounding.',
      snippet: `Tip: Text-searchable PDFs work best. Ensure images inside PDFs have text captions.`
    },
    {
      id: 4,
      category: 'knowledge',
      title: 'Automated Website URL Crawling',
      summary: 'How our server worker crawls target HTTPS web pages, strips HTML markup, and ingests live content into your knowledge base.',
      snippet: `Example: Enter https://yourcompany.com/pricing to automatically index pricing plans.`
    },
    {
      id: 5,
      category: 'webhooks',
      title: 'Outbound Webhook Event Schemas',
      summary: 'Structure of JSON payloads sent to Zapier, Make, or custom HTTP endpoints upon visitor lead capture.',
      snippet: `{\n  "event": "lead_captured",\n  "botId": "bot-123",\n  "customerName": "Jane Doe",\n  "customerEmail": "jane@acme.com"\n}`
    },
    {
      id: 6,
      category: 'api',
      title: 'Restful API Key Authentication',
      summary: 'How to pass x-api-key headers to authenticate custom mobile app or web client conversations directly.',
      snippet: `curl -X POST https://your-domain.com/api/chat/message \\\n  -H "x-api-key: YOUR_API_KEY" \\\n  -d '{"message": "Hello", "botId": "bot-123"}'`
    }
  ];

  const filteredGuides = guides.filter(g => {
    const matchesCategory = selectedCategory === 'all' || g.category === selectedCategory;
    const matchesQuery = searchQuery === '' || 
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      g.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    onAddToast('success', 'Code Snippet Copied', 'Paste into your codebase or integration editor.');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Search Header Banner */}
      <div className="bg-gradient-to-tr from-blue-900 to-slate-900 border border-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <LifeBuoy size={14} /> Official Platform Knowledge Hub
          </div>

          <h2 className="font-display text-2xl font-bold tracking-tight">How can we help you build today?</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Search developer documentation, website embedding guides, AI knowledge ingestion rules, and outbound webhook trigger definitions.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => onNavigateToSection('rag_knowledge')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <BookOpen size={15} />
              <span>Open Enterprise RAG Knowledge Base Studio</span>
            </button>
          </div>

          <div className="relative pt-2">
            <Search className="absolute left-4 top-5 text-slate-400" size={16} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, e.g. WordPress, Shopify, Webhooks, API..."
              className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-xs text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Guides' },
          { id: 'embedding', label: 'Website Embeds' },
          { id: 'knowledge', label: 'AI Document Ingestion' },
          { id: 'webhooks', label: 'Webhooks & Events' },
          { id: 'api', label: 'Developer REST API' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-[#0B1120] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGuides.map((guide) => (
          <div key={guide.id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold tracking-wider font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                  {guide.category}
                </span>
              </div>
              <h3 className="font-display font-bold text-sm text-slate-850 dark:text-white leading-snug">{guide.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{guide.summary}</p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 relative font-mono text-[11px] text-slate-300">
              <button 
                onClick={() => copyCode(guide.snippet, guide.id)}
                className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white cursor-pointer p-1"
                title="Copy snippet"
              >
                {copiedIndex === guide.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
              <pre className="overflow-x-auto max-w-full whitespace-pre-wrap pr-6">
                <code>{guide.snippet}</code>
              </pre>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Support Ticket Banner */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-sm text-slate-850 dark:text-white">Need Dedicated Technical Assistance?</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Our support engineers assist with custom website script deployments and API setups.</p>
        </div>

        <button
          onClick={() => onNavigateToSection('tickets')}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-md shadow-blue-600/20"
        >
          View Support Tickets Pipeline
        </button>
      </div>

    </div>
  );
};
