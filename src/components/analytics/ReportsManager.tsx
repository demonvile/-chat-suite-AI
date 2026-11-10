import React, { useState } from 'react';
import { 
  FileText, Download, Calendar, Mail, Clock, 
  CheckCircle, Plus, RefreshCw, Printer, FileSpreadsheet 
} from 'lucide-react';
import { BIReportItem } from '../../types';

interface ReportsManagerProps {
  token: string;
  reports: BIReportItem[];
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({ token, reports }) => {
  const [reportList, setReportList] = useState<BIReportItem[]>(reports);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [selectedType, setSelectedType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('custom');
  const [reportTitle, setReportTitle] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Handle PDF Export (Opens formatted printable window)
  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>ChatSuite AI - Enterprise BI Executive Report</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #0f172a; }
    .header { border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 24px; font-weight: bold; color: #1e3a8a; }
    .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
    .badge { background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 10px; }
    .card-label { font-size: 10px; uppercase; font-weight: bold; color: #64748b; }
    .card-val { font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
    th { background: #f1f5f9; padding: 10px; text-align: left; border-bottom: 1px solid #cbd5e1; font-weight: bold; text-transform: uppercase; font-size: 10px; color: #475569; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 10px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">ChatSuite AI Business Intelligence Report</div>
      <div class="subtitle">Generated on ${new Date().toLocaleDateString()} for Enterprise SaaS Workspace</div>
    </div>
    <span class="badge">CONFIDENTIAL</span>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-label">Monthly Recurring Revenue</div>
      <div class="card-val">$38,400 USD</div>
    </div>
    <div class="card">
      <div class="card-label">Total AI Conversations</div>
      <div class="card-val">7,100 / mo</div>
    </div>
    <div class="card">
      <div class="card-label">Customer Satisfaction (CSAT)</div>
      <div class="card-val">96% Positive</div>
    </div>
    <div class="card">
      <div class="card-label">Total Leads Captured</div>
      <div class="card-val">340 Leads</div>
    </div>
    <div class="card">
      <div class="card-label">AI Resolution Rate</div>
      <div class="card-val">91.4% Automated</div>
    </div>
    <div class="card">
      <div class="card-label">Average Response Time</div>
      <div class="card-val">342 ms</div>
    </div>
  </div>

  <h3>Key Performance Indicators Audit</h3>
  <table>
    <thead>
      <tr>
        <th>Metric Category</th>
        <th>Current Value</th>
        <th>Target Benchmark</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Lead Conversion Rate</td>
        <td>14.8%</td>
        <td>&gt; 10.0%</td>
        <td style="color: #16a34a; font-weight: bold;">PASS</td>
      </tr>
      <tr>
        <td>p50 Response Latency</td>
        <td>280 ms</td>
        <td>&lt; 500 ms</td>
        <td style="color: #16a34a; font-weight: bold;">PASS</td>
      </tr>
      <tr>
        <td>Monthly Token Usage</td>
        <td>1,420,500 Tokens</td>
        <td>2,000,000 Cap</td>
        <td style="color: #16a34a; font-weight: bold;">PASS</td>
      </tr>
      <tr>
        <td>Human Escalation Rate</td>
        <td>8.6%</td>
        <td>&lt; 15.0%</td>
        <td style="color: #16a34a; font-weight: bold;">OPTIMAL</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    ChatSuite AI Enterprise Analytics Platform &bull; Automated Business Intelligence Engine &bull; Confidential Internal Report
  </div>

  <script>window.print();</script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Download CSV Format
  const handleDownloadCsv = () => {
    window.location.href = `/api/analytics/export?format=csv&module=bi`;
  };

  // Generate Custom Report
  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setStatusMsg('');

    setTimeout(() => {
      const newRep: BIReportItem = {
        id: 'rep-' + Math.floor(1000 + Math.random() * 9000),
        title: reportTitle.trim() || `Custom BI Executive Audit - ${new Date().toLocaleDateString()}`,
        type: selectedType,
        format: selectedFormat,
        createdAt: new Date().toISOString(),
        generatedBy: 'Active User',
        status: 'ready',
        recipients: recipientEmail ? [recipientEmail] : undefined,
        fileSizeFormatted: selectedFormat === 'pdf' ? '1.8 MB' : '420 KB'
      };

      setReportList([newRep, ...reportList]);
      setIsGenerating(false);
      setStatusMsg(`Report '${newRep.title}' generated successfully!`);
      setReportTitle('');
      setRecipientEmail('');
    }, 800);
  };

  return (
    <div className="space-y-6">
      
      {/* Instant Export Row */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/80 border border-blue-500/30 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
            <FileText size={18} className="text-blue-400" /> Instant Enterprise BI Export & Print Engine
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Export formatted PDF summaries or download raw CSV/Excel telemetry datasets instantly
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handlePrintPdf}
            className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-500 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={15} /> Export PDF Report
          </button>

          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl hover:bg-emerald-500 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet size={15} /> Download CSV Data
          </button>
        </div>
      </div>

      {/* Grid: Custom Report Builder & Generated Archive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Custom Report Builder Form */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
          <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-1.5">
            <Plus size={16} className="text-blue-500" /> Custom Report Builder
          </h3>

          <form onSubmit={handleGenerateReport} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Report Title
              </label>
              <input
                type="text"
                placeholder="e.g. Q3 Sales & AI Latency Audit"
                value={reportTitle}
                onChange={e => setReportTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Schedule Type
                </label>
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-white cursor-pointer"
                >
                  <option value="daily">Daily Briefing</option>
                  <option value="weekly">Weekly Summary</option>
                  <option value="monthly">Monthly Executive</option>
                  <option value="custom">Custom On-Demand</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Output Format
                </label>
                <select
                  value={selectedFormat}
                  onChange={e => setSelectedFormat(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-white cursor-pointer"
                >
                  <option value="pdf">Printable PDF</option>
                  <option value="excel">Excel Workbook</option>
                  <option value="csv">Raw CSV</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Automated Email Recipient (Optional)
              </label>
              <input
                type="email"
                placeholder="executives@enterprise.com"
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {statusMsg && (
              <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                <CheckCircle size={14} /> {statusMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Plus size={14} />}
              {isGenerating ? 'Building Report...' : 'Generate New BI Report'}
            </button>
          </form>
        </div>

        {/* Report History & Downloads */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs lg:col-span-2">
          <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-1.5">
            <Clock size={16} className="text-blue-500" /> Report Archive & Automated Schedules
          </h3>

          <div className="space-y-3">
            {reportList.map(rep => (
              <div key={rep.id} className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{rep.title}</h4>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {rep.type.toUpperCase()} • Format: {rep.format.toUpperCase()} • {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono font-bold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {rep.fileSizeFormatted || '1.2 MB'}
                  </span>
                  
                  {rep.format === 'csv' ? (
                    <button
                      onClick={handleDownloadCsv}
                      className="p-2 rounded-lg bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                      title="Download CSV"
                    >
                      <Download size={15} />
                    </button>
                  ) : (
                    <button
                      onClick={handlePrintPdf}
                      className="p-2 rounded-lg bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                      title="Export PDF"
                    >
                      <Printer size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
