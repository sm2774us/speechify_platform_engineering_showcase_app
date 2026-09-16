import crypto from 'crypto';
import { LedgerEntry, SystemLog, TraceSpan } from './types.js';

class DeepInspectorStore {
  private logs: SystemLog[] = [];
  private ledger: LedgerEntry[] = [];
  private traces: Map<string, TraceSpan[]> = new Map();
  private maxLogs = 300;
  private maxLedger = 200;

  constructor() {
    // Seed initial genesis block for immutable ledger
    const genesisHash = crypto.createHash('sha256').update('GENESIS_SPEECHIFY_PLATFORM_V1').digest('hex');
    this.ledger.push({
      sequence: 0,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'ENTITLEMENT_GRANT',
      userId: 'usr_speechify_50m_canonical',
      delta: 0,
      balanceAfter: 1000000,
      metadata: { note: 'Genesis platform allocation: 1,000,000 quota units' },
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      hash: genesisHash,
    });

    this.log('info', 'platform.kernel', 'Speechify Platform Engine v3.8 initialized in distributed cluster', 'trc_boot_001');
    this.log('info', 'telemetry.collector', 'OTel gRPC collector streaming traces at 100% sample rate for critical paths', 'trc_boot_001');
  }

  public log(level: 'info' | 'warn' | 'error' | 'audit', service: string, message: string, traceId: string, metadata?: Record<string, any>): SystemLog {
    const entry: SystemLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      level,
      service,
      message,
      traceId,
      metadata,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
    return entry;
  }

  public appendLedger(
    type: LedgerEntry['type'],
    userId: string,
    delta: number,
    metadata: Record<string, any> = {}
  ): LedgerEntry {
    const last = this.ledger[this.ledger.length - 1];
    const prevHash = last ? last.hash : '0000000000000000000000000000000000000000000000000000000000000000';
    const sequence = this.ledger.length;
    const balanceAfter = Math.max(0, (last ? last.balanceAfter : 0) + delta);
    const timestamp = new Date().toISOString();

    const payload = `${sequence}|${timestamp}|${type}|${userId}|${delta}|${balanceAfter}|${JSON.stringify(metadata)}|${prevHash}`;
    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    const record: LedgerEntry = {
      sequence,
      timestamp,
      type,
      userId,
      delta,
      balanceAfter,
      metadata,
      prevHash,
      hash,
    };

    this.ledger.push(record);
    if (this.ledger.length > this.maxLedger) {
      this.ledger.shift();
    }

    return record;
  }

  public recordSpan(span: TraceSpan) {
    const existing = this.traces.get(span.traceId) || [];
    existing.push(span);
    this.traces.set(span.traceId, existing);

    // Keep trace map bounded
    if (this.traces.size > 200) {
      const firstKey = this.traces.keys().next().value;
      if (firstKey) this.traces.delete(firstKey);
    }
  }

  public getLogs(limit = 100, service?: string, level?: string): SystemLog[] {
    return this.logs
      .filter((l) => (!service || l.service.includes(service)) && (!level || l.level === level))
      .slice(0, limit);
  }

  public getLedger(limit = 50): LedgerEntry[] {
    return [...this.ledger].reverse().slice(0, limit);
  }

  public getTrace(traceId: string): TraceSpan[] {
    return this.traces.get(traceId) || [];
  }

  public getRecentTraces(limit = 15): { traceId: string; rootSpan: TraceSpan; totalDuration: number; spanCount: number }[] {
    const results: { traceId: string; rootSpan: TraceSpan; totalDuration: number; spanCount: number }[] = [];

    for (const [traceId, spans] of this.traces.entries()) {
      if (spans.length === 0) continue;
      const rootSpan = spans.find((s) => !s.parentSpanId) || spans[0];
      const totalDuration = spans.reduce((sum, s) => Math.max(sum, s.durationMs), rootSpan.durationMs);
      results.push({
        traceId,
        rootSpan,
        totalDuration,
        spanCount: spans.length,
      });
    }

    return results.reverse().slice(0, limit);
  }

  public verifyLedgerIntegrity(): { intact: boolean; verifiedCount: number; errorIndex?: number } {
    for (let i = 1; i < this.ledger.length; i++) {
      const curr = this.ledger[i];
      const prev = this.ledger[i - 1];

      if (curr.prevHash !== prev.hash) {
        return { intact: false, verifiedCount: i, errorIndex: i };
      }

      const payload = `${curr.sequence}|${curr.timestamp}|${curr.type}|${curr.userId}|${curr.delta}|${curr.balanceAfter}|${JSON.stringify(curr.metadata)}|${curr.prevHash}`;
      const recomputed = crypto.createHash('sha256').update(payload).digest('hex');

      if (recomputed !== curr.hash) {
        return { intact: false, verifiedCount: i, errorIndex: i };
      }
    }

    return { intact: true, verifiedCount: this.ledger.length };
  }
}

export const inspector = new DeepInspectorStore();
