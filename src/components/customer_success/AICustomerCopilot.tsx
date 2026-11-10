import React, { useState } from 'react';
import { 
  Bot, Send, Sparkles, BookOpen, ArrowRight, User, RefreshCw, 
  HelpCircle, MessageSquare, AlertCircle, CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

interface AICustomerCopilotProps {
  addToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  onNavigateToSection: (section: string) => void;
}

export const AICustomerCopilot: React.FC<AICustomerCopilotProps> = ({
  addToast,
  onNavigateToSection
}) => {
  const [messages, setMessages] = useState<any[]>([
    {
      id: 'msg-init',
      sender: 'copilot',
      text: `### 👋 Hi! I am your AI Customer Success Architect.
I can answer technical questions about ChatSuite AI, guide your workspace setup, debug webhooks, or suggest optimal Gemini model configurations for your business.

How can I help you today?`,
      docs: [
        { title: 'Platform Quick Start Guide', category: 'Getting Started' },
        { title: 'Knowledge Base PDF & URL Sync', category: 'Grounding' }
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'How do I embed ChatSuite AI on Shopify or WordPress?',
    'How does RAG Grounding chunk my PDF documents?',
    'How do I set up Zapier webhooks for captured leads?',
    'What is the difference between Gemini 3.6 Flash and Pro?'
  ];

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg = { id: 'user-' + Date.now(), sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/customer-success/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend })
      });

      if (res.ok) {
        const data = await res.json();
        const copilotMsg = {
          id: 'copilot-' + Date.now(),
          sender: 'copilot',
          text: data.answer,
          docs: data.suggestedDocs || []
        };
        setMessages((prev) => [...prev, copilotMsg]);
      } else {
        throw new Error('Server returned non-200');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'copilot',
          text: 'I am temporarily experiencing network turbulence. Please feel free to open a support ticket in the Support Center tab for human assistance!'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Copilot Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                AI Customer Success Copilot
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Powered by Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Instant AI technical assistant trained on ChatSuite documentation, API references, and architecture playbooks.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuery(prompt)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 hover:border-blue-400 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer shrink-0 transition-all shadow-xs"
          >
            💡 {prompt}
          </button>
        ))}
      </div>

      {/* Conversation Window */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs min-h-[400px] max-h-[550px] flex flex-col justify-between overflow-hidden">
        
        {/* Messages Stream */}
        <div className="overflow-y-auto space-y-4 pr-2 flex-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'copilot' && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`max-w-2xl p-4 rounded-2xl space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </div>

                {msg.docs && msg.docs.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <BookOpen size={12} /> Suggested Documentation:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.docs.map((doc: any, dIdx: number) => (
                        <button
                          key={dIdx}
                          onClick={() => onNavigateToSection('help')}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                        >
                          <span>{doc.title}</span>
                          <ArrowRight size={12} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center animate-pulse">
                <Bot size={16} />
              </div>
              <span className="font-mono">AI Customer Success Copilot is analyzing query...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
            placeholder="Ask AI Copilot anything about ChatSuite AI..."
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          />
          <button
            onClick={() => handleSendQuery()}
            disabled={loading || !inputQuery.trim()}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-2xl font-bold text-xs cursor-pointer shadow-md shadow-blue-600/20 flex items-center gap-1.5"
          >
            <Send size={15} />
            <span>Ask</span>
          </button>
        </div>
      </div>

    </div>
  );
};
