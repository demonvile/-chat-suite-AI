import React, { useState } from 'react';
import { 
  CheckCircle2, Circle, ArrowRight, Sparkles, Bot, Database, 
  Layers, Trophy, RefreshCw, Play, FileText, Globe, Check, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InteractiveOnboardingProps {
  addToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  onNavigateToSection: (section: string) => void;
}

export const InteractiveOnboarding: React.FC<InteractiveOnboardingProps> = ({
  addToast,
  onNavigateToSection
}) => {
  const [completedSteps, setCompletedSteps] = useState<string[]>(['ws_setup', 'bot_create']);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showBotWizard, setShowBotWizard] = useState(false);
  const [showKnowledgeWizard, setShowKnowledgeWizard] = useState(false);
  const [showIntegrationWizard, setShowIntegrationWizard] = useState(false);

  // Bot Wizard State
  const [botWizardData, setBotWizardData] = useState({
    name: 'Customer Service Concierge',
    systemPrompt: 'You are a helpful, professional customer service virtual assistant.',
    model: 'gemini-3.8-flash',
    accentColor: '#2563eb'
  });

  // Knowledge Wizard State
  const [kbWizardData, setKbWizardData] = useState({
    url: 'https://acme.com/help',
    docType: 'website'
  });

  const steps = [
    {
      id: 'ws_setup',
      title: 'Workspace Configuration',
      desc: 'Set custom organization name, logo, and brand color palette in White-Label Studio.',
      section: 'whitelabel',
      reward: '50 Credits'
    },
    {
      id: 'bot_create',
      title: 'Create First AI Agent',
      desc: 'Configure custom bot personality, system instructions, and primary language.',
      action: () => setShowBotWizard(true),
      reward: '100 Credits'
    },
    {
      id: 'kb_upload',
      title: 'Ingest Knowledge Base',
      desc: 'Upload searchable PDF manuals or crawl your website HTTPS URLs for RAG grounding.',
      action: () => setShowKnowledgeWizard(true),
      reward: '150 Credits'
    },
    {
      id: 'integration',
      title: 'Setup Integrations & Webhooks',
      desc: 'Connect Zapier, Slack, or custom webhooks to stream captured leads to your CRM.',
      action: () => setShowIntegrationWizard(true),
      reward: '100 Credits'
    },
    {
      id: 'embed_deploy',
      title: 'Deploy Embedded Widget',
      desc: 'Paste script snippet into your website HTML before </head> tag.',
      section: 'integration',
      reward: '200 Credits'
    }
  ];

  const progressPercent = Math.round((completedSteps.length / steps.length) * 100);

  const toggleStep = (id: string) => {
    if (completedSteps.includes(id)) {
      setCompletedSteps(completedSteps.filter(s => s !== id));
    } else {
      const next = [...completedSteps, id];
      setCompletedSteps(next);
      addToast('success', 'Step Completed!', 'Progress updated. Reward points credited.');
      if (next.length === steps.length) {
        addToast('success', '🏆 Onboarding Completed!', 'Congratulations! You unlocked the Onboarding Master badge and 600 bonus AI credits.');
      }
    }
  };

  const handleFinishBotWizard = () => {
    if (!completedSteps.includes('bot_create')) {
      setCompletedSteps([...completedSteps, 'bot_create']);
    }
    setShowBotWizard(false);
    addToast('success', 'AI Agent Created!', `Agent "${botWizardData.name}" has been configured.`);
    if (onNavigateToSection) {
      onNavigateToSection('customizer');
    }
  };

  const handleFinishKbWizard = () => {
    if (!completedSteps.includes('kb_upload')) {
      setCompletedSteps([...completedSteps, 'kb_upload']);
    }
    setShowKnowledgeWizard(false);
    addToast('success', 'Knowledge Source Ingested!', `Target source "${kbWizardData.url}" queued for grounding index.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Onboarding Progress Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Trophy size={14} className="text-amber-400" /> Fast-Track Onboarding Center
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome to ChatSuite AI Onboarding
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Complete these 5 setup milestones to activate neural RAG grounding, deploy your website widget, and claim 600 free AI credits.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl flex flex-col items-center justify-center text-center shrink-0 min-w-[200px]">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" className="text-white/20" fill="transparent" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="32" 
                  stroke="currentColor" 
                  strokeWidth="6" 
                  className="text-emerald-400 transition-all duration-700" 
                  fill="transparent" 
                  strokeDasharray="201" 
                  strokeDashoffset={201 - (201 * progressPercent) / 100} 
                  strokeLinecap="round" 
                />
              </svg>
              <span className="absolute font-display font-bold text-lg text-white">{progressPercent}%</span>
            </div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-300 mt-2">
              {completedSteps.length} of {steps.length} Milestones
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between gap-4 text-xs">
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-400 to-emerald-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-mono text-emerald-300 font-bold shrink-0">
            {progressPercent === 100 ? '🎉 All Done!' : 'In Progress'}
          </span>
        </div>
      </div>

      {/* Completion Reward Callout */}
      {progressPercent === 100 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 flex items-center gap-4 text-emerald-200"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
            <Award size={22} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Onboarding Certification Unlocked!</h4>
            <p className="text-xs text-emerald-300">Your workspace is 100% production-ready. 600 bonus AI credits have been added to your billing subscription.</p>
          </div>
        </motion.div>
      )}

      {/* Interactive Checklist Grid */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase font-bold tracking-wider font-mono text-slate-500 dark:text-slate-400">
          Setup Checklist & Guided Wizards
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {steps.map((step, idx) => {
            const isDone = completedSteps.includes(step.id);
            return (
              <div 
                key={step.id} 
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone 
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60' 
                    : 'bg-white dark:bg-[#0B1120] border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button 
                    onClick={() => toggleStep(step.id)}
                    className="mt-0.5 cursor-pointer text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    {isDone ? (
                      <CheckCircle2 size={22} className="text-emerald-500 fill-emerald-500/20" />
                    ) : (
                      <Circle size={22} />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        Step {idx + 1}
                      </span>
                      <h4 className={`font-display font-bold text-sm ${isDone ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {step.title}
                      </h4>
                      <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        +{step.reward}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                      {step.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {step.action ? (
                    <button
                      onClick={step.action}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Launch Wizard</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : step.section ? (
                    <button
                      onClick={() => onNavigateToSection(step.section)}
                      className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Go to Page</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI BOT CREATION WIZARD MODAL */}
      <AnimatePresence>
        {showBotWizard && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                      AI Agent Creation Wizard
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Step 1 of 3: Agent Personality & Neural Model</p>
                  </div>
                </div>
                <button onClick={() => setShowBotWizard(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Agent Name</label>
                  <input
                    type="text"
                    value={botWizardData.name}
                    onChange={(e) => setBotWizardData({ ...botWizardData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Gemini AI Model Engine</label>
                  <select
                    value={botWizardData.model}
                    onChange={(e) => setBotWizardData({ ...botWizardData, model: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="gemini-3.8-flash">Gemini 3.8 Flash (Fast, Sub-300ms, Recommended)</option>
                    <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (High Efficiency)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">System Directive / Persona Prompt</label>
                  <textarea
                    rows={3}
                    value={botWizardData.systemPrompt}
                    onChange={(e) => setBotWizardData({ ...botWizardData, systemPrompt: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowBotWizard(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinishBotWizard}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-blue-600/20"
                >
                  Save Agent & Complete Step
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* KNOWLEDGE BASE SETUP WIZARD MODAL */}
      <AnimatePresence>
        {showKnowledgeWizard && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                      Knowledge Base Ingestion Wizard
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Connect files or website URLs for RAG Grounding</p>
                  </div>
                </div>
                <button onClick={() => setShowKnowledgeWizard(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Knowledge Source Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setKbWizardData({ ...kbWizardData, docType: 'website' })}
                      className={`p-3 rounded-xl border flex items-center gap-2 font-bold cursor-pointer ${
                        kbWizardData.docType === 'website' ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <Globe size={16} /> Website URL Crawler
                    </button>
                    <button
                      onClick={() => setKbWizardData({ ...kbWizardData, docType: 'pdf' })}
                      className={`p-3 rounded-xl border flex items-center gap-2 font-bold cursor-pointer ${
                        kbWizardData.docType === 'pdf' ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <FileText size={16} /> PDF / Doc Manual
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {kbWizardData.docType === 'website' ? 'Target Website Sitemap / Page URL' : 'Upload File Source'}
                  </label>
                  <input
                    type="text"
                    value={kbWizardData.url}
                    onChange={(e) => setKbWizardData({ ...kbWizardData, url: e.target.value })}
                    placeholder="https://yourcompany.com/help"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowKnowledgeWizard(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinishKbWizard}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  Start Grounding Ingestion
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INTEGRATIONS WIZARD MODAL */}
      <AnimatePresence>
        {showIntegrationWizard && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                      Integration & Webhooks Setup
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Stream visitor leads & transcripts into external CRMs</p>
                  </div>
                </div>
                <button onClick={() => setShowIntegrationWizard(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
              </div>

              <div className="space-y-4 text-xs">
                <p className="text-slate-600 dark:text-slate-300">
                  ChatSuite AI connects natively with Zapier, Make, Slack, Salesforce, and custom REST API webhooks.
                </p>

                <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-[11px] space-y-2">
                  <p className="text-amber-400">// Sample Lead Outbound Webhook JSON Event</p>
                  <pre className="overflow-x-auto whitespace-pre-wrap">
                    {`{\n  "event": "lead_captured",\n  "botId": "bot-default",\n  "visitorEmail": "alex@customer.com",\n  "intent": "Pricing Inquiry"\n}`}
                  </pre>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowIntegrationWizard(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 text-xs cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (!completedSteps.includes('integration')) {
                      setCompletedSteps([...completedSteps, 'integration']);
                    }
                    setShowIntegrationWizard(false);
                    addToast('success', 'Integration Verified!', 'Webhooks configured for active bot.');
                  }}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
                >
                  Confirm Integration Setup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
