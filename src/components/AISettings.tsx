import React, { useState, useEffect } from 'react';
import { 
  Cpu, Key, CheckCircle2, AlertCircle, RefreshCw, Zap, ShieldCheck, 
  Eye, EyeOff, Save, Check, Layers, Server, Globe, Sparkles, HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface AISettingsProps {
  token: string;
  addToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
  onLaunchWizard?: () => void;
}

export type AIProviderName = 'groq' | 'gemini' | 'openai' | 'openrouter';

interface ProviderStatus {
  hasKey: boolean;
  keySource: 'vault' | 'env' | 'saved' | 'none';
  maskedKey: string;
  isInvalid?: boolean;
}

interface AIConfigResponse {
  activeProvider: AIProviderName;
  activeModels: Record<AIProviderName, string>;
  customKeys?: Record<AIProviderName, string>;
  keysStatus?: Record<AIProviderName, ProviderStatus>;
  status?: Record<AIProviderName, ProviderStatus>;
  hasInvalidKeyAlert?: boolean;
  invalidProviderName?: AIProviderName;
  availableModels: Record<AIProviderName, { id: string; name: string; description: string }[]>;
}

export const AISettings: React.FC<AISettingsProps> = ({ token, addToast, onLaunchWizard }) => {
  const [config, setConfig] = useState<AIConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Local state for edit form
  const [activeProvider, setActiveProvider] = useState<AIProviderName>('groq');
  const [activeModels, setActiveModels] = useState<Record<AIProviderName, string>>({
    groq: 'llama-3.3-70b-versatile',
    gemini: 'gemini-3.8-flash',
    openai: 'gpt-4o-mini',
    openrouter: 'meta-llama/llama-3.3-70b-instruct'
  });
  const [customKeys, setCustomKeys] = useState<Record<AIProviderName, string>>({
    groq: '',
    gemini: '',
    openai: '',
    openrouter: ''
  });
  
  // Visibility toggles for keys
  const [showKeys, setShowKeys] = useState<Record<AIProviderName, boolean>>({
    groq: false,
    gemini: false,
    openai: false,
    openrouter: false
  });

  // Testing states per provider
  const [testing, setTesting] = useState<Record<AIProviderName, boolean>>({
    groq: false,
    gemini: false,
    openai: false,
    openrouter: false
  });
  const [testResults, setTestResults] = useState<Record<AIProviderName, { success?: boolean; message?: string; responseTimeMs?: number }>>({
    groq: {},
    gemini: {},
    openai: {},
    openrouter: {}
  });

  // Fetch AI Config on load
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workspace/ai-provider/config', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setActiveProvider(data.activeProvider || 'groq');
        if (data.activeModels) setActiveModels(data.activeModels);
      } else {
        if (addToast) addToast('error', 'Failed to load AI configuration');
      }
    } catch (err: any) {
      console.error('Error loading AI config:', err);
      if (addToast) addToast('error', 'Connection error fetching AI settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [token]);

  // Save Config handler
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/workspace/ai-provider/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          activeProvider,
          activeModels,
          customKeys
        })
      });

      if (res.ok) {
        await fetchConfig();
        if (addToast) addToast('success', 'AI Configuration Saved', `Active provider set to ${activeProvider.toUpperCase()} (AES-256 Encrypted).`);
      } else {
        const errData = await res.json();
        if (addToast) addToast('error', 'Save Failed', errData.error || 'Failed to save configuration');
      }
    } catch (err: any) {
      if (addToast) addToast('error', 'Save Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  // Test Connection handler
  const handleTestConnection = async (prov: AIProviderName) => {
    setTesting(prev => ({ ...prev, [prov]: true }));
    setTestResults(prev => ({ ...prev, [prov]: {} }));

    try {
      const res = await fetch('/api/workspace/ai-provider/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          provider: prov,
          apiKey: customKeys[prov],
          model: activeModels[prov]
        })
      });

      const data = await res.json();
      setTestResults(prev => ({ ...prev, [prov]: data }));

      if (data.success) {
        if (addToast) addToast('success', `${prov.toUpperCase()} Connected`, `Response time: ${data.responseTimeMs}ms`);
      } else {
        if (addToast) addToast('error', `${prov.toUpperCase()} Test Failed`, data.message);
      }
    } catch (err: any) {
      setTestResults(prev => ({ ...prev, [prov]: { success: false, message: err.message } }));
      if (addToast) addToast('error', 'Test Error', err.message);
    } finally {
      setTesting(prev => ({ ...prev, [prov]: false }));
    }
  };

  const providersList: {
    id: AIProviderName;
    name: string;
    badge?: string;
    description: string;
    icon: string;
    isDefault?: boolean;
  }[] = [
    {
      id: 'groq',
      name: 'Groq LPU Engine',
      badge: 'DEFAULT / ULTRA-FAST',
      description: 'Ultra-low latency inference using Groq LPUs. Powers lightning-fast Llama-3.3 70B & Mixtral models.',
      icon: '⚡',
      isDefault: true
    },
    {
      id: 'gemini',
      name: 'Google Gemini AI',
      badge: 'MULTIMODAL',
      description: 'Google DeepMind flagship multimodal models (Gemini 3.8 Flash / 3.1 Flash Lite) with long context support.',
      icon: '✨'
    },
    {
      id: 'openai',
      name: 'OpenAI GPT Platform',
      badge: 'ENTERPRISE',
      description: 'Standard industry models including GPT-4o and GPT-4o-mini for structured tasks and agent reasoning.',
      icon: '🤖'
    },
    {
      id: 'openrouter',
      name: 'OpenRouter Aggregator',
      badge: 'UNIFIED GATEWAY',
      description: 'Unified router supporting DeepSeek, Claude 3.5, Llama 3, and 100+ open/closed-source models.',
      icon: '🌐'
    }
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-400 font-medium">
          <RefreshCw className="animate-spin" size={20} />
          <span>Loading AI Provider System Settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="text-blue-500" size={24} />
            <h1 className="text-2xl font-bold font-display text-white">Centralized AI Provider Architecture</h1>
            <span className="bg-blue-950/80 text-blue-400 border border-blue-800 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
              PROVIDER-INDEPENDENT
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Manage provider selection, configure API keys securely, test live endpoint connectivity, and route chatbot requests dynamically.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {onLaunchWizard && (
            <button
              onClick={onLaunchWizard}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Sparkles className="text-amber-400" size={16} />
              <span>Launch AI Setup Wizard</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
            <span>{saving ? 'Saving Changes...' : 'Save AI Configuration'}</span>
          </button>
        </div>
      </div>

      {/* Active Provider Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="text-amber-400" size={18} />
            Active Primary AI Provider
          </h2>
          <span className="text-xs text-slate-400">Every visitor chat message is routed through the selected active provider.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providersList.map((p) => {
            const isSelected = activeProvider === p.id;
            const statusInfo = config?.status?.[p.id];
            
            return (
              <div
                key={p.id}
                onClick={() => setActiveProvider(p.id)}
                className={`relative p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500/80 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">{p.name}</h3>
                        {p.badge && (
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            p.isDefault 
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80 font-bold'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-700 bg-slate-900'
                  }`}>
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>

                {/* Key Status Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Key size={12} />
                    API Key Status:
                  </span>
                  {statusInfo?.hasKey ? (
                    <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Configured ({statusInfo.keySource === 'env' ? 'ENV' : 'SETTINGS'})
                    </span>
                  ) : (
                    <span className="text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded flex items-center gap-1">
                      <AlertCircle size={12} />
                      Missing Key
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Provider API Keys & Model Configurations */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Key className="text-blue-400" size={18} />
          Provider API Credentials & Model Customization
        </h2>

        <div className="space-y-4">
          {providersList.map((p) => {
            const statusInfo = config?.status?.[p.id];
            const testRes = testResults[p.id];
            const isTestRunning = testing[p.id];
            const availableModelsList = config?.availableModels?.[p.id] || [];

            return (
              <div 
                key={p.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{p.icon}</span>
                    <h3 className="font-bold text-white text-base">{p.name}</h3>
                    {activeProvider === p.id && (
                      <span className="bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                        ACTIVE PROVIDER
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestConnection(p.id)}
                      disabled={isTestRunning}
                      className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 font-medium transition-colors cursor-pointer"
                    >
                      {isTestRunning ? <RefreshCw className="animate-spin" size={12} /> : <Zap size={12} className="text-amber-400" />}
                      <span>{isTestRunning ? 'Testing Ping...' : 'Test Connection'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Model Selection Dropdown */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Selected Model
                    </label>
                    <select
                      value={activeModels[p.id] || ''}
                      onChange={(e) => setActiveModels(prev => ({ ...prev, [p.id]: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    >
                      {availableModelsList.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* API Key Input */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>API Key Override (Optional)</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {statusInfo?.keySource === 'env' ? 'Loaded from process.env' : statusInfo?.keySource === 'saved' ? 'Custom key saved' : 'No key set'}
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showKeys[p.id] ? 'text' : 'password'}
                        placeholder={statusInfo?.hasKey ? `Existing Key: ${statusInfo.maskedKey}` : `Enter ${p.name} API Key...`}
                        value={customKeys[p.id] || ''}
                        onChange={(e) => setCustomKeys(prev => ({ ...prev, [p.id]: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showKeys[p.id] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Connection Test Result Banner */}
                {testRes?.message && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
                      testRes.success
                        ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                    }`}
                  >
                    {testRes.success ? (
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold mb-0.5">
                        {testRes.success ? 'Connection Test Passed' : 'Connection Test Error'}
                      </div>
                      <div className="break-all text-[11px] opacity-90">{testRes.message}</div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Security & Architecture Note */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3">
        <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={20} />
        <div className="text-xs text-slate-400 space-y-1">
          <h4 className="font-bold text-white text-sm">Enterprise Security & Environment Resolution</h4>
          <p>
            API keys are loaded directly from server environment variables (<code className="text-blue-400">GROQ_API_KEY</code>, <code className="text-blue-400">GEMINI_API_KEY</code>, <code className="text-blue-400">OPENAI_API_KEY</code>, <code className="text-blue-400">OPENROUTER_API_KEY</code>). Any custom key overrides entered in this dashboard are encrypted at rest using AES-256-GCM.
          </p>
        </div>
      </div>
    </div>
  );
};
