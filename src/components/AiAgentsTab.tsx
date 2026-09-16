import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertOctagon,
  Shield,
  Zap,
  Terminal,
  Clock,
  ArrowRight,
  GitPullRequest,
  Lock,
  UserCheck,
  Play
} from 'lucide-react';
import { AgentWorkflowResult } from '../../server/platform/agent-workflows.js';

export const AiAgentsTab: React.FC = () => {
  const [activeTier, setActiveTier] = useState<'unattended' | 'reviewed' | 'gated'>('unattended');
  const [running, setRunning] = useState<boolean>(false);
  const [result, setResult] = useState<AgentWorkflowResult | null>(null);

  const handleRunAgentWorkflow = async (tier: 'unattended' | 'reviewed' | 'gated') => {
    setActiveTier(tier);
    setRunning(true);
    setResult(null);

    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.result) {
        setResult(data.result);
      }
    } catch (err) {
      console.error('Agent workflow error:', err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Cpu className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">AI Agents in Daily Platform Engineering Workflow</h2>
              <span className="bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono px-2 py-0.5 rounded font-semibold">
                SPEECHIFY PLATFORM CRITERION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              &quot;A daily working setup with AI agents you can describe in detail — what runs unattended, what you review, and where you&apos;ve decided
              it doesn&apos;t get to act alone.&quot; Test interactive live simulations of each boundary below.
            </p>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Zero Autonomous Destruction
            </span>
          </div>
        </div>
      </div>

      {/* 3-Tier Selector Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1 */}
        <div
          onClick={() => handleRunAgentWorkflow('unattended')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTier === 'unattended'
              ? 'bg-purple-950/40 border-purple-500 shadow-sm shadow-purple-500/20'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
              TIER 1: UNATTENDED
            </span>
            <Play className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <h3 className="text-sm font-bold text-white mt-2">Dead-Letter Queue Healer</h3>
          <p className="text-xs text-slate-400 mt-1">
            Runs 24/7 in GKE. Replays transient 503 store webhook drops, verifies JWS signatures, clears backlogs without human intervention.
          </p>
        </div>

        {/* Tier 2 */}
        <div
          onClick={() => handleRunAgentWorkflow('reviewed')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTier === 'reviewed'
              ? 'bg-purple-950/40 border-purple-500 shadow-sm shadow-purple-500/20'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 font-mono">
              TIER 2: HUMAN-REVIEWED
            </span>
            <GitPullRequest className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <h3 className="text-sm font-bold text-white mt-2">B2B API Schema Evolver</h3>
          <p className="text-xs text-slate-400 mt-1">
            Analyzes partner OpenAPI 3.1 contracts, runs 42 backward-compat fixtures, drafts PR diffs. Staff Engineer reviews and merges.
          </p>
        </div>

        {/* Tier 3 */}
        <div
          onClick={() => handleRunAgentWorkflow('gated')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTier === 'gated'
              ? 'bg-purple-950/40 border-purple-500 shadow-sm shadow-purple-500/20'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 font-mono">
              TIER 3: STRICTLY GATED
            </span>
            <Lock className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <h3 className="text-sm font-bold text-white mt-2">Financial Balance Guard</h3>
          <p className="text-xs text-slate-400 mt-1">
            Agent cannot act alone. Financial balance adjustments over 50k units require dual-engineer cryptographic sign-off via CLI / 2FA.
          </p>
        </div>
      </div>

      {/* Execution Console & System Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Execution Output */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Active Simulation: {result?.agentName || 'Select a tier above'}
              </h3>
            </div>
            <button
              onClick={() => handleRunAgentWorkflow(activeTier)}
              disabled={running}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Zap className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
              <span>{running ? 'Executing...' : 'Re-run Workflow'}</span>
            </button>
          </div>

          {result ? (
            <div className="space-y-4">
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 space-y-2">
                <div className="text-xs text-slate-300 font-semibold flex items-center justify-between">
                  <span>Triggering Event:</span>
                  <span className="text-[10px] font-mono text-purple-400">{result.autonomyLevel}</span>
                </div>
                <p className="text-xs text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800">
                  {result.triggerEvent}
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-300 mb-2">Step-by-Step Actions Executed:</div>
                <div className="space-y-1.5 font-mono text-xs">
                  {result.actionsExecuted.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-slate-950 border border-slate-800/70 text-slate-300 flex items-start space-x-2"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {result.humanActionRequired && (
                <div className="bg-amber-950/40 border border-amber-800 text-amber-300 p-3 rounded-lg text-xs flex items-start space-x-2">
                  <UserCheck className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="font-semibold block font-sans">Human Barrier Enforced:</strong>
                    <span className="font-mono text-[11px]">{result.humanActionRequired}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Click any tier above to simulate the agent runtime execution.
            </div>
          )}
        </div>

        {/* Right: Verification Against System & Guardrails */}
        <div className="lg:col-span-5 space-y-5">
          {/* System Verification Box */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              State Verification Against The System
            </h3>
            <p className="text-xs text-slate-400">
              Never trust a generated summary — verify against the actual database row or proof token.
            </p>

            {result ? (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-xs space-y-2">
                <div>
                  <span className="text-slate-500 text-[10px] block">Target Resource:</span>
                  <span className="text-cyan-300 text-[11px] font-semibold">{result.systemVerification.targetResource}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Before State:</span>
                  <span className="text-slate-300 text-[11px]">{result.systemVerification.beforeState}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">After State:</span>
                  <span className="text-emerald-400 text-[11px]">{result.systemVerification.afterState}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Audit Token / Commit SHA:</span>
                  <span className="text-purple-300 text-[10px] truncate block">{result.systemVerification.cryptographicProofOrLogId}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs">
                Run an agent tier to inspect raw before/after state diffs.
              </div>
            )}
          </div>

          {/* Safety Guardrails Matrix */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              Active Safety Guardrails
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 font-sans">
              {(result?.safetyGuardrails || [
                'All actions logged to append-only immutable ledger',
                'Circuit breakers halt execution if error rate > 2%',
                'Rate-limited to max 50 autonomous events per minute',
              ]).map((guard, i) => (
                <li key={i} className="flex items-center space-x-2 bg-slate-950 p-2 rounded border border-slate-800/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px]">{guard}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
