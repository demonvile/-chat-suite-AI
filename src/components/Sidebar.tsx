import React from 'react';
import { 
  Bot, HelpCircle, BarChart3, 
  Code, Home, LogOut, Moon, Sun, X, Settings, Users, MessageSquare,
  Calendar, ShieldAlert, Shield, LifeBuoy, Zap, Layers, ShieldCheck, Store, Mic, Database, CreditCard, Palette, Activity, HeartHandshake, Cpu, Brain
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  onLogout: () => void;
  companyName: string;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  onLogout,
  companyName,
  isDark,
  setIsDark,
  mobileOpen = false,
  setMobileOpen,
  userRole = 'user'
}) => {
  const menuItems = [
    { id: 'customizer', label: 'Chatbot Studio', icon: Settings },
    { id: 'team', label: 'Team Management', icon: Users, badge: 'Team' },
    { id: 'ai_settings', label: 'AI Provider Settings', icon: Cpu, badge: 'Groq' },
    { id: 'memory_studio', label: 'Conversation Memory', icon: Brain, badge: 'AI' },
    { id: 'whitelabel', label: 'White-Label & Branding', icon: Palette },
    { id: 'agent_marketplace', label: 'AI Agents Marketplace', icon: Bot, badge: '19' },
    { id: 'rag_knowledge', label: 'RAG Knowledge Base', icon: Database },
    { id: 'voice', label: 'AI Voice Assistant', icon: Mic },
    { id: 'marketplace', label: 'Plugin Marketplace', icon: Store },
    { id: 'inbox', label: 'Conversations Inbox', icon: MessageSquare },
    { id: 'workflows', label: 'Workflows & Automation', icon: Zap },
    { id: 'integrations_hub', label: 'Integrations Hub', icon: Layers },
    { id: 'leads', label: 'Visitor Leads', icon: Users },
    { id: 'appointments', label: 'Bookings & Schedule', icon: Calendar },
    { id: 'tickets', label: 'Support Tickets', icon: HelpCircle },
    { id: 'analytics', label: 'AI Analytics', icon: BarChart3 },
    { id: 'qa_suite', label: 'QA & Automated Testing', icon: ShieldCheck },
    { id: 'devops', label: 'DevOps & System Health', icon: Activity },
    { id: 'billing', label: 'Subscriptions & Billing', icon: CreditCard },
    { id: 'integration', label: 'Embed & API Keys', icon: Code },
    { id: 'settings', label: 'Account & Security', icon: Shield },
    { id: 'customer_success', label: 'Customer Success Center', icon: HeartHandshake, badge: 'CS' },
    { id: 'help', label: 'Help & Knowledge Center', icon: LifeBuoy },
  ];

  // If user is platform administrator, expose system-wide controller
  if (userRole === 'admin') {
    menuItems.push({ id: 'admin', label: 'Platform Admin', icon: ShieldAlert });
  }

  const renderContent = (closeMobile: () => void) => (
    <div className="flex flex-col justify-between h-full bg-[#090D16] text-slate-300 select-none">
      {/* Top section */}
      <div className="flex-1 overflow-y-auto">
        {/* Logo brand */}
        <div className="p-4.5 border-b border-slate-800/80 flex items-center justify-between gap-3 bg-[#090D16]">
          <div className="flex items-center gap-3">
            <div className="w-8.5 h-8.5 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 relative">
              <Bot size={18} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#090D16]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-bold text-white leading-none tracking-tight text-sm">ChatSuite AI</h1>
                <span className="text-[8px] font-mono bg-blue-950/80 text-blue-400 border border-blue-800/60 px-1 py-0.5 rounded font-bold">PRO</span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono mt-1 block uppercase tracking-wider truncate max-w-[120px]">{companyName || 'Business Portal'}</span>
            </div>
          </div>
          {setMobileOpen && (
            <button 
              onClick={closeMobile}
              className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-slate-800/60 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              aria-label="Close Navigation"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 bg-[#090D16]">
          <span className="block text-[8px] uppercase font-bold tracking-wider text-slate-500 mb-1.5 px-2.5">Dashboard Hub</span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  closeMobile();
                }}
                className={`w-full px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'settings' && (
                  <span className="text-[8px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 px-1 py-0.2 rounded font-mono">2FA ON</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom control links */}
      <div className="p-3 border-t border-slate-800/80 space-y-1 bg-[#090D16]">
        {/* System Health Status Indicator */}
        <div className="px-2.5 py-1.5 mb-1.5 bg-slate-900/40 rounded-lg border border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Gemini Core AI
          </span>
          <span className="text-emerald-400 font-bold">99.99%</span>
        </div>
        
        {/* Dark Mode toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="w-full px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 flex items-center gap-2.5 transition-colors cursor-pointer"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {isDark ? 'Light Theme' : 'Dark Theme'}
        </button>

        {/* Back to landing page */}
        <button
          onClick={() => {
            setActiveSection('landing');
            closeMobile();
          }}
          className="w-full px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 flex items-center gap-2.5 transition-colors cursor-pointer"
        >
          <Home size={16} />
          Main Site
        </button>

        {/* Log Out */}
        <button
          onClick={() => {
            onLogout();
            closeMobile();
          }}
          className="w-full px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-semibold text-rose-400/90 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sticky Sidebar */}
      <aside className="hidden md:flex w-60 bg-[#090D16] text-slate-300 border-r border-slate-800/80 flex-col justify-between shrink-0 h-screen sticky top-0 z-20">
        {renderContent(() => {})}
      </aside>

      {/* 2. Mobile slide-over drawer backdrop and panel */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            onClick={() => setMobileOpen?.(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Slide-out drawer body */}
          <aside className="relative flex flex-col w-64 max-w-xs h-full bg-[#090D16] border-r border-slate-800/80 shadow-2xl transition-transform duration-300 transform translate-x-0 z-10">
            {renderContent(() => setMobileOpen?.(false))}
          </aside>
        </div>
      )}
    </>
  );
};
