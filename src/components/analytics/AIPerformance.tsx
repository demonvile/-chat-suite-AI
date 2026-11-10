import React from 'react';
import { 
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Zap, Clock, Cpu, DollarSign, Activity, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import { BIAIPerformanceData } from '../../types';

interface AIPerformanceProps {
  data: BIAIPerformanceData;
}

export const AIPerformance: React.FC<AIPerformanceProps> = ({ data }) => {
  const tokenBreakdown = [
    { name: 'Prompt Input Tokens', value: data.promptTokens, color: '#3b82f6' },
    { name: 'Completion Output Tokens', value: data.completionTokens, color: '#10b981' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Stat Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Token Consumption</span>
          <h4 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{data.totalTokensUsed.toLocaleString()}</h4>
          <span className="text-[10px] text-blue-500 font-semibold block mt-1">Prompt: {data.promptTokens.toLocaleString()} | Completion: {data.completionTokens.toLocaleString()}</span>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Response Latency (p50 / p99)</span>
          <h4 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{data.responseLatencyP50Ms} ms</h4>
          <span className="text-[10px] text-emerald-500 font-semibold block mt-1">p90: {data.responseLatencyP90Ms}ms | p99: {data.responseLatencyP99Ms}ms</span>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Estimated Monthly API Cost</span>
          <h4 className="font-display text-2xl font-bold text-slate-900 dark:text-white">${data.estimatedCostUsd.toFixed(2)}</h4>
          <span className="text-[10px] text-emerald-500 font-semibold block mt-1">Optimized cost per 1k tokens</span>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">AI Confidence Score</span>
          <h4 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{data.avgConfidenceScorePct}%</h4>
          <span className="text-[10px] text-blue-500 font-semibold block mt-1">Error Rate: {data.errorRatePct}% (Near zero)</span>
        </div>

      </div>

      {/* Latency Distribution Trend Line Chart */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
        <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-1.5">
          <Clock size={16} className="text-blue-500" /> Response Latency Percentiles (p50, p90, p99 ms)
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.latencyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="time" style={{ fontSize: '10px', fill: '#9ca3af' }} />
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
              <Line type="monotone" dataKey="p50" name="p50 Latency (ms)" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="p90" name="p90 Latency (ms)" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="p99" name="p99 Latency (ms)" stroke="#f43f5e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Model Breakdown & Token Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gemini Model Performance Comparison */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs lg:col-span-2">
          <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-1.5">
            <Cpu size={16} className="text-purple-500" /> AI Model Workload Allocation & Cost Estimation
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Model Architecture</th>
                  <th className="p-3 text-right">API Calls</th>
                  <th className="p-3 text-right">Token Volume</th>
                  <th className="p-3 text-right">Avg Latency</th>
                  <th className="p-3 text-right">Est. Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.modelBreakdown.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{m.modelName}</td>
                    <td className="p-3 text-right font-mono">{m.requestCount.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono">{m.tokenCount.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-blue-500">{m.avgLatencyMs} ms</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">${m.costUsd.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Token Split Donut */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
          <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-1.5">
            <Zap size={16} className="text-amber-500" /> Prompt vs Completion Token Split
          </h3>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tokenBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {tokenBreakdown.map((entry, index) => (
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
            {tokenBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-mono font-bold">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
