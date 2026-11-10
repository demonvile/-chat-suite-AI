import React, { useState } from 'react';
import { 
  Bell, AlertTriangle, ShieldCheck, Zap, 
  Target, CheckCircle2, Info, X 
} from 'lucide-react';
import { BINotificationAlert } from '../../types';

interface NotificationsAlertsProps {
  notifications: BINotificationAlert[];
}

export const NotificationsAlerts: React.FC<NotificationsAlertsProps> = ({ notifications }) => {
  const [alerts, setAlerts] = useState<BINotificationAlert[]>(notifications);

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const markAllRead = () => {
    setAlerts(alerts.map(a => ({ ...a, isRead: true })));
  };

  return (
    <div className="space-y-6">
      
      {/* Goal Tracking Progress Gauges */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
        <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-1.5">
          <Target size={16} className="text-blue-500" /> Goal Tracking & Target SLA Performance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Monthly Lead Goal</span>
              <span className="text-xs font-mono font-bold text-emerald-500">113% Reached</span>
            </div>
            <span className="text-[10px] text-slate-500 block mb-2">Target: 300 leads | Current: 340 leads</span>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-full" />
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Response SLA Target</span>
              <span className="text-xs font-mono font-bold text-blue-500">280ms / 500ms</span>
            </div>
            <span className="text-[10px] text-slate-500 block mb-2">Target: &lt;500ms p50 latency | Current: 280ms</span>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full w-[56%]" />
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">CSAT Goal</span>
              <span className="text-xs font-mono font-bold text-indigo-500">96% / 95%</span>
            </div>
            <span className="text-[10px] text-slate-500 block mb-2">Target: 95% satisfaction | Current: 96%</span>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full w-[98%]" />
            </div>
          </div>

        </div>
      </div>

      {/* Live System Alerts List */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
            <Bell size={16} className="text-amber-500" /> Active Performance, Usage & Error Alerts
          </h3>

          <button
            onClick={markAllRead}
            className="text-xs text-blue-500 font-semibold hover:underline cursor-pointer"
          >
            Mark All as Read
          </button>
        </div>

        {alerts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No active alerts or performance warnings. All systems operational!
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map(a => (
              <div 
                key={a.id} 
                className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                  a.severity === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                    : a.severity === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {a.severity === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs font-display">{a.title}</h4>
                    <p className="text-xs mt-1 text-slate-700 dark:text-slate-300">{a.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">
                      {new Date(a.timestamp).toLocaleTimeString()} • Target: {a.metricTarget} ({a.currentValue})
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => dismissAlert(a.id)}
                  className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
