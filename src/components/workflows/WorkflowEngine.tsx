import React, { useState, useEffect } from 'react';
import { 
  Zap, Plus, Play, Layers, ShieldCheck, BarChart2, 
  Sparkles, ToggleLeft, ToggleRight, Trash2, Edit3, 
  Search, ArrowRight, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { Workflow, WorkflowExecution, WorkflowAnalytics as IWorkflowAnalytics, ChatbotConfig } from '../../types';
import { WorkflowBuilder } from './WorkflowBuilder';
import { WorkflowExecutionsLog } from './WorkflowExecutionsLog';
import { WorkflowTemplatesModal } from './WorkflowTemplatesModal';
import { WorkflowAnalytics } from './WorkflowAnalytics';

interface WorkflowEngineProps {
  token: string;
  user: any;
  currentBot?: ChatbotConfig | null;
}

export const WorkflowEngine: React.FC<WorkflowEngineProps> = ({
  token,
  user,
  currentBot
}) => {
  const [activeTab, setActiveTab] = useState<'workflows' | 'executions' | 'analytics'>('workflows');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [analytics, setAnalytics] = useState<IWorkflowAnalytics | null>(null);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchWorkflowsData = async () => {
    setIsLoading(true);
    try {
      const [wfRes, execRes, anaRes] = await Promise.all([
        fetch('/api/workflows', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/workflows/executions', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/workflows/analytics', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (wfRes.ok) {
        const wfData = await wfRes.json();
        setWorkflows(wfData);
      }
      if (execRes.ok) {
        const execData = await execRes.json();
        setExecutions(execData);
      }
      if (anaRes.ok) {
        const anaData = await anaRes.json();
        setAnalytics(anaData);
      }
    } catch (err) {
      console.error('Error loading workflow data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflowsData();
  }, [token]);

  const handleToggleActive = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchWorkflowsData();
      }
    } catch (err) {
      console.error('Failed to toggle workflow:', err);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow rule?')) return;
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchWorkflowsData();
      }
    } catch (err) {
      console.error('Failed to delete workflow:', err);
    }
  };

  const handleCreateNewWorkflow = () => {
    const newWf: Workflow = {
      id: 'wf-' + Math.random().toString(36).substring(2, 9),
      workspaceId: user?.currentWorkspaceId || 'ws-admin-user',
      userId: user?.id || 'admin-user',
      name: 'Custom Intelligent Workflow',
      description: 'Automated workflow rule',
      industry: 'General',
      category: 'lead_nurturing',
      isActive: true,
      trigger: {
        type: 'lead_captured',
        config: {}
      },
      nodes: [
        {
          id: 'n-trig',
          type: 'trigger',
          title: 'New Lead Captured',
          description: 'Fires when visitor submits lead form',
          config: {},
          position: { x: 100, y: 50 },
          nextStepIds: ['n-step2']
        },
        {
          id: 'n-step2',
          type: 'action',
          actionSubtype: 'send_email',
          title: 'Send Personalized Confirmation',
          description: 'Dispatches automated welcome email',
          config: {
            recipientEmail: '{{lead.email}}',
            templateText: 'Hello {{name}}, thank you for contacting us!'
          },
          position: { x: 100, y: 180 }
        }
      ],
      stats: { totalRuns: 0, successRuns: 0, failedRuns: 0, pendingApprovals: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEditingWorkflow(newWf);
  };

  const handleSelectTemplate = (template: any) => {
    const clonedWf: Workflow = {
      ...template,
      id: 'wf-' + Math.random().toString(36).substring(2, 9),
      workspaceId: user?.currentWorkspaceId || 'ws-admin-user',
      userId: user?.id || 'admin-user',
      stats: { totalRuns: 0, successRuns: 0, failedRuns: 0, pendingApprovals: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setIsTemplatesModalOpen(false);
    setEditingWorkflow(clonedWf);
  };

  const filteredWorkflows = workflows.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If currently editing a workflow in the Visual Builder
  if (editingWorkflow) {
    return (
      <WorkflowBuilder
        workflow={editingWorkflow}
        token={token}
        onSave={() => {
          setEditingWorkflow(null);
          fetchWorkflowsData();
        }}
        onCancel={() => setEditingWorkflow(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4" />
            <span>Intelligent Automation Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Workflow Automation</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Design multi-step trigger automations, AI intent classifications, human approval gates, and customer follow-up rules across your entire business ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Industry Blueprints</span>
          </button>

          <button
            onClick={handleCreateNewWorkflow}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-medium shadow-lg shadow-teal-900/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Workflow</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('workflows')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'workflows'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Active Workflows ({workflows.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('executions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'executions'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Execution Logs & Approvals ({executions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Engine Analytics</span>
        </button>
      </div>

      {/* Tab 1: Workflows List Grid */}
      {activeTab === 'workflows' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search workflows by title or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <button 
              onClick={fetchWorkflowsData}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWorkflows.map((wf) => (
              <div 
                key={wf.id}
                className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl flex flex-col justify-between gap-4 transition-all shadow-xl"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      {wf.industry}
                    </span>

                    <button
                      onClick={() => handleToggleActive(wf.id)}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      {wf.isActive ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-emerald-400 font-medium">Active</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-slate-600" />
                          <span className="text-slate-500">Disabled</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-100 text-base">{wf.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {wf.description}
                  </p>
                </div>

                {/* Workflow Stats Badge Bar */}
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Runs</span>
                      <strong className="text-slate-200">{wf.stats?.totalRuns || 0}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Success Rate</span>
                      <strong className="text-emerald-400">
                        {wf.stats?.totalRuns ? Math.round(((wf.stats.successRuns || 0) / wf.stats.totalRuns) * 100) : 100}%
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingWorkflow(wf)}
                      className="p-2 text-slate-300 hover:text-teal-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Visual Workflow"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWorkflow(wf.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Delete Workflow"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Execution Logs & Approvals */}
      {activeTab === 'executions' && (
        <WorkflowExecutionsLog
          executions={executions}
          token={token}
          onRefresh={fetchWorkflowsData}
        />
      )}

      {/* Tab 3: Analytics */}
      {activeTab === 'analytics' && (
        <WorkflowAnalytics analytics={analytics} />
      )}

      {/* Industry Templates Modal */}
      {isTemplatesModalOpen && (
        <WorkflowTemplatesModal
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setIsTemplatesModalOpen(false)}
        />
      )}
    </div>
  );
};
