export type OpsTrack = 
  | 'kubernetes' 
  | 'docker' 
  | 'cicd' 
  | 'terraform' 
  | 'linux-sre' 
  | 'observability';

export type Severity = 'SEV-1' | 'SEV-2' | 'SEV-3';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Staff SRE';

export interface OpsFile {
  name: string;
  language: 'yaml' | 'dockerfile' | 'hcl' | 'bash' | 'json';
  content: string;
  readOnly?: boolean;
}

export interface AcceptanceRule {
  id: string;
  description: string;
  hint?: string;
}

export type PodStatus = 'Running' | 'CrashLoopBackOff' | 'OOMKilled' | 'Pending' | 'Terminating' | 'Error';

export interface ClusterPod {
  id: string;
  name: string;
  status: PodStatus;
  restarts: number;
  cpuUsage: string;
  memUsage: string;
  ready: string;
}

export interface ClusterService {
  name: string;
  type: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
  port: number;
  targetPort: number;
  healthy: boolean;
}

export interface ClusterTopology {
  clusterName: string;
  namespace: string;
  ingressUrl: string;
  pods: ClusterPod[];
  service: ClusterService;
  cpuTotal: number;
  memTotal: number;
  errorRatePercent: number;
  latencyMs: number;
}

export interface TestAssertion {
  id: string;
  name: string;
  description: string;
  verify: (files: Record<string, string>) => { passed: boolean; message: string; diff?: { expected: string; actual: string } };
}

export interface TestResult {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  message: string;
  diff?: { expected: string; actual: string };
  durationMs: number;
}

export interface GradeSummary {
  total: number;
  passed: number;
  failed: number;
  status: 'idle' | 'running' | 'passed' | 'failed';
  results: TestResult[];
  timestamp: number;
}

export interface PostMortem {
  rootCause: string;
  impact: string;
  detection: string;
  solutionBreakdown: string[];
  referenceFiles: OpsFile[];
  preventativeMeasures: string[];
}

export interface OpsChallenge {
  id: string;
  title: string;
  track: OpsTrack;
  severity: Severity;
  difficulty: Difficulty;
  serviceName: string;
  estimatedTimeMin: number;
  tags: string[];
  summary: string;
  symptoms: string[];
  reproductionSteps: string[];
  acceptanceRules: AcceptanceRule[];
  starterFiles: OpsFile[];
  initialTopology: ClusterTopology;
  healthyTopology: ClusterTopology;
  testAssertions: TestAssertion[];
  postMortem: PostMortem;
  initialTerminalLogs?: string[];
}
