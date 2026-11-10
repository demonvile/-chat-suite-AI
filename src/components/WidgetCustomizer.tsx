import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bot, Layout, Database, Sparkles, Plus, Trash2, Save, 
  RefreshCw, PlusCircle, Globe, FileText, ChevronRight, Check,
  Undo2, Redo2, RotateCcw, Code2, Image as ImageIcon, Upload, 
  Download, Eye, AlertTriangle, Smartphone, Tablet, Monitor, 
  Sun, Moon, History, FileCode, Copy, Power, X, Layers,
  CheckCircle2, AlertCircle, HelpCircle, ArrowUpRight
} from 'lucide-react';
import { ChatbotConfig, ChatbotVersion, FAQ } from '../types';
import { ChatbotWidget } from './ChatbotWidget';

interface WidgetCustomizerProps {
  config: ChatbotConfig;
  onSave: (updated: ChatbotConfig) => Promise<void>;
  onDeleteBot?: (botId: string, options?: { permanent?: boolean; purgeKb?: boolean; purgeHistory?: boolean }) => Promise<void>;
  onDuplicateBot?: (config: ChatbotConfig) => Promise<ChatbotConfig | void>;
}

// Preset High-Quality Avatars
const PRESET_AVATARS = [
  { id: 'spark', name: 'AI Spark', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80' },
  { id: 'agent-f', name: 'Support Agent (Female)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80' },
  { id: 'agent-m', name: 'Support Agent (Male)', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80' },
  { id: 'friendly', name: 'Friendly Helper', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
  { id: 'tech', name: 'Tech Specialist', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
  { id: 'bot-vector', name: 'Minimal Bot', url: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=120&auto=format&fit=crop&q=80' },
  { id: 'cyber', name: 'Cyber Blue', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=120&auto=format&fit=crop&q=80' },
  { id: 'executive', name: 'Executive Assistant', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80' },
];

const PRESET_COLORS = [
  { name: 'Teal Teal', value: '#0f766e' },
  { name: 'Deep Blue', value: '#1e3a8a' },
  { name: 'Emerald', value: '#047857' },
  { name: 'Vibrant Indigo', value: '#4f46e5' },
  { name: 'Slate Gray', value: '#334155' },
  { name: 'Warm Crimson', value: '#be123c' },
  { name: 'Sunset Orange', value: '#c2410c' }
];

// Quick CSS Templates
const CSS_TEMPLATES = [
  {
    name: 'Glassmorphism Backdrop',
    css: `#chatbot-widget-container {\n  backdrop-filter: blur(12px);\n  background-color: rgba(15, 23, 42, 0.85) !important;\n  border: 1px solid rgba(255, 255, 255, 0.15) !important;\n}`
  },
  {
    name: 'Neon Accent Border',
    css: `#chatbot-widget-container {\n  box-shadow: 0 0 20px rgba(79, 70, 229, 0.4), 0 0 40px rgba(15, 118, 110, 0.2) !important;\n  border: 1.5px solid #4f46e5 !important;\n}`
  },
  {
    name: 'Pill Launcher & Rounded Header',
    css: `#chatbot-widget-launcher {\n  border-radius: 9999px !important;\n  padding: 18px 24px !important;\n}\n#chatbot-widget-container {\n  border-radius: 28px !important;\n}`
  },
  {
    name: 'Compact Minimal Height',
    css: `#chatbot-widget-container {\n  height: 480px !important;\n  width: 360px !important;\n}`
  }
];

// Quick JS Event Templates
const JS_TEMPLATES = [
  {
    name: 'Google Analytics Tracking',
    code: `// Fires on chat widget open\nwindow.addEventListener('chat_widget_open', function(e) {\n  if (window.gtag) {\n    gtag('event', 'chat_opened', { bot_id: e.detail.botId });\n  }\n});`
  },
  {
    name: 'Auto-Open After 5 Seconds',
    code: `// Automatically expands chat after 5s\nsetTimeout(function() {\n  var launcher = document.getElementById('chatbot-widget-launcher');\n  if (launcher) launcher.click();\n}, 5000);`
  },
  {
    name: 'Confetti on Lead Submit',
    code: `// Triggers custom action on lead submission\nwindow.addEventListener('lead_submitted', function(e) {\n  console.log('Lead captured successfully:', e.detail.email);\n});`
  }
];

export const WidgetCustomizer: React.FC<WidgetCustomizerProps> = ({
  config,
  onSave,
  onDeleteBot,
  onDuplicateBot
}) => {
  // Navigation & View Mode states
  const [activeSubTab, setActiveSubTab] = useState<
    'branding' | 'media' | 'knowledge' | 'leads' | 'ai' | 'css' | 'js' | 'history' | 'danger'
  >('branding');
  
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewBgTheme, setPreviewBgTheme] = useState<'light' | 'dark'>('light');

  // Draft Config State
  const [draft, setDraft] = useState<ChatbotConfig>({ ...config });
  
  // Save State Tracking
  const [savedConfig, setSavedConfig] = useState<ChatbotConfig>({ ...config });
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty' | 'error'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Undo / Redo History Stack
  const [historyStack, setHistoryStack] = useState<ChatbotConfig[]>([{ ...config }]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isUndoRedoAction = useRef<boolean>(false);

  // Modals
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [showEmbedCodeModal, setShowEmbedCodeModal] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Form Validation Errors
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Local interaction states
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapedTitle, setScrapedTitle] = useState('');
  const [dragOverTarget, setDragOverTarget] = useState<'logo' | 'avatar' | null>(null);

  // File Input Refs
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if prop config changes externally
  useEffect(() => {
    if (config.id !== draft.id) {
      setDraft({ ...config });
      setSavedConfig({ ...config });
      setHistoryStack([{ ...config }]);
      setHistoryIndex(0);
      setSaveStatus('saved');
    }
  }, [config]);

  // Form Validation Engine
  const validateForm = useCallback((c: ChatbotConfig): string[] => {
    const errs: string[] = [];
    if (!c.name || !c.name.trim()) errs.push('Bot reference name is required.');
    if (!c.botName || !c.botName.trim()) errs.push('Bot visual display name is required.');
    if (!c.welcomeMessage || !c.welcomeMessage.trim()) errs.push('Welcome message cannot be empty.');
    if (!c.primaryColor || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(c.primaryColor)) {
      errs.push('Primary color must be a valid Hex color code (e.g. #0f766e).');
    }
    if (c.customJs && c.customJs.trim()) {
      try {
        new Function(c.customJs);
      } catch (e: any) {
        errs.push(`Custom JavaScript syntax error: ${e.message}`);
      }
    }
    return errs;
  }, []);

  // Update Draft Helper with History Tracking
  const updateDraft = useCallback((updater: (prev: ChatbotConfig) => ChatbotConfig) => {
    setDraft((prev) => {
      const next = updater(prev);
      
      // Validation Check
      const errs = validateForm(next);
      setValidationErrors(errs);

      // If this change came from Undo/Redo, don't push duplicate to history stack
      if (!isUndoRedoAction.current) {
        setHistoryStack((stack) => {
          const newStack = stack.slice(0, historyIndex + 1);
          return [...newStack, next];
        });
        setHistoryIndex((idx) => idx + 1);
      } else {
        isUndoRedoAction.current = false;
      }

      setSaveStatus('dirty');
      return next;
    });
  }, [historyIndex, validateForm]);

  // Undo Handler
  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const prevConfig = historyStack[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setDraft(prevConfig);
      setValidationErrors(validateForm(prevConfig));
      setSaveStatus('dirty');
    }
  };

  // Redo Handler
  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      isUndoRedoAction.current = true;
      const nextConfig = historyStack[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setDraft(nextConfig);
      setValidationErrors(validateForm(nextConfig));
      setSaveStatus('dirty');
    }
  };

  // Keyboard Shortcuts (Cmd+Z / Ctrl+Z, Cmd+Shift+Z / Ctrl+Y, Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveNow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, historyStack, draft]);

  // Save Handler
  const handleSaveNow = async () => {
    const errs = validateForm(draft);
    if (errs.length > 0) {
      setValidationErrors(errs);
      return;
    }

    setSaveStatus('saving');
    try {
      await onSave(draft);
      setSavedConfig(draft);
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      setSaveStatus('error');
    }
  };

  // Auto-Save Debouncer (1200ms)
  useEffect(() => {
    if (saveStatus !== 'dirty' || validationErrors.length > 0) return;

    const timer = setTimeout(() => {
      handleSaveNow();
    }, 1200);

    return () => clearTimeout(timer);
  }, [draft, saveStatus, validationErrors]);

  // Warn before browser unload if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'dirty') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  // Image Upload Handler (Logo & Avatar)
  const handleFileUpload = (file: File, target: 'logo' | 'avatar') => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, SVG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (target === 'logo') {
        updateDraft((prev) => ({ ...prev, logoUrl: result }));
      } else {
        updateDraft((prev) => ({ ...prev, avatarUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent, target: 'logo' | 'avatar') => {
    e.preventDefault();
    setDragOverTarget(target);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTarget(null);
  };

  const handleDrop = (e: React.DragEvent, target: 'logo' | 'avatar') => {
    e.preventDefault();
    setDragOverTarget(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], target);
    }
  };

  // FAQ CRUD
  const addFAQ = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const item: FAQ = {
      id: 'faq-' + Date.now(),
      question: newQuestion.trim(),
      answer: newAnswer.trim()
    };
    updateDraft((prev) => ({ ...prev, faqs: [...(prev.faqs || []), item] }));
    setNewQuestion('');
    setNewAnswer('');
  };

  const removeFAQ = (id: string) => {
    updateDraft((prev) => ({ ...prev, faqs: (prev.faqs || []).filter((f) => f.id !== id) }));
  };

  // URL CRUD & Scraping
  const addUrl = () => {
    if (!newUrl.trim() || (draft.knowledgeUrls || []).includes(newUrl.trim())) return;
    updateDraft((prev) => ({ ...prev, knowledgeUrls: [...(prev.knowledgeUrls || []), newUrl.trim()] }));
    setNewUrl('');
  };

  const removeUrl = (url: string) => {
    updateDraft((prev) => ({ ...prev, knowledgeUrls: (prev.knowledgeUrls || []).filter((u) => u !== url) }));
  };

  const handleScrapeUrl = async () => {
    if (!newUrl.trim()) return;
    setScraping(true);
    setScrapedTitle('');
    try {
      const res = await fetch('/api/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl.trim() })
      });
      if (res.ok) {
        const d = await res.json();
        setScrapedTitle(d.title);
        updateDraft((prev) => {
          const currentText = prev.knowledgeText || '';
          const separator = currentText ? '\n\n' : '';
          const newText = currentText + separator + `[TRAINED SOURCE: ${d.title} - ${newUrl.trim()}]\n${d.text}`;
          const currentUrls = prev.knowledgeUrls || [];
          const newUrls = currentUrls.includes(newUrl.trim()) ? currentUrls : [...currentUrls, newUrl.trim()];
          return { ...prev, knowledgeText: newText, knowledgeUrls: newUrls };
        });
        setNewUrl('');
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to crawl website page.');
      }
    } catch (err) {
      alert('Error connecting to link indexing service.');
    } finally {
      setScraping(false);
    }
  };

  // Lead Fields Toggle
  const toggleLeadField = (field: 'name' | 'email' | 'phone') => {
    updateDraft((prev) => {
      const current = prev.leadFields || ['name', 'email'];
      const next = current.includes(field) ? current.filter((f) => f !== field) : [...current, field];
      return { ...prev, leadFields: next };
    });
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(draft, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `chatbot-${draft.botName.toLowerCase().replace(/\s+/g, '-')}-config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Handler
  const handleImportJsonSubmit = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.botName && !parsed.name) {
        setImportError('Invalid configuration JSON: Missing botName field.');
        return;
      }
      // Merge with current ID
      const newConfig: ChatbotConfig = {
        ...draft,
        ...parsed,
        id: draft.id
      };
      updateDraft(() => newConfig);
      setShowImportModal(false);
      setImportJsonText('');
      setImportError('');
    } catch (e: any) {
      setImportError(`JSON Parse Error: ${e.message}`);
    }
  };

  // Reset to Defaults
  const handleResetToDefaults = () => {
    const defaultConfig: ChatbotConfig = {
      ...draft,
      name: draft.name,
      botName: 'AI Assistant',
      welcomeMessage: 'Hello! How can I assist you today?',
      placeholderText: 'Type a message...',
      primaryColor: '#0f766e',
      theme: 'light',
      position: 'right',
      language: 'en',
      faqs: [],
      knowledgeText: '',
      knowledgeUrls: [],
      leadFields: ['name', 'email'],
      showLeadOnStart: false,
      temperature: 0.7,
      customSystemInstruction: '',
      logoUrl: '',
      avatarUrl: '',
      customCss: '',
      customJs: '',
      isActive: true
    };
    updateDraft(() => defaultConfig);
    setShowResetModal(false);
  };

  // Create Snapshot
  const handleCreateSnapshot = () => {
    if (!snapshotLabel.trim()) return;
    const historyList = draft.versionHistory || [];
    const newVersion: ChatbotVersion = {
      id: 'ver-' + Date.now(),
      versionNumber: historyList.length + 1,
      label: snapshotLabel.trim(),
      createdAt: new Date().toISOString(),
      configSummary: `Primary Color: ${draft.primaryColor}, FAQs: ${(draft.faqs || []).length}, Active: ${draft.isActive ? 'Yes' : 'No'}`,
      config: { ...draft }
    };
    updateDraft((prev) => ({
      ...prev,
      versionHistory: [newVersion, ...(prev.versionHistory || [])]
    }));
    setShowSnapshotModal(false);
    setSnapshotLabel('');
  };

  // Restore Snapshot
  const handleRestoreSnapshot = (v: ChatbotVersion) => {
    if (confirm(`Restore configuration from Snapshot Version #${v.versionNumber} ("${v.label}")?`)) {
      updateDraft(() => ({
        ...v.config,
        id: draft.id,
        versionHistory: draft.versionHistory
      }));
    }
  };

  // Embed Code Generator
  const embedScriptCode = `<script \n  src="${window.location.origin}/embed.js" \n  data-bot-id="${draft.id}" \n  async\n></script>`;

  return (
    <div className="space-y-6">
      
      {/* ------------------------------------------------------------------- */}
      {/* 1. TOP HEADER & TOOLBAR */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Bot Title & Status Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  {draft.name || 'Chatbot Editor'}
                </h2>

                {/* Publish / Unpublish Toggle Badge */}
                <button
                  onClick={() => updateDraft((prev) => ({ ...prev, isActive: !prev.isActive }))}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    draft.isActive
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  }`}
                  title="Click to toggle Published / Draft status"
                >
                  <span className={`w-2 h-2 rounded-full ${draft.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {draft.isActive ? 'Published' : 'Draft / Unpublished'}
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ref ID: <span className="font-mono text-[11px] text-slate-400">{draft.id}</span>
              </p>
            </div>
          </div>

          {/* Action Tools & Status Indicator */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Auto-Save Indicator Badge */}
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2 text-xs font-medium">
              {saveStatus === 'saving' && (
                <>
                  <RefreshCw size={13} className="animate-spin text-blue-500" />
                  <span className="text-slate-600 dark:text-slate-400">Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-300">Saved ({lastSavedTime})</span>
                </>
              )}
              {saveStatus === 'dirty' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">Unsaved changes...</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle size={14} className="text-rose-500" />
                  <span className="text-rose-500 font-semibold">Save failed</span>
                </>
              )}
            </div>

            {/* Undo / Redo */}
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-[#0F172A]">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={15} />
              </button>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
              <button
                onClick={handleRedo}
                disabled={historyIndex >= historyStack.length - 1}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer transition-colors"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 size={15} />
              </button>
            </div>

            {/* Embed Code Button */}
            <button
              onClick={() => setShowEmbedCodeModal(true)}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border border-slate-250 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Code2 size={14} /> Embed
            </button>

            {/* Duplicate Button */}
            {onDuplicateBot && (
              <button
                onClick={() => onDuplicateBot(draft)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border border-slate-250 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                title="Create a copy of this chatbot"
              >
                <Copy size={14} /> Duplicate
              </button>
            )}

            {/* Export JSON */}
            <button
              onClick={handleExportJson}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border border-slate-250 dark:border-slate-700 rounded-xl text-xs cursor-pointer transition-all"
              title="Export Config JSON"
            >
              <Download size={15} />
            </button>

            {/* Import JSON */}
            <button
              onClick={() => setShowImportModal(true)}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border border-slate-250 dark:border-slate-700 rounded-xl text-xs cursor-pointer transition-all"
              title="Import Config JSON"
            >
              <Upload size={15} />
            </button>

            {/* Manual Save Button */}
            <button
              onClick={handleSaveNow}
              disabled={saveStatus === 'saving'}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/15 disabled:opacity-50 transition-all"
            >
              {saveStatus === 'saving' ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              {saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Validation Errors Banner if Any */}
        {validationErrors.length > 0 && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-700 dark:text-rose-300 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle size={15} className="text-rose-600" /> Form Validation Issues:
            </p>
            <ul className="list-disc ml-5 space-y-0.5">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Mobile View Toggle Switch */}
        <div className="lg:hidden flex items-center border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-slate-50 dark:bg-[#0F172A]">
          <button
            onClick={() => setMobileView('editor')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mobileView === 'editor'
                ? 'bg-white dark:bg-[#0B1120] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            ⚙️ Customizer Controls
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mobileView === 'preview'
                ? 'bg-white dark:bg-[#0B1120] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            👁️ Live Widget Preview
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. SPLIT LAYOUT: EDITOR CONTROLS + LIVE PREVIEW */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CUSTOMIZER CONTROLS */}
        <div className={`lg:col-span-7 space-y-4 ${mobileView === 'preview' ? 'hidden lg:block' : ''}`}>
          
          {/* Sub-Tab Navigation Bar */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-2 rounded-2xl">
            <button
              onClick={() => setActiveSubTab('branding')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeSubTab === 'branding'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layout size={14} /> Branding
            </button>

            <button
              onClick={() => setActiveSubTab('media')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeSubTab === 'media'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ImageIcon size={14} /> Logo & Avatar
            </button>

            <button
              onClick={() => setActiveSubTab('knowledge')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeSubTab === 'knowledge'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Database size={14} /> Knowledge
            </button>

            <button
              onClick={() => setActiveSubTab('leads')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeSubTab === 'leads'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bot size={14} /> Lead Rules
            </button>

            <button
              onClick={() => setActiveSubTab('ai')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeSubTab === 'ai'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles size={14} /> AI Agent
            </button>

            <button
              onClick={() => setActiveSubTab('css')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeSubTab === 'css'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileCode size={14} /> Custom CSS
            </button>

            <button
              onClick={() => setActiveSubTab('js')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeSubTab === 'js'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Code2 size={14} /> Custom JS
            </button>

            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeSubTab === 'history'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <History size={14} /> History
            </button>

            <button
              onClick={() => setActiveSubTab('danger')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                activeSubTab === 'danger'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
              }`}
            >
              <AlertTriangle size={14} /> Danger Zone
            </button>
          </div>

          {/* Form Content Body */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-6 shadow-xs">
            
            {/* --------------------------------------------------------------- */}
            {/* SUB-TAB 1: BRANDING & VISUALS */}
            {/* --------------------------------------------------------------- */}
            {activeSubTab === 'branding' && (
              <div className="space-y-5">
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  Branding & Conversational Greetings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Internal Reference Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(e) => updateDraft((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Website Sales Assistant"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Bot Visual Display Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={draft.botName}
                      onChange={(e) => updateDraft((prev) => ({ ...prev, botName: e.target.value }))}
                      placeholder="e.g. Acme Bot"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Welcome Message Greeting <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={draft.welcomeMessage}
                      onChange={(e) => updateDraft((prev) => ({ ...prev, welcomeMessage: e.target.value }))}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 dark:text-slate-100 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Chat Input Field Placeholder
                    </label>
                    <input
                      type="text"
                      value={draft.placeholderText}
                      onChange={(e) => updateDraft((prev) => ({ ...prev, placeholderText: e.target.value }))}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Primary Theme Colors */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                    Widget Primary Accent Color
                  </label>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => updateDraft((prev) => ({ ...prev, primaryColor: col.value }))}
                        style={{ backgroundColor: col.value }}
                        title={col.name}
                        className={`w-7 h-7 rounded-full cursor-pointer border-2 transition-transform ${
                          draft.primaryColor === col.value
                            ? 'border-slate-900 dark:border-white scale-125'
                            : 'border-transparent hover:scale-110'
                        }`}
                      />
                    ))}

                    <div className="flex items-center gap-2 ml-3 border-l border-slate-200 dark:border-slate-800 pl-3">
                      <span className="text-[10px] text-slate-400 font-mono">Custom Hex:</span>
                      <input
                        type="color"
                        value={draft.primaryColor}
                        onChange={(e) => updateDraft((prev) => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={draft.primaryColor}
                        onChange={(e) => updateDraft((prev) => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-20 text-xs px-2 py-1 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Theme, Language, Placement */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Floating Position
                    </label>
                    <select
                      value={draft.position}
                      onChange={(e) => updateDraft((prev) => ({ ...prev, position: e.target.value as 'right' | 'left' }))}
                      className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="right">Floating Bottom Right</option>
                      <option value="left">Floating Bottom Left</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Widget Theme Mode
                    </label>
                    <select
                      value={draft.theme}
                      onChange={(e) => updateDraft((prev) => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
                      className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="light">Crisp Light Mode</option>
                      <option value="dark">Professional Dark Mode</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Default Language
                    </label>
                    <select
                      value={draft.language}
                      onChange={(e) => updateDraft((prev) => ({ ...prev, language: e.target.value }))}
                      className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="en">English (US/UK)</option>
                      <option value="es">Español (Spanish)</option>
                      <option value="fr">Français (French)</option>
                      <option value="de">Deutsch (German)</option>
                      <option value="ja">日本語 (Japanese)</option>
                      <option value="zh">中文 (Chinese)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------- */}
            {/* SUB-TAB 2: LOGO & AVATAR UPLOAD */}
            {/* --------------------------------------------------------------- */}
            {activeSubTab === 'media' && (
              <div className="space-y-6">
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  Company Logo & Chatbot Avatar
                </h3>

                {/* Company Logo Drag & Drop */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Company Header Logo
                  </label>
                  <div
                    onDragOver={(e) => handleDragOver(e, 'logo')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'logo')}
                    className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all ${
                      dragOverTarget === 'logo'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172A]/50'
                    }`}
                  >
                    {draft.logoUrl ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={draft.logoUrl} alt="Company Logo" className="max-h-12 object-contain bg-slate-100 dark:bg-slate-800 p-2 rounded-xl" />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => logoFileInputRef.current?.click()}
                            className="text-xs text-blue-600 hover:underline font-semibold"
                          >
                            Replace Logo
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => updateDraft((prev) => ({ ...prev, logoUrl: '' }))}
                            className="text-xs text-rose-500 hover:underline font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
                          <Upload size={18} />
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Drag & Drop company logo here or <span className="text-blue-600 cursor-pointer underline" onClick={() => logoFileInputRef.current?.click()}>Browse</span>
                        </p>
                        <p className="text-[10px] text-slate-400">PNG, JPG, SVG or WEBP (Max 5MB)</p>
                      </div>
                    )}
                    <input
                      ref={logoFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                    />
                  </div>
                </div>

                {/* Avatar Drag & Drop */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Chatbot Widget Avatar Image
                  </label>
                  <div
                    onDragOver={(e) => handleDragOver(e, 'avatar')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'avatar')}
                    className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all ${
                      dragOverTarget === 'avatar'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172A]/50'
                    }`}
                  >
                    {draft.avatarUrl ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={draft.avatarUrl} alt="Bot Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-sm" />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => avatarFileInputRef.current?.click()}
                            className="text-xs text-blue-600 hover:underline font-semibold"
                          >
                            Upload Custom
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => updateDraft((prev) => ({ ...prev, avatarUrl: '' }))}
                            className="text-xs text-rose-500 hover:underline font-semibold"
                          >
                            Remove Custom
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
                          <ImageIcon size={18} />
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Upload custom bot avatar image or pick a preset below
                        </p>
                        <button
                          type="button"
                          onClick={() => avatarFileInputRef.current?.click()}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                        >
                          Upload File
                        </button>
                      </div>
                    )}
                    <input
                      ref={avatarFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'avatar')}
                    />
                  </div>

                  {/* Preset Avatar Gallery */}
                  <div className="pt-3">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                      Or Choose From High-Quality Preset Avatars
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {PRESET_AVATARS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => updateDraft((prev) => ({ ...prev, avatarUrl: item.url }))}
                          className={`p-1 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            draft.avatarUrl === item.url
                              ? 'border-blue-600 bg-blue-500/10 scale-105'
                              : 'border-slate-200 dark:border-slate-800 hover:border-blue-300'
                          }`}
                          title={item.name}
                        >
                          <img src={item.url} alt={item.name} className="w-9 h-9 rounded-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------- */}
            {/* SUB-TAB 3: AI KNOWLEDGE TRAINING */}
            {/* --------------------------------------------------------------- */}
            {activeSubTab === 'knowledge' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                    <Database size={15} className="text-blue-500" /> Ground-Truth FAQ Training Base
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 mb-4">
                    Add structured Q&A pairs for precision accuracy.
                  </p>

                  <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3 mb-4">
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <PlusCircle size={13} /> Add New Ground FAQ Pair
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Visitor Question (e.g. What are your hours?)"
                        className="w-full text-xs px-3.5 py-2.5 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                      />
                      <input
                        type="text"
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        placeholder="Your Precise Answer"
                        className="w-full text-xs px-3.5 py-2.5 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addFAQ}
                      disabled={!newQuestion.trim() || !newAnswer.trim()}
                      className="px-3.5 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40 transition-colors"
                    >
                      <Plus size={13} /> Add FAQ Pair
                    </button>
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {(draft.faqs || []).length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No FAQs added yet.</p>
                    ) : (
                      (draft.faqs || []).map((f) => (
                        <div key={f.id} className="p-3 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl flex items-start justify-between">
                          <div className="text-xs space-y-1">
                            <p className="font-bold text-slate-800 dark:text-slate-200">Q: {f.question}</p>
                            <p className="text-slate-500 dark:text-slate-400">A: {f.answer}</p>
                          </div>
                          <button onClick={() => removeFAQ(f.id)} className="text-slate-400 hover:text-rose-500 p-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      General Company Instruction Materials
                    </label>
                    <textarea
                      rows={5}
                      value={draft.knowledgeText || ''}
                      onChange={(e) => updateDraft((prev) => ({ ...prev, knowledgeText: e.target.value }))}
                      placeholder="Paste policies, product details, or custom context..."
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 dark:text-slate-100 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Indexed Website URLs
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                          placeholder="https://company.com/pricing"
                          className="flex-1 text-xs px-3.5 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={addUrl}
                          disabled={!newUrl.trim()}
                          className="px-3 py-2 bg-slate-200 dark:bg-slate-800 text-xs font-semibold rounded-xl"
                        >
                          Add
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleScrapeUrl}
                        disabled={scraping || !newUrl.trim().startsWith('http')}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40"
                      >
                        {scraping ? <RefreshCw size={13} className="animate-spin" /> : <Globe size={13} />}
                        {scraping ? 'Crawling Page...' : 'Crawl Link & Train AI'}
                      </button>

                      {scrapedTitle && (
                        <p className="text-[10px] text-emerald-500 font-medium">✓ Scraped: "{scrapedTitle}"</p>
                      )}

                      <div className="space-y-1.5 max-h-28 overflow-y-auto">
                        {(draft.knowledgeUrls || []).map((u) => (
                          <div key={u} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#0F172A] rounded-lg text-[11px] font-mono">
                            <span className="truncate">{u}</span>
                            <button onClick={() => removeUrl(u)} className="text-slate-400 hover:text-rose-500 p-0.5">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------- */}
            {/* SUB-TAB 4: LEAD CAPTURE RULES */}
            {/* --------------------------------------------------------------- */}
            {activeSubTab === 'leads' && (
              <div className="space-y-6">
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  Lead Intake Form & Custom Rules
                </h3>

                <div className="space-y-3">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Required Lead Fields
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(['name', 'email', 'phone'] as const).map((field) => {
                      const isChecked = (draft.leadFields || ['name', 'email']).includes(field);
                      return (
                        <button
                          key={field}
                          type="button"
                          onClick={() => toggleLeadField(field)}
                          className={`p-3.5 border rounded-2xl flex items-center justify-between text-left transition-all ${
                            isChecked
                              ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172A]/50'
                          }`}
                        >
                          <div>
                            <p className="font-bold text-xs capitalize">{field} Field</p>
                            <p className="text-[10px] text-slate-400">Collect visitor {field}</p>
                          </div>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                            {isChecked && <span className="text-[10px]">✓</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => updateDraft((prev) => ({ ...prev, showLeadOnStart: !prev.showLeadOnStart }))}
                    className={`w-full p-4 border rounded-2xl flex items-center justify-between text-left transition-all ${
                      draft.showLeadOnStart
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172A]/50'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-100">
                        Prompt Lead Intake Form Immediately on Chat Startup
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Opens a required contact modal before starting the conversation session.
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${draft.showLeadOnStart ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                      {draft.showLeadOnStart && <span className="text-xs">✓</span>}
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------- */}
            {/* SUB-TAB 5: ADVANCED AI AGENT SETTINGS */}
            {/* --------------------------------------------------------------- */}
            {activeSubTab === 'ai' && (
              <div className="space-y-6">
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                  <Sparkles size={15} className="text-blue-500" /> AI Brain & System Prompts
                </h3>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Custom System Instruction Modifier
                  </label>
                  <textarea
                    rows={5}
                    value={draft.customSystemInstruction || ''}
                    onChange={(e) => updateDraft((prev) => ({ ...prev, customSystemInstruction: e.target.value }))}
                    placeholder="e.g. Speak with a warm tone. Highlight our free 14-day trial..."
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 dark:text-slate-100 resize-none font-sans"
                  />
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      AI Temperature / Creativity: {draft.temperature ?? 0.7}
                    </label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.1"
                    value={draft.temperature ?? 0.7}
                    onChange={(e) => updateDraft((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0.0 (Precise / Q&A)</span>
                    <span>0.7 (Balanced / Sales)</span>
                    <span>1.0 (Creative / Humor)</span>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------- */}
            {/* SUB-TAB 6: CUSTOM CSS EDITOR */}
            {/* --------------------------------------------------------------- */}
            {activeSubTab === 'css' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileCode size={15} className="text-blue-500" /> Custom CSS Styling Override
                  </h3>
                </div>

                <p className="text-xs text-slate-500">
                  Inject custom CSS directly into the widget iframe or popup container for deep brand matching.
                </p>

                {/* Pre-made CSS Templates */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Quick CSS Snippets
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CSS_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => updateDraft((prev) => ({ ...prev, customCss: (prev.customCss || '') + '\n\n' + tmpl.css }))}
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Plus size={12} /> {tmpl.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <textarea
                    rows={12}
                    value={draft.customCss || ''}
                    onChange={(e) => updateDraft((prev) => ({ ...prev, customCss: e.target.value }))}
                    placeholder="/* Enter custom CSS rules */&#10;#chatbot-widget-container { ... }"
                    className="w-full text-xs p-3.5 bg-[#0F172A] text-emerald-400 font-mono border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------- */}
            {/* SUB-TAB 7: CUSTOM JS EDITOR */}
            {/* --------------------------------------------------------------- */}
            {activeSubTab === 'js' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Code2 size={15} className="text-blue-500" /> Custom JavaScript Events & Automation
                  </h3>
                </div>

                <p className="text-xs text-slate-500">
                  Execute custom JavaScript event listeners on chat lifecycle events.
                </p>

                {/* Pre-made JS Templates */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Quick JS Event Snippets
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {JS_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => updateDraft((prev) => ({ ...prev, customJs: (prev.customJs || '') + '\n\n' + tmpl.code }))}
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Plus size={12} /> {tmpl.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <textarea
                    rows={12}
                    value={draft.customJs || ''}
                    onChange={(e) => updateDraft((prev) => ({ ...prev, customJs: e.target.value }))}
                    placeholder="// Custom JS event handlers"
                    className="w-full text-xs p-3.5 bg-[#0F172A] text-amber-300 font-mono border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------- */}
            {/* SUB-TAB 8: VERSION HISTORY */}
            {/* --------------------------------------------------------------- */}
            {activeSubTab === 'history' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <History size={15} className="text-blue-500" /> Version History & Snapshots
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowSnapshotModal(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <Plus size={13} /> Create Snapshot
                  </button>
                </div>

                <div className="space-y-3">
                  {(draft.versionHistory || []).length === 0 ? (
                    <div className="text-center py-8 space-y-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      <p className="text-xs text-slate-400">No version snapshots saved yet.</p>
                      <button
                        type="button"
                        onClick={() => setShowSnapshotModal(true)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-lg"
                      >
                        Save First Version Snapshot
                      </button>
                    </div>
                  ) : (
                    (draft.versionHistory || []).map((ver) => (
                      <div
                        key={ver.id}
                        className="p-4 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold rounded-md">
                              v{ver.versionNumber}
                            </span>
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-100">{ver.label}</span>
                          </div>
                          <p className="text-[10px] text-slate-400">{new Date(ver.createdAt).toLocaleString()}</p>
                          {ver.configSummary && <p className="text-[11px] text-slate-500">{ver.configSummary}</p>}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRestoreSnapshot(ver)}
                          className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          <RotateCcw size={13} /> Restore
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------- */}
            {/* SUB-TAB 9: DANGER ZONE */}
            {/* --------------------------------------------------------------- */}
            {activeSubTab === 'danger' && (
              <div className="space-y-6">
                <h3 className="font-display font-bold text-sm text-rose-600 dark:text-rose-400 border-b border-rose-100 dark:border-rose-950/50 pb-2 flex items-center gap-1.5">
                  <AlertTriangle size={16} /> Danger Zone & Reset Operations
                </h3>

                <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-3">
                  <div>
                    <h4 className="font-bold text-xs text-rose-700 dark:text-rose-300">Reset Chatbot to Factory Defaults</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Resets all branding, welcome greetings, custom CSS, JS, and FAQs back to initial default settings.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Reset All Settings to Defaults
                  </button>
                </div>

                {onDeleteBot && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-3">
                    <div>
                      <h4 className="font-bold text-xs text-rose-600 dark:text-rose-400">Permanently Delete Chatbot Instance</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Permanently deletes this chatbot, API key mappings, and training configurations. This operation cannot be undone.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      Delete Chatbot Instance
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME LIVE PREVIEW */}
        <div className={`lg:col-span-5 space-y-3 ${mobileView === 'editor' ? 'hidden lg:block' : ''}`}>
          
          {/* Preview Toolbar */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl flex items-center justify-between shadow-xs">
            
            {/* Device Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-[#0F172A] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  previewDevice === 'desktop' ? 'bg-white dark:bg-[#0B1120] text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'
                }`}
                title="Desktop View"
              >
                <Monitor size={14} /> <span className="hidden sm:inline">Desktop</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice('tablet')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  previewDevice === 'tablet' ? 'bg-white dark:bg-[#0B1120] text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'
                }`}
                title="Tablet View (768px)"
              >
                <Tablet size={14} /> <span className="hidden sm:inline">Tablet</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  previewDevice === 'mobile' ? 'bg-white dark:bg-[#0B1120] text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'
                }`}
                title="Mobile Frame (375px)"
              >
                <Smartphone size={14} /> <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            {/* Background Context Switcher */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewBgTheme(previewBgTheme === 'light' ? 'dark' : 'light')}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                title="Toggle Website Preview Light / Dark Context"
              >
                {previewBgTheme === 'light' ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} className="text-blue-400" />}
                <span className="hidden sm:inline">{previewBgTheme === 'light' ? 'Light Web' : 'Dark Web'}</span>
              </button>
            </div>
          </div>

          {/* Device Frame & Widget Stage */}
          <div
            className={`transition-all duration-300 mx-auto rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl ${
              previewBgTheme === 'dark' ? 'bg-[#090D16] text-white' : 'bg-slate-100 text-slate-800'
            } ${
              previewDevice === 'desktop'
                ? 'w-full h-[620px]'
                : previewDevice === 'tablet'
                ? 'w-[420px] max-w-full h-[620px] border-8 border-slate-700 rounded-3xl'
                : 'w-[360px] max-w-full h-[620px] border-12 border-slate-800 rounded-[38px] relative'
            }`}
          >
            {/* Simulated Website Header Banner */}
            <div className="p-3 bg-white/50 dark:bg-black/30 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-semibold">https://yourcompany.com</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-blue-500 font-bold">Live Preview</span>
            </div>

            {/* Widget Container Area */}
            <div className="p-4 h-[calc(100%-42px)] overflow-hidden">
              <ChatbotWidget key={`preview-${draft.id}-${historyIndex}`} config={draft} inline={true} />
            </div>
          </div>

        </div>

      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. MODALS & DIALOGS */}
      {/* ------------------------------------------------------------------- */}

      {/* Reset to Defaults Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20} /> Reset Settings to Factory Defaults?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This will reset all colors, welcome messages, FAQs, custom CSS, and custom JS to default initial settings.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Chatbot Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Delete Chatbot
                </h3>
                <p className="text-[11px] text-slate-500">Instance ID: {draft.id}</p>
              </div>
            </div>

            <div className="p-3 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 rounded-xl space-y-1.5">
              <p className="text-xs font-semibold text-rose-900 dark:text-rose-300">
                Are you sure you want to permanently delete this chatbot?
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Chatbot Name: <strong className="text-rose-600 dark:text-rose-400 font-bold">"{draft.name}"</strong>
              </p>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              This action will delete the chatbot configuration, conversation history, associated files, and AI settings.
            </p>

            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteConfirmInput === draft.name}
                  onChange={(e) => setDeleteConfirmInput(e.target.checked ? draft.name : '')}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>I confirm deletion of <strong className="font-semibold">{draft.name}</strong></span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmInput('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmInput.trim() !== draft.name.trim()}
                onClick={async () => {
                  if (onDeleteBot) {
                    await onDeleteBot(draft.id, { permanent: true, purgeKb: true, purgeHistory: true });
                  }
                  setShowDeleteModal(false);
                  setDeleteConfirmInput('');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Config JSON Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Upload size={18} className="text-blue-500" /> Import Chatbot Configuration JSON
            </h3>
            
            <div className="space-y-2">
              <textarea
                rows={8}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder="Paste chatbot JSON configuration here..."
                className="w-full text-xs p-3.5 bg-[#0F172A] text-emerald-400 font-mono border border-slate-800 rounded-2xl focus:outline-none"
              />
              {importError && <p className="text-xs text-rose-500 font-semibold">{importError}</p>}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => importFileInputRef.current?.click()}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Or Upload .json file
              </button>
              <input
                ref={importFileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => setImportJsonText(evt.target?.result as string);
                    reader.readAsText(file);
                  }
                }}
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportJsonSubmit}
                  disabled={!importJsonText.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Apply Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Snapshot Modal */}
      {showSnapshotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <History size={18} className="text-blue-500" /> Save Version Snapshot
            </h3>
            <input
              type="text"
              value={snapshotLabel}
              onChange={(e) => setSnapshotLabel(e.target.value)}
              placeholder="e.g. v1.2 - Added lead rules & custom CSS"
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSnapshotModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!snapshotLabel.trim()}
                onClick={handleCreateSnapshot}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Save Snapshot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embed Code Modal */}
      {showEmbedCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Code2 size={18} className="text-blue-500" /> Website Embedding Code
              </h3>
              <button onClick={() => setShowEmbedCodeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            
            <p className="text-xs text-slate-500">
              Paste this snippet right before the <code className="text-blue-500 font-mono">&lt;/body&gt;</code> tag of your HTML website.
            </p>

            <pre className="p-4 bg-[#0F172A] text-emerald-400 font-mono text-xs rounded-2xl overflow-x-auto border border-slate-800">
              <code>{embedScriptCode}</code>
            </pre>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(embedScriptCode);
                  setCopiedEmbed(true);
                  setTimeout(() => setCopiedEmbed(false), 2000);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                {copiedEmbed ? <Check size={14} /> : <Copy size={14} />}
                {copiedEmbed ? 'Copied!' : 'Copy Script Tag'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
