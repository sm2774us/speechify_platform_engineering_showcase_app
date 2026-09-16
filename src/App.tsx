import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { TtsApiTab } from './components/TtsApiTab.js';
import { EntitlementsTab } from './components/EntitlementsTab.js';
import { MeteringTab } from './components/MeteringTab.js';
import { DeepInspectorTab } from './components/DeepInspectorTab.js';
import { AiAgentsTab } from './components/AiAgentsTab.js';
import { AdrsAndTakeHomeTab } from './components/AdrsAndTakeHomeTab.js';
import { CandidateDossierModal } from './components/CandidateDossierModal.js';
import {
  Server,
  Radio,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Award,
  ExternalLink,
  Cpu
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('tts');
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setSystemHealth(data);
    } catch (err) {
      console.error('Failed to fetch health status:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Platform Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDossier={() => setIsDossierOpen(true)}
        healthStatus={systemHealth?.status}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'tts' && <TtsApiTab />}
        {activeTab === 'entitlements' && <EntitlementsTab />}
        {activeTab === 'metering' && <MeteringTab />}
        {activeTab === 'inspector' && <DeepInspectorTab />}
        {activeTab === 'ai-agents' && <AiAgentsTab />}
        {activeTab === 'adrs' && <AdrsAndTakeHomeTab />}
      </main>

      {/* Candidate Dossier Modal */}
      <CandidateDossierModal isOpen={isDossierOpen} onClose={() => setIsDossierOpen(false)} />

      {/* Global Engineering Footer & Architectural Attributions */}
      <footer className="border-t border-slate-800/80 bg-[#090d16] text-xs text-slate-400 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            <div>
              <p className="text-slate-200 font-semibold">
                Speechify Platform Engineering Showcase
              </p>
              <p className="text-[11px] text-slate-500">
                Crafted for the Software Engineer, Platform Role &bull; Fort Lauderdale, FL / 100% Distributed
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              GCP Cloud Run + GKE
            </span>
            <span>&bull;</span>
            <span>Cloud Pub/Sub FIFO</span>
            <span>&bull;</span>
            <span>Memorystore Redis</span>
            <span>&bull;</span>
            <span>Cloud Spanner Ledger</span>
          </div>

          <button
            onClick={() => setIsDossierOpen(true)}
            className="flex items-center space-x-1.5 text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            <span>View Candidate Match Dossier</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
