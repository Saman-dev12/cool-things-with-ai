import { OpsChallenge } from '../../types/ops';

export const ghostDiskLeakChallenge: OpsChallenge = {
  id: 'linux-ghost-disk-leak',
  title: 'The Midnight 100% Disk Full Mystery (Unlinked File Descriptors)',
  track: 'linux-sre',
  severity: 'SEV-1',
  difficulty: 'Staff SRE',
  serviceName: 'log-aggregator-node-04',
  estimatedTimeMin: 20,
  tags: ['Linux', 'SRE', 'DiskFull', 'lsof', 'Inodes', 'Kernel'],
  summary:
    'Alert SEV-1: `/var/log` partition reached 96% utilization. An on-call engineer deleted the file with `rm /var/log/app/trace.log`, but `df -h` still reports 96% full. The database is rejecting transactions because writes are failing with ENOSPC (No space left on device).',
  symptoms: [
    '`df -h /var/log` reports 48GB used out of 50GB (96% full).',
    '`du -sh /var/log/*` only reports 1.9GB of actual files on disk.',
    'System logs show: `java.io.IOException: No space left on device`.'
  ],
  reproductionSteps: [
    'Run `df -h` to verify mounted partition space.',
    'Run `lsof +L1` to search for open deleted file handles held by running processes.',
    'Inspect `remediate.sh` to construct the recovery script.'
  ],
  acceptanceRules: [
    {
      id: 'find-deleted-fds',
      description: 'Use `lsof +L1` or `/proc/*/fd` to query unlinked files with positive reference counts held by active processes.',
      hint: 'Deleted files held open by processes appear in `lsof +L1` as `(deleted)`.'
    },
    {
      id: 'target-pid',
      description: 'Identify and target PID 4128 (`app_srv`) holding the deleted file descriptor.',
      hint: 'The holding process is `app_srv` with PID `4128`.'
    },
    {
      id: 'release-blocks',
      description: 'Release disk blocks: either truncate the open handle via `/proc/4128/fd/3` or terminate/signal PID 4128.',
      hint: 'In Linux, running `> /proc/4128/fd/3` or `kill 4128` immediately frees the allocated blocks.'
    },
    {
      id: 'verify-space',
      description: 'Include a post-check verification asserting free disk space has returned to normal levels.',
      hint: 'Run `df -h /var/log` to confirm available storage.'
    }
  ],
  starterFiles: [
    {
      name: 'remediate.sh',
      language: 'bash',
      content: `#!/usr/bin/env bash
# ==============================================================================
# SRE INCIDENT REMEDIATION: Midnight Ghost Disk Leak
# TASK: Reclaim ~45GB of phantom disk space held by unlinked open file handles.
# ==============================================================================
set -euo pipefail

echo "=== [STEP 1] Checking current disk usage ==="
df -h /var/log

echo "=== [STEP 2] Finding unlinked open file descriptors ==="
# TODO: Find open deleted files holding disk space
# Hint: inspect lsof output or /proc filesystem


echo "=== [STEP 3] Reclaiming disk blocks ==="
# TODO: Target PID 4128 (app_srv) or truncate open file descriptor /proc/4128/fd/3
# Hint: kill -15 4128 OR : > /proc/4128/fd/3


echo "=== [STEP 4] Post-check verification ==="
df -h /var/log
echo "Remediation complete."
`
    },
    {
      name: 'sys_diagnostics.txt',
      language: 'bash',
      content: `# Output of: lsof +L1
COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF   NODE NAME
app_srv  4128  sre    3w   REG  259,1  46291824 991823 /var/log/app/trace.log (deleted)

# Note: The file was removed from the directory entry (dentry),
# but the kernel inode cannot be freed until all file descriptors close.
`
    }
  ],
  initialTopology: {
    clusterName: 'baremetal-fleet-us-east',
    namespace: 'system',
    ingressUrl: 'http://prod-node-04.opsforge.internal:9100/metrics',
    cpuTotal: 98,
    memTotal: 89,
    errorRatePercent: 99.4,
    latencyMs: 3800,
    service: {
      name: 'node-exporter',
      type: 'NodePort',
      port: 9100,
      targetPort: 9100,
      healthy: false
    },
    pods: [
      {
        id: 'pod-app-srv',
        name: 'host-process:app_srv[PID 4128]',
        status: 'Error',
        restarts: 0,
        cpuUsage: '98%',
        memUsage: '46.2 GB Disk Locked',
        ready: '0/1'
      }
    ]
  },
  healthyTopology: {
    clusterName: 'baremetal-fleet-us-east',
    namespace: 'system',
    ingressUrl: 'http://prod-node-04.opsforge.internal:9100/metrics',
    cpuTotal: 14,
    memTotal: 31,
    errorRatePercent: 0,
    latencyMs: 12,
    service: {
      name: 'node-exporter',
      type: 'NodePort',
      port: 9100,
      targetPort: 9100,
      healthy: true
    },
    pods: [
      {
        id: 'pod-app-srv',
        name: 'host-process:app_srv[PID 4128]',
        status: 'Running',
        restarts: 1,
        cpuUsage: '12%',
        memUsage: '1.8 GB Clean',
        ready: '1/1'
      }
    ]
  },
  testAssertions: [
    {
      id: 'check-lsof-cmd',
      name: 'Inspects Unlinked Files via lsof or /proc',
      description: 'Checks that remediation script queries `lsof` or `/proc` to detect deleted open files.',
      verify: (files) => {
        const script = files['remediate.sh'] || '';
        const hasLsof = /lsof/i.test(script) || /\/proc\/\*\/fd/i.test(script);
        return {
          passed: hasLsof,
          message: hasLsof
            ? 'Correctly queries open file handles using lsof or /proc.'
            : 'Missing lsof command or /proc inspection to identify deleted handles.',
          diff: { expected: 'lsof +L1 (or lsof | grep deleted)', actual: 'No lsof command found' }
        };
      }
    },
    {
      id: 'check-pid-targeting',
      name: 'Targets Offending Process (PID 4128 or app_srv)',
      description: 'Verifies the script specifically identifies PID 4128 or the process name `app_srv`.',
      verify: (files) => {
        const script = files['remediate.sh'] || '';
        const targetsPid = /4128|app_srv/i.test(script);
        return {
          passed: targetsPid,
          message: targetsPid
            ? 'Correctly targets rogue process PID 4128 (app_srv).'
            : 'Did not reference PID 4128 or app_srv in the remediation script.',
          diff: { expected: 'Reference to 4128 or app_srv', actual: 'Missing target process' }
        };
      }
    },
    {
      id: 'check-block-release',
      name: 'Releases File Descriptors (Kill or Truncate)',
      description: 'Verifies the script executes `kill` on the PID or truncates the file descriptor via `/proc/4128/fd/3`.',
      verify: (files) => {
        const script = files['remediate.sh'] || '';
        const hasKillOrTruncate = /kill\s+(-[0-9A-Z]+\s+)?4128|pkill\s+app_srv|>\s*\/proc\/4128\/fd\/3|truncate/i.test(script);
        return {
          passed: hasKillOrTruncate,
          message: hasKillOrTruncate
            ? 'Properly issues kill signal or file descriptor truncation.'
            : 'Did not issue `kill 4128`, `pkill app_srv`, or `> /proc/4128/fd/3`.',
          diff: { expected: 'kill -15 4128 OR : > /proc/4128/fd/3', actual: 'No action taken to free descriptor' }
        };
      }
    }
  ],
  postMortem: {
    rootCause:
      'In Linux, unlinking a file with `rm` deletes the directory entry (dentry), but the inode and data blocks remain allocated as long as any process holds an open file descriptor. `app_srv` held an open write descriptor (`3w`) to `/var/log/app/trace.log`, hoarding 46GB of disk space.',
    impact:
      'SEV-1 outage lasting 34 minutes. Application was unable to write WAL logs, resulting in transaction rollbacks.',
    detection:
      'Prometheus alert: `node_filesystem_avail_bytes / node_filesystem_size_bytes < 0.05`.',
    solutionBreakdown: [
      'Identified deleted open descriptors using `lsof +L1`.',
      'Truncated open file descriptor via `> /proc/4128/fd/3` to instantly free blocks without service crash.',
      'Configured `logrotate` with `copytruncate` directive to prevent future rogue unlinked file locks.'
    ],
    referenceFiles: [
      {
        name: 'remediate.sh',
        language: 'bash',
        content: `#!/usr/bin/env bash
set -euo pipefail

echo "=== [STEP 1] Checking current disk usage ==="
df -h /var/log

echo "=== [STEP 2] Finding unlinked open file descriptors ==="
lsof +L1 | grep deleted || true

echo "=== [STEP 3] Reclaiming disk blocks ==="
# Truncate directly via proc descriptor without dropping process
if [ -d "/proc/4128/fd" ]; then
  : > /proc/4128/fd/3
  echo "Truncated open descriptor /proc/4128/fd/3"
else
  kill -15 4128 || kill -9 4128
fi

echo "=== [STEP 4] Post-check verification ==="
df -h /var/log
echo "Remediation complete: 46GB freed."
`
      }
    ],
    preventativeMeasures: [
      'Update logrotate configuration with `copytruncate` or `postrotate /usr/bin/systemctl reload app_srv`.',
      'Set alert on `node_filesystem_files_free` and audit open unlinked descriptors weekly.'
    ]
  },
  initialTerminalLogs: [
    'df -h /var/log',
    'Filesystem      Size  Used Avail Use% Mounted on',
    '/dev/nvme0n1p1   50G   48G  1.8G  96% /var/log',
    '',
    'du -sh /var/log/*',
    '1.2G    /var/log/journal',
    '720M    /var/log/nginx',
    '4.0K    /var/log/app',
    '(du accounts for only 1.9GB - 46GB missing!)',
    '',
    'lsof +L1',
    'COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF   NODE NAME',
    'app_srv  4128  sre    3w   REG  259,1  46291824 991823 /var/log/app/trace.log (deleted)'
  ]
};
