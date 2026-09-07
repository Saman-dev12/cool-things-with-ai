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
          text: 'text-[#00b8a3]',
          dot: 'bg-[#00b8a3]',
          bg: 'bg-[#00b8a3]/10 border-[#00b8a3]/30'
        };
      case 'CrashLoopBackOff':
        return {
          text: 'text-[#ff375f]',
          dot: 'bg-[#ff375f]',
          bg: 'bg-[#ff375f]/10 border-[#ff375f]/30'
        };
      case 'OOMKilled':
        return {
          text: 'text-[#ffc01e]',
          dot: 'bg-[#ffc01e]',
          bg: 'bg-[#ffc01e]/10 border-[#ffc01e]/30'
        };
      case 'Error':
        return {
          text: 'text-[#ff375f]',
          dot: 'bg-[#ff375f]',
          bg: 'bg-[#ff375f]/10 border-[#ff375f]/30'
        };
      default:
        return {
          text: 'text-zinc-400',
          dot: 'bg-zinc-400',
          bg: 'bg-zinc-800 border-zinc-700'
        };
    }
  };

  const isDegraded = topology.errorRatePercent > 5;

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] overflow-hidden text-xs">
      {/* Telemetry Header */}
      <div className="px-3 py-2 border-b border-[#383838] bg-[#262626] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-semibold text-white">
            Cluster Telemetry
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#333333] text-zinc-400 border border-[#444]">
            ns: {topology.namespace}
          </span>
        </div>

        <button
          onClick={simulateTraffic}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-[#333333] hover:bg-[#3d3d3d] text-zinc-300 transition"
        >
          <Radio className={`w-3 h-3 text-zinc-400 ${trafficPulsing ? 'animate-ping' : ''}`} />
          <span>Probe Health</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-4 gap-2 p-2.5 bg-[#222222] border-b border-[#333333] text-xs font-mono">
        <div className="bg-[#282828] p-2 rounded border border-[#383838]">
          <div className="text-[10px] text-zinc-400 uppercase">CPU Usage</div>
          <div className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
            <Cpu className="w-3 h-3 text-zinc-400" />
            <span>{topology.cpuTotal}%</span>
          </div>
          <div className="w-full bg-[#383838] h-1 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                topology.cpuTotal > 80 ? 'bg-[#ff375f]' : 'bg-[#00b8a3]'
              }`}
              style={{ width: `${Math.min(100, topology.cpuTotal)}%` }}
            />
          </div>
        </div>

        <div className="bg-[#282828] p-2 rounded border border-[#383838]">
          <div className="text-[10px] text-zinc-400 uppercase">Memory</div>
          <div className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
            <Server className="w-3 h-3 text-zinc-400" />
            <span>{topology.memTotal}%</span>
          </div>
          <div className="w-full bg-[#383838] h-1 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                topology.memTotal > 80 ? 'bg-[#ffc01e]' : 'bg-zinc-400'
              }`}
              style={{ width: `${Math.min(100, topology.memTotal)}%` }}
            />
          </div>
        </div>

        <div className="bg-[#282828] p-2 rounded border border-[#383838]">
          <div className="text-[10px] text-zinc-400 uppercase">P99 Latency</div>
          <div className={`text-xs font-bold flex items-center gap-1 mt-0.5 ${
            topology.latencyMs > 500 ? 'text-[#ff375f]' : 'text-[#00b8a3]'
          }`}>
            <Zap className="w-3 h-3" />
            <span>{topology.latencyMs}ms</span>
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">&lt; 200ms SLO</div>
        </div>

        <div className="bg-[#282828] p-2 rounded border border-[#383838]">
          <div className="text-[10px] text-zinc-400 uppercase">5xx Error Rate</div>
          <div className={`text-xs font-bold flex items-center gap-1 mt-0.5 ${
            isDegraded ? 'text-[#ff375f]' : 'text-[#00b8a3]'
          }`}>
            <Activity className="w-3 h-3" />
            <span>{topology.errorRatePercent.toFixed(1)}%</span>
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">
            {isDegraded ? 'BREACHING' : 'HEALTHY'}
          </div>
        </div>
      </div>

      {/* Workload Pods List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
          <span className="font-semibold text-zinc-300">Workload Pod Replicas ({topology.pods.length})</span>
          <span className="font-mono text-[11px]">Ingress: {topology.ingressUrl}</span>
        </div>

        <div className="space-y-1.5">
          {topology.pods.map(pod => {
            const badge = getStatusBadge(pod.status);
            return (
              <div
                key={pod.id}
                className="p-2 rounded border border-[#333333] bg-[#242424] flex items-center justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                  <span className="font-mono text-xs text-zinc-200 truncate">{pod.name}</span>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-zinc-400">
                    Restarts: {pod.restarts}
                  </span>
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${badge.bg} ${badge.text}`}>
                    {pod.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
