import React from 'react';
import { 
  Mail, Calendar, MessageSquare, PhoneCall, Send, MessageCircle, 
  ShoppingBag, ShoppingCart, CreditCard, DollarSign, HardDrive, Cloud, Box,
  CheckCircle2, AlertTriangle, RefreshCw, Zap, ShieldCheck, ExternalLink, Settings
} from 'lucide-react';
import { IntegrationItem } from '../../types';

interface IntegrationCardProps {
  integration: IntegrationItem;
  onConfigure: (integration: IntegrationItem) => void;
  onTest: (integration: IntegrationItem) => void;
  onSync: (integration: IntegrationItem) => void;
  onDisconnect: (integration: IntegrationItem) => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onConfigure,
  onTest,
  onSync,
  onDisconnect
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'gmail':
      case 'outlook':
        return <Mail className="w-6 h-6 text-blue-600" />;
      case 'google_calendar':
      case 'outlook_calendar':
        return <Calendar className="w-6 h-6 text-amber-600" />;
      case 'slack':
      case 'ms_teams':
        return <MessageSquare className="w-6 h-6 text-purple-600" />;
      case 'whatsapp':
        return <PhoneCall className="w-6 h-6 text-emerald-600" />;
      case 'telegram':
        return <Send className="w-6 h-6 text-sky-500" />;
      case 'discord':
        return <MessageCircle className="w-6 h-6 text-indigo-600" />;
      case 'shopify':
        return <ShoppingBag className="w-6 h-6 text-green-600" />;
      case 'woocommerce':
        return <ShoppingCart className="w-6 h-6 text-purple-500" />;
      case 'stripe':
        return <CreditCard className="w-6 h-6 text-indigo-500" />;
      case 'paypal':
        return <DollarSign className="w-6 h-6 text-blue-500" />;
      case 'google_drive':
        return <HardDrive className="w-6 h-6 text-yellow-600" />;
      case 'onedrive':
        return <Cloud className="w-6 h-6 text-sky-600" />;
      case 'dropbox':
        return <Box className="w-6 h-6 text-blue-700" />;
      default:
        return <Zap className="w-6 h-6 text-slate-600" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: { [key: string]: string } = {
      email: 'bg-blue-50 text-blue-700 border-blue-200',
      calendar: 'bg-amber-50 text-amber-700 border-amber-200',
      messaging: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      ecommerce: 'bg-purple-50 text-purple-700 border-purple-200',
      payment: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      storage: 'bg-sky-50 text-sky-700 border-sky-200'
    };
    return colors[category] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const isConnected = integration.status === 'connected';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
              {getIcon(integration.id)}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">{integration.name}</h3>
              <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize mt-0.5 ${getCategoryBadge(integration.category)}`}>
                {integration.category}
              </span>
            </div>
          </div>

          {/* Status Indicator */}
          <div>
            {isConnected ? (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Active</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span>Not Connected</span>
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {integration.description}
        </p>

        {/* Connection Details if Active */}
        {isConnected && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 mb-4 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Account / Target:</span>
              <span className="font-mono font-medium text-slate-800 truncate max-w-[150px]">
                {integration.config?.connectedAccountEmail || integration.config?.connectedAccountEmail || integration.config?.environment || 'Verified'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Health Score:</span>
              <span className="font-semibold text-emerald-600 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline" />
                <span>{integration.healthScore}%</span>
              </span>
            </div>
            {integration.metrics && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span className="text-slate-500">24h Throughput:</span>
                <span className="font-medium text-slate-700">{integration.metrics.eventsProcessedToday.toLocaleString()} events</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {isConnected ? (
          <>
            <button
              onClick={() => onConfigure(integration)}
              className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Configure</span>
            </button>
            <button
              onClick={() => onTest(integration)}
              className="px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              title="Test API Handshake"
            >
              Test
            </button>
            <button
              onClick={() => onSync(integration)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Sync Status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => onConfigure(integration)}
            className="w-full inline-flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Connect Service</span>
          </button>
        )}
      </div>
    </div>
  );
};
