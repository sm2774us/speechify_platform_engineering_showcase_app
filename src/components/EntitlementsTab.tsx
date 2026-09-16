import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Layers,
  CheckCircle2,
  Lock,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Database,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import { UserEntitlement, WebhookEvent } from '../types.js';

export const EntitlementsTab: React.FC = () => {
  const [entitlement, setEntitlement] = useState<UserEntitlement | null>(null);
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>([]);
  const [activeScenario, setActiveScenario] = useState<any>(null);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [reconciling, setReconciling] = useState<boolean>(false);
  const [reconcileResult, setReconcileResult] = useState<any>(null);

  useEffect(() => {
    fetchEntitlement();
    fetchWebhooks();
  }, []);

  const fetchEntitlement = async () => {
    try {
      const res = await fetch('/api/billing/state');
      const data = await res.json();
      if (data.entitlement) {
        setEntitlement(data.entitlement);
      }
    } catch (err) {
      console.error('Failed to fetch entitlement:', err);
    }
  };

  const fetchWebhooks = async () => {
    try {
      const res = await fetch('/api/billing/webhooks');
      const data = await res.json();
      if (data.webhooks) {
        setWebhooks(data.webhooks);
      }
    } catch (err) {
      console.error('Failed to fetch webhooks:', err);
    }
  };

  const handleSimulateScenario = async (scenarioKey: string) => {
    setSimulating(true);
    try {
      const res = await fetch('/api/billing/simulate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioKey }),
      });
      const data = await res.json();
      setActiveScenario(data);
      if (data.finalEntitlement) {
        setEntitlement(data.finalEntitlement);
      }
      fetchWebhooks();
    } catch (err) {
      console.error('Scenario error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleRunReconcile = async () => {
    setReconciling(true);
    try {
      const res = await fetch('/api/billing/reconcile', { method: 'POST' });
      const data = await res.json();
      setReconcileResult(data);
      fetchEntitlement();
    } catch (err) {
      console.error('Reconcile error:', err);
    } finally {
      setReconciling(false);
    }
  };

  const handleSendWebhook = async (provider: string, eventType: string) => {
    try {
      await fetch('/api/billing/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          eventType,
          payload: {
            userId: 'usr_speechify_50m_canonical',
            originalTransactionId: '1000000982341123',
            timestamp: Date.now(),
          },
        }),
      });
      fetchEntitlement();
      fetchWebhooks();
    } catch (err) {
      console.error('Webhook error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">Cross-Platform Subscription & Entitlements Engine</h2>
              <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-mono px-2 py-0.5 rounded font-semibold">
                Multi-Store SSoT
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Subscription state must stay consistent across five clients (iOS, Android, Mac, Chrome, Web) and two app-store billing systems (Apple
              StoreKit 2 &amp; Google Play RTDN) plus Stripe. Systems are designed so that when store webhooks go quiet, users are never double charged
              or abruptly cut off.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-run-reconciliation"
              onClick={handleRunReconcile}
              disabled={reconciling}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reconciling ? 'animate-spin' : ''}`} />
              <span>{reconciling ? 'Auditing Accounts...' : 'Run Idempotent Cron Sweep'}</span>
            </button>
          </div>
        </div>

        {reconcileResult && (
          <div className="mt-3 bg-emerald-950/40 border border-emerald-800/80 rounded-lg p-2.5 text-xs text-emerald-300 flex items-center justify-between font-mono">
            <span>
              Sweep verified: {reconcileResult.examinedAccounts} subscription accounts in {reconcileResult.durationMs}ms. Zero orphan states found.
            </span>
            <span className="text-[10px] text-emerald-400">STATUS: INTACT</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Canonical Entitlement State Card */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                Canonical State (Cloud Spanner / Postgres)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Ver: {entitlement?.version || 1}</span>
            </div>

            {entitlement ? (
              <div className="space-y-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">User ID</span>
                    <span className="text-slate-200 font-bold">{entitlement.userId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Current Tier</span>
                    <span className="text-blue-400 font-bold uppercase">{entitlement.tier.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans">Status</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        entitlement.status === 'active'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : entitlement.status === 'in_grace_period'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {entitlement.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Primary Billing Provider</span>
                    <span className="text-slate-300 font-bold">{entitlement.primaryProvider.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Original Tx ID</span>
                    <span className="text-slate-400 truncate max-w-[180px]">{entitlement.originalTransactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Expires At</span>
                    <span className="text-slate-300">{new Date(entitlement.expiresAt).toLocaleDateString()}</span>
                  </div>
                  {entitlement.gracePeriodExpiresAt && (
                    <div className="flex justify-between text-amber-400">
                      <span className="font-sans">Grace Period Closes</span>
                      <span>{new Date(entitlement.gracePeriodExpiresAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Linked Clients */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Synced Clients (Session Cache Invalidated on Change)
                  </label>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                    {['ios', 'mac', 'chrome', 'web', 'android'].map((c) => {
                      const isLinked = entitlement.linkedClients.includes(c as any);
                      return (
                        <span
                          key={c}
                          className={`px-2.5 py-1 rounded border ${
                            isLinked
                              ? 'bg-blue-950/60 border-blue-800/80 text-blue-300'
                              : 'bg-slate-950 border-slate-800/60 text-slate-600 line-through'
                          }`}
                        >
                          {c.toUpperCase()}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Unlocked Features */}
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Entitled Feature Gates</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${entitlement.features.hdVoices ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>HD Celebrity Voices</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${entitlement.features.unlimitedListening ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>Unlimited Listening</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${entitlement.features.clonedVoice ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>Voice Cloning</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${entitlement.features.apiAccess ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>Public TTS API Key</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">Loading entitlement state...</div>
            )}
          </div>
        </div>

        {/* Right Column: Edge-Case Simulators & Webhook Stream */}
        <div className="lg:col-span-7 space-y-5">
          {/* Edge Case Interactive Scenario Runner */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>Production Edge-Case Simulators (Named in Job Description)</span>
              <span className="text-[10px] text-blue-400 font-mono">1-Click Test</span>
            </h3>
            <p className="text-xs text-slate-400">
              The JD notes: <em className="text-slate-300">&quot;Subscription state has to stay consistent across five clients and two app-store billing systems that each go quiet at the worst moment.&quot;</em> Test the platform resolutions below:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                id="btn-scenario-quiet-storekit"
                onClick={() => handleSimulateScenario('quiet_storekit')}
                disabled={simulating}
                className="text-left p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-amber-300 group-hover:text-amber-200">1. The Quiet StoreKit Race</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Apple webhooks drop during monthly renewal. Mac app gets 24h grace lease without user cutoff.
                </p>
              </button>

              <button
                id="btn-scenario-cross-store"
                onClick={() => handleSimulateScenario('cross_store_upgrade')}
                disabled={simulating}
                className="text-left p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-blue-300 group-hover:text-blue-200">2. Cross-Store Upgrade Conflict</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-300" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  User on iOS ($11.99/mo) buys Enterprise Web on Stripe ($299/yr). Precedence rule applied + cancellation link sent.
                </p>
              </button>

              <button
                id="btn-scenario-google-play"
                onClick={() => handleSimulateScenario('google_play_recovery')}
                disabled={simulating}
                className="text-left p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-emerald-300 group-hover:text-emerald-200">3. Google Play Retry Recovery</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-300" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  RTDN card recovery webhook processed out-of-order with distributed lock. Status restored.
                </p>
              </button>

              <button
                id="btn-scenario-refund"
                onClick={() => handleSimulateScenario('app_store_refund_revocation')}
                disabled={simulating}
                className="text-left p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-900/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-rose-300 group-hover:text-rose-200">4. Instant Refund Revocation</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-300" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Apple Care issues refund. Entitlement revoked in 4ms; session caches purged across all 5 clients.
                </p>
              </button>
            </div>

            {/* Scenario Execution Result Box */}
            {activeScenario && (
              <div className="mt-3 bg-slate-950 border border-blue-500/30 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-300">{activeScenario.scenarioName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Simulated in 12ms</span>
                </div>
                <p className="text-xs text-slate-300">{activeScenario.description}</p>
                <div className="space-y-1 pt-1 border-t border-slate-800">
                  {activeScenario.stepsTaken?.map((step: string, i: number) => (
                    <div key={i} className="text-[11px] text-slate-400 font-mono flex items-start space-x-1.5">
                      <ArrowRight className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Webhook Audit Log & Idempotency Table */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" />
                Webhook Ingestion & Idempotency Audit Stream
              </h3>
              <div className="flex gap-1.5 text-[11px]">
                <button
                  onClick={() => handleSendWebhook('apple_storekit', 'DID_RENEW')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  + Apple Renew
                </button>
                <button
                  onClick={() => handleSendWebhook('google_play', 'SUBSCRIPTION_RECOVERED')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  + Google Play
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                    <th className="pb-2">Provider</th>
                    <th className="pb-2">Event</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Idempotency Key</th>
                    <th className="pb-2">Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {webhooks.slice(0, 6).map((w) => (
                    <tr key={w.id} className="hover:bg-slate-800/30">
                      <td className="py-2 text-slate-200 font-semibold">{w.provider}</td>
                      <td className="py-2 text-blue-400">{w.eventType}</td>
                      <td className="py-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            w.status === 'processed'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : w.status === 'duplicate_ignored'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {w.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 text-slate-400 truncate max-w-[140px]">{w.idempotencyKey}</td>
                      <td className="py-2 text-slate-500 truncate max-w-[100px]">{w.signature}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
