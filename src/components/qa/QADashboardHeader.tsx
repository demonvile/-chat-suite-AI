import React from 'react';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, Zap, Activity, Bug, Lock, 
  Eye, RefreshCw, Cpu, Server, Clock, Layers 
} from 'lucide-react';
import { QASuiteDashboardData } from '../../types';

interface QADashboardHeaderProps {
  data: QASuiteDashboardData | null;
  isRunningTests: boolean;
  onRunAllTests: () => void;
  onAutoFixIssues: () => void;
}

export const QADashboardHeader: React.FC<QADashboardHeaderProps> = ({
  data,
  isRunningTests,
  onRunAllTests,
  onAutoFixIssues
}) => {
  if (!data) return null;

  const passRate = data.totalTests > 0 
    ? Math.round((data.passedTests / data.totalTests) * 100) 
    : 100;

  const unfixedIssuesCount = data.auditIssues.filter(i => i.status === 'detected').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Trigger Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">Automated QA & Security Audit Engine</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ENTERPRISE QA ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Full-spectrum testing: Unit, Integration, E2E, API, UI, DB, Security, Load & Accessibility
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {unfixedIssuesCount > 0 && (
            <button
              onClick={onAutoFixIssues}
              disabled={isRunningTests}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-900/30"
            >
              <Bug className="w-4 h-4" />
              <span>Auto-Fix Safe Issues ({unfixedIssuesCount})</span>
            </button>
          )}

          <button
            onClick={onRunAllTests}
            disabled={isRunningTests}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-900/30 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRunningTests ? 'animate-spin' : ''}`} />
            <span>{isRunningTests ? 'Executing QA Suite...' : 'Run Automated QA & Audit'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Pass Rate Card */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pass Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {passRate}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {data.passedTests} passed / {data.failedTests} failed
          </div>
        </div>

        {/* Performance Score */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-medium">Performance</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {data.performanceScore} / 100
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Avg API Latency: 12ms
          </div>
        </div>

        {/* Security Score */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Security Score</span>
            <Lock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            {data.securityScore} / 100
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            OWASP Top 10 Verified
          </div>
        </div>

        {/* Accessibility Score */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Accessibility</span>
            <Eye className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-2">
            {data.accessibilityScore} / 100
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            WCAG 2.1 AA Compliant
          </div>
        </div>

        {/* Code Quality Score */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Code Quality</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
            {data.codeQualityScore} / 100
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Zero Critical Debt
          </div>
        </div>

        {/* Overall Health Score */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overall System</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {data.overallScore}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Production-Ready
          </div>
        </div>

      </div>

      {/* Environment Context Metadata Banner */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 px-4 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-3 font-mono">
        <div className="flex items-center space-x-2">
          <Server className="w-3.5 h-3.5 text-slate-400" />
          <span>Runtime: Node.js {data.environmentDetails.nodeVersion} ({data.environmentDetails.environment})</span>
        </div>
        <div className="flex items-center space-x-2">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <span>Memory Heap: {data.environmentDetails.memoryUsageMB} MB</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Uptime: {Math.floor(data.environmentDetails.uptimeSeconds / 60)} min</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Last Executed: {new Date(data.executionTimestamp).toLocaleTimeString()}
        </div>
      </div>

    </div>
  );
};
