import React, { useState } from 'react';
import { 
  Trophy, BookOpen, MessageSquare, Sparkles, Activity, 
  ThumbsUp, Bell, HeartHandshake, ChevronRight
} from 'lucide-react';
import { InteractiveOnboarding } from './InteractiveOnboarding';
import { HelpCenterDocs } from './HelpCenterDocs';
import { SupportTicketCenter } from './SupportTicketCenter';
import { AICustomerCopilot } from './AICustomerCopilot';
import { CustomerHealthDashboard } from './CustomerHealthDashboard';
import { FeedbackAndRoadmap } from './FeedbackAndRoadmap';
import { ProductNotifications } from './ProductNotifications';

interface CustomerSuccessCenterProps {
  addToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  onNavigateToSection: (section: string) => void;
  initialSubTab?: string;
}

export const CustomerSuccessCenter: React.FC<CustomerSuccessCenterProps> = ({
  addToast,
  onNavigateToSection,
  initialSubTab = 'onboarding'
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialSubTab);

  const tabs = [
    { id: 'onboarding', label: 'Onboarding Hub', icon: Trophy, badge: '5 Steps' },
    { id: 'help', label: 'Help Center & Docs', icon: BookOpen },
    { id: 'tickets', label: 'Support Tickets', icon: MessageSquare, badge: '15-Min SLA' },
    { id: 'copilot', label: 'AI Help Assistant', icon: Sparkles, badge: 'Gemini 3.6' },
    { id: 'health', label: 'Customer Health', icon: Activity, badge: '94 Score' },
    { id: 'roadmap', label: 'Feedback & Roadmap', icon: ThumbsUp },
    { id: 'notices', label: 'Updates & Notices', icon: Bell }
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Top Welcome Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <HeartHandshake size={20} />
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Customer Success & Support Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Accelerate workspace adoption, solve problems with AI copilot guidance, and track system health.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-850">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white dark:bg-[#0B1120] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <TabIcon size={16} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'onboarding' && (
          <InteractiveOnboarding addToast={addToast} onNavigateToSection={onNavigateToSection} />
        )}

        {activeTab === 'help' && (
          <HelpCenterDocs addToast={addToast} onNavigateToSection={onNavigateToSection} />
        )}

        {activeTab === 'tickets' && (
          <SupportTicketCenter addToast={addToast} />
        )}

        {activeTab === 'copilot' && (
          <AICustomerCopilot addToast={addToast} onNavigateToSection={onNavigateToSection} />
        )}

        {activeTab === 'health' && (
          <CustomerHealthDashboard addToast={addToast} />
        )}

        {activeTab === 'roadmap' && (
          <FeedbackAndRoadmap addToast={addToast} />
        )}

        {activeTab === 'notices' && (
          <ProductNotifications addToast={addToast} />
        )}
      </div>

    </div>
  );
};
