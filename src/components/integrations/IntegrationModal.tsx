import React, { useState, useEffect } from 'react';
import { 
  X, Check, Shield, Key, Link, AlertCircle, RefreshCw, Zap, CheckCircle2, Globe, ExternalLink 
} from 'lucide-react';
import { IntegrationItem } from '../../types';

interface IntegrationModalProps {
  isOpen: boolean;
  integration: IntegrationItem | null;
  onClose: () => void;
  onSave: (integrationId: string, config: any, authType: any) => Promise<void>;
  onDisconnect: (integrationId: string) => Promise<void>;
  onTest: (integrationId: string) => Promise<{ success: boolean; latencyMs: number; message: string }>;
}

export const IntegrationModal: React.FC<IntegrationModalProps> = ({
  isOpen,
  integration,
  onClose,
  onSave,
  onDisconnect,
  onTest
}) => {
  const [apiKey, setApiKey] = useState('');
  const [connectedEmail, setConnectedEmail] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('production');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; message: string } | null>(null);

  useEffect(() => {
    if (integration) {
      setApiKey(integration.config?.apiKey || '');
      setConnectedEmail(integration.config?.connectedAccountEmail || 'sales@enterprise.com');
      setClientId(integration.config?.clientId || '');
      setClientSecret(integration.config?.clientSecret || '');
      setWebhookUrl(integration.config?.webhookUrl || '');
      setEnvironment(integration.config?.environment || 'production');
      setTestResult(null);
    }
  }, [integration]);

  if (!isOpen || !integration) return null;

  const handleConnectOAuth = async () => {
    setIsSaving(true);
    try {
      await onSave(integration.id, {
        connectedAccountEmail: connectedEmail || 'authorized@enterprise.com',
        scopes: ['read', 'write', 'offline_access'],
        accessTokenExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        environment
      }, 'oauth2');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(integration.id, {
        apiKey,
        connectedAccountEmail: connectedEmail,
        clientId,
        clientSecret,
        webhookUrl,
        environment
      }, integration.authType);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await onTest(integration.id);
      setTestResult(res);
    } catch (err) {
      setTestResult({ success: false, latencyMs: 0, message: 'Handshake failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const isConnected = integration.status === 'connected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 font-bold text-lg">
              {integration.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{integration.name} Settings</h2>
              <p className="text-xs text-slate-500">Configure authentication credentials & webhook triggers</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isConnected 
              ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-900' 
              : 'bg-amber-50/60 border-amber-200/80 text-amber-900'
          }`}>
            <div className="flex items-center space-x-3">
              {isConnected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              )}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider">
                  {isConnected ? 'Service Connected & Active' : 'Action Required'}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {isConnected 
                    ? `Connected to ${integration.config?.connectedAccountEmail || 'Production Account'}` 
                    : 'Provide API key or initiate OAuth grant to connect.'}
                </div>
              </div>
            </div>

            {isConnected && (
              <button
                onClick={() => onDisconnect(integration.id)}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100/80 bg-rose-50 border border-rose-200 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>

          {/* Test Handshake Feedback */}
          {testResult && (
            <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
              testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <span className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>{testResult.message}</span>
              </span>
              <span className="font-mono bg-white/80 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                {testResult.latencyMs}ms
              </span>
            </div>
          )}

          {/* OAuth Form */}
          {integration.authType === 'oauth2' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>OAuth 2.0 Security Scope</span>
                </h4>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Connecting {integration.name} uses official PKCE OAuth flow. The assistant receives scoped read/write access without storing your raw password.
                </p>
                
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-700">Account Email / Identifier</label>
                  <input
                    type="email"
                    value={connectedEmail}
                    onChange={(e) => setConnectedEmail(e.target.value)}
                    placeholder="e.g. admin@enterprise.com"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>Test API Handshake</span>
                </button>

                <button
                  type="button"
                  onClick={handleConnectOAuth}
                  disabled={isSaving}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{isSaving ? 'Connecting...' : isConnected ? 'Re-authorize OAuth' : 'Authorize OAuth Access'}</span>
                </button>
              </div>
            </div>
          )}

          {/* API Key / Bot Token / Webhook Form */}
          {integration.authType !== 'oauth2' && (
            <form onSubmit={handleSaveApiKey} className="space-y-4">
              {integration.authType === 'api_key' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">API Key / Secret Token</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="e.g. sk_live_982341092..."
                      required
                      className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none pr-10"
                    />
                    <Key className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>
              )}

              {integration.authType === 'bot_token' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bot Authorization Token</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="e.g. bot123456789:ABCdefGHI..."
                    required
                    className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Account / Organization ID</label>
                <input
                  type="text"
                  value={connectedEmail}
                  onChange={(e) => setConnectedEmail(e.target.value)}
                  placeholder="e.g. enterprise-store.myshopify.com or Org ID"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              {integration.category === 'payment' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Environment Tier</label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  >
                    <option value="production">Production Live</option>
                    <option value="sandbox">Sandbox / Test Mode</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>Test API Ping</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                  >
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
