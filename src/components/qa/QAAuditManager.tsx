import React, { useState } from 'react';
import { 
  Bug, AlertTriangle, CheckCircle2, ShieldAlert, Cpu, Link2, Zap, 
  Code2, Eye, Wrench, Sparkles, Filter, Search 
} from 'lucide-react';
import { QAAuditIssue, QAAuditSeverity } from '../../types';

interface QAAuditManagerProps {
  issues: QAAuditIssue[];
  isFixing: boolean;
  onFixSingleIssue: (issueId: string) => void;
  onFixAllSafeIssues: () => void;
}

export const QAAuditManager: React.FC<QAAuditManagerProps> = ({
  issues,
  isFixing,
  onFixSingleIssue,
  onFixAllSafeIssues
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'bug', label: 'Bugs' },
    { id: 'memory_leak', label: 'Memory Leaks' },
    { id: 'broken_link', label: 'Broken Links' },
    { id: 'performance', label: 'Performance' },
    { id: 'duplicate_code', label: 'Duplicate Code' },
    { id: 'dead_code', label: 'Dead Code' },
    { id: 'unused_dep', label: 'Unused Dependencies' },
    { id: 'ui_inconsistency', label: 'UI Inconsistencies' },
    { id: 'a11y', label: 'Accessibility (a11y)' },
    { id: 'security', label: 'Security Vulnerabilities' }
  ];

  const filteredIssues = issues.filter(i => {
    const matchesCat = selectedCategory === 'all' || i.category === selectedCategory;
    const matchesSev = selectedSeverity === 'all' || i.severity === selectedSeverity;
    const matchesSearch = i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          i.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSev && matchesSearch;
  });

  const getSeverityBadge = (sev: QAAuditSeverity) => {
    switch (sev) {
      case 'critical':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400 border border-rose-300">CRITICAL</span>;
      case 'high':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400 border border-orange-300">HIGH</span>;
      case 'medium':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border border-amber-300">MEDIUM</span>;
      case 'low':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 border border-blue-300">LOW</span>;
      case 'info':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300">INFO</span>;
    }
  };

  const unfixedCount = issues.filter(i => i.status === 'detected').length;
  const fixedCount = issues.filter(i => i.status === 'fixed').length;

  return (
    <div className="space-y-6">
      
      {/* Action Banner */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Automated Audit & Issue Detection Hub</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {unfixedCount} active issues detected across codebase, runtime memory, security & accessibility &bull; {fixedCount} auto-fixed
          </p>
        </div>

        {unfixedCount > 0 && (
          <button
            onClick={onFixAllSafeIssues}
            disabled={isFixing}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center space-x-1.5 whitespace-nowrap"
          >
            <Wrench className={`w-4 h-4 ${isFixing ? 'animate-spin' : ''}`} />
            <span>{isFixing ? 'Applying Remediation Fixes...' : `Auto-Fix All ${unfixedCount} Issues`}</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Category Dropdown/Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 px-3 py-1.5 outline-none cursor-pointer"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900">{c.label}</option>
              ))}
            </select>
          </div>

          {/* Severity & Search */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold px-3 py-1.5 text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by issue title, location..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Zero Issues Found in Selected Filter</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              All codebase checks, security rules, and performance constraints are verified safe.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredIssues.map((issue) => (
              <div key={issue.id} className="p-5 hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2.5">
                      {getSeverityBadge(issue.severity)}
                      
                      <span className="font-mono text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {issue.category.replace('_', ' ')}
                      </span>

                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                        {issue.title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {issue.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span className="font-mono bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                        Location: <code className="text-indigo-600 dark:text-indigo-400">{issue.location}</code>
                      </span>
                      <span>Recommendation: {issue.recommendation}</span>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center space-x-3 self-end lg:self-center">
                    {issue.status === 'fixed' ? (
                      <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Fixed & Safe</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => onFixSingleIssue(issue.id)}
                        disabled={isFixing}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:hover:bg-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Auto-Fix</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
