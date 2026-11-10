import React, { useState, useEffect } from 'react';
import { 
  Search, Trash2, Calendar, MessageSquare, Copy, Check, 
  Download, Printer, AlertCircle, RefreshCw, User, Mail, 
  Phone, Globe, Star, Sparkles, ChevronRight, FileText, Bot, Pin
} from 'lucide-react';
import { Thread, Message } from '../types';

interface ConversationsInboxProps {
  token: string;
  chatbotId?: string;
}

export const ConversationsInbox: React.FC<ConversationsInboxProps> = ({ token, chatbotId }) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  const fetchThreads = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/threads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // If a specific chatbotId was passed, filter by that
        if (chatbotId) {
          const filtered = data.filter((t: Thread) => t.chatbotId === chatbotId);
          setThreads(filtered);
          if (filtered.length > 0) {
            setSelectedThread(filtered[0]);
          } else {
            setSelectedThread(null);
          }
        } else {
          setThreads(data);
          if (data.length > 0) {
            setSelectedThread(data[0]);
          } else {
            setSelectedThread(null);
          }
        }
      } else {
        setError('Failed to fetch conversation history.');
      }
    } catch (err) {
      setError('Error connecting to backend services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [chatbotId]);

  const handleDeleteThread = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this conversation transcript from your archive? This cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/threads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setThreads(threads.filter(t => t.id !== id));
        if (selectedThread?.id === id) {
          const remaining = threads.filter(t => t.id !== id);
          setSelectedThread(remaining.length > 0 ? remaining[0] : null);
        }
      } else {
        alert('Could not delete transcript.');
      }
    } catch (e) {
      alert('Network error deleting transcript.');
    }
  };

  const handleCopyTranscript = () => {
    if (!selectedThread) return;
    
    const formatted = selectedThread.messages
      .map(m => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.role === 'user' ? 'Visitor' : 'AI Agent'}: ${m.text}`)
      .join('\n');
      
    navigator.clipboard.writeText(formatted);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2500);
  };

  const handlePrintTranscript = () => {
    if (!selectedThread) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print/save transcripts.');
      return;
    }

    const messagesHTML = selectedThread.messages.map(m => `
      <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-bottom: 4px;">
          <strong>${m.role === 'user' ? 'Visitor' : 'AI Bot'}</strong>
          <span>${new Date(m.timestamp).toLocaleString()}</span>
        </div>
        <div style="font-size: 13px; color: #1e293b; line-height: 1.5; white-space: pre-wrap;">${m.text}</div>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Transcript Archive: ${selectedThread.id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #334155; }
            h1 { font-size: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px; }
            .meta { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 25px; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Chatsuite AI Conversation Log</h1>
          <div class="meta">
            <p><strong>Thread Identifier:</strong> ${selectedThread.id}</p>
            <p><strong>Channel Source:</strong> ${selectedThread.platform || 'Direct web embedding'}</p>
            <p><strong>Lead Status:</strong> ${selectedThread.leadCaptured ? 'Captured Lead Contact Details' : 'Anonymous interaction'}</p>
            ${selectedThread.customerEmail ? `<p><strong>Email Address:</strong> ${selectedThread.customerEmail}</p>` : ''}
            <p><strong>Captured On:</strong> ${new Date(selectedThread.createdAt).toLocaleString()}</p>
          </div>
          <div>${messagesHTML}</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const [filterMode, setFilterMode] = useState<'all' | 'pinned' | 'favorites' | 'leads'>('all');

  const toggleThreadPin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads(prev => prev.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t));
  };

  const toggleThreadFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads(prev => prev.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
  };

  // Filtering threads based on search query and category tab
  const filteredThreads = threads.filter(t => {
    if (filterMode === 'pinned' && !t.isPinned) return false;
    if (filterMode === 'favorites' && !t.isFavorite) return false;
    if (filterMode === 'leads' && !t.leadCaptured) return false;

    const q = searchQuery.toLowerCase();
    if (!q) return true;
    
    const matchesCustomer = (t.customerName?.toLowerCase().includes(q) || 
                             t.customerEmail?.toLowerCase().includes(q) || 
                             t.customerPhone?.toLowerCase().includes(q));
    const matchesMessages = t.messages.some(m => m.text.toLowerCase().includes(q));
    const matchesId = t.id.toLowerCase().includes(q);

    return matchesCustomer || matchesMessages || matchesId;
  });

  return (
    <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs flex flex-col md:flex-row h-[calc(100vh-175px)]">
      
      {/* 1. Left panel: Thread indexer list */}
      <div className={`w-full md:w-80 border-r border-slate-250 dark:border-slate-800/80 ${selectedThread ? 'hidden md:flex' : 'flex'} flex-col shrink-0 bg-slate-50 dark:bg-[#0B1120]`}>
        
        {/* Search & Refresh */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={13} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full text-[11px] pl-8.5 pr-2.5 py-1.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <button 
              onClick={fetchThreads}
              title="Refresh logs"
              className="p-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg cursor-pointer transition-colors"
            >
              <RefreshCw size={13} />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-bold">
            {(['all', 'pinned', 'favorites', 'leads'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-2 py-0.5 rounded-md capitalize cursor-pointer transition-colors ${
                  filterMode === mode
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Thread items list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
          {loading ? (
            <div className="p-10 text-center text-xs text-slate-400 font-mono flex flex-col items-center gap-2">
              <RefreshCw className="animate-spin text-blue-500" size={16} />
              Indexing transcripts...
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400 font-mono">
              <AlertCircle className="mx-auto mb-2 text-slate-350" size={16} />
              No conversations logged.
            </div>
          ) : (
            filteredThreads.map((t) => {
              const lastMsg = t.messages[t.messages.length - 1];
              const isSelected = selectedThread?.id === t.id;
              
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedThread(t)}
                  className={`w-full p-3.5 text-left transition-colors flex items-start gap-2.5 cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-50/50 dark:bg-blue-950/15 border-l-3 border-blue-600' 
                      : 'hover:bg-slate-100/40 dark:hover:bg-[#0F172A]/40'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 text-xs">
                    {t.leadCaptured ? (
                      <Star size={13} className="text-amber-500 fill-amber-500" />
                    ) : (
                      <User size={13} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate flex items-center gap-1">
                        {t.isPinned && <span title="Pinned">📌</span>}
                        {t.isFavorite && <Star size={11} className="text-amber-500 fill-amber-500 shrink-0" />}
                        {t.customerName || t.customerEmail?.split('@')[0] || `Visitor #${t.id ? t.id.substring(0, 4) : 'Guest'}`}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => toggleThreadPin(t.id, e)}
                          title={t.isPinned ? "Unpin" : "Pin"}
                          className={`hover:text-amber-500 p-0.5 ${t.isPinned ? 'text-amber-500' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`}
                        >
                          <Pin size={10} />
                        </button>
                        <button
                          onClick={(e) => toggleThreadFavorite(t.id, e)}
                          title={t.isFavorite ? "Unfavorite" : "Favorite"}
                          className={`hover:text-amber-500 p-0.5 ${t.isFavorite ? 'text-amber-500' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`}
                        >
                          <Star size={10} className={t.isFavorite ? 'fill-amber-500' : ''} />
                        </button>
                        <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap ml-1">
                          {new Date(t.lastActiveAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-450 truncate font-mono">
                      {lastMsg ? lastMsg.text : 'Opened conversation'}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[8px] uppercase tracking-wider font-bold bg-slate-200/60 dark:bg-slate-800 text-slate-500 px-1 rounded">
                        {t.platform || 'web'}
                      </span>
                      {t.leadCaptured && (
                        <span className="text-[8px] uppercase tracking-wider font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 rounded flex items-center gap-0.5">
                          Lead
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Right panel: Chat messages window */}
      {selectedThread ? (
        <div className="flex-1 flex flex-col md:flex-row h-full min-w-0 bg-white dark:bg-[#0B1120]">
          
          {/* Main message feed */}
          <div className="flex-1 flex flex-col h-full min-w-0 border-r border-slate-100 dark:border-slate-800/80">
            
            {/* Header control strip */}
            <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-[#0B1120] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setSelectedThread(null)}
                  className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 min-h-[40px]"
                  title="Back to Conversations"
                >
                  ← <span className="text-[11px]">Inbox</span>
                </button>
                <div className="min-w-0">
                  <h4 className="font-display font-bold text-xs text-slate-800 dark:text-white truncate">
                    Session Log: {selectedThread.id}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                    <Calendar size={10} /> Started on {new Date(selectedThread.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyTranscript}
                  title="Copy Transcript Text"
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg cursor-pointer transition-colors"
                >
                  {copiedTranscript ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>

                <button
                  onClick={handlePrintTranscript}
                  title="Export / Save PDF"
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg cursor-pointer transition-colors"
                >
                  <Printer size={14} />
                </button>

                <button
                  onClick={() => handleDeleteThread(selectedThread.id)}
                  title="Delete Transcript Record"
                  className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Bubble list */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-[#080d19]/45">
              {selectedThread.messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed space-y-1.5 shadow-xs ${
                      isUser 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                    }`}>
                      {/* Name tag and timestamp */}
                      <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 font-mono mb-1">
                        <span>{isUser ? 'Visitor' : 'AI Assistant'}</span>
                        <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
                      </div>

                      <p className="whitespace-pre-wrap">{m.text}</p>

                      {/* File uploads */}
                      {m.fileUrl && (
                        <div className="mt-2 p-2 bg-slate-100/10 dark:bg-slate-900/40 rounded-lg border border-slate-350/20 flex items-center gap-2">
                          <FileText size={14} className="text-blue-400" />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-[10px] truncate">{m.fileName || 'Uploaded Asset'}</p>
                            <p className="text-[8px] opacity-75 uppercase">{m.fileType}</p>
                          </div>
                          <a 
                            href={m.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1 bg-white/20 hover:bg-white/40 rounded text-inherit transition-colors"
                          >
                            <Download size={10} />
                          </a>
                        </div>
                      )}

                      {/* User ratings on replies */}
                      {!isUser && m.rating !== undefined && m.rating !== 0 && (
                        <div className="pt-1 border-t border-slate-150/20 flex items-center gap-1 text-[9px] text-amber-500 dark:text-amber-400 font-mono">
                          <span>★ Visitor Rated: {m.rating === 1 ? 'Positive Feedback (Thumbs Up)' : 'Negative Feedback (Thumbs Down)'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side panel: Thread analytics & Lead metadata lookup */}
          <div className="w-full md:w-60 p-4 space-y-5 bg-white dark:bg-[#0B1120] shrink-0 overflow-y-auto">
            
            {/* Lead Status */}
            <div className="space-y-2">
              <span className="block text-[8.5px] uppercase font-bold tracking-wider text-slate-400">Interaction Status</span>
              {selectedThread.leadCaptured ? (
                <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
                    <Sparkles size={13} /> Active Captured Lead
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    This visitor successfully logged contact credentials through the white-labeled lead intake form!
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                  <div className="text-slate-500 font-semibold text-xs flex items-center gap-1.5">
                    <User size={13} /> Anonymous Visitor
                  </div>
                  <p className="text-[10px] text-slate-450 leading-relaxed">
                    This visitor conversed with the AI assistant but has not left contact details yet.
                  </p>
                </div>
              )}
            </div>

            {/* Lead Contact Card details */}
            {(selectedThread.customerName || selectedThread.customerEmail || selectedThread.customerPhone) && (
              <div className="space-y-2">
                <span className="block text-[8.5px] uppercase font-bold tracking-wider text-slate-400">Contact Card Credentials</span>
                
                <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-250 dark:border-slate-800/80 rounded-xl p-3.5 space-y-3.5 text-xs">
                  {selectedThread.customerName && (
                    <div className="space-y-0.5">
                      <p className="text-[9px] uppercase text-slate-400 font-mono">Full Name</p>
                      <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                        <User size={11} className="text-blue-500" /> {selectedThread.customerName}
                      </p>
                    </div>
                  )}

                  {selectedThread.customerEmail && (
                    <div className="space-y-0.5">
                      <p className="text-[9px] uppercase text-slate-400 font-mono">Email Address</p>
                      <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 truncate">
                        <Mail size={11} className="text-blue-500" /> {selectedThread.customerEmail}
                      </p>
                    </div>
                  )}

                  {selectedThread.customerPhone && (
                    <div className="space-y-0.5">
                      <p className="text-[9px] uppercase text-slate-400 font-mono">Phone Number</p>
                      <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                        <Phone size={11} className="text-blue-500" /> {selectedThread.customerPhone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Channel Specs */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <span className="block text-[8.5px] uppercase font-bold tracking-wider text-slate-400">Channel & Session Details</span>
              
              <div className="space-y-2.5 text-[11px] text-slate-500">
                <div className="flex justify-between">
                  <span>Chatbot Widget ID:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 text-[10px]">{selectedThread.chatbotId.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span>Conversation channel:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedThread.platform || 'embedded'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Interaction length:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{selectedThread.messages.length} replies</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 bg-slate-50/50 dark:bg-[#080d19]/10 font-mono text-xs">
          <MessageSquare className="mb-2.5 text-slate-300" size={24} />
          Select a conversation from the sidebar index to view full logs and extract leads.
        </div>
      )}

    </div>
  );
};
