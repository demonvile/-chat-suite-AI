import crypto from 'crypto';

export interface BillingEmailLog {
  id: string;
  workspaceId: string;
  recipientEmail: string;
  type: 'payment_success' | 'payment_failed' | 'upcoming_renewal' | 'subscription_cancelled' | 'plan_changed';
  subject: string;
  bodyText: string;
  sentAt: string;
  status: 'delivered' | 'queued' | 'failed';
  metadata?: any;
}

export function sendBillingNotificationEmail(
  db: any,
  workspaceId: string,
  recipientEmail: string,
  workspaceName: string,
  type: BillingEmailLog['type'],
  details: {
    planName?: string;
    amount?: number;
    currency?: string;
    billingCycle?: string;
    invoiceNumber?: string;
    failureReason?: string;
    renewalDate?: string;
    cancellationReason?: string;
  }
): BillingEmailLog {
  if (!db.emailLogs) {
    db.emailLogs = [];
  }

  const currency = details.currency || 'USD';
  const formattedAmount = details.amount !== undefined ? `$${details.amount.toFixed(2)} ${currency}` : '$0.00 USD';
  const planName = details.planName || 'Plan Subscription';

  let subject = '';
  let bodyText = '';

  switch (type) {
    case 'payment_success':
      subject = `[ChatSuite AI] Payment Receipt for ${workspaceName} (${details.invoiceNumber || 'INV-SUCCESS'})`;
      bodyText = `Hello,\n\nThank you for your payment of ${formattedAmount} for the ${planName} on ${workspaceName}.\n\nYour subscription has been activated with elevated limits and all premium features unlocked.\n\nInvoice Number: ${details.invoiceNumber || 'INV-PRO'}\nBilling Cycle: ${details.billingCycle || 'monthly'}\nDate: ${new Date().toLocaleDateString()}\n\nYou can view and download your full VAT receipt in your ChatSuite Billing Dashboard.\n\nBest regards,\nThe ChatSuite AI Billing Team`;
      break;

    case 'payment_failed':
      subject = `[ACTION REQUIRED] Payment Failed for ${workspaceName}`;
      bodyText = `Hello,\n\nWe were unable to process your recurring payment of ${formattedAmount} for ${workspaceName}.\n\nReason: ${details.failureReason || 'Card declined or insufficient funds'}.\n\nTo keep your AI Chatbots and automated workflows running without interruption, please update your payment method in the ChatSuite Billing Center.\n\nBest regards,\nThe ChatSuite AI Billing Team`;
      break;

    case 'upcoming_renewal':
      subject = `[ChatSuite AI] Upcoming Subscription Renewal Notice for ${workspaceName}`;
      bodyText = `Hello,\n\nThis is a friendly reminder that your subscription for ${workspaceName} (${planName}) will automatically renew on ${details.renewalDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}.\n\nAmount to be charged: ${formattedAmount}.\n\nIf you need to make changes or update your payment details, please visit your Billing Dashboard prior to the renewal date.\n\nBest regards,\nThe ChatSuite AI Billing Team`;
      break;

    case 'subscription_cancelled':
      subject = `[ChatSuite AI] Subscription Cancellation Confirmed for ${workspaceName}`;
      bodyText = `Hello,\n\nWe have received your request to cancel the subscription for ${workspaceName}.\n\nReason given: ${details.cancellationReason || 'No reason specified'}.\n\nYour workspace limits will remain active until the end of your current billing period. After that, your workspace will return to the Free tier.\n\nYou can reactivate your plan at any time with a single click.\n\nBest regards,\nThe ChatSuite AI Billing Team`;
      break;

    case 'plan_changed':
      subject = `[ChatSuite AI] Subscription Plan Updated for ${workspaceName}`;
      bodyText = `Hello,\n\nYour subscription plan for ${workspaceName} has been successfully updated to ${planName}.\n\nNew Amount: ${formattedAmount} (${details.billingCycle || 'monthly'})\nAll associated bot, token, and workflow limits have been instantly updated.\n\nThank you for scaling with ChatSuite AI!`;
      break;

    default:
      subject = `[ChatSuite AI] Billing Account Notice for ${workspaceName}`;
      bodyText = `Hello,\n\nThere is an update on your billing account for ${workspaceName}.\n\nPlease check your Billing Dashboard for full details.`;
  }

  const logEntry: BillingEmailLog = {
    id: 'eml-' + crypto.randomUUID().substring(0, 8),
    workspaceId,
    recipientEmail: recipientEmail || 'customer@enterprise.com',
    type,
    subject,
    bodyText,
    sentAt: new Date().toISOString(),
    status: 'delivered',
    metadata: details
  };

  db.emailLogs.unshift(logEntry);
  return logEntry;
}
