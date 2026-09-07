import React, { useState } from 'react';
import { useOps } from '../../context/OpsContext';
import { TRACK_INFO } from '../../data/catalog';
import { 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  ListChecks, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
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
    <div className="flex flex-col h-full bg-[var(--bg-panel)] border border-white/[0.08] rounded-xl overflow-hidden shadow-sm">
      {/* Tab Navigation Header (LeetCode style) */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-[var(--bg-panel)] px-3 pt-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('description')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-md text-xs font-medium transition border-t border-x ${
              activeTab === 'description'
                ? 'bg-[var(--bg-card)] border-white/[0.08] text-white border-b-transparent shadow-sm'
                : 'border-transparent text-[var(--text-muted)] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>Description</span>
          </button>
          <button
            onClick={() => setActiveTab('editorial')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-md text-xs font-medium transition border-t border-x ${
              activeTab === 'editorial'
                ? 'bg-[var(--bg-card)] border-white/[0.08] text-white border-b-transparent shadow-sm'
                : 'border-transparent text-[var(--text-muted)] hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Editorial</span>
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-md text-xs font-medium transition border-t border-x ${
              activeTab === 'submissions'
                ? 'bg-[var(--bg-card)] border-white/[0.08] text-white border-b-transparent shadow-sm'
                : 'border-transparent text-[var(--text-muted)] hover:text-white'
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
      <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-4 text-xs bg-[var(--bg-card)]">
        {activeTab === 'description' && (
          <>
            {/* Title & Metadata */}
            <div className="space-y-2 border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  currentChallenge.severity === 'SEV-1' 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {currentChallenge.severity}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-white/[0.04] text-[var(--text-secondary)] border border-white/[0.06]">
                  {trackInfo.icon} {trackInfo.label}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] font-mono">
                  {currentChallenge.difficulty}
                </span>
              </div>

              <h1 className="text-lg font-bold text-white leading-snug">
                {currentChallenge.title}
              </h1>

              <div className="text-[11px] text-[var(--text-muted)] font-mono flex items-center gap-2">
                <span>Target:</span>
                <span className="text-white font-medium">{currentChallenge.serviceName}</span>
              </div>
            </div>

            {/* Problem Summary */}
            <div className="space-y-2 text-[var(--text-secondary)] leading-relaxed">
              <p>{currentChallenge.summary}</p>
            </div>

            {/* Symptoms & Logs */}
            <div className="border border-white/[0.06] rounded-lg bg-white/[0.02] overflow-hidden">
              <button
                onClick={() => setSymptomsOpen(!symptomsOpen)}
                className="w-full p-3 flex items-center justify-between text-left text-white font-semibold hover:bg-white/[0.02] transition"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reported Symptoms & Logs</span>
                </div>
                {symptomsOpen ? <ChevronUp className="w-3.5 h-3.5 text-[var(--text-muted)]" /> : <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
              </button>

              {symptomsOpen && (
                <div className="p-3 pt-0 space-y-2 border-t border-white/[0.06]">
                  <ul className="space-y-1 list-disc pl-4 text-[var(--text-secondary)]">
                    {currentChallenge.symptoms.map((sym, idx) => (
                      <li key={idx}>{sym}</li>
                    ))}
                  </ul>

                  <div className="pt-2">
                    <p className="text-[11px] font-semibold text-[var(--text-muted)] mb-1">Reproduction Steps:</p>
                    <ol className="space-y-1 list-decimal pl-4 text-[var(--text-muted)] font-mono text-[11px]">
                      {currentChallenge.reproductionSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Acceptance Criteria */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-white font-semibold">
                  <ListChecks className="w-4 h-4 text-emerald-400" />
                  <span>Acceptance Criteria</span>
                </div>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  {Object.values(checkedRules).filter(Boolean).length}/{currentChallenge.acceptanceRules.length} Completed
                </span>
              </div>

              <div className="space-y-2">
                {currentChallenge.acceptanceRules.map(rule => {
                  const isChecked = !!checkedRules[rule.id];
                  const hintOpen = !!expandedHints[rule.id];

                  return (
                    <div
                      key={rule.id}
                      className={`p-3 rounded-lg border transition ${
                        isChecked
                          ? 'bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-300'
                          : 'bg-white/[0.02] border-white/[0.06] text-[var(--text-secondary)]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRule(rule.id)}
                          className="mt-0.5 rounded bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className={`leading-relaxed ${isChecked ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                            {rule.description}
                          </p>

                          {rule.hint && (
                            <div className="mt-2">
                              <button
                                onClick={() => toggleHint(rule.id)}
                                className="text-[10px] flex items-center gap-1 text-[var(--text-muted)] hover:text-white font-medium"
                              >
                                <HelpCircle className="w-3 h-3" />
                                <span>{hintOpen ? 'Hide Hint' : 'Reveal Hint'}</span>
                              </button>
                              {hintOpen && (
                                <div className="mt-1.5 p-2 rounded bg-white/[0.04] border border-white/[0.06] text-zinc-300 font-mono text-[10px]">
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
            <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Root Cause Analysis</span>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {currentChallenge.postMortem.rootCause}
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-white">Remediation Breakdown</h3>
              <ul className="space-y-1 list-disc pl-4 text-[var(--text-secondary)]">
                {currentChallenge.postMortem.solutionBreakdown.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {currentChallenge.postMortem.referenceFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">Production Reference Solution</h3>
                  <button
                    onClick={() => handleCopySolution(currentChallenge.postMortem.referenceFiles[0].content)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-white/[0.06] hover:bg-white/[0.1] text-[var(--text-secondary)] hover:text-white border border-white/[0.08] transition"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="rounded-lg border border-white/[0.08] bg-[var(--bg-panel)] overflow-hidden">
                  <pre className="p-3 text-[11px] font-mono text-zinc-200 overflow-x-auto max-h-64 leading-relaxed">
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
            {isSolved ? (
              <div className="p-4 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/20 text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Accepted</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Runtime: 18ms • Memory: Optimal • All production checks satisfied.
                </p>
              </div>
            ) : (
              <div className="p-8 text-center text-[var(--text-muted)] space-y-1">
                <p className="font-medium text-[var(--text-secondary)]">No Accepted Submissions Yet</p>
                <p className="text-[11px]">Click 'Submit' once all automated test cases pass.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
