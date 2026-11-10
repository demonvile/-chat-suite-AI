import React, { useState, useEffect } from 'react';
import { 
  BarChart3, MessageSquare, Users, TrendingUp, Cpu, 
  FileText, Bell, RefreshCw, Calendar, Download, Calculator, Printer 
} from 'lucide-react';
import { ExecutiveOverview } from './analytics/ExecutiveOverview';
import { ChatAnalytics } from './analytics/ChatAnalytics';
import { CustomerAnalytics } from './analytics/CustomerAnalytics';
import { SalesLeadAnalytics } from './analytics/SalesLeadAnalytics';
import { AIPerformance } from './analytics/AIPerformance';
import { ReportsManager } from './analytics/ReportsManager';
import { NotificationsAlerts } from './analytics/NotificationsAlerts';
import { RoiCalculatorModal } from './analytics/RoiCalculatorModal';

interface AnalyticsViewProps {
  token: string;
  chatbotId: string | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ token, chatbotId }) => {
  const [activeTab, setActiveTab] = useState<'executive' | 'chat' | 'customer' | 'sales' | 'ai' | 'reports' | 'alerts'>('executive');
  const [dateRange, setDateRange] = useState('30d');
  const [biData, setBiData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRoiModalOpen, setIsRoiModalOpen] = useState(false);

  const fetchBiAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/analytics/bi', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const d = await res.json();
        setBiData(d);
      } else {
        setError('Failed to fetch business intelligence analytics.');
      }
    } catch (e) {
      setError('Network error loading BI dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBiAnalytics();
  }, [chatbotId, dateRange]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
        <p className="text-xs text-slate-400 font-mono">Aggregating live business intelligence telemetry...</p>
      </div>
    );
  }

  if (error || !biData) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl flex items-center justify-between text-xs border border-rose-200 dark:border-rose-900/30">
        <span>⚠️ {error || 'No BI data returned'}</span>
        <button onClick={fetchBiAnalytics} className="underline font-bold cursor-pointer">Retry</button>
      </div>
    );
  }

  const tabs = [
    { id: 'executive', label: 'Executive Dashboard', icon: BarChart3 },
    { id: 'chat', label: 'Chat Analytics', icon: MessageSquare },
    { id: 'customer', label: 'Customer Analytics', icon: Users },
    { id: 'sales', label: 'Sales & Leads', icon: TrendingUp },
    { id: 'ai', label: 'AI Performance', icon: Cpu },
    { id: 'reports', label: 'Reports & Exports', icon: FileText },
    { id: 'alerts', label: 'Alerts & Goals', icon: Bell }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Controls & Tab Navigation */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="text-blue-500" size={22} /> Business Intelligence & SaaS Analytics Suite
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time executive performance, chat engagement, sales attribution, and AI token metrics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date Range Picker */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <Calendar size={14} className="text-slate-400 ml-1.5" />
              <button
                onClick={() => setDateRange('24h')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${dateRange === '24h' ? 'bg-blue-600 text-white font-bold' : 'text-slate-500 hover:text-white'}`}
              >
                24h
              </button>
              <button
                onClick={() => setDateRange('7d')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${dateRange === '7d' ? 'bg-blue-600 text-white font-bold' : 'text-slate-500 hover:text-white'}`}
              >
                7d
              </button>
              <button
                onClick={() => setDateRange('30d')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${dateRange === '30d' ? 'bg-blue-600 text-white font-bold' : 'text-slate-500 hover:text-white'}`}
              >
                30d
              </button>
              <button
                onClick={() => setDateRange('ytd')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${dateRange === 'ytd' ? 'bg-blue-600 text-white font-bold' : 'text-slate-500 hover:text-white'}`}
              >
                YTD
              </button>
            </div>

            {/* ROI Calculator Button */}
            <button
              onClick={() => setIsRoiModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white border border-blue-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Calculator size={14} /> ROI Tool
            </button>

            {/* Refresh button */}
            <button
              onClick={fetchBiAnalytics}
              className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-200 dark:border-slate-800 pt-3">
          {tabs.map(t => {
            const Icon = t.icon;
            const isCurrent = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon size={15} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Body Render */}
      <div>
        {activeTab === 'executive' && (
          <ExecutiveOverview data={biData.executive} onOpenRoiModal={() => setIsRoiModalOpen(true)} />
        )}

        {activeTab === 'chat' && (
          <ChatAnalytics data={biData.chat} />
        )}

        {activeTab === 'customer' && (
          <CustomerAnalytics data={biData.customer} />
        )}

        {activeTab === 'sales' && (
          <SalesLeadAnalytics data={biData.sales} onOpenRoiModal={() => setIsRoiModalOpen(true)} />
        )}

        {activeTab === 'ai' && (
          <AIPerformance data={biData.aiPerformance} />
        )}

        {activeTab === 'reports' && (
          <ReportsManager token={token} reports={biData.reports} />
        )}

        {activeTab === 'alerts' && (
          <NotificationsAlerts notifications={biData.notifications} />
        )}
      </div>

      {/* ROI Calculator Modal */}
      <RoiCalculatorModal
        isOpen={isRoiModalOpen}
        onClose={() => setIsRoiModalOpen(false)}
      />

    </div>
  );
};
