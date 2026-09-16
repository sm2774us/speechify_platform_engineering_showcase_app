import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { adrs } from './server/platform/adrs-data.js';
import { agentWorkflows } from './server/platform/agent-workflows.js';
import { assessmentSandbox } from './server/platform/assessment-sandbox.js';
import { inspector } from './server/platform/deep-inspector.js';
import { entitlementsEngine } from './server/platform/entitlements-engine.js';
import { consumptionMeteringEngine } from './server/platform/metering-ledger.js';
import { ttsGateway, VOICES } from './server/platform/tts-gateway.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Request telemetry middleware
  app.use((req, res, next) => {
    const traceId = (req.headers['x-trace-id'] as string) || `trc_req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    res.setHeader('x-trace-id', traceId);
    res.setHeader('x-speechify-version', 'platform-v3.8');
    res.setHeader('x-edge-cluster', 'gcp-us-east1-iad');
    next();
  });

  // ==========================================
  // 1. PUBLIC TTS API GATEWAY
  // ==========================================

  app.get('/api/tts/voices', (req, res) => {
    res.json({
      status: 'ok',
      voices: VOICES,
      totalCount: VOICES.length,
    });
  });

  app.get('/api/tts/metrics', (req, res) => {
    res.json({
      status: 'ok',
      metrics: ttsGateway.getMetrics(),
    });
  });

  app.post('/api/tts/synthesize', async (req, res) => {
    try {
      const { text, voiceId = 'voice_serena_natural', client = 'web', speed = 1.0, userId = 'usr_speechify_50m_canonical' } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Field "text" is required' });
      }

      const traceId = (res.getHeader('x-trace-id') as string) || `trc_tts_${Date.now()}`;
      const result = await ttsGateway.synthesize(userId, client, text, voiceId, speed, traceId);

      res.setHeader('x-ttfb-ms', String(result.ttfbMs));
      res.setHeader('x-total-latency-ms', String(result.totalLatencyMs));
      res.setHeader('x-cache-hit', String(result.cached));
      res.setHeader('x-metered-chars', String(result.characters));

      return res.json({
        status: 'ok',
        ...result,
      });
    } catch (err: any) {
      inspector.log('error', 'tts.gateway', `Synthesis failure: ${err.message}`, 'trc_err');
      return res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // 2. CROSS-STORE BILLING & ENTITLEMENTS API
  // ==========================================

  app.get('/api/billing/state/:userId?', (req, res) => {
    const userId = req.params.userId || 'usr_speechify_50m_canonical';
    const entitlement = entitlementsEngine.getEntitlement(userId);
    res.json({
      status: 'ok',
      entitlement,
      serverTime: new Date().toISOString(),
    });
  });

  app.get('/api/billing/webhooks', (req, res) => {
    res.json({
      status: 'ok',
      webhooks: entitlementsEngine.getWebhookAuditLog(),
    });
  });

  app.post('/api/billing/webhook', async (req, res) => {
    const { provider = 'apple_storekit', eventType = 'DID_RENEW', payload = {} } = req.body;
    const traceId = (res.getHeader('x-trace-id') as string) || `trc_wh_${Date.now()}`;
    const result = await entitlementsEngine.processWebhook(provider, eventType, payload, traceId);
    res.json(result);
  });

  app.post('/api/billing/simulate-scenario', async (req, res) => {
    const { scenarioKey = 'quiet_storekit' } = req.body;
    const traceId = (res.getHeader('x-trace-id') as string) || `trc_scen_${Date.now()}`;
    const result = await entitlementsEngine.simulateScenario(scenarioKey, traceId);
    res.json({
      status: 'ok',
      ...result,
    });
  });

  app.post('/api/billing/reconcile', (req, res) => {
    const result = entitlementsEngine.runBatchReconciliation();
    res.json({ status: 'ok', ...result });
  });

  // ==========================================
  // 3. HIGH-THROUGHPUT CONSUMPTION METERING
  // ==========================================

  app.get('/api/metering/stats', (req, res) => {
    res.json({
      status: 'ok',
      stats: consumptionMeteringEngine.getStats(),
    });
  });

  app.post('/api/metering/concurrency-test', async (req, res) => {
    const { workerCount = 50 } = req.body;
    const result = await consumptionMeteringEngine.runConcurrencyStressTest(Math.min(100, Math.max(5, workerCount)));
    res.json({
      status: 'ok',
      ...result,
    });
  });

  // ==========================================
  // 4. DEEP SYSTEM INSPECTOR (Raw Logs, Ledger, Traces)
  // ==========================================

  app.get('/api/inspector/logs', (req, res) => {
    const { service, level, limit } = req.query;
    const logs = inspector.getLogs(Number(limit) || 80, service as string, level as string);
    res.json({ status: 'ok', logs, totalReturned: logs.length });
  });

  app.get('/api/inspector/ledger', (req, res) => {
    const ledger = inspector.getLedger(40);
    const integrity = inspector.verifyLedgerIntegrity();
    res.json({ status: 'ok', ledger, integrity });
  });

  app.get('/api/inspector/traces', (req, res) => {
    const recentTraces = inspector.getRecentTraces(20);
    res.json({ status: 'ok', traces: recentTraces });
  });

  app.get('/api/inspector/trace/:traceId', (req, res) => {
    const spans = inspector.getTrace(req.params.traceId);
    res.json({ status: 'ok', traceId: req.params.traceId, spans });
  });

  // ==========================================
  // 5. AI AGENTS DAILY WORKFLOW
  // ==========================================

  app.post('/api/agent/run', (req, res) => {
    const { tier = 'unattended' } = req.body;
    const result = agentWorkflows.runWorkflow(tier);
    res.json({ status: 'ok', result });
  });

  // ==========================================
  // 6. ADRs & ARCHITECTURAL DECISIONS
  // ==========================================

  app.get('/api/adrs', (req, res) => {
    res.json({ status: 'ok', adrs });
  });

  // ==========================================
  // 7. TAKE-HOME ASSESSMENT SANDBOX
  // ==========================================

  app.get('/api/assessment/status', (req, res) => {
    res.json({ status: 'ok', statusInfo: assessmentSandbox.getStatus() });
  });

  app.post('/api/assessment/toggle-fix', (req, res) => {
    const { applied = false } = req.body;
    const updated = assessmentSandbox.setFixState(Boolean(applied));
    res.json({ status: 'ok', statusInfo: updated });
  });

  app.post('/api/assessment/run-test', (req, res) => {
    const testResult = assessmentSandbox.runTest();
    res.json({ status: 'ok', testResult });
  });

  // Health check for Cloud Run container ingress
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'HEALTHY',
      service: 'speechify-platform-backend',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    });
  });

  // ==========================================
  // VITE OR STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Speechify Platform Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
