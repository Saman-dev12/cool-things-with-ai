import { OpsChallenge, GradeSummary, TestResult } from '../types/ops';

export function runGradingSuite(
  challenge: OpsChallenge,
  files: Record<string, string>
): GradeSummary {
  const startTime = performance.now();
  const results: TestResult[] = [];

  for (const assertion of challenge.testAssertions) {
    const t0 = performance.now();
    try {
      const outcome = assertion.verify(files);
      const durationMs = Math.max(1, Math.round(performance.now() - t0));
      results.push({
        id: assertion.id,
        name: assertion.name,
        description: assertion.description,
        passed: outcome.passed,
        message: outcome.message,
        diff: outcome.diff,
        durationMs
      });
    } catch (err: any) {
      results.push({
        id: assertion.id,
        name: assertion.name,
        description: assertion.description,
        passed: false,
        message: `Evaluation Error: ${err.message || String(err)}`,
        durationMs: 1
      });
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.length - passedCount;
  const status = failedCount === 0 ? 'passed' : 'failed';

  return {
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    status,
    results,
    timestamp: Date.now()
  };
}
