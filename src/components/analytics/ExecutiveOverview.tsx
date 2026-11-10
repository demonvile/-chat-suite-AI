import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  MessageSquare, Users, UserCheck, TrendingUp, 
  Zap, Clock, Star, ShieldCheck, DollarSign, Activity 
} from 'lucide-react';
import { BIExecutiveOverviewData } from '../../types';

interface ExecutiveOverviewProps {
  data: BIExecutiveOverviewData;
  onOpenRoiModal: () => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({ data, onOpenRoiModal }) => {
  return (
    <div className="space-y-6">
      
      {/* 1. Top Executive Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* AI Conversations Today */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Conversations Today</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MessageSquare size={16} />
            </div>
          </div>
          <h4 className="font-display text-2xl font-bold tracking-tight text-slate-800 dark:text-white">{data.conversationsToday.toLocaleString()}</h4>
          <p className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
            ↑ +{data.conversationsChangePct}% vs yesterday
          </p>
        </div>

        {/* Total Customers */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Total Customers</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <h4 className="font-display text-2xl font-bold tracking-tight text-slate-800 dark:text-white">{data.totalCustomers.toLocaleString()}</h4>
          <p className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
            ↑ +{data.customersChangePct}% this month
          </p>
        </div>

        {/* Active Users */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Active Users Today</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck size={16} />
            </div>
          </div>
          <h4 className="font-display text-2xl font-bold tracking-tight text-slate-800 dark:text-white">{data.activeUsersToday.toLocaleString()}</h4>
          <p className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
            ↑ +{data.activeUsersChangePct}% daily active DAU
          </p>
        </div>

        {/* New Leads Today */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">New Leads Today</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <h4 className="font-display text-2xl font-bold tracking-tight text-slate-800 dark:text-white">{data.newLeadsToday.toLocaleString()}</h4>
          <p className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
            ↑ +{data.leadsChangePct}% lead velocity
          </p>
        </div>

      </div>

      {/* 2. Secondary Health KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Conversion Rate</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">{data.conversionRatePct}%</span>
            <span className="text-[10px] text-emerald-500 font-bold">Optimal</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Response Time SLA</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">{data.avgResponseTimeMs} ms</span>
            <span className="text-[10px] text-blue-500 font-bold">p50 Instant</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">CSAT Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">{data.csatScorePct}%</span>
            <span className="text-[10px] text-amber-500 font-bold">★ 4.9 / 5</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">AI Resolution Rate</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">{data.aiSuccessRatePct}%</span>
            <span className="text-[10px] text-emerald-500 font-bold">Zero Escalation</span>
          </div>
        </div>

      </div>

      {/* 3. Business Growth Metrics Chart */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
              <Activity size={16} className="text-blue-500" /> Business Growth Metrics & Telemetry (Past 6 Months)
            </h3>
            <p className="text-xs text-slate-500">Correlating revenue, captured leads, active users and AI chat engagement</p>
          </div>

          <button
            onClick={onOpenRoiModal}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-500 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <DollarSign size={14} /> Calculate AI ROI
          </button>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.growthMetricsHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="month" style={{ fontSize: '10px', fill: '#9ca3af' }} />
              <YAxis style={{ fontSize: '10px', fill: '#9ca3af' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderRadius: '8px', 
                  color: '#fff', 
                  fontSize: '11px',
                  border: 'none'
                }} 
              />
              <Legend verticalAlign="top" height={36} style={{ fontSize: '11px' }} />
              <Area type="monotone" dataKey="revenue" name="Monthly Revenue ($)" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="aiConversations" name="AI Conversations" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorConv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
