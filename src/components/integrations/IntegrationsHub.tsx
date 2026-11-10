import React, { useState, useEffect } from 'react';
import { 
  Layers, Search, Filter, Key, Globe, FileCode, AlertTriangle, Activity, 
  RefreshCw, Zap, CheckCircle2, ShieldCheck, Shield, ExternalLink 
} from 'lucide-react';
import { 
  IntegrationItem, IntegrationApiKey, IntegrationWebhookEndpoint, 
  IntegrationErrorLog, IntegrationAuditLog, IntegrationAnalyticsData 
} from '../../types';
import { IntegrationCard } from './IntegrationCard';
import { IntegrationModal } from './IntegrationModal';
import { ApiAndWebhookManager } from './ApiAndWebhookManager';
import { ApiDocsAndSdk } from './ApiDocsAndSdk';
import { IntegrationErrorLogs } from './IntegrationErrorLogs';
import { IntegrationAnalyticsView } from './IntegrationAnalyticsView';

interface IntegrationsHubProps {
  token?: string;
}

const fetchJsonSafely = async (url: string, options: RequestInit = {}) => {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`Fetch error for ${url}:`, err);
    return null;
  }
};

export const IntegrationsHub: React.FC<IntegrationsHubProps> = ({ token: propToken }) => {
  const token = propToken || localStorage.getItem('chatsite_token') || '';
  const [activeTab, setActiveTab] = useState<'catalog' | 'developer' | 'docs' | 'errors' | 'analytics'>('catalog');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data States
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [apiKeys, setApiKeys] = useState<IntegrationApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<IntegrationWebhookEndpoint[]>([]);
  const [errorLogs, setErrorLogs] = useState<IntegrationErrorLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<IntegrationAuditLog[]>([]);
  const [analytics, setAnalytics] = useState<IntegrationAnalyticsData | null>(null);

  // Modal State
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getHeaders = (extraHeaders: Record<string, string> = {}) => {
    const headers: Record<string, string> = { ...extraHeaders };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Initial Fetch
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const headers = getHeaders();
      const [intRes, keysRes, whRes, errRes, auditRes, analyticsRes] = await Promise.all([
        fetchJsonSafely('/api/integrations', { headers }),
        fetchJsonSafely('/api/developer/api-keys', { headers }),
        fetchJsonSafely('/api/developer/webhooks', { headers }),
        fetchJsonSafely('/api/integrations/errors', { headers }),
        fetchJsonSafely('/api/integrations/audit-logs', { headers }),
        fetchJsonSafely('/api/integrations/analytics', { headers })
      ]);

      if (Array.isArray(intRes)) setIntegrations(intRes);
      if (Array.isArray(keysRes)) setApiKeys(keysRes);
      if (Array.isArray(whRes)) setWebhooks(whRes);
      if (Array.isArray(errRes)) setErrorLogs(errRes);
      if (Array.isArray(auditRes)) setAuditLogs(auditRes);
      if (analyticsRes && !analyticsRes.error) setAnalytics(analyticsRes);
    } catch (err) {
      console.error('Failed to load integrations data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token]);

  // Handlers
  const handleConfigure = (item: IntegrationItem) => {
    setSelectedIntegration(item);
    setIsModalOpen(true);
  };

  const handleSaveConfig = async (integrationId: string, config: any, authType: any) => {
    try {
      const res = await fetch(`/api/integrations/${integrationId}/connect`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ config, authType })
      });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      const res = await fetch(`/api/integrations/${integrationId}/disconnect`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (res.ok) {
        setIsModalOpen(false);
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestConnection = async (integrationId: string) => {
    return await fetchJsonSafely(`/api/integrations/${integrationId}/test`, {
      method: 'POST',
      headers: getHeaders()
    }) || { success: false, message: 'Failed to test connection' };
  };

  const handleSync = async (item: IntegrationItem) => {
    try {
      await fetch(`/api/integrations/${item.id}/sync`, { method: 'POST', headers: getHeaders() });
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Developer Handlers
  const handleCreateApiKey = async (name: string, scopes: string[], rateLimitRpm: number) => {
    const newKey = await fetchJsonSafely('/api/developer/api-keys', {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name, scopes, rateLimitRpm })
    });
    await fetchAllData();
    return newKey;
  };

  const handleRevokeApiKey = async (keyId: string) => {
    await fetch(`/api/developer/api-keys/${keyId}`, { method: 'DELETE', headers: getHeaders() });
    await fetchAllData();
  };

  const handleCreateWebhook = async (name: string, targetUrl: string, events: string[]) => {
    const newWh = await fetchJsonSafely('/api/developer/webhooks', {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name, targetUrl, events })
    });
    await fetchAllData();
    return newWh;
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    await fetch(`/api/developer/webhooks/${webhookId}`, { method: 'DELETE', headers: getHeaders() });
    await fetchAllData();
  };

  const handleTestWebhook = async (webhookId: string) => {
    return await fetchJsonSafely(`/api/developer/webhooks/${webhookId}/test`, {
      method: 'POST',
      headers: getHeaders()
    }) || { success: false, message: 'Webhook test failed' };
  };

  const handleRetryError = async (errorLogId: string) => {
    await fetch(`/api/integrations/errors/${errorLogId}/retry`, { method: 'POST', headers: getHeaders() });
    await fetchAllData();
  };

  // Filtered Integrations for Catalog Tab
  const filteredIntegrations = integrations.filter(i => {
    const matchesCategory = categoryFilter === 'all' || i.category === categoryFilter;
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          i.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All Apps (16)' },
    { id: 'email', label: 'Email' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'messaging', label: 'Messaging' },
    { id: 'ecommerce', label: 'E-commerce' },
    { id: 'payment', label: 'Payment' },
    { id: 'storage', label: 'Storage' }
  ];

  const connectedCount = integrations.filter(i => i.status === 'connected').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Platform Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Centralized Integrations Hub</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage 16 native third-party connectors, developer REST APIs, Webhook event listeners & OAuth credentials
              </p>
            </div>
          </div>
        </div>

        {/* Global Summary Metrics */}
        <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-xl text-xs font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-600">Connected:</span>
            <span className="font-bold text-slate-900">{connectedCount} / 16</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-200"></div>

          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-600">Health:</span>
            <span className="font-bold text-emerald-600">{analytics?.overallHealthScore || 98}%</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-200"></div>

          <div className="flex items-center space-x-1.5">
            <Globe className="w-4 h-4 text-indigo-600" />
            <span className="text-slate-600">API Keys:</span>
            <span className="font-bold text-slate-900">{apiKeys.length}</span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Native Integrations Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('developer')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'developer'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>API Keys & Webhook Management</span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'docs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Developer Docs & SDK Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('errors')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap relative ${
            activeTab === 'errors'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Health & Error Queue</span>
          {errorLogs.filter(e => e.status !== 'resolved').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Integration Analytics</span>
        </button>
      </div>

      {/* ====================================================================
         VIEW 1: INTEGRATIONS CATALOG
         ==================================================================== */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          
          {/* Catalog Filter & Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            
            {/* Category Pills */}
            <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-100 rounded-lg">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                    categoryFilter === cat.id
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search integrations..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
            </div>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white border border-slate-200 rounded-xl p-6 h-48 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConfigure={handleConfigure}
                  onTest={handleTestConnection}
                  onSync={handleSync}
                  onDisconnect={() => handleDisconnect(integration.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
         VIEW 2: API & WEBHOOK MANAGEMENT
         ==================================================================== */}
      {activeTab === 'developer' && (
        <ApiAndWebhookManager
          apiKeys={apiKeys}
          webhooks={webhooks}
          onCreateApiKey={handleCreateApiKey}
          onRevokeApiKey={handleRevokeApiKey}
          onCreateWebhook={handleCreateWebhook}
          onDeleteWebhook={handleDeleteWebhook}
          onTestWebhook={handleTestWebhook}
        />
      )}

      {/* ====================================================================
         VIEW 3: API DOCS & SDK GENERATOR
         ==================================================================== */}
      {activeTab === 'docs' && <ApiDocsAndSdk />}

      {/* ====================================================================
         VIEW 4: HEALTH & ERROR QUEUE
         ==================================================================== */}
      {activeTab === 'errors' && (
        <IntegrationErrorLogs
          errorLogs={errorLogs}
          auditLogs={auditLogs}
          onRetryError={handleRetryError}
        />
      )}

      {/* ====================================================================
         VIEW 5: INTEGRATION ANALYTICS
         ==================================================================== */}
      {activeTab === 'analytics' && <IntegrationAnalyticsView analytics={analytics} />}

      {/* Configuration Modal Dialog */}
      <IntegrationModal
        isOpen={isModalOpen}
        integration={selectedIntegration}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveConfig}
        onDisconnect={handleDisconnect}
        onTest={handleTestConnection}
      />

    </div>
  );
};
