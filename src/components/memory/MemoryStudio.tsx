import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Database, 
  Zap, 
  ShieldCheck, 
  RefreshCw, 
  Trash2, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Sparkles, 
  Layers, 
  FileText, 
  Sliders, 
  Building2, 
  User, 
  Target, 
  Heart, 
  FolderKanban, 
  Package, 
  Key,
  BarChart3
} from 'lucide-react';
import { MemoryFact, MemoryStats } from '../../lib/MemoryManager';

interface MemoryStudioProps {
  currentWorkspaceId?: string;
  token?: string;
}

export const MemoryStudio: React.FC<MemoryStudioProps> = ({ 
  currentWorkspaceId = 'ws-admin-user',
  token 
}) => {
  const [facts, setFacts] = useState<MemoryFact[]>([]);
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Fact Sandbox State
  const [sandboxText, setSandboxText] = useState<string>(
    'Hi! My name is David Miller and I am the CEO of Nexus Analytics. Our goal is to scale AI customer support across 100 enterprise clients using PostgreSQL and Node.js.'
  );
  const [extractedResults, setExtractedResults] = useState<any[] | null>(null);
  const [extracting, setExtracting] = useState<boolean>(false);

  // Manual Fact Creation State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<MemoryFact['category']>('company_name');
  const [newKey, setNewKey] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');

  // Automated Test Suite State
  const [testResults, setTestResults] = useState<any | null>(null);
  const [runningTests, setRunningTests] = useState<boolean>(false);

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'x-workspace-id': currentWorkspaceId
  };

  const fetchFactsAndStats = async () => {
    setLoading(true);
    try {
      const [factsRes, statsRes] = await Promise.all([
        fetch(`/api/memory/facts?workspaceId=${currentWorkspaceId}`, { headers }),
        fetch(`/api/memory/stats?workspaceId=${currentWorkspaceId}`, { headers })
      ]);

      if (factsRes.ok) {
        const data = await factsRes.json();
        setFacts(data.facts || []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch memory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactsAndStats();
  }, [currentWorkspaceId]);

  const handleExtractSandbox = async () => {
    if (!sandboxText.trim()) return;
    setExtracting(true);
    try {
      const res = await fetch('/api/memory/extract', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: sandboxText,
          workspaceId: currentWorkspaceId,
          threadId: 'sandbox-thread'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setExtractedResults(data.extractedFacts || []);
        fetchFactsAndStats();
      }
    } catch (err) {
      console.error('Extraction failed:', err);
    } finally {
      setExtracting(false);
    }
  };

  const handleCreateFact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;
    try {
      const res = await fetch('/api/memory/facts', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          workspaceId: currentWorkspaceId,
          category: newCategory,
          key: newKey || newCategory,
          value: newValue,
          confidence: 1.0,
          source: 'user_explicit'
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewKey('');
        setNewValue('');
        fetchFactsAndStats();
      }
    } catch (err) {
      console.error('Failed to add fact:', err);
    }
  };

  const handleDeleteFact = async (id: string) => {
    try {
      const res = await fetch(`/api/memory/facts/${id}?workspaceId=${currentWorkspaceId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        setFacts(prev => prev.filter(f => f.id !== id));
        fetchFactsAndStats();
      }
    } catch (err) {
      console.error('Failed to delete fact:', err);
    }
  };

  const handleRunTestSuite = async () => {
    setRunningTests(true);
    setTestResults(null);
    try {
      const res = await fetch('/api/memory/test-suite', {
        method: 'POST',
        headers
      });
      if (res.ok) {
        const data = await res.json();
        setTestResults(data);
        fetchFactsAndStats();
      }
    } catch (err) {
      console.error('Test suite execution failed:', err);
    } finally {
      setRunningTests(false);
    }
  };

  const getCategoryBadge = (category: MemoryFact['category']) => {
    switch (category) {
      case 'company_name':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"><Building2 className="w-3 h-3" /> Company Name</span>;
      case 'user_name':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"><User className="w-3 h-3" /> User Name</span>;
      case 'goals':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"><Target className="w-3 h-3" /> Goals</span>;
      case 'preferences':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"><Heart className="w-3 h-3" /> Preferences</span>;
      case 'projects':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300"><FolderKanban className="w-3 h-3" /> Projects</span>;
      case 'products':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"><Package className="w-3 h-3" /> Products</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"><Key className="w-3 h-3" /> Custom</span>;
    }
  };

  const filteredFacts = facts.filter(f => {
    const matchesCat = categoryFilter === 'all' || f.category === categoryFilter;
    const matchesSearch = searchQuery === '' || 
      f.value.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <Brain className="w-4 h-4 animate-pulse" />
            <span>Enterprise AI Architecture</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Intelligent Conversation Memory Studio</h2>
          <p className="text-slate-300 text-sm max-w-2xl">
            Real-time fact extraction, multi-tenant workspace isolation, conversation summarization, and prompt context retrieval.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchFactsAndStats}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleRunTestSuite}
            disabled={runningTests}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow border border-indigo-500 transition"
          >
            <Play className={`w-3.5 h-3.5 ${runningTests ? 'animate-spin' : ''}`} />
            {runningTests ? 'Running Test Suite...' : 'Run Automated Tests'}
          </button>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalFacts || facts.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Stored User Facts</div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">~65% - 85%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Token Savings via Pruning</div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">Isolated</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Workspace Tenant Scope</div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalSummaries || 0}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Thread Summaries</div>
          </div>
        </div>
      </div>

      {/* Automated Test Suite Modal or Output Box */}
      {testResults && (
        <div className="p-6 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-bold text-base">
              {testResults.allPassed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400" />
              )}
              <span>Automated Memory Test Suite Execution Report</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">{testResults.timestamp}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testResults.results?.map((res: any, idx: number) => (
              <div 
                key={idx}
                className={`p-3 rounded-lg border text-xs space-y-1 ${
                  res.passed 
                    ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200' 
                    : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>{res.testName}</span>
                  <span className="font-mono text-[10px] opacity-80">{res.durationMs}ms</span>
                </div>
                <p className="opacity-90 font-mono text-[11px]">{res.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fact Extraction Sandbox */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Fact Extraction Sandbox Playground</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Test NLP pattern detection live</span>
        </div>

        <div className="space-y-3">
          <textarea
            value={sandboxText}
            onChange={e => setSandboxText(e.target.value)}
            rows={3}
            placeholder="Type any conversational statement containing user facts..."
            className="w-full p-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-end">
            <button
              onClick={handleExtractSandbox}
              disabled={extracting || !sandboxText.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
            >
              <Zap className={`w-3.5 h-3.5 ${extracting ? 'animate-spin' : ''}`} />
              {extracting ? 'Extracting Facts...' : 'Test Fact Extraction'}
            </button>
          </div>
        </div>

        {extractedResults && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Extracted {extractedResults.length} Fact(s):
            </div>
            {extractedResults.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No facts identified in statement.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {extractedResults.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-xs">
                    {getCategoryBadge(f.category)}
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">"{f.value}"</span>
                    <span className="text-[10px] text-slate-400">({Math.round((f.confidence || 0.9) * 100)}% conf)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Fact Management Table */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Isolated Workspace Memory Store</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active Scope: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400">{currentWorkspaceId}</code>
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Manual Fact
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search facts by key or value..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
          >
            <option value="all">All Categories</option>
            <option value="company_name">Company Name</option>
            <option value="user_name">User Name</option>
            <option value="goals">Goals</option>
            <option value="preferences">Preferences</option>
            <option value="projects">Projects</option>
            <option value="products">Products</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading workspace memory store...
          </div>
        ) : filteredFacts.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs space-y-2">
            <Brain className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
            <p>No facts stored for this workspace yet.</p>
            <p className="text-[11px] text-slate-400">Facts are automatically captured when visitors chat with your AI assistant.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-semibold">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Key / Property</th>
                  <th className="p-3">Stored Fact Value</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Last Updated</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredFacts.map(fact => (
                  <tr key={fact.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3">{getCategoryBadge(fact.category)}</td>
                    <td className="p-3 font-mono font-medium text-slate-600 dark:text-slate-400">{fact.key}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">{fact.value}</td>
                    <td className="p-3">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {Math.round((fact.confidence || 0.95) * 100)}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        fact.source === 'user_explicit' 
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' 
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {fact.source || 'extracted'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {new Date(fact.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteFact(fact.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Delete Fact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Fact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Add User Fact to Memory Store</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFact} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="company_name">Company Name</option>
                  <option value="user_name">User Name</option>
                  <option value="goals">Goals</option>
                  <option value="preferences">Preferences</option>
                  <option value="projects">Projects</option>
                  <option value="products">Products</option>
                  <option value="custom">Custom Key/Value</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Key Name</label>
                <input
                  type="text"
                  value={newKey}
                  onChange={e => setNewKey(e.target.value)}
                  placeholder="e.g., company_name or tech_stack"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Fact Value</label>
                <input
                  type="text"
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  placeholder="e.g., Apex Logistics or React + PostgreSQL"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Save Fact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
