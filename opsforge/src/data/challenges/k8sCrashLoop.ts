import { OpsChallenge } from '../../types/ops';

export const k8sCrashLoopChallenge: OpsChallenge = {
  id: 'k8s-crashloop-oom',
  title: 'CrashLoopBackOff & OOMKilled Payment Microservice',
  track: 'kubernetes',
  severity: 'SEV-1',
  difficulty: 'Intermediate',
  serviceName: 'payment-processor',
  estimatedTimeMin: 15,
  tags: ['Kubernetes', 'Troubleshooting', 'OOMKilled', 'Probes', 'ConfigMap'],
  summary:
    'The production payment-processor deployment is failing health checks. Pods are cycling through CrashLoopBackOff and getting OOMKilled with exit code 137. Upstream checkout requests are returning HTTP 503.',
  symptoms: [
    'kubectl get pods reports: 0/1 CrashLoopBackOff with 14 restarts.',
    'describe pod shows: ExitCode 137 (OOMKilled) and liveness probe failing with 404.',
    'Payment transactions are dropping; checkout service error rate is spiked at 84%.'
  ],
  reproductionSteps: [
    'Run `kubectl get pods` to inspect pod restart counter.',
    'Run `kubectl describe pod payment-processor` to view termination exit code and probe failures.',
    'Inspect `deployment.yaml` and `configmap.yaml` to identify resource limits and configuration mismatches.'
  ],
  acceptanceRules: [
    {
      id: 'mem-limits',
      description: 'Increase container memory limits to at least 512Mi (and request >= 256Mi) to prevent kernel OOM killer termination.',
      hint: 'Under `resources.limits.memory`, change 128Mi to at least 512Mi.'
    },
    {
      id: 'liveness-probe',
      description: 'Correct the liveness probe HTTP GET path to `/healthz` (was misconfigured as `/health`).',
      hint: 'The internal microservice exposes `/healthz` for Kubernetes probes.'
    },
    {
      id: 'initial-delay',
      description: 'Set `initialDelaySeconds` on livenessProbe to at least 10s to give JVM time to initialize.',
      hint: 'A delay of 0 or 1s kills the container before the web server begins listening.'
    },
    {
      id: 'configmap-key',
      description: 'Align ConfigMap key reference for `DATABASE_URL` with the actual key defined in `configmap.yaml`.',
      hint: 'Check if `deployment.yaml` refers to `DB_HOST_PROD` instead of `DATABASE_URL`.'
    }
  ],
  starterFiles: [
    {
      name: 'deployment.yaml',
      language: 'yaml',
      content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-processor
  namespace: production
  labels:
    app: payment-processor
    tier: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: payment-processor
  template:
    metadata:
      labels:
        app: payment-processor
    spec:
      containers:
      - name: payment-api
        image: registry.opsforge.internal/payments/api:v2.1.0
        ports:
        - containerPort: 8080
          name: http
        resources:
          requests:
            cpu: 100m
            memory: 64Mi
          limits:
            cpu: 500m
            memory: 128Mi  # BUG: JVM heap spikes to 320MB under load, causing ExitCode 137 OOMKilled
        livenessProbe:
          httpGet:
            path: /health  # BUG: API exposes /healthz; /health returns 404 Not Found
            port: 8080
          initialDelaySeconds: 1  # BUG: App takes ~8 seconds to start; probe kills it immediately
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
        env:
        - name: DATABASE_URL
          valueFrom:
            configMapKeyRef:
              name: payment-config
              key: DB_HOST_PROD  # BUG: configmap has key 'DATABASE_URL', not 'DB_HOST_PROD'
        - name: ENVIRONMENT
          value: "production"
`
    },
    {
      name: 'configmap.yaml',
      language: 'yaml',
      content: `apiVersion: v1
kind: ConfigMap
metadata:
  name: payment-config
  namespace: production
data:
  DATABASE_URL: "postgresql://pgpool.internal:5432/payments_prod?sslmode=require"
  MAX_POOL_SIZE: "20"
  TIMEOUT_MS: "3000"
`
    }
  ],
  initialTopology: {
    clusterName: 'opsforge-prod-k8s',
    namespace: 'production',
    ingressUrl: 'https://api.opsforge.io/v1/payments/healthz',
    cpuTotal: 88,
    memTotal: 96,
    errorRatePercent: 84.2,
    latencyMs: 1420,
    service: {
      name: 'payment-processor-svc',
      type: 'ClusterIP',
      port: 80,
      targetPort: 8080,
      healthy: false
    },
    pods: [
      {
        id: 'pod-1',
        name: 'payment-processor-78d9b4c-xk21',
        status: 'CrashLoopBackOff',
        restarts: 14,
        cpuUsage: '420m',
        memUsage: '128Mi / 128Mi',
        ready: '0/1'
      },
      {
        id: 'pod-2',
        name: 'payment-processor-78d9b4c-98ml',
        status: 'OOMKilled',
        restarts: 11,
        cpuUsage: '495m',
        memUsage: '128Mi / 128Mi',
        ready: '0/1'
      },
      {
        id: 'pod-3',
        name: 'payment-processor-78d9b4c-44pz',
        status: 'CrashLoopBackOff',
        restarts: 16,
        cpuUsage: '380m',
        memUsage: '128Mi / 128Mi',
        ready: '0/1'
      }
    ]
  },
  healthyTopology: {
    clusterName: 'opsforge-prod-k8s',
    namespace: 'production',
    ingressUrl: 'https://api.opsforge.io/v1/payments/healthz',
    cpuTotal: 28,
    memTotal: 42,
    errorRatePercent: 0.01,
    latencyMs: 18,
    service: {
      name: 'payment-processor-svc',
      type: 'ClusterIP',
      port: 80,
      targetPort: 8080,
      healthy: true
    },
    pods: [
      {
        id: 'pod-1',
        name: 'payment-processor-65b1f9e-a1b2',
        status: 'Running',
        restarts: 0,
        cpuUsage: '140m',
        memUsage: '310Mi / 512Mi',
        ready: '1/1'
      },
      {
        id: 'pod-2',
        name: 'payment-processor-65b1f9e-c3d4',
        status: 'Running',
        restarts: 0,
        cpuUsage: '155m',
        memUsage: '295Mi / 512Mi',
        ready: '1/1'
      },
      {
        id: 'pod-3',
        name: 'payment-processor-65b1f9e-e5f6',
        status: 'Running',
        restarts: 0,
        cpuUsage: '135m',
        memUsage: '320Mi / 512Mi',
        ready: '1/1'
      }
    ]
  },
  testAssertions: [
    {
      id: 'check-memory-limit',
      name: 'Container Memory Limits >= 512Mi',
      description: 'Prevents the Linux cgroup memory subsystem from triggering SIGKILL (ExitCode 137).',
      verify: (files) => {
        const deploy = files['deployment.yaml'] || '';
        const match = deploy.match(/memory:\s*(\d+)(Mi|Gi)/i);
        if (!match) {
          return { passed: false, message: 'Could not find memory limits in deployment.yaml.' };
        }
        const val = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        const inMi = unit === 'gi' ? val * 1024 : val;
        const passed = inMi >= 512;
        return {
          passed,
          message: passed
            ? `Memory limit safely set to ${inMi}Mi (>= 512Mi required).`
            : `Memory limit is ${inMi}Mi, which is below the 512Mi requirement to prevent OOM.`,
          diff: { expected: 'memory: 512Mi (or 1Gi)', actual: `memory: ${match[0].trim()}` }
        };
      }
    },
    {
      id: 'check-liveness-path',
      name: 'Liveness Probe Path is /healthz',
      description: 'Kubelet must receive HTTP 200 from the designated health endpoint.',
      verify: (files) => {
        const deploy = files['deployment.yaml'] || '';
        const hasHealthz = deploy.includes('path: /healthz');
        return {
          passed: hasHealthz,
          message: hasHealthz
            ? 'Liveness probe correctly targets /healthz.'
            : 'Liveness probe does not target /healthz (still points to /health).',
          diff: { expected: 'path: /healthz', actual: hasHealthz ? 'path: /healthz' : 'path: /health' }
        };
      }
    },
    {
      id: 'check-initial-delay',
      name: 'Liveness Probe Initial Delay >= 10s',
      description: 'Allows sufficient warmup window before probe evaluation begins.',
      verify: (files) => {
        const deploy = files['deployment.yaml'] || '';
        const match = deploy.match(/livenessProbe:[\s\S]*?initialDelaySeconds:\s*(\d+)/i);
        if (!match) {
          return { passed: false, message: 'Missing initialDelaySeconds on livenessProbe.' };
        }
        const delay = parseInt(match[1], 10);
        const passed = delay >= 10;
        return {
          passed,
          message: passed
            ? `initialDelaySeconds is configured to ${delay}s (>= 10s).`
            : `initialDelaySeconds is ${delay}s. Container will be terminated before JVM warm-up completes.`,
          diff: { expected: 'initialDelaySeconds: 10 (or higher)', actual: `initialDelaySeconds: ${delay}` }
        };
      }
    },
    {
      id: 'check-configmap-key',
      name: 'ConfigMap Key Reference Matches DATABASE_URL',
      description: 'Ensures the container receives database credentials instead of failing with nil reference.',
      verify: (files) => {
        const deploy = files['deployment.yaml'] || '';
        const hasCorrectKey = deploy.includes('key: DATABASE_URL');
        return {
          passed: hasCorrectKey,
          message: hasCorrectKey
            ? 'ConfigMap key reference matches DATABASE_URL.'
            : 'ConfigMap key reference is still set to DB_HOST_PROD.',
          diff: { expected: 'key: DATABASE_URL', actual: hasCorrectKey ? 'key: DATABASE_URL' : 'key: DB_HOST_PROD' }
        };
      }
    }
  ],
  postMortem: {
    rootCause:
      'Payment API was assigned an aggressive memory ceiling of 128Mi. During payment batch processing, heap allocations exceeded 280MB, resulting in kernel cgroup SIGKILL (ExitCode 137). Concurrently, an incorrect liveness probe path (/health returning 404) and insufficient initial delay prevented any recovered pods from entering Ready status.',
    impact:
      'SEV-1 incident lasting 18 minutes. Checkout success rate degraded to 16%, impacting ~$42,000 in transaction volume.',
    detection:
      'PagerDuty alert triggered by Prometheus alert rule: `sum(rate(http_requests_total{status=~"5.."}[2m])) / sum(rate(http_requests_total[2m])) > 0.05`.',
    solutionBreakdown: [
      'Increased container memory requests to 256Mi and limits to 512Mi to absorb traffic spikes.',
      'Updated livenessProbe httpGet path to `/healthz` and initialDelaySeconds to 15s.',
      'Fixed ConfigMap key reference to `DATABASE_URL` in `deployment.yaml`.'
    ],
    referenceFiles: [
      {
        name: 'deployment.yaml',
        language: 'yaml',
        content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-processor
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: payment-processor
  template:
    metadata:
      labels:
        app: payment-processor
    spec:
      containers:
      - name: payment-api
        image: registry.opsforge.internal/payments/api:v2.1.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: 200m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
        env:
        - name: DATABASE_URL
          valueFrom:
            configMapKeyRef:
              name: payment-config
              key: DATABASE_URL
`
      }
    ],
    preventativeMeasures: [
      'Enforce Vertical Pod Autoscaler (VPA) in recommendation mode across all production workloads.',
      'Add kube-linter to CI/CD pipeline to flag initialDelaySeconds < 10s on compiled runtimes.',
      'Implement synthetic canary endpoint health monitors before traffic cutover.'
    ]
  },
  initialTerminalLogs: [
    'kubectl get pods -n production',
    'NAME                                     READY   STATUS             RESTARTS   AGE',
    'payment-processor-78d9b4c-xk21           0/1     CrashLoopBackOff   14         3m14s',
    'payment-processor-78d9b4c-98ml           0/1     OOMKilled          11         3m14s',
    'payment-processor-78d9b4c-44pz           0/1     CrashLoopBackOff   16         3m14s',
    '',
    'kubectl describe pod payment-processor-78d9b4c-xk21 | grep -E "Exit Code|Liveness"',
    '    Last State:     Terminated (ExitCode: 137, Reason: OOMKilled)',
    '    Warning  Unhealthy  14s  kubelet  Liveness probe failed: HTTP probe failed with statuscode: 404'
  ]
};
