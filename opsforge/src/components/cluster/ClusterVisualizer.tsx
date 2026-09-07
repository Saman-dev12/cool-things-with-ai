import React, { useState } from 'react';
import { useOps } from '../../context/OpsContext';
import { 
  Server, 
  Cpu, 
  Zap, 
  AlertOctagon, 
  CheckCircle2, 
  RefreshCw, 
  Radio, 
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';

export const ClusterVisualizer: React.FC = () => {
  const { topology, currentChallenge } = useOps();
  const [trafficPulsing, setTrafficPulsing] = useState(false);

  const simulateTraffic = () => {
    setTrafficPulsing(true);
    setTimeout(() => setTrafficPulsing(false), 2500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Running':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
          dot: 'bg-emerald-400 shadow-emerald-400/50',
          animate: false
        };
      case 'CrashLoopBackOff':
        return {
          bg: 'bg-red-500/15 border-red-500/40 text-red-400',
          dot: 'bg-red-400 shadow-red-400/50',
          animate: true
        };
      case 'OOMKilled':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
          dot: 'bg-amber-400 shadow-amber-400/50',
          animate: true
        };
      case 'Error':
        return {
          bg: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
          dot: 'bg-rose-400 shadow-rose-400/50',
          animate: true
        };
      default:
        return {
          bg: 'bg-slate-700/20 border-slate-600/40 text-slate-300',
          dot: 'bg-slate-400',
          animate: false
        };
    }
  };

  const isDegraded = topology.errorRatePercent > 5;

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Telemetry Header */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Cluster Topology & Telemetry
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {topology.namespace}
          </span>
        </div>

        <button
          onClick={simulateTraffic}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <Radio className={`w-3 h-3 text-cyan-400 ${trafficPulsing ? 'animate-ping' : ''}`} />
          <span>Probe Health</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-slate-900/30 border-b border-slate-800/60 text-xs font-mono">
        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Cluster CPU</div>
          <div className="text-sm font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>{topology.cpuTotal}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                topology.cpuTotal > 80 ? 'bg-red-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, topology.cpuTotal)}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Memory</div>
          <div className="text-sm font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span>{topology.memTotal}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                topology.memTotal > 80 ? 'bg-amber-400' : 'bg-indigo-400'
              }`}
              style={{ width: `${Math.min(100, topology.memTotal)}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">P99 Latency</div>
          <div className={`text-sm font-bold flex items-center gap-1.5 mt-0.5 ${
            topology.latencyMs > 500 ? 'text-red-400' : 'text-emerald-400'
          }`}>
            <Zap className="w-3.5 h-3.5" />
            <span>{topology.latencyMs}ms</span>
          </div>
          <div className="text-[9px] text-slate-500 mt-1">SLO: &lt; 200ms</div>
        </div>

        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">5xx Error Rate</div>
          <div className={`text-sm font-bold flex items-center gap-1.5 mt-0.5 ${
            isDegraded ? 'text-red-400 animate-pulse' : 'text-emerald-400'
          }`}>
            <Activity className="w-3.5 h-3.5" />
            <span>{topology.errorRatePercent.toFixed(1)}%</span>
          </div>
          <div className="text-[9px] text-slate-500 mt-1">
            {isDegraded ? 'CRITICAL BREACH' : 'NOMINAL'}
          </div>
        </div>
      </div>

      {/* Interactive Topology Graph Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Tier 1: Ingress / Gateway Node */}
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-200">Cloud Ingress Gateway</div>
              <div className="text-[10px] font-mono text-slate-400">{topology.ingressUrl}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>200 OK</span>
          </div>
        </div>

        {/* Traffic Connector Vector */}
        <div className="flex justify-center items-center py-0.5">
          <div className={`w-0.5 h-5 transition-all ${
            isDegraded ? 'bg-red-500/60' : 'bg-emerald-500/60'
          }`} />
        </div>

        {/* Tier 2: Service Layer */}
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-200">Service: {topology.service.name}</div>
              <div className="text-[10px] font-mono text-slate-400">
                {topology.service.type} • Port {topology.service.port} &rarr; {topology.service.targetPort}
              </div>
            </div>
          </div>
          <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
            topology.service.healthy
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/15 border-red-500/30 text-red-400'
          }`}>
            {topology.service.healthy ? 'HEALTHY' : 'UNREACHABLE'}
          </div>
        </div>

        {/* Traffic Connector Vector */}
        <div className="flex justify-center items-center py-0.5">
          <div className={`w-0.5 h-5 transition-all ${
            isDegraded ? 'bg-red-500/60' : 'bg-emerald-500/60'
          }`} />
        </div>

        {/* Tier 3: Pods / Replicas Grid */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Workload Pods / Replicas ({topology.pods.length})</span>
            <span className="text-[10px] font-mono text-slate-500">Node: prod-worker-az1</span>
          </div>

          <div className="space-y-2">
            {topology.pods.map(pod => {
              const badge = getStatusBadge(pod.status);
              return (
                <div
                  key={pod.id}
                  className={`p-3 rounded-xl border bg-slate-900/90 transition-all ${
                    badge.animate ? 'border-red-500/50 shadow-lg shadow-red-500/10' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`w-2.5 h-2.5 rounded-full ${badge.dot} ${badge.animate ? 'animate-ping' : ''}`} />
                      <span className="font-mono text-xs text-slate-200 truncate">{pod.name}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badge.bg}`}>
                      {pod.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500">Ready: </span>
                      <span className="text-slate-300 font-semibold">{pod.ready}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Restarts: </span>
                      <span className={pod.restarts > 5 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                        {pod.restarts}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Mem: </span>
                      <span className="text-slate-300">{pod.memUsage}</span>
                    </div>
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
