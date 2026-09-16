export interface ADR {
  id: string;
  title: string;
  status: 'ACCEPTED' | 'REJECTED_ALTERNATIVE' | 'SUPERSEDED';
  domain: 'Billing & Entitlements' | 'TTS Streaming' | 'Consumption Metering' | 'Infrastructure & Cloud';
  whatWeBuilt: string;
  whatWeDropped: string;
  whyWeDroppedIt: string;
  tradeoffsAndCorrections: string;
  gcpImplementation: string;
  howItMadeOurJobSmaller: string;
}

export const ARCHITECTURAL_DECISION_RECORDS: ADR[] = [
  {
    id: 'ADR-001',
    title: 'Cross-Store Entitlements: Unified Distributed Saga vs. Multi-Region Active-Active Distributed Spanner 2PC',
    status: 'ACCEPTED',
    domain: 'Billing & Entitlements',
    whatWeBuilt:
      'Regional Cloud SQL (PostgreSQL) + Memorystore Redis lease locks + Idempotent Event Saga orchestrated via Cloud Pub/Sub with dead-letter queue backoff.',
    whatWeDropped:
      'Globally distributed active-active two-phase commit (2PC) across multi-region Cloud Spanner clusters for mobile store webhooks.',
    whyWeDroppedIt:
      'Apple and Google Play webhooks are regionalized and inherently bursty/asynchronous. Distributed 2PC introduces cross-region WAN coordination latency (~150ms roundtrip) and brittle distributed deadlock risks during store outages. Dropping 2PC avoided a multi-million-dollar annual database footprint while delivering 99.999% correctness through simple idempotent event deduplication.',
    tradeoffsAndCorrections:
      'Tradeoff: Cross-store subscription state is eventual consistency within ~250ms rather than immediate global synchronous locking. To prevent user confusion, we grant an optimistic 24-hour grace lease on client devices when a store webhook goes quiet.',
    gcpImplementation:
      'GCP Cloud Run ingress -> Cloud Pub/Sub (Ordering Keys: `userId`) -> GKE Billing Consumer -> Cloud SQL with row-level locks -> Memorystore Redis cluster cache.',
    howItMadeOurJobSmaller:
      'Zero 3 AM pages for distributed cross-region deadlocks. Apple and Google store webhook retries are handled self-sufficiently by Pub/Sub without human babysitting.',
  },
  {
    id: 'ADR-002',
    title: 'Consumption Metering: In-Memory Sliding Ledger with Batch Writeback vs. Synchronous Per-Chunk DB Inserts',
    status: 'ACCEPTED',
    domain: 'Consumption Metering',
    whatWeBuilt:
      'Two-tier metering: Microsecond atomic token accumulation in local memory / Redis, asynchronously flushed in 500ms batches into an immutable append-only ledger.',
    whatWeDropped:
      'Direct synchronous write of every audio chunk delivery into an ACID transactional SQL database table.',
    whyWeDroppedIt:
      'At 50 million users and hundreds of thousands of concurrent TTS streaming sentences, direct database writes would generate 400,000+ IOPS, saturating connection pools and driving cloud bills through the roof. Synchronous DB writes added 45ms overhead to every single sentence chunk, violating our TTFB budget.',
    tradeoffsAndCorrections:
      'Tradeoff: Up to 500ms of in-flight unpersisted meter state in the catastrophic event of a sudden container node crash. We corrected this by configuring GKE pod preStop graceful drain hooks and maintaining client-side optimistic sentence sequence tracking.',
    gcpImplementation:
      'GKE Pods running TS/Node with shared Redis cluster running Lua atomic scripts for rate-limiting and character tallies -> Async flush to Google Cloud Bigtable / Cloud Spanner.',
    howItMadeOurJobSmaller:
      'Eliminated connection exhaustion incidents and reduced database operational costs by 84%, leaving engineers free to build customer-facing features.',
  },
  {
    id: 'ADR-003',
    title: 'Public TTS API Streaming: HTTP/2 Chunked Transfer & WebSockets vs. WebRTC / gRPC-Web to Browser Clients',
    status: 'ACCEPTED',
    domain: 'TTS Streaming',
    whatWeBuilt:
      'Standard HTTP/2 Chunked Transfer-Encoding with Server-Sent Events (SSE) metadata and byte-range audio caching.',
    whatWeDropped:
      'Full duplex WebRTC audio streaming pipelines for mobile and Chrome extensions.',
    whyWeDroppedIt:
      'WebRTC requires complex TURN/STUN infrastructure, suffers from strict enterprise firewall blockage, and breaks intermediate edge caching (Cloud CDN). By dropping WebRTC, 87% of common sentence requests are served directly from edge POPs in under 20ms without invoking neural worker GPUs.',
    tradeoffsAndCorrections:
      'Tradeoff: Half-duplex streaming rather than sub-20ms bidirectional interactive audio. Corrected by pre-buffering next paragraph audio using speculative predictive prefetching.',
    gcpImplementation:
      'Google Cloud Armor (DDoS & WAF) -> Cloud CDN -> Cloud Load Balancing -> GKE Ingress (Envoy proxy with HTTP/2 streaming enabled) -> Neural Audio Synthesizer pods.',
    howItMadeOurJobSmaller:
      'TURN server operational toil dropped to zero; edge CDN handles 85%+ of repetitive audio hits completely hands-off.',
  },
  {
    id: 'ADR-004',
    title: 'Subscription Entitlement Verification: Client Token with Cryptographic HMAC vs. Frequent Remote Polling',
    status: 'ACCEPTED',
    domain: 'Billing & Entitlements',
    whatWeBuilt:
      'Signed compact lease tokens (`x-speechify-entitlement-jwt`) verified locally at API gateways using ECDSA/HMAC, refreshed every 6 hours or upon webhook push.',
    whatWeDropped:
      'Mandatory synchronous backend database entitlement queries on every single playback press from mobile, Mac, or Chrome extension.',
    whyWeDroppedIt:
      'Querying the billing database on every "Play" click across 50M users would turn the billing service into a single point of failure for reading. If the billing service had an outage, users wouldn’t even be able to listen to books offline.',
    tradeoffsAndCorrections:
      'Tradeoff: Revocations take up to 4ms if Redis pub/sub push reaches the client, or up to the lease token expiry if disconnected. Acceptable tradeoff for 99.999% reading availability.',
    gcpImplementation:
      'Cloud KMS for token signing keys, Firebase / Cloud Identity for client sessions, Redis pub/sub for push-based cache eviction.',
    howItMadeOurJobSmaller:
      'Reading uptime is decoupled from billing infrastructure downtime.',
  },
];
