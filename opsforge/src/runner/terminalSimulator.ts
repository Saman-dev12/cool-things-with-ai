import { OpsChallenge, ClusterTopology } from '../types/ops';

export interface CommandContext {
  challenge: OpsChallenge;
  files: Record<string, string>;
  topology: ClusterTopology;
  setTopology?: (top: ClusterTopology) => void;
  runTests?: () => void;
}

export function executeCommand(cmdStr: string, ctx: CommandContext): string[] {
  const trimmed = cmdStr.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(/\s+/);
  const root = parts[0].toLowerCase();

  switch (root) {
    case 'help':
      return [
        'OpsForge SRE Virtual Shell - Production Node [prod-node-04]',
        'Available commands:',
        '  kubectl get pods | describe pod <id> | logs <id> | apply -f <file>',
        '  docker build . | docker images | docker history',
        '  terraform plan | terraform validate | terraform apply',
        '  df -h | lsof +L1 | top | ps aux | kill -9 <pid>',
        '  cat <file> | ls | grep <term> <file> | curl <endpoint>',
        '  test / verify        - Trigger automated grader assertions',
        '  clear                - Clear terminal output',
        '  help                 - Display this reference manual'
      ];

    case 'ls':
      return Object.keys(ctx.files).map(f => `-rw-r--r-- 1 sre devops ${f}`);

    case 'cat': {
      if (parts.length < 2) return ['Error: cat requires a filename. e.g. cat deployment.yaml'];
      const target = parts[1];
      const foundKey = Object.keys(ctx.files).find(k => k.toLowerCase() === target.toLowerCase());
      if (foundKey) {
        return ctx.files[foundKey].split('\n');
      }
      return [`cat: ${target}: No such file or directory`];
    }

    case 'grep': {
      if (parts.length < 3) return ['Usage: grep <pattern> <filename>'];
      const pattern = parts[1];
      const target = parts[2];
      const fileKey = Object.keys(ctx.files).find(k => k.toLowerCase() === target.toLowerCase());
      if (!fileKey) return [`grep: ${target}: No such file`];
      const lines = ctx.files[fileKey].split('\n');
      const matched = lines.filter(l => l.toLowerCase().includes(pattern.toLowerCase()));
      return matched.length > 0 ? matched : [`(no match found for '${pattern}')`];
    }

    case 'curl': {
      const url = parts[1] || ctx.topology.ingressUrl || 'http://localhost:8080/healthz';
      if (ctx.challenge.track === 'kubernetes') {
        const hasCrash = ctx.topology.pods.some(p => p.status === 'CrashLoopBackOff' || p.status === 'OOMKilled');
        if (hasCrash) {
          return [
            `curl: (7) Failed to connect to ${url} port 80: Connection refused (Service endpoints unreachable)`,
            'HTTP/1.1 503 Service Unavailable',
            'X-Kube-Proxy: No endpoints available for service ' + ctx.topology.service.name
          ];
        }
        return [
          `HTTP/1.1 200 OK`,
          `Content-Type: application/json`,
          `X-Upstream-Latency: ${ctx.topology.latencyMs}ms`,
          `{"status": "healthy", "service": "${ctx.challenge.serviceName}", "version": "v1.4.2"}`
        ];
      }
      return [`HTTP/1.1 200 OK - Connected to ${url}`];
    }

    // KUBERNETES COMMANDS
    case 'kubectl': {
      const sub = parts[1];
      if (sub === 'get' && parts[2] === 'pods') {
        const lines = ['NAME                                     READY   STATUS             RESTARTS   AGE'];
        ctx.topology.pods.forEach(p => {
          const statusPad = p.status.padEnd(18, ' ');
          lines.push(`${p.name.padEnd(40, ' ')} ${p.ready.padEnd(7, ' ')} ${statusPad} ${String(p.restarts).padEnd(10, ' ')} 3m14s`);
        });
        return lines;
      }

      if (sub === 'describe' && (parts[2] === 'pod' || parts[2] === 'pods')) {
        const pod = ctx.topology.pods[0] || { name: 'unknown-pod', status: 'Unknown' };
        return [
          `Name:         ${pod.name}`,
          `Namespace:    ${ctx.topology.namespace}`,
          `Priority:     0`,
          `Service Account: default`,
          `Node:         prod-worker-az1a / 10.0.12.4`,
          `Status:       ${pod.status}`,
          `IP:           10.244.1.88`,
          `Containers:`,
          `  app:`,
          `    Image:         registry.opsforge.internal/svc:latest`,
          `    Port:          8080/TCP`,
          `    State:         Waiting: ${pod.status}`,
          `    Last State:    Terminated (ExitCode: 137, OOMKilled: true)`,
          `    Restart Count: ${pod.restarts}`,
          `    Limits:        cpu=500m, memory=128Mi`,
          `    Requests:      cpu=200m, memory=64Mi`,
          `Events:`,
          `  Type     Reason     Age                 From               Message`,
          `  ----     ------     ----                ----               -------`,
          `  Warning  BackOff    14s (x12 over 3m)   kubelet            Back-off restarting failed container`,
          `  Warning  Unhealthy  42s                 kubelet            Liveness probe failed: HTTP probe failed with statuscode: 404`,
          `  Warning  OOMKilled  1m                  kernel             Memory cgroup out of memory: Killed process 8421`
        ];
      }

      if (sub === 'logs') {
        const podName = parts[2] || ctx.topology.pods[0]?.name || 'pod';
        return [
          `[2026-09-07T22:50:01Z] [INFO] Starting service ${ctx.challenge.serviceName}...`,
          `[2026-09-07T22:50:02Z] [INFO] Initializing memory buffer pool...`,
          `[2026-09-07T22:50:04Z] [FATAL] java.lang.OutOfMemoryError: Java heap space exceeded cgroup limit 128MB`,
          `[2026-09-07T22:50:04Z] [FATAL] Process received SIGKILL from kernel oom-killer (exit code 137)`,
          `Container terminated.`
        ];
      }

      if (sub === 'apply' && parts[2] === '-f') {
        const file = parts[3];
        return [
          `deployment.apps/${ctx.challenge.serviceName} configured`,
          `configmap/${ctx.challenge.serviceName}-env configured`,
          `[INFO] Reconciling pod replica set... Run 'test' or click 'Run Diagnostics' to verify health.`
        ];
      }

      return [`kubectl: unknown command '${parts.slice(1).join(' ')}'. Try 'kubectl get pods' or 'help'`];
    }

    // DOCKER COMMANDS
    case 'docker': {
      const sub = parts[1];
      if (sub === 'build') {
        const dockerfile = ctx.files['Dockerfile'] || '';
        const isMultiStage = dockerfile.includes('AS builder') || dockerfile.includes('as builder');
        const hasAlpine = dockerfile.toLowerCase().includes('alpine') || dockerfile.toLowerCase().includes('distroless');
        const estSize = isMultiStage && hasAlpine ? '41.8 MB' : '1.42 GB';

        return [
          `[+] Building 4.2s (14/14) FINISHED`,
          ` => [internal] load build definition from Dockerfile`,
          ` => => transferring dockerfile: 480B`,
          ` => [internal] load .dockerignore`,
          ` => [stage-1 1/4] FROM node:alpine@sha256:d898...`,
          ` => CACHED [stage-1 2/4] COPY package*.json ./`,
          ` => [stage-1 3/4] RUN npm ci --omit=dev`,
          ` => [stage-1 4/4] COPY --from=builder /app/dist ./dist`,
          ` => exporting to image`,
          ` => => naming to docker.io/library/opsforge-app:latest`,
          `Successfully tagged opsforge-app:latest`,
          `IMAGE SIZE: ${estSize} ${isMultiStage ? '✅ (OPTIMIZED)' : '⚠️ (BLOATED MONOLITH)'}`
        ];
      }

      if (sub === 'images') {
        return [
          'REPOSITORY          TAG       IMAGE ID       CREATED          SIZE',
          'opsforge-app        latest    9f8a27bc1d2e   42 seconds ago   41.8MB',
          'node                18        b3c9429188a1   2 weeks ago      1.12GB',
          'python              3.11      e5c701d4a029   3 weeks ago      1.42GB'
        ];
      }

      return [`docker: '${parts.slice(1).join(' ')}' completed. Run 'docker build .' to analyze layers.`];
    }

    // TERRAFORM COMMANDS
    case 'terraform': {
      const sub = parts[1];
      if (sub === 'plan' || sub === 'validate') {
        const tf = ctx.files['main.tf'] || '';
        const hasCyclic = tf.includes('aws_security_group') && tf.includes('aws_subnet') && tf.includes('depends_on = [aws_security_group');
        if (hasCyclic) {
          return [
            `╷ Error: Cycle in dependency graph:`,
            `│   aws_security_group.sg_app -> aws_subnet.app_private -> aws_security_group.sg_app`,
            `│`,
            `│ Remove circular self-reference or break security group rule into aws_security_group_rule resource.`,
            `╵`
          ];
        }
        return [
          `Success! The configuration is valid.`,
          `Plan: 6 to add, 0 to change, 0 to destroy.`,
          `Changes to Outputs:`,
          `  + vpc_id          = "vpc-089fa2bc81"`,
          `  + public_subnets  = ["subnet-01", "subnet-02"]`,
          `  + private_subnets = ["subnet-03", "subnet-04"]`
        ];
      }

      return [`Terraform initialized in /infra/prod. Use 'terraform plan' to inspect resource diff.`];
    }

    // LINUX / SRE COMMANDS
    case 'df': {
      return [
        'Filesystem      Size  Used Avail Use% Mounted on',
        '/dev/nvme0n1p1   50G   48G  1.8G  96% /var/log',
        '/dev/nvme0n1p2  100G   24G   76G  24% /',
        'tmpfs            16G  1.2G   15G   8% /dev/shm'
      ];
    }

    case 'lsof': {
      return [
        'COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF   NODE NAME',
        'app_srv  4128  sre    3w   REG  259,1  46291824 991823 /var/log/app/trace.log (deleted)',
        'nginx    1092 root    4u  IPv4  19283      0t0    TCP *:80 (LISTEN)',
        'dockerd   841 root    7u  unix  18274      0t0        /var/run/docker.sock'
      ];
    }

    case 'kill': {
      const pid = parts[2] || parts[1];
      if (pid === '4128' || pid === '-9 4128') {
        return [
          `[Process 4128 (app_srv) terminated]`,
          `File descriptor 3 released. 44.2 GB space freed on /var/log partition.`
        ];
      }
      return [`Process ${pid} killed.`];
    }

    case 'top':
    case 'ps': {
      return [
        'PID  USER     PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND',
        '4128 sre      20   0 1482012 842104  32812 S  98.4  74.2  42:19.82 app_srv',
        '1092 root     20   0   48212   9182   3120 S   1.2   0.8   0:14.21 nginx',
        ' 841 root     20   0  782190  84120  18204 S   2.1   4.1   1:08.40 dockerd'
      ];
    }

    case 'test':
    case 'verify':
      if (ctx.runTests) {
        ctx.runTests();
        return ['Initiating automated diagnostic test runner... Check Grader Panel below.'];
      }
      return ['Running test verification...'];

    default:
      return [
        `bash: ${root}: command not found. Type 'help' for available DevOps tools.`
      ];
  }
}
