import React, { useState, useEffect } from 'react';
import { 
  Bot, Search, Filter, Plus, Zap, ShieldCheck, Check, Power, RefreshCw, 
  Settings, Play, Cpu, Sparkles, BookOpen, MessageSquare, DollarSign, 
  Users, Calendar, Headphones, Database, Megaphone, Mail, FileText, 
  Star, ChevronRight, AlertCircle, ArrowRight, Layers, Sliders, Activity,
  Clock, History, Award, CheckCircle, ArrowLeftRight, Terminal, UserCheck,
  TrendingUp, Building2, Stethoscope, GraduationCap, Scale, Building, CornerDownRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PluginManifest, AgentCollaborationTrace } from '../../types';

interface AgentMarketplaceProps {
  token: string;
  addToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
  setActiveSection?: (section: string) => void;
}

export const AgentMarketplace: React.FC<AgentMarketplaceProps> = ({
  token,
  addToast,
  setActiveSection
}) => {
  const [agents, setAgents] = useState<PluginManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'explore' | 'installed' | 'builder' | 'collaboration' | 'analytics'>('explore');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<PluginManifest | null>(null);
  const [selectedConfigTab, setSelectedConfigTab] = useState<'overview' | 'prompt' | 'model' | 'knowledge' | 'permissions' | 'analytics' | 'history' | 'reviews'>('overview');

  // Rating state
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [submittingRating, setSubmittingRating] = useState<boolean>(false);

  // Agent Builder State
  const [builderData, setBuilderData] = useState({
    name: '',
    agentRole: '',
    description: '',
    category: 'agent',
    icon: 'Bot',
    personality: 'Professional',
    systemPrompt: '',
    modelSelection: 'gemini-3.8-flash',
    temperature: 0.7,
    welcomeMessage: 'Hello! How can I assist you with your business workflows today?',
    permissions: ['read_conversations', 'write_messages'],
    capabilities: ['Custom Prompt Execution', 'Contextual Reasoning'],
    tools: ['Web Search', 'CRM Lookup']
  });
  const [savingBuilder, setSavingBuilder] = useState(false);

  // Agent Collaboration State
  const [collabPrompt, setCollabPrompt] = useState<string>(
    'Inbound enterprise prospect requesting a custom HIPAA-compliant healthcare solution demo, pricing quote, and calendar booking.'
  );
  const [collabPrimaryId, setCollabPrimaryId] = useState<string>('agent-sales');
  const [collabSecondaryIds, setCollabSecondaryIds] = useState<string[]>(['agent-healthcare', 'agent-booking', 'agent-crm', 'agent-email-assistant']);
  const [collabTrace, setCollabTrace] = useState<AgentCollaborationTrace | null>(null);
  const [runningCollab, setRunningCollab] = useState<boolean>(false);

  // Activity logs & versions
  const [agentLogs, setAgentLogs] = useState<any[]>([]);
  const [agentVersions, setAgentVersions] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);

  // Fetch agents from backend
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace/plugins', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const allItems = data.plugins || data;
        setAgents(allItems.filter((p: any) => p.type === 'agent'));
      }
    } catch (err) {
      console.error('Error fetching marketplace agents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // Fetch agent logs and versions when an agent is selected
  useEffect(() => {
    if (selectedAgent) {
      fetchAgentDetails(selectedAgent.id);
    }
  }, [selectedAgent]);

  const fetchAgentDetails = async (agentId: string) => {
    setLoadingLogs(true);
    try {
      const [logsRes, verRes] = await Promise.all([
        fetch(`/api/marketplace/agents/${agentId}/logs`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/marketplace/agents/${agentId}/versions`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (logsRes.ok) {
        const logs = await logsRes.json();
        setAgentLogs(logs);
      }
      if (verRes.ok) {
        const vers = await verRes.json();
        setAgentVersions(vers);
      }
    } catch (err) {
      console.error('Error fetching agent details:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Toggle Agent Enable/Disable
  const handleToggleAgent = async (agentId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/marketplace/plugins/${agentId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const updated = await res.json();
        setAgents(prev => prev.map(a => a.id === agentId ? { ...a, isEnabled: updated.plugin.isEnabled } : a));
        if (selectedAgent && selectedAgent.id === agentId) {
          setSelectedAgent(prev => prev ? { ...prev, isEnabled: updated.plugin.isEnabled } : null);
        }
        addToast('success', 'Agent Status Updated', `Agent is now ${updated.plugin.isEnabled ? 'Active' : 'Disabled'}.`);
      }
    } catch (err) {
      addToast('error', 'Update Failed', 'Could not toggle agent status.');
    }
  };

  // Install / Uninstall Agent
  const handleInstallToggle = async (agent: PluginManifest, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const endpoint = agent.isInstalled ? 'uninstall' : 'install';
    try {
      const res = await fetch(`/api/marketplace/plugins/${agent.id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const updated = await res.json();
        setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, isInstalled: !agent.isInstalled, isEnabled: !agent.isInstalled } : a));
        if (selectedAgent && selectedAgent.id === agent.id) {
          setSelectedAgent(prev => prev ? { ...prev, isInstalled: !agent.isInstalled, isEnabled: !agent.isInstalled } : null);
        }
        addToast('success', agent.isInstalled ? 'Agent Uninstalled' : 'Agent Installed', `${agent.name} is now ${agent.isInstalled ? 'removed from' : 'enabled in'} your workspace.`);
      }
    } catch (err) {
      addToast('error', 'Action Failed', 'Could not modify agent installation state.');
    }
  };

  // Save Agent Configuration Settings & System Prompt
  const handleSaveConfig = async () => {
    if (!selectedAgent) return;
    try {
      const res = await fetch(`/api/marketplace/plugins/${selectedAgent.id}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          settingsValues: selectedAgent.settingsValues,
          systemPrompt: selectedAgent.systemPrompt,
          personality: selectedAgent.personality,
          modelSelection: selectedAgent.modelSelection
        })
      });
      if (res.ok) {
        addToast('success', 'Configuration Saved', `Updated configuration for ${selectedAgent.name}.`);
      }
    } catch (err) {
      addToast('error', 'Save Error', 'Failed to save agent settings.');
    }
  };

  // Submit Rating
  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;
    setSubmittingRating(true);
    try {
      const res = await fetch(`/api/marketplace/agents/${selectedAgent.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: ratingInput, comment: ratingComment })
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedAgent(data.agent);
        setAgents(prev => prev.map(a => a.id === selectedAgent.id ? data.agent : a));
        setRatingComment('');
        addToast('success', 'Rating Submitted', 'Thank you for rating this AI agent!');
      }
    } catch (err) {
      addToast('error', 'Submission Failed', 'Could not submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Rollback Agent Version
  const handleRollbackVersion = async (targetVersion: string) => {
    if (!selectedAgent) return;
    try {
      const res = await fetch(`/api/marketplace/agents/${selectedAgent.id}/rollback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetVersion })
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedAgent(data.agent);
        setAgents(prev => prev.map(a => a.id === selectedAgent.id ? data.agent : a));
        addToast('success', 'Version Rolled Back', `${selectedAgent.name} rolled back to v${targetVersion}.`);
      }
    } catch (err) {
      addToast('error', 'Rollback Failed', 'Could not rollback version.');
    }
  };

  // Create Custom Agent
  const handleCreateCustomAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderData.name || !builderData.systemPrompt) {
      addToast('error', 'Validation Error', 'Agent Name and System Prompt are required.');
      return;
    }
    setSavingBuilder(true);
    try {
      const res = await fetch('/api/marketplace/agents/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(builderData)
      });
      if (res.ok) {
        const result = await res.json();
        setAgents(prev => [result.agent, ...prev]);
        addToast('success', 'Custom Agent Deployed!', `'${result.agent.name}' is now active in your agent marketplace.`);
        setActiveTab('explore');
        // Reset builder form
        setBuilderData({
          name: '',
          agentRole: '',
          description: '',
          category: 'agent',
          icon: 'Bot',
          personality: 'Professional',
          systemPrompt: '',
          modelSelection: 'gemini-3.8-flash',
          temperature: 0.7,
          welcomeMessage: 'Hello! How can I assist you today?',
          permissions: ['read_conversations', 'write_messages'],
          capabilities: ['Custom Prompt Execution'],
          tools: ['Web Search']
        });
      }
    } catch (err) {
      addToast('error', 'Deployment Failed', 'Could not create custom AI agent.');
    } finally {
      setSavingBuilder(false);
    }
  };

  // Run Multi-Agent Swarm Collaboration Simulation
  const handleRunCollaboration = async () => {
    setRunningCollab(true);
    try {
      const res = await fetch('/api/marketplace/agents/collaborate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          taskPrompt: collabPrompt,
          primaryAgentId: collabPrimaryId,
          secondaryAgentIds: collabSecondaryIds
        })
      });
      if (res.ok) {
        const trace = await res.json();
        setCollabTrace(trace);
        addToast('success', 'Collaboration Executed', `Swarm simulation completed across ${trace.steps.length} specialist agents.`);
      }
    } catch (err) {
      addToast('error', 'Execution Failed', 'Multi-agent simulation encountered an error.');
    } finally {
      setRunningCollab(false);
    }
  };

  // Map icon strings to Lucide components
  const getAgentIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp': return TrendingUp;
      case 'Headphones': return Headphones;
      case 'Megaphone': return Megaphone;
      case 'Users': return Users;
      case 'DollarSign': return DollarSign;
      case 'Calendar': return Calendar;
      case 'BookOpen': return BookOpen;
      case 'FileText': return FileText;
      case 'Mail': return Mail;
      case 'Database': return Database;
      case 'Building2': return Building2;
      case 'Stethoscope': return Stethoscope;
      case 'GraduationCap': return GraduationCap;
      case 'Scale': return Scale;
      case 'Building': return Building;
      default: return Bot;
    }
  };

  // Filter agents by search & category
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.agentRole || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.capabilities.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === 'installed') {
      if (!agent.isInstalled) return false;
    }

    if (categoryFilter === 'sales') return matchesSearch && (agent.id.includes('sales') || agent.id.includes('crm') || agent.id.includes('ecommerce'));
    if (categoryFilter === 'support') return matchesSearch && (agent.id.includes('support') || agent.id.includes('cs') || agent.id.includes('booking') || agent.id.includes('appointment'));
    if (categoryFilter === 'ops') return matchesSearch && (agent.id.includes('hr') || agent.id.includes('recruitment') || agent.id.includes('knowledge') || agent.id.includes('doc'));
    if (categoryFilter === 'finance') return matchesSearch && (agent.id.includes('finance') || agent.id.includes('accounting'));
    if (categoryFilter === 'marketing') return matchesSearch && (agent.id.includes('marketing') || agent.id.includes('social') || agent.id.includes('email'));
    if (categoryFilter === 'vertical') return matchesSearch && (agent.id.includes('healthcare') || agent.id.includes('education') || agent.id.includes('legal') || agent.id.includes('realestate'));
    if (categoryFilter === 'custom') return matchesSearch && agent.id.includes('custom');

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                Enterprise AI Suite
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 19 Autonomous Agents
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">
              Enterprise AI Agents Marketplace
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Deploy, configure, and orchestrate specialized autonomous AI agents across Sales, Support, Finance, Marketing, HR, and vertical enterprise domains.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('builder')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus size={15} /> Create AI Agent
            </button>
            <button
              onClick={() => setActiveTab('collaboration')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Zap size={15} className="text-amber-400" /> Swarm Sandbox
            </button>
          </div>
        </div>

        {/* Global Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
            <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">Total Agents</p>
            <p className="text-lg font-bold text-white mt-0.5">{agents.length} Ready</p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
            <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">Active Workspace</p>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">{agents.filter(a => a.isEnabled).length} Active</p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
            <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">Executions Today</p>
            <p className="text-lg font-bold text-blue-400 mt-0.5">48,290</p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
            <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">Avg Latency</p>
            <p className="text-lg font-bold text-amber-400 mt-0.5">165 ms</p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 col-span-2 md:col-span-1">
            <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">Sandbox Security</p>
            <p className="text-lg font-bold text-indigo-400 mt-0.5 flex items-center gap-1">
              <ShieldCheck size={16} className="text-indigo-400" /> 100% Verified
            </p>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'explore'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bot size={15} /> All AI Agents ({agents.length})
          </button>
          <button
            onClick={() => setActiveTab('installed')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'installed'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle size={15} className="text-emerald-500" /> Installed & Active ({agents.filter(a => a.isInstalled).length})
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'builder'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Cpu size={15} className="text-indigo-400" /> Custom Agent Builder
          </button>
          <button
            onClick={() => setActiveTab('collaboration')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'collaboration'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Zap size={15} className="text-amber-400" /> Multi-Agent Swarm Sandbox
          </button>
        </div>

        {/* Search Bar for Agents */}
        {(activeTab === 'explore' || activeTab === 'installed') && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agents by role, skills..."
              className="pl-9 pr-3 py-1.5 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
            />
          </div>
        )}
      </div>

      {/* Category Sub-Filter Pills */}
      {(activeTab === 'explore' || activeTab === 'installed') && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold shrink-0">Domain Filter:</span>
          {[
            { id: 'all', label: 'All Domains' },
            { id: 'sales', label: 'Sales & Revenue' },
            { id: 'support', label: 'Support & Success' },
            { id: 'ops', label: 'Operations & HR' },
            { id: 'finance', label: 'Finance & Accounting' },
            { id: 'marketing', label: 'Marketing & Content' },
            { id: 'vertical', label: 'Vertical Assistants (Health, Legal, Edu, Real Estate)' },
            { id: 'custom', label: 'Custom Built' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                categoryFilter === cat.id
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* VIEW 1 & 2: AGENTS GRID (Explore or Installed) */}
      {(activeTab === 'explore' || activeTab === 'installed') && (
        <div>
          {loading ? (
            <div className="text-center py-20">
              <RefreshCw size={24} className="animate-spin text-blue-500 mx-auto" />
              <p className="text-xs text-slate-400 font-mono mt-3">Loading enterprise AI agent catalog...</p>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#0B1120]">
              <Bot size={36} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No AI agents match your filters</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try resetting your domain filter or build a custom agent tailored to your workflow.
              </p>
              <button
                onClick={() => { setCategoryFilter('all'); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAgents.map((agent) => {
                const IconComp = getAgentIcon(agent.icon);
                return (
                  <motion.div
                    key={agent.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedAgent(agent)}
                    className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 hover:border-blue-500 dark:hover:border-blue-500/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                  >
                    {/* Top status bar */}
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600/10 to-indigo-600/10 dark:from-blue-500/20 dark:to-indigo-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:scale-105 transition-transform">
                            <IconComp size={22} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-display font-bold text-sm text-slate-850 dark:text-white line-clamp-1 group-hover:text-blue-500 transition-colors">
                                {agent.name}
                              </h3>
                              {agent.isOfficial && (
                                <span title="Verified Core AI Agent">
                                  <ShieldCheck size={14} className="text-blue-500 shrink-0" />
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{agent.agentRole || 'Autonomous Agent'}</p>
                          </div>
                        </div>

                        {/* Enable/Disable Toggle */}
                        {agent.isInstalled && (
                          <button
                            onClick={(e) => handleToggleAgent(agent.id, e)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                              agent.isEnabled
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-200'
                            }`}
                            title={agent.isEnabled ? 'Disable Agent' : 'Enable Agent'}
                          >
                            <Power size={14} />
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {agent.description}
                      </p>

                      {/* Capabilities Pills */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {agent.capabilities.slice(0, 3).map((cap, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 rounded text-[10px] font-medium"
                          >
                            {cap}
                          </span>
                        ))}
                        {agent.capabilities.length > 3 && (
                          <span className="px-1.5 py-0.5 text-slate-400 text-[10px] font-mono">
                            +{agent.capabilities.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Metadata & Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1 font-bold text-amber-500">
                          <Star size={12} className="fill-amber-500" /> {agent.rating}
                        </span>
                        <span className="font-mono text-[10px]">v{agent.version}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {agent.isInstalled ? (
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1">
                            <Check size={11} /> Configured
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleInstallToggle(agent, e)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer transition-colors"
                          >
                            Install Agent
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: CUSTOM AGENT BUILDER */}
      {activeTab === 'builder' && (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-display font-bold text-lg text-slate-850 dark:text-white flex items-center gap-2">
              <Cpu size={20} className="text-indigo-500" /> No-Code Custom AI Agent Builder
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Design, configure, and publish bespoke autonomous AI agents for your specialized business routines.
            </p>
          </div>

          <form onSubmit={handleCreateCustomAgent} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Agent Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={builderData.name}
                  onChange={(e) => setBuilderData({ ...builderData, name: e.target.value })}
                  placeholder="e.g. Enterprise Legal Auditor Agent"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  value={builderData.agentRole}
                  onChange={(e) => setBuilderData({ ...builderData, agentRole: e.target.value })}
                  placeholder="e.g. Senior Contract Specialist"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description & Business Objectives
              </label>
              <textarea
                rows={2}
                value={builderData.description}
                onChange={(e) => setBuilderData({ ...builderData, description: e.target.value })}
                placeholder="Describe what this AI agent does and how it assists your organization..."
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* System Prompt Instructions */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  System Instructions & Rules <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Governs reasoning behavior</span>
              </div>
              <textarea
                rows={4}
                required
                value={builderData.systemPrompt}
                onChange={(e) => setBuilderData({ ...builderData, systemPrompt: e.target.value })}
                placeholder="You are an autonomous AI specialist. Your objective is to..."
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Model Engine
                </label>
                <select
                  value={builderData.modelSelection}
                  onChange={(e) => setBuilderData({ ...builderData, modelSelection: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none"
                >
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash (Recommended, Fast)</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (High Efficiency)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="gpt-4o">GPT-4o Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Personality Persona
                </label>
                <select
                  value={builderData.personality}
                  onChange={(e) => setBuilderData({ ...builderData, personality: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none"
                >
                  <option value="Professional">Professional & Formal</option>
                  <option value="Consultative">Consultative & Analytical</option>
                  <option value="Empathetic">Empathetic & Supportive</option>
                  <option value="Direct">Direct & Concise</option>
                  <option value="Executive">Executive & Strategic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Temperature: {builderData.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={builderData.temperature}
                  onChange={(e) => setBuilderData({ ...builderData, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 mt-2"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('explore')}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingBuilder}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                {savingBuilder ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Deploy Agent to Workspace
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 4: MULTI-AGENT SWARM SIMULATOR & COLLABORATION */}
      {activeTab === 'collaboration' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-display font-bold text-lg text-slate-850 dark:text-white flex items-center gap-2">
                <Zap size={20} className="text-amber-400" /> Multi-Agent Swarm Collaboration Simulator
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Simulate complex multi-agent workflows where specialized agents route tasks, exchange context, and execute handoffs autonomously.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Inbound Task Scenario / Customer Prompt
                </label>
                <textarea
                  rows={3}
                  value={collabPrompt}
                  onChange={(e) => setCollabPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Orchestrator Agent
                  </label>
                  <select
                    value={collabPrimaryId}
                    onChange={(e) => setCollabPrimaryId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none"
                  >
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.agentRole})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Active Collaborators in Swarm
                  </label>
                  <div className="p-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {agents.filter(a => a.id !== collabPrimaryId).map(a => {
                      const isSelected = collabSecondaryIds.includes(a.id);
                      return (
                        <button
                          type="button"
                          key={a.id}
                          onClick={() => {
                            if (isSelected) setCollabSecondaryIds(prev => prev.filter(id => id !== a.id));
                            else setCollabSecondaryIds(prev => [...prev, a.id]);
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {a.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleRunCollaboration}
                  disabled={runningCollab}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  {runningCollab ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
                  Run Swarm Collaboration
                </button>
              </div>
            </div>
          </div>

          {/* Collaboration Step Execution Trace */}
          {collabTrace && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-200 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                    Swarm Execution Completed
                  </span>
                  <h4 className="text-base font-display font-bold text-white mt-1">
                    {collabTrace.taskTitle}
                  </h4>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                  <span>Total Duration: <strong className="text-amber-400">{collabTrace.totalDurationMs}ms</strong></span>
                  <span>Tokens: <strong className="text-blue-400">{collabTrace.totalTokensUsed}</strong></span>
                </div>
              </div>

              {/* Steps timeline */}
              <div className="space-y-4 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
                {collabTrace.steps.map((step) => (
                  <div key={step.stepIndex} className="flex items-start gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-lg">
                      #{step.stepIndex}
                    </div>

                    <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{step.agentName}</span>
                          <span className="text-[10px] font-mono text-slate-400">({step.agentRole})</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle size={11} /> {step.durationMs}ms
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-blue-300 font-mono">
                        Action: {step.action}
                      </p>

                      <div className="p-2.5 bg-slate-900/90 rounded-lg text-xs font-mono text-slate-300 leading-relaxed border border-slate-800">
                        {step.outputResult}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-950/40 border border-blue-800/60 rounded-xl text-xs text-blue-200">
                <p className="font-bold mb-1">🎯 Final Outcome:</p>
                <p className="leading-relaxed">{collabTrace.finalOutcome}</p>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* AGENT MANAGEMENT MODAL / DRAWER */}
      <AnimatePresence>
        {selectedAgent && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#0F172A] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Bot size={22} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-850 dark:text-white flex items-center gap-2">
                      {selectedAgent.name}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold">
                        v{selectedAgent.version}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">{selectedAgent.agentRole || 'Autonomous Agent'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Config Navigation Bar inside modal */}
              <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-100 dark:border-slate-800 overflow-x-auto text-xs shrink-0">
                {[
                  { id: 'overview', label: 'Overview & Settings', icon: Settings },
                  { id: 'prompt', label: 'System Prompt & Tone', icon: Terminal },
                  { id: 'model', label: 'LLM Engine', icon: Cpu },
                  { id: 'permissions', label: 'Security & Permissions', icon: ShieldCheck },
                  { id: 'analytics', label: 'Usage & Latency', icon: Activity },
                  { id: 'history', label: 'Version Releases', icon: History },
                  { id: 'reviews', label: 'Ratings & Feedback', icon: Star },
                ].map((tab) => {
                  const IconC = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedConfigTab(tab.id as any)}
                      className={`px-3 py-2 border-b-2 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                        selectedConfigTab === tab.id
                          ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <IconC size={14} /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 text-xs space-y-6">
                {selectedConfigTab === 'overview' && (
                  <div className="space-y-5">
                    <div className="p-4 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Agent Description</h4>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{selectedAgent.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Installation State</span>
                        <p className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-200">
                          {selectedAgent.isInstalled ? 'Installed in Workspace' : 'Not Installed'}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Execution Toggle</span>
                        <p className="text-sm font-bold mt-1 text-emerald-500">
                          {selectedAgent.isEnabled ? 'Active & Processing' : 'Paused'}
                        </p>
                      </div>
                    </div>

                    {/* Agent Settings Fields */}
                    {selectedAgent.settingsFields && selectedAgent.settingsFields.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">Custom Parameters</h4>
                        {selectedAgent.settingsFields.map((field) => (
                          <div key={field.key}>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              {field.label}
                            </label>
                            <input
                              type={field.type === 'number' ? 'number' : 'text'}
                              value={selectedAgent.settingsValues?.[field.key] ?? field.defaultValue}
                              onChange={(e) => {
                                const val = field.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                                setSelectedAgent({
                                  ...selectedAgent,
                                  settingsValues: { ...selectedAgent.settingsValues, [field.key]: val }
                                });
                              }}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedConfigTab === 'prompt' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                        System Instructions & Prompt Guidelines
                      </label>
                      <textarea
                        rows={6}
                        value={selectedAgent.systemPrompt || ''}
                        onChange={(e) => setSelectedAgent({ ...selectedAgent, systemPrompt: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {selectedConfigTab === 'model' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Select Language Model Engine</label>
                      <select
                        value={selectedAgent.modelSelection || 'gemini-3.8-flash'}
                        onChange={(e) => setSelectedAgent({ ...selectedAgent, modelSelection: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none"
                      >
                        <option value="gemini-3.8-flash">Google Gemini 3.8 Flash (Recommended)</option>
                        <option value="gemini-3.1-flash-lite">Google Gemini 3.1 Flash Lite</option>
                        <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                        <option value="gpt-4o">OpenAI GPT-4o Enterprise</option>
                      </select>
                    </div>
                  </div>
                )}

                {selectedConfigTab === 'analytics' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                        <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Total Invocations</span>
                        <p className="text-xl font-bold text-blue-600 mt-1">14,290</p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                        <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Avg Latency</span>
                        <p className="text-xl font-bold text-amber-500 mt-1">180 ms</p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                        <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">CSAT Score</span>
                        <p className="text-xl font-bold text-emerald-500 mt-1">98.4%</p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                        <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">AI Cost</span>
                        <p className="text-xl font-bold text-indigo-400 mt-1">$12.40</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedConfigTab === 'history' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Release Versions</h4>
                    {agentVersions.map((v, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">v{v.version}</span>
                          <span className="text-[10px] text-slate-400 font-mono ml-2">Released {v.releasedAt}</span>
                          <p className="text-slate-500 dark:text-slate-400 mt-0.5">{v.changes}</p>
                        </div>
                        {selectedAgent.version !== v.version && (
                          <button
                            onClick={() => handleRollbackVersion(v.version)}
                            className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded font-bold text-[10px] cursor-pointer"
                          >
                            Rollback
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedConfigTab === 'reviews' && (
                  <div className="space-y-5">
                    <form onSubmit={handleSubmitRating} className="p-4 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Submit Rating & Review</h4>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRatingInput(star)}
                            className="cursor-pointer"
                          >
                            <Star size={18} className={star <= ratingInput ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-700'} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={2}
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        placeholder="Write your feedback..."
                        className="w-full px-3 py-2 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={submittingRating}
                        className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg cursor-pointer"
                      >
                        Submit Feedback
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#0F172A] shrink-0">
                <button
                  onClick={() => handleInstallToggle(selectedAgent)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    selectedAgent.isInstalled
                      ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {selectedAgent.isInstalled ? 'Uninstall Agent' : 'Install Agent'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="px-4 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSaveConfig}
                    className="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
