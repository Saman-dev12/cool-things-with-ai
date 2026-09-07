import React, { useState, useMemo } from 'react';
import { useOps } from '../../context/OpsContext';
import { TRACK_INFO } from '../../data/catalog';
import { highlightCode } from '../../utils/highlighter';
import { 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  BookOpen, 
  Copy, 
  Check, 
  History,
  Building2,
  Tag
} from 'lucide-react';

export const IncidentBriefing: React.FC = () => {
  const { currentChallenge, allProblems, solvedChallengeIds } = useOps();
  const [activeTab, setActiveTab] = useState<'description' | 'editorial' | 'submissions'>('description');
  const [checkedRules, setCheckedRules] = useState<Record<string, boolean>>({});
  const [expandedHints, setExpandedHints] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const currentIdx = allProblems.findIndex(p => p.id === currentChallenge.id);
  const problemNumber = currentIdx >= 0 ? currentIdx + 1 : 1;
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

  const getDifficultyChip = () => {
    switch (currentChallenge.difficulty) {
      case 'Beginner':
        return <span className="bg-[#00b8a3]/15 text-[#00b8a3] px-2.5 py-0.5 rounded-full text-xs font-medium">Easy</span>;
      case 'Intermediate':
        return <span className="bg-[#ffc01e]/15 text-[#ffc01e] px-2.5 py-0.5 rounded-full text-xs font-medium">Medium</span>;
      case 'Staff SRE':
        return <span className="bg-[#ff375f]/15 text-[#ff375f] px-2.5 py-0.5 rounded-full text-xs font-medium">Hard</span>;
    }
  };

  const refFile = currentChallenge.postMortem.referenceFiles[0];
  const highlightedRefCode = useMemo(() => {
    if (!refFile?.content) return '';
    return highlightCode(refFile.content, refFile.name || 'solution.yaml');
  }, [refFile]);

  return (
    <div className="flex flex-col h-full bg-[#262626] border border-[#383838] rounded-lg overflow-hidden shadow-sm">
      {/* Tab Navigation Header (Exact LeetCode Flat Tabs) */}
      <div className="flex items-center justify-between border-b border-[#383838] bg-[#262626] px-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('description')}
            className={`flex items-center gap-1.5 py-2.5 text-xs font-medium transition border-b-2 ${
              activeTab === 'description'
                ? 'border-[#eff1f6] text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Description</span>
          </button>

          <button
            onClick={() => setActiveTab('editorial')}
            className={`flex items-center gap-1.5 py-2.5 text-xs font-medium transition border-b-2 ${
              activeTab === 'editorial'
                ? 'border-[#eff1f6] text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#ffa116]" />
            <span>Editorial</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-1.5 py-2.5 text-xs font-medium transition border-b-2 ${
              activeTab === 'submissions'
                ? 'border-[#eff1f6] text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Submissions</span>
          </button>
        </div>

        {isSolved && (
          <span className="text-xs font-medium text-[#00b8a3] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Solved</span>
          </span>
        )}
      </div>

      {/* Tab Body */}
      <div className="flex-1 min-h-0 p-5 overflow-y-auto space-y-5 text-sm bg-[#1e1e1e] text-[#eff1f6]">
        {activeTab === 'description' && (
          <>
            {/* Title & Metadata Badges */}
            <div className="space-y-3 pb-3 border-b border-[#333333]">
              <h1 className="text-lg font-semibold text-white">
                {problemNumber}. {currentChallenge.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2">
                {getDifficultyChip()}

                <span className="bg-[#2a2a2a] text-zinc-300 border border-[#383838] px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                  <span>{trackInfo.icon}</span>
                  <span>{trackInfo.label}</span>
                </span>

                <span className="bg-[#2a2a2a] text-zinc-400 border border-[#383838] px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span>Google, Netflix, Stripe</span>
                </span>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="space-y-3 text-zinc-300 leading-relaxed text-xs">
              <p>{currentChallenge.summary}</p>
            </div>

            {/* Terminal Diagnostic Logs */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-400" />
                <span>Observed Symptoms & Terminal Output:</span>
              </div>

              <div className="rounded-md bg-[#181818] border border-[#333333] p-3 font-mono text-[11px] text-zinc-300 space-y-2 overflow-x-auto">
                <ul className="space-y-1 text-zinc-300">
                  {currentChallenge.symptoms.map((sym, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#ff375f]">•</span>
                      <span>{sym}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 border-t border-[#2a2a2a] text-zinc-400">
                  <span className="text-zinc-500 block mb-1">Reproduction:</span>
                  {currentChallenge.reproductionSteps.map((step, idx) => (
                    <div key={idx} className="text-zinc-300">
                      $ {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Example 1 Section (LeetCode Format) */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-white">Example 1:</div>
              <div className="rounded-md bg-[#262626] border border-[#383838] p-3 text-xs font-mono space-y-1.5 leading-relaxed">
                <div>
                  <span className="text-zinc-400 font-semibold">Input: </span>
                  <span className="text-zinc-200">manifest with memory.limits=128Mi, livenessProbe=/health</span>
                </div>
                <div>
                  <span className="text-zinc-400 font-semibold">Output: </span>
                  <span className="text-[#00b8a3]">Pod Running (0 restarts), Probe 200 OK, Ingress healthy</span>
                </div>
                <div>
                  <span className="text-zinc-400 font-semibold">Explanation: </span>
                  <span className="text-zinc-300 font-sans">
                    Increase container memory limits to prevent Linux kernel cgroup OOM termination and align health probe endpoint path.
                  </span>
                </div>
              </div>
            </div>

            {/* Constraints Section (LeetCode Format) */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-white">Constraints:</div>
              <ul className="space-y-1 text-xs text-zinc-400 list-disc pl-5 font-mono">
                <li><code className="bg-[#2a2a2a] px-1 py-0.5 rounded text-zinc-300">memory.limits &gt;= 512Mi</code></li>
                <li><code className="bg-[#2a2a2a] px-1 py-0.5 rounded text-zinc-300">memory.requests &gt;= 256Mi</code></li>
                <li><code className="bg-[#2a2a2a] px-1 py-0.5 rounded text-zinc-300">livenessProbe.httpGet.path == "/healthz"</code></li>
                <li>Zero downtime migration during rolling deployment</li>
              </ul>
            </div>

            {/* Acceptance Checklist */}
            <div className="space-y-2 pt-2 border-t border-[#333333]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Remediation Checklist:</span>
                <span className="text-xs font-mono text-zinc-400">
                  {Object.values(checkedRules).filter(Boolean).length} / {currentChallenge.acceptanceRules.length} Verified
                </span>
              </div>

              <div className="space-y-1.5">
                {currentChallenge.acceptanceRules.map(rule => {
                  const isChecked = !!checkedRules[rule.id];
                  const hintOpen = !!expandedHints[rule.id];

                  return (
                    <div
                      key={rule.id}
                      className="p-2.5 rounded-md bg-[#242424] border border-[#333333] text-xs transition"
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRule(rule.id)}
                          className="mt-0.5 rounded bg-[#1e1e1e] border-[#444] text-[#00b8a3] focus:ring-0 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className={`leading-relaxed ${isChecked ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                            {rule.description}
                          </p>

                          {rule.hint && (
                            <div className="mt-1.5">
                              <button
                                onClick={() => toggleHint(rule.id)}
                                className="text-[11px] flex items-center gap-1 text-zinc-400 hover:text-[#ffa116] transition"
                              >
                                <HelpCircle className="w-3 h-3" />
                                <span>{hintOpen ? 'Hide Hint' : 'Hint'}</span>
                              </button>
                              {hintOpen && (
                                <div className="mt-1.5 p-2 rounded bg-[#1c1c1c] border border-[#333333] text-zinc-300 font-mono text-[11px]">
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

        {/* Editorial Tab */}
        {activeTab === 'editorial' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-md bg-[#242424] border border-[#383838] space-y-1.5 text-xs">
              <div className="font-semibold text-[#ffa116]">
                Root Cause Analysis (RCA)
              </div>
              <p className="text-zinc-300 leading-relaxed">
                {currentChallenge.postMortem.rootCause}
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="font-semibold text-white">Remediation Steps</div>
              <ul className="space-y-1 list-disc pl-4 text-zinc-300">
                {currentChallenge.postMortem.solutionBreakdown.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {currentChallenge.postMortem.referenceFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Reference Solution:</span>
                  <button
                    onClick={() => handleCopySolution(currentChallenge.postMortem.referenceFiles[0].content)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-[#333333] hover:bg-[#3d3d3d] text-zinc-300 hover:text-white border border-[#444] transition"
                  >
                    {copied ? <Check className="w-3 h-3 text-[#00b8a3]" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="rounded-md border border-[#383838] bg-[#181818] overflow-hidden">
                  <pre className="p-3.5 text-xs font-mono overflow-x-auto max-h-72 leading-relaxed">
                    <code dangerouslySetInnerHTML={{ __html: highlightedRefCode }} />
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="space-y-3">
            {isSolved ? (
              <div className="p-4 rounded-md bg-[#242424] border border-[#383838] space-y-1 text-xs">
                <div className="font-semibold text-[#00b8a3] flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accepted</span>
                </div>
                <p className="text-zinc-400">
                  Runtime: 18 ms • Memory: Optimal • All assertions passed.
                </p>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 space-y-1 text-xs">
                <p className="font-medium text-zinc-300">No Submissions Yet</p>
                <p className="text-zinc-500">Run code and click 'Submit' once all automated test cases pass.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
