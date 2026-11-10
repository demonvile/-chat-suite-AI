export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'manager' | 'agent' | 'viewer';
export type PlanTier = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';
export type AIProviderName = 'groq' | 'gemini' | 'openai' | 'openrouter';

export interface WorkspaceAiKeyDetail {
  hasKey: boolean;
  maskedKey: string;
  keyPrefix: string;
  isInvalid?: boolean;
  lastTestedAt?: string;
  lastError?: string;
  updatedAt?: string;
}

export interface WorkspaceAiConfig {
  aiWizardCompleted: boolean;
  aiWizardSkipped?: boolean;
  activeProvider: AIProviderName;
  activeModels: Record<AIProviderName, string>;
  keys: Partial<Record<AIProviderName, WorkspaceAiKeyDetail>>;
  customKeys?: Partial<Record<AIProviderName, string>>;
  hasInvalidKeyAlert?: boolean;
  invalidProviderName?: AIProviderName;
  invalidReason?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  companyName: string;
  role: 'admin' | 'business_user';
  createdAt: string;
  currentWorkspaceId?: string;
  aiWizardCompleted?: boolean;
}

export interface WorkspaceSubscription {
  plan: PlanTier;
  status: 'active' | 'trial' | 'past_due' | 'suspended' | 'canceled';
  trialEndsAt?: string;
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentProvider?: 'stripe' | 'paypal' | 'manual';
  paymentMethodId?: string;
  paymentMethodLast4?: string;
  paymentMethodBrand?: string;
  autoRenew?: boolean;
  renewalReminderSent?: boolean;
  renewalReminderDays?: number;
  bonusCredits?: number;
  cancelReason?: string;
}

export interface WorkspaceLimits {
  maxBots: number; // -1 for unlimited
  maxMessagesPerMonth: number;
  maxMembers: number;
  maxWorkspaces: number;
  maxStorageMb: number;
  maxFileUploads: number;
  maxAgents: number;
  maxApiRequestsPerMin: number;
  maxWorkflows: number;
  allowApiKeys: boolean;
  allowWebhooks: boolean;
  allowWhiteLabel: boolean;
  allowAdvancedAnalytics: boolean;
  allowCustomDomain: boolean;
  allowSlaSupport: boolean;
}

export interface WorkspaceUsage {
  messagesThisMonth: number;
  storageUsedMb: number;
  fileUploadsCount: number;
  apiRequestsThisMonth: number;
  workflowsCount: number;
  activeAgentsCount: number;
  workspacesCount?: number;
  bonusCreditsRemaining?: number;
  lastResetDate: string;
}

export interface PaymentMethod {
  id: string;
  workspaceId: string;
  provider: 'stripe' | 'paypal';
  type: 'card' | 'paypal_account';
  brand?: string; // visa, mastercard, amex, etc.
  last4?: string;
  expMonth?: number;
  expYear?: number;
  email?: string; // for paypal
  isDefault: boolean;
  createdAt: string;
}

export interface SaaSRevenueAnalytics {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  activeSubscriptions: number;
  activeTrialsCount: number;
  churnRatePct: number;
  arpu: number; // Avg Revenue Per User
  ltv: number; // Customer Lifetime Value
  totalRevenueAllTime: number;
  subscriptionsByPlan: { plan: PlanTier; count: number; mrr: number }[];
  monthlyRevenueHistory: { month: string; revenue: number; newSubscribers: number; churned: number }[];
}

export interface WorkspaceBranding {
  companyName?: string;
  appTitle?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  typographyFont?: 'Plus Jakarta Sans' | 'Inter' | 'Roboto' | 'Outfit' | 'Poppins';
  dashboardThemeMode?: 'light' | 'dark' | 'system';
  hidePoweredBy?: boolean;
  footerText?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
  customCss?: string;
  customDomain?: string;
  brandColor?: string; // Legacy fallback
}

export interface CustomDomainConfig {
  domain: string;
  status: 'pending_dns' | 'verifying' | 'active' | 'failed';
  sslStatus: 'provisioning' | 'active' | 'error';
  cnameRecord: string;
  txtHost: string;
  txtValue: string;
  dnsVerifiedAt?: string;
  lastCheckedAt?: string;
  errorMessage?: string;
}

export interface CustomLoginConfig {
  title?: string;
  subtitle?: string;
  backgroundStyle?: 'gradient' | 'dark' | 'light' | 'custom_image';
  backgroundImageUrl?: string;
  welcomeMessage?: string;
  primaryButtonColor?: string;
  showSocialLogins?: boolean;
}

export interface WhiteLabelEmailTemplate {
  id: string;
  type: 'welcome' | 'password_reset' | 'notification' | 'billing' | 'invitation';
  subject: string;
  headerLogoUrl?: string;
  bodyText: string;
  buttonText?: string;
  footerText?: string;
  accentColor?: string;
}

export interface ClientLocaleSettings {
  timeZone: string;
  language: string;
  dateFormat: string;
  currency: string;
  defaultAiModel: string;
  notificationPreferences: {
    emailAlerts: boolean;
    inAppBadges: boolean;
    weeklyDigest: boolean;
    securityAlerts: boolean;
  };
  securityPreferences: {
    enforceMfa: boolean;
    allowedIpRanges: string[];
    sessionTimeoutMinutes: number;
  };
}

export interface RolePermissionMatrix {
  owner: string[];
  admin: string[];
  manager: string[];
  agent: string[];
  viewer: string[];
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: WorkspaceRole;
  status: 'active' | 'pending';
  invitedAt: string;
  joinedAt?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  subscription: WorkspaceSubscription;
  limits: WorkspaceLimits;
  usage: WorkspaceUsage;
  branding: WorkspaceBranding;
  members: WorkspaceMember[];
  aiWizardCompleted?: boolean;
  aiConfig?: WorkspaceAiConfig;
  createdAt: string;
}

export interface Invoice {
  id: string;
  workspaceId: string;
  number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  planName: string;
  period: string;
  createdAt: string;
  downloadUrl?: string;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  workspaceName: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  createdAt: string;
  expiresAt: string;
}

export interface ActivityLog {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  action: string;
  details: any;
  timestamp: string;
  ip?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface ChatbotVersion {
  id: string;
  versionNumber: number;
  label: string;
  createdAt: string;
  configSummary?: string;
  config: Omit<ChatbotConfig, 'versionHistory'>;
}

export interface ChatbotConfig {
  id: string;
  workspaceId?: string;
  userId: string;
  name: string;
  botName: string;
  welcomeMessage: string;
  placeholderText: string;
  primaryColor: string;
  theme: 'light' | 'dark';
  position: 'right' | 'left';
  language: string;
  faqs: FAQ[];
  knowledgeUrls: string[];
  knowledgeText: string;
  leadFields: ('name' | 'email' | 'phone')[];
  showLeadOnStart: boolean;
  isActive: boolean;
  apiKey: string;
  webhookUrl?: string;
  createdAt: string;
  updatedAt?: string;
  temperature?: number;
  customSystemInstruction?: string;
  logoUrl?: string;
  avatarUrl?: string;
  customCss?: string;
  customJs?: string;
  versionHistory?: ChatbotVersion[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'image' | 'pdf' | 'text';
  regenerated?: boolean;
  rating?: 1 | -1 | 0; // 1 for thumbs up, -1 for thumbs down
  reaction?: '👍' | '👎' | '❤️' | '💡' | '🔥';
  isPinned?: boolean;
}

export interface Thread {
  id: string;
  workspaceId?: string;
  chatbotId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  messages: Message[];
  createdAt: string;
  lastActiveAt: string;
  leadCaptured: boolean;
  platform?: string; // e.g. 'web', 'embed'
  isPinned?: boolean;
  isFavorite?: boolean;
  notes?: string;
}

export interface Lead {
  id: string;
  workspaceId?: string;
  chatbotId: string;
  threadId: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  notes?: string;
}

export interface Ticket {
  id: string;
  workspaceId?: string;
  chatbotId: string;
  name: string;
  email: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface Appointment {
  id: string;
  workspaceId?: string;
  chatbotId: string;
  threadId?: string;
  name: string;
  email: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  purpose: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface WebhookLog {
  id: string;
  workspaceId?: string;
  chatbotId: string;
  eventType: 'lead_captured' | 'ticket_created' | 'appointment_booked';
  payload: string; // JSON string
  url: string;
  status: 'success' | 'failed';
  responseCode: number;
  timestamp: string;
}

export interface DailyStat {
  date: string;
  messages: number;
  leads: number;
  tickets: number;
}

export interface LanguageStat {
  lang: string;
  count: number;
}

export interface FAQStat {
  question: string;
  hits: number;
}

export interface AnalyticsSummary {
  totalMessages: number;
  totalLeads: number;
  leadConversionRate: number;
  totalTickets: number;
  avgRating: number;
  dailyStats: DailyStat[];
  languageStats: LanguageStat[];
  popularFAQs: FAQStat[];
}

// -------------------------------------------------------------------------
// WORKFLOW AUTOMATION ENGINE TYPES
// -------------------------------------------------------------------------

export type WorkflowTriggerType = 
  | 'lead_captured' 
  | 'ticket_created' 
  | 'appointment_booked' 
  | 'message_received' 
  | 'schedule_cron' 
  | 'webhook_event';

export type WorkflowNodeType = 'trigger' | 'action' | 'condition' | 'approval' | 'delay';

export type WorkflowActionType = 
  | 'send_email'
  | 'create_ticket'
  | 'assign_task'
  | 'categorize_conversation'
  | 'send_reminder'
  | 'generate_report'
  | 'call_webhook'
  | 'update_lead_status';

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  actionSubtype?: WorkflowActionType;
  title: string;
  description?: string;
  config: {
    // Condition config
    field?: string;
    operator?: 'contains' | 'equals' | 'not_equals' | 'greater_than' | 'in_list' | 'ai_sentiment_is';
    value?: string;
    
    // Action config
    recipientEmail?: string;
    templateText?: string;
    assignedAgentId?: string;
    assignedAgentName?: string;
    ticketPriority?: 'low' | 'medium' | 'high' | 'urgent';
    categoryTags?: string[];
    webhookUrl?: string;
    delayMinutes?: number;
    approvalRole?: string;
    reminderChannel?: 'email' | 'sms' | 'in_app';
    reportType?: 'summary' | 'sla' | 'leads';
  };
  position: { x: number; y: number };
  nextStepIds?: string[]; // Connections to next steps
  trueStepId?: string;    // For condition nodes when true
  falseStepId?: string;   // For condition nodes when false
}

export interface Workflow {
  id: string;
  workspaceId: string;
  userId: string;
  name: string;
  description: string;
  industry: 'E-commerce' | 'Healthcare' | 'Real Estate' | 'SaaS' | 'Customer Support' | 'General';
  category: 'lead_nurturing' | 'support' | 'appointments' | 'categorization' | 'reporting';
  isActive: boolean;
  trigger: {
    type: WorkflowTriggerType;
    config?: {
      cronSchedule?: string;
      filterKeyword?: string;
      chatbotId?: string;
    };
  };
  nodes: WorkflowNode[];
  stats: {
    totalRuns: number;
    successRuns: number;
    failedRuns: number;
    pendingApprovals: number;
    lastRunAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecutionStepLog {
  nodeId: string;
  nodeTitle: string;
  nodeType: WorkflowNodeType;
  actionSubtype?: string;
  status: 'passed' | 'failed' | 'skipped' | 'waiting_approval';
  outputData?: any;
  errorMessage?: string;
  executedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  workspaceId: string;
  triggerType: WorkflowTriggerType;
  triggerPayload: any;
  status: 'running' | 'completed' | 'failed' | 'pending_approval';
  approvalNodeId?: string;
  approvalRole?: string;
  stepLogs: WorkflowExecutionStepLog[];
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  industry: 'E-commerce' | 'Healthcare' | 'Real Estate' | 'SaaS' | 'Customer Support' | 'General';
  description: string;
  category: string;
  trigger: Workflow['trigger'];
  nodes: WorkflowNode[];
}

export interface WorkflowAnalytics {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
  avgExecutionTimeMs: number;
  hoursSavedEstimate: number;
  pendingApprovalsCount: number;
  executionsByIndustry: { industry: string; count: number }[];
  executionsByTrigger: { trigger: string; count: number }[];
  recentExecutions: WorkflowExecution[];
}

export type IntegrationId = 
  | 'gmail'
  | 'outlook'
  | 'google_calendar'
  | 'outlook_calendar'
  | 'slack'
  | 'ms_teams'
  | 'whatsapp'
  | 'telegram'
  | 'discord'
  | 'shopify'
  | 'woocommerce'
  | 'stripe'
  | 'paypal'
  | 'google_drive'
  | 'onedrive'
  | 'dropbox';

export type IntegrationCategory = 'email' | 'calendar' | 'messaging' | 'ecommerce' | 'payment' | 'storage';
export type IntegrationAuthType = 'oauth2' | 'api_key' | 'webhook' | 'bot_token';

export interface IntegrationItem {
  id: IntegrationId;
  name: string;
  category: IntegrationCategory;
  icon: string;
  description: string;
  authType: IntegrationAuthType;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  healthScore: number;
  lastSyncAt?: string;
  config?: {
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
    webhookUrl?: string;
    connectedAccountEmail?: string;
    scopes?: string[];
    accessTokenExpiry?: string;
    refreshToken?: string;
    environment?: 'sandbox' | 'production';
  };
  metrics?: {
    eventsProcessedToday: number;
    avgLatencyMs: number;
    errorCount24h: number;
  };
}

export interface IntegrationApiKey {
  id: string;
  workspaceId: string;
  name: string;
  keyPrefix: string;
  fullKey?: string;
  scopes: string[];
  rateLimitRpm: number;
  status: 'active' | 'revoked';
  lastUsedAt?: string;
  createdAt: string;
}

export interface IntegrationWebhookEndpoint {
  id: string;
  workspaceId: string;
  name: string;
  targetUrl: string;
  secret: string;
  events: string[];
  status: 'active' | 'disabled' | 'failing';
  totalDelivered: number;
  failureCount: number;
  lastDeliveryAt?: string;
  createdAt: string;
}

export interface IntegrationErrorLog {
  id: string;
  workspaceId: string;
  integrationId: string;
  integrationName: string;
  errorCode: string;
  errorMessage: string;
  httpStatus?: number;
  payload?: any;
  canRetry: boolean;
  retryCount: number;
  status: 'unresolved' | 'retrying' | 'resolved';
  timestamp: string;
}

export interface IntegrationAuditLog {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  action: string;
  integrationId?: string;
  details: string;
  timestamp: string;
}

export interface IntegrationAnalyticsData {
  totalConnected: number;
  overallHealthScore: number;
  totalEventsToday: number;
  activeWebhooksCount: number;
  activeApiKeysCount: number;
  categoryBreakdown: { category: string; connectedCount: number; totalCount: number }[];
  dailyEventVolume: { date: string; volume: number; errors: number }[];
  latencyByIntegration: { integrationName: string; avgLatencyMs: number }[];
}

export type QASuiteType = 
  | 'unit' 
  | 'integration' 
  | 'e2e' 
  | 'api' 
  | 'ui' 
  | 'db' 
  | 'auth' 
  | 'security' 
  | 'performance' 
  | 'accessibility' 
  | 'mobile';

export interface QATestCase {
  id: string;
  suite: QASuiteType;
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  durationMs: number;
  errorMessage?: string;
  stackTrace?: string;
  assertionsCount: number;
  codeSnippet?: string;
  categoryTag: string;
}

export type QAAuditSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface QAAuditIssue {
  id: string;
  category: 'bug' | 'memory_leak' | 'broken_link' | 'performance' | 'duplicate_code' | 'dead_code' | 'unused_dep' | 'ui_inconsistency' | 'a11y' | 'security';
  severity: QAAuditSeverity;
  title: string;
  description: string;
  recommendation: string;
  location: string;
  autoFixable: boolean;
  status: 'detected' | 'fixed' | 'waived';
}

export interface QASuiteDashboardData {
  passedTests: number;
  failedTests: number;
  warnings: number;
  totalTests: number;
  performanceScore: number;
  securityScore: number;
  accessibilityScore: number;
  codeQualityScore: number;
  overallScore: number;
  executionTimestamp: string;
  environmentDetails: {
    nodeVersion: string;
    environment: string;
    database: string;
    activeSessions: number;
    memoryUsageMB: number;
    uptimeSeconds: number;
  };
  testCases: QATestCase[];
  auditIssues: QAAuditIssue[];
}

export type PluginCategory = 
  | 'customer_support' 
  | 'sales' 
  | 'marketing' 
  | 'hr' 
  | 'finance' 
  | 'healthcare' 
  | 'education' 
  | 'legal' 
  | 'real_estate' 
  | 'ecommerce' 
  | 'productivity' 
  | 'agent' 
  | 'integration' 
  | 'workflow' 
  | 'analytics' 
  | 'utility' 
  | 'developer';

export type PluginPermission = 
  | 'read_chat_history'
  | 'read_conversations'
  | 'write_messages'
  | 'access_knowledge_base'
  | 'knowledge_base_access'
  | 'external_api_access'
  | 'api_webhooks'
  | 'file_storage'
  | 'workspace_settings'
  | 'workspace_admin'
  | 'analytics_read'
  | 'execute_workflows'
  | 'billing_access';

export interface PluginSettingField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'boolean' | 'number' | 'select';
  description?: string;
  options?: { label: string; value: string }[];
  defaultValue?: any;
}

export interface PluginManifest {
  id: string;
  name: string;
  slug: string;
  version: string;
  latestVersion: string;
  description: string;
  author: string;
  category: PluginCategory;
  type: 'agent' | 'plugin';
  icon: string;
  rating: number;
  reviewsCount: number;
  downloadsCount: number;
  isOfficial: boolean;
  isInstalled: boolean;
  isEnabled: boolean;
  hasUpdate: boolean;
  permissions: PluginPermission[];
  dependencies: { pluginId: string; minVersion: string }[];
  settingsFields: PluginSettingField[];
  settingsValues: Record<string, any>;
  systemPrompt?: string;
  agentRole?: string;
  capabilities: string[];
  extensionHooks: string[];
  eventsExposed: string[];
  sandboxed: boolean;
  verifiedIntegrity: boolean;
  lastUpdated: string;
  minPlatformVersion?: string;
  sha256Signature?: string;
  approvedPermissions?: PluginPermission[];
  providedCapabilities?: string[];
  featured?: boolean;
  // Extended Agent Configurations
  personality?: string;
  modelSelection?: string;
  knowledgeBaseIds?: string[];
  availableTools?: string[];
  welcomeMessage?: string;
  usageAnalytics?: {
    totalInvocations: number;
    totalTokens: number;
    avgLatencyMs: number;
    csatScorePct: number;
    costUsd: number;
  };
  versionHistory?: {
    version: string;
    releasedAt: string;
    changes: string;
  }[];
  reviews?: {
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  activityLogs?: {
    id: string;
    timestamp: string;
    event: string;
    actor: string;
    details: string;
    status: 'success' | 'warning' | 'error';
  }[];
}

export interface AgentCollaborationStep {
  stepIndex: number;
  agentId: string;
  agentName: string;
  agentRole: string;
  action: string;
  inputContext: string;
  outputResult: string;
  durationMs: number;
  tokensUsed: number;
  status: 'pending' | 'running' | 'completed' | 'handed_off' | 'failed';
}

export interface AgentCollaborationTrace {
  id: string;
  taskId: string;
  taskTitle: string;
  initiatingAgentId: string;
  participatingAgentIds: string[];
  sharedContext: Record<string, any>;
  steps: AgentCollaborationStep[];
  finalOutcome: string;
  totalDurationMs: number;
  totalTokensUsed: number;
  createdAt: string;
  status: 'completed' | 'in_progress' | 'failed';
}

export interface MarketplacePlatformData {
  plugins: PluginManifest[];
  analytics: {
    totalInstalled: number;
    activePlugins: number;
    pendingUpdates: number;
    totalAgentExecutions: number;
    avgLatencyMs: number;
    sandboxSecurityScore: number;
  };
  auditLogs: {
    id: string;
    timestamp: string;
    pluginId: string;
    pluginName: string;
    action: 'install' | 'enable' | 'disable' | 'update' | 'uninstall' | 'config_update' | 'error';
    actor: string;
    details: string;
    severity: 'info' | 'warning' | 'error';
  }[];
}

export interface VoiceSettings {
  language: string;
  autoLanguageDetect: boolean;
  voiceName: string;
  speakingRate: number; // 0.5 - 2.0
  speakingPitch: number; // 0.5 - 1.5
  emotion: 'professional' | 'enthusiastic' | 'empathetic' | 'calm' | 'concise';
  mode: 'push_to_talk' | 'hands_free' | 'continuous';
  noiseReduction: boolean;
  autoConfirmBusinessActions: boolean;
  screenReaderCaptions: boolean;
}

export interface VoiceConversationMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language?: string;
  emotion?: string;
  audioDurationSec?: number;
  actionExecuted?: {
    type: 'appointment_booked' | 'lead_captured' | 'ticket_created' | 'doc_searched' | 'workflow_triggered';
    title: string;
    details: Record<string, any>;
  };
}

export interface VoiceShortcutCommand {
  id: string;
  phrase: string;
  actionType: 'book_appointment' | 'create_lead' | 'support_ticket' | 'search_docs' | 'trigger_workflow' | 'navigate_section';
  description: string;
  category: 'Business' | 'Automation' | 'Navigation' | 'Support';
  example: string;
}

export interface KnowledgeChunk {
  id: string;
  docId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  metadata?: Record<string, any>;
}

export interface KnowledgeVersion {
  version: number;
  updatedAt: string;
  updatedBy: string;
  summary: string;
  fileSizeFormatted?: string;
}

export interface KnowledgeDocument {
  id: string;
  workspaceId: string;
  title: string;
  sourceType: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'txt' | 'csv' | 'url' | 'faq' | 'article' | 'manual';
  category: string;
  department: 'All' | 'Engineering' | 'HR' | 'Sales' | 'Legal' | 'Support' | 'Executive';
  folderPath: string;
  tags: string[];
  status: 'indexing' | 'ready' | 'training' | 'failed';
  fileSizeFormatted?: string;
  chunkCount: number;
  version: number;
  versionHistory: KnowledgeVersion[];
  contentHash: string;
  malwareScanStatus: 'clean' | 'scanning' | 'flagged';
  accessPermission: 'public' | 'internal' | 'restricted' | 'confidential';
  createdAt: string;
  updatedAt: string;
  author: string;
  viewsCount: number;
  queriesCitedCount: number;
  rawContent?: string;
  urlLocation?: string;
}

export interface KnowledgeFolder {
  id: string;
  name: string;
  path: string;
  department: string;
  docCount: number;
}

export interface RagSearchQuery {
  query: string;
  searchType: 'hybrid' | 'semantic' | 'keyword';
  departmentFilter?: string;
  categoryFilter?: string;
  topK?: number;
}

export interface RagCitation {
  docId: string;
  docTitle: string;
  sourceType: string;
  snippet: string;
  matchScore: number;
  chunkIndex: number;
}

export interface RagSearchResult {
  answer: string;
  confidenceScore: number;
  latencyMs: number;
  citations: RagCitation[];
  relatedDocuments: { docId: string; title: string; category: string }[];
}

export interface KnowledgeAnalytics {
  totalDocuments: number;
  totalChunks: number;
  totalStorageUsedMb: number;
  avgSearchLatencyMs: number;
  monthlyQueries: number;
  topCitedDocs: { title: string; citations: number }[];
}

// -------------------------------------------------------------------------
// BUSINESS INTELLIGENCE & ENTERPRISE ANALYTICS TYPES
// -------------------------------------------------------------------------

export interface BIExecutiveOverviewData {
  conversationsToday: number;
  conversationsChangePct: number;
  totalCustomers: number;
  customersChangePct: number;
  activeUsersToday: number;
  activeUsersChangePct: number;
  newLeadsToday: number;
  leadsChangePct: number;
  conversionRatePct: number;
  avgResponseTimeMs: number;
  csatScorePct: number;
  aiSuccessRatePct: number;
  mrrGrowthPct: number;
  growthMetricsHistory: {
    month: string;
    revenue: number;
    leads: number;
    activeUsers: number;
    aiConversations: number;
  }[];
}

export interface BIChatAnalyticsData {
  totalConversations: number;
  avgConversationLengthMsgs: number;
  avgDurationMinutes: number;
  mostAskedQuestions: { question: string; count: number; category: string }[];
  peakActivityMap: { day: string; hour: number; value: number }[]; // 7 days x 24 hours
  aiAccuracyPct: number;
  resolutionRatePct: number;
  humanHandoffRatePct: number;
  conversationTrends: { date: string; automated: number; humanEscalated: number; total: number }[];
}

export interface BICustomerAnalyticsData {
  newCustomers: number;
  returningCustomers: number;
  customerEngagementScore: number;
  retentionRate30dPct: number;
  churnRate30dPct: number;
  avgLtvAmount: number;
  customerSegments: { segment: string; count: number; percentage: number; mrrContribution: number }[];
  geographicDistribution: { country: string; code: string; activeUsers: number; percentage: number }[];
  deviceBreakdown: { device: string; icon: string; count: number; percentage: number }[];
  browserBreakdown: { browser: string; count: number; percentage: number }[];
}

export interface BISalesLeadAnalyticsData {
  leadSources: { source: string; count: number; percentage: number; converted: number }[];
  conversionFunnel: { stage: string; count: number; conversionPct: number; dropped: number }[];
  opportunityPipeline: {
    totalOpportunities: number;
    pipelineValueUsd: number;
    avgDealSizeUsd: number;
    winRatePct: number;
    salesReps: { name: string; closedDeals: number; revenueGenerated: number }[];
  };
  campaignPerformance: { name: string; channel: string; costUsd: number; leadsGenerated: number; dealsWon: number; roiPct: number }[];
}

export interface BIAIPerformanceData {
  totalTokensUsed: number;
  promptTokens: number;
  completionTokens: number;
  estimatedCostUsd: number;
  responseLatencyP50Ms: number;
  responseLatencyP90Ms: number;
  responseLatencyP99Ms: number;
  totalApiRequests: number;
  errorRatePct: number;
  avgConfidenceScorePct: number;
  modelBreakdown: { modelName: string; requestCount: number; tokenCount: number; avgLatencyMs: number; costUsd: number }[];
  latencyTrend: { time: string; p50: number; p90: number; p99: number }[];
}

export interface BIReportItem {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  format: 'pdf' | 'excel' | 'csv';
  createdAt: string;
  generatedBy: string;
  status: 'ready' | 'processing' | 'scheduled';
  recipients?: string[];
  scheduleCron?: string;
  fileSizeFormatted?: string;
  downloadUrl?: string;
}

export interface BINotificationAlert {
  id: string;
  type: 'performance' | 'usage' | 'error' | 'goal';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  metricTarget?: string;
  currentValue?: string;
  targetValue?: string;
  timestamp: string;
  isRead: boolean;
}







