import { OpsChallenge } from '../../types/ops';

export const dockerOptimizeChallenge: OpsChallenge = {
  id: 'docker-optimize-security',
  title: 'Shrink 1.4GB Container to 45MB & Enforce Security',
  track: 'docker',
  severity: 'SEV-2',
  difficulty: 'Intermediate',
  serviceName: 'analytics-worker',
  estimatedTimeMin: 12,
  tags: ['Docker', 'Multi-Stage', 'Security', 'Caching', 'Alpine'],
  summary:
    'The analytics-worker container image is currently 1.42 GB, leading to 9-minute deploy times and registry bandwidth throttling. Vulnerability scanning (Trivy) also flagged 86 HIGH/CRITICAL CVEs because the image runs as root on an unpinned Debian base.',
  symptoms: [
    'CI/CD image push step takes 8m 42s, slowing rollback velocity during outages.',
    'Docker image scan alerts: Container running as root (UID 0) with gcc, build-essential, and curl in final runtime.',
    'Node cache invalidation: any code change triggers full npm install from scratch.'
  ],
  reproductionSteps: [
    'Run `docker build .` to inspect layer execution and image size.',
    'Run `docker images` to see current bloated 1.42GB footprint.',
    'Examine `Dockerfile` and `.dockerignore`.'
  ],
  acceptanceRules: [
    {
      id: 'multi-stage',
      description: 'Implement a multi-stage build: use a build stage for compiling assets and a minimal alpine/slim/distroless stage for the final runtime.',
      hint: 'Define `FROM node:18 AS builder` and `FROM node:18-alpine AS runner`.'
    },
    {
      id: 'layer-caching',
      description: 'Optimize layer caching: copy `package*.json` and run `npm ci` before copying the rest of the application source code.',
      hint: 'Separate `COPY package*.json ./` from `COPY . .`.'
    },
    {
      id: 'non-root',
      description: 'Security: ensure the final container runs as a non-root user (e.g. `USER node` or `USER appuser`).',
      hint: 'Add `USER node` before the `CMD` instruction.'
    },
    {
      id: 'production-deps',
      description: 'Prune devDependencies: only copy or install production dependencies in the final runtime layer.',
      hint: 'Use `npm ci --omit=dev` or copy compiled files from the builder stage.'
    }
  ],
  starterFiles: [
    {
      name: 'Dockerfile',
      language: 'dockerfile',
      content: `# SLOW & INSECURE PRODUCTION DOCKERFILE (1.42 GB)
FROM node:18

# Working directory
WORKDIR /app

# BUG: Copying everything here busts cache every time any code changes
COPY . .

# BUG: Installs devDependencies (typescript, jest, eslint) into production image
RUN npm install

# Build typescript assets
RUN npm run build

# Expose service port
EXPOSE 3000

# BUG: Runs as ROOT user (UID 0)
CMD ["node", "dist/index.js"]
`
    },
    {
      name: '.dockerignore',
      language: 'bash',
      content: `# Missing critical exclusions!
# .git
# node_modules
# .env
dist
`
    }
  ],
  initialTopology: {
    clusterName: 'registry-ci-cluster',
    namespace: 'build-pipeline',
    ingressUrl: 'https://registry.opsforge.internal/analytics-worker',
    cpuTotal: 92,
    memTotal: 84,
    errorRatePercent: 12.5,
    latencyMs: 820,
    service: {
      name: 'analytics-worker-svc',
      type: 'ClusterIP',
      port: 3000,
      targetPort: 3000,
      healthy: false
    },
    pods: [
      {
        id: 'pod-builder',
        name: 'kaniko-image-builder-v1',
        status: 'Pending',
        restarts: 0,
        cpuUsage: '950m',
        memUsage: '1.2Gi',
        ready: '0/1'
      }
    ]
  },
  healthyTopology: {
    clusterName: 'registry-ci-cluster',
    namespace: 'build-pipeline',
    ingressUrl: 'https://registry.opsforge.internal/analytics-worker',
    cpuTotal: 22,
    memTotal: 28,
    errorRatePercent: 0,
    latencyMs: 25,
    service: {
      name: 'analytics-worker-svc',
      type: 'ClusterIP',
      port: 3000,
      targetPort: 3000,
      healthy: true
    },
    pods: [
      {
        id: 'pod-builder',
        name: 'kaniko-image-builder-v1',
        status: 'Running',
        restarts: 0,
        cpuUsage: '120m',
        memUsage: '180Mi',
        ready: '1/1'
      }
    ]
  },
  testAssertions: [
    {
      id: 'check-multi-stage',
      name: 'Multi-Stage Build Pattern',
      description: 'Verifies the Dockerfile has at least two stages (builder and minimal runtime runner).',
      verify: (files) => {
        const dockerfile = files['Dockerfile'] || '';
        const fromMatches = dockerfile.match(/FROM\s+/gi);
        const hasBuilder = /AS\s+builder/i.test(dockerfile);
        const passed = Boolean(fromMatches && fromMatches.length >= 2 && hasBuilder);
        return {
          passed,
          message: passed
            ? 'Multi-stage build correctly implemented with separate builder stage.'
            : 'Dockerfile is single-stage. Use `FROM node:18 AS builder` and a second `FROM ... AS runner` stage.',
          diff: { expected: 'FROM ... AS builder ... FROM ... AS runner', actual: `Found ${fromMatches?.length || 0} FROM statements` }
        };
      }
    },
    {
      id: 'check-minimal-base',
      name: 'Alpine or Distroless Runtime Base',
      description: 'The final stage must use a hardened minimal base image to reduce attack surface and file size.',
      verify: (files) => {
        const dockerfile = files['Dockerfile'] || '';
        const isAlpineOrSlim = /node:[^\s]*alpine|distroless|slim/i.test(dockerfile);
        return {
          passed: isAlpineOrSlim,
          message: isAlpineOrSlim
            ? 'Runtime base image uses lightweight distribution (alpine/distroless/slim).'
            : 'Runtime image does not use alpine, distroless, or slim variant.',
          diff: { expected: 'node:18-alpine or node:18-slim', actual: dockerfile.split('\n')[0] }
        };
      }
    },
    {
      id: 'check-non-root-user',
      name: 'Non-Root Security Directive (USER)',
      description: 'Ensures container does not execute as root (UID 0), preventing container breakout risks.',
      verify: (files) => {
        const dockerfile = files['Dockerfile'] || '';
        const hasUser = /USER\s+(node|[a-zA-Z0-9_\-]+)/i.test(dockerfile);
        return {
          passed: hasUser,
          message: hasUser
            ? 'Non-root user directive configured before runtime execution.'
            : 'Missing USER directive. Container will run as root.',
          diff: { expected: 'USER node', actual: 'No USER instruction detected' }
        };
      }
    },
    {
      id: 'check-layer-cache',
      name: 'Optimized Layer Caching Order',
      description: 'package*.json must be copied and installed before copying application source code.',
      verify: (files) => {
        const dockerfile = files['Dockerfile'] || '';
        const copyPkgIndex = dockerfile.search(/COPY\s+package/i);
        const copyAllIndex = dockerfile.search(/COPY\s+(\.\s+\.|\.\/|\-\-from)/i);
        const passed = copyPkgIndex !== -1 && (copyAllIndex === -1 || copyPkgIndex < copyAllIndex);
        return {
          passed,
          message: passed
            ? 'Package manifests copied prior to source code for optimal build caching.'
            : 'Copy order invalid: source files are copied before or without dedicated package.json layer caching.',
          diff: { expected: 'COPY package*.json ./ before COPY . .', actual: 'Check copy instruction positions' }
        };
      }
    }
  ],
  postMortem: {
    rootCause:
      'The initial Dockerfile used a full Debian development image, included all build tools (gcc, make, python) in production, copied source before package.json, and ran as root user.',
    impact:
      'Image push time was 8m 42s. Storage bills grew by \$3,400/month across CI runners and ECR repositories.',
    detection:
      'CI Pipeline latency SLA breach and automated Trivy container scan alert.',
    solutionBreakdown: [
      'Split build into `builder` stage (with full dev dependencies and typescript compilation) and `runner` stage.',
      'Adopted `node:18-alpine`, stripping out build toolchains and package managers.',
      'Added `USER node` to enforce principle of least privilege.',
      'Updated `.dockerignore` to exclude `node_modules` and local artifacts from build context.'
    ],
    referenceFiles: [
      {
        name: 'Dockerfile',
        language: 'dockerfile',
        content: `# Stage 1: Build & compile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

# Stage 2: Minimal hardened runtime
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Security: run as non-root user
USER node

EXPOSE 3000
CMD ["node", "dist/index.js"]
`
      }
    ],
    preventativeMeasures: [
      'Integrate Hadolint in git pre-commit hooks to catch root users and unpinned packages.',
      'Block images > 150MB from being promoted to staging registry.'
    ]
  },
  initialTerminalLogs: [
    'docker build -t analytics-worker:latest .',
    '[+] Building 84.1s (7/7) FINISHED',
    ' => transferring context: 412.8MB',
    ' => [3/5] RUN npm install ... 52.4s',
    ' => naming to docker.io/library/analytics-worker:latest',
    'Successfully tagged analytics-worker:latest',
    '',
    'docker images analytics-worker:latest',
    'REPOSITORY          TAG       IMAGE ID       CREATED         SIZE',
    'analytics-worker    latest    b8f2a149c0d1   1 minute ago    1.42GB'
  ]
};
