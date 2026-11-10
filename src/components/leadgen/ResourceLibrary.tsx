import React, { useState } from 'react';
import { BookOpen, Download, FileText, Sparkles, CheckCircle2, ShieldCheck, Search, Filter } from 'lucide-react';
import { trackGrowthEvent } from '../seo/AnalyticsScript';
import { SocialShareButtons } from '../seo/SocialShareButtons';

export interface ResourceItem {
  id: string;
  title: string;
  category: 'Whitepaper' | 'Playbook' | 'Template' | 'Calculator';
  description: string;
  fileSizeFormatted: string;
  downloadsCount: number;
  featured?: boolean;
}

export const ResourceLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDownloadModal, setActiveDownloadModal] = useState<ResourceItem | null>(null);
  const [downloadEmail, setDownloadEmail] = useState('');
  const [downloadName, setDownloadName] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const resources: ResourceItem[] = [
    {
      id: 'res-001',
      title: '2026 Enterprise AI & Customer Support ROI Benchmark Guide',
      category: 'Whitepaper',
      description: 'Comprehensive analysis of 1,200+ deployments. Benchmark ticket deflection rates, cost reductions, and INP/LCP user satisfaction impact.',
      fileSizeFormatted: '4.2 MB PDF',
      downloadsCount: 3840,
      featured: true
    },
    {
      id: 'res-002',
      title: 'The Complete RAG Knowledge Base Prompt Engineering Playbook',
      category: 'Playbook',
      description: 'Step-by-step framework for crafting custom system prompts, handling hallucinations, and indexing multi-page PDFs cleanly.',
      fileSizeFormatted: '2.8 MB PDF',
      downloadsCount: 5120,
      featured: true
    },
    {
      id: 'res-003',
      title: 'White-Label Virtual Assistant Pricing & Service Calculator',
      category: 'Calculator',
      description: 'Excel & Interactive Sheet for agencies calculating client margin markup, token utilization costs, and SLA tier pricing.',
      fileSizeFormatted: '1.1 MB XLSX',
      downloadsCount: 2910
    },
    {
      id: 'res-004',
      title: 'Website Lead Capture Chatbot Copywriting & Flow Templates',
      category: 'Template',
      description: 'Ready-to-use greeting scripts, qualification question trees, and fallbacks for E-Commerce, Financial Services, and SaaS.',
      fileSizeFormatted: '1.9 MB ZIP',
      downloadsCount: 4100
    }
  ];

  const categories = ['All', 'Whitepaper', 'Playbook', 'Template', 'Calculator'];

  const filteredResources = resources.filter((res) => {
    const matchesCat = selectedCategory === 'All' || res.category === selectedCategory;
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleDownloadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadEmail || !activeDownloadModal) return;

    setDownloading(true);
    try {
      const response = await fetch('/api/leads/resource-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: downloadEmail,
          name: downloadName,
          resourceId: activeDownloadModal.id,
          resourceTitle: activeDownloadModal.title
        })
      });

      if (response.ok) {
        setDownloadSuccess(true);
        trackGrowthEvent('resource_downloaded', {
          resourceId: activeDownloadModal.id,
          email: downloadEmail
        });
      }
    } catch (err) {
      console.error('Resource download error', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <BookOpen size={13} /> Enterprise Knowledge & Resource Center
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
          Downloadable AI Growth Playbooks & Technical Whitepapers
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Free research, prompt engineering kits, and financial calculators compiled by our principal AI engineers and growth strategists.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources..."
            className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none"
          />
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4 relative"
          >
            {res.featured && (
              <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} /> Featured Guide
              </span>
            )}

            <div className="space-y-3">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 inline-block uppercase">
                {res.category}
              </span>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-snug">
                {res.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {res.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-[11px] font-mono text-slate-400">
                <span>{res.fileSizeFormatted}</span> • <span>{res.downloadsCount.toLocaleString()} downloads</span>
              </div>
              <button
                onClick={() => {
                  setActiveDownloadModal(res);
                  setDownloadSuccess(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Download size={14} /> Download Free
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Download Gated Modal */}
      {activeDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setActiveDownloadModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              ✕
            </button>

            {!downloadSuccess ? (
              <div className="space-y-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400 flex items-center gap-3">
                  <FileText size={20} />
                  <div>
                    <h4 className="text-xs font-bold leading-tight">{activeDownloadModal.title}</h4>
                    <p className="text-[10px] font-mono opacity-80">{activeDownloadModal.fileSizeFormatted}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Enter email to unlock download</h3>
                  <p className="text-xs text-slate-400 mt-1">We will immediately dispatch the high-resolution file to your inbox.</p>
                </div>

                <form onSubmit={handleDownloadSubmit} className="space-y-3">
                  <input
                    type="text"
                    required
                    value={downloadName}
                    onChange={(e) => setDownloadName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none"
                  />
                  <input
                    type="email"
                    required
                    value={downloadEmail}
                    onChange={(e) => setDownloadEmail(e.target.value)}
                    placeholder="Work Email Address"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={downloading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    {downloading ? 'Preparing Download...' : 'Unlock & Download File'}
                  </button>
                </form>

                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                  <ShieldCheck size={12} className="text-emerald-500" /> Instant instant download link emailed immediately.
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">File Unlocked!</h3>
                <p className="text-xs text-slate-400">
                  We've sent <strong>{activeDownloadModal?.title || 'Resource'}</strong> to <strong>{downloadEmail}</strong>.
                </p>
                <SocialShareButtons title={activeDownloadModal?.title || 'Resource'} summary={activeDownloadModal?.description || ''} />
                <button
                  onClick={() => setActiveDownloadModal(null)}
                  className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
