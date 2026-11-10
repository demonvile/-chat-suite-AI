import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle, Clock, RotateCcw, ShieldCheck, 
  ChevronRight, ArrowUpRight, Search, Filter, Eye, AlertTriangle 
} from 'lucide-react';
import { WorkflowExecution } from '../../types';

interface WorkflowExecutionsLogProps {
  executions: WorkflowExecution[];
  token: string;
  onRefresh: () => void;
}

export const WorkflowExecutionsLog: React.FC<WorkflowExecutionsLogProps> = ({
  executions,
  token,
  onRefresh
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedExec, setSelectedExec] = useState<WorkflowExecution | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  const filteredExecutions = executions.filter(exec => {
    const matchesStatus = filterStatus === 'all' || exec.status === filterStatus;
    const matchesSearch = exec.workflowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exec.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(exec.triggerPayload).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleApprovalDecision = async (executionId: string, decision: 'approved' | 'rejected') => {
    setIsProcessingAction(true);
    try {
      const response = await fetch(`/api/workflows/executions/${executionId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ decision })
      });

      if (response.ok) {
        onRefresh();
        setSelectedExec(null);
      }
    } catch (err) {
      console.error('Failed approval decision:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleRetryExecution = async (executionId: string) => {
    setIsProcessingAction(true);
    try {
      const response = await fetch(`/api/workflows/executions/${executionId}/retry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        onRefresh();
        setSelectedExec(null);
      }
    } catch (err) {
      console.error('Failed retry execution:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'completed', 'pending_approval', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === status 
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20' 
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search execution logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Executions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Workflow Name</th>
                <th className="px-5 py-3.5">Trigger Event</th>
                <th className="px-5 py-3.5">Target Contact</th>
                <th className="px-5 py-3.5">Execution Status</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredExecutions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No execution logs matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredExecutions.map((exec) => (
                  <tr key={exec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[200px]">{exec.workflowName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">#{exec.id ? exec.id.substring(0, 8) : ''}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-teal-400">
                      {exec.triggerType.replace('_', ' ')}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {exec.triggerPayload?.name || exec.triggerPayload?.email || 'System Payload'}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                        exec.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        exec.status === 'pending_approval' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {exec.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {exec.status === 'pending_approval' && <Clock className="w-3.5 h-3.5" />}
                        {exec.status === 'failed' && <XCircle className="w-3.5 h-3.5" />}
                        <span className="capitalize">{exec.status.replace('_', ' ')}</span>
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {new Date(exec.startedAt).toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedExec(exec)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-400" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Trace Inspector Modal */}
      {selectedExec && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Execution Trace</span>
                <h3 className="text-base font-bold text-slate-100">{selectedExec.workflowName}</h3>
              </div>
              <button
                onClick={() => setSelectedExec(null)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Pending Approval Gate Action Header */}
            {selectedExec.status === 'pending_approval' && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-semibold text-amber-200">Pending Approval Required</h4>
                    <p className="text-[11px] text-slate-300">Approver Role: <strong className="text-white">{selectedExec.approvalRole || 'Manager'}</strong></p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprovalDecision(selectedExec.id, 'rejected')}
                    disabled={isProcessingAction}
                    className="px-3 py-1.5 bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprovalDecision(selectedExec.id, 'approved')}
                    disabled={isProcessingAction}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium shadow-lg cursor-pointer"
                  >
                    Approve Step
                  </button>
                </div>
              </div>
            )}

            {/* Retry Button if Failed */}
            {selectedExec.status === 'failed' && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-300 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>{selectedExec.errorMessage || 'Execution encountered an unexpected step error'}</span>
                </div>
                <button
                  onClick={() => handleRetryExecution(selectedExec.id)}
                  disabled={isProcessingAction}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Execution</span>
                </button>
              </div>
            )}

            {/* Step Execution Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Step Timeline Log</h4>
              
              <div className="space-y-2">
                {selectedExec.stepLogs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          log.status === 'passed' ? 'bg-emerald-400' :
                          log.status === 'waiting_approval' ? 'bg-amber-400' :
                          'bg-rose-400'
                        }`} />
                        <span className="font-semibold text-slate-200">{log.nodeTitle}</span>
                        <span className="text-[10px] text-slate-500 capitalize">({log.nodeType})</span>
                      </div>

                      {log.outputData && (
                        <pre className="p-2 bg-slate-900 rounded-lg text-[10px] font-mono text-teal-300 overflow-x-auto max-w-lg">
                          {JSON.stringify(log.outputData, null, 2)}
                        </pre>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {new Date(log.executedAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
