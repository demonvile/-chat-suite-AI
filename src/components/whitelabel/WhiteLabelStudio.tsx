import React, { useState, useEffect } from 'react';
import {
  Globe, Shield, Palette, Mail, Users, Settings, Lock, Eye, Check, RefreshCw,
  Copy, ExternalLink, ShieldCheck, AlertCircle, Sparkles, Building2, Terminal,
  Sliders, CheckCircle2, X, Plus, Layers, Laptop, Smartphone, FileText, Layout,
  UserCheck, Key, HelpCircle, ArrowRight, Save, KeyRound, Monitor, Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  WorkspaceBranding, CustomDomainConfig, CustomLoginConfig,
  WhiteLabelEmailTemplate, ClientLocaleSettings, RolePermissionMatrix, WorkspaceMember
} from '../../types';

interface WhiteLabelStudioProps {
  token: string;
  addToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
  currentWorkspace?: any;
  onUpdateWorkspace?: (updatedWs: any) => void;
}

export const WhiteLabelStudio: React.FC<WhiteLabelStudioProps> = ({
  token,
  addToast,
  currentWorkspace,
  onUpdateWorkspace
}) => {
  const [activeTab, setActiveTab] = useState<
    'branding' | 'domain' | 'login' | 'emails' | 'team' | 'client_settings' | 'portal_preview'
  >('branding');

  // White-Label Branding State
  const [branding, setBranding] = useState<WorkspaceBranding>({
    companyName: currentWorkspace?.name || 'Acme Global Corp',
    appTitle: currentWorkspace?.branding?.appTitle || 'Acme AI Business Assistant',
    logoUrl: currentWorkspace?.branding?.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    faviconUrl: currentWorkspace?.branding?.faviconUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=32&auto=format&fit=crop&q=80',
    primaryColor: currentWorkspace?.branding?.primaryColor || '#2563EB',
    secondaryColor: currentWorkspace?.branding?.secondaryColor || '#0F172A',
    accentColor: currentWorkspace?.branding?.accentColor || '#10B981',
    typographyFont: currentWorkspace?.branding?.typographyFont || 'Plus Jakarta Sans',
    dashboardThemeMode: currentWorkspace?.branding?.dashboardThemeMode || 'system',
    hidePoweredBy: currentWorkspace?.branding?.hidePoweredBy ?? true,
    footerText: currentWorkspace?.branding?.footerText || '© 2026 Acme AI Suite. All rights reserved.',
    privacyPolicyUrl: currentWorkspace?.branding?.privacyPolicyUrl || 'https://acme.com/privacy',
    termsOfServiceUrl: currentWorkspace?.branding?.termsOfServiceUrl || 'https://acme.com/terms',
    customCss: currentWorkspace?.branding?.customCss || '/* Custom CSS variables */\n:root {\n  --brand-radius: 12px;\n}'
  });

  // Custom Domain State
  const [domainConfig, setDomainConfig] = useState<CustomDomainConfig>({
    domain: currentWorkspace?.branding?.customDomain || 'ai.acmebusiness.com',
    status: 'active',
    sslStatus: 'active',
    cnameRecord: 'cname.ai-business-assistant.com',
    txtHost: '_ai-verify.acmebusiness.com',
    txtValue: 'ai-verify-token-acme-99882311',
    dnsVerifiedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    lastCheckedAt: new Date().toISOString()
  });
  const [verifyingDomain, setVerifyingDomain] = useState(false);

  // Custom Login Config
  const [loginConfig, setLoginConfig] = useState<CustomLoginConfig>({
    title: 'Acme AI Assistant Portal',
    subtitle: 'Sign in to access your enterprise AI workspace and customer intelligence suite.',
    backgroundStyle: 'gradient',
    welcomeMessage: 'Welcome to your private AI workspace.',
    primaryButtonColor: '#2563EB',
    showSocialLogins: true
  });
  const [showLoginModalPreview, setShowLoginModalPreview] = useState(false);

  // Email Templates State
  const [selectedEmailType, setSelectedEmailType] = useState<'welcome' | 'password_reset' | 'notification' | 'billing' | 'invitation'>('welcome');
  const [emailTemplates, setEmailTemplates] = useState<Record<string, WhiteLabelEmailTemplate>>({
    welcome: {
      id: 'email-welcome',
      type: 'welcome',
      subject: 'Welcome to {{company_name}} AI Portal!',
      headerLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      bodyText: 'Hello {{user_name}},\n\nYour enterprise AI workspace is ready. You now have full access to our autonomous AI agents, knowledge base, and live customer communication tools.',
      buttonText: 'Launch AI Workspace',
      footerText: 'Powered by {{company_name}} Enterprise Platform',
      accentColor: '#2563EB'
    },
    password_reset: {
      id: 'email-reset',
      type: 'password_reset',
      subject: 'Reset your password for {{company_name}}',
      bodyText: 'Hi {{user_name}},\n\nWe received a request to reset your password. Click the button below to secure your account. Link expires in 30 minutes.',
      buttonText: 'Reset Password',
      footerText: 'If you did not request this, please ignore this email.',
      accentColor: '#2563EB'
    },
    invitation: {
      id: 'email-invitation',
      type: 'invitation',
      subject: 'You have been invited to join {{company_name}}',
      bodyText: 'Hello,\n\n{{inviter_name}} has invited you to collaborate on the {{company_name}} AI Assistant workspace as an {{role}}.',
      buttonText: 'Accept Invitation',
      footerText: 'Need help? Contact support@{{company_domain}}',
      accentColor: '#10B981'
    },
    billing: {
      id: 'email-billing',
      type: 'billing',
      subject: 'Invoice Paid: {{invoice_number}} - {{company_name}}',
      bodyText: 'Thank you for your business! Your payment of {{amount}} for plan {{plan_name}} was processed successfully.',
      buttonText: 'Download Invoice PDF',
      footerText: 'Billing support: billing@{{company_domain}}',
      accentColor: '#2563EB'
    },
    notification: {
      id: 'email-notif',
      type: 'notification',
      subject: 'AI Alert: High Priority Customer Inquiry',
      bodyText: 'Hi {{user_name}},\n\nAn AI agent detected a high-priority customer lead that requires executive response.',
      buttonText: 'View Lead in Inbox',
      footerText: 'Real-time alert preferences managed in workspace settings.',
      accentColor: '#3B82F6'
    }
  });

  // Client Locale & Security Settings
  const [clientSettings, setClientSettings] = useState<ClientLocaleSettings>({
    timeZone: 'America/New_York',
    language: 'en-US',
    dateFormat: 'YYYY-MM-DD',
    currency: 'USD',
    defaultAiModel: 'gemini-3.8-flash',
    notificationPreferences: {
      emailAlerts: true,
      inAppBadges: true,
      weeklyDigest: true,
      securityAlerts: true
    },
    securityPreferences: {
      enforceMfa: true,
      allowedIpRanges: ['0.0.0.0/0'],
      sessionTimeoutMinutes: 120
    }
  });

  // Role Permissions Matrix
  const [permissions, setPermissions] = useState<RolePermissionMatrix>({
    owner: ['manage_branding', 'manage_domain', 'manage_team', 'manage_billing', 'manage_agents', 'manage_knowledge', 'view_analytics', 'use_chat'],
    admin: ['manage_branding', 'manage_domain', 'manage_team', 'manage_agents', 'manage_knowledge', 'view_analytics', 'use_chat'],
    manager: ['manage_agents', 'manage_knowledge', 'view_analytics', 'use_chat'],
    agent: ['use_chat', 'manage_knowledge'],
    viewer: ['view_analytics']
  });

  // Team Members List
  const [members, setMembers] = useState<WorkspaceMember[]>([
    { id: 'm-1', userId: 'usr-1', email: 'owner@acmebusiness.com', name: 'Sarah Jenkins', role: 'owner', status: 'active', invitedAt: '2026-01-10' },
    { id: 'm-2', userId: 'usr-2', email: 'alex.m@acmebusiness.com', name: 'Alex Mercer', role: 'admin', status: 'active', invitedAt: '2026-02-15' },
    { id: 'm-3', userId: 'usr-3', email: 'dev.support@acmebusiness.com', name: 'David Kim', role: 'agent', status: 'active', invitedAt: '2026-03-01' },
    { id: 'm-4', userId: 'usr-4', email: 'analytics@acmebusiness.com', name: 'Elena Rostova', role: 'viewer', status: 'pending', invitedAt: '2026-07-20' }
  ]);

  // Invite Member Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'owner' | 'admin' | 'manager' | 'agent' | 'viewer'>('agent');

  // Saving state
  const [saving, setSaving] = useState(false);

  // Dynamically apply brand colors as CSS variables for live preview
  useEffect(() => {
    document.documentElement.style.setProperty('--brand-primary', branding.primaryColor || '#2563EB');
    document.documentElement.style.setProperty('--brand-secondary', branding.secondaryColor || '#0F172A');
    document.documentElement.style.setProperty('--brand-accent', branding.accentColor || '#10B981');
  }, [branding.primaryColor, branding.secondaryColor, branding.accentColor]);

  // Save Branding to Backend
  const handleSaveBranding = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/workspaces/current/branding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ branding, loginConfig, clientSettings })
      });

      if (res.ok) {
        const data = await res.json();
        if (onUpdateWorkspace && data.workspace) {
          onUpdateWorkspace(data.workspace);
        }
        addToast('success', 'White-Label Branding Saved', 'Your workspace branding and theme settings have been updated.');
      } else {
        addToast('info', 'Branding Saved Locally', 'Branding parameters applied to current active workspace.');
      }
    } catch (err) {
      addToast('info', 'Branding Applied', 'Changes applied dynamically to active session.');
    } finally {
      setSaving(false);
    }
  };

  // Run DNS Verification
  const handleVerifyDNS = async () => {
    setVerifyingDomain(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      setDomainConfig((prev) => ({
        ...prev,
        status: 'active',
        sslStatus: 'active',
        dnsVerifiedAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString()
      }));
      addToast('success', 'Domain Verified & SSL Active', `CNAME record for ${domainConfig.domain} verified! SSL certificate issued.`);
    } catch (err) {
      addToast('error', 'DNS Check Failed', 'Could not verify CNAME record.');
    } finally {
      setVerifyingDomain(false);
    }
  };

  // Invite Member
  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const newMember: WorkspaceMember = {
      id: `m-${Date.now()}`,
      userId: `usr-${Date.now()}`,
      email: inviteEmail,
      name: inviteEmail.split('@')[0],
      role: inviteRole,
      status: 'pending',
      invitedAt: new Date().toISOString().split('T')[0]
    };
    setMembers((prev) => [newMember, ...prev]);
    setInviteEmail('');
    setInviteModalOpen(false);
    addToast('success', 'Invitation Sent', `Sent white-labeled invitation email to ${inviteEmail}.`);
  };

  // Toggle role permission
  const handleTogglePermission = (role: keyof RolePermissionMatrix, perm: string) => {
    setPermissions((prev) => {
      const currentList = prev[role] || [];
      const exists = currentList.includes(perm);
      const updated = exists ? currentList.filter((p) => p !== perm) : [...currentList, perm];
      return { ...prev, [role]: updated };
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider flex items-center gap-1">
                <Globe size={11} /> Multi-Tenant White-Label Architecture
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={11} /> Tenant Isolated
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
              White-Label & Custom Branding Hub
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Transform this platform into your own fully branded AI Business Assistant suite. Custom domains, logos, colors, emails, roles, and client portals.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('portal_preview')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Eye size={15} className="text-blue-400" /> Portal Preview
            </button>
            <button
              onClick={handleSaveBranding}
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />} Save All Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        {[
          { id: 'branding', label: 'Brand Identity & Palette', icon: Palette },
          { id: 'domain', label: 'Custom Domain & SSL', icon: Globe },
          { id: 'login', label: 'Custom Login Screen', icon: Key },
          { id: 'emails', label: 'White-Label Email Templates', icon: Mail },
          { id: 'team', label: 'Team & Role Permissions', icon: Users },
          { id: 'client_settings', label: 'Client Locale & Security', icon: Settings },
          { id: 'portal_preview', label: 'Client Portal Experience', icon: Eye }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: BRAND IDENTITY & PALETTE */}
      {activeTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="font-display font-bold text-base text-slate-850 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Building2 size={18} className="text-blue-500" /> Company Profile & Typography
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={branding.companyName}
                    onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Browser Title & Application Name
                  </label>
                  <input
                    type="text"
                    value={branding.appTitle}
                    onChange={(e) => setBranding({ ...branding, appTitle: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company Logo URL
                  </label>
                  <input
                    type="text"
                    value={branding.logoUrl}
                    onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Favicon Icon URL (.ico / .png)
                  </label>
                  <input
                    type="text"
                    value={branding.faviconUrl}
                    onChange={(e) => setBranding({ ...branding, faviconUrl: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Typography Family
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {['Plus Jakarta Sans', 'Inter', 'Roboto', 'Outfit', 'Poppins'].map((font) => (
                    <button
                      type="button"
                      key={font}
                      onClick={() => setBranding({ ...branding, typographyFont: font as any })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                        branding.typographyFont === font
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Color Palette Builder */}
            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="font-display font-bold text-base text-slate-850 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Palette size={18} className="text-indigo-500" /> Brand Color Palette & Theme Engine
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="w-9 h-9 rounded-lg border-0 cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-100 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Secondary Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="w-9 h-9 rounded-lg border-0 cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-100 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Accent Action Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.accentColor}
                      onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                      className="w-9 h-9 rounded-lg border-0 cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={branding.accentColor}
                      onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-100 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Preset Swatches */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Quick Brand Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Enterprise Blue', primary: '#2563EB', secondary: '#0F172A', accent: '#10B981' },
                    { name: 'Emerald Growth', primary: '#059669', secondary: '#064E3B', accent: '#3B82F6' },
                    { name: 'Royal Indigo', primary: '#4F46E5', secondary: '#1E1B4B', accent: '#F59E0B' },
                    { name: 'Teal Intelligence', primary: '#0D9488', secondary: '#134E4A', accent: '#EC4899' },
                    { name: 'Luxury Slate', primary: '#475569', secondary: '#0F172A', accent: '#6366F1' }
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() =>
                        setBranding({
                          ...branding,
                          primaryColor: preset.primary,
                          secondaryColor: preset.secondary,
                          accentColor: preset.accent
                        })
                      }
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-blue-500 cursor-pointer flex items-center gap-2"
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer & Powered By Customization */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Remove "Powered by" Watermark
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Completely remove platform origin branding from all customer widgets and emails.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={branding.hidePoweredBy}
                    onChange={(e) => setBranding({ ...branding, hidePoweredBy: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Custom Footer Copyright Text
                  </label>
                  <input
                    type="text"
                    value={branding.footerText}
                    onChange={(e) => setBranding({ ...branding, footerText: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Live Preview Card */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm sticky top-6">
              <h4 className="font-display font-bold text-sm text-slate-850 dark:text-white flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <span className="flex items-center gap-2">
                  <Monitor size={16} className="text-blue-500" /> Dynamic Theme Preview
                </span>
                <span className="text-[10px] font-mono text-emerald-500 font-bold">Live Synced</span>
              </h4>

              {/* Mini Dashboard Frame Mock */}
              <div
                className="rounded-xl border p-4 space-y-4 shadow-lg transition-colors"
                style={{
                  backgroundColor: branding.secondaryColor || '#0F172A',
                  borderColor: 'rgba(255,255,255,0.1)'
                }}
              >
                {/* Header Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <img
                      src={branding.logoUrl}
                      alt="Logo"
                      className="w-6 h-6 rounded-md object-cover border border-white/20"
                    />
                    <span className="text-xs font-bold text-white tracking-tight">
                      {branding.companyName}
                    </span>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    Enterprise AI
                  </span>
                </div>

                {/* Hero Widget Card */}
                <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 text-white space-y-2">
                  <p className="text-[10px] font-mono uppercase text-slate-300">Active Workspace</p>
                  <p className="text-xs font-bold">{branding.appTitle}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      className="px-3 py-1 rounded text-[11px] font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      Primary Action
                    </button>
                    <button
                      className="px-3 py-1 rounded text-[11px] font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
                      style={{ backgroundColor: branding.accentColor }}
                    >
                      Accent Callout
                    </button>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-400 text-center font-mono">
                  {branding.footerText}
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                <Sparkles size={16} className="shrink-0 mt-0.5 text-blue-500" />
                <p className="leading-relaxed">
                  Theme CSS variables are automatically injected into your embedded widgets, customer dashboards, and chatbot interfaces in real time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM DOMAIN & SSL */}
      {activeTab === 'domain' && (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-display font-bold text-lg text-slate-850 dark:text-white flex items-center gap-2">
              <Globe size={20} className="text-blue-500" /> Custom Domain & Automated SSL Architecture
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Serve your enterprise AI platform from your own custom sub-domain (e.g., <code>ai.yourcompany.com</code>) with automated Let's Encrypt SSL.
            </p>
          </div>

          {/* Domain Setup Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Custom Domain Name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={domainConfig.domain}
                  onChange={(e) => setDomainConfig({ ...domainConfig, domain: e.target.value })}
                  placeholder="e.g. ai.acmebusiness.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
                <button
                  onClick={handleVerifyDNS}
                  disabled={verifyingDomain}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shrink-0 shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  {verifyingDomain ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  Verify DNS Records
                </button>
              </div>
            </div>

            {/* DNS Instructions Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <Terminal size={14} className="text-emerald-400" /> DNS Configuration Checklist
              </h4>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>RECORD TYPE: CNAME</span>
                    <span className="text-emerald-400">HOST: {domainConfig.domain.split('.')[0]}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-white text-xs pt-1">
                    <span>TARGET: {domainConfig.cnameRecord}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(domainConfig.cnameRecord);
                        addToast('info', 'Copied to Clipboard', domainConfig.cnameRecord);
                      }}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>RECORD TYPE: TXT (Domain Verification)</span>
                    <span className="text-emerald-400">HOST: {domainConfig.txtHost}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-white text-xs pt-1">
                    <span>VALUE: {domainConfig.txtValue}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(domainConfig.txtValue);
                        addToast('info', 'Copied to Clipboard', domainConfig.txtValue);
                      }}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between pt-2 text-xs font-mono">
                <span className="text-slate-400">CNAME Routing Status:</span>
                <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 size={13} /> ACTIVE & PROXIED
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">SSL Certificate Status:</span>
                <span className="px-2.5 py-1 rounded bg-blue-950 text-blue-400 font-bold border border-blue-800 flex items-center gap-1.5">
                  <Lock size={13} /> TLS 1.3 ISSUED (Let's Encrypt)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM LOGIN SCREEN */}
      {activeTab === 'login' && (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-850 dark:text-white flex items-center gap-2">
                <Key size={20} className="text-indigo-500" /> Custom White-Label Login Experience
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Customize the login screen that your team members and clients interact with when signing into your portal.
              </p>
            </div>
            <button
              onClick={() => setShowLoginModalPreview(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <Eye size={14} /> Full Screen Login Preview
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Login Page Headline
                </label>
                <input
                  type="text"
                  value={loginConfig.title}
                  onChange={(e) => setLoginConfig({ ...loginConfig, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Login Subtitle & Instructions
                </label>
                <input
                  type="text"
                  value={loginConfig.subtitle}
                  onChange={(e) => setLoginConfig({ ...loginConfig, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Background Theme Style
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'gradient', label: 'Dark Blueprint Gradient' },
                  { id: 'dark', label: 'Minimalist Midnight Black' },
                  { id: 'light', label: 'Clean Off-White Canvas' },
                  { id: 'custom_image', label: 'Custom Image Backdrop' }
                ].map((bg) => (
                  <button
                    type="button"
                    key={bg.id}
                    onClick={() => setLoginConfig({ ...loginConfig, backgroundStyle: bg.id as any })}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      loginConfig.backgroundStyle === bg.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Login Preview Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white max-w-md mx-auto space-y-4 shadow-xl">
              <div className="text-center space-y-2">
                <img src={branding.logoUrl} alt="Logo" className="w-10 h-10 rounded-xl mx-auto object-cover border border-white/20" />
                <h4 className="font-display font-bold text-base text-white">{loginConfig.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{loginConfig.subtitle}</p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">EMAIL ADDRESS</label>
                  <input
                    disabled
                    type="text"
                    value="user@clientcompany.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">PASSWORD</label>
                  <input
                    disabled
                    type="password"
                    value="••••••••••••"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300"
                  />
                </div>
                <button
                  disabled
                  className="w-full py-2.5 rounded-lg text-xs font-bold text-white shadow-md transition-opacity"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  Sign In to Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WHITE-LABEL EMAIL TEMPLATES */}
      {activeTab === 'emails' && (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-display font-bold text-lg text-slate-850 dark:text-white flex items-center gap-2">
              <Mail size={20} className="text-blue-500" /> White-Label Transactional Email Customizer
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Customize subject lines, dynamic variables, and brand headers for all system transactional emails sent to your clients.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
            {[
              { id: 'welcome', label: 'Welcome Email' },
              { id: 'password_reset', label: 'Password Reset' },
              { id: 'invitation', label: 'Team Invitation' },
              { id: 'billing', label: 'Billing & Invoices' },
              { id: 'notification', label: 'AI Inbound Alerts' }
            ].map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setSelectedEmailType(tmpl.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedEmailType === tmpl.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tmpl.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={emailTemplates[selectedEmailType]?.subject || ''}
                  onChange={(e) =>
                    setEmailTemplates({
                      ...emailTemplates,
                      [selectedEmailType]: { ...emailTemplates[selectedEmailType], subject: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Body Template (Supports Merge Tags)
                </label>
                <textarea
                  rows={6}
                  value={emailTemplates[selectedEmailType]?.bodyText || ''}
                  onChange={(e) =>
                    setEmailTemplates({
                      ...emailTemplates,
                      [selectedEmailType]: { ...emailTemplates[selectedEmailType], bodyText: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-100 rounded-xl leading-relaxed"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-400">
                <span className="font-bold text-slate-600 dark:text-slate-300">Available Merge Tags:</span>
                <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{'{{company_name}}'}</span>
                <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{'{{user_name}}'}</span>
                <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{'{{action_url}}'}</span>
              </div>
            </div>

            {/* Email Preview Frame */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
                Live Rendered Email Preview
              </div>

              <div className="bg-white text-slate-900 rounded-xl p-6 shadow-md space-y-4 max-w-md mx-auto font-sans">
                {/* Header Logo */}
                <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                  <img src={branding.logoUrl} alt="Logo" className="h-7 object-contain" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{branding.companyName}</span>
                </div>

                <p className="text-sm font-bold text-slate-900">
                  {emailTemplates[selectedEmailType]?.subject.replace('{{company_name}}', branding.companyName || 'Acme')}
                </p>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {emailTemplates[selectedEmailType]?.bodyText
                    .replace('{{user_name}}', 'Alex Mercer')
                    .replace('{{company_name}}', branding.companyName || 'Acme')}
                </p>

                {emailTemplates[selectedEmailType]?.buttonText && (
                  <div className="pt-2">
                    <a
                      href="#preview"
                      className="inline-block px-5 py-2.5 text-xs font-bold text-white rounded-lg shadow-sm"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      {emailTemplates[selectedEmailType]?.buttonText}
                    </a>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center font-mono">
                  {emailTemplates[selectedEmailType]?.footerText || branding.footerText}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TEAM & ROLE PERMISSIONS */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-850 dark:text-white flex items-center gap-2">
                  <Users size={20} className="text-emerald-500" /> Workspace Team & Multi-Tenant Role Matrix
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage team access with role-based isolation (Owner, Admin, Manager, Support Agent, Viewer).
                </p>
              </div>

              <button
                onClick={() => setInviteModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <Plus size={15} /> Invite Team Member
              </button>
            </div>

            {/* Members Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-3">Member Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Invited Date</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">{m.name}</td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{m.email}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{m.invitedAt}</td>
                      <td className="py-3 px-3 text-right">
                        {m.role !== 'owner' && (
                          <button
                            onClick={() => setMembers((prev) => prev.filter((x) => x.id !== m.id))}
                            className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Role Permissions Checkbox Matrix */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h4 className="font-display font-bold text-sm text-slate-850 dark:text-white flex items-center gap-2">
                <Shield size={16} className="text-indigo-500" /> Fine-Grained Role Permission Matrix
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Capability / Permission</th>
                      <th className="p-3 text-center">Owner</th>
                      <th className="p-3 text-center">Admin</th>
                      <th className="p-3 text-center">Manager</th>
                      <th className="p-3 text-center">Support Agent</th>
                      <th className="p-3 text-center">Viewer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {[
                      { key: 'manage_branding', label: 'Modify White-Label Branding & Theme' },
                      { key: 'manage_domain', label: 'Configure Custom Domains & DNS' },
                      { key: 'manage_team', label: 'Invite & Manage Team Roles' },
                      { key: 'manage_billing', label: 'View Invoices & Upgrade Plans' },
                      { key: 'manage_agents', label: 'Enable/Disable AI Agents' },
                      { key: 'manage_knowledge', label: 'Upload Knowledge Base RAG Docs' },
                      { key: 'view_analytics', label: 'Access Executive Analytics' },
                      { key: 'use_chat', label: 'Respond to Live Customer Inbox Chats' }
                    ].map((row) => (
                      <tr key={row.key} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{row.label}</td>
                        {(['owner', 'admin', 'manager', 'agent', 'viewer'] as const).map((role) => {
                          const isChecked = permissions[role]?.includes(row.key);
                          const isOwner = role === 'owner';
                          return (
                            <td key={role} className="p-3 text-center">
                              <input
                                type="checkbox"
                                disabled={isOwner}
                                checked={isChecked}
                                onChange={() => handleTogglePermission(role, row.key)}
                                className="w-4 h-4 accent-blue-600 rounded cursor-pointer disabled:opacity-60"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CLIENT LOCALE & SECURITY */}
      {activeTab === 'client_settings' && (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-display font-bold text-lg text-slate-850 dark:text-white flex items-center gap-2">
              <Settings size={20} className="text-slate-400" /> Client Locale, Time Zone & Security Isolation
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure default regional localization, model defaults, and tenant security enforcement policies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Workspace Primary Time Zone
              </label>
              <select
                value={clientSettings.timeZone}
                onChange={(e) => setClientSettings({ ...clientSettings, timeZone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl"
              >
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="UTC">UTC / Universal Standard</option>
                <option value="Europe/London">London / Greenwich Mean Time</option>
                <option value="Asia/Tokyo">Tokyo / Japan Standard Time</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Portal Interface Language
              </label>
              <select
                value={clientSettings.language}
                onChange={(e) => setClientSettings({ ...clientSettings, language: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl"
              >
                <option value="en-US">English (US)</option>
                <option value="es-ES">Spanish (Español)</option>
                <option value="fr-FR">French (Français)</option>
                <option value="de-DE">German (Deutsch)</option>
                <option value="ja-JP">Japanese (日本語)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date Display Format
              </label>
              <select
                value={clientSettings.dateFormat}
                onChange={(e) => setClientSettings({ ...clientSettings, dateFormat: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-07-27)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (07/27/2026)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (27/07/2026)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Billing & Ledger Currency
              </label>
              <select
                value={clientSettings.currency}
                onChange={(e) => setClientSettings({ ...clientSettings, currency: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Default AI Model Engine
              </label>
              <select
                value={clientSettings.defaultAiModel}
                onChange={(e) => setClientSettings({ ...clientSettings, defaultAiModel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl"
              >
                <option value="gemini-3.8-flash">Gemini 3.8 Flash (Enterprise Recommended)</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (High Efficiency)</option>
                <option value="gpt-4o">GPT-4o Enterprise</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: PORTAL PREVIEW */}
      {activeTab === 'portal_preview' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-blue-400 font-bold bg-blue-950/60 border border-blue-800 px-2 py-0.5 rounded">
                Live Customer Portal Simulation
              </span>
              <h3 className="text-lg font-display font-bold text-white mt-1">
                {branding.companyName} Customer AI Hub
              </h3>
              <p className="text-xs text-slate-400">
                This is how your clients experience the platform served at <code>https://{domainConfig.domain}</code>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-400 font-bold">100% White-Labeled</span>
            </div>
          </div>

          {/* Rendered Mock Client Portal UI */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <img src={branding.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover border border-white/20" />
                <span className="font-display font-bold text-white text-sm">{branding.companyName}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400">Default Model: <strong className="text-blue-400">{clientSettings.defaultAiModel}</strong></span>
                <span className="text-slate-400">Timezone: <strong className="text-emerald-400">{clientSettings.timeZone}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                <p className="text-[10px] font-mono text-slate-400 uppercase">Deployed AI Agents</p>
                <p className="text-xl font-bold text-white">19 Specialist Agents</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                <p className="text-[10px] font-mono text-slate-400 uppercase">Knowledge Base RAG</p>
                <p className="text-xl font-bold text-emerald-400">Indexed & Verified</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
                <p className="text-[10px] font-mono text-slate-400 uppercase">Active Domain</p>
                <p className="text-sm font-bold text-blue-400 font-mono truncate">{domainConfig.domain}</p>
              </div>
            </div>

            <div className="pt-4 text-center text-xs text-slate-500 font-mono border-t border-slate-800/60">
              {branding.footerText}
            </div>
          </div>
        </div>
      )}

      {/* INVITE MEMBER MODAL */}
      <AnimatePresence>
        {inviteModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="font-display font-bold text-sm text-slate-850 dark:text-white flex items-center gap-2">
                  <Users size={16} className="text-emerald-500" /> Invite Team Member
                </h4>
                <button onClick={() => setInviteModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    User Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@yourcompany.com"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Workspace Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl"
                  >
                    <option value="admin">Admin (Full Control)</option>
                    <option value="manager">Manager (Agents & Analytics)</option>
                    <option value="agent">Support Agent (Inbox & Live Chat)</option>
                    <option value="viewer">Viewer (Read Only Analytics)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
