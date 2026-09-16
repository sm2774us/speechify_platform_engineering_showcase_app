import React from 'react';
import {
  Activity,
  Award,
  Cpu,
  Database,
  FileCode,
  Layers,
  Radio,
  Server,
  ShieldCheck,
  Smartphone,
  Terminal,
  Volume2
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDossier: () => void;
  healthStatus?: string;
  liveThroughput?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenDossier,
  healthStatus = 'HEALTHY',
  liveThroughput = 48209,
}) => {
  const navItems = [
    { id: 'tts', label: 'Public TTS API & Audio', icon: Volume2 },
    { id: 'entitlements', label: 'Cross-Store Entitlements', icon: ShieldCheck },
    { id: 'metering', label: 'High-Throughput Metering', icon: Activity },
    { id: 'inspector', label: 'Deep System Inspector', icon: Database },
    { id: 'ai-agents', label: 'AI Daily Setup & Guardrails', icon: Cpu },
    { id: 'adrs', label: 'ADRs & Take-Home Sandbox', icon: FileCode },
  ];

  return (
    <header className="border-b border-slate-800 bg-[#090d16]/95 backdrop-blur sticky top-0 z-40">
      {/* Top Engineering Mission & Health Telemetry Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between border-b border-slate-800/60 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-400 tracking-wide">GCP CLUSTER ACTIVE</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-mono">us-east1-iad (GKE + Cloud Run)</span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline">Serving 50M+ Users across 5 Clients</span>
        </div>

        <div className="flex items-center space-x-3 mt-1 sm:mt-0 font-mono text-[11px]">
          <div className="flex items-center space-x-1.5 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>P95 TTFB: <strong className="text-white">142ms</strong></span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Accuracy: <strong className="text-emerald-400">100.000%</strong></span>
          </div>
          <button
            id="btn-open-dossier"
            onClick={onOpenDossier}
            className="flex items-center space-x-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded transition-colors cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-sans font-semibold">Candidate Dossier</span>
          </button>
        </div>
      </div>

      {/* Main Brand & Scope Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-lg">
            S
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Speechify</h1>
              <span className="bg-blue-950/80 text-blue-300 border border-blue-800/80 text-[10px] font-mono px-2 py-0.5 rounded font-medium">
                PLATFORM ENGINE
              </span>
              <span className="text-slate-500 text-xs hidden lg:inline font-mono">v3.8-distributed</span>
            </div>
            <p className="text-xs text-slate-400">
              High-Scale Backend Systems: Public TTS API, Cross-Store Billing, 50M+ Metering & Deep Telemetry
            </p>
          </div>
        </div>

        {/* 5-Client Ecosystem Badges */}
        <div className="flex items-center space-x-1.5 bg-slate-900/60 p-1 rounded-lg border border-slate-800 text-slate-400 text-xs">
          <span className="px-2 py-1 text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <Layers className="w-3.5 h-3.5 text-slate-500" /> Multi-Client:
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] font-mono">iOS</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] font-mono">Android</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] font-mono">Mac</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] font-mono">Chrome Ext</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] font-mono">Web</span>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-2 overflow-x-auto no-scrollbar">
        <nav className="flex space-x-1.5 text-xs font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
