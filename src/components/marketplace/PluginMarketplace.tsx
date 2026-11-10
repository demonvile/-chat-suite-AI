import React, { useState, useEffect } from 'react';
import { 
  Store, Cpu, Shield, Settings, Download, Trash2, RefreshCw, 
  Play, CheckCircle2, AlertTriangle, Layers, Code, Zap, Search, 
  Filter, Plus, Info, ExternalLink, Activity, Sparkles, Sliders,
  Lock, Terminal, ChevronRight, Check, Eye, HelpCircle, ArrowUpRight,
  TrendingUp, Headphones, Megaphone, Users, DollarSign, Calendar, BookOpen,
  FileText, Mail, MessageSquare, Database, Bot, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PluginManifest, PluginPermission, MarketplacePlatformData } from '../../types';

interface PluginMarketplaceProps {
  token: string;
  addToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const PluginMarketplace: React.FC<PluginMarketplaceProps> = ({ token, addToast }) => {
  // Navigation Tabs: 'explore' | 'installed' | 'agent_builder' | 'sdk_docs' | 'security_audit' | 'analytics'
  const [activeTab, setActiveTab] = useState<'explore' | 'installed' | 'agent_builder' | 'sdk_docs' | 'security_audit' | 'analytics'>('explore');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Marketplace Data
  const [data, setData] = useState<MarketplacePlatformData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Selected Plugin for Detail / Config Modal
  const [selectedPlugin, setSelectedPlugin] = useState<PluginManifest | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [permissionsModalPlugin, setPermissionsModalPlugin] = useState<PluginManifest | null>(null);
  const [installApprovalPlugin, setInstallApprovalPlugin] = useState<PluginManifest | null>(null);
  const [selectedApprovedPermissions, setSelectedApprovedPermissions] = useState<PluginPermission[]>([]);
  const [versionHistoryPlugin, setVersionHistoryPlugin] = useState<PluginManifest | null>(null);
  const [versionHistoryList, setVersionHistoryList] = useState<any[]>([]);
  const [adminPermissionsData, setAdminPermissionsData] = useState<any | null>(null);
  const [configFormValues, setConfigFormValues] = useState<Record<string, any>>({});
  const [savingConfig, setSavingConfig] = useState(false);

  // Custom AI Agent Builder State
  const [builderName, setBuilderName] = useState('');
  const [builderRole, setBuilderRole] = useState('Sales Agent');
  const [builderDescription, setBuilderDescription] = useState('');
  const [builderSystemPrompt, setBuilderSystemPrompt] = useState('You are a specialized AI assistant designed to handle domain-specific workflows...');
  const [builderPermissions, setBuilderPermissions] = useState<PluginPermission[]>(['read_conversations', 'write_messages']);
  const [builderCapabilities, setBuilderCapabilities] = useState<string>('Lead Scoring, Automated Replies');
  const [builderBuilding, setBuilderBuilding] = useState(false);

  // SDK Template Sample Code State
  const [activeSdkCodeTab, setActiveSdkCodeTab] = useState<'ts_sdk' | 'sample_plugin' | 'hooks_api'>('ts_sdk');

  // Fetch Marketplace Platform Data
  const fetchMarketplaceData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace/plugins', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        setData(d);
      } else {
        addToast('error', 'Marketplace Loading Failed', 'Could not retrieve marketplace manifest.');
      }
    } catch (err) {
      console.error('Error loading marketplace data:', err);
      addToast('error', 'Connection Error', 'Failed to reach marketplace API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  // Icon Resolver
  const renderPluginIcon = (iconName: string) => {
    const props = { size: 20, className: "text-blue-500" };
    switch (iconName) {
      case 'TrendingUp': return <TrendingUp {...props} />;
      case 'Headphones': return <Headphones {...props} />;
      case 'Megaphone': return <Megaphone {...props} />;
      case 'Users': return <Users {...props} />;
      case 'DollarSign': return <DollarSign {...props} />;
      case 'Calendar': return <Calendar {...props} />;
      case 'BookOpen': return <BookOpen {...props} />;
      case 'FileText': return <FileText {...props} />;
      case 'Mail': return <Mail {...props} />;
      case 'MessageSquare': return <MessageSquare {...props} />;
      case 'Database': return <Database {...props} />;
      case 'Zap': return <Zap {...props} />;
      default: return <Bot {...props} />;
    }
  };

  // Open Admin Permission Approval Modal before installation
  const handleOpenInstallApproval = (plugin: PluginManifest) => {
    setInstallApprovalPlugin(plugin);
    setSelectedApprovedPermissions([...plugin.permissions]);
  };

  // Actions: Confirmed Install with Approved Permissions
  const handleConfirmInstall = async () => {
    if (!installApprovalPlugin) return;
    setActionLoadingId(installApprovalPlugin.id);
    try {
      const res = await fetch(`/api/marketplace/plugins/${installApprovalPlugin.id}/install`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ approvedPermissions: selectedApprovedPermissions })
      });
      if (res.ok) {
        addToast('success', 'Permissions Approved & Plugin Installed', `${installApprovalPlugin.name} has been approved and activated in workspace container sandbox.`);
        setInstallApprovalPlugin(null);
        await fetchMarketplaceData();
      } else {
        addToast('error', 'Installation Failed', 'Could not install plugin.');
      }
    } catch (err) {
      addToast('error', 'Error', 'Failed to connect to server.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Actions: One-Click Install (Direct)
  const handleInstall = async (plugin: PluginManifest) => {
    handleOpenInstallApproval(plugin);
  };

  // Actions: Duplicate & Customize Prebuilt AI Agent
  const handleDuplicateAgent = async (plugin: PluginManifest) => {
    setActionLoadingId(plugin.id);
    try {
      const res = await fetch(`/api/marketplace/agents/${plugin.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customName: `${plugin.name} (Custom Copy)`,
          customRole: plugin.agentRole || 'Custom Specialist',
          customSystemPrompt: plugin.systemPrompt || `Custom prompt adapted from ${plugin.name}`
        })
      });

      if (res.ok) {
        const result = await res.json();
        addToast('success', 'Agent Duplicated & Customized', `Cloned ${plugin.name} into your custom agent library!`);
        // Populate builder state with duplicated agent data
        setBuilderName(result.agent.name);
        setBuilderRole(result.agent.agentRole || 'Sales Agent');
        setBuilderDescription(result.agent.description || '');
        setBuilderSystemPrompt(result.agent.systemPrompt || '');
        setBuilderPermissions(result.agent.permissions || ['read_conversations', 'write_messages']);
        setBuilderCapabilities(result.agent.capabilities.join(', '));
        setActiveTab('agent_builder');
        await fetchMarketplaceData();
      } else {
        addToast('error', 'Duplication Error', 'Could not duplicate AI agent.');
      }
    } catch (err) {
      addToast('error', 'Error', 'Failed to connect to agent duplication endpoint.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Actions: Fetch Version History
  const handleFetchVersions = async (plugin: PluginManifest) => {
    setVersionHistoryPlugin(plugin);
    try {
      const res = await fetch(`/api/marketplace/agents/${plugin.id}/versions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const versions = await res.json();
        setVersionHistoryList(versions);
      }
    } catch (err) {
      console.error('Failed to load version history:', err);
    }
  };

  // Actions: Rollback Version
  const handleRollbackVersion = async (targetVersion: string) => {
    if (!versionHistoryPlugin) return;
    setActionLoadingId(versionHistoryPlugin.id);
    try {
      const res = await fetch(`/api/marketplace/agents/${versionHistoryPlugin.id}/rollback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetVersion })
      });
      if (res.ok) {
        addToast('info', 'Version Rolled Back', `Reverted ${versionHistoryPlugin.name} to release v${targetVersion}`);
        setVersionHistoryPlugin(null);
        await fetchMarketplaceData();
      }
    } catch (err) {
      addToast('error', 'Error', 'Failed to roll back version.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Actions: Uninstall
  const handleUninstall = async (plugin: PluginManifest) => {
    if (!window.confirm(`Are you sure you want to uninstall ${plugin.name}?`)) return;
    setActionLoadingId(plugin.id);
    try {
      const res = await fetch(`/api/marketplace/plugins/${plugin.id}/uninstall`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('info', 'Plugin Uninstalled', `${plugin.name} was removed.`);
        await fetchMarketplaceData();
      }
    } catch (err) {
      addToast('error', 'Error', 'Failed to uninstall plugin.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Actions: Toggle Enable / Disable
  const handleToggle = async (plugin: PluginManifest) => {
    setActionLoadingId(plugin.id);
    try {
      const res = await fetch(`/api/marketplace/plugins/${plugin.id}/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('success', 'Status Changed', `${plugin.name} status updated.`);
        await fetchMarketplaceData();
      }
    } catch (err) {
      addToast('error', 'Error', 'Failed to toggle status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Actions: One-Click Update
  const handleUpdate = async (plugin: PluginManifest) => {
    setActionLoadingId(plugin.id);
    try {
      const res = await fetch(`/api/marketplace/plugins/${plugin.id}/update`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('success', 'Plugin Updated', `${plugin.name} upgraded to v${plugin.latestVersion}.`);
        await fetchMarketplaceData();
      }
    } catch (err) {
      addToast('error', 'Error', 'Failed to update plugin.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Actions: Open Configuration Panel
  const handleOpenConfig = (plugin: PluginManifest) => {
    setSelectedPlugin(plugin);
    setConfigFormValues(plugin.settingsValues || {});
    setConfigModalOpen(true);
  };

  // Actions: Save Config
  const handleSaveConfig = async () => {
    if (!selectedPlugin) return;
    setSavingConfig(true);
    try {
      const res = await fetch(`/api/marketplace/plugins/${selectedPlugin.id}/config`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ settingsValues: configFormValues })
      });
      if (res.ok) {
        addToast('success', 'Configuration Saved', `Updated settings for ${selectedPlugin.name}`);
        setConfigModalOpen(false);
        await fetchMarketplaceData();
      }
    } catch (err) {
      addToast('error', 'Error', 'Failed to save configuration.');
    } finally {
      setSavingConfig(false);
    }
  };

  // Actions: Deploy Custom Agent from Builder
  const handleBuildCustomAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderName.trim() || !builderSystemPrompt.trim()) {
      addToast('error', 'Missing Information', 'Please provide an Agent Name and System Prompt.');
      return;
    }

    setBuilderBuilding(true);
    try {
      const capList = builderCapabilities.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/marketplace/agents/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: builderName,
          agentRole: builderRole,
          description: builderDescription,
          systemPrompt: builderSystemPrompt,
          permissions: builderPermissions,
          capabilities: capList,
          icon: 'Bot'
        })
      });

      if (res.ok) {
        const result = await res.json();
        addToast('success', 'Custom Agent Deployed', `${result.agent.name} is now active in your platform!`);
        setBuilderName('');
        setBuilderDescription('');
        setActiveTab('installed');
        await fetchMarketplaceData();
      } else {
        addToast('error', 'Build Error', 'Could not deploy custom AI agent.');
      }
    } catch (err) {
      addToast('error', 'Error', 'Connection error to agent builder API.');
    } finally {
      setBuilderBuilding(false);
    }
  };

  // Filter logic for Marketplace items
  const filteredPlugins = (data?.plugins || []).filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.capabilities.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesType = selectedType === 'all' || p.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const installedPluginsList = (data?.plugins || []).filter(p => p.isInstalled);
  const pendingUpdatesList = (data?.plugins || []).filter(p => p.isInstalled && p.hasUpdate);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
                <Sparkles size={12} /> AI Platform Architecture v3.5
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold rounded-full">
                Sandbox Health: 100%
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
              Plugin & AI Agent Marketplace
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Extend your AI platform with one-click plugins, autonomous AI agents, sandboxed security policies, event hook triggers, and SDK integrations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('agent_builder')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} /> Create Custom Agent
            </button>
            <button
              onClick={() => setActiveTab('sdk_docs')}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Code size={16} /> Plugin SDK & Docs
            </button>
          </div>
        </div>

        {/* Quick Analytics Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Layers size={18} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Installed Apps</div>
              <div className="text-lg font-bold font-mono">{data?.analytics.totalInstalled || 0} Plugins</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Activity size={18} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Active Agents</div>
              <div className="text-lg font-bold font-mono text-emerald-400">{data?.analytics.activePlugins || 0} Active</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <RefreshCw size={18} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Available Updates</div>
              <div className="text-lg font-bold font-mono text-amber-400">{data?.analytics.pendingUpdates || 0} Pending</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Shield size={18} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Sandbox Security</div>
              <div className="text-lg font-bold font-mono text-purple-400">100% Isolated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'explore', label: 'Marketplace Catalog', icon: Store, count: data?.plugins.length },
            { id: 'installed', label: 'Installed & Config', icon: CheckCircle2, count: installedPluginsList.length },
            { id: 'agent_builder', label: 'AI Agent Builder', icon: Cpu },
            { id: 'sdk_docs', label: 'Developer SDK & Hooks', icon: Code },
            { id: 'security_audit', label: 'Security & Audit Logs', icon: Shield, count: data?.auditLogs.length },
            { id: 'analytics', label: 'Health & Analytics', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={15} />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                    isActive ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {pendingUpdatesList.length > 0 && activeTab !== 'installed' && (
          <button
            onClick={() => setActiveTab('installed')}
            className="px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-pulse cursor-pointer"
          >
            <AlertTriangle size={14} />
            {pendingUpdatesList.length} Plugin Update{pendingUpdatesList.length > 1 ? 's' : ''} Available
          </button>
        )}
      </div>

      {/* TAB 1: MARKETPLACE CATALOG */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* Search & Category Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search plugins, agents, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Filter size={14} /> Category:
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="customer_support">Customer Support</option>
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
                <option value="hr">HR</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="legal">Legal</option>
                <option value="real_estate">Real Estate</option>
                <option value="ecommerce">E-commerce</option>
                <option value="productivity">Productivity</option>
                <option value="agent">AI Agents Library</option>
                <option value="integration">API Integrations</option>
                <option value="workflow">Workflows & Automations</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="agent">AI Agent Modules</option>
                <option value="plugin">System Plugins</option>
              </select>
            </div>
          </div>

          {/* Plugin Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
              <RefreshCw className="animate-spin text-blue-500" size={20} /> Loading marketplace catalog...
            </div>
          ) : filteredPlugins.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
              <Store className="mx-auto text-slate-400 mb-3" size={36} />
              <p className="text-slate-700 dark:text-slate-300 font-bold">No plugins or agents found matching your filter</p>
              <p className="text-slate-500 text-xs mt-1">Try clearing your search query or selecting another category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPlugins.map((plugin) => (
                <div
                  key={plugin.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  {plugin.isOfficial && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 rounded font-mono text-[9px] font-bold uppercase tracking-wider">
                      Official
                    </span>
                  )}

                  <div>
                    {/* Icon & Title Header */}
                    <div className="flex items-start gap-3 mb-3 pr-16">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                        {renderPluginIcon(plugin.icon)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {plugin.name}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>by {plugin.author}</span>
                          <span>•</span>
                          <span className="font-mono">v{plugin.version}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {plugin.description}
                    </p>

                    {/* Capabilities Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {plugin.capabilities.slice(0, 3).map((cap, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-[10px] rounded font-medium border border-slate-200/60 dark:border-slate-700/60"
                        >
                          {cap}
                        </span>
                      ))}
                      {plugin.capabilities.length > 3 && (
                        <span className="px-1.5 py-0.5 text-slate-400 text-[10px]">
                          +{plugin.capabilities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer & One-Click Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPermissionsModalPlugin(plugin)}
                        className="text-[11px] font-medium text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer"
                      >
                        <Shield size={12} /> Permissions ({plugin.permissions.length})
                      </button>

                      {plugin.type === 'agent' && (
                        <button
                          onClick={() => handleDuplicateAgent(plugin)}
                          title="Duplicate and customize this AI agent in your workspace"
                          className="text-[11px] font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer bg-purple-500/10 px-2 py-0.5 rounded"
                        >
                          <Sparkles size={11} /> Duplicate
                        </button>
                      )}
                    </div>

                    {plugin.isInstalled ? (
                      <div className="flex items-center gap-2">
                        {plugin.hasUpdate && (
                          <button
                            onClick={() => handleUpdate(plugin)}
                            disabled={actionLoadingId === plugin.id}
                            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw size={12} className={actionLoadingId === plugin.id ? 'animate-spin' : ''} /> Update
                          </button>
                        )}
                        <button
                          onClick={() => handleFetchVersions(plugin)}
                          title="Version History & Rollback"
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw size={12} /> History
                        </button>
                        <button
                          onClick={() => handleOpenConfig(plugin)}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Settings size={12} /> Config
                        </button>
                        <span className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1">
                          <Check size={12} /> Installed
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleInstall(plugin)}
                        disabled={actionLoadingId === plugin.id}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {actionLoadingId === plugin.id ? (
                          <>
                            <RefreshCw className="animate-spin" size={13} /> Installing...
                          </>
                        ) : (
                          <>
                            <Download size={13} /> Install Plugin
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INSTALLED PLUGINS & CONFIGURATION PANEL */}
      {activeTab === 'installed' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={18} />
              Installed Plugins & AI Agent Manager ({installedPluginsList.length})
            </h2>
            <button
              onClick={() => setActiveTab('explore')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Browse Catalog <ChevronRight size={14} />
            </button>
          </div>

          {installedPluginsList.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-600 dark:text-slate-400 text-sm">No plugins or AI agents currently installed.</p>
              <button
                onClick={() => setActiveTab('explore')}
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Explore Marketplace
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {installedPluginsList.map((plugin) => (
                <div
                  key={plugin.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                      {renderPluginIcon(plugin.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {plugin.name}
                        </h3>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono rounded">
                          v{plugin.version}
                        </span>
                        {plugin.isEnabled ? (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-500/10 text-slate-500 text-[10px] font-bold rounded-full">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-xl">
                        {plugin.description}
                      </p>

                      {/* Hooks & Events info */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono">
                        <span>Hooks: {plugin.extensionHooks.join(', ') || 'None'}</span>
                        <span>•</span>
                        <span>Events: {plugin.eventsExposed.join(', ') || 'None'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Settings Controls */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {plugin.hasUpdate && (
                      <button
                        onClick={() => handleUpdate(plugin)}
                        className="px-3 py-1.5 bg-amber-500 text-white hover:bg-amber-600 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw size={12} /> Update to v{plugin.latestVersion}
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenConfig(plugin)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Settings size={13} /> Settings & API Keys
                    </button>

                    <button
                      onClick={() => handleToggle(plugin)}
                      disabled={actionLoadingId === plugin.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        plugin.isEnabled
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {plugin.isEnabled ? 'Disable' : 'Enable'}
                    </button>

                    <button
                      onClick={() => handleUninstall(plugin)}
                      disabled={actionLoadingId === plugin.id}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all cursor-pointer"
                      title="Uninstall Plugin"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CUSTOM AI AGENT BUILDER */}
      {activeTab === 'agent_builder' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Cpu size={14} /> Agent Extension Engine
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              Custom AI Agent Builder
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Design, configure, and publish custom AI agents to your platform marketplace with tailored system instructions, permissions, and tool capabilities.
            </p>
          </div>

          <form onSubmit={handleBuildCustomAgent} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Agent Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Agent Display Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Procurement Compliance Auditor Agent"
                  value={builderName}
                  onChange={(e) => setBuilderName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Agent Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Agent Archetype / Role *
                </label>
                <select
                  value={builderRole}
                  onChange={(e) => setBuilderRole(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Sales Agent">Sales Agent</option>
                  <option value="Customer Support Agent">Customer Support Agent</option>
                  <option value="Marketing Agent">Marketing Agent</option>
                  <option value="HR Agent">HR Agent</option>
                  <option value="Finance Agent">Finance Agent</option>
                  <option value="Appointment Agent">Appointment Agent</option>
                  <option value="Knowledge Base Agent">Knowledge Base Agent</option>
                  <option value="Document Analysis Agent">Document Analysis Agent</option>
                  <option value="Email Assistant">Email Assistant</option>
                  <option value="Custom Special Agent">Custom Special Agent</option>
                </select>
              </div>
            </div>

            {/* Agent Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Marketplace Short Description
              </label>
              <input
                type="text"
                placeholder="Brief summary of agent responsibilities and execution scope..."
                value={builderDescription}
                onChange={(e) => setBuilderDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* System Prompt / Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Agent System Prompt & Instructions *
              </label>
              <textarea
                rows={5}
                value={builderSystemPrompt}
                onChange={(e) => setBuilderSystemPrompt(e.target.value)}
                placeholder="Define persona, goals, constraints, and decision rules for this AI agent..."
                className="w-full p-3.5 bg-slate-900 text-slate-200 font-mono text-xs border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Capabilities List */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tool Capabilities (Comma-separated)
              </label>
              <input
                type="text"
                value={builderCapabilities}
                onChange={(e) => setBuilderCapabilities(e.target.value)}
                placeholder="e.g., Lead Scoring, Intent Detection, Automated Followup"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sandboxed Permissions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Sandboxed Plugin Permissions
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  'read_conversations',
                  'write_messages',
                  'api_webhooks',
                  'knowledge_base_access',
                  'analytics_read',
                  'execute_workflows'
                ].map((perm) => {
                  const isChecked = builderPermissions.includes(perm as PluginPermission);
                  return (
                    <label
                      key={perm}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 cursor-pointer transition-all ${
                        isChecked 
                          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setBuilderPermissions(builderPermissions.filter(p => p !== perm));
                          } else {
                            setBuilderPermissions([...builderPermissions, perm as PluginPermission]);
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                      <span className="font-mono text-[11px]">{perm}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Build Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={builderBuilding}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {builderBuilding ? (
                  <>
                    <RefreshCw className="animate-spin" size={15} /> Deploying Agent...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} /> Build & Publish Agent
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: DEVELOPER SDK, HOOKS & SAMPLE PLUGIN TEMPLATES */}
      {activeTab === 'sdk_docs' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Code className="text-blue-400" size={20} /> Developer Plugin SDK & Extension Points
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Build custom plugins and AI agents using our event-driven TypeScript SDK and sandboxed runtime context.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl">
                {[
                  { id: 'ts_sdk', label: 'TypeScript SDK' },
                  { id: 'sample_plugin', label: 'Sample Plugin Code' },
                  { id: 'hooks_api', label: 'Event Hooks System' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setActiveSdkCodeTab(st.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeSdkCodeTab === st.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Sandbox Preview */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
              <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
                {activeSdkCodeTab === 'ts_sdk' && `// Import AI Platform Plugin SDK
import { createPlugin, PluginContext, EventHook } from '@ai-studio/plugin-sdk';

export const MyCustomPlugin = createPlugin({
  id: 'my-custom-plugin',
  name: 'Custom Lead Enricher',
  version: '1.0.0',
  permissions: ['read_conversations', 'write_messages', 'api_webhooks'],
  
  onInit(ctx: PluginContext) {
    ctx.logger.info('Custom Lead Enricher initialized in isolated sandbox.');
  },

  hooks: {
    async onMessageReceived(message, ctx) {
      if (message.content.includes('pricing')) {
        await ctx.events.emit('lead.intent_detected', { score: 85, user: message.userId });
      }
    }
  }
});`}

                {activeSdkCodeTab === 'sample_plugin' && `// Sample Plugin: Automated Support Escalate
import { AIStudioPlugin } from '@ai-studio/plugin-sdk';

export default class SupportEscalationPlugin implements AIStudioPlugin {
  async handleTicketCreated(ticket) {
    if (ticket.priority === 'urgent') {
      await fetch(this.config.slackWebhookUrl, {
        method: 'POST',
        body: JSON.stringify({ text: \`🚨 Urgent ticket: \${ticket.subject}\` })
      });
    }
  }
}`}

                {activeSdkCodeTab === 'hooks_api' && `// Extension Hooks Lifecycle API
Event Hooks Available:
• onMessageReceived(message, sessionCtx)
• beforeResponseSent(draftResponse, context)
• onLeadCaptured(leadDetails)
• onTicketCreated(ticketDetails)
• onDocumentUploaded(fileMetadata)
• onUserJoinedWorkspace(userInfo)`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY & AUDIT LOGS */}
      {activeTab === 'security_audit' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Shield className="text-purple-500" size={18} /> Marketplace Security & Permissions Audit
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time audit log of all plugin installations, config updates, permission grants, and sandbox container events.
                </p>
              </div>

              <button
                onClick={fetchMarketplaceData}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} /> Refresh Audit Stream
              </button>
            </div>

            <div className="space-y-3">
              {(data?.auditLogs || []).map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg shrink-0 mt-0.5">
                      <Terminal size={15} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {log.pluginName}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-bold rounded uppercase">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {log.details}
                      </p>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        Actor: {log.actor}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: HEALTH & USAGE ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Activity className="text-emerald-500" size={18} /> Plugin Execution Latency
            </h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Average Execution Time:</span>
                <span className="font-mono font-bold text-emerald-500">14 ms (p99 &lt; 25ms)</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Memory Overhead:</span>
                <span className="font-mono font-bold">12 MB per Isolated Container</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Error Rate:</span>
                <span className="font-mono font-bold text-emerald-500">0.00%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Lock className="text-blue-500" size={18} /> Sandboxing Integrity & Verification
            </h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>SHA-256 Checksums:</span>
                <span className="font-mono text-emerald-500 font-bold">Verified</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Network Access:</span>
                <span className="font-mono font-bold">Explicit Webhook Permissions Only</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>FileSystem Access:</span>
                <span className="font-mono font-bold text-purple-500">Read-Only Ephemeral Memory</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIGURATION MODAL */}
      {configModalOpen && selectedPlugin && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="text-blue-500" size={18} />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {selectedPlugin.name} Configuration
                </h3>
              </div>
              <button
                onClick={() => setConfigModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {selectedPlugin.settingsFields.length === 0 ? (
                <p className="text-xs text-slate-500">This plugin does not require custom settings.</p>
              ) : (
                selectedPlugin.settingsFields.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {field.label}
                    </label>
                    {field.description && (
                      <p className="text-[11px] text-slate-500">{field.description}</p>
                    )}

                    {field.type === 'select' ? (
                      <select
                        value={configFormValues[field.key] ?? field.defaultValue}
                        onChange={(e) => setConfigFormValues({ ...configFormValues, [field.key]: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      >
                        {field.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : field.type === 'boolean' ? (
                      <label className="flex items-center gap-2 cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          checked={!!configFormValues[field.key]}
                          onChange={(e) => setConfigFormValues({ ...configFormValues, [field.key]: e.target.checked })}
                          className="rounded text-blue-600"
                        />
                        <span className="text-xs text-slate-700 dark:text-slate-300">Enabled</span>
                      </label>
                    ) : (
                      <input
                        type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
                        value={configFormValues[field.key] ?? field.defaultValue ?? ''}
                        onChange={(e) => setConfigFormValues({ ...configFormValues, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      />
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setConfigModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-blue-500 transition-all flex items-center gap-1.5"
              >
                {savingConfig ? <RefreshCw className="animate-spin" size={13} /> : <Check size={13} />} Save Configuration
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* PERMISSIONS MODAL */}
      {permissionsModalPlugin && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="text-purple-500" size={18} />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Plugin Security Permissions
                </h3>
              </div>
              <button
                onClick={() => setPermissionsModalPlugin(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {permissionsModalPlugin.name} requests the following isolated capabilities:
            </p>

            <div className="space-y-2">
              {permissionsModalPlugin.permissions.map((perm) => (
                <div key={perm} className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  {perm}
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setPermissionsModalPlugin(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN PERMISSION APPROVAL MODAL */}
      {installApprovalPlugin && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="text-amber-500" size={20} />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Admin Permission Approval
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Review and grant required permissions for {installApprovalPlugin.name} v{installApprovalPlugin.version}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInstallApprovalPlugin(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>
                  This plugin executes inside a sandboxed container. Enabling permissions allows access to specified workspace data scopes.
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Requested Permission Scopes:</p>
                {installApprovalPlugin.permissions.map((perm) => {
                  const isHighRisk = ['workspace_settings', 'workspace_admin', 'file_storage', 'external_api_access'].includes(perm);
                  const isChecked = selectedApprovedPermissions.includes(perm);
                  return (
                    <label
                      key={perm}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isChecked 
                          ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500/40 dark:border-blue-500/30' 
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedApprovedPermissions([...selectedApprovedPermissions, perm]);
                            } else {
                              setSelectedApprovedPermissions(selectedApprovedPermissions.filter(p => p !== perm));
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">{perm}</p>
                          <p className="text-[11px] text-slate-500">
                            {perm === 'read_chat_history' && 'Allows reading past chat messages and transcripts.'}
                            {perm === 'write_messages' && 'Allows sending automated replies into chat channels.'}
                            {perm === 'access_knowledge_base' && 'Allows querying indexed RAG documents and vector databases.'}
                            {perm === 'external_api_access' && 'Allows outbound HTTPS requests to external webhooks and APIs.'}
                            {perm === 'file_storage' && 'Allows storing temporary files in cloud storage sandbox.'}
                            {perm === 'workspace_settings' && 'Allows reading workspace configuration parameters.'}
                            {!['read_chat_history', 'write_messages', 'access_knowledge_base', 'external_api_access', 'file_storage', 'workspace_settings'].includes(perm) && 'Standard API extension scope.'}
                          </p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isHighRisk ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      }`}>
                        {isHighRisk ? 'High Risk' : 'Standard'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setInstallApprovalPlugin(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmInstall}
                disabled={actionLoadingId === installApprovalPlugin?.id}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
              >
                {actionLoadingId === installApprovalPlugin?.id ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle2 size={14} />} Approve & Install
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* VERSION HISTORY & ROLLBACK MODAL */}
      {versionHistoryPlugin && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="text-blue-500" size={20} />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Version History & Rollback
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Release history for {versionHistoryPlugin.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVersionHistoryPlugin(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {versionHistoryList.map((ver, idx) => {
                const isCurrent = ver.version === versionHistoryPlugin.version;
                return (
                  <div key={ver.version} className={`p-3.5 rounded-xl border space-y-2 ${
                    isCurrent ? 'bg-blue-50/40 dark:bg-blue-950/30 border-blue-500/40' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">v{ver.version}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white">Active Version</span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">{ver.releasedAt}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">{ver.changes}</p>

                    {!isCurrent && (
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => handleRollbackVersion(ver.version)}
                          className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-semibold cursor-pointer border border-amber-500/30 transition-all flex items-center gap-1"
                        >
                          <RefreshCw size={12} /> Rollback to v{ver.version}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setVersionHistoryPlugin(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
