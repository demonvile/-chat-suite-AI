import React, { useState } from 'react';
import { 
  Sparkles, Check, ArrowRight, Zap, ShoppingBag, 
  Stethoscope, Building2, Cpu, Headphones, Layers 
} from 'lucide-react';
import { WorkflowTemplate } from '../../types';

interface WorkflowTemplatesModalProps {
  onSelectTemplate: (template: any) => void;
  onClose: () => void;
}

const INDUSTRY_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'wf-tpl-ecommerce-01',
    name: 'E-commerce VIP Lead Nurturing & Cart Recovery',
    industry: 'E-commerce',
    description: 'Categorizes visitor intent, emails exclusive 15% VIP discount coupon, and assigns lead to VIP account manager.',
    category: 'lead_nurturing',
    trigger: { type: 'lead_captured' },
    nodes: [
      { id: 'n-trig', type: 'trigger', title: 'New Lead Captured', config: {}, position: { x: 100, y: 50 }, nextStepIds: ['n-cat'] },
      { id: 'n-cat', type: 'action', actionSubtype: 'categorize_conversation', title: 'AI Intent & Cart Analysis', config: { categoryTags: ['VIP_BUYER'] }, position: { x: 100, y: 180 }, nextStepIds: ['n-cond'] },
      { id: 'n-cond', type: 'condition', title: 'Is Valid Email Present?', config: { field: 'email', operator: 'contains', value: '@' }, position: { x: 100, y: 310 }, trueStepId: 'n-email', falseStepId: 'n-assign' },
      { id: 'n-email', type: 'action', actionSubtype: 'send_email', title: 'Send Personalized Coupon Code', config: { recipientEmail: '{{lead.email}}', templateText: 'Hi {{name}}, here is your exclusive 15% VIP discount code: VIP15.' }, position: { x: 50, y: 440 }, nextStepIds: ['n-assign'] },
      { id: 'n-assign', type: 'action', actionSubtype: 'assign_task', title: 'Assign VIP Sales Specialist', config: { assignedAgentName: 'Senior E-Commerce Specialist' }, position: { x: 100, y: 570 } }
    ]
  },
  {
    id: 'wf-tpl-healthcare-02',
    name: 'Healthcare Patient Appointment & Intake Follow-up',
    industry: 'Healthcare',
    description: 'Auto-schedules medical intake questionnaires, dispatches 24h SMS reminders, and requests coordinator verification.',
    category: 'appointments',
    trigger: { type: 'appointment_booked' },
    nodes: [
      { id: 'n-trig', type: 'trigger', title: 'Patient Appointment Scheduled', config: {}, position: { x: 100, y: 50 }, nextStepIds: ['n-email'] },
      { id: 'n-email', type: 'action', actionSubtype: 'send_email', title: 'Send Intake Form & Confirmation', config: { recipientEmail: '{{patient.email}}', templateText: 'Dear {{name}}, your clinic appointment is confirmed for {{date}}.' }, position: { x: 100, y: 180 }, nextStepIds: ['n-remind'] },
      { id: 'n-remind', type: 'action', actionSubtype: 'send_reminder', title: 'Automated 24h SMS Reminder', config: { reminderChannel: 'sms', delayMinutes: 1440 }, position: { x: 100, y: 310 }, nextStepIds: ['n-appr'] },
      { id: 'n-appr', type: 'approval', title: 'Medical Coordinator Verification', config: { approvalRole: 'Medical Coordinator' }, position: { x: 100, y: 440 } }
    ]
  },
  {
    id: 'wf-tpl-realestate-03',
    name: 'Real Estate High-Intent Buyer Qualification',
    industry: 'Real Estate',
    description: 'Filters luxury property inquiries, creates high-priority CRM tickets, and emails property portfolio PDFs.',
    category: 'lead_nurturing',
    trigger: { type: 'lead_captured' },
    nodes: [
      { id: 'n-trig', type: 'trigger', title: 'Property Lead Captured', config: {}, position: { x: 100, y: 50 }, nextStepIds: ['n-ticket'] },
      { id: 'n-ticket', type: 'action', actionSubtype: 'create_ticket', title: 'Create High-Priority CRM Ticket', config: { ticketPriority: 'high' }, position: { x: 100, y: 180 }, nextStepIds: ['n-email'] },
      { id: 'n-email', type: 'action', actionSubtype: 'send_email', title: 'Send Property Portfolio PDF', config: { templateText: 'Hello {{name}}, thank you for inquiring about luxury property listings.' }, position: { x: 100, y: 310 }, nextStepIds: ['n-assign'] },
      { id: 'n-assign', type: 'action', actionSubtype: 'assign_task', title: 'Assign Senior Listing Agent', config: { assignedAgentName: 'Senior Realty Broker' }, position: { x: 100, y: 440 } }
    ]
  },
  {
    id: 'wf-tpl-saas-04',
    name: 'SaaS Critical Ticket Auto-Categorization & SLA Escalation',
    industry: 'SaaS',
    description: 'Uses AI to detect critical technical issues, requires approval for emergency escalation, and emails SLA report.',
    category: 'support',
    trigger: { type: 'ticket_created' },
    nodes: [
      { id: 'n-trig', type: 'trigger', title: 'Support Ticket Filed', config: {}, position: { x: 100, y: 50 }, nextStepIds: ['n-cat'] },
      { id: 'n-cat', type: 'action', actionSubtype: 'categorize_conversation', title: 'AI Sentiment & Severity Classification', config: { categoryTags: ['CRITICAL_BUG'] }, position: { x: 100, y: 180 }, nextStepIds: ['n-appr'] },
      { id: 'n-appr', type: 'approval', title: 'Support Lead Emergency Approval', config: { approvalRole: 'Support Manager' }, position: { x: 100, y: 310 }, nextStepIds: ['n-assign'] },
      { id: 'n-assign', type: 'action', actionSubtype: 'assign_task', title: 'Assign On-Call Tier 2 Engineer', config: { assignedAgentName: 'Tier 2 Engineering Team' }, position: { x: 100, y: 440 } }
    ]
  }
];

export const WorkflowTemplatesModal: React.FC<WorkflowTemplatesModalProps> = ({
  onSelectTemplate,
  onClose
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');

  const industries = ['All', 'E-commerce', 'Healthcare', 'Real Estate', 'SaaS'];

  const filteredTemplates = INDUSTRY_TEMPLATES.filter(tpl => 
    selectedIndustry === 'All' || tpl.industry === selectedIndustry
  );

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold text-teal-400 tracking-wider uppercase">Pre-Built Automation Blueprints</span>
            <h2 className="text-xl font-bold text-slate-100">Industry Workflow Library</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
          >
            ✕
          </button>
        </div>

        {/* Industry Category Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedIndustry === ind
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((tpl) => (
            <div 
              key={tpl.id}
              className="p-5 bg-slate-950/80 border border-slate-800/80 hover:border-teal-500/50 rounded-2xl flex flex-col justify-between gap-4 transition-all hover:shadow-xl group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    {tpl.industry}
                  </span>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> {tpl.nodes.length} Steps
                  </span>
                </div>

                <h3 className="font-bold text-slate-100 text-sm group-hover:text-teal-300 transition-colors">
                  {tpl.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <button
                onClick={() => onSelectTemplate(tpl)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 group-hover:bg-teal-600 text-slate-200 group-hover:text-white rounded-xl text-xs font-medium transition-all shadow-lg cursor-pointer"
              >
                <span>Use Blueprint Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
