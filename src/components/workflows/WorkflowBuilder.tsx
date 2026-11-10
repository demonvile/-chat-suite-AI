import React, { useState } from 'react';
import { 
  Play, Plus, Save, Sparkles, ArrowRight, Trash2, Check, 
  X, HelpCircle, Layers, Zap, Clock, ShieldCheck, Mail, 
  FileText, UserCheck, Tag, Bell, Sliders, ChevronRight
} from 'lucide-react';
import { Workflow, WorkflowNode, WorkflowNodeType, WorkflowActionType, WorkflowTriggerType } from '../../types';

interface WorkflowBuilderProps {
  workflow: Workflow;
  token: string;
  onSave: (updatedWorkflow: Workflow) => void;
  onCancel: () => void;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  workflow: initialWorkflow,
  token,
  onSave,
  onCancel
}) => {
  const [workflow, setWorkflow] = useState<Workflow>(initialWorkflow);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialWorkflow.nodes[0]?.id || null);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const selectedNode = workflow.nodes.find(n => n.id === selectedNodeId);

  const handleUpdateNodeConfig = (nodeId: string, updatedConfig: any) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, config: { ...n.config, ...updatedConfig } } : n)
    }));
  };

  const handleUpdateNodeTitle = (nodeId: string, title: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, title } : n)
    }));
  };

  const handleAddNode = (type: WorkflowNodeType, actionSubtype?: WorkflowActionType) => {
    const newNodeId = 'n-' + Math.random().toString(36).substring(2, 7);
    const lastNode = workflow.nodes[workflow.nodes.length - 1];
    
    let defaultTitle = 'New Step';
    let defaultDesc = '';

    if (type === 'action') {
      if (actionSubtype === 'send_email') defaultTitle = 'Send Follow-up Email';
      else if (actionSubtype === 'create_ticket') defaultTitle = 'Auto-Create Support Ticket';
      else if (actionSubtype === 'assign_task') defaultTitle = 'Assign Sales Specialist';
      else if (actionSubtype === 'categorize_conversation') defaultTitle = 'AI Intent Categorization';
      else if (actionSubtype === 'send_reminder') defaultTitle = 'Send 24h SMS Reminder';
      else if (actionSubtype === 'generate_report') defaultTitle = 'Generate SLA Compliance Report';
    } else if (type === 'condition') {
      defaultTitle = 'Evaluate Conditional Logic';
      defaultDesc = 'Branch workflow based on field criteria';
    } else if (type === 'approval') {
      defaultTitle = 'Manager Approval Gate';
      defaultDesc = 'Require manager sign-off before proceeding';
    } else if (type === 'delay') {
      defaultTitle = 'Time Delay Window';
      defaultDesc = 'Wait for specified time duration';
    }

    const newNode: WorkflowNode = {
      id: newNodeId,
      type,
      actionSubtype,
      title: defaultTitle,
      description: defaultDesc,
      config: {
        field: 'email',
        operator: 'contains',
        value: '@',
        templateText: 'Hello {{name}}, thank you for reaching out to us!',
        ticketPriority: 'high',
        assignedAgentName: 'Senior Support Representative',
        approvalRole: 'Support Manager'
      },
      position: { x: 100, y: (workflow.nodes.length * 130) + 50 }
    };

    // Link previous node to new node if applicable
    const updatedNodes = workflow.nodes.map((n, idx) => {
      if (idx === workflow.nodes.length - 1 && !n.nextStepIds?.length) {
        return { ...n, nextStepIds: [newNodeId] };
      }
      return n;
    });

    setWorkflow(prev => ({
      ...prev,
      nodes: [...updatedNodes, newNode]
    }));
    setSelectedNodeId(newNodeId);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (workflow.nodes.length <= 1) return; // Don't delete trigger
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId)
    }));
    setSelectedNodeId(workflow.nodes[0]?.id || null);
  };

  const handleGenerateAiWorkflow = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);

    try {
      const response = await fetch('/api/workflows/ai-suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: aiPrompt, industry: workflow.industry })
      });

      if (response.ok) {
        const data = await response.json();
        setWorkflow(prev => ({
          ...prev,
          name: data.name || prev.name,
          description: data.description || prev.description,
          industry: data.industry || prev.industry,
          category: data.category || prev.category,
          trigger: data.trigger || prev.trigger,
          nodes: data.nodes || prev.nodes
        }));
        setSelectedNodeId(data.nodes?.[0]?.id || null);
        setIsAiModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to generate AI workflow:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleTestRun = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(`/api/workflows/${workflow.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          payload: {
            name: 'Alex Johnson',
            email: 'alex.j@example.com',
            notes: 'High intent customer inquiring about enterprise customization',
            date: new Date().toLocaleDateString()
          }
        })
      });

      if (response.ok) {
        const res = await response.json();
        setTestResult(res.execution);
      }
    } catch (err) {
      console.error('Test run error:', err);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveWorkflow = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(workflow)
      });

      if (response.ok) {
        const saved = await response.json();
        onSave(saved);
      }
    } catch (err) {
      console.error('Failed to save workflow:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[820px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <input 
              type="text" 
              value={workflow.name}
              onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
              className="bg-transparent text-lg font-bold text-slate-100 focus:outline-none focus:border-b focus:border-teal-500 transition-colors px-1 py-0.5"
              placeholder="Workflow Title..."
            />
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 font-medium text-teal-400">
                {workflow.industry}
              </span>
              <span>•</span>
              <span className="capitalize">{workflow.trigger?.type.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-purple-900/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Assistant</span>
          </button>

          <button
            onClick={handleTestRun}
            disabled={isTesting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 text-emerald-400 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testing...' : 'Test Run'}</span>
          </button>

          <button
            onClick={handleSaveWorkflow}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow-lg shadow-teal-900/30 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Workflow'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Step Palette */}
        <div className="w-64 bg-slate-900/60 border-r border-slate-800 p-4 overflow-y-auto flex flex-col gap-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Add Step Actions</h4>
            <div className="space-y-1.5">
              <button
                onClick={() => handleAddNode('action', 'send_email')}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-left text-xs text-slate-200 hover:text-white transition-all group cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20">
                  <Mail className="w-4 h-4" />
                </div>
                <span>Send Email</span>
              </button>

              <button
                onClick={() => handleAddNode('action', 'create_ticket')}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-left text-xs text-slate-200 hover:text-white transition-all group cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                  <FileText className="w-4 h-4" />
                </div>
                <span>Create CRM Ticket</span>
              </button>

              <button
                onClick={() => handleAddNode('action', 'assign_task')}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-left text-xs text-slate-200 hover:text-white transition-all group cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span>Assign Sales Agent</span>
              </button>

              <button
                onClick={() => handleAddNode('action', 'categorize_conversation')}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-left text-xs text-slate-200 hover:text-white transition-all group cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
                  <Tag className="w-4 h-4" />
                </div>
                <span>AI Categorize Intent</span>
              </button>

              <button
                onClick={() => handleAddNode('action', 'send_reminder')}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-left text-xs text-slate-200 hover:text-white transition-all group cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                  <Bell className="w-4 h-4" />
                </div>
                <span>Send SMS Reminder</span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Logic & Control</h4>
            <div className="space-y-1.5">
              <button
                onClick={() => handleAddNode('condition')}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-left text-xs text-slate-200 hover:text-white transition-all group cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                  <Sliders className="w-4 h-4" />
                </div>
                <span>If / Else Condition</span>
              </button>

              <button
                onClick={() => handleAddNode('approval')}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-left text-xs text-slate-200 hover:text-white transition-all group cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Human Approval Gate</span>
              </button>

              <button
                onClick={() => handleAddNode('delay')}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-left text-xs text-slate-200 hover:text-white transition-all group cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20">
                  <Clock className="w-4 h-4" />
                </div>
                <span>Time Delay Window</span>
              </button>
            </div>
          </div>

          {/* Variables Reference Box */}
          <div className="mt-auto p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
              <span>Available Variables</span>
            </div>
            <div className="space-y-0.5 font-mono text-[10px] text-slate-400">
              <p><code className="text-teal-300">{"{{name}}"}</code> - Visitor Name</p>
              <p><code className="text-teal-300">{"{{email}}"}</code> - Email Address</p>
              <p><code className="text-teal-300">{"{{date}}"}</code> - Current Date</p>
              <p><code className="text-teal-300">{"{{ticketId}}"}</code> - Ticket ID</p>
            </div>
          </div>
        </div>

        {/* Middle Visual Canvas */}
        <div className="flex-1 bg-slate-950/90 p-8 overflow-y-auto flex flex-col items-center relative">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Workflow Step Stack */}
          <div className="w-full max-w-lg space-y-6 relative z-10 my-4">
            {workflow.nodes.map((node, index) => {
              const isSelected = selectedNodeId === node.id;
              
              return (
                <div key={node.id} className="relative flex flex-col items-center">
                  {/* Vertical Connector Line */}
                  {index > 0 && (
                    <div className="w-0.5 h-6 bg-slate-700/80 my-[-12px] relative z-0 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    </div>
                  )}

                  {/* Node Card */}
                  <div
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`w-full p-4 rounded-2xl border transition-all cursor-pointer relative z-10 shadow-lg ${
                      isSelected 
                        ? 'bg-slate-900 border-teal-500 ring-2 ring-teal-500/20 shadow-teal-950/50' 
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                          node.type === 'trigger' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          node.type === 'condition' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          node.type === 'approval' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          node.type === 'delay' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                          'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        }`}>
                          {node.type === 'trigger' && <Zap className="w-5 h-5" />}
                          {node.type === 'condition' && <Sliders className="w-5 h-5" />}
                          {node.type === 'approval' && <ShieldCheck className="w-5 h-5" />}
                          {node.type === 'delay' && <Clock className="w-5 h-5" />}
                          {node.type === 'action' && <Layers className="w-5 h-5" />}
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                            Step {index + 1} • {node.type}
                          </span>
                          <h3 className="text-sm font-semibold text-slate-100">{node.title}</h3>
                          {node.description && (
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{node.description}</p>
                          )}
                        </div>
                      </div>

                      {node.type !== 'trigger' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNode(node.id);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Step Configuration Summary Tag */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span className="truncate max-w-[280px]">
                        {node.type === 'action' && node.actionSubtype === 'send_email' && `Email: ${node.config.recipientEmail || '{{lead.email}}'}`}
                        {node.type === 'action' && node.actionSubtype === 'create_ticket' && `Priority: ${node.config.ticketPriority || 'High'}`}
                        {node.type === 'action' && node.actionSubtype === 'assign_task' && `Assign: ${node.config.assignedAgentName || 'Agent'}`}
                        {node.type === 'condition' && `If ${node.config.field || 'email'} ${node.config.operator || 'contains'} "${node.config.value || '@'}"`}
                        {node.type === 'approval' && `Approver: ${node.config.approvalRole || 'Manager'}`}
                        {node.type === 'trigger' && `Trigger: ${workflow.trigger?.type}`}
                      </span>

                      <div className="flex items-center gap-1 text-teal-400 font-medium">
                        <span>Config</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Test Result Toast/Panel */}
          {testResult && (
            <div className="w-full max-w-lg mt-6 p-4 bg-slate-900 border border-emerald-500/40 rounded-2xl text-xs text-slate-200 space-y-2">
              <div className="flex items-center justify-between font-semibold text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Test Execution Successful
                </span>
                <span className="text-[10px] text-slate-400">{testResult.id}</span>
              </div>
              <p className="text-slate-300">
                Processed <strong className="text-white">{testResult.stepLogs?.length || 0}</strong> steps for trigger payload <code className="text-teal-300">{testResult.triggerPayload?.email}</code>.
              </p>
            </div>
          )}
        </div>

        {/* Right Configuration Drawer */}
        {selectedNode && (
          <div className="w-80 bg-slate-900/90 border-l border-slate-800 p-5 overflow-y-auto flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-400" />
                Step Settings
              </h3>
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded capitalize">
                {selectedNode.type}
              </span>
            </div>

            {/* Step Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Step Title</label>
              <input 
                type="text" 
                value={selectedNode.title}
                onChange={(e) => handleUpdateNodeTitle(selectedNode.id, e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Trigger Configuration */}
            {selectedNode.type === 'trigger' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Trigger Event</label>
                  <select
                    value={workflow.trigger?.type}
                    onChange={(e) => setWorkflow(prev => ({
                      ...prev,
                      trigger: { ...prev.trigger, type: e.target.value as WorkflowTriggerType }
                    }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  >
                    <option value="lead_captured">New Lead Captured</option>
                    <option value="ticket_created">Support Ticket Created</option>
                    <option value="appointment_booked">Appointment Booked</option>
                    <option value="message_received">Message Keyword Received</option>
                  </select>
                </div>
              </div>
            )}

            {/* Action Settings */}
            {selectedNode.type === 'action' && selectedNode.actionSubtype === 'send_email' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Recipient Email</label>
                  <input 
                    type="text" 
                    value={selectedNode.config.recipientEmail || '{{lead.email}}'}
                    onChange={(e) => handleUpdateNodeConfig(selectedNode.id, { recipientEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Email Template Text</label>
                  <textarea 
                    rows={4}
                    value={selectedNode.config.templateText || ''}
                    onChange={(e) => handleUpdateNodeConfig(selectedNode.id, { templateText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            )}

            {selectedNode.type === 'action' && selectedNode.actionSubtype === 'create_ticket' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Ticket Priority</label>
                  <select
                    value={selectedNode.config.ticketPriority || 'high'}
                    onChange={(e) => handleUpdateNodeConfig(selectedNode.id, { ticketPriority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Escalation</option>
                  </select>
                </div>
              </div>
            )}

            {selectedNode.type === 'action' && selectedNode.actionSubtype === 'assign_task' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Assigned Agent / Team</label>
                  <input 
                    type="text" 
                    value={selectedNode.config.assignedAgentName || ''}
                    onChange={(e) => handleUpdateNodeConfig(selectedNode.id, { assignedAgentName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            )}

            {/* Condition Settings */}
            {selectedNode.type === 'condition' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Field</label>
                  <select
                    value={selectedNode.config.field || 'email'}
                    onChange={(e) => handleUpdateNodeConfig(selectedNode.id, { field: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  >
                    <option value="email">Lead Email</option>
                    <option value="notes">Visitor Message / Notes</option>
                    <option value="name">Visitor Name</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Operator</label>
                  <select
                    value={selectedNode.config.operator || 'contains'}
                    onChange={(e) => handleUpdateNodeConfig(selectedNode.id, { operator: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  >
                    <option value="contains">Contains Substring</option>
                    <option value="equals">Equals Exactly</option>
                    <option value="ai_sentiment_is">AI High Value Intent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Match Value</label>
                  <input 
                    type="text" 
                    value={selectedNode.config.value || ''}
                    onChange={(e) => handleUpdateNodeConfig(selectedNode.id, { value: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            )}

            {/* Approval Settings */}
            {selectedNode.type === 'approval' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Approver Role</label>
                  <input 
                    type="text" 
                    value={selectedNode.config.approvalRole || 'Support Manager'}
                    onChange={(e) => handleUpdateNodeConfig(selectedNode.id, { approvalRole: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Assistant Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-slate-100 text-base">Generate Workflow with AI</h3>
              </div>
              <button 
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Describe your automated process in plain language, and Gemini will generate a complete multi-step workflow structure.
            </p>

            <textarea 
              rows={4}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. When a high value healthcare lead books a consultation, auto-send intake forms, set up 24h SMS reminder, and request medical coordinator approval..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-purple-500"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateAiWorkflow}
                disabled={isGeneratingAi || !aiPrompt.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-medium shadow-lg transition-all"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAi ? 'Synthesizing Workflow...' : 'Generate Workflow'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
