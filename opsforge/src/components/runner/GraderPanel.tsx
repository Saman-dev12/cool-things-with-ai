import React, { useState } from 'react';
import { useOps } from '../../context/OpsContext';
import { CheckCircle2, XCircle, Play, Send } from 'lucide-react';

export const GraderPanel: React.FC = () => {
  const { gradeSummary, runDiagnostics, deployFix, currentChallenge, solvedChallengeIds } = useOps();
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);

  const isSolved = solvedChallengeIds.includes(currentChallenge.id);
  const activeResult = gradeSummary.results[selectedCaseIdx] || gradeSummary.results[0];

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] overflow-hidden text-xs">
      {gradeSummary.status === 'idle' ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-zinc-400">
          <p className="text-zinc-300 font-medium">You must run your code first.</p>
          <p className="text-[11px] text-zinc-500 max-w-sm">
            Click 'Run' to test your manifests and scripts against automated reliability testcases.
          </p>
          <button
            onClick={runDiagnostics}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#333333] hover:bg-[#3d3d3d] border border-[#444] text-white font-medium transition"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Run Code</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* LeetCode Verdict Banner */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold ${
                gradeSummary.status === 'passed' ? 'text-[#00b8a3]' : 'text-[#ff375f]'
              }`}>
                {gradeSummary.status === 'passed' ? 'Accepted' : 'Wrong Answer'}
              </span>

              {gradeSummary.status === 'passed' && !isSolved && (
                <button
                  onClick={deployFix}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#00b8a3] hover:bg-[#00a390] text-white font-semibold transition"
                >
                  <Send className="w-3 h-3" />
                  <span>Submit Solution</span>
                </button>
              )}
            </div>

            <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-3">
              <span>Runtime: <strong className="text-white">18 ms</strong> (Beats 93.4%)</span>
              <span>•</span>
              <span>Memory: <strong className="text-white">Optimal</strong> (Beats 89.1%)</span>
              <span>•</span>
              <span>Passed: <strong className="text-white">{gradeSummary.passed}/{gradeSummary.total}</strong></span>
            </div>
          </div>

          {/* Testcase Tabs (Case 1, Case 2, Case 3) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 border-b border-[#333333] pb-1.5">
              {gradeSummary.results.map((res, idx) => (
                <button
                  key={res.id}
                  onClick={() => setSelectedCaseIdx(idx)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition ${
                    selectedCaseIdx === idx
                      ? 'bg-[#333333] text-white font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-[#282828]'
                  }`}
                >
                  {res.passed ? (
                    <CheckCircle2 className="w-3 h-3 text-[#00b8a3]" />
                  ) : (
                    <XCircle className="w-3 h-3 text-[#ff375f]" />
                  )}
                  <span>Case {idx + 1}</span>
                </button>
              ))}
            </div>

            {/* Selected Testcase Details */}
            {activeResult && (
              <div className="rounded-md bg-[#262626] border border-[#383838] p-3 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="font-semibold text-white">{activeResult.name}</span>
                  <span>{activeResult.durationMs}ms</span>
                </div>

                <div className="text-zinc-300 font-sans text-xs">
                  {activeResult.message}
                </div>

                {activeResult.diff && !activeResult.passed && (
                  <div className="p-2.5 rounded bg-[#181818] border border-[#333333] text-[11px] space-y-1">
                    <div className="text-[#00b8a3]">
                      <span className="text-zinc-500">Expected: </span>
                      {activeResult.diff.expected}
                    </div>
                    <div className="text-[#ff375f]">
                      <span className="text-zinc-500">Actual:   </span>
                      {activeResult.diff.actual}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
