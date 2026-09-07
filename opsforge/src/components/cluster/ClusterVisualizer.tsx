import React, { useState } from 'react';
import { useOps } from '../../context/OpsContext';
import { 
  Server, 
  Cpu, 
  Zap, 
  Radio, 
  Activity,
  Layers
} from 'lucide-react';

export const ClusterVisualizer: React.FC = () => {
  const { topology } = useOps();
  const [trafficPulsing, setTrafficPulsing] = useState(false);

  const simulateTraffic = () => {
    setTrafficPulsing(true);
    setTimeout(() => setTrafficPulsing(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Running':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
          dot: 'bg-emerald-400',
          animate: false
        };
      case 'CrashLoopBackOff':
        return {
          bg: 'bg-rose-500/10 border-rose-500/25 text-rose-400',
          dot: 'bg-rose-400',
          animate: true
        };
      case 'OOMKilled':
        return {
          bg: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
          dot: 'bg-amber-400',
          animate: true
        };
      case 'Error':
        return {
          bg: 'bg-rose-500/10 border-rose-500/25 text-rose-400',
          dot: 'bg-rose-400',
          animate: true
        };
      default:
        return {
          bg: 'bg-white/5 border-white/10 text-zinc-400',
          dot: 'bg-zinc-400',
          animate: false
        };
    }
  };

  const isDegraded = topology.errorRatePercent > 5;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] overflow-hidden">
      {/* Telemetry Header */}
      <div className="px-3 py-2 border-b border-white/[0.06] bg-[var(--bg-panel)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[11px] font-semibold text-white">
            Cluster Telemetry
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-[var(--text-muted)] border border-white/[0.06]">
            {topology.namespace}
          </span>
        </div>

        <button
          onClick={simulateTraffic}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 transition"
        >
          <Radio className={`w-3 h-3 text-cyan-400 ${trafficPulsing ? 'animate-ping' : ''}`} />
          <span>Probe</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-4 gap-2 p-2.5 bg-white/[0.02] border-b border-white/[0.06] text-xs font-mono">
        <div className="bg-white/[0.02] p-2 rounded-lg border border-white/[0.04]">
          <div className="text-[9px] text-[var(--text-muted)] uppercase">CPU</div>
          <div className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
            <Cpu className="w-3 h-3 text-zinc-400" />
            <span>{topology.cpuTotal}%</span>
          </div>
          <div className="w-full bg-white/10 h-1 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                topology.cpuTotal > 80 ? 'bg-rose-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, topology.cpuTotal)}%` }}
            />
          </div>
        </div>

        <div className="bg-white/[0.02] p-2 rounded-lg border border-white/[0.04]">
          <div className="text-[9px] text-[var(--text-muted)] uppercase">Memory</div>
          <div className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
            <Server className="w-3 h-3 text-zinc-400" />
            <span>{topology.memTotal}%</span>
          </div>
          <div className="w-full bg-white/10 h-1 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                topology.memTotal > 80 ? 'bg-amber-400' : 'bg-indigo-400'
              }`}
              style={{ width: `${Math.min(100, topology.memTotal)}%` }}
            />
          </div>
        </div>

        <div className="bg-white/[0.02] p-2 rounded-lg border border-white/[0.04]">
          <div className="text-[9px] text-[var(--text-muted)] uppercase">P99 Latency</div>
          <div className={`text-xs font-bold flex items-center gap-1 mt-0.5 ${
            topology.latencyMs > 500 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            <Zap className="w-3 h-3" />
            <span>{topology.latencyMs}ms</span>
          </div>
          <div className="text-[9px] text-[var(--text-muted)] mt-0.5">&lt; 200ms SLO</div>
        </div>

        <div className="bg-white/[0.02] p-2 rounded-lg border border-white/[0.04]">
          <div className="text-[9px] text-[var(--text-muted)] uppercase">5xx Errors</div>
          <div className={`text-xs font-bold flex items-center gap-1 mt-0.5 ${
            isDegraded ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            <Activity className="w-3 h-3" />
            <span>{topology.errorRatePercent.toFixed(1)}%</span>
          </div>
          <div className="text-[9px] text-[var(--text-muted)] mt-0.5">
            {isDegraded ? 'BREACH' : 'OK'}
          </div>
        </div>
      </div>

      {/* Interactive Topology Graph Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {/* Tier 1: Ingress / Gateway Node */}
        <div className="bg-white/[0.02] border border-white/[0.06] p-2.5 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-white">Ingress Gateway</div>
              <div className="text-[10px] font-mono text-[var(--text-muted)]">{topology.ingressUrl}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>200 OK</span>
          </div>
        </div>

        {/* Tier 2: Workload Pods */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
            Pod Replicas ({topology.pods.length})
          </div>

          <div className="space-y-1.5">
            {topology.pods.map(pod => {
              const badge = getStatusBadge(pod.status);
              return (
                <div
                  key={pod.id}
                  className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className={`w-2 h-2 rounded-full ${badge.dot} ${badge.animate ? 'animate-ping' : ''}`} />
                    <span className="font-mono text-xs text-white truncate">{pod.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      Restarts: {pod.restarts}
                    </span>
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${badge.bg}`}>
                      {pod.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
