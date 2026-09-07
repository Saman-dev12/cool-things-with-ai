import React, { useState } from 'react';
import { useOps } from '../../context/OpsContext';
import { 
  Server, 
  Cpu, 
  Zap, 
  Radio, 
  Activity,
  Layers,
  Code2,
  CheckCircle2
} from 'lucide-react';

export const ClusterVisualizer: React.FC = () => {
  const { topology, currentChallenge } = useOps();
  const [testcaseTab, setTestcaseTab] = useState<'case1' | 'case2' | 'case3' | 'topology'>('case1');
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
    <div className="flex flex-col h-full bg-[#1e1e1e] overflow-hidden text-xs select-none">
      {/* LeetCode Testcase Sub-tabs Bar */}
      <div className="px-3 py-1.5 border-b border-[#383838] bg-[#262626] flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTestcaseTab('case1')}
            className={`px-2.5 py-1 rounded text-xs font-mono transition ${
              testcaseTab === 'case1'
                ? 'bg-[#333333] text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-[#2e2e2e]'
            }`}
          >
            Case 1
          </button>
          <button
            onClick={() => setTestcaseTab('case2')}
            className={`px-2.5 py-1 rounded text-xs font-mono transition ${
              testcaseTab === 'case2'
                ? 'bg-[#333333] text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-[#2e2e2e]'
            }`}
          >
            Case 2
          </button>
          <button
            onClick={() => setTestcaseTab('case3')}
            className={`px-2.5 py-1 rounded text-xs font-mono transition ${
              testcaseTab === 'case3'
                ? 'bg-[#333333] text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-[#2e2e2e]'
            }`}
          >
            Case 3
          </button>
          <div className="w-[1px] h-4 bg-[#383838] mx-1" />
          <button
            onClick={() => setTestcaseTab('topology')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition ${
              testcaseTab === 'topology'
                ? 'bg-[#333333] text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-[#2e2e2e]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cluster Topology</span>
          </button>
        </div>

        {testcaseTab === 'topology' && (
          <button
            onClick={simulateTraffic}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-[#333333] hover:bg-[#3d3d3d] text-zinc-300 transition"
          >
            <Radio className={`w-3 h-3 text-zinc-400 ${trafficPulsing ? 'animate-ping' : ''}`} />
            <span>Probe</span>
          </button>
        )}
      </div>

      {/* Case 1: Resource Quotas */}
      {testcaseTab === 'case1' && (
        <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 font-mono text-xs">
          <div className="text-zinc-400 font-sans text-xs">
            <strong>Target Assertion:</strong> Container cgroup memory limit allocation
          </div>

          <div className="rounded-md bg-[#242424] border border-[#383838] p-3 space-y-1.5">
            <div className="text-zinc-400"># Input configuration parameter</div>
            <div className="text-[#ff375f]">resources.limits.memory: "128Mi"  # Causes exit code 137 OOMKilled</div>
            <div className="pt-2 border-t border-[#333333] text-zinc-400"># Required specification</div>
            <div className="text-[#00b8a3]">resources.limits.memory: &gt;= "512Mi"</div>
            <div className="text-[#00b8a3]">resources.requests.memory: &gt;= "256Mi"</div>
          </div>
        </div>
      )}

      {/* Case 2: Health Probes */}
      {testcaseTab === 'case2' && (
        <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 font-mono text-xs">
          <div className="text-zinc-400 font-sans text-xs">
            <strong>Target Assertion:</strong> Kubelet liveness & readiness probe endpoint alignment
          </div>

          <div className="rounded-md bg-[#242424] border border-[#383838] p-3 space-y-1.5">
            <div className="text-zinc-400"># Input probe path</div>
            <div className="text-[#ff375f]">livenessProbe.httpGet.path: "/health"  # Returns HTTP 404</div>
            <div className="pt-2 border-t border-[#333333] text-zinc-400"># Required specification</div>
            <div className="text-[#00b8a3]">livenessProbe.httpGet.path: "/healthz" # Endpoint returning 200 OK</div>
          </div>
        </div>
      )}

      {/* Case 3: Ingress & Service Routing */}
      {testcaseTab === 'case3' && (
        <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 font-mono text-xs">
          <div className="text-zinc-400 font-sans text-xs">
            <strong>Target Assertion:</strong> Service targetPort and ConfigMap environmental binding
          </div>

          <div className="rounded-md bg-[#242424] border border-[#383838] p-3 space-y-1.5">
            <div className="text-zinc-400"># Service Port & ConfigMap Target</div>
            <div className="text-zinc-300">Service: {currentChallenge.serviceName}</div>
            <div className="text-zinc-300">targetPort: 8080 &rarr; containerPort: 8080</div>
            <div className="text-[#00b8a3]">ConfigMap key: DB_HOST matches database connection string</div>
          </div>
        </div>
      )}

      {/* Topology Tab */}
      {testcaseTab === 'topology' && (
        <div className="flex-1 flex flex-col overflow-hidden">
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

          {/* Pods List */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
              <span className="font-semibold text-zinc-300">Pods ({topology.pods.length})</span>
              <span className="font-mono text-[11px]">{topology.ingressUrl}</span>
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
      )}
    </div>
  );
};
