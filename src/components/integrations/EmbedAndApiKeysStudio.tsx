import React, { useState, useEffect } from 'react';
import { 
  Code, Key, Globe, Copy, Check, RefreshCw, Trash2, Plus, Shield, 
  AlertTriangle, Eye, EyeOff, Layers, Sparkles, Terminal, Play, CheckCircle2,
  Sliders, MessageSquare, Bot, Cpu, Zap, Lock, BookOpen, Send, Clock, Activity,
  Smartphone, Monitor, HelpCircle
} from 'lucide-react';
import { ChatbotConfig, User } from '../../types';

export interface DeveloperApiKey {
  id: string;
  workspaceId: string;
  name: string;
  keyPrefix: string;
  fullKey?: string; // Only returned once on creation/regeneration
  scopes: string[];
  rateLimitRpm: number;
  status: 'active' | 'revoked';
  createdAt: string;
  lastUsedAt?: string;
  requestCount?: number;
}

interface EmbedAndApiKeysStudioProps {
  user: User;
  bots: ChatbotConfig[];
  currentBot: ChatbotConfig | null;
  onSelectBot?: (bot: ChatbotConfig) => void;
  onRegenerateBotApiKey?: (botId: string) => Promise<string>;
  addToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const EmbedAndApiKeysStudio: React.FC<EmbedAndApiKeysStudioProps> = ({
  user,
  bots,
  currentBot,
  onSelectBot,
  onRegenerateBotApiKey,
  addToast
}) => {
  const [activeTab, setActiveTab] = useState<'embed' | 'api_keys' | 'docs' | 'webhooks'>('embed');

  // Selected bot state
  const selectedBot = currentBot || bots[0] || null;

  // ---------------------------------------------------------------------------
  // 1. EMBED CUSTOMIZATION STATE
  // ---------------------------------------------------------------------------
  const [embedWidth, setEmbedWidth] = useState('400px');
  const [embedHeight, setEmbedHeight] = useState('600px');
  const [embedTheme, setEmbedTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [embedPosition, setEmbedPosition] = useState<'right' | 'left'>('right');
  const [embedPrimaryColor, setEmbedPrimaryColor] = useState('#2563eb');
  const [embedType, setEmbedType] = useState<'js' | 'iframe' | 'react'>('js');
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [isRegeneratingBotKey, setIsRegeneratingBotKey] = useState(false);
  const [showRegenerateConfirmModal, setShowRegenerateConfirmModal] = useState(false);

  // ---------------------------------------------------------------------------
  // 2. API KEYS MANAGEMENT STATE
  // ---------------------------------------------------------------------------
  const [apiKeys, setApiKeys] = useState<DeveloperApiKey[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [keyFilterStatus, setKeyFilterStatus] = useState<'all' | 'active' | 'revoked'>('all');
  const [searchKeyQuery, setSearchKeyQuery] = useState('');

  // Create Key Modal
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>([
    'chat.read', 'chat.write', 'bots.read', 'conversations.read'
  ]);
  const [newKeyRpm, setNewKeyRpm] = useState(600);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  
  // Show Created Full Key Modal
  const [createdKeyResult, setCreatedKeyResult] = useState<DeveloperApiKey | null>(null);
  const [copiedFullKey, setCopiedFullKey] = useState(false);

  // Key Action States
  const [actionKeyId, setActionKeyId] = useState<string | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<DeveloperApiKey | null>(null);

  // ---------------------------------------------------------------------------
  // 3. API DOCUMENTATION & LIVE TESTER STATE
  // ---------------------------------------------------------------------------
  const [selectedDocEndpoint, setSelectedDocEndpoint] = useState<'chat' | 'messages' | 'chatbots' | 'conversations'>('chat');
  const [docLanguage, setDocLanguage] = useState<'curl' | 'js' | 'python' | 'php'>('curl');

  // Live Tester
  const [testEndpoint, setTestEndpoint] = useState<'chat' | 'messages' | 'chatbots' | 'conversations'>('chat');
  const [testApiKey, setTestApiKey] = useState('');
  const [testPayload, setTestPayload] = useState(
    JSON.stringify({ message: "Hello AI Assistant!", botId: selectedBot?.id || "bot-default" }, null, 2)
  );
  const [isExecutingTest, setIsExecutingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ status: number; durationMs: number; data: any } | null>(null);

  // ---------------------------------------------------------------------------
  // 4. WEBHOOK LOGS & AUDIT TRAIL STATE
  // ---------------------------------------------------------------------------
  const [webhookUrlInput, setWebhookUrlInput] = useState('');
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);

  // Load API keys from backend
  const fetchApiKeys = async () => {
    setIsLoadingKeys(true);
    try {
      const res = await fetch('/api/developer/api-keys');
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data);
      }
    } catch (err) {
      console.error('Failed to fetch API keys', err);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  // Set initial test API key when keys load
  useEffect(() => {
    if (apiKeys.length > 0 && !testApiKey) {
      setTestApiKey(apiKeys[0].keyPrefix + '...');
    } else if (selectedBot?.apiKey && !testApiKey) {
      setTestApiKey(selectedBot.apiKey);
    }
  }, [apiKeys, selectedBot]);

  // Update test payload when bot changes or endpoint changes
  useEffect(() => {
    const currentBotId = selectedBot?.id || 'bot-default';
    if (testEndpoint === 'chat') {
      setTestPayload(JSON.stringify({ message: "Hello, what services do you offer?", botId: currentBotId }, null, 2));
    } else if (testEndpoint === 'messages') {
      setTestPayload(JSON.stringify({ threadId: "thread-sample-123", botId: currentBotId, text: "Customer inquiry payload", sender: "user" }, null, 2));
    } else if (testEndpoint === 'chatbots') {
      setTestPayload(JSON.stringify({ limit: 10 }, null, 2));
    } else if (testEndpoint === 'conversations') {
      setTestPayload(JSON.stringify({ botId: currentBotId, limit: 20 }, null, 2));
    }
  }, [testEndpoint, selectedBot]);

  // Available Scopes for API Keys
  const availableScopes = [
    { id: 'chat.read', label: 'Read Chat History', desc: 'Query conversation transcripts and message logs' },
    { id: 'chat.write', label: 'Send Chat Messages', desc: 'Interact with AI chatbots programmatically' },
    { id: 'bots.read', label: 'Read Chatbots', desc: 'Inspect workspace chatbot configurations' },
    { id: 'conversations.read', label: 'Read Conversations', desc: 'List active and archived user sessions' },
    { id: 'leads.read', label: 'Read CRM Leads', desc: 'Access captured contact leads & details' },
    { id: 'tickets.read', label: 'Read Support Tickets', desc: 'Access support tickets created by AI' }
  ];

  // Helper: Get Base Origin URL
  const getOrigin = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://app.aistudio.build';
  };

  // ---------------------------------------------------------------------------
  // GENERATED EMBED CODE SNIPPETS
  // ---------------------------------------------------------------------------
  const botId = selectedBot?.id || 'bot-default';
  const botApiKey = selectedBot?.apiKey || 'sk_live_bot_default_key';

  const jsEmbedSnippet = `<!-- AI Chatbot Floating Widget Embed Code -->
<script 
  src="${getOrigin()}/widget.js" 
  data-bot-id="${botId}"
  data-theme="${embedTheme}"
  data-position="${embedPosition}"
  data-color="${embedPrimaryColor}"
  data-width="${embedWidth}"
  data-height="${embedHeight}"
  defer
></script>`;

  const iframeEmbedSnippet = `<!-- AI Chatbot Responsive Iframe Embed Code -->
<iframe 
  src="${getOrigin()}/chat-embed/${botId}?theme=${embedTheme}&color=${encodeURIComponent(embedPrimaryColor)}" 
  width="${embedWidth}" 
  height="${embedHeight}" 
  style="border: none; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); max-width: 100%;"
  title="${selectedBot?.name || 'AI Assistant Widget'}"
></iframe>`;

  const reactEmbedSnippet = `// React / Next.js Component Embed Pattern
import { useEffect } from 'react';

export function AIChatbotWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '${getOrigin()}/widget.js';
    script.setAttribute('data-bot-id', '${botId}');
    script.setAttribute('data-theme', '${embedTheme}');
    script.setAttribute('data-position', '${embedPosition}');
    script.setAttribute('data-color', '${embedPrimaryColor}');
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}`;

  const currentEmbedSnippet = embedType === 'js' ? jsEmbedSnippet : embedType === 'iframe' ? iframeEmbedSnippet : reactEmbedSnippet;

  // Copy helper with feedback
  const copyToClipboardText = (text: string, title: string = 'Copied') => {
    navigator.clipboard.writeText(text);
    if (addToast) {
      addToast('success', title, 'Content copied to clipboard.');
    }
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(currentEmbedSnippet);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
    if (addToast) {
      addToast('success', 'Embed Snippet Copied', 'Paste the code before the </body> tag of your website.');
    }
  };

  // Handle Regenerate Chatbot API Key
  const handleRegenerateBotKeySubmit = async () => {
    if (!selectedBot) return;
    setIsRegeneratingBotKey(true);
    try {
      if (onRegenerateBotApiKey) {
        await onRegenerateBotApiKey(selectedBot.id);
      } else {
        const res = await fetch(`/api/bots/${selectedBot.id}/regenerate-key`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (selectedBot) selectedBot.apiKey = data.apiKey;
        }
      }
      setShowRegenerateConfirmModal(false);
      if (addToast) addToast('success', 'Bot Key Regenerated', 'The security token for this bot was updated successfully.');
    } catch (err) {
      if (addToast) addToast('error', 'Regeneration Failed', 'Could not regenerate key.');
    } finally {
      setIsRegeneratingBotKey(false);
    }
  };

  // ---------------------------------------------------------------------------
  // API KEY HANDLERS
  // ---------------------------------------------------------------------------
  const handleCreateApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setIsCreatingKey(true);
    try {
      const res = await fetch('/api/developer/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim(),
          scopes: newKeyScopes,
          rateLimitRpm: newKeyRpm
        })
      });

      if (res.ok) {
        const createdKey: DeveloperApiKey = await res.json();
        setCreatedKeyResult(createdKey);
        setIsCreateKeyModalOpen(false);
        setNewKeyName('');
        fetchApiKeys();
        if (addToast) addToast('success', 'API Key Created', 'New developer key generated successfully.');
      } else {
        const err = await res.json();
        if (addToast) addToast('error', 'Creation Failed', err.error || 'Failed to create key');
      }
    } catch (err) {
      console.error(err);
      if (addToast) addToast('error', 'Error', 'Server connection error');
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    setActionKeyId(keyId);
    try {
      const res = await fetch(`/api/developer/api-keys/${keyId}/revoke`, { method: 'POST' });
      if (res.ok) {
        fetchApiKeys();
        if (addToast) addToast('warning', 'API Key Revoked', 'Key status set to Revoked. Requests using this key will be blocked.');
      } else {
        // Fallback delete endpoint
        await fetch(`/api/developer/api-keys/${keyId}`, { method: 'DELETE' });
        fetchApiKeys();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionKeyId(null);
    }
  };

  const handleRegenerateKey = async (keyId: string) => {
    setActionKeyId(keyId);
    try {
      const res = await fetch(`/api/developer/api-keys/${keyId}/regenerate`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCreatedKeyResult(data);
        fetchApiKeys();
        if (addToast) addToast('success', 'Key Regenerated', 'A new secret token was created. Copy it now!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionKeyId(null);
    }
  };

  const handleDeleteKey = async () => {
    if (!keyToDelete) return;
    setActionKeyId(keyToDelete.id);
    try {
      const res = await fetch(`/api/developer/api-keys/${keyToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchApiKeys();
        setKeyToDelete(null);
        if (addToast) addToast('info', 'Key Deleted', 'API key was removed permanently.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionKeyId(null);
    }
  };

  // Filtered keys
  const filteredApiKeys = apiKeys.filter(k => {
    if (keyFilterStatus !== 'all' && k.status !== keyFilterStatus) return false;
    if (searchKeyQuery && !k.name.toLowerCase().includes(searchKeyQuery.toLowerCase()) && !k.keyPrefix.toLowerCase().includes(searchKeyQuery.toLowerCase())) return false;
    return true;
  });

  // ---------------------------------------------------------------------------
  // LIVE API TESTER EXECUTOR
  // ---------------------------------------------------------------------------
  const handleRunApiTest = async () => {
    setIsExecutingTest(true);
    setTestResult(null);
    const startTime = Date.now();

    try {
      let endpointUrl = '/api/chat/message';
      let method = 'POST';
      let bodyData: any = null;

      if (testEndpoint === 'chat') {
        endpointUrl = '/api/chat/message';
        method = 'POST';
        try { bodyData = JSON.parse(testPayload); } catch { bodyData = { message: "Hello", botId: selectedBot?.id }; }
      } else if (testEndpoint === 'messages') {
        endpointUrl = '/api/messages';
        method = 'POST';
        try { bodyData = JSON.parse(testPayload); } catch { bodyData = { text: "Hello", threadId: "t1" }; }
      } else if (testEndpoint === 'chatbots') {
        endpointUrl = '/api/chatbots';
        method = 'GET';
      } else if (testEndpoint === 'conversations') {
        endpointUrl = '/api/conversations';
        method = 'GET';
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (testApiKey && testApiKey.length > 5) {
        headers['x-api-key'] = testApiKey;
      }

      const options: RequestInit = {
        method,
        headers
      };

      if (method === 'POST' && bodyData) {
        options.body = JSON.stringify(bodyData);
      }

      const response = await fetch(endpointUrl, options);
      const durationMs = Date.now() - startTime;
      const data = await response.json();

      setTestResult({
        status: response.status,
        durationMs,
        data
      });
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      setTestResult({
        status: 500,
        durationMs,
        data: { error: err.message || 'Client execution network failure' }
      });
    } finally {
      setIsExecutingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Section Header */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
                <Code size={20} />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Embed & API Integration Studio
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Deploy white-label AI widgets to any website, manage developer REST API keys, and inspect endpoint specifications.
                </p>
              </div>
            </div>
          </div>

          {/* Chatbot Selector */}
          {bots.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <Bot size={16} className="text-slate-400 ml-1" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">Active Bot:</span>
              <select
                value={selectedBot?.id || ''}
                onChange={(e) => {
                  const b = bots.find(x => x.id === e.target.value);
                  if (b && onSelectBot) onSelectBot(b);
                }}
                className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                {bots.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tab Navigation Navigation Strip */}
        <div className="flex items-center gap-1 sm:gap-2 mt-5 border-t border-slate-100 dark:border-slate-800 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('embed')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
              activeTab === 'embed'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Code size={15} />
            <span>Chatbot Embed Code</span>
          </button>

          <button
            onClick={() => setActiveTab('api_keys')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
              activeTab === 'api_keys'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Key size={15} />
            <span>Developer API Keys ({apiKeys.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
              activeTab === 'docs'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen size={15} />
            <span>API Docs & Live Tester</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: CHATBOT EMBED STUDIO                                         */}
      {/* =================================================================== */}
      {activeTab === 'embed' && selectedBot && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Embed Customizer & Code Output (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Embed Customization Controls */}
            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders size={16} className="text-blue-500" /> Embed Widget Customizer
                </h3>
                <span className="text-[10px] font-mono px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800 rounded-full font-bold">
                  ID: {selectedBot.id}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Theme Selector */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1.5">Theme Palette</label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    {(['auto', 'light', 'dark'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setEmbedTheme(t)}
                        className={`py-1.5 rounded-lg text-center capitalize font-bold text-[11px] transition-all cursor-pointer ${
                          embedTheme === t 
                            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Widget Position */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1.5">Screen Position</label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    {(['right', 'left'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setEmbedPosition(p)}
                        className={`py-1.5 rounded-lg text-center capitalize font-bold text-[11px] transition-all cursor-pointer ${
                          embedPosition === p 
                            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Bottom {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Color Accent */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1.5">Primary Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color"
                      value={embedPrimaryColor}
                      onChange={(e) => setEmbedPrimaryColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer p-0.5 bg-transparent shrink-0"
                    />
                    <div className="flex gap-1.5 flex-wrap">
                      {['#2563eb', '#10b981', '#7c3aed', '#ec4899', '#f59e0b', '#090d16'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setEmbedPrimaryColor(c)}
                          className={`w-6 h-6 rounded-full border border-white dark:border-slate-800 cursor-pointer transition-transform ${embedPrimaryColor === c ? 'scale-110 ring-2 ring-blue-500 ring-offset-1' : 'opacity-80 hover:opacity-100'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dimensions (Width / Height) */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1.5">Dimensions (W × H)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={embedWidth}
                      onChange={(e) => setEmbedWidth(e.target.value)}
                      placeholder="e.g. 400px"
                      className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
                    />
                    <input 
                      type="text"
                      value={embedHeight}
                      onChange={(e) => setEmbedHeight(e.target.value)}
                      placeholder="e.g. 600px"
                      className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* 2. Code Output & Format Switcher */}
            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Terminal size={16} className="text-emerald-500" /> Generated Embed Snippet
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Copy and paste this snippet into your target website HTML.</p>
                </div>

                {/* Embed Format Switcher */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
                  <button
                    onClick={() => setEmbedType('js')}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${embedType === 'js' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    JavaScript
                  </button>
                  <button
                    onClick={() => setEmbedType('iframe')}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${embedType === 'iframe' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    HTML Iframe
                  </button>
                  <button
                    onClick={() => setEmbedType('react')}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${embedType === 'react' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    React
                  </button>
                </div>
              </div>

              {/* Code Snippet Container */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative font-mono text-xs text-slate-300">
                <button 
                  onClick={handleCopyEmbed}
                  className="absolute top-3.5 right-3.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  {copiedEmbed ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                  <span>{copiedEmbed ? 'Copied!' : 'Copy Snippet'}</span>
                </button>
                <pre className="overflow-x-auto max-w-full leading-relaxed pr-28 whitespace-pre-wrap">
                  <code>{currentEmbedSnippet}</code>
                </pre>
              </div>

              {/* Bot Security Credentials & Key Regeneration */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Bot Embed API Token</span>
                  <div className="font-mono text-slate-700 dark:text-slate-300 font-bold flex items-center gap-2">
                    <Lock size={12} className="text-emerald-500" />
                    <span>{botApiKey.substring(0, 16)}...</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowRegenerateConfirmModal(true)}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/50 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Regenerate Security Token</span>
                </button>
              </div>

            </div>

          </div>

          {/* Right Column: Live Interactive Web Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs h-full flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Monitor size={16} className="text-purple-500" /> Live Canvas Preview
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">Interactive Simulated Site</span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Below is a real-time visual simulation showing how the floating chatbot launcher and widget window appear on client sites.
                </p>

                {/* Simulated Website Frame */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 relative h-[420px] flex flex-col shadow-inner">
                  
                  {/* Browser Bar */}
                  <div className="bg-slate-200 dark:bg-slate-900 px-3 py-2 flex items-center justify-between border-b border-slate-300 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 px-3 py-0.5 rounded-md text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                      https://client-website.com
                    </div>
                    <div className="w-4" />
                  </div>

                  {/* Simulated Site Body */}
                  <div className="p-4 flex-1 space-y-3 bg-white dark:bg-slate-950 overflow-y-auto">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded-md w-1/2" />
                    <div className="h-24 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/60 dark:border-slate-800 p-3">
                      <p className="text-[10px] text-slate-400">Sample Page Content Container...</p>
                    </div>
                  </div>

                  {/* Live Floating Chatbot Widget Launcher */}
                  <div className={`absolute bottom-3 ${embedPosition === 'left' ? 'left-3' : 'right-3'} z-30`}>
                    
                    {/* Floating Launcher Button */}
                    <button
                      type="button"
                      onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                      className="w-12 h-12 rounded-full text-white shadow-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                      style={{ backgroundColor: embedPrimaryColor }}
                    >
                      <MessageSquare size={20} />
                    </button>

                    {/* Open Simulated Chatbox Window */}
                    {isPreviewOpen && (
                      <div 
                        className={`absolute bottom-15 ${embedPosition === 'left' ? 'left-0' : 'right-0'} w-[260px] sm:w-[280px] h-[310px] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all ${embedTheme === 'dark' ? 'bg-[#0B1120] text-white' : 'bg-white text-slate-800'}`}
                      >
                        {/* Header */}
                        <div 
                          className="p-3 text-white flex items-center justify-between font-bold text-xs"
                          style={{ backgroundColor: embedPrimaryColor }}
                        >
                          <div className="flex items-center gap-2">
                            <Bot size={16} />
                            <span>{selectedBot.name}</span>
                          </div>
                          <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-mono">Live</span>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-3 space-y-2 overflow-y-auto text-[11px]">
                          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 max-w-[85%] leading-snug">
                            {selectedBot.welcomeMessage || 'Hello! How can I assist you today?'}
                          </div>
                          <div className="p-2.5 rounded-xl text-white ml-auto max-w-[85%] leading-snug" style={{ backgroundColor: embedPrimaryColor }}>
                            What are your operating hours?
                          </div>
                        </div>

                        {/* Input Box */}
                        <div className="p-2 border-t border-slate-200 dark:border-slate-800 flex gap-1.5 bg-slate-50 dark:bg-slate-900">
                          <input 
                            type="text" 
                            disabled 
                            placeholder="Type a message..." 
                            className="flex-1 text-[10px] bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700"
                          />
                          <button 
                            type="button"
                            className="p-1 rounded-md text-white" 
                            style={{ backgroundColor: embedPrimaryColor }}
                          >
                            <Send size={12} />
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              </div>

              <div className="pt-4 text-center">
                <p className="text-[11px] text-slate-400">
                  Click the floating chat icon in the preview canvas to toggle widget view.
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: DEVELOPER API KEYS MANAGEMENT SYSTEM                         */}
      {/* =================================================================== */}
      {activeTab === 'api_keys' && (
        <div className="space-y-6">
          
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold">Active API Keys</span>
                <Key size={16} className="text-blue-500" />
              </div>
              <div className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                {apiKeys.filter(k => k.status === 'active').length}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Total provisioned workspace keys</p>
            </div>

            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold">Monthly API Calls</span>
                <Zap size={16} className="text-emerald-500" />
              </div>
              <div className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                {apiKeys.reduce((acc, k) => acc + (k.requestCount || 0), 1420)}
              </div>
              <p className="text-[10px] text-emerald-500 font-semibold mt-1">✓ 100% Rate limit quota clear</p>
            </div>

            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold">Average Latency</span>
                <Activity size={16} className="text-purple-500" />
              </div>
              <div className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                118 ms
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Edge API gateway processing</p>
            </div>

            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold">Security Protocol</span>
                <Shield size={16} className="text-amber-500" />
              </div>
              <div className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                SHA-256
              </div>
              <p className="text-[10px] text-slate-400 mt-1">One-way salt & hash storage</p>
            </div>
          </div>

          {/* Action Toolbar & Filters */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input 
                type="text"
                placeholder="Search keys by name or prefix..."
                value={searchKeyQuery}
                onChange={(e) => setSearchKeyQuery(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 w-full sm:w-64"
              />

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
                {(['all', 'active', 'revoked'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setKeyFilterStatus(st)}
                    className={`px-3 py-1 text-[11px] font-bold capitalize rounded-lg transition-all cursor-pointer ${keyFilterStatus === st ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsCreateKeyModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-blue-600/20 w-full sm:w-auto justify-center shrink-0 min-h-[44px]"
            >
              <Plus size={16} />
              <span>Create New API Key</span>
            </button>
          </div>

          {/* API Keys Table */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
            {isLoadingKeys ? (
              <p className="text-center py-12 text-xs text-slate-400 font-mono">Loading developer API keys...</p>
            ) : filteredApiKeys.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Key size={36} className="mx-auto text-slate-300 dark:text-slate-700" />
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No API Keys Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Create developer REST API keys to programmatically interact with chatbots, fetch leads, and post chat messages.
                </p>
                <button
                  onClick={() => setIsCreateKeyModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                >
                  Generate Your First API Key
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4">Key Name & Prefix</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Rate Limit</th>
                      <th className="p-4">Scopes</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    {filteredApiKeys.map(key => (
                      <tr key={key.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                        
                        {/* Key Name & Prefix */}
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{key.name}</div>
                          <div className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>{key.keyPrefix}...</span>
                            <button
                              onClick={() => copyToClipboardText(key.keyPrefix, 'Prefix Copied')}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              title="Copy key prefix"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          {key.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900">
                              Revoked
                            </span>
                          )}
                        </td>

                        {/* Rate Limit */}
                        <td className="p-4 font-mono text-[11px]">
                          {key.rateLimitRpm} RPM
                        </td>

                        {/* Scopes */}
                        <td className="p-4">
                          <div className="flex gap-1 flex-wrap max-w-xs">
                            {(key.scopes || []).slice(0, 3).map(sc => (
                              <span key={sc} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-mono">
                                {sc}
                              </span>
                            ))}
                            {(key.scopes || []).length > 3 && (
                              <span className="px-1 py-0.5 text-[10px] text-slate-400 font-mono">
                                +{(key.scopes || []).length - 3} more
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Created Date */}
                        <td className="p-4 text-[11px] text-slate-400 font-mono">
                          {key.createdAt ? new Date(key.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            
                            <button
                              onClick={() => handleRegenerateKey(key.id)}
                              disabled={actionKeyId === key.id}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg cursor-pointer transition-colors"
                              title="Regenerate secret key"
                            >
                              <RefreshCw size={14} className={actionKeyId === key.id ? 'animate-spin' : ''} />
                            </button>

                            {key.status === 'active' && (
                              <button
                                onClick={() => handleRevokeKey(key.id)}
                                disabled={actionKeyId === key.id}
                                className="px-2 py-1 text-[11px] font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg cursor-pointer transition-colors"
                                title="Revoke API key"
                              >
                                Revoke
                              </button>
                            )}

                            <button
                              onClick={() => setKeyToDelete(key)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer transition-colors"
                              title="Delete key"
                            >
                              <Trash2 size={14} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: INTERACTIVE API DOCUMENTATION & LIVE TESTER                   */}
      {/* =================================================================== */}
      {activeTab === 'docs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: API Reference Specs & Language Snippets (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-500" /> REST API Endpoints Specification
                </h3>

                {/* Language Switcher */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  {(['curl', 'js', 'python', 'php'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setDocLanguage(lang)}
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${docLanguage === lang ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Endpoint Tab Selector */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'chat', method: 'POST', path: '/api/chat', label: 'Send AI Chat' },
                  { id: 'messages', method: 'POST', path: '/api/messages', label: 'Post Message' },
                  { id: 'chatbots', method: 'GET', path: '/api/chatbots', label: 'List Chatbots' },
                  { id: 'conversations', method: 'GET', path: '/api/conversations', label: 'List Sessions' }
                ].map(ep => (
                  <button
                    key={ep.id}
                    onClick={() => setSelectedDocEndpoint(ep.id as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                      selectedDocEndpoint === ep.id 
                        ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-xs' 
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {ep.method}
                    </span>
                    <span>{ep.label}</span>
                  </button>
                ))}
              </div>

              {/* Code Snippet Box according to selected endpoint & language */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative font-mono text-xs text-slate-300">
                <button 
                  onClick={() => {
                    let code = '';
                    const url = `${getOrigin()}/api/${selectedDocEndpoint === 'chat' ? 'chat/message' : selectedDocEndpoint}`;
                    if (docLanguage === 'curl') {
                      code = `curl -X ${selectedDocEndpoint === 'chatbots' || selectedDocEndpoint === 'conversations' ? 'GET' : 'POST'} "${url}" \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: sk_live_your_key_here"`;
                    }
                    copyToClipboardText(code, 'Code Copied');
                  }}
                  className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy Code"
                >
                  <Copy size={14} />
                </button>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-blue-400 font-bold border-b border-slate-800 pb-2">
                    <span>{selectedDocEndpoint === 'chatbots' || selectedDocEndpoint === 'conversations' ? 'GET' : 'POST'}</span>
                    <span className="text-slate-300">{getOrigin()}/api/{selectedDocEndpoint === 'chat' ? 'chat/message' : selectedDocEndpoint}</span>
                  </div>

                  <pre className="overflow-x-auto text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap">
                    <code>
                      {docLanguage === 'curl' && `curl -X ${selectedDocEndpoint === 'chatbots' || selectedDocEndpoint === 'conversations' ? 'GET' : 'POST'} "${getOrigin()}/api/${selectedDocEndpoint === 'chat' ? 'chat/message' : selectedDocEndpoint}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: sk_live_your_api_key"` + (selectedDocEndpoint === 'chat' ? ` \\
  -d '{"message": "Hello AI!", "botId": "${selectedBot?.id || 'bot-default'}"}'` : '')}

                      {docLanguage === 'js' && `const response = await fetch('${getOrigin()}/api/${selectedDocEndpoint === 'chat' ? 'chat/message' : selectedDocEndpoint}', {
  method: '${selectedDocEndpoint === 'chatbots' || selectedDocEndpoint === 'conversations' ? 'GET' : 'POST'}',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'sk_live_your_api_key'
  }` + (selectedDocEndpoint === 'chat' ? `,\n  body: JSON.stringify({\n    message: "Hello AI!",\n    botId: "${selectedBot?.id || 'bot-default'}"\n  })` : '') + `
});
const data = await response.json();`}

                      {docLanguage === 'python' && `import requests

url = "${getOrigin()}/api/${selectedDocEndpoint === 'chat' ? 'chat/message' : selectedDocEndpoint}"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "sk_live_your_api_key"
}
` + (selectedDocEndpoint === 'chat' ? `payload = {"message": "Hello AI!", "botId": "${selectedBot?.id || 'bot-default'}"}\nresponse = requests.post(url, json=payload, headers=headers)` : `response = requests.get(url, headers=headers)`) + `
print(response.json())`}

                      {docLanguage === 'php' && `<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "${getOrigin()}/api/${selectedDocEndpoint === 'chat' ? 'chat/message' : selectedDocEndpoint}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json',
  'x-api-key: sk_live_your_api_key'
]);
$result = curl_exec($ch);
curl_close($ch);
?>`}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Sample Response Payload */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Expected Response Payload (200 OK):</h4>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                  <pre>
                    {selectedDocEndpoint === 'chat' && JSON.stringify({
                      success: true,
                      botId: selectedBot?.id || "bot-default",
                      threadId: "thread-uuid-123",
                      reply: "Hello! I am your AI Assistant. How can I help you today?",
                      timestamp: new Date().toISOString()
                    }, null, 2)}

                    {selectedDocEndpoint === 'messages' && JSON.stringify({
                      success: true,
                      messageId: "msg-uuid-456",
                      threadId: "thread-uuid-123",
                      text: "Customer message appended.",
                      createdAt: new Date().toISOString()
                    }, null, 2)}

                    {selectedDocEndpoint === 'chatbots' && JSON.stringify([
                      { id: selectedBot?.id || "bot-default", name: selectedBot?.name || "Support Bot", status: "active" }
                    ], null, 2)}

                    {selectedDocEndpoint === 'conversations' && JSON.stringify([
                      { id: "thread-123", chatbotId: selectedBot?.id || "bot-default", messageCount: 5, createdAt: new Date().toISOString() }
                    ], null, 2)}
                  </pre>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Interactive Live API Test Runner (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Play size={16} className="text-emerald-500" /> Live Endpoint Tester
                </h3>
                <span className="text-[10px] text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800">
                  Interactive Sandbox
                </span>
              </div>

              {/* Endpoint Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Target Endpoint</label>
                <select
                  value={testEndpoint}
                  onChange={(e) => setTestEndpoint(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-800 dark:text-white font-mono focus:outline-none"
                >
                  <option value="chat">POST /api/chat/message (Send AI Chat)</option>
                  <option value="messages">POST /api/messages (Add Message)</option>
                  <option value="chatbots">GET /api/chatbots (List Chatbots)</option>
                  <option value="conversations">GET /api/conversations (List Threads)</option>
                </select>
              </div>

              {/* API Key Header Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">x-api-key Header</label>
                <input 
                  type="text"
                  value={testApiKey}
                  onChange={(e) => setTestApiKey(e.target.value)}
                  placeholder="sk_live_..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-800 dark:text-white font-mono focus:outline-none"
                />
              </div>

              {/* JSON Request Body */}
              {(testEndpoint === 'chat' || testEndpoint === 'messages') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">JSON Payload</label>
                  <textarea
                    rows={5}
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs p-3 rounded-xl text-slate-200 font-mono focus:outline-none leading-relaxed"
                  />
                </div>
              )}

              {/* Execute Button */}
              <button
                type="button"
                onClick={handleRunApiTest}
                disabled={isExecutingTest}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer min-h-[44px]"
              >
                {isExecutingTest ? <RefreshCw size={15} className="animate-spin" /> : <Play size={15} />}
                <span>{isExecutingTest ? 'Executing API Request...' : 'Send Live Request'}</span>
              </button>

              {/* Execution Result Output */}
              {testResult && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold font-mono">
                    <span className={testResult.status >= 200 && testResult.status < 300 ? 'text-emerald-500' : 'text-rose-500'}>
                      Status: {testResult.status} {testResult.status === 200 ? 'OK' : 'Response Error'}
                    </span>
                    <span className="text-slate-400">{testResult.durationMs} ms</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-60">
                    <pre>{JSON.stringify(testResult.data, null, 2)}</pre>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: CREATE NEW API KEY                                          */}
      {/* =================================================================== */}
      {isCreateKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Key size={18} className="text-blue-500" /> Create Developer REST API Key
              </h3>
              <button onClick={() => setIsCreateKeyModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateApiKeySubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Key Name / Description</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Production CRM Connector"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium min-h-[44px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Scope Permissions</label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {availableScopes.map(sc => (
                    <label key={sc.id} className="flex items-start gap-2.5 p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/60 dark:border-slate-800 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={newKeyScopes.includes(sc.id)}
                        onChange={() => {
                          if (newKeyScopes.includes(sc.id)) {
                            setNewKeyScopes(newKeyScopes.filter(x => x !== sc.id));
                          } else {
                            setNewKeyScopes([...newKeyScopes, sc.id]);
                          }
                        }}
                        className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{sc.label}</span>
                        <span className="text-[10px] text-slate-400 block">{sc.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Rate Limit (Requests per Minute)</label>
                <select
                  value={newKeyRpm}
                  onChange={(e) => setNewKeyRpm(parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-slate-800 dark:text-white font-mono min-h-[44px]"
                >
                  <option value={60}>60 RPM (Standard Rate Limit)</option>
                  <option value={120}>120 RPM (Pro Rate Limit)</option>
                  <option value={600}>600 RPM (High Throughput Enterprise)</option>
                  <option value={1200}>1200 RPM (Unlimited Partner)</option>
                </select>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateKeyModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-100 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingKey}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 min-h-[44px]"
                >
                  {isCreatingKey ? <RefreshCw size={14} className="animate-spin" /> : <Key size={14} />}
                  <span>Generate Key</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: DISPLAY FULL CREATED KEY (SHOWN ONCE)                        */}
      {/* =================================================================== */}
      {createdKeyResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 my-auto">
            
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <div className="p-3 bg-emerald-500/10 rounded-2xl">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">API Key Created Successfully</h3>
                <p className="text-xs text-slate-500">Save your API key secret immediately. You will not be able to view it again.</p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>For security reasons, this secret key is hashed and stored safely. Store it in an environment variable on your backend server.</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Secret API Token</span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-emerald-400 break-all select-all">
                  {createdKeyResult.fullKey || createdKeyResult.keyPrefix + '...'}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(createdKeyResult.fullKey || '');
                    setCopiedFullKey(true);
                    setTimeout(() => setCopiedFullKey(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedFullKey ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedFullKey ? 'Copied!' : 'Copy Key'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setCreatedKeyResult(null)}
                className="px-6 py-2.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-800 cursor-pointer min-h-[44px]"
              >
                Done / I Have Saved My Key
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: CONFIRM REGENERATE BOT KEY                                   */}
      {/* =================================================================== */}
      {showRegenerateConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 my-auto text-xs">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle size={22} />
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Regenerate Chatbot API Token?</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Regenerating this security token will invalidate the previous API key for bot <strong>"{selectedBot?.name}"</strong>. Any external website or backend integration currently using the old key will stop functioning until updated.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRegenerateConfirmModal(false)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegenerateBotKeySubmit}
                disabled={isRegeneratingBotKey}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                {isRegeneratingBotKey ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                <span>Regenerate Key Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: CONFIRM DELETE API KEY                                       */}
      {/* =================================================================== */}
      {keyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 my-auto text-xs">
            <div className="flex items-center gap-3 text-rose-500">
              <Trash2 size={22} />
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Delete API Key?</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete API key <strong>"{keyToDelete.name}"</strong>? This action cannot be undone and API access using this key will be permanently terminated.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setKeyToDelete(null)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteKey}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <Trash2 size={14} />
                <span>Delete Key</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
