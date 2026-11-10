import React, { useState, useEffect } from 'react';
import { 
  Bell, AlertTriangle, ShieldCheck, Sparkles, CheckCircle2, 
  Clock, Info, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductNotificationsProps {
  addToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const ProductNotifications: React.FC<ProductNotificationsProps> = ({ addToast }) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customer-success/announcements');
      if (res.ok) {
        const json = await res.json();
        setAnnouncements(json.announcements || []);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeStyle = (color: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'amber': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'indigo': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Bell size={18} className="text-blue-500" /> Platform Releases & Security Notices
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Stay updated with major Gemini model upgrades, zero-downtime maintenance, and workspace security compliance.
          </p>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono">Fetching platform updates...</div>
        ) : announcements.map((ann) => (
          <div 
            key={ann.id}
            onClick={() => setSelectedAnnouncement(ann)}
            className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 hover:border-blue-400 rounded-2xl p-5 shadow-xs transition-all cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getBadgeStyle(ann.badgeColor)}`}>
                  {ann.badge}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(ann.date).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                {ann.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {ann.summary}
              </p>
            </div>

            <ChevronRight size={18} className="text-slate-400 shrink-0" />
          </div>
        ))}
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getBadgeStyle(selectedAnnouncement.badgeColor)}`}>
                  {selectedAnnouncement.badge}
                </span>
                <button onClick={() => setSelectedAnnouncement(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
              </div>

              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                {selectedAnnouncement.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedAnnouncement.summary}
              </p>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Close Notice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
