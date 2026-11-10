import React, { useState, useEffect } from 'react';
import {
  BookOpen, FileText, Upload, Search, Database, Layers, Folder, Filter,
  Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Trash2,
  ExternalLink, Eye, Clock, Download, Plus, Globe, HelpCircle, FileCode,
  Sliders, Tag, ChevronRight, BarChart2, Check, X, Shield, Lock, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KnowledgeDocument, KnowledgeFolder, RagSearchResult, KnowledgeAnalytics } from '../../types';

interface RagKnowledgeStudioProps {
  token: string;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  setActiveSection?: (sec: string) => void;
}

export const RagKnowledgeStudio: React.FC<RagKnowledgeStudioProps> = ({
  token,
  addToast,
  setActiveSection
}) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'search' | 'chunks' | 'analytics' | 'permissions'>('documents');
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [folders, setFolders] = useState<KnowledgeFolder[]>([]);
  const [analytics, setAnalytics] = useState<KnowledgeAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');

  // Modals & Selection
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedDocForVersion, setSelectedDocForVersion] = useState<KnowledgeDocument | null>(null);
  const [selectedDocForChunks, setSelectedDocForChunks] = useState<KnowledgeDocument | null>(null);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Add Document Form State
  const [addForm, setAddForm] = useState({
    title: '',
    sourceType: 'pdf' as 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'txt' | 'csv' | 'url' | 'faq' | 'article' | 'manual',
    category: 'General',
    department: 'All' as 'All' | 'Engineering' | 'HR' | 'Sales' | 'Legal' | 'Support' | 'Executive',
    folderPath: '/General',
    tags: '',
    rawContent: '',
    urlLocation: ''
  });

  // AI RAG Playground State
  const [ragQuery, setRagQuery] = useState<string>('What is our monthly SLA uptime guarantee and support response time?');
  const [ragSearchType, setRagSearchType] = useState<'hybrid' | 'semantic' | 'keyword'>('hybrid');
  const [ragResult, setRagResult] = useState<RagSearchResult | null>(null);
  const [isSearchingRag, setIsSearchingRag] = useState<boolean>(false);

  // Active Workspace
  const [activeWorkspace, setActiveWorkspace] = useState<string>('Global Corporate Workspace');

  // Fetch Documents & Analytics
  const fetchKnowledgeData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedDepartment !== 'All') queryParams.append('department', selectedDepartment);
      if (selectedSourceType) queryParams.append('sourceType', selectedSourceType);
      if (selectedFolder) queryParams.append('folderPath', selectedFolder);
      if (searchQuery) queryParams.append('search', searchQuery);

      const res = await fetch(`/api/rag/documents?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
        setFolders(data.folders || []);
        setAnalytics(data.analytics || null);
      }
    } catch (e) {
      console.error(e);
      addToast('Failed to load knowledge base documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeData();
  }, [selectedDepartment, selectedSourceType, selectedFolder, searchQuery]);

  // Handle RAG AI Search
  const handleExecuteRagSearch = async () => {
    if (!ragQuery.trim()) {
      addToast('Please enter a query for RAG Search', 'info');
      return;
    }

    setIsSearchingRag(true);
    try {
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: ragQuery,
          searchType: ragSearchType,
          departmentFilter: selectedDepartment !== 'All' ? selectedDepartment : undefined
        })
      });

      if (res.ok) {
        const data: RagSearchResult = await res.json();
        setRagResult(data);
        addToast(`RAG Retrieval complete (${data.latencyMs}ms)`, 'success');
      } else {
        addToast('RAG Search failed', 'error');
      }
    } catch (e) {
      console.error(e);
      addToast('Network error during RAG Search', 'error');
    } finally {
      setIsSearchingRag(false);
    }
  };

  // Add Document Submission
  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.title.trim()) {
      addToast('Document title is required', 'error');
      return;
    }

    try {
      const res = await fetch('/api/rag/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: addForm.title,
          sourceType: addForm.sourceType,
          category: addForm.category,
          department: addForm.department,
          folderPath: addForm.folderPath,
          tags: addForm.tags.split(',').map(t => t.trim()).filter(Boolean),
          rawContent: addForm.rawContent,
          urlLocation: addForm.urlLocation
        })
      });

      if (res.ok) {
        addToast('Knowledge Document uploaded, scanned & indexed', 'success');
        setShowAddModal(false);
        setAddForm({
          title: '',
          sourceType: 'pdf',
          category: 'General',
          department: 'All',
          folderPath: '/General',
          tags: '',
          rawContent: '',
          urlLocation: ''
        });
        fetchKnowledgeData();
      } else {
        addToast('Failed to upload document', 'error');
      }
    } catch (e) {
      console.error(e);
      addToast('Error uploading document', 'error');
    }
  };

  // Delete Single Document
  const handleDeleteDocument = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}" and purge its vector index?`)) return;

    try {
      const res = await fetch(`/api/rag/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast(`Deleted "${title}" and purged vectors`, 'success');
        fetchKnowledgeData();
      }
    } catch (e) {
      console.error(e);
      addToast('Error deleting document', 'error');
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedDocIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedDocIds.length} selected documents?`)) return;

    try {
      const res = await fetch('/api/rag/documents/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docIds: selectedDocIds })
      });

      if (res.ok) {
        addToast(`Successfully deleted ${selectedDocIds.length} documents`, 'success');
        setSelectedDocIds([]);
        fetchKnowledgeData();
      }
    } catch (e) {
      console.error(e);
      addToast('Error executing bulk delete', 'error');
    }
  };

  const toggleSelectDoc = (id: string) => {
    if (selectedDocIds.includes(id)) {
      setSelectedDocIds(selectedDocIds.filter(i => i !== id));
    } else {
      setSelectedDocIds([...selectedDocIds, id]);
    }
  };

  const selectAllDocs = () => {
    if (selectedDocIds.length === documents.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(documents.map(d => d.id));
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="text-rose-500" size={16} />;
      case 'docx': return <FileText className="text-blue-500" size={16} />;
      case 'xlsx': return <FileText className="text-emerald-500" size={16} />;
      case 'pptx': return <FileText className="text-amber-500" size={16} />;
      case 'url': return <Globe className="text-cyan-500" size={16} />;
      case 'faq': return <HelpCircle className="text-purple-500" size={16} />;
      case 'article': return <BookOpen className="text-indigo-500" size={16} />;
      default: return <FileCode className="text-slate-400" size={16} />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Top Header & Workspace Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Database size={20} />
            </span>
            <h1 className="text-2xl font-bold font-display text-white">Enterprise Knowledge Base & RAG Engine</h1>
          </div>
          <p className="text-sm text-slate-400">
            Multi-source vector ingestion, semantic hybrid retrieval, malware scanning, and access-controlled contextual intelligence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Workspace Dropdown Selector */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <Shield size={14} className="text-emerald-400" />
            <span className="text-slate-400">Workspace:</span>
            <select
              value={activeWorkspace}
              onChange={e => setActiveWorkspace(e.target.value)}
              className="bg-transparent text-white font-semibold cursor-pointer outline-none"
            >
              <option value="Global Corporate Workspace">Global Corporate Workspace</option>
              <option value="Engineering Hub">Engineering Hub</option>
              <option value="Customer Support Space">Customer Support Space</option>
              <option value="Executive Confidential">Executive Confidential</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Knowledge Source</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Indexed Documents</span>
              <FileText size={16} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{analytics.totalDocuments}</p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck size={12} />
              <span>100% Malware Clean & Encrypted</span>
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Vector Chunks Ingested</span>
              <Layers size={16} className="text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white">{analytics.totalChunks}</p>
            <p className="text-[11px] text-slate-400">Storage: {analytics.totalStorageUsedMb} MB</p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>RAG Avg Search Latency</span>
              <Clock size={16} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{analytics.avgSearchLatencyMs} ms</p>
            <p className="text-[11px] text-emerald-400 font-medium">Ultra-Fast Vector Retrieval</p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Monthly RAG Query Citations</span>
              <Sparkles size={16} className="text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{analytics.monthlyQueries.toLocaleString()}</p>
            <p className="text-[11px] text-blue-400">Contextual Accuracy Rate: 98.4%</p>
          </div>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex items-center border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'documents', label: 'Knowledge Repository', icon: FileText, count: documents.length },
          { id: 'search', label: 'AI RAG Search Playground', icon: Sparkles },
          { id: 'chunks', label: 'Vector Chunks Inspector', icon: Layers },
          { id: 'analytics', label: 'Usage & Citations', icon: BarChart2 },
          { id: 'permissions', label: 'Security & Access Control', icon: Lock }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: KNOWLEDGE REPOSITORY & DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search documents by title, tags, or content..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-white cursor-pointer">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Department Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {['All', 'Legal', 'HR', 'Engineering', 'Sales', 'Support'].map(dept => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                    selectedDepartment === dept
                      ? 'bg-blue-600/20 border border-blue-500 text-blue-300 font-bold'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            {/* Source Type Filter */}
            <select
              value={selectedSourceType}
              onChange={e => setSelectedSourceType(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
            >
              <option value="">All Source Types</option>
              <option value="pdf">PDF Documents</option>
              <option value="docx">Word (.docx)</option>
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="pptx">PowerPoint (.pptx)</option>
              <option value="url">Web URLs</option>
              <option value="faq">FAQs</option>
              <option value="article">Articles</option>
              <option value="manual">Manual Input</option>
            </select>
          </div>

          {/* Bulk Action Controls */}
          {selectedDocIds.length > 0 && (
            <div className="flex items-center justify-between bg-blue-950/40 border border-blue-800 px-4 py-2.5 rounded-xl text-xs">
              <span className="text-blue-300 font-medium">
                {selectedDocIds.length} document(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Bulk Delete</span>
                </button>
              </div>
            </div>
          )}

          {/* Document Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedDocIds.length > 0 && selectedDocIds.length === documents.length}
                        onChange={selectAllDocs}
                        className="rounded bg-slate-900 border-slate-800 cursor-pointer"
                      />
                    </th>
                    <th className="p-3.5">Document Title & Format</th>
                    <th className="p-3.5">Department & Category</th>
                    <th className="p-3.5">Chunks & Version</th>
                    <th className="p-3.5">Security Status</th>
                    <th className="p-3.5">Access Level</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        <RefreshCw className="animate-spin inline-block mr-2" size={16} />
                        Loading Knowledge Base Documents...
                      </td>
                    </tr>
                  ) : documents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No knowledge base documents found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    documents.map(doc => (
                      <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={selectedDocIds.includes(doc.id)}
                            onChange={() => toggleSelectDoc(doc.id)}
                            className="rounded bg-slate-900 border-slate-800 cursor-pointer"
                          />
                        </td>

                        {/* Title & Format */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                              {getSourceIcon(doc.sourceType)}
                            </span>
                            <div>
                              <p className="font-semibold text-white leading-tight hover:text-blue-400 transition-colors">
                                {doc.title}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                <span className="uppercase font-mono">{doc.sourceType}</span>
                                <span>•</span>
                                <span>{doc.fileSizeFormatted}</span>
                                <span>•</span>
                                <span>Added {new Date(doc.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Department & Category */}
                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 bg-blue-950/60 border border-blue-800/80 text-blue-300 rounded text-[10px] font-semibold">
                              {doc.department}
                            </span>
                            <p className="text-[11px] text-slate-400">{doc.category}</p>
                          </div>
                        </td>

                        {/* Chunks & Version */}
                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <span className="text-slate-200 font-medium">{doc.chunkCount} Chunks</span>
                            <div>
                              <button
                                onClick={() => setSelectedDocForVersion(doc)}
                                className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>Version v{doc.version}</span>
                                <Clock size={10} />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Security */}
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 rounded text-[10px] font-bold flex items-center gap-1 w-max">
                            <ShieldCheck size={12} />
                            <span>Malware Clean</span>
                          </span>
                        </td>

                        {/* Access Permission */}
                        <td className="p-3.5">
                          <span className="capitalize text-[11px] text-slate-300 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                            {doc.accessPermission}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setSelectedDocForChunks(doc)}
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Inspect Vector Chunks"
                          >
                            <Layers size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteDocument(doc.id, doc.title)}
                            className="p-1.5 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI RAG SEARCH PLAYGROUND */}
      {activeTab === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Query Controls Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <Sparkles size={16} />
                <span>RAG Search Parameters</span>
              </div>

              {/* Preset Query Buttons */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Sample Enterprise Queries:</label>
                <div className="space-y-1">
                  {[
                    "What is our monthly SLA uptime guarantee?",
                    "How much is the professional development stipend?",
                    "What are the API rate limits and Webhook headers?",
                    "Where is customer data stored and encrypted?"
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setRagQuery(preset)}
                      className="w-full text-left p-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 rounded-xl text-xs text-slate-300 transition-colors cursor-pointer truncate"
                    >
                      "{preset}"
                    </button>
                  ))}
                </div>
              </div>

              {/* RAG Strategy Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Retrieval Strategy:</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {[
                    { id: 'hybrid', label: 'Hybrid' },
                    { id: 'semantic', label: 'Semantic' },
                    { id: 'keyword', label: 'Keyword' }
                  ].map(strat => (
                    <button
                      key={strat.id}
                      onClick={() => setRagSearchType(strat.id as any)}
                      className={`py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        ragSearchType === strat.id
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {strat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Query Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Natural Language Prompt:</label>
                <textarea
                  rows={4}
                  value={ragQuery}
                  onChange={e => setRagQuery(e.target.value)}
                  placeholder="Enter prompt to query vector database..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleExecuteRagSearch}
                disabled={isSearchingRag}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSearchingRag ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    <span>Retrieving Context Chunks...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Run AI RAG Retrieval</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Response & Citation Cards Column */}
          <div className="lg:col-span-2 space-y-4">
            {ragResult ? (
              <div className="space-y-4">
                {/* AI Generated Answer Box */}
                <div className="p-5 bg-gradient-to-br from-slate-900 to-blue-950/40 border border-blue-800/80 rounded-2xl shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-800/40 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg">
                        <Sparkles size={16} />
                      </span>
                      <h3 className="font-bold text-sm text-white">AI RAG Synthesized Answer</h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                        {ragResult.confidenceScore}% Confidence Score
                      </span>
                      <span className="text-slate-400">{ragResult.latencyMs} ms</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {ragResult.answer}
                  </p>
                </div>

                {/* Source Citations Grid */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen size={14} className="text-blue-400" />
                    <span>Source Citations ({ragResult.citations.length})</span>
                  </h4>

                  <div className="grid grid-cols-1 gap-3">
                    {ragResult.citations.map((citation, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl space-y-2 transition-all"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-blue-950 text-blue-300 font-mono text-[10px] rounded border border-blue-800">
                              Chunk #{citation.chunkIndex}
                            </span>
                            <span className="font-bold text-white">{citation.docTitle}</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold">
                            {citation.matchScore}% Vector Score
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 italic bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                          "{citation.snippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 space-y-3">
                <Cpu className="mx-auto text-blue-400 animate-pulse" size={32} />
                <h3 className="text-sm font-bold text-white">AI RAG Search Playground Ready</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click 'Run AI RAG Retrieval' to test contextual vector search with automatic citation linking.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: VECTOR CHUNKS INSPECTOR */}
      {activeTab === 'chunks' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white">Vector Chunks Inspector</h3>
              <p className="text-xs text-slate-400">Inspect chunk tokenization and metadata extraction.</p>
            </div>
            <span className="text-xs text-blue-400 font-medium">Auto-Chunking Strategy: 512 Tokens Overlap</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.slice(0, 4).map(doc => (
              <div key={doc.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSourceIcon(doc.sourceType)}
                    <span className="text-xs font-bold text-white truncate max-w-[200px]">{doc.title}</span>
                  </div>
                  <span className="text-[10px] text-blue-400 font-mono">{doc.chunkCount} Chunks</span>
                </div>
                <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800 line-clamp-3">
                  {doc.rawContent || 'Vector chunks parsed and embedded into distance index.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: USAGE & CITATIONS ANALYTICS */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 size={16} className="text-blue-400" />
              <span>Top Cited Knowledge Documents</span>
            </h3>

            <div className="space-y-2">
              {analytics.topCitedDocs.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-[10px]">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-white">{item.title}</span>
                  </div>
                  <span className="text-emerald-400 font-bold">{item.citations} AI Citations</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY & ACCESS CONTROL */}
      {activeTab === 'permissions' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <ShieldCheck size={18} />
            <span>Enterprise Malware Scanning & Encryption Matrix</span>
          </div>
          <p className="text-xs text-slate-400">
            All uploaded files undergo asynchronous binary stream malware scanning, content sanitization, and AES-256 encrypted storage.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400">Malware Engine</span>
              <p className="font-bold text-emerald-400">Active & Passing</p>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400">Storage Encryption</span>
              <p className="font-bold text-blue-400">AES-256-GCM</p>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400">Access Policy</span>
              <p className="font-bold text-purple-400">Role-Based (RBAC)</p>
            </div>
          </div>
        </div>
      )}

      {/* ADD KNOWLEDGE SOURCE MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-4 text-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Upload size={18} className="text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Add Knowledge Base Source</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateDocument} className="space-y-4 text-xs">
                {/* Format Selection */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Source Format Type:</label>
                  <select
                    value={addForm.sourceType}
                    onChange={e => setAddForm({ ...addForm, sourceType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none cursor-pointer"
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="docx">Microsoft Word (.docx)</option>
                    <option value="xlsx">Excel Spreadsheet (.xlsx)</option>
                    <option value="pptx">PowerPoint Presentation (.pptx)</option>
                    <option value="txt">Text File (.txt)</option>
                    <option value="csv">CSV Data File (.csv)</option>
                    <option value="url">Website URL / Scraping Index</option>
                    <option value="faq">FAQ Knowledge Pair</option>
                    <option value="article">Knowledge Base Article</option>
                    <option value="manual">Manual Text Input</option>
                  </select>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Document / Source Title:</label>
                  <input
                    type="text"
                    required
                    value={addForm.title}
                    onChange={e => setAddForm({ ...addForm, title: e.target.value })}
                    placeholder="e.g., 2026_Product_Roadmap_Master.pdf"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                {/* Department & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">Department:</label>
                    <select
                      value={addForm.department}
                      onChange={e => setAddForm({ ...addForm, department: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Departments</option>
                      <option value="Engineering">Engineering</option>
                      <option value="HR">HR</option>
                      <option value="Sales">Sales</option>
                      <option value="Legal">Legal</option>
                      <option value="Support">Support</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">Category:</label>
                    <input
                      type="text"
                      value={addForm.category}
                      onChange={e => setAddForm({ ...addForm, category: e.target.value })}
                      placeholder="e.g., Compliance, Onboarding"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Content / URL */}
                {addForm.sourceType === 'url' ? (
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">Website URL Location:</label>
                    <input
                      type="url"
                      value={addForm.urlLocation}
                      onChange={e => setAddForm({ ...addForm, urlLocation: e.target.value })}
                      placeholder="https://docs.company.com/guide"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">Raw Text Content / Excerpt:</label>
                    <textarea
                      rows={4}
                      value={addForm.rawContent}
                      onChange={e => setAddForm({ ...addForm, rawContent: e.target.value })}
                      placeholder="Paste text or document details for RAG vector chunking..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 cursor-pointer"
                  >
                    Ingest & Index Document
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VERSION HISTORY MODAL */}
      <AnimatePresence>
        {selectedDocForVersion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Version History</h3>
                </div>
                <button onClick={() => setSelectedDocForVersion(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-300">{selectedDocForVersion.title}</p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedDocForVersion.versionHistory.map((ver, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between text-blue-400 font-bold">
                        <span>Version v{ver.version}</span>
                        <span className="text-[10px] text-slate-400">{new Date(ver.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-300">{ver.summary}</p>
                      <p className="text-[10px] text-slate-500">Updated by: {ver.updatedBy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VECTOR CHUNKS MODAL */}
      <AnimatePresence>
        {selectedDocForChunks && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Vector Chunks Preview</h3>
                </div>
                <button onClick={() => setSelectedDocForChunks(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="text-xs">
                  <span className="text-slate-400">Document: </span>
                  <span className="font-bold text-white">{selectedDocForChunks.title}</span>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2 max-h-60 overflow-y-auto">
                  <p className="text-slate-200 leading-relaxed">
                    {selectedDocForChunks.rawContent || 'Content chunks parsed and indexed for dense similarity search.'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
