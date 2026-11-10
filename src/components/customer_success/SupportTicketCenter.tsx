import React, { useState, useEffect } from 'react';
import { 
  Plus, MessageSquare, Clock, AlertTriangle, ShieldCheck, 
  Send, Lock, Paperclip, CheckCircle2, User, Filter, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SupportTicketCenterProps {
  addToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const SupportTicketCenter: React.FC<SupportTicketCenterProps> = ({ addToast }) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Ticket Form State
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('Integrations');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reply Form State
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customer-success/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newDescription) {
      addToast('error', 'Missing Fields', 'Please fill in subject and description.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/customer-success/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newSubject,
          category: newCategory,
          priority: newPriority,
          description: newDescription,
          author: 'Acme Workspace Administrator',
          email: 'admin@acme.com'
        })
      });

      if (res.ok) {
        const data = await res.json();
        addToast('success', 'Support Ticket Submitted!', `Ticket #${data.ticket.id} queued for 15-minute engineering response.`);
        setShowCreateModal(false);
        setNewSubject('');
        setNewDescription('');
        fetchTickets();
      }
    } catch (err) {
      addToast('error', 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;

    try {
      setReplying(true);
      const res = await fetch(`/api/customer-success/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: replyText,
          author: isInternalNote ? 'Sarah Jenkins (DevOps Lead)' : 'Acme Workspace Admin',
          role: isInternalNote ? 'staff' : 'customer',
          isInternalNote
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.ticket);
        setReplyText('');
        addToast('success', isInternalNote ? 'Internal Note Added' : 'Customer Reply Sent');
        fetchTickets();
      }
    } catch (err) {
      addToast('error', 'Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchStatus = statusFilter === 'all' || t.status.toLowerCase() === statusFilter.toLowerCase();
    const matchQuery = searchQuery === '' || 
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      case 'high': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'medium': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Open</span>;
      case 'in progress': return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">In Progress</span>;
      case 'resolved': return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Resolved</span>;
      default: return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Enterprise Support Ticket Center
            </h2>
            <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              15-Min SLA
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Direct 24/7 access to ChatSuite AI customer success engineers, solution architects, and DevOps leads.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-md shadow-blue-600/20"
        >
          <Plus size={16} />
          <span>Create New Support Ticket</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets by ID or subject..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'open', 'in progress', 'resolved'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer shrink-0 ${
                statusFilter === s 
                  ? 'bg-slate-900 dark:bg-slate-800 text-white' 
                  : 'bg-white dark:bg-[#0B1120] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono">Loading support tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-500">No support tickets found matching criteria.</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div 
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 rounded-2xl p-5 shadow-xs transition-all cursor-pointer space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    #{ticket.id}
                  </span>
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    {ticket.subject}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority} Priority
                  </span>
                  {getStatusBadge(ticket.status)}
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {ticket.description}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-850">
                <span className="font-medium">Category: <strong className="text-slate-700 dark:text-slate-300">{ticket.category}</strong></span>
                <span className="font-mono">{new Date(ticket.createdAt).toLocaleDateString()} • {ticket.replies?.length || 0} responses</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE TICKET MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Create Support Ticket
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ticket Subject</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Brief summary of issue or inquiry..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium focus:outline-none"
                    >
                      <option value="Integrations">Integrations & Webhooks</option>
                      <option value="Infrastructure">Infrastructure & Custom Domains</option>
                      <option value="AI Models">AI Model & RAG Tuning</option>
                      <option value="Billing">Billing & Subscription</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium focus:outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent (System Down)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Detailed Description & Reproduction Steps</label>
                  <textarea
                    rows={4}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Please include error logs, payload snippets, or expected outcomes..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-blue-600/20"
                  >
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TICKET DETAILS MODAL */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Ticket Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-600">{selectedTicket.id}</span>
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    {selectedTicket.subject}
                  </h3>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
              </div>

              {/* Thread Conversation Body */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                {/* Original Description */}
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTicket.author}</span>
                    <span className="font-mono">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>

                {/* Replies Thread */}
                {selectedTicket.replies?.map((rep: any) => (
                  <div 
                    key={rep.id} 
                    className={`p-4 rounded-2xl border space-y-2 ${
                      rep.isInternalNote 
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800' 
                        : rep.role === 'staff' 
                          ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{rep.author}</span>
                        {rep.isInternalNote && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-bold text-[9px] flex items-center gap-1">
                            <Lock size={10} /> Internal Staff Note
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-slate-400">{new Date(rep.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{rep.text}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsInternalNote(false)}
                      className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                        !isInternalNote ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Public Reply
                    </button>
                    <button
                      onClick={() => setIsInternalNote(true)}
                      className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                        isInternalNote ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Lock size={12} /> Internal Note
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={isInternalNote ? "Write an internal team note (visible to staff only)..." : "Write a response..."}
                    className="flex-1 p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={replying || !replyText.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold rounded-xl text-xs cursor-pointer self-end flex items-center gap-1 shadow-md"
                  >
                    <Send size={14} />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
