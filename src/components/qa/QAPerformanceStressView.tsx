import React, { useState } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, BarChart, Bar 
} from 'recharts';
import { Zap, Cpu, Activity, AlertTriangle, Play, RefreshCw, Gauge, ShieldAlert } from 'lucide-react';

export const QAPerformanceStressView: React.FC = () => {
  const [virtualUsers, setVirtualUsers] = useState<number>(100);
  const [durationSec, setDurationSec] = useState<number>(30);
  const [isSimulatingLoad, setIsSimulatingLoad] = useState<boolean>(false);
  const [loadResults, setLoadResults] = useState<any | null>(null);

  // Default simulated load test time series
  const [throughputData, setThroughputData] = useState([
    { time: '00:00', rps: 120, latencyP95: 14, heapMB: 42, activeUsers: 20 },
    { time: '00:05', rps: 340, latencyP95: 18, heapMB: 48, activeUsers: 50 },
    { time: '00:10', rps: 680, latencyP95: 22, heapMB: 54, activeUsers: 100 },
    { time: '00:15', rps: 1200, latencyP95: 35, heapMB: 62, activeUsers: 250 },
    { time: '00:20', rps: 2400, latencyP95: 48, heapMB: 71, activeUsers: 500 },
    { time: '00:25', rps: 3100, latencyP95: 65, heapMB: 83, activeUsers: 750 },
    { time: '00:30', rps: 4200, latencyP95: 82, heapMB: 94, activeUsers: 1000 }
  ]);

  const handleRunLoadTest = async () => {
    setIsSimulatingLoad(true);
    setLoadResults(null);
    try {
      const res = await fetch('/api/qa/stress-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ virtualUsers, durationSec })
      });
      const data = await res.json();
      setLoadResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulatingLoad(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Load, Stress & Memory Leak Simulator</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Benchmark API throughput, latency percentiles, and memory retention under high concurrent traffic
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunLoadTest}
            disabled={isSimulatingLoad}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shadow-md shadow-amber-900/30 flex items-center space-x-2"
          >
            <Gauge className={`w-4 h-4 ${isSimulatingLoad ? 'animate-spin' : ''}`} />
            <span>{isSimulatingLoad ? 'Simulating Load...' : 'Launch Stress Test'}</span>
          </button>
        </div>
      </div>

      {/* Simulator Parameters Control Bar */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <span>Concurrent Virtual Users (VUs)</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400">{virtualUsers} VUs</span>
          </div>
          <input
            type="range"
            min="10"
            max="2500"
            step="10"
            value={virtualUsers}
            onChange={(e) => setVirtualUsers(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <span>Test Duration</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400">{durationSec} Seconds</span>
          </div>
          <input
            type="range"
            min="10"
            max="120"
            step="5"
            value={durationSec}
            onChange={(e) => setDurationSec(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>

        <div className="flex flex-col justify-end">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Simulates parallel REST calls, WebSocket ping rates, DB connection pool contention, and memory heap allocation.
          </div>
        </div>
      </div>

      {/* Simulation Results Alert if available */}
      {loadResults && (
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-md space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
            <span className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Stress Test Simulation Complete</span>
            </span>
            <span>Success Rate: {loadResults.successRate}%</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1 text-slate-300">
            <div>Total Requests: <span className="font-bold text-white">{loadResults.totalRequests.toLocaleString()}</span></div>
            <div>Avg Throughput: <span className="font-bold text-white">{loadResults.avgRps} RPS</span></div>
            <div>Latency p95: <span className="font-bold text-white">{loadResults.latencyP95} ms</span></div>
            <div>Memory Leak Status: <span className="font-bold text-emerald-400">{loadResults.memoryStatus}</span></div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Throughput RPS vs Latency p95 */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Throughput (RPS) & p95 Latency Curve</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Response time vs request volume under traffic scaling</p>
            </div>
            <span className="text-[11px] font-mono bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
              Target: &lt;100ms
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={throughputData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="rps" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} name="Requests/sec (RPS)" />
                <Area type="monotone" dataKey="latencyP95" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} name="Latency p95 (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory Heap Leak Monitor */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Memory Heap Leak Detector</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Node process heap retention</p>
            </div>
            <Cpu className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={throughputData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="heapMB" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} name="Heap Used (MB)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
