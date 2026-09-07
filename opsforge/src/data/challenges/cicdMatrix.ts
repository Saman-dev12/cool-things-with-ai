import { OpsChallenge } from '../../types/ops';

export const cicdMatrixChallenge: OpsChallenge = {
  id: 'cicd-broken-cache-matrix',
  title: 'Fix Flaky Multi-Arch CI/CD Pipeline & Dependency Cache',
  track: 'cicd',
  severity: 'SEV-2',
  difficulty: 'Beginner',
  serviceName: 'core-api-gateway',
  estimatedTimeMin: 10,
  tags: ['GitHub Actions', 'CI/CD', 'Caching', 'Secrets', 'Matrix'],
  summary:
    'The production GitHub Actions deployment workflow is failing. Dependency installation takes 7 minutes because actions/cache is broken, and a junior engineer accidentally printed plaintext API tokens in the workflow step arguments.',
  symptoms: [
    'GitHub Actions run fails with: `npm: command not found` or `Error: lockfile not found` because checkout step was omitted.',
    'Build duration increased from 45s to 7m10s due to lack of caching.',
    'Security audit warning: Secrets exposed in step command line.'
  ],
  reproductionSteps: [
    'Inspect `.github/workflows/deploy.yml`.',
    'Identify missing `actions/checkout` before install steps.',
    'Implement dependency caching with `actions/cache@v4`.'
  ],
  acceptanceRules: [
    {
      id: 'add-checkout',
      description: 'Ensure `actions/checkout@v4` runs as the very first step in the job.',
      hint: 'Add `- uses: actions/checkout@v4` under `steps:`.'
    },
    {
      id: 'cache-deps',
      description: 'Add `actions/cache@v4` caching `~/.npm` or `node_modules` with key based on `package-lock.json` hash.',
      hint: 'Use `key: ${{ runner.os }}-node-${{ hashFiles(\'**/package-lock.json\') }}`.'
    },
    {
      id: 'secure-secrets',
      description: 'Inject `PROD_DEPLOY_KEY` via `env:` context instead of inline command string argument.',
      hint: 'Define `env: DEPLOY_KEY: ${{ secrets.PROD_DEPLOY_KEY }}`.'
    }
  ],
  starterFiles: [
    {
      name: '.github/workflows/deploy.yml',
      language: 'yaml',
      content: `name: Production Deployment Pipeline

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # BUG 1: Missing actions/checkout! Runner workspace is empty!

      # BUG 2: No caching configured, downloads 400MB npm packages every run
      - name: Install dependencies
        run: npm ci

      - name: Run Test Suite
        run: npm test

      # BUG 3: Plaintext secret passed in CLI argument (visible in logs)
      - name: Deploy to Kubernetes Cluster
        run: ./scripts/deploy.sh --token "\${{ secrets.PROD_DEPLOY_KEY }}" --env prod
`
    }
  ],
  initialTopology: {
    clusterName: 'github-actions-runners',
    namespace: 'ci-system',
    ingressUrl: 'https://actions.github.com/repos/opsforge/core-api',
    cpuTotal: 95,
    memTotal: 88,
    errorRatePercent: 100,
    latencyMs: 7100,
    service: {
      name: 'ci-pipeline-runner',
      type: 'ClusterIP',
      port: 443,
      targetPort: 443,
      healthy: false
    },
    pods: [
      {
        id: 'gha-runner',
        name: 'runner-ubuntu-latest-4k',
        status: 'Error',
        restarts: 0,
        cpuUsage: '95%',
        memUsage: 'Cache Miss',
        ready: '0/1'
      }
    ]
  },
  healthyTopology: {
    clusterName: 'github-actions-runners',
    namespace: 'ci-system',
    ingressUrl: 'https://actions.github.com/repos/opsforge/core-api',
    cpuTotal: 18,
    memTotal: 25,
    errorRatePercent: 0,
    latencyMs: 42,
    service: {
      name: 'ci-pipeline-runner',
      type: 'ClusterIP',
      port: 443,
      targetPort: 443,
      healthy: true
    },
    pods: [
      {
        id: 'gha-runner',
        name: 'runner-ubuntu-latest-4k',
        status: 'Running',
        restarts: 0,
        cpuUsage: '18%',
        memUsage: 'Cache Hit 98%',
        ready: '1/1'
      }
    ]
  },
  testAssertions: [
    {
      id: 'check-checkout',
      name: 'Repository Checkout Step (actions/checkout)',
      description: 'The job must invoke `actions/checkout` before running any scripts.',
      verify: (files) => {
        const wf = files['.github/workflows/deploy.yml'] || '';
        const hasCheckout = /uses:\s*actions\/checkout@v[34]/i.test(wf);
        return {
          passed: hasCheckout,
          message: hasCheckout
            ? 'actions/checkout step properly placed before commands.'
            : 'Missing actions/checkout step in workflow.',
          diff: { expected: 'uses: actions/checkout@v4', actual: 'Step missing' }
        };
      }
    },
    {
      id: 'check-cache',
      name: 'Dependency Caching (actions/cache)',
      description: 'Configures actions/cache with a lockfile hash key.',
      verify: (files) => {
        const wf = files['.github/workflows/deploy.yml'] || '';
        const hasCache = /uses:\s*actions\/cache@v[34]/i.test(wf) || /cache:\s*['"]?npm['"]?/i.test(wf);
        return {
          passed: hasCache,
          message: hasCache
            ? 'Dependency caching is enabled via actions/cache.'
            : 'Missing actions/cache step or npm setup-node cache.',
          diff: { expected: 'uses: actions/cache@v4', actual: 'No cache step found' }
        };
      }
    },
    {
      id: 'check-secret-security',
      name: 'Secret Injected via Environment Variable',
      description: 'Secrets must not appear directly in the `run:` command argument line.',
      verify: (files) => {
        const wf = files['.github/workflows/deploy.yml'] || '';
        const hasSecretInRun = /run:.*?\$\{\{\s*secrets\./i.test(wf);
        const hasEnvSecret = /env:[\s\S]*?secrets\./i.test(wf);
        const passed = !hasSecretInRun || hasEnvSecret;
        return {
          passed,
          message: passed
            ? 'Deployment token is safely provided via env variables.'
            : 'Security Risk: secret is interpolated directly in shell command arguments.',
          diff: { expected: 'env: DEPLOY_KEY: ${{ secrets... }}', actual: 'secrets interpolated in run string' }
        };
      }
    }
  ],
  postMortem: {
    rootCause:
      'The initial workflow omitted `actions/checkout`, causing `npm ci` to fail immediately. Furthermore, no caching was configured, resulting in excessive network requests, and secrets were passed in process command strings visible in ps tables.',
    impact:
      'CI deployment pipeline failed; engineers could not release critical bug fixes for 4 hours.',
    detection:
      'GitHub Actions build failure notification and automated GitHub Secret Scanning alert.',
    solutionBreakdown: [
      'Added `actions/checkout@v4` as the first step.',
      'Configured `actions/cache@v4` targeting `~/.npm` with key based on `package-lock.json`.',
      'Moved secret reference into `env:` block.'
    ],
    referenceFiles: [
      {
        name: '.github/workflows/deploy.yml',
        language: 'yaml',
        content: `name: Production Deployment Pipeline

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Cache Node Modules
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: \${{ runner.os }}-node-\${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            \${{ runner.os }}-node-

      - name: Install dependencies
        run: npm ci

      - name: Run Test Suite
        run: npm test

      - name: Deploy to Kubernetes Cluster
        env:
          DEPLOY_KEY: \${{ secrets.PROD_DEPLOY_KEY }}
        run: ./scripts/deploy.sh --env prod
`
      }
    ],
    preventativeMeasures: [
      'Implement GitHub Action linting with `actionlint` in PR checks.',
      'Enable mandatory secret scanning push protection across all repositories.'
    ]
  },
  initialTerminalLogs: [
    'gh run view --log-failed',
    'Run npm ci',
    'npm error code ENOENT',
    'npm error syscall open',
    'npm error path /home/runner/work/core-api/package.json',
    'npm error errno -2',
    'npm error enoent Could not read package.json: No such file or directory'
  ]
};
