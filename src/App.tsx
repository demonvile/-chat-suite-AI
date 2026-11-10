import React, { useState, useEffect } from 'react';
import { 
  Bot, Shield, LogIn, UserPlus, HelpCircle, ArrowLeft, 
  Settings, Users, BarChart3, Code, Moon, Sun, Menu, X, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatbotConfig, User } from './types';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';

export default function App() {
  // Session / Auth States
  const [token, setToken] = useState<string>(() => localStorage.getItem('chatsite_token') || '');
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('chatsite_user');
    return saved ? JSON.parse(saved) : null;
  });

  // View Routing: 'landing' | 'login' | 'register' | 'dashboard'
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'register' | 'dashboard'>(() => {
    const savedToken = localStorage.getItem('chatsite_token');
    return savedToken ? 'dashboard' : 'landing';
  });

  // Active dashboard secondary section
  const [activeDashboardSection, setActiveDashboardSection] = useState<string>('customizer');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Master Dark / Light Theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('chatsite_theme') === 'dark';
  });

  // Default Demo bot for Landing page chats (acts as representative)
  const [demoBot, setDemoBot] = useState<ChatbotConfig | null>(null);

  // Auth Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Sync theme selection to localStorage and body styles
  useEffect(() => {
    localStorage.setItem('chatsite_theme', isDark ? 'dark' : 'light');
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Fetch or fall back to platform demo chatbot configuration
  useEffect(() => {
    const fetchDemoBot = async () => {
      try {
        const res = await fetch('/api/bots/default-bot');
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const d = await res.json();
          setDemoBot(d);
        }
      } catch (err) {
        console.error('Error fetching default landing bot', err);
      }
    };
    fetchDemoBot();
  }, []);

  // Validate existing session token on app load and auto-refresh if needed
  useEffect(() => {
    const validateInitialSession = async () => {
      const savedToken = localStorage.getItem('chatsite_token');
      if (!savedToken) return;

      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(savedToken);
          localStorage.setItem('chatsite_user', JSON.stringify(data.user));
        } else if (res.status === 401) {
          // Attempt automatic session refresh
          const refreshRes = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${savedToken}` }
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            setToken(refreshData.token);
            setUser(refreshData.user);
            localStorage.setItem('chatsite_token', refreshData.token);
            localStorage.setItem('chatsite_user', JSON.stringify(refreshData.user));
          } else {
            // Token expired or invalid -> clear and redirect to login
            localStorage.removeItem('chatsite_token');
            localStorage.removeItem('chatsite_user');
            setToken('');
            setUser(null);
            setAuthError('Session expired or invalid. Please sign in again.');
            setCurrentView('login');
          }
        }
      } catch (err) {
        console.error('Session validation network error:', err);
      }
    };

    validateInitialSession();
  }, []);

  // Sync auth parameters to localStorage
  const handleAuthSuccess = (jwt: string, profile: User) => {
    setToken(jwt);
    setUser(profile);
    localStorage.setItem('chatsite_token', jwt);
    localStorage.setItem('chatsite_user', JSON.stringify(profile));
    setAuthError('');
    setCurrentView('dashboard');
  };

  // Login execution handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      setAuthLoading(false);

      if (res.ok) {
        handleAuthSuccess(data.token, data.user);
        // Reset fields
        setEmail('');
        setPassword('');
      } else {
        setAuthError(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setAuthLoading(false);
      setAuthError('Connection error to auth servers.');
    }
  };

  // Sign Up execution handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, companyName })
      });

      const data = await res.json();
      setAuthLoading(false);

      if (res.ok) {
        handleAuthSuccess(data.token, data.user);
        // Reset fields
        setEmail('');
        setPassword('');
        setName('');
        setCompanyName('');
      } else {
        setAuthError(data.error || 'Failed to create your business account.');
      }
    } catch (err) {
      setAuthLoading(false);
      setAuthError('Connection error registering account.');
    }
  };

  // Logout execution handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {
      console.error('Error during backend logout', e);
    }
    setToken('');
    setUser(null);
    localStorage.removeItem('chatsite_token');
    localStorage.removeItem('chatsite_user');
    setCurrentView('landing');
  };

  // Master layout theme wrapper
  const themeContainerClass = isDark ? 'dark bg-[#0F172A] text-slate-100' : 'bg-slate-50 text-slate-800';

  return (
    <div className={`min-h-screen flex flex-col ${themeContainerClass} transition-colors duration-200`}>
      
      {/* View routing renders */}
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: PUBLIC SALES LANDING PAGE */}
        {currentView === 'landing' && demoBot && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            <LandingPage 
              demoBotConfig={demoBot} 
              onLoginClick={() => setCurrentView('login')}
              onRegisterClick={() => setCurrentView('register')}
            />
          </motion.div>
        )}

        {/* VIEW 2: LOGIN WORKFLOW PAGE */}
        {currentView === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden bg-slate-50 dark:bg-[#080d19]"
          >
            {/* Background design elements for maximum visual depth */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-400/10 dark:bg-teal-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800/80 p-8 rounded-3xl shadow-2xl space-y-6 relative z-10">
              
              {/* Top description */}
              <div className="text-center space-y-2.5">
                <button 
                  onClick={() => setCurrentView('landing')}
                  className="mx-auto flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} /> Return to Home
                </button>

                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/10">
                  <LogIn size={20} />
                </div>
                
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h3>
                <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Log in to manage your white-labeled virtual assistants, train custom knowledge, and view lead pipelines.
                </p>
              </div>

              {/* Form details */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-mono">Business Email</label>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full text-xs px-3.5 py-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-shadow focus:shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 font-mono">Password</label>
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs px-3.5 py-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-shadow focus:shadow-inner"
                  />
                </div>

                {authError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-650 dark:text-rose-400 bg-rose-50/75 dark:bg-rose-950/20 px-3 py-2.5 rounded-lg border border-rose-100 dark:border-rose-950/50">
                    <span>⚠️ {authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 hover:shadow-lg active:scale-[0.99]"
                >
                  {authLoading ? <RefreshCw className="animate-spin" size={13} /> : 'Sign In to Dashboard'}
                </button>
              </form>

              {/* Developer testing helpers (Commercial Sandbox mode) */}
              <div className="bg-gradient-to-tr from-blue-500/[0.04] to-indigo-500/[0.04] border border-blue-150/40 dark:border-slate-800 p-4.5 rounded-2xl text-center space-y-3.5 shadow-xs">
                <div>
                  <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-blue-600 bg-blue-100/50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full font-mono">
                    Commercial Sandbox Preview
                  </span>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Instantly test the secure, white-labeled dashboard using pre-loaded partner credentials.
                  </p>
                </div>

                <button 
                  onClick={() => {
                    setEmail('admin@platform.com');
                    setPassword('admin123');
                  }}
                  className="w-full py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                >
                  ⚡ Auto-Fill Demo Credentials
                </button>
              </div>

              <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                Don't have an account?{' '}
                <button 
                  onClick={() => setCurrentView('register')}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  Create business account
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* VIEW 3: REGISTER WORKFLOW PAGE */}
        {currentView === 'register' && (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex-1 flex items-center justify-center px-6 py-12"
          >
            <div className="w-full max-w-md bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
              
              {/* Top description */}
              <div className="text-center space-y-2">
                <button 
                  onClick={() => setCurrentView('landing')}
                  className="mx-auto flex items-center gap-1 text-xs font-semibold text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} /> Back to landing page
                </button>

                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <UserPlus size={20} />
                </div>
                
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Register Business Account</h3>
                <p className="text-xs text-slate-400">Launch white-label support virtual assistants in minutes.</p>
              </div>

              {/* Form details */}
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1">Your Full Name</label>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Johnson"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1">Company / Brand Name</label>
                  <input 
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1">Secure Password</label>
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                  />
                </div>

                {authError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-3 py-2 rounded-lg">
                    <span>⚠️ {authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/15"
                >
                  {authLoading ? <RefreshCw className="animate-spin" size={13} /> : 'Create Account'}
                </button>
              </form>

              <div className="text-center text-xs text-slate-400">
                Already registered?{' '}
                <button 
                  onClick={() => setCurrentView('login')}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* VIEW 4: SECURED MASTER BUSINESS DASHBOARD LAYOUT */}
        {currentView === 'dashboard' && user && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex"
          >
            {/* Sidebar Navigation */}
            <Sidebar 
              activeSection={activeDashboardSection}
              setActiveSection={(section) => {
                if (section === 'landing') {
                  setCurrentView('landing');
                } else {
                  setActiveDashboardSection(section);
                }
              }}
              onLogout={handleLogout}
              companyName={user.companyName}
              isDark={isDark}
              setIsDark={setIsDark}
              mobileOpen={mobileSidebarOpen}
              setMobileOpen={setMobileSidebarOpen}
              userRole={user.role}
            />

            {/* Dashboard Content Container */}
            <Dashboard 
              token={token}
              user={user}
              activeSection={activeDashboardSection}
              setActiveSection={setActiveDashboardSection}
              onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              onLogout={handleLogout}
              onSessionExpired={(msg?: string) => {
                setAuthError(msg || 'Session expired. Please sign in again.');
                handleLogout();
              }}
              onTokenRefreshed={(newToken: string, updatedUser: User) => {
                setToken(newToken);
                setUser(updatedUser);
                localStorage.setItem('chatsite_token', newToken);
                localStorage.setItem('chatsite_user', JSON.stringify(updatedUser));
              }}
            />

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
