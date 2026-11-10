import React from 'react';
import { 
  Zap, CheckCircle2, Clock, ShieldCheck, 
  TrendingUp, Layers, Award, AlertCircle 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid 
} from 'recharts';
import { WorkflowAnalytics as IWorkflowAnalytics } from '../../types';

interface WorkflowAnalyticsProps {
  analytics: IWorkflowAnalytics | null;
}

const COLORS = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];

export const WorkflowAnalytics: React.FC<WorkflowAnalyticsProps> = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
        Loading workflow performance metrics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Workflows</span>
            <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">{analytics.totalWorkflows}</div>
          <div className="text-[11px] text-teal-400 font-medium">
            {analytics.activeWorkflows} active engine rules
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Executions</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">{analytics.totalExecutions}</div>
          <div className="text-[11px] text-blue-400 font-medium">
            Avg execution speed: {analytics.avgExecutionTimeMs}ms
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Success Rate</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">{analytics.successRate}%</div>
          <div className="text-[11px] text-emerald-400 font-medium">
            Zero SLA breach violations
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hours Saved</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">{analytics.hoursSavedEstimate} hrs</div>
          <div className="text-[11px] text-purple-400 font-medium">
            Estimated team time saved
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Executions by Industry BarChart */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
          <h3 className="font-bold text-slate-100 text-sm">Automated Executions by Industry</h3>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.executionsByIndustry}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="industry" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px', fontSize: '12px' }} 
                />
                <Bar dataKey="count" fill="#0d9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trigger Events Distribution PieChart */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
          <h3 className="font-bold text-slate-100 text-sm">Trigger Event Distribution</h3>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.executionsByTrigger}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="trigger"
                  label
                >
                  {analytics.executionsByTrigger.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px', fontSize: '12px' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
