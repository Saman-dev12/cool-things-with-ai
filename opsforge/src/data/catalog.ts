import { OpsChallenge, OpsTrack } from '../types/ops';
import { k8sCrashLoopChallenge } from './challenges/k8sCrashLoop';
import { dockerOptimizeChallenge } from './challenges/dockerOptimize';
import { ghostDiskLeakChallenge } from './challenges/ghostDiskLeak';
import { terraformVpcChallenge } from './challenges/terraformVpc';
import { cicdMatrixChallenge } from './challenges/cicdMatrix';
import { promqlAlertChallenge } from './challenges/promqlAlert';

export const OPS_CHALLENGES: OpsChallenge[] = [
  k8sCrashLoopChallenge,
  dockerOptimizeChallenge,
  ghostDiskLeakChallenge,
  terraformVpcChallenge,
  cicdMatrixChallenge,
  promqlAlertChallenge
];

export const TRACK_INFO: Record<OpsTrack, { label: string; icon: string; color: string; desc: string }> = {
  kubernetes: {
    label: 'Kubernetes',
    icon: '☸️',
    color: 'from-blue-500 to-indigo-600',
    desc: 'Pod lifecycle, CrashLoopBackOff, probes, services, and HPA'
  },
  docker: {
    label: 'Containers',
    icon: '🐳',
    color: 'from-cyan-500 to-blue-600',
    desc: 'Multi-stage builds, layer caching, image size & non-root security'
  },
  'linux-sre': {
    label: 'Linux SRE',
    icon: '🐧',
    color: 'from-amber-500 to-red-600',
    desc: 'Kernel namespaces, deleted open descriptors, inodes, and signals'
  },
  terraform: {
    label: 'Terraform IaC',
    icon: '🏗️',
    color: 'from-purple-500 to-pink-600',
    desc: 'HCL dependency cycles, state reconciliation, VPCs, and CIDRs'
  },
  cicd: {
    label: 'CI/CD & Actions',
    icon: '⚡',
    color: 'from-emerald-500 to-teal-600',
    desc: 'GitHub Actions workflows, build matrices, and secret leaks'
  },
  observability: {
    label: 'Observability',
    icon: '📊',
    color: 'from-orange-500 to-rose-600',
    desc: 'Prometheus PromQL, P99 tail latency, SLOs, and alerting rules'
  }
};
