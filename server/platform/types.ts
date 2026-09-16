export type ClientPlatform = 'ios' | 'android' | 'mac' | 'chrome' | 'web';

export type BillingProvider = 'apple_storekit' | 'google_play' | 'stripe';

export type SubscriptionTier = 'free' | 'premium_monthly' | 'premium_annual' | 'enterprise_api';

export type SubscriptionStatus =
  | 'active'
  | 'in_grace_period'
  | 'on_hold'
  | 'expired'
  | 'revoked'
  | 'trialing';

export interface UserEntitlement {
  userId: string;
  email: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  primaryProvider: BillingProvider;
  originalTransactionId: string;
  expiresAt: string;
  gracePeriodExpiresAt?: string;
  autoRenewStatus: boolean;
  linkedClients: ClientPlatform[];
  features: {
    hdVoices: boolean;
    unlimitedListening: boolean;
    clonedVoice: boolean;
    speedMultiplierMax: number;
    apiAccess: boolean;
    ocrScanning: boolean;
  };
  lastReconciledAt: string;
  version: number;
}

export interface WebhookEvent {
  id: string;
  provider: BillingProvider;
  eventType: string;
  payload: Record<string, any>;
  receivedAt: string;
  processedAt?: string;
  status: 'pending' | 'processed' | 'duplicate_ignored' | 'failed' | 'locked';
  idempotencyKey: string;
  traceId: string;
  signature: string;
}

export interface MeteringRecord {
  id: string;
  timestamp: string;
  userId: string;
  client: ClientPlatform;
  charactersMetered: number;
  wordsMetered: number;
  voiceId: string;
  durationSeconds: number;
  cached: boolean;
  billableUnits: number;
  traceId: string;
}

export interface LedgerEntry {
  sequence: number;
  timestamp: string;
  type: 'CONSUMPTION_DEBIT' | 'ENTITLEMENT_GRANT' | 'ENTITLEMENT_REVOKE' | 'WEBHOOK_RECONCILE' | 'REFUND_SETTLEMENT';
  userId: string;
  delta: number;
  balanceAfter: number;
  metadata: Record<string, any>;
  prevHash: string;
  hash: string;
}

export interface TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  service: string;
  operation: string;
  durationMs: number;
  status: 'ok' | 'error';
  tags: Record<string, string | number | boolean>;
  timestamp: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'audit';
  service: string;
  message: string;
  traceId: string;
  metadata?: Record<string, any>;
}

export interface VoiceProfile {
  id: string;
  name: string;
  gender: 'female' | 'male' | 'neutral';
  language: string;
  category: 'Celebrity' | 'Studio HD' | 'Natural AI' | 'Neural Standard';
  sampleText: string;
  speedRange: [number, number];
  quality: 'ultra-hd' | 'standard';
}
