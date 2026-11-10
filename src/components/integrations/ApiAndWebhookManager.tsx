import React, { useState } from 'react';
import { 
  Key, Globe, Plus, Trash2, Copy, Check, Shield, AlertTriangle, Send, RefreshCw, Lock, Zap, Eye 
} from 'lucide-react';
import { IntegrationApiKey, IntegrationWebhookEndpoint } from '../../types';

interface ApiAndWebhookManagerProps {
  apiKeys: IntegrationApiKey[];
  webhooks: IntegrationWebhookEndpoint[];
  onCreateApiKey: (name: string, scopes: string[], rateLimitRpm: number) => Promise<IntegrationApiKey>;
  onRevokeApiKey: (keyId: string) => Promise<void>;
  onCreateWebhook: (name: string, targetUrl: string, events: string[]) => Promise<IntegrationWebhookEndpoint>;
  onDeleteWebhook: (webhookId: string) => Promise<void>;
  onTestWebhook: (webhookId: string) => Promise<any>;
}

export const ApiAndWebhookManager: React.FC<ApiAndWebhookManagerProps> = ({
  apiKeys,
  webhooks,
  onCreateApiKey,
  onRevokeApiKey,
  onCreateWebhook,
  onDeleteWebhook,
  onTestWebhook
}) => {
  const [activeTab, setActiveTab] = useState<'api_keys' | 'webhooks'>('api_keys');

  // API Key Modal State
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'leads.read', 'leads.write', 'tickets.read', 'tickets.write', 'workflows.trigger'
  ]);
  const [rateLimitRpm, setRateLimitRpm] = useState(600);
  const [createdKeyResult, setCreatedKeyResult] = useState<IntegrationApiKey | null>(null);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Webhook Modal State
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [webhookName, setWebhookName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    'lead_captured', 'ticket_created', 'appointment_booked'
  ]);
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);

  // Test Webhook Feedback
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  const [testPayloadResult, setTestPayloadResult] = useState<any | null>(null);

  const availableScopes = [
    { id: 'leads.read', label: 'Read CRM Leads', desc: 'Query captured visitor contact details' },
    { id: 'leads.write', label: 'Write CRM Leads', desc: 'Create and update leads programmatically' },
    { id: 'tickets.read', label: 'Read Tickets', desc: 'View AI support conversation tickets' },
    { id: 'tickets.write', label: 'Write Tickets', desc: 'Update ticket statuses and internal notes' },
    { id: 'workflows.trigger', label: 'Trigger Workflows', desc: 'Initiate automated multi-step flows' },
    { id: 'webhooks.manage', label: 'Manage Webhooks', desc: 'Register or modify webhook listeners' },
    { id: 'integrations.read', label: 'Read Integrations', desc: 'Inspect status of connected native apps' }
  ];

  const availableEvents = [
    { id: 'lead_captured', label: 'Lead Captured', desc: 'Triggered when a new lead is captured by AI' },
    { id: 'ticket_created', label: 'Ticket Created', desc: 'Triggered when an escalated ticket is opened' },
    { id: 'appointment_booked', label: 'Appointment Booked', desc: 'Triggered when a calendar slot is confirmed' },
    { id: 'workflow_executed', label: 'Workflow Executed', desc: 'Triggered when a visual workflow completes' },
    { id: 'integration_error', label: 'Integration Error', desc: 'Triggered when an external service fails' }
  ];

  const handleToggleScope = (scopeId: string) => {
    if (selectedScopes.includes(scopeId)) {
      setSelectedScopes(selectedScopes.filter(s => s !== scopeId));
    } else {
      setSelectedScopes([...selectedScopes, scopeId]);
    }
  };

  const handleToggleEvent = (eventId: string) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter(e => e !== eventId));
    } else {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  const handleGenerateKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingKey(true);
    try {
      const res = await onCreateApiKey(keyName || 'Developer REST API Key', selectedScopes, rateLimitRpm);
      setCreatedKeyResult(res);
      setKeyName('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleCreateWebhookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) return;
    setIsCreatingWebhook(true);
    try {
      await onCreateWebhook(webhookName || 'CRM Webhook Listener', targetUrl, selectedEvents);
      setIsWebhookModalOpen(false);
      setWebhookName('');
      setTargetUrl('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingWebhook(false);
    }
  };

  const handleTestPingWebhook = async (id: string) => {
    setTestingWebhookId(id);
    setTestPayloadResult(null);
    try {
      const res = await onTestWebhook(id);
      setTestPayloadResult({ webhookId: id, data: res });
    } catch (err) {
      console.error(err);
    } finally {
      setTestingWebhookId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Switcher & Action Button Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('api_keys')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'api_keys'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Developer REST API Keys ({apiKeys.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'webhooks'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Webhook Endpoints ({webhooks.length})</span>
          </button>
        </div>

        {activeTab === 'api_keys' ? (
          <button
            onClick={() => { setCreatedKeyResult(null); setIsApiKeyModalOpen(true); }}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New REST API Key</span>
          </button>
        ) : (
          <button
            onClick={() => setIsWebhookModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register Webhook Listener</span>
          </button>
        )}
      </div>

      {/* ====================================================================
         TAB 1: REST API KEYS
         ==================================================================== */}
      {activeTab === 'api_keys' && (
        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <Key className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No Developer API Keys Generated</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Generate secure REST API credentials to integrate external scripts, mobile apps, or custom backends.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 font-mono text-xs font-bold">
                          {key.keyPrefix}...
                        </span>
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">{key.name}</h4>
                          <span className="text-[11px] text-slate-500">
                            Created {new Date(key.createdAt).toLocaleDateString()} &bull; Rate Limit: {key.rateLimitRpm} RPM
                          </span>
                        </div>
                      </div>

                      {/* Scopes Badges */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {key.scopes.map((scope) => (
                          <span key={scope} className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end md:self-center">
                      <div className="text-right text-xs text-slate-500 mr-2">
                        <div className="font-medium text-emerald-600">Active</div>
                        <div className="text-[11px]">Last used {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleTimeString() : 'Never'}</div>
                      </div>

                      <button
                        onClick={() => onRevokeApiKey(key.id)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Revoke</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
         TAB 2: WEBHOOK ENDPOINTS
         ==================================================================== */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          
          {/* Test Delivery Result Banner */}
          {testPayloadResult && (
            <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs space-y-2 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
                <span className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Webhook Delivery Simulated (HTTP 200 OK)</span>
                </span>
                <button onClick={() => setTestPayloadResult(null)} className="text-slate-400 hover:text-white">
                  &times;
                </button>
              </div>
              <p className="text-slate-300 text-[11px]">Header Signature: {testPayloadResult.data.signature}</p>
              <pre className="bg-slate-950 p-2.5 rounded border border-slate-800/80 overflow-x-auto text-[11px] text-indigo-300">
                {JSON.stringify(testPayloadResult.data.deliveredPayload, null, 2)}
              </pre>
            </div>
          )}

          {webhooks.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <Globe className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No Webhook Listeners Registered</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Register webhook URLs to receive real-time HTTP POST JSON payloads whenever leads are captured or tickets are created.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {webhooks.map((wh) => (
                <div key={wh.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <Globe className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">{wh.name}</h4>
                          <span className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                            {wh.targetUrl}
                          </span>
                        </div>
                      </div>

                      {/* Subscribed Events */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {wh.events.map((evt) => (
                          <span key={evt} className="text-[10px] font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {evt}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center space-x-4 self-end lg:self-center border-t lg:border-t-0 pt-3 lg:pt-0">
                      <div className="text-xs text-slate-500 space-y-0.5 text-right">
                        <div>Delivered: <span className="font-semibold text-slate-800">{wh.totalDelivered}</span></div>
                        <div className="text-[11px] text-slate-400">Secret: <code className="bg-slate-100 px-1 rounded">{wh.secret.substring(0, 10)}...</code></div>
                      </div>

                      <button
                        onClick={() => handleTestPingWebhook(wh.id)}
                        disabled={testingWebhookId === wh.id}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                      >
                        <Send className={`w-3.5 h-3.5 ${testingWebhookId === wh.id ? 'animate-bounce' : ''}`} />
                        <span>Send Test Ping</span>
                      </button>

                      <button
                        onClick={() => onDeleteWebhook(wh.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove Webhook"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
         GENERATE API KEY MODAL
         ==================================================================== */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Key className="w-5 h-5 text-indigo-600" />
                <span>Generate REST API Key</span>
              </h3>
              <button onClick={() => setIsApiKeyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            {createdKeyResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>API Key Generated Successfully!</span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    Make sure to copy your API key now. You will not be able to see the full key again!
                  </p>
                  
                  <div className="mt-3 flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={createdKeyResult.fullKey || createdKeyResult.keyPrefix}
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-emerald-300 rounded-lg select-all"
                    />
                    <button
                      onClick={() => copyToClipboard(createdKeyResult.fullKey || createdKeyResult.keyPrefix)}
                      className="px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center space-x-1"
                    >
                      {copiedToken ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setIsApiKeyModalOpen(false)}
                  className="w-full py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Done & Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleGenerateKeySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Key Name / Identifier</label>
                  <input
                    type="text"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="e.g. Sales CRM Pipeline Connector"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Scope Permissions</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-lg">
                    {availableScopes.map((scope) => (
                      <label key={scope.id} className="flex items-start space-x-3 p-2 rounded hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedScopes.includes(scope.id)}
                          onChange={() => handleToggleScope(scope.id)}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <div className="text-xs font-medium text-slate-800">{scope.label} <code className="text-[10px] text-slate-400">({scope.id})</code></div>
                          <div className="text-[11px] text-slate-500">{scope.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Rate Limit Threshold</span>
                    <span className="text-indigo-600 font-mono">{rateLimitRpm} RPM</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="2400"
                    step="60"
                    value={rateLimitRpm}
                    onChange={(e) => setRateLimitRpm(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsApiKeyModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingKey}
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                  >
                    {isCreatingKey ? 'Generating...' : 'Create Key'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
         REGISTER WEBHOOK MODAL
         ==================================================================== */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <span>Register Webhook Listener</span>
              </h3>
              <button onClick={() => setIsWebhookModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateWebhookSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Webhook Name</label>
                <input
                  type="text"
                  value={webhookName}
                  onChange={(e) => setWebhookName(e.target.value)}
                  placeholder="e.g. Zapier / Make.com Relay"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Receiver Endpoint URL</label>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://api.yourdomain.com/webhooks/receiver"
                  required
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Event Subscriptions</label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-lg">
                  {availableEvents.map((evt) => (
                    <label key={evt.id} className="flex items-start space-x-3 p-2 rounded hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(evt.id)}
                        onChange={() => handleToggleEvent(evt.id)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="text-xs font-medium text-slate-800">{evt.label}</div>
                        <div className="text-[11px] text-slate-500">{evt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWebhookModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingWebhook}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  {isCreatingWebhook ? 'Registering...' : 'Register Webhook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
