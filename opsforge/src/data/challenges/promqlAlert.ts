import { OpsChallenge } from '../../types/ops';

export const promqlAlertChallenge: OpsChallenge = {
  id: 'promql-p99-slo-alert',
  title: 'Write PromQL Alert for P99 Latency & SLO Burn',
  track: 'observability',
  severity: 'SEV-3',
  difficulty: 'Staff SRE',
  serviceName: 'checkout-gateway',
  estimatedTimeMin: 12,
  tags: ['Prometheus', 'PromQL', 'SLO', 'Observability', 'Histograms'],
  summary:
    'During a flash sale, customer checkouts were timing out at 4.2 seconds, yet the on-call PagerDuty alert never triggered. Investigation revealed the existing alert rule calculates a simple arithmetic average (`avg`) across all requests, hiding the 99th percentile tail latency behind millions of fast 20ms health checks.',
  symptoms: [
    'Customers experiencing 4+ second delays on checkout submissions.',
    'Existing `avg()` alert rule reported 28ms because 98% of requests were static ping queries.',
    'SLO error budget was completely burned without alerting the incident response team.'
  ],
  reproductionSteps: [
    'Inspect `prometheus_rules.yaml`.',
    'Identify incorrect use of `avg()` on histogram metrics.',
    'Construct correct PromQL expression using `histogram_quantile()` and `rate()`.'
  ],
  acceptanceRules: [
    {
      id: 'histogram-quantile',
      description: 'Use `histogram_quantile(0.99, ...)` to accurately track tail latency.',
      hint: 'Prometheus histograms store buckets under the `le` label.'
    },
    {
      id: 'rate-window',
      description: 'Aggregate bucket rates over a 5-minute window: `sum by (le) (rate(http_request_duration_seconds_bucket[5m]))`.',
      hint: 'Never pass raw counters directly to `histogram_quantile`; always apply `rate()` first.'
    },
    {
      id: 'threshold',
      description: 'Set alert firing threshold to trigger when P99 latency exceeds 0.5s (500ms).',
      hint: 'Use `> 0.5` seconds.'
    }
  ],
  starterFiles: [
    {
      name: 'prometheus_rules.yaml',
      language: 'yaml',
      content: `groups:
- name: checkout-service.alerts
  rules:
  # BROKEN ALERT RULE: Averages hide tail latency!
  - alert: HighCheckoutLatency
    # BUG: avg() smooths out the 99th percentile spike
    expr: avg(http_request_duration_seconds) > 5.0
    for: 2m
    labels:
      severity: critical
      team: payments-sre
    annotations:
      summary: "High checkout latency detected"
      description: "Average latency is above 5 seconds"
`
    }
  ],
  initialTopology: {
    clusterName: 'monitoring-grafana-prod',
    namespace: 'telemetry',
    ingressUrl: 'https://prometheus.internal/graph',
    cpuTotal: 40,
    memTotal: 52,
    errorRatePercent: 18.2,
    latencyMs: 4200,
    service: {
      name: 'prometheus-k8s',
      type: 'ClusterIP',
      port: 9090,
      targetPort: 9090,
      healthy: false
    },
    pods: [
      {
        id: 'prom-server',
        name: 'prometheus-server-0',
        status: 'Running',
        restarts: 0,
        cpuUsage: '340m',
        memUsage: '2.1Gi',
        ready: '1/1'
      }
    ]
  },
  healthyTopology: {
    clusterName: 'monitoring-grafana-prod',
    namespace: 'telemetry',
    ingressUrl: 'https://prometheus.internal/graph',
    cpuTotal: 25,
    memTotal: 38,
    errorRatePercent: 0.1,
    latencyMs: 14,
    service: {
      name: 'prometheus-k8s',
      type: 'ClusterIP',
      port: 9090,
      targetPort: 9090,
      healthy: true
    },
    pods: [
      {
        id: 'prom-server',
        name: 'prometheus-server-0',
        status: 'Running',
        restarts: 0,
        cpuUsage: '210m',
        memUsage: '1.4Gi',
        ready: '1/1'
      }
    ]
  },
  testAssertions: [
    {
      id: 'check-histogram-quantile',
      name: 'Uses histogram_quantile(0.99, ...)',
      description: 'Calculates the 99th percentile quantile from histogram buckets.',
      verify: (files) => {
        const rules = files['prometheus_rules.yaml'] || '';
        const hasQuantile = /histogram_quantile\s*\(\s*0\.99/i.test(rules);
        return {
          passed: hasQuantile,
          message: hasQuantile
            ? 'histogram_quantile(0.99, ...) properly specified.'
            : 'Missing histogram_quantile(0.99, ...) function in expr.',
          diff: { expected: 'histogram_quantile(0.99, ...)', actual: 'Check expr syntax' }
        };
      }
    },
    {
      id: 'check-rate-and-bucket',
      name: 'Aggregates Bucket Rates over Time Window',
      description: 'Verifies `rate(http_request_duration_seconds_bucket[...])` inside sum by (le).',
      verify: (files) => {
        const rules = files['prometheus_rules.yaml'] || '';
        const hasBucketRate = /rate\s*\(\s*http_request_duration_seconds_bucket/i.test(rules);
        const hasSumByLe = /sum\s+by\s*\(\s*le\s*\)/i.test(rules) || /sum\s*\(\s*rate/i.test(rules);
        const passed = hasBucketRate && hasSumByLe;
        return {
          passed,
          message: passed
            ? 'Correct rate calculation and bucket aggregation.'
            : 'Ensure you calculate `rate()` on `_bucket` metric and sum over `le`.',
          diff: { expected: 'sum by (le) (rate(..._bucket[5m]))', actual: 'Missing rate or bucket reference' }
        };
      }
    },
    {
      id: 'check-alert-threshold',
      name: 'Alert Threshold Set to > 0.5 (500ms)',
      description: 'Alert fires when P99 exceeds 500 milliseconds (0.5s).',
      verify: (files) => {
        const rules = files['prometheus_rules.yaml'] || '';
        const hasThreshold = />\s*0\.5\b/i.test(rules);
        return {
          passed: hasThreshold,
          message: hasThreshold
            ? 'Alert threshold set to > 0.5s (500ms).'
            : 'Alert threshold should be `> 0.5` seconds.',
          diff: { expected: '> 0.5', actual: 'Check comparison operator' }
        };
      }
    }
  ],
  postMortem: {
    rootCause:
      'The initial alert computed `avg()`, which aggregates total duration divided by total requests. Because 98% of requests were lightweight `/healthz` checks returning in 2ms, the 4.2s latency for actual payment checkouts was completely washed out mathematically.',
    impact:
      'SEV-3 incident degraded into unalerted SEV-1 user experience for 55 minutes.',
    detection:
      'User complaints on social media and customer support tickets.',
    solutionBreakdown: [
      'Rewrote PromQL expression using `histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m]))) > 0.5`.',
      'Configured multi-window multi-burn-rate SLO alerts as recommended by Google SRE Workbook.'
    ],
    referenceFiles: [
      {
        name: 'prometheus_rules.yaml',
        language: 'yaml',
        content: `groups:
- name: checkout-service.alerts
  rules:
  - alert: HighCheckoutP99Latency
    expr: histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m]))) > 0.5
    for: 2m
    labels:
      severity: critical
      team: payments-sre
    annotations:
      summary: "Checkout P99 latency exceeded 500ms"
      description: "99th percentile customer requests are taking longer than 500ms."
`
      }
    ],
    preventativeMeasures: [
      'Ban `avg()` across latency metrics in Prometheus rule linters.',
      'Adopt Google SRE error budget alerting standards across all tier-1 services.'
    ]
  },
  initialTerminalLogs: [
    'promtool check rules prometheus_rules.yaml',
    'Checking prometheus_rules.yaml  SUCCESS',
    '',
    'promtool test rules test_rules.yaml',
    'FAIL: alert HighCheckoutLatency did not fire despite P99=4.2s (average was 0.028s)'
  ]
};
