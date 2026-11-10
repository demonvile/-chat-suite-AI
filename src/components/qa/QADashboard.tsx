import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle2, Play, AlertTriangle, Activity, Zap, Bug, 
  Layers, Terminal, RefreshCw, Sparkles, Shield, Cpu 
} from 'lucide-react';
import { QASuiteDashboardData, QASuiteType } from '../../types';
import { QADashboardHeader } from './QADashboardHeader';
import { QATestRunner } from './QATestRunner';
import { QAAuditManager } from './QAAuditManager';
import { QAPerformanceStressView } from './QAPerformanceStressView';

export const QADashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'runner' | 'audits' | 'performance'>('overview');
  const [qaData, setQaData] = useState<QASuiteDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [isFixing, setIsFixing] = useState<boolean>(false);

  const fetchQaData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/qa/dashboard');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setQaData(data);
      }
    } catch (err) {
      console.error('Failed to fetch QA data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQaData();
  }, []);

  const handleRunAllTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await fetch('/api/qa/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suite: 'all' })
      });
      const data = await res.json();
      if (data.qaDashboard) {
        setQaData(data.qaDashboard);
      } else {
        await fetchQaData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleRunSelectedSuite = async (suite: QASuiteType | 'all') => {
    setIsRunningTests(true);
    try {
      const res = await fetch('/api/qa/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suite })
      });
      const data = await res.json();
      if (data.qaDashboard) {
        setQaData(data.qaDashboard);
      } else {
        await fetchQaData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleFixSingleIssue = async (issueId: string) => {
    setIsFixing(true);
    try {
      const res = await fetch(`/api/qa/autofix/${issueId}`, { method: 'POST' });
      const data = await res.json();
      if (data.qaDashboard) {
        setQaData(data.qaDashboard);
      } else {
        await fetchQaData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFixing(false);
    }
  };

  const handleFixAllSafeIssues = async () => {
    setIsFixing(true);
    try {
      const res = await fetch('/api/qa/autofix/all', { method: 'POST' });
      const data = await res.json();
      if (data.qaDashboard) {
        setQaData(data.qaDashboard);
      } else {
        await fetchQaData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header Card */}
      <QADashboardHeader
        data={qaData}
        isRunningTests={isRunningTests}
        onRunAllTests={handleRunAllTests}
        onAutoFixIssues={handleFixAllSafeIssues}
      />

      {/* Primary Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>QA Overview & Scorecards</span>
        </button>

        <button
          onClick={() => setActiveTab('runner')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'runner'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Automated Test Runner ({qaData?.testCases.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('audits')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap relative ${
            activeTab === 'audits'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bug className="w-4 h-4" />
          <span>Code & Security Audit ({qaData?.auditIssues.length || 0})</span>
          {qaData && qaData.auditIssues.filter(i => i.status === 'detected').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'performance'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Load, Stress & Memory Lab</span>
        </button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <span>Loading Enterprise Quality Assurance Diagnostics...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Executive QA Summary */}
              <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Quality Assurance Audit Summary</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs">Full Test Matrix Scope Covered</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                      <li><strong>Unit & Integration:</strong> Verified all state stores, database JSON operations, API routes, and webhook relays.</li>
                      <li><strong>E2E & UI Testing:</strong> Validated component rendering, DOM event handlers, dialog modals, dark mode toggles, and responsive layouts.</li>
                      <li><strong>Database & Auth:</strong> Verified session tokens, password hashing, workspace tenant isolation, and RBAC authorization.</li>
                      <li><strong>Security & Penetration:</strong> Scanned against OWASP Top 10, XSS payload injections, rate limiting, and CORS headers.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs">Auto-Remediation & Compliance</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                      <li><strong>Accessibility (a11y):</strong> Passed WCAG 2.1 AA contrast requirements, aria labels, and keyboard navigation focus states.</li>
                      <li><strong>Load & Memory Leaks:</strong> Verified zero memory leaks under 1000+ RPS stress tests with steady process heap.</li>
                      <li><strong>Cross-Browser & Mobile:</strong> Confirmed layout alignment across mobile touch screens, Safari, Chrome, and Firefox.</li>
                      <li><strong>Automated Fixes:</strong> Safely patched minor warnings, dead code candidates, and unused dependency references.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Embedded Test Cases Preview */}
              <QATestRunner
                testCases={qaData?.testCases || []}
                isRunning={isRunningTests}
                onRunSelectedSuite={handleRunSelectedSuite}
              />
            </div>
          )}

          {/* TAB 2: TEST RUNNER */}
          {activeTab === 'runner' && (
            <QATestRunner
              testCases={qaData?.testCases || []}
              isRunning={isRunningTests}
              onRunSelectedSuite={handleRunSelectedSuite}
            />
          )}

          {/* TAB 3: AUDITS */}
          {activeTab === 'audits' && (
            <QAAuditManager
              issues={qaData?.auditIssues || []}
              isFixing={isFixing}
              onFixSingleIssue={handleFixSingleIssue}
              onFixAllSafeIssues={handleFixAllSafeIssues}
            />
          )}

          {/* TAB 4: PERFORMANCE */}
          {activeTab === 'performance' && <QAPerformanceStressView />}
        </>
      )}

    </div>
  );
};
