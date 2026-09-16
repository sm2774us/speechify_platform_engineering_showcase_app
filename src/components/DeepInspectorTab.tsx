import React, { useState, useEffect } from 'react';
import {
  Database,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Code,
  Layers
} from 'lucide-react';
import { LedgerEntry, SystemLog, TraceSpan } from '../types.js';

export const DeepInspectorTab: React.FC = () => {
  const [subTab, setSubTab] = useState<'logs' | 'ledger' | 'traces'>('logs');
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [ledgerIntegrity, setLedgerIntegrity] = useState<any>(null);
  const [traces, setTraces] = useState<any[]>([]);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [selectedTraceSpans, setSelectedTraceSpans] = useState<TraceSpan[]>([]);

  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    fetchAll();
  }, [serviceFilter, levelFilter]);

  const fetchAll = async () => {
    setRefreshing(true);
    try {
      // 1. Fetch logs
      const logParams = new URLSearchParams();
      if (serviceFilter) logParams.append('service', serviceFilter);
      if (levelFilter) logParams.append('level', levelFilter);

      const logsRes = await fetch(`/api/inspector/logs?${logParams.toString()}`);
      const logsData = await logsRes.json();
      if (logsData.logs) setLogs(logsData.logs);

      // 2. Fetch ledger
      const ledgerRes = await fetch('/api/inspector/ledger');
      const ledgerData = await ledgerRes.json();
      if (ledgerData.ledger) setLedger(ledgerData.ledger);
      if (ledgerData.integrity) setLedgerIntegrity(ledgerData.integrity);

      // 3. Fetch traces
      const tracesRes = await fetch('/api/inspector/traces');
      const tracesData = await tracesRes.json();
      if (tracesData.traces) {
        setTraces(tracesData.traces);
        if (tracesData.traces.length > 0 && !selectedTraceId) {
          loadTraceDetails(tracesData.traces[0].traceId);
        }
      }
    } catch (err) {
      console.error('Inspector fetch error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const loadTraceDetails = async (traceId: string) => {
    setSelectedTraceId(traceId);
    try {
      const res = await fetch(`/api/inspector/trace/${traceId}`);
      const data = await res.json();
      if (data.spans) {
        setSelectedTraceSpans(data.spans);
      }
    } catch (err) {
      console.error('Failed to load trace spans:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Database className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">The Instinct: Deep System Inspector</h2>
              <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono px-2 py-0.5 rounded font-semibold">
                RAW SYSTEM OF RECORD
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              &quot;The instinct to check a result against the system itself — logs, database state, the actual request — rather than against a summary
              of it.&quot; Inspect raw structured telemetry, immutable SHA-256 chained ledger entries, and OpenTelemetry trace spans.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchAll}
              disabled={refreshing}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh State</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation */}
        <div className="flex space-x-2 mt-4 border-t border-slate-800/80 pt-3 text-xs font-medium">
          <button
            onClick={() => setSubTab('logs')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
              subTab === 'logs' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Structured JSON Logs ({logs.length})</span>
          </button>
          <button
            onClick={() => setSubTab('ledger')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
              subTab === 'ledger' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SHA-256 Immutable Ledger ({ledger.length})</span>
          </button>
          <button
            onClick={() => setSubTab('traces')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
              subTab === 'traces' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Distributed OTel Traces</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: STRUCTURED JSON LOGS */}
      {subTab === 'logs' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-300">Filters:</span>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded px-2.5 py-1 font-mono focus:outline-none"
              >
                <option value="">All Services</option>
                <option value="tts.gateway">tts.gateway</option>
                <option value="billing.webhook">billing.webhook</option>
                <option value="billing.storekit_reconciler">billing.storekit_reconciler</option>
                <option value="metering.flush">metering.flush</option>
                <option value="metering.stress_test">metering.stress_test</option>
                <option value="agent">agent workflows</option>
              </select>

              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded px-2.5 py-1 font-mono focus:outline-none"
              >
                <option value="">All Levels</option>
                <option value="info">INFO</option>
                <option value="warn">WARN</option>
                <option value="error">ERROR</option>
                <option value="audit">AUDIT</option>
              </select>
            </div>

            <span className="text-[11px] text-slate-500 font-mono">Real-Time Ingestion Buffer</span>
          </div>

          <div className="space-y-2 font-mono text-xs max-h-[500px] overflow-y-auto pr-1">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const levelColor =
                log.level === 'error'
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : log.level === 'warn'
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : log.level === 'audit'
                  ? 'bg-purple-950 text-purple-300 border-purple-800'
                  : 'bg-slate-800 text-slate-300 border-slate-700';

              return (
                <div
                  key={log.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 hover:border-slate-700 transition-colors"
                >
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="flex items-start justify-between cursor-pointer gap-2"
                  >
                    <div className="flex items-start space-x-2 truncate">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${levelColor} uppercase shrink-0`}>
                        {log.level}
                      </span>
                      <span className="text-cyan-400 font-semibold shrink-0 text-[11px]">[{log.service}]</span>
                      <span className="text-slate-300 text-[11px] truncate">{log.message}</span>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0 text-[10px] text-slate-500">
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Trace ID:</span>
                        <span className="text-cyan-300 font-semibold">{log.traceId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Exact ISO Timestamp:</span>
                        <span className="text-slate-300">{log.timestamp}</span>
                      </div>
                      {log.metadata && (
                        <div>
                          <span className="text-slate-500 block mb-1">Structured Metadata:</span>
                          <pre className="bg-slate-900 p-2 rounded text-[10px] text-emerald-300 overflow-x-auto border border-slate-800">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: IMMUTABLE LEDGER */}
      {subTab === 'ledger' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Cryptographic Append-Only Ledger
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Every debit and entitlement change is chained: <code>SHA-256(seq | timestamp | delta | prevHash)</code>.
              </p>
            </div>

            {ledgerIntegrity && (
              <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>INTEGRITY VERIFIED: {ledgerIntegrity.verifiedCount} BLOCKS INTACT</span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] font-mono text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                  <th className="pb-2">Seq</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">User</th>
                  <th className="pb-2">Delta</th>
                  <th className="pb-2">Balance After</th>
                  <th className="pb-2">Block Hash (SHA-256)</th>
                  <th className="pb-2">Prev Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ledger.map((entry) => (
                  <tr key={entry.sequence} className="hover:bg-slate-800/30">
                    <td className="py-2 text-slate-400 font-bold">#{entry.sequence}</td>
                    <td className="py-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          entry.type === 'CONSUMPTION_DEBIT'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : entry.type === 'ENTITLEMENT_GRANT'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}
                      >
                        {entry.type}
                      </span>
                    </td>
                    <td className="py-2 text-slate-300 truncate max-w-[120px]">{entry.userId}</td>
                    <td className={`py-2 font-bold ${entry.delta < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                    </td>
                    <td className="py-2 text-white font-bold">{entry.balanceAfter.toLocaleString()}</td>
                    <td className="py-2 text-emerald-400 truncate max-w-[120px]" title={entry.hash}>
                      {entry.hash.substring(0, 16)}...
                    </td>
                    <td className="py-2 text-slate-500 truncate max-w-[100px]" title={entry.prevHash}>
                      {entry.prevHash.substring(0, 12)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: DISTRIBUTED OTEL TRACES */}
      {subTab === 'traces' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Traces List */}
          <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Recent Distributed Traces</h3>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 font-mono text-xs">
              {traces.map((t) => {
                const isSelected = selectedTraceId === t.traceId;
                return (
                  <button
                    key={t.traceId}
                    onClick={() => loadTraceDetails(t.traceId)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white text-[11px] truncate">{t.rootSpan?.operation || 'route'}</span>
                      <span className="text-cyan-400 font-bold">{t.totalDuration} ms</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span className="truncate max-w-[160px]">{t.traceId}</span>
                      <span>{t.spanCount} spans</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trace Waterfall Breakdown */}
          <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Trace Waterfall Timeline</h3>
                <span className="text-[10px] text-cyan-400 font-mono">{selectedTraceId || 'Select a trace'}</span>
              </div>
            </div>

            {selectedTraceSpans.length > 0 ? (
              <div className="space-y-3 font-mono text-xs">
                {selectedTraceSpans.map((span) => {
                  const maxDur = Math.max(...selectedTraceSpans.map((s) => s.durationMs), 1);
                  const pct = Math.max(12, Math.min(100, Math.round((span.durationMs / maxDur) * 100)));

                  return (
                    <div key={span.spanId} className="bg-slate-950 p-2.5 rounded border border-slate-800/80 space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-white font-semibold">
                          {span.service} &rarr; <span className="text-cyan-300">{span.operation}</span>
                        </span>
                        <span className="text-cyan-400 font-bold">{span.durationMs} ms</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <div className="flex flex-wrap gap-1 text-[10px] text-slate-500 pt-0.5">
                        {Object.entries(span.tags || {}).map(([k, v]) => (
                          <span key={k} className="bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                            {k}={String(v)}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">No trace selected or empty spans.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
