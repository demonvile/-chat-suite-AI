import React from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Cell 
} from 'recharts';
import { Activity, Zap, ShieldCheck, Globe, Key, Clock } from 'lucide-react';
import { IntegrationAnalyticsData } from '../../types';

interface IntegrationAnalyticsViewProps {
  analytics: IntegrationAnalyticsData | null;
}

export const IntegrationAnalyticsView: React.FC<IntegrationAnalyticsViewProps> = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs">
        Loading integration performance analytics...
      </div>
    );
  }

  const categoryColors = ['#4f46e5', '#0284c7', '#059669', '#d97706', '#7c3aed', '#0891b2'];

  return (
    <div className="space-y-6">
      
      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Connected Services</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {analytics.totalConnected} <span className="text-xs font-normal text-slate-400">/ 16 Active</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Average Health Score</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            {analytics.overallHealthScore}%
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">24h Event Volume</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {analytics.totalEventsToday.toLocaleString()}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Developer Endpoints</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Globe className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {analytics.activeWebhooksCount + analytics.activeApiKeysCount}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily Throughput Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">7-Day Integration Event Volume</h3>
              <p className="text-xs text-slate-500">Total processed webhook payloads vs API errors</p>
            </div>
            <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
              Live Gateway Metrics
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.dailyEventVolume}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Bar dataKey="volume" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Processed Events" />
                <Bar dataKey="errors" fill="#f43f5e" radius={[4, 4, 0, 0]} name="API Errors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Connections by Category</h3>
          <p className="text-xs text-slate-500 mb-4">Connected native integrations distribution</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.categoryBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} stroke="#64748b" width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="connectedCount" radius={[0, 4, 4, 0]} name="Connected">
                  {analytics.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency by Integration Chart */}
        <div className="lg:col-span-12 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Average Integration Latency (ms)</h3>
              <p className="text-xs text-slate-500 font-normal">Response time benchmarks across connected native third-party APIs</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.latencyByIntegration}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="integrationName" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="avgLatencyMs" stroke="#0284c7" strokeWidth={2} dot={{ r: 4, fill: '#0284c7' }} name="Avg Latency (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
