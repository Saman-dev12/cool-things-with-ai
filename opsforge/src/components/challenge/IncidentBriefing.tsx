import React, { useState } from 'react';
import { useOps } from '../../context/OpsContext';
import { TRACK_INFO } from '../../data/catalog';
import { 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  ListChecks, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Code2,
  Copy,
  Check,
  History
} from 'lucide-react';

export const IncidentBriefing: React.FC = () => {
  const { currentChallenge, solvedChallengeIds } = useOps();
  const [activeTab, setActiveTab] = useState<'description' | 'editorial' | 'submissions'>('description');
  const [checkedRules, setCheckedRules] = useState<Record<string, boolean>>({});
  const [expandedHints, setExpandedHints] = useState<Record<string, boolean>>({});
  const [symptomsOpen, setSymptomsOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const trackInfo = TRACK_INFO[currentChallenge.track];
  const isSolved = solvedChallengeIds.includes(currentChallenge.id);

  const toggleRule = (id: string) => {
    setCheckedRules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleHint = (id: string) => {
    setExpandedHints(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopySolution = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl">
      {/* Tab Navigation Header (LeetCode style) */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#090d16] px-3 pt-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('description')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium transition border-t border-x ${
              activeTab === 'description'
                ? 'bg-[#0d1117] border-slate-800 text-cyan-300 border-b-transparent shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Description</span>
          </button>
          <button
            onClick={() => setActiveTab('editorial')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium transition border-t border-x ${
              activeTab === 'editorial'
                ? 'bg-[#0d1117] border-slate-800 text-cyan-300 border-b-transparent shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Editorial</span>
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium transition border-t border-x ${
              activeTab === 'submissions'
                ? 'bg-[#0d1117] border-slate-800 text-cyan-300 border-b-transparent shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-emerald-400" />
            <span>Submissions</span>
          </button>
        </div>

        {isSolved && (
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 pb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Solved</span>
          </span>
        )}
      </div>

      {/* Tab Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {activeTab === 'description' && (
          <>
            {/* Title & Metadata */}
            <div className="space-y-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                  currentChallenge.severity === 'SEV-1' 
                    ? 'bg-red-500/15 text-red-400 border-red-500/30' 
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}>
                  {currentChallenge.severity}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {trackInfo.icon} {trackInfo.label}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {currentChallenge.difficulty}
                </span>
              </div>

              <h1 className="text-lg font-bold text-slate-100 leading-snug">
                {currentChallenge.title}
              </h1>

              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                <span>Target Workload:</span>
                <span className="text-cyan-300 font-semibold">{currentChallenge.serviceName}</span>
              </div>
            </div>

            {/* Problem Summary */}
            <div className="space-y-2 text-slate-300 leading-relaxed">
              <p>{currentChallenge.summary}</p>
            </div>

            {/* Symptoms & Logs */}
            <div className="border border-slate-800 rounded-xl bg-slate-900/60 overflow-hidden">
              <button
                onClick={() => setSymptomsOpen(!symptomsOpen)}
                className="w-full p-3 flex items-center justify-between text-left text-slate-200 font-semibold hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Reported Symptoms & Logs</span>
                </div>
                {symptomsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {symptomsOpen && (
                <div className="p-3 pt-0 space-y-2 border-t border-slate-800/60">
                  <ul className="space-y-1 list-disc pl-4 text-slate-300">
                    {currentChallenge.symptoms.map((sym, idx) => (
                      <li key={idx}>{sym}</li>
                    ))}
                  </ul>

                  <div className="pt-2">
                    <p className="text-[11px] font-semibold text-slate-400 mb-1">Reproduction Steps:</p>
                    <ol className="space-y-1 list-decimal pl-4 text-slate-400 font-mono text-[11px]">
                      {currentChallenge.reproductionSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Acceptance / Remediation Criteria */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                  <ListChecks className="w-4 h-4 text-emerald-400" />
                  <span>Acceptance Criteria</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {Object.values(checkedRules).filter(Boolean).length}/{currentChallenge.acceptanceRules.length} Checked
                </span>
              </div>

              <div className="space-y-2">
                {currentChallenge.acceptanceRules.map(rule => {
                  const isChecked = !!checkedRules[rule.id];
                  const hintOpen = !!expandedHints[rule.id];

                  return (
                    <div
                      key={rule.id}
                      className={`p-3 rounded-xl border transition ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRule(rule.id)}
                          className="mt-0.5 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className={`leading-relaxed ${isChecked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {rule.description}
                          </p>

                          {rule.hint && (
                            <div className="mt-2">
                              <button
                                onClick={() => toggleHint(rule.id)}
                                className="text-[10px] flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
                              >
                                <HelpCircle className="w-3 h-3" />
                                <span>{hintOpen ? 'Hide Hint' : 'Reveal Hint'}</span>
                              </button>
                              {hintOpen && (
                                <div className="mt-1.5 p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                                  {rule.hint}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Tab 2: Editorial / Solution */}
        {activeTab === 'editorial' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Root Cause Analysis (RCA)</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {currentChallenge.postMortem.rootCause}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-200">Remediation Steps</h3>
              <ul className="space-y-1 list-disc pl-4 text-slate-300">
                {currentChallenge.postMortem.solutionBreakdown.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Reference Solution Code */}
            {currentChallenge.postMortem.referenceFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-200">Production Reference Solution</h3>
                  <button
                    onClick={() => handleCopySolution(currentChallenge.postMortem.referenceFiles[0].content)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                  <pre className="p-3 text-[11px] font-mono text-slate-200 overflow-x-auto max-h-64 leading-relaxed">
                    {currentChallenge.postMortem.referenceFiles[0].content}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Submissions */}
        {activeTab === 'submissions' && (
          <div className="space-y-3">
            <div className="text-slate-400">
              {isSolved ? (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Accepted</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Runtime: 18ms • Memory: Optimal • Passed 100% test assertions.
                  </p>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-400">No Accepted Submissions Yet</p>
                  <p className="text-[11px]">Click 'Submit' after passing all diagnostic checks.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
