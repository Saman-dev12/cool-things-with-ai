import React from 'react';
import { useOps } from '../../context/OpsContext';
import { CheckCircle2, XCircle, ShieldCheck, Play, Rocket } from 'lucide-react';

export const GraderPanel: React.FC = () => {
  const { gradeSummary, runDiagnostics, deployFix, currentChallenge, solvedChallengeIds } = useOps();

  const isSolved = solvedChallengeIds.includes(currentChallenge.id);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] overflow-hidden">
      {/* Grader Header */}
      <div className="px-3 py-2 border-b border-white/[0.06] bg-[var(--bg-panel)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[11px] font-semibold text-white">
            Automated Diagnostic Grader
          </span>
        </div>

        {gradeSummary.status !== 'idle' && (
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              gradeSummary.status === 'passed'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {gradeSummary.passed} / {gradeSummary.total} PASSED
          </span>
        )}
      </div>

      {/* Grader Body */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
        {gradeSummary.status === 'idle' ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2 text-[var(--text-muted)]">
            <ShieldCheck className="w-8 h-8 text-zinc-600" />
            <div>
              <p className="font-medium text-white text-xs">Ready for Validation</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Run diagnostics to evaluate your manifest and script remediation against test criteria.
              </p>
            </div>
            <button
              onClick={runDiagnostics}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-medium text-xs transition"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Run Automated Tests</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Status Banner */}
            <div
              className={`p-3 rounded-lg border flex items-center justify-between ${
                gradeSummary.status === 'passed'
                  ? 'bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/[0.06] border-rose-500/20 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {gradeSummary.status === 'passed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <div>
                  <p className="font-semibold text-white">
                    {gradeSummary.status === 'passed'
                      ? 'All Reliability Assertions Verified'
                      : 'Diagnostic Checks Failed'}
                  </p>
                  <p className="text-[10px] opacity-80">
                    {gradeSummary.status === 'passed'
                      ? 'Configuration is production ready.'
                      : `${gradeSummary.failed} assertion(s) need attention.`}
                  </p>
                </div>
              </div>

              {gradeSummary.status === 'passed' && !isSolved && (
                <button
                  onClick={deployFix}
                  className="px-2.5 py-1 rounded bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center gap-1 transition shadow-sm"
                >
                  <Rocket className="w-3 h-3" />
                  <span>Deploy</span>
                </button>
              )}
            </div>

            {/* Test Cards */}
            <div className="space-y-1.5">
              {gradeSummary.results.map(res => (
                <div
                  key={res.id}
                  className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      {res.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                      <span className="font-medium text-white">{res.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">{res.durationMs}ms</span>
                  </div>

                  <p className="text-[11px] text-[var(--text-secondary)] pl-5">
                    {res.message}
                  </p>

                  {res.diff && !res.passed && (
                    <div className="mt-2 ml-5 p-2 rounded bg-black/40 border border-white/[0.06] text-[10px] font-mono space-y-0.5">
                      <div className="text-emerald-400">
                        <span className="text-[var(--text-muted)]">+ Expected: </span>
                        {res.diff.expected}
                      </div>
                      <div className="text-rose-400">
                        <span className="text-[var(--text-muted)]">- Actual:   </span>
                        {res.diff.actual}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
