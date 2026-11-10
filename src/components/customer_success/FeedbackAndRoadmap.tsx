import React, { useState, useEffect } from 'react';
import { 
  ThumbsUp, Plus, Bug, Sparkles, MessageSquare, Flame, 
  CheckCircle2, Clock, Layers, Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FeedbackAndRoadmapProps {
  addToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const FeedbackAndRoadmap: React.FC<FeedbackAndRoadmapProps> = ({ addToast }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('AI Voice Engine');
  const [type, setType] = useState('feature');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customer-success/feedback');
      if (res.ok) {
        const json = await res.json();
        setItems(json.items || []);
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id: string) => {
    try {
      const res = await fetch(`/api/customer-success/feedback/${id}/vote`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchFeedback();
        addToast('success', 'Vote Updated!');
      }
    } catch (err) {
      addToast('error', 'Failed to update vote');
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/customer-success/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, type, author: 'Workspace Admin' })
      });

      if (res.ok) {
        addToast('success', 'Submitted to Public Roadmap!');
        setShowSubmitModal(false);
        setTitle('');
        setDescription('');
        fetchFeedback();
      }
    } catch (err) {
      addToast('error', 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const stages = [
    { id: 'Planned', label: 'Planned', icon: Clock, color: 'text-slate-400 border-slate-700' },
    { id: 'In Development', label: 'In Development', icon: Sparkles, color: 'text-blue-500 border-blue-500/30' },
    { id: 'In Beta', label: 'In Beta', icon: Flame, color: 'text-amber-500 border-amber-500/30' },
    { id: 'Released', label: 'Released', icon: Rocket, color: 'text-emerald-500 border-emerald-500/30' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Public Product Roadmap & Feature Requests
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Vote on upcoming ChatSuite AI platform capabilities, suggest new integrations, or report bugs.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-md shadow-blue-600/20"
        >
          <Plus size={16} />
          <span>Submit Feature Request</span>
        </button>
      </div>

      {/* Roadmap Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const StageIcon = stage.icon;
          const stageItems = items.filter(i => i.status === stage.id);

          return (
            <div key={stage.id} className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 min-h-[400px]">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <StageIcon size={16} className={stage.color} />
                  <span className="font-display font-bold text-xs text-slate-900 dark:text-white">{stage.label}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                  {stageItems.length}
                </span>
              </div>

              <div className="space-y-3">
                {stageItems.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-bold uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      <h4 className="font-display font-bold text-xs text-slate-900 dark:text-white leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-850">
                      <button
                        onClick={() => handleVote(item.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                          item.votedBy?.includes('current-user')
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <ThumbsUp size={12} />
                        <span>{item.votes} Upvotes</span>
                      </button>

                      <span className="text-[10px] text-slate-400 font-mono">{item.author}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

      {/* SUBMIT MODAL */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Submit Feature Request or Idea
                </h3>
                <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. HubSpot CRM Two-Way Sync"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium focus:outline-none"
                    >
                      <option value="feature">Feature Request</option>
                      <option value="bug">Bug Report</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium focus:outline-none"
                    >
                      <option value="AI Voice Engine">AI Voice Engine</option>
                      <option value="Integrations">Integrations</option>
                      <option value="Security">Security & Compliance</option>
                      <option value="Branding">Branding & Widget</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description & Business Use Case</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe how this feature will improve your support operations..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-blue-600/20"
                  >
                    {submitting ? 'Submitting...' : 'Post to Roadmap'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
