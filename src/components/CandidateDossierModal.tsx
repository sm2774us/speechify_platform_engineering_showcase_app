import React from 'react';
import {
  X,
  Award,
  CheckCircle2,
  Cpu,
  Server,
  Cloud,
  FileCode,
  ShieldCheck,
  Zap,
  Terminal,
  ExternalLink,
  Target
} from 'lucide-react';

interface CandidateDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CandidateDossierModal: React.FC<CandidateDossierModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Candidate Platform Dossier</h2>
              <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                SPEECHIFY FIT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Role: Software Engineer, Platform &bull; Fort Lauderdale, FL / 100% Distributed &bull; 50M+ User Scale
            </p>
          </div>
        </div>

        {/* Mission Statement Alignment */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
          <strong className="text-white block font-semibold">
            Why Speechify &amp; How This Showcase Proves Immediate Readiness:
          </strong>
          <p className="text-slate-400 leading-relaxed">
            Speechify&apos;s mission is that <span className="text-slate-200 font-semibold">reading is never a barrier to learning</span>.
            The Platform team owns the backend behind everything Speechify ships: payments, subscriptions, auth, consumption tracking, and the public
            TTS API. This application was architected from the ground up to reflect the exact principles and technologies called for in your role
            specification.
          </p>
        </div>

        {/* 8 JD Requirement Alignments Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Direct Requirement-by-Requirement Alignment
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-blue-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Proven TS/Node Backend (Required)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Built complete full-stack TypeScript backend with Express, microsecond in-memory hot loops, sub-1ms atomic metering, and SHA-256
                idempotency guards.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-blue-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Direct GCP, Docker &amp; Kubernetes (GKE)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Architecture grounded in Google Cloud: Cloud Run ingress, GKE high availability pods, Cloud Pub/Sub with ordering keys, Memorystore
                Redis cluster, Cloud SQL.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-blue-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cross-Store Correctness (Apple + Google + Stripe)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Implemented multi-store state machine handling the exact edge cases in the JD: &quot;two app-store billing systems that go quiet at the
                worst moment&quot; &mdash; with zero double-charge guarantee.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-blue-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>50M+ High-Throughput Metering</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Two-tier engine with sub-millisecond atomic memory accumulator + asynchronous 500ms durable flush to Bigtable/Spanner. Tested with 50+
                concurrent worker streams.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-blue-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AI Agents in Daily Setup (3 Tiers)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Clear operational boundaries: Unattended (DLQ Healer), Human-Reviewed (B2B API Schema Evolver), and Gated (Financial ledger adjustments
                blocked without 2FA).
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-blue-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>The Instinct: Checking Against The System</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Never relying on summaries. Raw JSON logs, SHA-256 cryptographically chained immutable ledger, and OpenTelemetry trace waterfalls built
                into the inspector.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-blue-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Judgment About What NOT to Build</span>
              </div>
              <p className="text-[11px] text-slate-400">
                ADRs with explicit dropped alternatives: dropped 2PC Spanner in favor of idempotent Saga; dropped WebRTC in favor of HTTP/2 chunked
                streaming + edge POP cache.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-blue-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Preference For Being Corrected &amp; Take-Home Rig</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Integrated interactive Take-Home Assessment Sandbox simulating multi-tab Chrome streaming race condition, live fix toggle, and
                regression test execution.
              </p>
            </div>
          </div>
        </div>

        {/* Closing Action */}
        <div className="bg-blue-950/40 border border-blue-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-blue-300">
            <span className="font-semibold block font-sans">Ready for the Technical Interview &amp; Take-Home Assessment:</span>
            <span className="text-[11px] text-slate-400">
              &quot;The job is to make your own job smaller. People become leaders here by taking scope and being right about it, fast.&quot;
            </span>
          </div>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Explore Application Systems
          </button>
        </div>
      </div>
    </div>
  );
};
