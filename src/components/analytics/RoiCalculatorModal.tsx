import React, { useState } from 'react';
import { Calculator, X, DollarSign, Clock, TrendingUp, CheckCircle, ShieldCheck } from 'lucide-react';

interface RoiCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoiCalculatorModal: React.FC<RoiCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [monthlyInquiries, setMonthlyInquiries] = useState(2500);
  const [avgHandlingTimeMins, setAvgHandlingTimeMins] = useState(12);
  const [supportCostPerHour, setSupportCostPerHour] = useState(28);
  const [aiDeflectionRate, setAiDeflectionRate] = useState(75);
  const [leadConversionIncreasePct, setLeadConversionIncreasePct] = useState(15);
  const [avgDealValue, setAvgDealValue] = useState(1200);

  if (!isOpen) return null;

  // Math calculation
  const automatedInquiries = Math.round(monthlyInquiries * (aiDeflectionRate / 100));
  const hoursSavedPerMonth = Math.round((automatedInquiries * avgHandlingTimeMins) / 60);
  const directSupportSavingsMonthly = Math.round(hoursSavedPerMonth * supportCostPerHour);
  const extraLeadsConvertedMonthly = Math.round((monthlyInquiries * 0.1) * (leadConversionIncreasePct / 100));
  const newRevenueGeneratedMonthly = Math.round(extraLeadsConvertedMonthly * avgDealValue);
  const totalMonthlyEconomicValue = directSupportSavingsMonthly + newRevenueGeneratedMonthly;
  const totalAnnualEconomicValue = totalMonthlyEconomicValue * 12;
  const estimatedPlatformCostMonthly = 249; // Enterprise Tier
  const netMonthlyProfit = totalMonthlyEconomicValue - estimatedPlatformCostMonthly;
  const calculatedRoiPct = Math.round((netMonthlyProfit / estimatedPlatformCostMonthly) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
            <Calculator size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">SaaS AI Business ROI Calculator</h3>
            <p className="text-xs text-slate-500">Estimate your financial return and labor time saved with ChatSuite AI</p>
          </div>
        </div>

        {/* Input sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Monthly Support Inquiries: <span className="text-blue-500 font-mono font-bold">{monthlyInquiries.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min="200"
              max="20000"
              step="100"
              value={monthlyInquiries}
              onChange={e => setMonthlyInquiries(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              AI Deflection Target: <span className="text-blue-500 font-mono font-bold">{aiDeflectionRate}%</span>
            </label>
            <input
              type="range"
              min="20"
              max="95"
              step="5"
              value={aiDeflectionRate}
              onChange={e => setAiDeflectionRate(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Avg Ticket Handling Time: <span className="text-blue-500 font-mono font-bold">{avgHandlingTimeMins} mins</span>
            </label>
            <input
              type="range"
              min="3"
              max="30"
              step="1"
              value={avgHandlingTimeMins}
              onChange={e => setAvgHandlingTimeMins(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Support Staff Rate: <span className="text-blue-500 font-mono font-bold">${supportCostPerHour}/hr</span>
            </label>
            <input
              type="range"
              min="12"
              max="80"
              step="2"
              value={supportCostPerHour}
              onChange={e => setSupportCostPerHour(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Lead Conversion Uplift: <span className="text-blue-500 font-mono font-bold">+{leadConversionIncreasePct}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={leadConversionIncreasePct}
              onChange={e => setLeadConversionIncreasePct(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Average Deal / LTV Value: <span className="text-blue-500 font-mono font-bold">${avgDealValue.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={avgDealValue}
              onChange={e => setAvgDealValue(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Calculation Result Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">Estimated ROI</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display">+{calculatedRoiPct.toLocaleString()}%</span>
            <span className="text-[10px] text-slate-500 block mt-1">Net return on subscription</span>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">Monthly Economic Value</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-display">${totalMonthlyEconomicValue.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block mt-1">${totalAnnualEconomicValue.toLocaleString()}/yr total</span>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">Labor Saved</span>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-display">{hoursSavedPerMonth.toLocaleString()} hrs</span>
            <span className="text-[10px] text-slate-500 block mt-1">Saved per month</span>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500" /> Direct Support Labor Savings:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">${directSupportSavingsMonthly.toLocaleString()} / mo</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5"><TrendingUp size={14} className="text-emerald-500" /> New Pipeline Revenue Generated:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">${newRevenueGeneratedMonthly.toLocaleString()} / mo</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white">
            <span>Net Monthly Profit Impact:</span>
            <span className="font-mono text-emerald-500">+${netMonthlyProfit.toLocaleString()} / mo</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-500 transition-colors shadow-sm cursor-pointer"
          >
            Close ROI Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
