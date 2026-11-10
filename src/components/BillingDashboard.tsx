import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Shield, Zap, Sparkles, Check, AlertTriangle, ArrowUpRight, 
  Download, Clock, Calendar, CheckCircle2, AlertCircle, Plus, Trash2, 
  RefreshCw, Lock, DollarSign, Users, Database, Layers, Bot, Activity,
  Globe, HelpCircle, FileText, ChevronRight, X, ShieldAlert, BarChart3, TrendingUp
} from 'lucide-react';
import { PlanTier, WorkspaceSubscription, WorkspaceLimits, WorkspaceUsage, Invoice, PaymentMethod, SaaSRevenueAnalytics } from '../types';
import { paymentGateways } from '../lib/paymentGateways';

interface BillingDashboardProps {
  token: string;
  currentWorkspaceId?: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'business_user';
  };
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({
  token,
  currentWorkspaceId = 'ws-admin-user',
  user,
  addToast
}) => {
  // State variables
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<WorkspaceSubscription | null>(null);
  const [limits, setLimits] = useState<WorkspaceLimits | null>(null);
  const [usage, setUsage] = useState<WorkspaceUsage & { botCount?: number; memberCount?: number } | null>(null);
  const [plans, setPlans] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  
  // Controls state
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanTier | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'stripe' | 'paypal'>('stripe');
  
  // Checkout Modal Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpMonth, setCardExpMonth] = useState('12');
  const [cardExpYear, setCardExpYear] = useState('2028');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Cancellation Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelImmediate, setCancelImmediate] = useState(false);
  const [canceling, setCanceling] = useState(false);

  // Add Payment Method Modal
  const [showAddPmModal, setShowAddPmModal] = useState(false);

  // Admin Controls State
  const [adminAnalytics, setAdminAnalytics] = useState<SaaSRevenueAnalytics | null>(null);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [adminWorkspaces, setAdminWorkspaces] = useState<any[]>([]);

  // Fetch Billing Data
  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspaceId}/billing`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscription(data.subscription);
        setLimits(data.limits);
        setUsage(data.usage);
        setPlans(data.plans);
        setInvoices(data.invoices || []);
        if (data.subscription?.billingCycle) {
          setBillingCycle(data.subscription.billingCycle);
        }
      }

      // Fetch payment methods
      const pmRes = await fetch(`/api/workspaces/${currentWorkspaceId}/billing/payment-methods`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (pmRes.ok) {
        const pmData = await pmRes.json();
        setPaymentMethods(pmData || []);
      }

      // Fetch billing email logs
      const emailRes = await fetch(`/api/workspaces/${currentWorkspaceId}/billing/emails`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (emailRes.ok) {
        const logsData = await emailRes.json();
        setEmailLogs(logsData || []);
      }
    } catch (err) {
      console.error('Error fetching billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Simulation: Trigger Renewal
  const handleSimulateRenewal = async () => {
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspaceId}/billing/simulate-renewal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message || 'Renewal simulated successfully', 'success');
        fetchBillingData();
      } else {
        addToast(data.error || 'Failed to simulate renewal', 'error');
      }
    } catch (err) {
      addToast('Error simulating renewal', 'error');
    }
  };

  // Simulation: Trigger Payment Failure
  const handleSimulateFailedPayment = async () => {
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspaceId}/billing/simulate-failed-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Insufficient card funds during automated attempt' })
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message || 'Payment failure simulated and email sent', 'info');
        fetchBillingData();
      } else {
        addToast(data.error || 'Failed to simulate payment failure', 'error');
      }
    } catch (err) {
      addToast('Error simulating payment failure', 'error');
    }
  };

  // Fetch Admin SaaS Financial Analytics
  const fetchAdminAnalytics = async () => {
    if (user.role !== 'admin') return;
    setLoadingAdmin(true);
    try {
      const res = await fetch('/api/billing/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminAnalytics(data);
      }

      // Also get multi-tenant accounts list
      const usersRes = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setAdminWorkspaces(usersData);
      }
    } catch (err) {
      console.error('Error fetching admin analytics:', err);
    } finally {
      setLoadingAdmin(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
    if (user.role === 'admin') {
      fetchAdminAnalytics();
    }
  }, [currentWorkspaceId, user.role]);

  // Execute Subscription Plan Upgrade / Checkout
  const handleExecuteCheckout = async () => {
    if (!selectedPlanForCheckout) return;
    setProcessingPayment(true);

    try {
      const cardBrand = paymentGateways.detectCardBrand(cardNumber);
      const last4 = cardNumber.replace(/\D/g, '').slice(-4) || '4242';

      const res = await fetch(`/api/workspaces/${currentWorkspaceId}/billing/checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: selectedPlanForCheckout,
          billingCycle,
          provider: selectedProvider,
          paymentDetails: {
            brand: selectedProvider === 'paypal' ? 'PayPal' : cardBrand,
            last4: selectedProvider === 'paypal' ? 'PayP' : last4
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        addToast(data.message || 'Subscription updated successfully!', 'success');
        setShowUpgradeModal(false);
        fetchBillingData();
        if (user.role === 'admin') fetchAdminAnalytics();
      } else {
        addToast(data.error || 'Failed to complete transaction', 'error');
      }
    } catch (err) {
      addToast('Payment authorization error', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Cancel Subscription
  const handleCancelSubscription = async () => {
    setCanceling(true);
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspaceId}/billing/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: cancelReason,
          immediate: cancelImmediate
        })
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message, 'info');
        setShowCancelModal(false);
        fetchBillingData();
      } else {
        addToast(data.error || 'Failed to cancel subscription', 'error');
      }
    } catch (err) {
      addToast('Server error while processing cancellation', 'error');
    } finally {
      setCanceling(false);
    }
  };

  // Resume Subscription
  const handleResumeSubscription = async () => {
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspaceId}/billing/resume-subscription`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Subscription resumed successfully!', 'success');
        fetchBillingData();
      } else {
        addToast(data.error || 'Failed to resume subscription', 'error');
      }
    } catch (err) {
      addToast('Error resuming subscription', 'error');
    }
  };

  // Save New Payment Method
  const handleAddPaymentMethod = async () => {
    try {
      const cardBrand = paymentGateways.detectCardBrand(cardNumber);
      const last4 = cardNumber.replace(/\D/g, '').slice(-4) || '4242';

      const res = await fetch(`/api/workspaces/${currentWorkspaceId}/billing/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          provider: selectedProvider,
          type: selectedProvider === 'paypal' ? 'paypal_account' : 'card',
          brand: selectedProvider === 'paypal' ? 'PayPal' : cardBrand,
          last4: selectedProvider === 'paypal' ? 'PayPal' : last4,
          expMonth: parseInt(cardExpMonth, 10),
          expYear: parseInt(cardExpYear, 10),
          email: selectedProvider === 'paypal' ? paypalEmail : user.email,
          isDefault: true
        })
      });

      if (res.ok) {
        addToast('New payment method attached successfully', 'success');
        setShowAddPmModal(false);
        fetchBillingData();
      } else {
        const err = await res.json();
        addToast(err.error || 'Failed to save payment method', 'error');
      }
    } catch (err) {
      addToast('Error saving payment method', 'error');
    }
  };

  // Set Default Payment Method
  const handleSetDefaultPm = async (pmId: string) => {
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspaceId}/billing/payment-methods/${pmId}/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('Default payment method updated', 'success');
        fetchBillingData();
      }
    } catch (err) {
      addToast('Error setting default payment method', 'error');
    }
  };

  // Admin Actions
  const handleAdminGrantCredits = async (wsId: string) => {
    try {
      const res = await fetch('/api/billing/admin/grant-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ workspaceId: wsId, creditsAmount: 2500 })
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message, 'success');
        fetchBillingData();
        fetchAdminAnalytics();
      }
    } catch (err) {
      addToast('Admin error granting credits', 'error');
    }
  };

  const handleAdminExtendTrial = async (wsId: string) => {
    try {
      const res = await fetch('/api/billing/admin/extend-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ workspaceId: wsId, extensionDays: 14 })
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message, 'success');
        fetchBillingData();
        fetchAdminAnalytics();
      }
    } catch (err) {
      addToast('Admin error extending trial', 'error');
    }
  };

  const handleAdminToggleSuspend = async (wsId: string, currentStatus: string) => {
    const endpoint = currentStatus === 'suspended' ? '/api/billing/admin/subscriptions/restore' : '/api/billing/admin/subscriptions/suspend';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ workspaceId: wsId, reason: 'Admin panel toggle action' })
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message, 'info');
        fetchBillingData();
        fetchAdminAnalytics();
      }
    } catch (err) {
      addToast('Admin suspend error', 'error');
    }
  };

  // Download Invoice HTML/PDF
  const handleDownloadInvoice = (invoiceId: string) => {
    window.open(`/api/workspaces/${currentWorkspaceId}/billing/invoices/${invoiceId}/download`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <RefreshCw size={24} className="animate-spin text-blue-500 mb-3" />
        <p className="text-xs font-mono">Loading SaaS Subscription & Financial Engine...</p>
      </div>
    );
  }

  const currentPlanTier = subscription?.plan || 'free';
  const currentPlanInfo = plans?.[currentPlanTier] || { name: 'Free Trial Plan' };
  
  // Usage calculations
  const msgUsed = usage?.messagesThisMonth || 0;
  const msgLimit = limits?.maxMessagesPerMonth || 100;
  const msgPct = msgLimit === -1 ? 5 : Math.min(100, Math.round((msgUsed / msgLimit) * 100));

  const storageUsed = usage?.storageUsedMb || 0;
  const storageLimit = limits?.maxStorageMb || 100;
  const storagePct = Math.min(100, Math.round((storageUsed / storageLimit) * 100));

  const botsCount = usage?.botCount || usage?.activeAgentsCount || 0;
  const botsLimit = limits?.maxBots || 3;
  const botsPct = botsLimit === -1 ? 10 : Math.min(100, Math.round((botsCount / botsLimit) * 100));

  const membersCount = usage?.memberCount || 1;
  const membersLimit = limits?.maxMembers || 3;
  const membersPct = membersLimit === -1 ? 5 : Math.min(100, Math.round((membersCount / membersLimit) * 100));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* 1. HERO HEADER & CURRENT SUBSCRIPTION STATUS BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold text-xs uppercase tracking-wider rounded-full flex items-center gap-1.5">
                <Sparkles size={13} className="text-blue-400" />
                {currentPlanInfo.name}
              </span>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                subscription?.status === 'active' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : subscription?.status === 'trial'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                ● {subscription?.status === 'trial' ? '14-Day Free Trial' : subscription?.status?.toUpperCase()}
              </span>
              {subscription?.cancelAtPeriodEnd && (
                <span className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold rounded">
                  Cancels at Period End
                </span>
              )}
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-white">
              SaaS Subscription & Billing Center
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Manage your commercial AI workspace plan, track real-time quota usage, review invoices, and manage Stripe & PayPal payment gateways.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setSelectedPlanForCheckout('business');
                setShowUpgradeModal(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30"
            >
              <Zap size={14} /> Upgrade Plan
            </button>
            {subscription?.cancelAtPeriodEnd ? (
              <button
                onClick={handleResumeSubscription}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Resume Subscription
              </button>
            ) : (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {/* Renewal & Trial Alert Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Calendar size={15} className="text-blue-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Billing Cycle</p>
              <p className="font-semibold text-white">
                {subscription?.billingCycle === 'yearly' ? 'Yearly (20% Discount Active)' : 'Monthly Recurring'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-300">
            <Clock size={15} className="text-amber-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Next Renewal Date</p>
              <p className="font-semibold text-white">
                {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-300">
            <Shield size={15} className="text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Default Gateway</p>
              <p className="font-semibold text-white flex items-center gap-1">
                {subscription?.paymentProvider?.toUpperCase() || 'STRIPE'} ({subscription?.paymentMethodBrand || 'Card'} •••• {subscription?.paymentMethodLast4 || '4242'})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REALTIME USAGE LIMITS & QUOTA MONITORING GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Activity size={18} className="text-blue-500" /> Quota & Usage Limits
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live workspace telemetry updated on every AI completion and API request.
            </p>
          </div>
          {subscription?.bonusCredits ? (
            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg flex items-center gap-1.5">
              <Sparkles size={13} /> +{subscription.bonusCredits} Bonus AI Credits Active
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Usage Card 1: AI Messages */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Bot size={15} className="text-blue-500" /> AI Messages
              </span>
              <span className="text-[10px] font-mono text-slate-400">{msgPct}% Used</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">{msgUsed.toLocaleString()}</span>
                <span className="text-xs text-slate-400 font-mono">/ {msgLimit === -1 ? 'Unlimited' : msgLimit.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${msgPct > 90 ? 'bg-rose-500' : msgPct > 70 ? 'bg-amber-500' : 'bg-blue-600'}`}
                  style={{ width: `${msgPct}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">Resets monthly on period renewal date.</p>
          </div>

          {/* Usage Card 2: Knowledge Base Storage */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Database size={15} className="text-indigo-500" /> KB Storage
              </span>
              <span className="text-[10px] font-mono text-slate-400">{storagePct}% Used</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">{storageUsed} MB</span>
                <span className="text-xs text-slate-400 font-mono">/ {storageLimit} MB</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${storagePct > 90 ? 'bg-rose-500' : storagePct > 70 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                  style={{ width: `${storagePct}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">RAG document vectors and PDFs stored.</p>
          </div>

          {/* Usage Card 3: AI Agents Deployed */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers size={15} className="text-emerald-500" /> AI Chatbots
              </span>
              <span className="text-[10px] font-mono text-slate-400">{botsPct}% Used</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">{botsCount}</span>
                <span className="text-xs text-slate-400 font-mono">/ {botsLimit === -1 ? 'Unlimited' : botsLimit}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${botsPct}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">Active white-label widget bots.</p>
          </div>

          {/* Usage Card 4: Team Members */}
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users size={15} className="text-amber-500" /> Team Seats
              </span>
              <span className="text-[10px] font-mono text-slate-400">{membersPct}% Used</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">{membersCount}</span>
                <span className="text-xs text-slate-400 font-mono">/ {membersLimit === -1 ? 'Unlimited' : membersLimit}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${membersPct}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">Collaborator accounts invited.</p>
          </div>

        </div>
      </div>

      {/* AI UPGRADE RECOMMENDATION BANNER */}
      {(msgPct > 75 || storagePct > 75 || currentPlanTier === 'free') && (
        <div className="p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                AI Optimization Recommendation: Upgrade to {currentPlanTier === 'free' ? 'Starter' : currentPlanTier === 'starter' ? 'Professional' : 'Business'} Plan
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Your workspace is utilizing high capacity ({msgPct}% messages, {storagePct}% KB storage). Upgrading unlocks white-label branding, high-rate API endpoints, and expanded AI team seats.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedPlanForCheckout(currentPlanTier === 'free' ? 'starter' : currentPlanTier === 'starter' ? 'pro' : 'business');
              setShowUpgradeModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors shrink-0 shadow-sm"
          >
            Upgrade Now
          </button>
        </div>
      )}

      {/* 3. SUBSCRIPTION PLAN PRICING COMPARISON GRID */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Zap size={20} className="text-blue-600" /> Commercial SaaS Plans & Pricing
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select the optimal plan tier for your business automation needs.
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 self-start sm:self-auto">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Yearly Billing <span className="px-1.5 py-0.5 bg-emerald-400 text-slate-950 font-extrabold text-[9px] rounded">SAVE 20%</span>
            </button>
          </div>
        </div>

        {/* 5-Tier Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          
          {/* Tier 1: Free */}
          <div className={`bg-white dark:bg-[#0B1120] border rounded-2xl p-5 flex flex-col justify-between space-y-5 transition-all ${
            currentPlanTier === 'free' ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200 dark:border-slate-800'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Free Trial</span>
                {currentPlanTier === 'free' && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-[9px] rounded-full">Current</span>
                )}
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">$0</div>
                <div className="text-[10px] text-slate-400">Free forever with basic limits</div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Individual evaluation sandbox.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-1.5"><Check size={13} className="text-blue-500" /> 1 AI Chatbot</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-blue-500" /> 100 AI Messages/mo</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-blue-500" /> 1 Team Member</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-blue-500" /> 10 MB Storage</li>
              </ul>
            </div>
            <button
              disabled={currentPlanTier === 'free'}
              onClick={() => {
                setSelectedPlanForCheckout('free');
                setShowUpgradeModal(true);
              }}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {currentPlanTier === 'free' ? 'Active Plan' : 'Downgrade'}
            </button>
          </div>

          {/* Tier 2: Starter */}
          <div className={`bg-white dark:bg-[#0B1120] border rounded-2xl p-5 flex flex-col justify-between space-y-5 transition-all ${
            currentPlanTier === 'starter' ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200 dark:border-slate-800'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Starter</span>
                {currentPlanTier === 'starter' && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-[9px] rounded-full">Current</span>
                )}
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  ${billingCycle === 'yearly' ? '24' : '29'}
                  <span className="text-xs text-slate-400 font-normal">/mo</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {billingCycle === 'yearly' ? '$288 billed yearly' : 'Billed monthly'}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Small team customer support automation.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-1.5"><Check size={13} className="text-blue-500" /> 3 AI Chatbots</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-blue-500" /> 2,000 Messages/mo</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-blue-500" /> 3 Team Members</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-blue-500" /> 100 MB KB Storage</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-blue-500" /> API Keys & Webhooks</li>
              </ul>
            </div>
            <button
              onClick={() => {
                setSelectedPlanForCheckout('starter');
                setShowUpgradeModal(true);
              }}
              className={`w-full py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                currentPlanTier === 'starter' 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              }`}
            >
              {currentPlanTier === 'starter' ? 'Current Plan' : 'Select Starter'}
            </button>
          </div>

          {/* Tier 3: Professional (Popular) */}
          <div className={`bg-gradient-to-b from-blue-900/10 via-slate-900/40 to-slate-900/60 dark:bg-[#0B1120] border-2 rounded-2xl p-5 flex flex-col justify-between space-y-5 transition-all relative overflow-hidden ${
            currentPlanTier === 'pro' ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xl' : 'border-blue-500/60 shadow-lg'
          }`}>
            <div className="absolute top-0 right-0 bg-blue-600 text-white font-extrabold text-[9px] uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-sm">
              MOST POPULAR
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                  <Sparkles size={12} /> Professional
                </span>
                {currentPlanTier === 'pro' && (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-bold text-[9px] rounded-full">Current</span>
                )}
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  ${billingCycle === 'yearly' ? '64' : '79'}
                  <span className="text-xs text-slate-400 font-normal">/mo</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {billingCycle === 'yearly' ? '$768 billed yearly' : 'Billed monthly'}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Growing SaaS businesses requiring white-label branding.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-1.5"><Check size={13} className="text-blue-400" /> 10 AI Chatbots</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-blue-400" /> 15,000 Messages/mo</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-blue-400" /> 10 Team Seats</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-blue-400" /> 1 GB Storage</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-blue-400" /> White-Labeling</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-blue-400" /> Custom Domains</li>
              </ul>
            </div>
            <button
              onClick={() => {
                setSelectedPlanForCheckout('pro');
                setShowUpgradeModal(true);
              }}
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              {currentPlanTier === 'pro' ? 'Current Plan' : 'Choose Professional'}
            </button>
          </div>

          {/* Tier 4: Business */}
          <div className={`bg-white dark:bg-[#0B1120] border rounded-2xl p-5 flex flex-col justify-between space-y-5 transition-all ${
            currentPlanTier === 'business' ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200 dark:border-slate-800'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Business</span>
                {currentPlanTier === 'business' && (
                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-bold text-[9px] rounded-full">Current</span>
                )}
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  ${billingCycle === 'yearly' ? '159' : '199'}
                  <span className="text-xs text-slate-400 font-normal">/mo</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {billingCycle === 'yearly' ? '$1,908 billed yearly' : 'Billed monthly'}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                High-volume operations with complex workflows.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-1.5"><Check size={13} className="text-purple-500" /> 30 AI Chatbots</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-purple-500" /> 50,000 Messages/mo</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-purple-500" /> 25 Team Seats</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-purple-500" /> 10 GB Storage</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-purple-500" /> 50 Automation Workflows</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-purple-500" /> Dedicated SLA Support</li>
              </ul>
            </div>
            <button
              onClick={() => {
                setSelectedPlanForCheckout('business');
                setShowUpgradeModal(true);
              }}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              {currentPlanTier === 'business' ? 'Current Plan' : 'Select Business'}
            </button>
          </div>

          {/* Tier 5: Enterprise */}
          <div className={`bg-white dark:bg-[#0B1120] border rounded-2xl p-5 flex flex-col justify-between space-y-5 transition-all ${
            currentPlanTier === 'enterprise' ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200 dark:border-slate-800'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Enterprise</span>
                {currentPlanTier === 'enterprise' && (
                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold text-[9px] rounded-full">Current</span>
                )}
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  ${billingCycle === 'yearly' ? '399' : '499'}
                  <span className="text-xs text-slate-400 font-normal">/mo</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {billingCycle === 'yearly' ? '$4,788 billed yearly' : 'Billed monthly'}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Unlimited scale & white-glove custom integrations.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-1.5"><Check size={13} className="text-amber-500" /> Unlimited AI Chatbots</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-amber-500" /> Unlimited Messages</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-amber-500" /> Unlimited Seats</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-amber-500" /> 100 GB KB Storage</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-amber-500" /> 99.99% Uptime SLA</li>
              </ul>
            </div>
            <button
              onClick={() => {
                setSelectedPlanForCheckout('enterprise');
                setShowUpgradeModal(true);
              }}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-700"
            >
              {currentPlanTier === 'enterprise' ? 'Current Plan' : 'Select Enterprise'}
            </button>
          </div>

        </div>
      </div>

      {/* 4. PAYMENT GATEWAYS & SAVED PAYMENT METHODS */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard size={18} className="text-blue-500" /> Payment Architecture & Gateways
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Modular integration supporting Stripe Credit Cards and PayPal Express Checkout.
            </p>
          </div>
          <button
            onClick={() => setShowAddPmModal(true)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus size={14} /> Add Payment Method
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.length === 0 ? (
            <div className="col-span-2 p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-2">
              <CreditCard size={28} className="text-slate-300 mx-auto" />
              <p className="text-xs font-mono text-slate-400">No saved payment methods attached.</p>
              <button
                onClick={() => setShowAddPmModal(true)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Attach Stripe Card or PayPal
              </button>
            </div>
          ) : (
            paymentMethods.map((pm) => (
              <div 
                key={pm.id} 
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                  pm.isDefault 
                    ? 'border-blue-500 bg-blue-500/5' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F172A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs">
                    {pm.provider === 'paypal' ? 'PP' : '💳'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{pm.brand || 'Card'}</span>
                      {pm.isDefault && (
                        <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-bold rounded">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {pm.provider === 'paypal' ? pm.email : `•••• •••• •••• ${pm.last4}`}
                    </p>
                  </div>
                </div>

                {!pm.isDefault && (
                  <button
                    onClick={() => handleSetDefaultPm(pm.id)}
                    className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Set Default
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. BILLING HISTORY & DOWNLOAD INVOICES TABLE */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <FileText size={18} className="text-blue-500" /> Billing History & Printable Invoices
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Download itemized PDF receipts for accounting & tax reporting.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {invoices.length === 0 ? (
            <p className="text-xs text-slate-400 font-mono py-8 text-center">No invoices generated yet.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                  <th className="py-3 px-2">Invoice #</th>
                  <th className="py-3 px-2">Plan Details</th>
                  <th className="py-3 px-2">Period</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 px-2 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {inv.number}
                    </td>
                    <td className="py-3.5 px-2 text-slate-600 dark:text-slate-300 font-semibold">
                      {inv.planName}
                    </td>
                    <td className="py-3.5 px-2 text-slate-400 font-mono text-[11px]">
                      {inv.period}
                    </td>
                    <td className="py-3.5 px-2 font-bold font-mono text-slate-800 dark:text-slate-200">
                      ${inv.amount.toFixed(2)} USD
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[9px] uppercase font-bold rounded">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(inv.id)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 rounded text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Download size={12} /> Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 6. AUTOMATED BILLING NOTIFICATION EMAILS & LIFECYCLE SIMULATOR */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Globe size={18} className="text-indigo-500" /> Automated Email Notifications & Lifecycle Audit Trail
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dispatches automated receipts, payment failure alerts, renewal reminders, and cancellation notices.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSimulateRenewal}
              className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500 hover:text-white text-blue-600 dark:text-blue-400 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw size={12} /> Test Renewal Email
            </button>
            <button
              onClick={handleSimulateFailedPayment}
              className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <AlertTriangle size={12} /> Test Payment Failure
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {emailLogs.length === 0 ? (
            <p className="text-xs text-slate-400 font-mono py-6 text-center">No email notifications sent yet. Use the test buttons above to trigger automated emails.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {emailLogs.map((log: any) => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                        log.type === 'payment_success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        log.type === 'payment_failed' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                        log.type === 'upcoming_renewal' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        {log.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{log.subject}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800/60 font-sans leading-relaxed">
                      {log.bodyText}
                    </p>
                  </div>
                  <div className="text-right shrink-0 pt-1">
                    <span className="text-[10px] text-slate-400 font-mono block">{new Date(log.sentAt).toLocaleString()}</span>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase">● {log.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. PLATFORM ADMIN SAAS FINANCIAL METRICS & TENANT CONTROLS */}
      {user.role === 'admin' && adminAnalytics && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-300 font-bold text-[9px] uppercase tracking-wider rounded border border-rose-500/30">
                SUPER ADMIN CONTROLS
              </span>
              <h3 className="font-display font-bold text-xl text-white flex items-center gap-2 mt-1">
                <BarChart3 size={20} className="text-blue-400" /> SaaS Revenue & Subscription Analytics
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Total All-Time Revenue</span>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono">${adminAnalytics.totalRevenueAllTime.toLocaleString()} USD</p>
            </div>
          </div>

          {/* Key SaaS Financial Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-center">
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">MRR</p>
              <p className="text-xl font-bold text-blue-400 font-mono">${adminAnalytics.mrr.toLocaleString()}</p>
            </div>
            <div className="p-3.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-center">
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">ARR</p>
              <p className="text-xl font-bold text-indigo-400 font-mono">${adminAnalytics.arr.toLocaleString()}</p>
            </div>
            <div className="p-3.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-center">
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Paid Subscribers</p>
              <p className="text-xl font-bold text-emerald-400 font-mono">{adminAnalytics.activeSubscriptions}</p>
            </div>
            <div className="p-3.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-center">
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Active Trials</p>
              <p className="text-xl font-bold text-amber-400 font-mono">{adminAnalytics.activeTrialsCount}</p>
            </div>
            <div className="p-3.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-center">
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">ARPU</p>
              <p className="text-xl font-bold text-purple-400 font-mono">${adminAnalytics.arpu}</p>
            </div>
            <div className="p-3.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-center">
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Est. LTV</p>
              <p className="text-xl font-bold text-sky-400 font-mono">${adminAnalytics.ltv.toLocaleString()}</p>
            </div>
          </div>

          {/* Multi-Tenant Account Subscription Management Table */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 font-mono">Multi-Tenant Subscriptions Control</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 font-mono">
                    <th className="py-2.5 px-2">Tenant Account</th>
                    <th className="py-2.5 px-2">Active Plan</th>
                    <th className="py-2.5 px-2">Status</th>
                    <th className="py-2.5 px-2 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {adminWorkspaces.map((acc: any) => (
                    <tr key={acc.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-2">
                        <p className="font-bold text-white">{acc.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{acc.email}</p>
                      </td>
                      <td className="py-3 px-2 font-bold text-blue-400 uppercase font-mono">
                        {acc.role === 'admin' ? 'Enterprise Super' : 'Starter Business'}
                      </td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold rounded">
                          ACTIVE
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right space-x-1.5">
                        <button
                          onClick={() => handleAdminGrantCredits(acc.id || 'ws-admin-user')}
                          className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          +2.5k Credits
                        </button>
                        <button
                          onClick={() => handleAdminExtendTrial(acc.id || 'ws-admin-user')}
                          className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          +14 Days Trial
                        </button>
                        <button
                          onClick={() => handleAdminToggleSuspend(acc.id || 'ws-admin-user', 'active')}
                          className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          Suspend
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT / UPGRADE MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden space-y-5 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Checkout & Upgrade Plan
                </h3>
                <p className="text-xs text-slate-500">
                  Upgrading to {selectedPlanForCheckout?.toUpperCase()} Plan
                </p>
              </div>
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Provider Selection (Stripe vs PayPal) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Payment Gateway</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProvider('stripe')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    selectedProvider === 'stripe' ? 'border-blue-600 bg-blue-500/10 text-blue-600' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <CreditCard size={15} /> Stripe Credit Card
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProvider('paypal')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    selectedProvider === 'paypal' ? 'border-blue-600 bg-blue-500/10 text-blue-600' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  PayPal Express
                </button>
              </div>
            </div>

            {selectedProvider === 'stripe' ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 •••• •••• 4242"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Exp Date</label>
                    <input
                      type="text"
                      value={`${cardExpMonth}/${cardExpYear}`}
                      onChange={(e) => {
                        const parts = e.target.value.split('/');
                        if (parts[0]) setCardExpMonth(parts[0]);
                        if (parts[1]) setCardExpYear(parts[1]);
                      }}
                      placeholder="12/2028"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CVC</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">PayPal Account Email</label>
                <input
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="user@paypal.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 font-mono text-xs"
                />
              </div>
            )}

            <button
              onClick={handleExecuteCheckout}
              disabled={processingPayment}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
            >
              {processingPayment ? <RefreshCw className="animate-spin" size={14} /> : <Lock size={14} />}
              {processingPayment ? 'Authorizing Gateway...' : 'Authorize Payment & Activate Plan'}
            </button>
          </div>
        </div>
      )}

      {/* CANCELLATION MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="text-rose-500" size={20} /> Cancel SaaS Subscription
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to cancel your subscription? You will lose access to premium AI quota limits and custom white-label branding.
            </p>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cancellation Reason</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Help us improve. Why are you canceling?"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cancelImm"
                checked={cancelImmediate}
                onChange={(e) => setCancelImmediate(e.target.checked)}
                className="rounded text-blue-600"
              />
              <label htmlFor="cancelImm" className="text-xs text-slate-600 dark:text-slate-300">
                Cancel immediately (revert to Free Plan now)
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={canceling}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
              >
                {canceling ? 'Canceling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PAYMENT METHOD MODAL */}
      {showAddPmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Add New Payment Gateway
              </h3>
              <button onClick={() => setShowAddPmModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 •••• •••• 4242"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleAddPaymentMethod}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer"
            >
              Attach Payment Method
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
