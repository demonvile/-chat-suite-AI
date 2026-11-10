import React, { useState } from 'react';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { 
  MessageSquare, Clock, HelpCircle, Flame, 
  Bot, UserX, CheckCircle, TrendingUp 
} from 'lucide-react';
import { BIChatAnalyticsData } from '../../types';

interface ChatAnalyticsProps {
  data: BIChatAnalyticsData;
}

export const ChatAnalytics: React.FC<ChatAnalyticsProps> = ({ data }) => {
  const [selectedDayFilter, setSelectedDayFilter] = useState('All');

  // Days for heatmap
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const filteredHeatmap = selectedDayFilter === 'All'
    ? data.peakActivityMap
    : data.peakActivityMap.filter(d => d.day === selectedDayFilter);

  // Helper to get heat intensity color
  const getHeatColor = (val: number) => {
    if (val < 10) return 'bg-slate-100 dark:bg-slate-800/40 text-slate-400';
    if (val < 25) return 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400';
    if (val < 45) return 'bg-blue-400 dark:bg-blue-700 text-white font-bold';
    return 'bg-blue-600 dark:bg-blue-500 text-white font-bold shadow-xs';
  };

  const handoffPie = [
    { name: 'Automated AI Resolution', value: data.resolutionRatePct, color: '#3b82f6' },
    { name: 'Human Ticket Handoff', value: data.humanHandoffRatePct, color: '#f43f5e' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Stat Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Conversations</span>
          <h4 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{data.totalConversations.toLocaleString()}</h4>
          <span className="text-[10px] text-emerald-500 font-semibold block mt-1">↑ High Engagement</span>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Avg Conversation Length</span>
          <h4 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{data.avgConversationLengthMsgs} msgs</h4>
          <span className="text-[10px] text-slate-500 block mt-1">~{data.avgDurationMinutes} mins average duration</span>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">AI Response Accuracy</span>
          <h4 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{data.aiAccuracyPct}%</h4>
          <span className="text-[10px] text-emerald-500 font-semibold block mt-1">Grounding Verification Pass</span>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Resolution Rate</span>
          <h4 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{data.resolutionRatePct}%</h4>
          <span className="text-[10px] text-rose-500 font-semibold block mt-1">{data.humanHandoffRatePct}% Human Escalation</span>
        </div>

      </div>

      {/* Conversation Volume Trend Chart */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
        <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-1.5">
          <TrendingUp size={16} className="text-blue-500" /> Conversation Volume & Escalation Trends
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.conversationTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="date" style={{ fontSize: '10px', fill: '#9ca3af' }} />
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
              <Bar dataKey="automated" name="Automated AI Resolved" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="humanEscalated" name="Human Escalated Ticket" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Peak Activity Heatmap & Most Asked Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Peak Activity Hours Heatmap */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
                <Flame size={16} className="text-amber-500" /> Peak Activity Hours Heatmap (24 Hours)
              </h3>
              <p className="text-xs text-slate-500">Hourly message volume distribution across day of week</p>
            </div>

            {/* Filter Day */}
            <div className="flex flex-wrap items-center gap-1 mt-2 sm:mt-0">
              <button
                onClick={() => setSelectedDayFilter('All')}
                className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer ${
                  selectedDayFilter === 'All' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                All Days
              </button>
              {days.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDayFilter(d)}
                  className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer ${
                    selectedDayFilter === d ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[500px]">
              {/* Hours Header */}
              <div className="grid grid-cols-25 text-[9px] font-mono text-slate-400 mb-1.5 text-center">
                <span className="col-span-1 text-left">Day</span>
                {Array.from({ length: 24 }).map((_, h) => (
                  <span key={h} className="col-span-1">{h}h</span>
                ))}
              </div>

              {/* Day Rows */}
              {(selectedDayFilter === 'All' ? days : [selectedDayFilter]).map(day => (
                <div key={day} className="grid grid-cols-25 gap-1 mb-1 items-center">
                  <span className="col-span-1 text-[10px] font-bold text-slate-500 font-mono">{day}</span>
                  {Array.from({ length: 24 }).map((_, hour) => {
                    const item = data.peakActivityMap.find(p => p.day === day && p.hour === hour);
                    const val = item ? item.value : 0;
                    return (
                      <div
                        key={hour}
                        title={`${day} @ ${hour}:00 - ${val} msgs`}
                        className={`h-6 rounded text-[9px] flex items-center justify-center font-mono cursor-pointer transition-transform hover:scale-110 ${getHeatColor(val)}`}
                      >
                        {val > 25 ? val : ''}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-3 text-[10px] text-slate-500">
            <span>Volume Intensity:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-200 dark:bg-slate-800"></span> Low (&lt;10)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-300 dark:bg-blue-900"></span> Moderate (10-25)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-600"></span> High (25+)</span>
          </div>
        </div>

        {/* Most Asked Questions / Topics Cluster */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
          <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-1.5">
            <HelpCircle size={16} className="text-blue-500" /> Top Inquired Topics Cluster
          </h3>

          <div className="space-y-3">
            {data.mostAskedQuestions.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded uppercase font-mono">
                    {item.category}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                    {item.count} queries
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                  "{item.question}"
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
