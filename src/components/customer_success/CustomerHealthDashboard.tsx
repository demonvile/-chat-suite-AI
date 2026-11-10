import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, MessageSquare, Database, Award, 
  Activity, CheckCircle2, ShieldCheck, Star, RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface CustomerHealthDashboardProps {
  addToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const CustomerHealthDashboard: React.FC<CustomerHealthDashboardProps> = ({ addToast }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customer-success/health');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching health data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="p-12 text-center text-xs text-slate-400 font-mono">Calculating workspace health score...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Health Index Hero Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-900/60 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Activity size={14} /> Workspace Health Index
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Customer Adoption & Health Score
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Your account is operating in the top 5% percentile for AI agent accuracy, RAG index coverage, and webhook synchronization stability.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-6 rounded-2xl flex items-center gap-5 shrink-0">
            <div className="text-center">
              <span className="font-display text-4xl sm:text-5xl font-extrabold text-emerald-400">
                {data.healthScore}
              </span>
              <span className="text-xs text-slate-400 block font-bold mt-1">/ 100 Health</span>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500 text-slate-950 block text-center">
                {data.statusLabel}
              </span>
              <span className="text-[10px] text-slate-300 block mt-1.5 font-mono">0 Production Downtime</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Weekly AI Queries', val: data.metrics.weeklyConversations.toLocaleString(), sub: '+18% vs last week', icon: MessageSquare, color: 'text-blue-500' },
          { label: 'RAG Knowledge Coverage', val: `${data.metrics.kbCoveragePercent}%`, sub: 'Active Vector Grounding', icon: Database, color: 'text-indigo-500' },
          { label: 'CSAT Customer Score', val: `${data.metrics.csatScore} / 5.0`, sub: `${data.metrics.csatTotalResponses} Reviews`, icon: Star, color: 'text-amber-500' },
          { label: 'Avg Response Time', val: `${data.metrics.firstResponseTimeMinutes}s`, sub: 'Sub-second AI streaming', icon: Award, color: 'text-emerald-500' }
        ].map((kpi, idx) => {
          const IconComponent = kpi.icon;
          return (
            <div key={idx} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">{kpi.label}</span>
                <IconComponent size={18} className={kpi.color} />
              </div>
              <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">{kpi.val}</h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Activity Trend Chart & Feature Adoption */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Conversations & Leads Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              7-Day Visitor Conversations & Leads Activity
            </h3>
            <span className="text-xs font-mono font-bold text-blue-600">Live Traffic</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.activityTrend}>
                <defs>
                  <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} 
                />
                <Area type="monotone" dataKey="conversations" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorConv)" name="AI Conversations" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Adoption Breakdown */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
            Feature Adoption Depth
          </h3>

          <div className="space-y-4">
            {data.featureAdoption.map((feat: any, idx: number) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{feat.name}</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{feat.adoptionPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${feat.adoptionPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
