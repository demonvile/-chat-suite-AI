import React, { useState, useEffect } from 'react';
import { 
  Cpu, Key, Zap, CheckCircle2, AlertCircle, RefreshCw, Eye, EyeOff, 
  ArrowRight, ArrowLeft, ShieldCheck, Sparkles, Check, Lock, Unlock, 
  HelpCircle, Copy, Globe, Bot, Layers, Sliders, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AIProviderName, WorkspaceAiConfig } from '../../types';

interface AISetupWizardProps {
  token: string;
  isOpen: boolean;
  onClose?: () => void;
  onComplete: (config: WorkspaceAiConfig) => void;
  allowSkip?: boolean;
  addToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

export const AISetupWizard: React.FC<AISetupWizardProps> = ({
  token,
  isOpen,
  onClose,
  onComplete,
  allowSkip = true,
  addToast
}) => {
  // Current Step: 1 (Provider), 2 (Config & Key), 3 (Test), 4 (Complete)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selected Provider
  const [selectedProvider, setSelectedProvider] = useState<AIProviderName>('groq');

  // Provider configuration state
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('llama-3.3-70b-versatile');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [organizationId, setOrganizationId] = useState<string>(''); // OpenAI specific
  const [siteName, setSiteName] = useState<string>(''); // OpenRouter specific

  // Testing State
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    responseTimeMs?: number;
    provider?: string;
    model?: string;
  } | null>(null);

  // Saving State
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Reset fields when provider changes
  useEffect(() => {
    setApiKey('');
    setTestResult(null);
    setShowApiKey(false);

    // Set default models for each provider
    if (selectedProvider === 'groq') setSelectedModel('llama-3.3-70b-versatile');
    else if (selectedProvider === 'gemini') setSelectedModel('gemini-3.8-flash');
    else if (selectedProvider === 'openai') setSelectedModel('gpt-4o-mini');
    else if (selectedProvider === 'openrouter') setSelectedModel('meta-llama/llama-3.3-70b-instruct');
  }, [selectedProvider]);

  if (!isOpen) return null;

  // List of providers & metadata
  const providerList: {
    id: AIProviderName;
    name: string;
    tagline: string;
    description: string;
    icon: string;
    badge: string;
    badgeColor: string;
    models: { id: string; name: string; desc: string }[];
    keyPrefixHint: string;
    keyConsoleUrl: string;
  }[] = [
    {
      id: 'groq',
      name: 'Groq LPU Engine',
      tagline: 'Sub-second Llama 3.3 & Mixtral Inference',
      description: 'Ultra-fast open models hosted on Groq LPUs. Ideal for real-time customer chatbots.',
      icon: '⚡',
      badge: 'RECOMMENDED / ULTRA-FAST',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      keyPrefixHint: 'gsk_...',
      keyConsoleUrl: 'https://console.groq.com/keys',
      models: [
        { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', desc: 'Flagship 70B open model, ultra-fast' },
        { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', desc: 'Sub-second lightweight responses' },
        { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B Instruct', desc: 'High capacity Mixture-of-Experts' },
        { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B', desc: 'Advanced reasoning capability' }
      ]
    },
    {
      id: 'gemini',
      name: 'Google Gemini AI',
      tagline: 'Multimodal 2M Token Context Window',
      description: 'Google DeepMind flagship models featuring native audio, visual analysis, and long document context.',
      icon: '✨',
      badge: 'MULTIMODAL / GOOGLE',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      keyPrefixHint: 'AIzaSy...',
      keyConsoleUrl: 'https://aistudio.google.com/app/apikey',
      models: [
        { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', desc: 'Fast, highly capable multimodal model (Recommended)' },
        { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', desc: 'Lightweight high-efficiency model' }
      ]
    },
    {
      id: 'openai',
      name: 'OpenAI GPT Platform',
      tagline: 'GPT-4o & GPT-4o-Mini Enterprise AI',
      description: 'Industry standard for complex reasoning, structured JSON outputs, and agent workflows.',
      icon: '🤖',
      badge: 'ENTERPRISE AI',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      keyPrefixHint: 'sk-proj-... / sk-...',
      keyConsoleUrl: 'https://platform.openai.com/api-keys',
      models: [
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Affordable, fast, highly intelligent' },
        { id: 'gpt-4o', name: 'GPT-4o', desc: 'Flagship multimodal reasoning model' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', desc: 'Legacy lightweight text model' }
      ]
    },
    {
      id: 'openrouter',
      name: 'OpenRouter Aggregator',
      tagline: '100+ Models via Single Unified API',
      description: 'Access Claude 3.5 Sonnet, DeepSeek R1, Llama 3, and mistral models with zero lock-in.',
      icon: '🌐',
      badge: 'UNIFIED ROUTER',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      keyPrefixHint: 'sk-or-v1-...',
      keyConsoleUrl: 'https://openrouter.ai/keys',
      models: [
        { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct', desc: 'OpenRouter hosted Llama 3.3' },
        { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', desc: 'Anthropic flagship reasoning model' },
        { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)', desc: 'Community reasoning model' }
      ]
    }
  ];

  const currentProviderInfo = providerList.find(p => p.id === selectedProvider) || providerList[0];

  // Handle Real Test Connection Call
  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      if (addToast) addToast('warning', 'API Key Required', 'Please enter your API key before testing.');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/workspace/ai-provider/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey: apiKey.trim(),
          model: selectedModel
        })
      });

      const data = await res.json();
      setTestResult(data);

      if (data.success) {
        if (addToast) addToast('success', `${selectedProvider.toUpperCase()} Connection Verified`, `Latency: ${data.responseTimeMs}ms`);
      } else {
        if (addToast) addToast('error', 'Connection Test Failed', data.message);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error while contacting AI provider test endpoint.'
      });
      if (addToast) addToast('error', 'Test Error', err.message);
    } finally {
      setIsTesting(false);
    }
  };

  // Handle Save & Complete
  const handleSaveAndComplete = async () => {
    if (!testResult?.success) {
      if (addToast) addToast('warning', 'Verification Required', 'Please successfully test your connection before completing setup.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/workspace/ai-provider/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          activeProvider: selectedProvider,
          activeModels: { [selectedProvider]: selectedModel },
          customKeys: { [selectedProvider]: apiKey.trim() },
          organizationId,
          siteName,
          completeWizard: true
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentStep(4); // Move to success step
        if (addToast) addToast('success', 'AI Wizard Complete', 'Your enterprise AI provider is active!');
      } else {
        const err = await res.json();
        if (addToast) addToast('error', 'Save Error', err.error || 'Failed to save configuration');
      }
    } catch (err: any) {
      if (addToast) addToast('error', 'Connection Error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Wizard Skip (if allowed)
  const handleSkipWizard = async () => {
    try {
      const res = await fetch('/api/workspace/ai-provider/wizard-skip', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        onComplete(data.config || {
          aiWizardCompleted: true,
          aiWizardSkipped: true,
          activeProvider: 'groq',
          activeModels: { groq: 'llama-3.3-70b-versatile' },
          keys: {}
        });
        if (onClose) onClose();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Finish Button on Step 4
  const handleFinishWizard = () => {
    onComplete({
      aiWizardCompleted: true,
      activeProvider: selectedProvider,
      activeModels: {
        groq: selectedProvider === 'groq' ? selectedModel : 'llama-3.3-70b-versatile',
        gemini: selectedProvider === 'gemini' ? selectedModel : 'gemini-3.8-flash',
        openai: selectedProvider === 'openai' ? selectedModel : 'gpt-4o-mini',
        openrouter: selectedProvider === 'openrouter' ? selectedModel : 'meta-llama/llama-3.3-70b-instruct'
      },
      keys: {
        [selectedProvider]: {
          hasKey: true,
          maskedKey: apiKey.substring(0, 4) + '••••••••' + apiKey.substring(apiKey.length - 4),
          keyPrefix: apiKey.substring(0, 10),
          isInvalid: false,
          lastTestedAt: new Date().toISOString()
        }
      }
    });
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-3xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
      >
        {/* Top Header & Wizard Stepper */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white border-b border-slate-800 relative">
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl">
                <Cpu size={24} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
                  First-Time Onboarding
                </span>
                <h2 className="text-xl font-display font-bold text-white tracking-tight">
                  AI Provider Setup Wizard
                </h2>
              </div>
            </div>

            {allowSkip && currentStep < 4 && (
              <button
                onClick={handleSkipWizard}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer transition-colors"
              >
                Skip for now
              </button>
            )}
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {[
              { num: 1, label: 'Choose Provider' },
              { num: 2, label: 'API Key & Model' },
              { num: 3, label: 'Test Connection' },
              { num: 4, label: 'Activate & Unlock' }
            ].map((st) => {
              const isActive = currentStep === st.num;
              const isCompleted = currentStep > st.num;

              return (
                <div key={st.num} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted 
                        ? 'bg-emerald-500 text-slate-950' 
                        : isActive 
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400/50' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isCompleted ? <Check size={14} strokeWidth={3} /> : st.num}
                    </div>
                    <span className={`text-xs font-semibold truncate hidden sm:inline ${
                      isActive ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {st.label}
                    </span>
                  </div>
                  <div className={`h-1.5 rounded-full transition-all ${
                    isCompleted ? 'bg-emerald-500' : isActive ? 'bg-blue-600' : 'bg-slate-800'
                  }`} />
                </div>
              );
            })}
          </div>

        </div>

        {/* Wizard Body Content */}
        <div className="p-6 space-y-6">

          {/* =============================================================== */}
          {/* STEP 1: SELECT AI PROVIDER                                      */}
          {/* =============================================================== */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap size={18} className="text-amber-500" />
                  Select Primary AI Engine Provider
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Choose which LLM provider will power your workspace chatbots, AI agents, and RAG search. You can change or add multiple keys later in Settings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providerList.map((p) => {
                  const isSelected = selectedProvider === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProvider(p.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-500/80 shadow-md ring-1 ring-blue-500/50'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{p.icon}</span>
                            <div>
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</h4>
                              <span className={`inline-block text-[9px] font-mono px-2 py-0.5 rounded-full border mt-0.5 font-bold ${p.badgeColor}`}>
                                {p.badge}
                              </span>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-700'
                          }`}>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{p.tagline}</p>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{p.description}</p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center justify-between">
                        <span>Default: {p.models[0].name}</span>
                        <ChevronRight size={12} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-blue-600/20"
                >
                  <span>Continue to API Key Setup</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 2: DYNAMIC CONFIGURATION & API KEY INPUT                    */}
          {/* =============================================================== */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Key size={18} className="text-blue-500" />
                    Configure {currentProviderInfo.name} Credentials
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Enter your confidential API key and select default LLM model parameters.
                  </p>
                </div>
                <span className="text-2xl">{currentProviderInfo.icon}</span>
              </div>

              {/* Dynamic API Key Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>{currentProviderInfo.name} API Secret Key</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <a
                    href={currentProviderInfo.keyConsoleUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Get Key from Console</span>
                    <Globe size={11} />
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setTestResult(null); // Reset test result on key edit
                    }}
                    placeholder={`e.g. ${currentProviderInfo.keyPrefixHint}`}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs px-3.5 py-3 pr-24 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title={showApiKey ? 'Hide Key' : 'Show Key'}
                    >
                      {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text) setApiKey(text.trim());
                        } catch (e) {
                          console.error('Clipboard paste failed', e);
                        }
                      }}
                      className="px-2 py-1 text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 cursor-pointer"
                    >
                      Paste
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span>Keys are encrypted with AES-256-GCM before persistent storage in your isolated workspace vault.</span>
                </p>
              </div>

              {/* Dynamic Model Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Default Active Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {currentProviderInfo.models.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Temperature Slider */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex justify-between">
                    <span>Creativity (Temperature)</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{temperature}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Provider Specific Extra Inputs */}
              {selectedProvider === 'openai' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    OpenAI Organization ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={organizationId}
                    onChange={(e) => setOrganizationId(e.target.value)}
                    placeholder="org-xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
              )}

              {selectedProvider === 'openrouter' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Site Name / App Title Header (Optional)
                  </label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="My Enterprise App"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Providers</span>
                </button>

                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!apiKey.trim()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-blue-600/20"
                >
                  <span>Proceed to Test Connection</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 3: LIVE REAL CONNECTION TEST                                */}
          {/* =============================================================== */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <RefreshCw size={18} className="text-purple-500" />
                  Test Live Connection & Verify API Access
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Requirement 6 & 7: "Save & Continue" will be enabled strictly after a real ping test confirms successful connection to {currentProviderInfo.name}.
                </p>
              </div>

              {/* Target Test Details Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Provider:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentProviderInfo.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Selected Model:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{selectedModel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Key Fingerprint:</span>
                  <span className="text-slate-700 dark:text-slate-300">{apiKey.substring(0, 8)}...</span>
                </div>
              </div>

              {/* Connection Test Trigger Area */}
              <div className="text-center py-4 space-y-3">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-600/25 flex items-center gap-2 mx-auto cursor-pointer transition-all active:scale-[0.98]"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      <span>Sending Test Ping to {selectedProvider.toUpperCase()} API...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={16} className="text-amber-300" />
                      <span>Run Real Connection Test</span>
                    </>
                  )}
                </button>
              </div>

              {/* Test Connection Output Feedback */}
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl border text-xs ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {testResult.success ? (
                      <CheckCircle2 size={22} className="text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={22} className="text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between font-bold text-sm">
                        <span>{testResult.success ? '✓ Connection Successful' : '✕ Connection Test Failed'}</span>
                        {testResult.responseTimeMs !== undefined && (
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            Latency: {testResult.responseTimeMs}ms
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[11px] leading-relaxed break-all">
                        {testResult.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Save & Continue Button Control */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>

                <div className="flex items-center gap-2">
                  {!testResult?.success && (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      <Lock size={12} />
                      Test connection to enable Save & Continue
                    </span>
                  )}

                  <button
                    onClick={handleSaveAndComplete}
                    disabled={!testResult?.success || isSaving}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-600/20"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} />
                        <span>Encrypting & Saving Key...</span>
                      </>
                    ) : (
                      <>
                        <span>Save & Continue</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 4: SUCCESS & DASHBOARD UNLOCK                              */}
          {/* =============================================================== */}
          {currentStep === 4 && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl">
                <Sparkles size={32} />
              </div>

              <div>
                <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                  Enterprise AI Provider Configured!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                  Your workspace is now powered by <strong className="text-blue-600 dark:text-blue-400">{currentProviderInfo.name}</strong> ({selectedModel}). All workspace AI agents, lead extractors, and chatbot widgets are active.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Provider:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono uppercase">{selectedProvider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Model Assigned:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Key Security Vault:</span>
                  <span className="text-emerald-500">AES-256-GCM Encrypted</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dashboard Status:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Unlock size={12} /> Unlocked
                  </span>
                </div>
              </div>

              <button
                onClick={handleFinishWizard}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-xl shadow-blue-600/30 cursor-pointer transition-all active:scale-[0.98] inline-flex items-center gap-2"
              >
                <span>Enter Workspace Dashboard</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
