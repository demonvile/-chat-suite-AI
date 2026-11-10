import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, Target, DollarSign, Award, 
  Megaphone, ArrowRight, Calculator, CheckCircle 
} from 'lucide-react';
import { BISalesLeadAnalyticsData } from '../../types';

interface SalesLeadAnalyticsProps {
  data: BISalesLeadAnalyticsData;
  onOpenRoiModal: () => void;
}

export const SalesLeadAnalytics: React.FC<SalesLeadAnalyticsProps> = ({ data, onOpenRoiModal }) => {
  return (
    <div className="space-y-6">
      
      {/* Top Pipeline Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pipeline Value</span>
          <h4 className="font-display text-2xl font-bold text-slate-900 dark:text-white">${data.opportunityPipeline.pipelineValueUsd.toLocaleString()}</h4>
          <span className="text-[10px] text-emerald-500 font-semibold block mt-1">{data.opportunityPipeline.totalOpportunities} Active Deals</span>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Avg Deal Size</span>
          <h4 className="font-display text-2xl font-bold text-slate-900 dark:text-white">${data.opportunityPipeline.avgDealSizeUsd.toLocaleString()}</h4>
          <span className="text-[10px] text-blue-500 font-semibold block mt-1">ARR per contract</span>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Opportunity Win Rate</span>
          <h4 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{data.opportunityPipeline.winRatePct}%</h4>
          <span className="text-[10px] text-emerald-500 font-semibold block mt-1">↑ +4.2% above benchmark</span>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Interactive ROI Tool</span>
          <button
            onClick={onOpenRoiModal}
            className="w-full py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Calculator size={14} /> Open ROI Calculator
          </button>
        </div>

      </div>

      {/* Conversion Funnel */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
        <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-1.5">
          <Target size={16} className="text-blue-500" /> End-to-End Sales Conversion Funnel Architecture
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {data.conversionFunnel.map((stage, idx) => (
            <div key={idx} className="relative p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{stage.stage}</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white font-mono block">{stage.count.toLocaleString()}</span>
              <span className="text-[10px] text-blue-500 font-bold block mt-1">{stage.conversionPct}% conversion</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Lead Sources & Sales Team Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Lead Sources Breakdown */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
          <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-1.5">
            <TrendingUp size={16} className="text-emerald-500" /> Lead Source Attribution
          </h3>

          <div className="space-y-3">
            {data.leadSources.map((src, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1 text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">{src.source}</span>
                  <span className="text-slate-900 dark:text-white font-mono font-bold">{src.count} leads ({src.percentage}%)</span>
                </div>
                
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${src.percentage}%` }} />
                </div>
                
                <span className="text-[10px] text-emerald-500 font-semibold block mt-1">
                  {src.converted} converted customers
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Rep Leaderboard */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
          <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-1.5">
            <Award size={16} className="text-amber-500" /> Sales Representative Performance
          </h3>

          <div className="space-y-3">
            {data.opportunityPipeline.salesReps.map((rep, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-500 font-bold flex items-center justify-center text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">{rep.name}</span>
                    <span className="text-[10px] text-slate-500">{rep.closedDeals} closed won deals</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-500 block">${rep.revenueGenerated.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400">Closed ARR</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Campaign Performance Table */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
        <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-1.5">
          <Megaphone size={16} className="text-purple-500" /> Marketing Campaign ROI Performance
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-400 text-[10px] uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3">Campaign Name</th>
                <th className="p-3">Channel</th>
                <th className="p-3 text-right">Spend ($)</th>
                <th className="p-3 text-right">Leads</th>
                <th className="p-3 text-right">Deals Won</th>
                <th className="p-3 text-right">ROI (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.campaignPerformance.map((camp, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{camp.name}</td>
                  <td className="p-3"><span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">{camp.channel}</span></td>
                  <td className="p-3 text-right font-mono">${camp.costUsd.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono">{camp.leadsGenerated}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">{camp.dealsWon}</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-500">+{camp.roiPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
