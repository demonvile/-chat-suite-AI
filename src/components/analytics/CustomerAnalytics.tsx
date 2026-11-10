import React from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  Users, UserCheck, ShieldCheck, Globe, Monitor, 
  Smartphone, Tablet, DollarSign, Award, Activity 
} from 'lucide-react';
import { BICustomerAnalyticsData } from '../../types';

interface CustomerAnalyticsProps {
  data: BICustomerAnalyticsData;
}

export const CustomerAnalytics: React.FC<CustomerAnalyticsProps> = ({ data }) => {
  const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899'];

  const newVsReturning = [
    { name: 'New Customers', value: data.newCustomers, color: '#3b82f6' },
    { name: 'Returning Customers', value: data.returningCustomers, color: '#10b981' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Stat Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Customer LTV (Avg)</span>
          <h4 className="font-display text-2xl font-bold text-slate-900 dark:text-white">${data.avgLtvAmount.toLocaleString()}</h4>
          <span className="text-[10px] text-emerald-500 font-semibold block mt-1">↑ High Retention Value</span>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">30-Day Retention Rate</span>
          <h4 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{data.retentionRate30dPct}%</h4>
          <span className="text-[10px] text-emerald-500 font-semibold block mt-1">Churn: {data.churnRate30dPct}% (Low)</span>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Engagement Index</span>
          <h4 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{data.customerEngagementScore} / 100</h4>
          <span className="text-[10px] text-blue-500 font-semibold block mt-1">Highly Active Audience</span>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">New vs Returning Ratio</span>
          <h4 className="font-display text-2xl font-bold text-slate-900 dark:text-white">1 : 2.1</h4>
          <span className="text-[10px] text-purple-500 font-semibold block mt-1">Healthy Repeat Usage</span>
        </div>

      </div>

      {/* Grid: Customer Segments & New vs Returning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Customer Segmentation & MRR Contribution */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs lg:col-span-2">
          <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-1.5">
            <Users size={16} className="text-blue-500" /> Customer Segmentation & MRR Contribution
          </h3>

          <div className="space-y-3">
            {data.customerSegments.map((seg, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{seg.segment} Tier</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    ${seg.mrrContribution.toLocaleString()} MRR ({seg.percentage}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${seg.percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }} 
                  />
                </div>
                
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {seg.count} workspace accounts enrolled
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* New vs Returning Donut */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
          <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-1.5">
            <UserCheck size={16} className="text-emerald-500" /> New vs Returning
          </h3>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={newVsReturning}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {newVsReturning.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '8px', 
                    color: '#fff', 
                    fontSize: '11px',
                    border: 'none'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2">
            {newVsReturning.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-mono font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid: Geographic Distribution & Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Geographic Distribution */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
          <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-1.5">
            <Globe size={16} className="text-blue-500" /> Geographic User Distribution
          </h3>

          <div className="space-y-2.5">
            {data.geographicDistribution.map((geo, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 text-center text-xs font-mono font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 rounded py-0.5">
                    {geo.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{geo.country}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{geo.activeUsers} DAU</span>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                    {geo.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device & Browser Analytics */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
          <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-1.5">
            <Monitor size={16} className="text-purple-500" /> Device & Browser Analytics
          </h3>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Device Type Split</span>
              <div className="grid grid-cols-3 gap-2">
                {data.deviceBreakdown.map((dev, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 p-3 rounded-xl text-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">{dev.device}</span>
                    <span className="text-lg font-bold text-blue-500 font-mono block mt-1">{dev.percentage}%</span>
                    <span className="text-[10px] text-slate-500 font-mono">{dev.count} users</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Browser Share</span>
              <div className="space-y-2">
                {data.browserBreakdown.map((br, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/40 rounded-lg text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{br.browser}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{br.percentage}% ({br.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
