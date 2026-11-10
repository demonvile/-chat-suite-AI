import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Code, Key, Copy, Check, CheckCircle2, 
  Trash2, Mail, Phone, Calendar, Download, RefreshCw, AlertCircle, Bot, X, Menu,
  ShieldAlert, Globe, Users, HelpCircle, LifeBuoy, Sparkles, AlertTriangle, RotateCcw, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatbotConfig, Lead, Ticket } from '../types';
import { WidgetCustomizer } from './WidgetCustomizer';
import { AnalyticsView } from './AnalyticsView';
import { ConversationsInbox } from './ConversationsInbox';
import { ChatbotWidget } from './ChatbotWidget';
import { AccountSettings } from './AccountSettings';
import { HelpCenter } from './HelpCenter';
import { WorkflowEngine } from './workflows/WorkflowEngine';
import { IntegrationsHub } from './integrations/IntegrationsHub';
import { QADashboard } from './qa/QADashboard';
import { PluginMarketplace } from './marketplace/PluginMarketplace';
import { AgentMarketplace } from './agents/AgentMarketplace';
import { WhiteLabelStudio } from './whitelabel/WhiteLabelStudio';
import { VoiceAssistantStudio } from './voice/VoiceAssistantStudio';
import { FloatingVoiceAssistant } from './voice/FloatingVoiceAssistant';
import { RagKnowledgeStudio } from './rag/RagKnowledgeStudio';
import { BillingDashboard } from './BillingDashboard';
import { CustomerSuccessCenter } from './customer_success/CustomerSuccessCenter';
import { AISettings } from './AISettings';
import { AISetupWizard } from './wizards/AISetupWizard';
import { MemoryStudio } from './memory/MemoryStudio';
import { TeamManagement } from './TeamManagement';
import { ToastContainer, ToastMessage } from './Toast';

import { EmbedAndApiKeysStudio } from './integrations/EmbedAndApiKeysStudio';

interface DashboardProps {
  token: string;
  user: any;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  onToggleMobileSidebar?: () => void;
  onLogout?: () => void;
  onSessionExpired?: (msg?: string) => void;
  onTokenRefreshed?: (newToken: string, updatedUser: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  token,
  user,
  activeSection,
  setActiveSection,
  onToggleMobileSidebar,
  onLogout,
  onSessionExpired,
  onTokenRefreshed
}) => {
  const [bots, setBots] = useState<ChatbotConfig[]>([]);
  const [currentBot, setCurrentBot] = useState<ChatbotConfig | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [allWorkspaces, setAllWorkspaces] = useState<any[]>([]);

  // Authenticated fetch wrapper with automatic session refresh & session expiry redirect
  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    let activeToken = token;
    const headers = new Headers(options.headers || {});
    if (!headers.has('Authorization') && activeToken) {
      headers.set('Authorization', `Bearer ${activeToken}`);
    }
    if (!headers.has('x-workspace-id') && currentWorkspace?.id) {
      headers.set('x-workspace-id', currentWorkspace.id);
    }

    let res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      try {
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${activeToken}` }
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          activeToken = refreshData.token;
          if (onTokenRefreshed) {
            onTokenRefreshed(refreshData.token, refreshData.user);
          }
          headers.set('Authorization', `Bearer ${activeToken}`);
          res = await fetch(url, { ...options, headers });
        } else {
          addToast('error', 'Session Expired', 'Your session has expired or is invalid. Redirecting to login...');
          setTimeout(() => {
            if (onSessionExpired) {
              onSessionExpired('Session expired or invalid. Please sign in again.');
            } else if (onLogout) {
              onLogout();
            }
          }, 1000);
        }
      } catch (e) {
        if (onSessionExpired) {
          onSessionExpired('Session expired or invalid. Please sign in again.');
        } else if (onLogout) {
          onLogout();
        }
      }
    }

    return res;
  };
  
  // Interactive loading / search states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  // Webhooks Integration states
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [webhookUrlInput, setWebhookUrlInput] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Appointments / Bookings states
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);

  // Administrative views states
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(false);

  // Chatbot Delete & Management states
  const [botToDelete, setBotToDelete] = useState<ChatbotConfig | null>(null);
  const [botDeleteConfirmText, setBotDeleteConfirmText] = useState('');
  const [showManageBotsModal, setShowManageBotsModal] = useState(false);
  const [deletedBots, setDeletedBots] = useState<ChatbotConfig[]>([]);
  const [manageBotsTab, setManageBotsTab] = useState<'active' | 'trash'>('active');

  // Toast Notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isCreatingBot, setIsCreatingBot] = useState(false);

  // First-Time AI Setup Wizard & Invalid Key Alert States
  const [showAiWizardModal, setShowAiWizardModal] = useState(false);
  const [aiWizardCompleted, setAiWizardCompleted] = useState(true);
  const [invalidKeyAlert, setInvalidKeyAlert] = useState<{
    hasAlert: boolean;
    providerName?: string;
  }>({ hasAlert: false });

  // Function to check AI Wizard completion & invalid key alerts
  const checkAiWizardStatus = async () => {
    try {
      const res = await authFetch('/api/workspace/ai-provider/config');
      if (res.ok) {
        const data = await res.json();
        setAiWizardCompleted(data.aiWizardCompleted);
        if (!data.aiWizardCompleted) {
          setShowAiWizardModal(true);
        }
        if (data.hasInvalidKeyAlert) {
          setInvalidKeyAlert({
            hasAlert: true,
            providerName: data.invalidProviderName
          });
        } else {
          setInvalidKeyAlert({ hasAlert: false });
        }
      }
    } catch (err) {
      console.error('Error checking AI wizard status:', err);
    }
  };

  useEffect(() => {
    if (token) {
      checkAiWizardStatus();
    }
  }, [token, currentWorkspace]);

  // Command Palette / Quick Search State
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  // Global Keyboard listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      } else if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync Webhook URL Input when current chatbot changes
  useEffect(() => {
    if (currentBot) {
      setWebhookUrlInput(currentBot.webhookUrl || '');
    }
  }, [currentBot]);

  // Fetch booked appointments
  const fetchAppointments = async () => {
    setLoadingAppts(true);
    try {
      const res = await fetch('/api/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        setAppointments(d);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoadingAppts(false);
    }
  };

  // Fetch webhook outbound logs
  const fetchWebhookLogs = async (botId: string) => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/bots/${botId}/webhook-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        setWebhookLogs(d);
      }
    } catch (err) {
      console.error('Error fetching webhook logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Fetch all registered users (Admin only)
  const fetchAdminUsers = async () => {
    setLoadingAdminUsers(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        setAdminUsers(d);
      }
    } catch (err) {
      console.error('Error fetching admin accounts:', err);
    } finally {
      setLoadingAdminUsers(false);
    }
  };

  // Lazy-load sub-section datasets based on routing
  useEffect(() => {
    if (activeSection === 'appointments') {
      fetchAppointments();
    }
    if (activeSection === 'admin' && user.role === 'admin') {
      fetchAdminUsers();
    }
    if (activeSection === 'integration' && currentBot) {
      fetchWebhookLogs(currentBot.id);
    }
  }, [activeSection, currentBot, token, user.role]);

  // Update appointment fields/status
  const handleUpdateAppointment = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        setAppointments(appointments.map(a => a.id === id ? updated : a));
      }
    } catch (err) {
      alert('Failed to update booking schedule.');
    }
  };

  // Remove booking slot
  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel and delete this booked appointment?')) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAppointments(appointments.filter(a => a.id !== id));
      }
    } catch (err) {
      alert('Failed to cancel appointment slot.');
    }
  };

  // Toggle administrative role privilege
  const handleToggleAdminRole = async (targetUserId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Are you sure you want to change this user's privilege to ${newRole.toUpperCase()}?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${targetUserId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newRole })
      });
      if (res.ok) {
        setAdminUsers(adminUsers.map(u => u.id === targetUserId ? { ...u, role: newRole } : u));
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to alter role privileges.');
      }
    } catch (err) {
      alert('Network error altering user privileges.');
    }
  };

  // Save Outbound Webhook Target Config
  const handleSaveWebhookConfig = async () => {
    if (!currentBot) return;
    setSavingWebhook(true);
    try {
      await handleSaveBotSettings({
        ...currentBot,
        webhookUrl: webhookUrlInput
      });
      alert('Webhook integration configuration updated successfully! Outbound events will now trigger live postings.');
      fetchWebhookLogs(currentBot.id);
    } catch (err) {
      alert('Failed to save webhook settings.');
    } finally {
      setSavingWebhook(false);
    }
  };

  // Fetch all chatbots owned by the logged-in business user
  const fetchBots = async () => {
    try {
      const res = await authFetch('/api/bots');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const d = await res.json();
        setBots(d);
        if (Array.isArray(d) && d.length > 0 && !currentBot) {
          setCurrentBot(d[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching chatbots', e);
    }
  };

  // Fetch captured leads
  const fetchLeads = async () => {
    try {
      const res = await authFetch('/api/leads');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const d = await res.json();
        setLeads(d);
      }
    } catch (e) {
      console.error('Error fetching leads', e);
    }
  };

  // Fetch support tickets
  const fetchTickets = async () => {
    try {
      const res = await authFetch('/api/tickets');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const d = await res.json();
        setTickets(d);
      }
    } catch (e) {
      console.error('Error fetching tickets', e);
    }
  };

  // Fetch current user workspace
  const fetchWorkspace = async () => {
    try {
      const res = await authFetch('/api/workspaces/current');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const d = await res.json();
        setCurrentWorkspace(d);
      }
    } catch (e) {
      console.error('Error fetching workspace', e);
    }
  };

  const fetchAllWorkspaces = async () => {
    try {
      const res = await authFetch('/api/workspaces');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const d = await res.json();
        setAllWorkspaces(d);
      }
    } catch (e) {
      console.error('Error fetching all workspaces', e);
    }
  };

  const handleSwitchWorkspace = async (wsId: string) => {
    try {
      const res = await authFetch('/api/workspaces/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: wsId })
      });
      if (res.ok) {
        const d = await res.json();
        setCurrentWorkspace(d.workspace);
        addToast('success', 'Workspace Switched', `Active workspace changed to "${d.workspace.name}".`);
        await Promise.all([fetchBots(), fetchLeads(), fetchTickets(), fetchAllWorkspaces()]);
      } else {
        const err = await res.json();
        addToast('error', 'Switch Failed', err.error || 'Failed to switch active workspace.');
      }
    } catch (e: any) {
      addToast('error', 'Switch Failed', e.message || 'Unable to switch active workspace.');
    }
  };

  const handleCreateWorkspace = async (name: string) => {
    try {
      const res = await authFetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const newWs = await res.json();
        setCurrentWorkspace(newWs);
        addToast('success', 'Workspace Created', `Workspace "${newWs.name}" created successfully.`);
        await Promise.all([fetchBots(), fetchLeads(), fetchTickets(), fetchAllWorkspaces()]);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create workspace');
      }
    } catch (e: any) {
      addToast('error', 'Creation Failed', e.message || 'Failed to create workspace');
      throw e;
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([fetchBots(), fetchLeads(), fetchTickets(), fetchWorkspace(), fetchAllWorkspaces()]);
    } catch (err) {
      setError('Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handler for creating a new custom chatbot widget template
  const handleCreateBot = async () => {
    setIsCreatingBot(true);
    try {
      const res = await authFetch('/api/bots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': currentWorkspace?.id || ''
        },
        body: JSON.stringify({
          name: `${user.name}'s Virtual Assistant #${bots.length + 1}`,
          botName: 'AI Sales Rep',
          welcomeMessage: 'Hello! I am your AI sales assistant. Ask me anything or leave your email to get a follow-up.'
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Unable to deploy new chatbot instance.');
      }

      const newBot = await res.json();
      setBots(prev => [...prev, newBot]);
      setCurrentBot(newBot);
      setActiveSection('customizer');
      addToast('success', 'New Chatbot Created', `"${newBot.name}" is ready for customization.`);
    } catch (e: any) {
      addToast('error', 'Creation Failed', e.message || 'Unable to deploy new chatbot instance.');
    } finally {
      setIsCreatingBot(false);
    }
  };

  // Handler for saving customized bot configuration changes
  const handleSaveBotSettings = async (updatedBot: ChatbotConfig) => {
    try {
      const res = await fetch(`/api/bots/${updatedBot.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedBot)
      });

      if (res.ok) {
        const d = await res.json();
        // Update local arrays
        setBots(bots.map(b => b.id === d.id ? d : b));
        setCurrentBot(d);
        addToast('success', 'Settings Saved', 'Chatbot configuration updated successfully.');
      } else {
        throw new Error();
      }
    } catch (e) {
      addToast('error', 'Save Failed', 'Failed to save chatbot settings.');
      throw new Error('Failed saving settings');
    }
  };

  // Fetch soft-deleted chatbots (trash)
  const fetchDeletedBots = async () => {
    try {
      const res = await fetch('/api/bots?trashOnly=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setDeletedBots(data);
      }
    } catch (e) {
      console.error('Failed to fetch soft-deleted bots', e);
    }
  };

  // Handler for deleting a chatbot instance
  const handleDeleteBot = async (
    botId: string, 
    options?: { permanent?: boolean; purgeKb?: boolean; purgeHistory?: boolean }
  ) => {
    try {
      const params = new URLSearchParams();
      if (options?.permanent) params.append('permanent', 'true');
      if (options?.purgeKb) params.append('purgeKb', 'true');
      if (options?.purgeHistory) params.append('purgeHistory', 'true');

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/bots/${botId}${queryString}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const remaining = bots.filter(b => b.id !== botId);
        setBots(remaining);
        if (currentBot?.id === botId) {
          setCurrentBot(remaining.length > 0 ? remaining[0] : null);
        }
        addToast('success', 'Chatbot Deleted', 'Chatbot deleted successfully.');
        fetchDeletedBots();
      } else {
        const errorMsg = data.error || data.message || 'Failed to delete chatbot.';
        addToast('error', 'Delete Failed', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (e: any) {
      const msg = e.message || 'Failed to delete chatbot.';
      addToast('error', 'Delete Failed', msg);
      throw e;
    }
  };

  // Handler for restoring a soft-deleted chatbot instance (within 30 days)
  const handleRestoreBot = async (botId: string) => {
    try {
      const res = await fetch(`/api/bots/${botId}/restore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (res.ok && data.success && data.bot) {
        setBots(prev => [...prev.filter(b => b.id !== botId), data.bot]);
        setDeletedBots(prev => prev.filter(b => b.id !== botId));
        if (!currentBot) {
          setCurrentBot(data.bot);
        }
        addToast('success', 'Chatbot Restored', 'Chatbot restored successfully.');
      } else {
        addToast('error', 'Restore Failed', data.error || 'Failed to restore chatbot.');
      }
    } catch (e: any) {
      addToast('error', 'Restore Failed', e.message || 'Failed to restore chatbot.');
    }
  };

  // Handler for duplicating a chatbot instance
  const handleDuplicateBot = async (botConfig: ChatbotConfig): Promise<ChatbotConfig | void> => {
    try {
      const copyData = {
        ...botConfig,
        name: `${botConfig.name} (Copy)`,
        botName: `${botConfig.botName} Copy`
      };
      delete (copyData as any).id;
      delete (copyData as any).apiKey;
      delete (copyData as any).createdAt;

      const res = await fetch('/api/bots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-workspace-id': currentWorkspace?.id || ''
        },
        body: JSON.stringify(copyData)
      });

      if (res.ok) {
        const newBot = await res.json();
        setBots(prev => [...prev, newBot]);
        setCurrentBot(newBot);
        addToast('success', 'Chatbot Duplicated', `Created duplicate "${newBot.name}".`);
        return newBot;
      } else {
        throw new Error();
      }
    } catch (e) {
      addToast('error', 'Duplication Failed', 'Could not duplicate chatbot instance.');
    }
  };

  // Handler for resolving a ticket
  const handleResolveTicket = async (id: string) => {
    try {
      const res = await fetch(`/api/tickets/${id}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const updated = await res.json();
        setTickets(tickets.map(t => t.id === id ? updated : t));
        addToast('success', 'Ticket Resolved', 'Support ticket marked as resolved.');
      }
    } catch (e) {
      addToast('error', 'Action Failed', 'Failed to resolve support ticket.');
    }
  };

  // Handler for regenerating bot API key
  const handleRegenerateKey = async () => {
    if (!currentBot) return;
    setRegeneratingKey(true);
    try {
      const res = await fetch(`/api/bots/${currentBot.id}/regenerate-key`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const d = await res.json();
        setCurrentBot({ ...currentBot, apiKey: d.apiKey });
        setBots(bots.map(b => b.id === currentBot.id ? { ...b, apiKey: d.apiKey } : b));
        addToast('success', 'API Key Regenerated', 'New AES-encrypted key generated. Old key revoked.');
      }
    } catch (e) {
      addToast('error', 'Regeneration Failed', 'Error regenerating API key.');
    } finally {
      setRegeneratingKey(false);
    }
  };

  // Clipboard copy helpers
  const copyToClipboard = (text: string, isScript: boolean) => {
    navigator.clipboard.writeText(text);
    if (isScript) {
      setCopiedScript(true);
      addToast('info', 'Script Copied', 'Embed snippet copied to clipboard.');
      setTimeout(() => setCopiedScript(false), 2000);
    } else {
      setCopiedKey(true);
      addToast('info', 'API Key Copied', 'Developer API key copied to clipboard.');
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  // Filter lists based on search queries
  const filteredLeads = leads.filter(lead => {
    if (currentBot && lead.chatbotId !== currentBot.id) return false;
    const query = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.phone.toLowerCase().includes(query) ||
      (lead.notes || '').toLowerCase().includes(query)
    );
  });

  const filteredTickets = tickets.filter(t => {
    if (currentBot && t.chatbotId !== currentBot.id) return false;
    const query = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(query) ||
      t.email.toLowerCase().includes(query) ||
      t.message.toLowerCase().includes(query)
    );
  });

  // Simulate exporting leads database as CSV
  const handleExportCSV = () => {
    const headers = 'ID,Name,Email,Phone,Created At,Notes\n';
    const rows = filteredLeads.map(l => 
      `"${l.id}","${l.name}","${l.email}","${l.phone}","${l.createdAt}","${l.notes || ''}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${currentBot?.botName || 'ChatSuite'}_Leads_Export.csv`);
    a.click();
  };

  const widgetScriptCode = currentBot 
    ? `<script src="${window.location.origin}/widget.js" data-bot-id="${currentBot.id}" defer></script>` 
    : '';

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0F172A] p-6 sm:p-8 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          </div>
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl pt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0F172A] p-3 sm:p-6 lg:p-8">

      {/* Invalid API Key Global Warning Banner */}
      {invalidKeyAlert.hasAlert && (
        <div className="mb-6 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-500 rounded-xl shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wider font-mono">
                API Key Authentication Warning
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                The stored API key for active provider <strong className="text-amber-600 dark:text-amber-400 font-mono uppercase">{invalidKeyAlert.providerName}</strong> was rejected or expired. Please update credentials to ensure uninterrupted service.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveSection('ai_settings')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 shadow-md"
          >
            Fix Key in Settings →
          </button>
        </div>
      )}
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          {onToggleMobileSidebar && (
            <button 
              onClick={onToggleMobileSidebar}
              className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 cursor-pointer transition-colors shrink-0"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
          )}
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-800 dark:text-white tracking-tight">Enterprise Chatbots Hub</h2>
            <p className="text-xs text-slate-500 mt-1">Hello, {user.name}. Manage white-labeled conversational interfaces and customer pipelines.</p>
          </div>
        </div>

        {/* Quick controls: chatbot templates switcher */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {bots.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <select
                value={currentBot?.id || ''}
                onChange={(e) => {
                  const b = bots.find(x => x.id === e.target.value);
                  if (b) setCurrentBot(b);
                }}
                className="px-3 py-2 text-xs bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium min-h-[40px]"
              >
                {bots.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              {currentBot && (
                <button
                  onClick={() => {
                    setBotToDelete(currentBot);
                    setBotDeleteConfirmText('');
                  }}
                  className="p-2 min-h-[40px] min-w-[40px] bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/50 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
                  title={`Delete chatbot "${currentBot.name}"`}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => {
              setShowManageBotsModal(true);
              fetchDeletedBots();
            }}
            className="px-3 py-2 min-h-[40px] bg-white dark:bg-[#0B1120] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            title="Manage All Chatbots"
          >
            <Layers size={15} className="text-blue-500" />
            <span>Manage All ({bots.length})</span>
          </button>

          <button
            onClick={handleCreateBot}
            disabled={isCreatingBot}
            className="px-4 py-2 min-h-[40px] bg-slate-900 dark:bg-slate-800 hover:bg-slate-850 dark:hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
          >
            {isCreatingBot ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <Plus size={15} />
            )}
            <span>{isCreatingBot ? 'Creating...' : 'Create Chatbot'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl flex items-center gap-2 text-xs mb-6">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Main Dashboard section viewport */}

      {/* 0. AI PROVIDER SETTINGS VIEW */}
      {activeSection === 'ai_settings' && (
        <AISettings 
          token={token} 
          addToast={addToast} 
          onLaunchWizard={() => setShowAiWizardModal(true)} 
        />
      )}

      {/* ENTERPRISE CONVERSATION MEMORY STUDIO */}
      {activeSection === 'memory_studio' && (
        <MemoryStudio currentWorkspaceId={currentWorkspace?.id || 'ws-admin-user'} token={token} />
      )}

      {/* 1. VISUAL CUSTOMIZER VIEW */}
      {activeSection === 'customizer' && (
        currentBot ? (
          <div className="space-y-6">
            {/* Onboarding Setup Progress Card */}
            <div className="bg-gradient-to-r from-blue-600/5 to-indigo-600/5 dark:from-blue-500/[0.03] dark:to-indigo-500/[0.03] border border-blue-150/40 dark:border-slate-850 rounded-2xl p-4.5 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1 flex-1">
                <span className="text-[9px] uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400 font-mono">Platform Onboarding Wizard</span>
                <h3 className="font-display font-bold text-sm text-slate-850 dark:text-white">🚀 Build & Train Your Custom Business Agent</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-450 max-w-xl leading-relaxed">
                  Complete these 3 essential setup milestones to train the Gemini 3.5 brain, brand your custom widget, and copy the white-labeled embed snippet.
                </p>
                
                {/* Checklist items */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3.5 text-[11px]">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-350">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">✓</div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">1. Customize Brand</p>
                      <p className="text-[9px] text-slate-400">Branding settings saved</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-350">
                    {currentBot.knowledgeText || (currentBot.faqs && currentBot.faqs.length > 0) || (currentBot.knowledgeUrls && currentBot.knowledgeUrls.length > 0) ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">✓</div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-450 dark:text-slate-500 flex items-center justify-center font-bold text-[9px] shrink-0">2</div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">2. Train AI Brain</p>
                      <p className="text-[9px] text-slate-400">
                        {currentBot.knowledgeText || (currentBot.faqs && currentBot.faqs.length > 0) || (currentBot.knowledgeUrls && currentBot.knowledgeUrls.length > 0) ? "Loaded training sources" : "Add PDFs or text files"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-350">
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-450 dark:text-slate-500 flex items-center justify-center font-bold text-[9px] shrink-0">3</div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">3. Embed Script</p>
                      <p className="text-[9px] text-slate-400">Copy code to live site</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score progress circle indicator */}
              <div className="bg-white dark:bg-[#0B1120] border border-slate-150 dark:border-slate-800 px-4 py-3 rounded-2xl flex items-center gap-3 self-start md:self-auto shrink-0 shadow-xs">
                <div className="space-y-0.5">
                  <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Overall Progress</p>
                  <p className="text-xs font-black text-slate-850 dark:text-white">
                    {currentBot.knowledgeText || (currentBot.faqs && currentBot.faqs.length > 0) || (currentBot.knowledgeUrls && currentBot.knowledgeUrls.length > 0) ? "100% Complete" : "66% Complete"}
                  </p>
                  <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-850 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500" 
                      style={{ width: currentBot.knowledgeText || (currentBot.faqs && currentBot.faqs.length > 0) || (currentBot.knowledgeUrls && currentBot.knowledgeUrls.length > 0) ? '100%' : '66%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <WidgetCustomizer
              config={currentBot}
              onSave={handleSaveBotSettings}
              onDeleteBot={handleDeleteBot}
              onDuplicateBot={handleDuplicateBot}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto my-12 space-y-5 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-100 dark:border-blue-900/50">
              <Bot size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-white font-display">No Chatbots Configured</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1 max-w-sm mx-auto">
                You don't have any active chatbot instances yet. Click below to deploy your first AI assistant and launch the Chatbot Studio editor.
              </p>
            </div>
            <button
              onClick={handleCreateBot}
              disabled={isCreatingBot}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 cursor-pointer transition-all inline-flex items-center gap-2"
            >
              {isCreatingBot ? <RefreshCw size={15} className="animate-spin" /> : <Plus size={15} />}
              <span>{isCreatingBot ? 'Creating Assistant...' : 'Create Your First Chatbot'}</span>
            </button>
          </div>
        )
      )}

      {/* 1b. WORKFLOW AUTOMATION ENGINE */}
      {activeSection === 'workflows' && (
        <WorkflowEngine token={token} user={user} currentBot={currentBot} />
      )}

      {/* 1c. CENTRALIZED INTEGRATIONS HUB */}
      {activeSection === 'integrations_hub' && (
        <IntegrationsHub token={token} />
      )}

      {/* 1d. AUTOMATED QA & TESTING DASHBOARD */}
      {activeSection === 'qa_suite' && (
        <QADashboard />
      )}

      {/* 2. LEADS MANAGEMENT TABLE */}
      {activeSection === 'leads' && currentBot && (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-850 dark:text-white flex items-center gap-1.5">
                Visitor Leads Collected
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Direct inquiries, callbacks, and quote requests captured by "{currentBot.botName}".</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={13} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search leads database..."
                  className="pl-8.5 pr-3 py-1.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 w-48 sm:w-60"
                />
              </div>

              <button
                onClick={handleExportCSV}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors rounded-lg cursor-pointer flex items-center gap-1 text-[11px] font-semibold px-2.5"
                title="Export list as CSV spreadsheet"
              >
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 max-w-md mx-auto my-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
                  <Users size={22} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">No Visitor Leads Captured Yet</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    When visitors interact with "{currentBot.botName}" on your website or in the sandbox simulator, their contact details will appear here automatically.
                  </p>
                </div>
                <button
                  onClick={() => setSimulatorOpen(true)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Bot size={13} /> Launch Sandbox & Submit Test Lead
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                    <th className="py-3 px-2">Visitor Detail</th>
                    <th className="py-3 px-2">Contact Details</th>
                    <th className="py-3 px-2">Date Collected</th>
                    <th className="py-3 px-2">Capture Context Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-2 font-bold text-slate-800 dark:text-slate-200">
                        {lead.name}
                      </td>
                      <td className="py-4 px-2 space-y-1">
                        {lead.email && (
                          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <Mail size={12} className="text-blue-500" /> {lead.email}
                          </span>
                        )}
                        {lead.phone && (
                          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <Phone size={12} className="text-blue-500" /> {lead.phone}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-2 text-slate-400 flex items-center gap-1">
                        <Calendar size={12} /> {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-2 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={lead.notes}>
                        {lead.notes || 'Submitted via widget intake overlay.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 3. SUPPORT TICKETS VIEWER */}
      {activeSection === 'tickets' && currentBot && (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-850 dark:text-white flex items-center gap-1.5">
                Support Tickets Pipeline
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Direct tickets filed by visitors using the Support Ticket widget option.</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={13} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket content..."
                className="pl-8.5 pr-3 py-1.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 w-48 sm:w-60"
              />
            </div>
          </div>

          <div className="space-y-3.5">
            {filteredTickets.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center font-mono">No pending support tickets filed.</p>
            ) : (
              filteredTickets.map((t) => (
                <div key={t.id} className="p-4 bg-slate-50 dark:bg-[#0F172A] border border-slate-150 dark:border-slate-800/80 rounded-xl flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="text-xs space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{t.name}</span>
                      <span className="text-slate-400 font-mono">({t.email})</span>
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        t.status === 'open' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 italic">"{t.message}"</p>
                    <p className="text-[10px] text-slate-400 font-mono">Submitted: {new Date(t.createdAt).toLocaleString()}</p>
                  </div>

                  {t.status === 'open' && (
                    <button
                      onClick={() => handleResolveTicket(t.id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-sm shadow-blue-600/10"
                    >
                      <CheckCircle2 size={13} /> Mark Resolved
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CONVERSATIONS INBOX */}
      {activeSection === 'inbox' && (
        <ConversationsInbox token={token} chatbotId={currentBot?.id} />
      )}

      {/* 4. PERFORMANCE ANALYTICS */}
      {activeSection === 'analytics' && currentBot && (
        <AnalyticsView token={token} chatbotId={currentBot.id} />
      )}

      {/* APPOINTMENTS & SCHEDULE VIEW */}
      {activeSection === 'appointments' && (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-850 dark:text-white flex items-center gap-1.5">
                <Calendar size={16} className="text-blue-500" /> Bookings & Appointment Schedule
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Manage scheduled client bookings, customer consult requests, and lead slots.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={13} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bookings..."
                  className="pl-8.5 pr-3 py-1.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 w-48 sm:w-60"
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl text-center">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Bookings</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{appointments.length}</p>
            </div>
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Confirmed Slots</p>
              <p className="text-2xl font-bold text-emerald-500 mt-1">
                {appointments.filter(a => a.status === 'confirmed').length}
              </p>
            </div>
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl text-center">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Pending Slots</p>
              <p className="text-2xl font-bold text-amber-500 mt-1">
                {appointments.filter(a => a.status === 'pending').length}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loadingAppts ? (
              <div className="text-center py-10">
                <RefreshCw size={18} className="animate-spin text-blue-500 mx-auto" />
                <p className="text-xs text-slate-400 font-mono mt-2">Loading appointments agenda...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Calendar size={28} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-mono">No appointment calendar events booked yet.</p>
                <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  When visitors converse with your AI representative, they can schedule meetings which trigger a live booking form modal.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                    <th className="py-3 px-2">Client Info</th>
                    <th className="py-3 px-2">Booked Date & Time</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Description / Notes</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                  {appointments
                    .filter(a => {
                      const query = searchQuery.toLowerCase();
                      return (
                        a.name.toLowerCase().includes(query) ||
                        a.email.toLowerCase().includes(query) ||
                        (a.notes || '').toLowerCase().includes(query)
                      );
                    })
                    .map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-4 px-2">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{appt.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{appt.email}</p>
                        </td>
                        <td className="py-4 px-2 font-semibold text-slate-600 dark:text-slate-300">
                          {new Date(appt.date).toLocaleDateString()} at {appt.time}
                        </td>
                        <td className="py-4 px-2">
                          <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            appt.status === 'confirmed' 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                              : appt.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                          }`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-slate-500 max-w-xs truncate" title={appt.notes}>
                          {appt.notes || 'No description notes provided.'}
                        </td>
                        <td className="py-4 px-2 text-right space-x-2">
                          {appt.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateAppointment(appt.id, { status: 'confirmed' })}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {appt.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateAppointment(appt.id, { status: 'cancelled' })}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Cancel Slot
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAppointment(appt.id)}
                            className="px-2 py-1 bg-rose-600/10 hover:bg-rose-600 text-rose-600 hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* PLATFORM ADMIN & TENANT OVERVIEW */}
      {activeSection === 'admin' && user.role === 'admin' && (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-display font-bold text-sm text-slate-850 dark:text-white flex items-center gap-1.5">
              <ShieldAlert size={16} className="text-rose-500" /> Platform Admin & Multi-Tenant Control
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Super-user analytics across all registered corporate client accounts and chatbots.</p>
          </div>

          {/* System Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-150 dark:border-slate-800/80 rounded-xl text-center">
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Total Registered Tenants</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{adminUsers.length}</p>
            </div>
            <div className="p-4.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-150 dark:border-slate-800/80 rounded-xl text-center">
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Total System Chatbots</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {adminUsers.reduce((sum, u) => sum + (u.chatbotsCount || 0), 0)}
              </p>
            </div>
            <div className="p-4.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-150 dark:border-slate-800/80 rounded-xl text-center">
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Total Captured Leads</p>
              <p className="text-2xl font-bold text-emerald-500 mt-1">
                {adminUsers.reduce((sum, u) => sum + (u.leadsCount || 0), 0)}
              </p>
            </div>
            <div className="p-4.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-150 dark:border-slate-800/80 rounded-xl text-center">
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">System Support Tickets</p>
              <p className="text-2xl font-bold text-rose-500 mt-1">
                {adminUsers.reduce((sum, u) => sum + (u.ticketsCount || 0), 0)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loadingAdminUsers ? (
              <div className="text-center py-10">
                <RefreshCw size={18} className="animate-spin text-blue-500 mx-auto" />
                <p className="text-xs text-slate-400 font-mono mt-2">Loading client tenants directory...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                    <th className="py-3 px-2">Account Profile</th>
                    <th className="py-3 px-2">Company Tenant</th>
                    <th className="py-3 px-2 text-center">AI Bots</th>
                    <th className="py-3 px-2 text-center">Visitor Leads</th>
                    <th className="py-3 px-2 text-center">Tickets Filed</th>
                    <th className="py-3 px-2">Account Privilege</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                  {adminUsers.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-2">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.email}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">Joined: {new Date(item.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="py-4 px-2 font-semibold text-slate-600 dark:text-slate-300">
                        {item.companyName || 'N/A'}
                      </td>
                      <td className="py-4 px-2 text-center font-bold text-slate-700 dark:text-slate-200">
                        {item.chatbotsCount}
                      </td>
                      <td className="py-4 px-2 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                        {item.leadsCount}
                      </td>
                      <td className="py-4 px-2 text-center font-semibold text-rose-500">
                        {item.ticketsCount}
                      </td>
                      <td className="py-4 px-2">
                        <span className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                          item.role === 'admin' 
                            ? 'bg-rose-500/15 text-rose-600 border border-rose-500/10' 
                            : 'bg-blue-500/10 text-blue-600 border border-blue-500/5'
                        }`}>
                          {item.role === 'admin' ? 'Administrator' : 'Tenant Owner'}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        {item.id !== 'admin-user' && item.id !== user?.id ? (
                          <button
                            onClick={() => handleToggleAdminRole(item.id, item.role)}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white border border-slate-200 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-300 font-bold transition-all rounded cursor-pointer"
                          >
                            Toggle Privilege
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono italic">Primary User</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 5. EMBED & API INTEGRATIONS */}
      {activeSection === 'integration' && (
        <EmbedAndApiKeysStudio 
          user={user} 
          bots={bots} 
          currentBot={currentBot} 
        />
      )}

      {/* WHITE-LABEL & BRANDING HUB */}
      {activeSection === 'whitelabel' && (
        <WhiteLabelStudio
          token={token}
          addToast={addToast}
          currentWorkspace={currentWorkspace}
          onUpdateWorkspace={(updatedWs) => setCurrentWorkspace(updatedWs)}
        />
      )}

      {/* DEDICATED ENTERPRISE AI AGENTS MARKETPLACE */}
      {activeSection === 'agent_marketplace' && (
        <AgentMarketplace token={token} addToast={addToast} setActiveSection={setActiveSection} />
      )}

      {/* MULTI-TENANT TEAM MANAGEMENT */}
      {activeSection === 'team' && (
        <TeamManagement
          token={token}
          user={user}
          currentUser={user}
          authFetch={authFetch}
          addToast={addToast}
          currentWorkspace={currentWorkspace}
          allWorkspaces={allWorkspaces}
          onSwitchWorkspace={handleSwitchWorkspace}
          onCreateWorkspace={handleCreateWorkspace}
        />
      )}

      {/* PLUGIN & AI AGENT MARKETPLACE */}
      {activeSection === 'marketplace' && (
        <PluginMarketplace token={token} addToast={addToast} />
      )}

      {/* ENTERPRISE RAG & KNOWLEDGE BASE ENGINE */}
      {activeSection === 'rag_knowledge' && (
        <RagKnowledgeStudio token={token} addToast={addToast} setActiveSection={setActiveSection} />
      )}

      {/* ENTERPRISE AI VOICE ASSISTANT STUDIO */}
      {activeSection === 'voice' && (
        <VoiceAssistantStudio token={token} addToast={addToast} setActiveSection={setActiveSection} />
      )}

      {/* COMMERCIAL SAAS BILLING DASHBOARD */}
      {activeSection === 'billing' && (
        <BillingDashboard token={token} currentWorkspaceId={user.currentWorkspaceId || 'ws-admin-user'} user={user} addToast={addToast} />
      )}

      {/* 6. ACCOUNT & SECURITY SETTINGS */}
      {activeSection === 'settings' && (
        <AccountSettings token={token} user={user} onAddToast={addToast} />
      )}

      {/* 7. CUSTOMER SUCCESS & HELP CENTER */}
      {(activeSection === 'help' || activeSection === 'customer_success') && (
        <CustomerSuccessCenter addToast={addToast} onNavigateToSection={setActiveSection} />
      )}

      {/* Command Palette Modal Overlay (Cmd + K) */}
      <AnimatePresence>
        {showCommandPalette && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                  placeholder="Type a command or search workspace..."
                  className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 focus:outline-none placeholder:text-slate-400"
                  autoFocus
                />
                <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                  ESC
                </kbd>
              </div>

              <div className="max-h-80 overflow-y-auto p-2 text-xs space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Quick Navigation
                </div>
                {[
                  { name: '+ Create New Chatbot', sec: 'customizer', icon: Plus, isAction: true },
                  { name: 'Overview Dashboard', sec: 'overview', icon: Bot },
                  { name: 'AI Agents Marketplace', sec: 'agent_marketplace', icon: Bot },
                  { name: 'Conversations & Live Inbox', sec: 'inbox', icon: Users },
                  { name: 'RAG Knowledge Studio', sec: 'rag_knowledge', icon: Sparkles },
                  { name: 'Voice Assistant Studio', sec: 'voice', icon: Globe },
                  { name: 'Interactive Analytics & Reports', sec: 'analytics', icon: HelpCircle },
                  { name: 'Workflow Automation Builder', sec: 'workflows', icon: Code },
                  { name: 'Integrations & Webhooks', sec: 'integrations', icon: Key },
                  { name: 'Widget Visual Customizer', sec: 'customizer', icon: Plus },
                  { name: 'Subscriptions & Billing Center', sec: 'billing', icon: Key },
                  { name: 'Account Settings & Security', sec: 'settings', icon: LifeBuoy },
                ]
                  .filter(item => item.name.toLowerCase().includes(commandQuery.toLowerCase()))
                  .map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        if (item.isAction) {
                          handleCreateBot();
                        } else {
                          setActiveSection(item.sec);
                        }
                        setShowCommandPalette(false);
                        setCommandQuery('');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5 font-medium">
                        <item.icon size={15} className="text-blue-500" />
                        <span>{item.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Jump to view</span>
                    </button>
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification Floating Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Dynamic Floating Sandbox Simulator Bubble */}
      {currentBot && (
        <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto max-w-[calc(100vw-1.5rem)]">
          <AnimatePresence>
            {simulatorOpen && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                className="w-[calc(100vw-2rem)] sm:w-[360px] max-w-[360px] h-[80vh] max-h-[520px] bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              >
                {/* Header bar with custom indicators */}
                <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <div>
                      <p className="text-xs font-bold font-display">{currentBot.botName || 'Custom Assistant'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Sandbox Simulator</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSimulatorOpen(false)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* The real widget */}
                <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-[#0F172A]">
                  <ChatbotWidget config={currentBot} inline={true} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Launcher Button */}
          <button
            onClick={() => setSimulatorOpen(!simulatorOpen)}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            title="Launch Chatbot Sandbox Simulator"
          >
            {simulatorOpen ? (
              <X size={20} className="animate-none" />
            ) : (
              <div className="relative">
                <Bot size={22} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full"></span>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Global Enterprise Floating Voice Assistant Orb */}
      <FloatingVoiceAssistant token={token} addToast={addToast} setActiveSection={setActiveSection} />

      {/* 1. Global Delete Chatbot Confirmation Modal */}
      {botToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Delete Chatbot Confirmation
                </h3>
                <p className="text-[11px] text-slate-500">Instance ID: {botToDelete.id}</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-xl space-y-2">
              <p className="text-xs font-bold text-rose-900 dark:text-rose-300">
                Are you sure you want to permanently delete this chatbot?
              </p>
              <div className="text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0F172A] p-2 rounded border border-rose-100 dark:border-slate-800 font-mono">
                Chatbot Name: <strong className="text-rose-600 dark:text-rose-400 font-bold">{botToDelete.name || botToDelete.botName}</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              This action will delete the chatbot configuration, conversation history, associated files, knowledge base docs, and AI settings.
            </p>

            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={botDeleteConfirmText === (botToDelete.name || botToDelete.botName)}
                  onChange={(e) => setBotDeleteConfirmText(e.target.checked ? (botToDelete.name || botToDelete.botName) : '')}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Confirm deletion of <strong className="font-semibold">{botToDelete.name || botToDelete.botName}</strong></span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setBotToDelete(null);
                  setBotDeleteConfirmText('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={botDeleteConfirmText.trim() !== (botToDelete.name || botToDelete.botName).trim()}
                onClick={async () => {
                  const targetId = botToDelete.id;
                  setBotToDelete(null);
                  setBotDeleteConfirmText('');
                  await handleDeleteBot(targetId, { permanent: true, purgeKb: true, purgeHistory: true });
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

      {/* 2. Manage All Chatbots Modal */}
      {showManageBotsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bot size={20} className="text-blue-600 dark:text-blue-400" />
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Chatbot Management Studio
                </h3>
              </div>
              <button
                onClick={() => setShowManageBotsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs for Active vs Deleted Trash */}
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <button
                onClick={() => setManageBotsTab('active')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  manageBotsTab === 'active'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Bot size={14} />
                <span>Active Chatbots ({bots.length})</span>
              </button>
              <button
                onClick={() => {
                  setManageBotsTab('trash');
                  fetchDeletedBots();
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  manageBotsTab === 'trash'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Trash2 size={14} />
                <span>Restore / Trash ({deletedBots.length})</span>
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {manageBotsTab === 'active' ? (
                bots.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No active chatbots found.</p>
                ) : (
                  bots.map((b) => (
                    <div
                      key={b.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                        currentBot?.id === b.id
                          ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50'
                          : 'bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-850 dark:text-white">{b.name}</p>
                          {currentBot?.id === b.id && (
                            <span className="text-[9px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold font-mono">Active</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {b.id} • Model: {b.model || 'Gemini 3.5'}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {currentBot?.id !== b.id && (
                          <button
                            onClick={() => {
                              setCurrentBot(b);
                              setShowManageBotsModal(false);
                            }}
                            className="px-3 py-1.5 text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold cursor-pointer transition-all"
                          >
                            Select
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setBotToDelete(b);
                            setBotDeleteConfirmText('');
                          }}
                          className="px-3 py-1.5 text-xs bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-all"
                          title={`Delete chatbot "${b.name}"`}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                )
              ) : (
                deletedBots.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No soft-deleted chatbots in trash.</p>
                ) : (
                  deletedBots.map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F172A] flex items-center justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-850 dark:text-white">{b.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Deleted on: {b.deletedAt ? new Date(b.deletedAt).toLocaleDateString() : 'Recently'}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestoreBot(b.id)}
                          className="px-3 py-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <RotateCcw size={13} />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => {
                            setBotToDelete(b);
                            setBotDeleteConfirmText('');
                          }}
                          className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Trash2 size={13} />
                          <span>Purge Forever</span>
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span>Soft-deleted chatbots are retained for 30 days before automatic purge.</span>
              <button
                onClick={() => setShowManageBotsModal(false)}
                className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. First-Time AI Provider Setup Wizard Modal */}
      <AISetupWizard
        token={token}
        isOpen={showAiWizardModal || (!aiWizardCompleted && activeSection !== 'ai_settings')}
        onClose={() => setShowAiWizardModal(false)}
        onComplete={(cfg) => {
          setAiWizardCompleted(true);
          setShowAiWizardModal(false);
          addToast('success', 'AI Setup Complete', 'Your enterprise AI provider is active!');
          checkAiWizardStatus();
        }}
        addToast={addToast}
        allowSkip={true}
      />

    </div>
  );
};
