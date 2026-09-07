import React from 'react';
import { useOps } from '../../context/OpsContext';
import { CheckCircle2, XCircle, ShieldCheck, AlertCircle, Play, Rocket } from 'lucide-react';

export const GraderPanel: React.FC = () => {
  const { gradeSummary, runDiagnostics, deployFix, currentChallenge, solvedChallengeIds } = useOps();

  const isSolved = solvedChallengeIds.includes(currentChallenge.id);

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Grader Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Automated SRE Diagnostic Grader
          </span>
        </div>

        <div className="flex items-center gap-2">
          {gradeSummary.status !== 'idle' && (
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                gradeSummary.status === 'passed'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-red-500/15 border-red-500/40 text-red-400'
              }`}
            >
              {gradeSummary.passed} / {gradeSummary.total} PASSED
            </span>
          )}
        </div>
      </div>

      {/* Grader Body */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
        {gradeSummary.status === 'idle' ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-500">
            <ShieldCheck className="w-10 h-10 text-slate-700" />
            <div>
              <p className="font-semibold text-slate-300">Ready to Validate Fixes</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                Edit the configuration files in the editor, then run diagnostics to verify against production constraints.
              </p>
            </div>
            <button
              onClick={runDiagnostics}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold transition text-xs"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-400" />
              <span>Run Automated Diagnostics</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Status Banner */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between ${
                gradeSummary.status === 'passed'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/30 border-red-500/40 text-red-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {gradeSummary.status === 'passed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                )}
                <div>
                  <p className="font-bold text-slate-100">
                    {gradeSummary.status === 'passed'
                      ? 'All Quality & Reliability Gates Passed!'
                      : 'Diagnostic Checks Failed'}
                  </p>
                  <p className="text-[11px] opacity-80">
                    {gradeSummary.status === 'passed'
                      ? 'Cluster is healthy. You can safely deploy the fix to production.'
                      : `${gradeSummary.failed} check(s) must be remediated before production rollout.`}
                  </p>
                </div>
              </div>

              {gradeSummary.status === 'passed' && !isSolved && (
                <button
                  onClick={deployFix}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Deploy Now</span>
                </button>
              )}
            </div>

            {/* Assertion Test Cards */}
            <div className="space-y-2 pt-1">
              {gradeSummary.results.map(res => (
                <div
                  key={res.id}
                  className={`p-3 rounded-xl border bg-slate-900/80 transition ${
                    res.passed ? 'border-emerald-500/30' : 'border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {res.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-200">{res.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{res.durationMs}ms</span>
                  </div>

                  <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                    {res.message}
                  </p>

                  {res.diff && !res.passed && (
                    <div className="mt-2.5 ml-6 p-2 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono space-y-1">
                      <div className="text-emerald-400">
                        <span className="text-slate-500">+ Expected: </span>
                        {res.diff.expected}
                      </div>
                      <div className="text-red-400">
                        <span className="text-slate-500">- Actual:   </span>
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
