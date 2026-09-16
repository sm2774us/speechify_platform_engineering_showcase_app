import React, { useState, useEffect } from 'react';
import {
  FileCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Code,
  Layers,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Server,
  Cloud,
  Check,
  X
} from 'lucide-react';
import { ADR } from '../types.js';
import { AssessmentTestCase } from '../../server/platform/assessment-sandbox.js';

export const AdrsAndTakeHomeTab: React.FC = () => {
  const [subSection, setSubSection] = useState<'sandbox' | 'adrs'>('sandbox');
  const [adrs, setAdrs] = useState<ADR[]>([]);
  const [assessmentStatus, setAssessmentStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<AssessmentTestCase | null>(null);
  const [runningTest, setRunningTest] = useState<boolean>(false);
  const [expandedAdrId, setExpandedAdrId] = useState<string | null>('ADR-001');

  useEffect(() => {
    fetchAdrs();
    fetchAssessmentStatus();
  }, []);

  const fetchAdrs = async () => {
    try {
      const res = await fetch('/api/adrs');
      const data = await res.json();
      if (data.adrs) setAdrs(data.adrs);
    } catch (err) {
      console.error('Failed to fetch ADRs:', err);
    }
  };

  const fetchAssessmentStatus = async () => {
    try {
      const res = await fetch('/api/assessment/status');
      const data = await res.json();
      if (data.statusInfo) setAssessmentStatus(data.statusInfo);
    } catch (err) {
      console.error('Failed to fetch assessment status:', err);
    }
  };

  const handleToggleFix = async (applied: boolean) => {
    try {
      const res = await fetch('/api/assessment/toggle-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applied }),
      });
      const data = await res.json();
      if (data.statusInfo) setAssessmentStatus(data.statusInfo);
      setTestResult(null);
    } catch (err) {
      console.error('Toggle fix error:', err);
    }
  };

  const handleRunTest = async () => {
    setRunningTest(true);
    try {
      const res = await fetch('/api/assessment/run-test', { method: 'POST' });
      const data = await res.json();
      if (data.testResult) setTestResult(data.testResult);
    } catch (err) {
      console.error('Run test error:', err);
    } finally {
      setRunningTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FileCode className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">ADRs & Take-Home Assessment Sandbox</h2>
              <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono px-2 py-0.5 rounded font-semibold">
                SPEECHIFY INTERVIEW RIG
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              &quot;Judgment about what not to build, and the ability to say plainly why you dropped it... A preference for being corrected over being
              right... The assessment runs in two stages: you&apos;ll submit, get real feedback from an engineer on this team, and have time to act on
              it.&quot;
            </p>
          </div>

          <div className="flex space-x-2 text-xs font-medium">
            <button
              onClick={() => setSubSection('sandbox')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                subSection === 'sandbox' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Take-Home Sandbox
            </button>
            <button
              onClick={() => setSubSection('adrs')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                subSection === 'adrs' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Architectural Decisions ({adrs.length})
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: TAKE HOME SANDBOX */}
      {subSection === 'sandbox' && (
        <div className="space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  {assessmentStatus?.issueTitle || 'Take-Home Assessment Scenario'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{assessmentStatus?.symptom}</p>
              </div>

              {/* Fix Toggle Switch */}
              <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-300 font-semibold">Production Fix:</span>
                <button
                  id="btn-toggle-assessment-fix"
                  onClick={() => handleToggleFix(!assessmentStatus?.isFixApplied)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                    assessmentStatus?.isFixApplied
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {assessmentStatus?.isFixApplied ? 'FIX APPLIED (PATCHED)' : 'BUGGY STATE (UNPATCHED)'}
                </button>
              </div>
            </div>

            {/* The Instinct Banner */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1 font-mono">
              <strong className="text-blue-400 font-sans block font-semibold">
                The Instinct to Check Against the System Itself:
              </strong>
              <p className="text-slate-400">{assessmentStatus?.instinctToCheckAgainstSystem}</p>
            </div>

            {/* Code Diff Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-slate-950 rounded-lg p-3 border border-rose-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-rose-400">
                  <span>❌ Buggy Implementation (Random UUID):</span>
                  <span className="text-[10px] text-slate-500 font-mono">Prone to double debit</span>
                </div>
                <pre className="text-[11px] font-mono text-slate-300 bg-slate-900/80 p-2.5 rounded overflow-x-auto border border-slate-800 leading-relaxed">
                  {assessmentStatus?.buggyCodeSnippet}
                </pre>
              </div>

              <div className="bg-slate-950 rounded-lg p-3 border border-emerald-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span> Fixed Implementation (Content-Addressed Idempotency):</span>
                  <span className="text-[10px] text-slate-500 font-mono">Atomic SETNX 60s Lease</span>
                </div>
                <pre className="text-[11px] font-mono text-slate-300 bg-slate-900/80 p-2.5 rounded overflow-x-auto border border-slate-800 leading-relaxed">
                  {assessmentStatus?.fixedCodeSnippet}
                </pre>
              </div>
            </div>

            {/* Test Runner Control & Output */}
            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <button
                id="btn-run-assessment-test"
                onClick={handleRunTest}
                disabled={runningTest}
                className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer shadow-sm shadow-amber-500/20"
              >
                <Play className={`w-3.5 h-3.5 ${runningTest ? 'animate-spin' : ''}`} />
                <span>{runningTest ? 'Running Stress Suite...' : 'Execute Regression Test Suite'}</span>
              </button>

              <span className="text-xs text-slate-400 font-mono">Dispatches 10 concurrent sentence chunk requests</span>
            </div>

            {/* Test Results Output Box */}
            {testResult && (
              <div
                className={`p-4 rounded-lg border font-mono text-xs space-y-3 ${
                  testResult.status === 'PASSED'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {testResult.status === 'PASSED' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                    <span className="font-bold text-sm">
                      {testResult.status === 'PASSED' ? 'TEST PASSED (100% CORRECTNESS)' : 'TEST FAILED (RACE CONDITION CONFIRMED)'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{testResult.durationMs} ms</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-950/80 p-2.5 rounded border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block">Concurrent Requests:</span>
                    <span className="text-white font-bold">{testResult.inputRequests}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Expected Debits:</span>
                    <span className="text-white font-bold">{testResult.expectedDebits}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Actual Debits:</span>
                    <span className={testResult.actualDebits > 1 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {testResult.actualDebits}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Duplicates Filtered:</span>
                    <span className="text-blue-400 font-bold">{testResult.duplicateDetections}</span>
                  </div>
                </div>

                <div className="text-[11px] p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  {testResult.rawLogSnippet}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: ARCHITECTURAL DECISION RECORDS */}
      {subSection === 'adrs' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
            <h4 className="font-bold text-white mb-1">Platform Engineering Philosophy: &quot;Judgment About What NOT to Build&quot;</h4>
            <p className="text-slate-400">
              The JD states: <em>&quot;Judgment about what not to build, and the ability to say plainly why you dropped it. A preference for being corrected over being right.&quot;</em>
              Below are 4 authentic Architectural Decision Records representing Speechify backend platform design choices.
            </p>
          </div>

          <div className="space-y-3">
            {adrs.map((adr) => {
              const isExpanded = expandedAdrId === adr.id;
              return (
                <div key={adr.id} className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
                  <div
                    onClick={() => setExpandedAdrId(isExpanded ? null : adr.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-mono font-bold">
                        {adr.id}
                      </span>
                      <span className="text-xs font-bold text-white">{adr.title}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-slate-500">
                      <span className="text-[10px] font-mono uppercase bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                        {adr.domain}
                      </span>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 space-y-3 border-t border-slate-800/80 text-xs font-sans">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-slate-950 p-3 rounded-lg border border-emerald-900/30">
                          <span className="text-emerald-400 font-semibold block mb-1 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" /> What We Built:
                          </span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">{adr.whatWeBuilt}</p>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-lg border border-rose-900/30">
                          <span className="text-rose-400 font-semibold block mb-1 flex items-center gap-1.5">
                            <X className="w-3.5 h-3.5" /> What We Dropped:
                          </span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">{adr.whatWeDropped}</p>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                        <div>
                          <strong className="text-amber-400 font-semibold block">Why We Dropped It:</strong>
                          <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">{adr.whyWeDroppedIt}</p>
                        </div>

                        <div>
                          <strong className="text-blue-400 font-semibold block">Tradeoffs &amp; How We Corrected Them:</strong>
                          <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">{adr.tradeoffsAndCorrections}</p>
                        </div>

                        <div>
                          <strong className="text-cyan-400 font-semibold block">GCP &amp; Cloud Native Implementation:</strong>
                          <p className="text-slate-300 text-[11px] mt-0.5 font-mono">{adr.gcpImplementation}</p>
                        </div>

                        <div className="bg-slate-900/90 p-2 rounded border border-slate-800 text-[11px] text-purple-300 flex items-start space-x-2">
                          <Zap className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                          <div>
                            <strong>How It Made Our Job Smaller:</strong> {adr.howItMadeOurJobSmaller}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
