import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Clock,
  Radio,
  CheckCircle2,
  Copy,
  Terminal,
  Shield,
  Layers,
  Sparkles,
  Sliders
} from 'lucide-react';
import { VoiceProfile } from '../types.js';

export const TtsApiTab: React.FC = () => {
  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('voice_serena_natural');
  const [selectedClient, setSelectedClient] = useState<'ios' | 'android' | 'mac' | 'chrome' | 'web'>('chrome');
  const [speed, setSpeed] = useState<number>(1.5);
  const [text, setText] = useState<string>(
    'The mission of Speechify is to ensure reading is never a barrier to learning. Over 50 million people turn books, PDFs, and articles into natural audio to read 3x faster and retain more.'
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchVoices();
    fetchMetrics();
  }, []);

  const fetchVoices = async () => {
    try {
      const res = await fetch('/api/tts/voices');
      const data = await res.json();
      if (data.voices) {
        setVoices(data.voices);
      }
    } catch (err) {
      console.error('Failed to fetch voices:', err);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/tts/metrics');
      const data = await res.json();
      if (data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  const handleSynthesize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setIsPlaying(false);

    try {
      const res = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-trace-id': `trc_ui_${Date.now()}`,
        },
        body: JSON.stringify({
          text,
          voiceId: selectedVoiceId,
          client: selectedClient,
          speed,
          userId: 'usr_speechify_50m_canonical',
        }),
      });

      const data = await res.json();
      setLastResponse(data);
      fetchMetrics();

      if (data.audioBase64) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(data.audioBase64);
        audio.playbackRate = speed;
        audioRef.current = audio;

        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          console.warn('Audio playback failed; falling back to speech synthesis');
          playFallbackSpeech();
        };

        await audio.play();
        setIsPlaying(true);
      } else {
        playFallbackSpeech();
      }
    } catch (err) {
      console.error('Synthesize error:', err);
      playFallbackSpeech();
    } finally {
      setLoading(false);
    }
  };

  const playFallbackSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = Math.min(2.5, speed);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) {
      handleSynthesize();
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => playFallbackSpeech());
    }
  };

  const copyCurlSnippet = () => {
    const curl = `curl -X POST https://api.speechify.com/v1/tts/synthesize \\
  -H "Authorization: Bearer sk_live_speechify_platform_enterprise" \\
  -H "Content-Type: application/json" \\
  -H "x-client-platform: ${selectedClient}" \\
  -d '{
    "text": "${text.replace(/"/g, '\\"')}",
    "voiceId": "${selectedVoiceId}",
    "speed": ${speed}
  }'`;
    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const currentVoice = voices.find((v) => v.id === selectedVoiceId) || voices[0];

  return (
    <div className="space-y-6">
      {/* Top Architecture & SLA banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Volume2 className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">Public TTS API Gateway & Audio Synthesis</h2>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded font-semibold">
                99.995% SLA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Speechify’s public voice API powers external enterprise applications, LMS platforms, and 50M+ users. Systems are architected with
              edge POP caching, sub-80ms Time-To-First-Byte (TTFB), and atomic consumption metering.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto font-mono text-xs">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
              <div className="text-[10px] text-slate-500 font-sans uppercase font-medium">P50 Latency</div>
              <div className="text-white font-bold text-sm mt-0.5">{metrics?.p50LatencyMs || 78} ms</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
              <div className="text-[10px] text-slate-500 font-sans uppercase font-medium">P95 TTFB</div>
              <div className="text-blue-400 font-bold text-sm mt-0.5">{metrics?.p95LatencyMs || 142} ms</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
              <div className="text-[10px] text-slate-500 font-sans uppercase font-medium">Edge Cache Ratio</div>
              <div className="text-emerald-400 font-bold text-sm mt-0.5">{metrics?.cacheHitRatio || 87.4}%</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
              <div className="text-[10px] text-slate-500 font-sans uppercase font-medium">Global Requests</div>
              <div className="text-slate-300 font-bold text-sm mt-0.5">{metrics?.totalRequests ? metrics.totalRequests.toLocaleString() : '48,209'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Audio Studio */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Audio Synthesis Studio
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Caller Client:</span>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded px-2.5 py-1 font-mono focus:outline-none focus:border-blue-500"
                >
                  <option value="chrome">Chrome Extension</option>
                  <option value="ios">iOS App</option>
                  <option value="mac">Mac Native</option>
                  <option value="android">Android App</option>
                  <option value="web">Web App / B2B</option>
                </select>
              </div>
            </div>

            {/* Voice Cards Grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select Voice Profile ({voices.length} Available)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {voices.map((v) => {
                  const isSelected = v.id === selectedVoiceId;
                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVoiceId(v.id);
                        if (v.sampleText) setText(v.sampleText);
                      }}
                      className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-200 truncate">{v.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                          {v.category.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">{v.language}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reading Speed Slider (Speechify's signature high-speed listening) */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  Reading Speed Multiplier: <strong className="text-blue-400 font-mono text-sm">{speed}x</strong>
                </span>
                <span className="text-slate-500 text-[11px]">Speechify Dyslexia Acceleration (Up to 4.5x)</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.5"
                step="0.25"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0.5x (Careful)</span>
                <span>1.0x (Normal)</span>
                <span>2.0x (Speed Read)</span>
                <span>3.5x (Founder Cliff)</span>
                <span>4.5x (Extreme)</span>
              </div>
            </div>

            {/* Text Input Area */}
            <div>
              <div className="flex justify-between items-center text-xs text-slate-300 mb-1.5">
                <label className="font-semibold">Text Payload ({text.length} characters, ~{text.trim().split(/\s+/).length} words)</label>
                <div className="flex gap-1.5">
                  <button
                    onClick={() =>
                      setText(
                        'Dyslexia affects 1 in 5 people. By listening to books and research at high speeds, cognitive processing shifts to auditory cortex pathways.'
                      )
                    }
                    className="text-[10px] text-blue-400 hover:text-blue-300 underline"
                  >
                    Sample 1
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={() =>
                      setText(
                        'Platform engineering requires building resilient systems where correctness compounds across distributed microservices.'
                      )
                    }
                    className="text-[10px] text-blue-400 hover:text-blue-300 underline"
                  >
                    Sample 2
                  </button>
                </div>
              </div>
              <textarea
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                placeholder="Enter or paste text to synthesize..."
              />
            </div>

            {/* Synthesize & Playback Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2">
                <button
                  id="btn-synthesize-tts"
                  onClick={handleSynthesize}
                  disabled={loading || !text.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
                >
                  <Zap className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Synthesizing Audio...' : 'Synthesize Speech (TTS API)'}</span>
                </button>

                {lastResponse && (
                  <button
                    onClick={togglePlayPause}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-700"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                    <span>{isPlaying ? 'Pause' : 'Replay Audio'}</span>
                  </button>
                )}
              </div>

              {lastResponse && (
                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span
                    className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                      lastResponse.cached
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                    }`}
                  >
                    {lastResponse.cached ? 'POP EDGE CACHE HIT (18ms)' : 'NEURAL GPU SYNTHESIZED'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Telemetry & Developer cURL Toolkit */}
        <div className="lg:col-span-5 space-y-5">
          {/* Real-time Response Telemetry Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center justify-between uppercase tracking-wider">
              <span>Execution Telemetry</span>
              <span className="text-[10px] text-slate-500 font-mono">Trace: {lastResponse?.traceId || 'trc_idle'}</span>
            </h3>

            {lastResponse ? (
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-400 text-[11px]">Time-To-First-Byte (TTFB)</span>
                  <span className="text-blue-400 font-bold">{lastResponse.ttfbMs} ms</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-400 text-[11px]">Total Request Latency</span>
                  <span className="text-white font-bold">{lastResponse.totalLatencyMs} ms</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-400 text-[11px]">Metered Characters</span>
                  <span className="text-emerald-400 font-bold">{lastResponse.characters} chars</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-400 text-[11px]">Audio Duration</span>
                  <span className="text-slate-300 font-bold">{lastResponse.durationSeconds}s</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-400 text-[11px]">Edge POP Region</span>
                  <span className="text-slate-300 text-[11px] truncate">{lastResponse.edgePop}</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/60 rounded-lg p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800">
                Click &quot;Synthesize Speech&quot; to test edge POP latency and inspect live HTTP headers.
              </div>
            )}
          </div>

          {/* B2B / Enterprise Developer Toolkit */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                B2B Integration cURL
              </h3>
              <button
                onClick={copyCurlSnippet}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                {copiedCurl ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCurl ? 'Copied!' : 'Copy cURL'}</span>
              </button>
            </div>

            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
              <p className="text-slate-500"># Speechify Public Voice Synthesis Endpoint</p>
              <p className="text-blue-300">curl -X POST https://api.speechify.com/v1/tts/synthesize \</p>
              <p className="pl-4 text-slate-400">-H &quot;Authorization: Bearer sk_live_speechify_platform_enterprise&quot; \</p>
              <p className="pl-4 text-slate-400">-H &quot;Content-Type: application/json&quot; \</p>
              <p className="pl-4 text-slate-400">-H &quot;x-client-platform: {selectedClient}&quot; \</p>
              <p className="pl-4 text-emerald-300">
                -d &#39;&#123;&quot;voiceId&quot;: &quot;{selectedVoiceId}&quot;, &quot;speed&quot;: {speed}, &quot;text&quot;: &quot;...&quot;&#125;&#39;
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
              <span>Auth: OAuth2 / HMAC-SHA256</span>
              <span>Rate Limit: 3,000 req/min (Burst 5,000)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
