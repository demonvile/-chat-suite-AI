import React, { useState } from 'react';
import { 
  AlertTriangle, RefreshCw, CheckCircle2, ShieldAlert, Eye, Terminal, Clock 
} from 'lucide-react';
import { IntegrationErrorLog, IntegrationAuditLog } from '../../types';

interface IntegrationErrorLogsProps {
  errorLogs: IntegrationErrorLog[];
  auditLogs: IntegrationAuditLog[];
  onRetryError: (errorLogId: string) => Promise<void>;
}

export const IntegrationErrorLogs: React.FC<IntegrationErrorLogsProps> = ({
  errorLogs,
  auditLogs,
  onRetryError
}) => {
  const [activeTab, setActiveTab] = useState<'error_logs' | 'audit_trail'>('error_logs');
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [selectedPayload, setSelectedPayload] = useState<any | null>(null);

  const handleRetry = async (id: string) => {
    setRetryingId(id);
    try {
      await onRetryError(id);
    } catch (err) {
      console.error(err);
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center space-x-2 shadow-xs">
        <button
          onClick={() => setActiveTab('error_logs')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'error_logs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Integration Failures & Retry Queue ({errorLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_trail')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'audit_trail'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Integration Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* ====================================================================
         TAB 1: INTEGRATION ERROR LOGS
         ==================================================================== */}
      {activeTab === 'error_logs' && (
        <div className="space-y-4">
          {errorLogs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No Integration Errors Detected</h3>
              <p className="text-xs text-slate-500 mt-1">All third-party API webhooks and integrations are operating within healthy diagnostic thresholds.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {errorLogs.map((log) => (
                <div key={log.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          log.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {log.status === 'resolved' ? 'Resolved' : 'Action Required'}
                        </span>
                        <h4 className="font-semibold text-slate-900 text-sm">{log.integrationName}</h4>
                        <span className="font-mono text-xs text-slate-400">({log.errorCode})</span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium pt-1">
                        {log.errorMessage}
                      </p>

                      <div className="text-[11px] text-slate-400 flex items-center space-x-3 pt-1">
                        <span>Timestamp: {new Date(log.timestamp).toLocaleString()}</span>
                        {log.httpStatus && <span>HTTP Status: {log.httpStatus}</span>}
                        <span>Retries: {log.retryCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end md:self-center">
                      {log.payload && (
                        <button
                          onClick={() => setSelectedPayload(log.payload)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Payload</span>
                        </button>
                      )}

                      {log.status !== 'resolved' && (
                        <button
                          onClick={() => handleRetry(log.id)}
                          disabled={retryingId === log.id}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${retryingId === log.id ? 'animate-spin' : ''}`} />
                          <span>{retryingId === log.id ? 'Retrying...' : 'Retry Payload'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
         TAB 2: INTEGRATION AUDIT TRAIL
         ==================================================================== */}
      {activeTab === 'audit_trail' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {auditLogs.map((audit) => (
              <div key={audit.id} className="p-4 flex items-start justify-between hover:bg-slate-50/80 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 capitalize">
                      {audit.action.replace('_', ' ')}
                      <span className="text-slate-400 font-normal ml-2">by {audit.userName}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {audit.details}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-400 whitespace-nowrap ml-4">
                  {new Date(audit.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payload Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <span>Error Payload Body</span>
              </h3>
              <button onClick={() => setSelectedPayload(null)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-indigo-300 font-mono text-xs rounded-xl overflow-x-auto max-h-80 border border-slate-800">
              {JSON.stringify(selectedPayload, null, 2)}
            </pre>

            <button
              onClick={() => setSelectedPayload(null)}
              className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
