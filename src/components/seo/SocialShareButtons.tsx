import React, { useState } from 'react';
import { Share2, Linkedin, Facebook, Twitter, Mail, Link as LinkIcon, Check, Send, X } from 'lucide-react';
import { trackGrowthEvent } from './AnalyticsScript';

interface SocialShareProps {
  url?: string;
  title?: string;
  summary?: string;
  compact?: boolean;
}

export const SocialShareButtons: React.FC<SocialShareProps> = ({
  url = typeof window !== 'undefined' ? window.location.href : 'https://chatsuite.ai',
  title = 'ChatSuite AI - Professional AI Chatbot & Customer Automation Platform',
  summary = 'Transform customer service with 24/7 automated lead capture & RAG knowledge base.',
  compact = false
}) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(summary);

  const shareLinks = [
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-[#0A66C2] text-white hover:bg-[#084e96]',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'bg-slate-900 text-white hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2] text-white hover:bg-[#125ec2]',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    },
    {
      name: 'WhatsApp',
      icon: Send,
      color: 'bg-[#25D366] text-white hover:bg-[#1eae53]',
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-indigo-600 text-white hover:bg-indigo-500',
      href: `mailto:?subject=${encodedTitle}&body=${encodedSummary}%0A%0A${encodedUrl}`
    }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    trackGrowthEvent('social_link_copied', { url });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareClick = (platform: string, href: string) => {
    trackGrowthEvent('social_share_click', { platform, url });
    if (platform !== 'Email') {
      window.open(href, '_blank', 'width=600,height=500,scrollbars=yes');
    } else {
      window.location.href = href;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {shareLinks.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => handleShareClick(item.name, item.href)}
              title={`Share on ${item.name}`}
              className={`p-1.5 rounded-lg text-xs transition-transform active:scale-95 cursor-pointer ${item.color}`}
            >
              <Icon size={13} />
            </button>
          );
        })}
        <button
          onClick={handleCopy}
          title="Copy direct page link"
          className="p-1.5 rounded-lg text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-transform active:scale-95 cursor-pointer"
        >
          {copied ? <Check size={13} className="text-emerald-500" /> : <LinkIcon size={13} />}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
        <span className="flex items-center gap-1.5">
          <Share2 size={14} className="text-blue-500" /> Share this Resource
        </span>
        {copied && <span className="text-[10px] text-emerald-500 font-mono font-bold">✓ Copied to clipboard!</span>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {shareLinks.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => handleShareClick(item.name, item.href)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer ${item.color}`}
            >
              <Icon size={13} />
              <span>{item.name}</span>
            </button>
          );
        })}

        <button
          onClick={handleCopy}
          className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          {copied ? <Check size={13} className="text-emerald-500" /> : <LinkIcon size={13} />}
          <span>{copied ? 'Copied' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
};
