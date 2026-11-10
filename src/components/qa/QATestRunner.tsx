import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle, AlertTriangle, Play, Filter, Search, Terminal, 
  Code2, Clock, ChevronDown, ChevronRight, Layers, Smartphone, Lock, Eye, Zap, Database
} from 'lucide-react';
import { QATestCase, QASuiteType } from '../../types';

interface QATestRunnerProps {
  testCases: QATestCase[];
  isRunning: boolean;
  onRunSelectedSuite: (suite: QASuiteType | 'all') => void;
}

export const QATestRunner: React.FC<QATestRunnerProps> = ({
  testCases,
  isRunning,
  onRunSelectedSuite
}) => {
  const [selectedSuiteFilter, setSelectedSuiteFilter] = useState<QASuiteType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTestCaseId, setExpandedTestCaseId] = useState<string | null>(null);

  const suites: { id: QASuiteType | 'all'; label: string; icon: any }[] = [
    { id: 'all', label: 'All Suites', icon: Layers },
    { id: 'unit', label: 'Unit Tests', icon: Code2 },
    { id: 'integration', label: 'Integration Tests', icon: Layers },
    { id: 'e2e', label: 'End-to-End Tests', icon: Play },
    { id: 'api', label: 'API Testing', icon: Terminal },
    { id: 'ui', label: 'UI Testing', icon: Eye },
    { id: 'db', label: 'Database Testing', icon: Database },
    { id: 'auth', label: 'Authentication & Authz', icon: Lock },
    { id: 'security', label: 'Security Penetration', icon: Lock },
    { id: 'performance', label: 'Performance & Load', icon: Zap },
    { id: 'accessibility', label: 'Accessibility (a11y)', icon: Eye },
    { id: 'mobile', label: 'Mobile & Cross-Browser', icon: Smartphone }
  ];

  const filteredCases = testCases.filter(tc => {
    const matchesSuite = selectedSuiteFilter === 'all' || tc.suite === selectedSuiteFilter;
    const matchesSearch = tc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tc.categoryTag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSuite && matchesSearch;
  });

  const getStatusBadge = (status: QATestCase['status']) => {
    switch (status) {
      case 'passed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Passed</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            <span>Failed</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Warning</span>
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            Skipped
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Suite Filter Bar & Trigger */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Horizontal Scroll Pill Filters */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full lg:w-auto p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
          {suites.map((s) => {
            const Icon = s.icon;
            const count = s.id === 'all' 
              ? testCases.length 
              : testCases.filter(c => c.suite === s.id).length;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSuiteFilter(s.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  selectedSuiteFilter === s.id
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.label} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search & Run Single Suite */}
        <div className="flex items-center space-x-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search test cases or assertions..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
          </div>

          <button
            onClick={() => onRunSelectedSuite(selectedSuiteFilter)}
            disabled={isRunning}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap flex items-center space-x-1.5 shadow-xs"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run {selectedSuiteFilter === 'all' ? 'All' : selectedSuiteFilter.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Test Cases List / Table */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        
        {/* Table Header */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <div className="col-span-5 md:col-span-6 flex items-center space-x-2">
            <span>Test Case Name</span>
          </div>
          <div className="col-span-3 md:col-span-2">Suite</div>
          <div className="col-span-2 text-right">Status</div>
          <div className="col-span-2 text-right">Duration</div>
        </div>

        {/* Test Case Items */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredCases.map((tc) => {
            const isExpanded = expandedTestCaseId === tc.id;
            return (
              <div key={tc.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                
                {/* Row Summary */}
                <div 
                  onClick={() => setExpandedTestCaseId(isExpanded ? null : tc.id)}
                  className="px-5 py-3.5 grid grid-cols-12 gap-4 items-center cursor-pointer text-xs"
                >
                  <div className="col-span-5 md:col-span-6 flex items-center space-x-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                        <span>{tc.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-normal">
                          ({tc.assertionsCount} assertions)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {tc.description}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 md:col-span-2 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px]">
                      {tc.suite}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    {getStatusBadge(tc.status)}
                  </div>

                  <div className="col-span-2 text-right font-mono text-slate-500 dark:text-slate-400 text-[11px] flex items-center justify-end space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{tc.durationMs}ms</span>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="px-12 py-4 bg-slate-950 text-slate-200 font-mono text-xs border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                      <span>Assertions Executed: {tc.assertionsCount}</span>
                      <span>Category Tag: {tc.categoryTag}</span>
                    </div>

                    {tc.codeSnippet && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-indigo-400">Test Implementation Code:</div>
                        <pre className="p-3 bg-slate-900 rounded-lg overflow-x-auto text-[11px] text-indigo-200 border border-slate-800 leading-relaxed">
                          <code>{tc.codeSnippet}</code>
                        </pre>
                      </div>
                    )}

                    {tc.errorMessage && (
                      <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-lg space-y-1">
                        <div className="font-bold text-xs text-rose-200">Execution Error: {tc.errorMessage}</div>
                        {tc.stackTrace && (
                          <pre className="text-[10px] text-rose-400 overflow-x-auto whitespace-pre-wrap">
                            {tc.stackTrace}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
