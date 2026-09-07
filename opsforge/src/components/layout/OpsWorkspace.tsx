import React, { useState, useEffect } from 'react';
import { IncidentBriefing } from '../challenge/IncidentBriefing';
import { OpsEditor } from '../editor/OpsEditor';
import { OpsTerminal } from '../terminal/OpsTerminal';
import { ClusterVisualizer } from '../cluster/ClusterVisualizer';
import { GraderPanel } from '../runner/GraderPanel';
import { PostMortemModal } from '../challenge/PostMortemModal';
import { useOps } from '../../context/OpsContext';
import { FileText, Code2, Layers, Terminal as TerminalIcon, CheckCircle2 } from 'lucide-react';

export const OpsWorkspace: React.FC = () => {
  const { gradeSummary } = useOps();
  const [consoleTab, setConsoleTab] = useState<'cluster' | 'terminal' | 'grader'>('cluster');
  const [mobileTab, setMobileTab] = useState<'briefing' | 'editor' | 'console'>('editor');

  // Automatically switch to grader test result tab when user runs tests or submits
  useEffect(() => {
    if (gradeSummary.status !== 'idle') {
      setConsoleTab('grader');
    }
  }, [gradeSummary.status]);

  return (
    <main className="flex-1 min-h-0 w-full p-2.5 overflow-hidden flex flex-col bg-[#1a1a1a]">
      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden items-center justify-around bg-[#262626] border border-[#383838] rounded-md p-1 mb-2 shrink-0 text-xs">
        <button
          onClick={() => setMobileTab('briefing')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
            mobileTab === 'briefing' ? 'bg-[#333333] text-white font-semibold' : 'text-zinc-400'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Description</span>
        </button>
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
            mobileTab === 'editor' ? 'bg-[#333333] text-white font-semibold' : 'text-zinc-400'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Code</span>
        </button>
        <button
          onClick={() => setMobileTab('console')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
            mobileTab === 'console' ? 'bg-[#333333] text-white font-semibold' : 'text-zinc-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Console</span>
        </button>
      </div>

      {/* Main Workspace Split (Left: Problem Spec | Right: Editor + Console) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2.5 min-h-0 overflow-hidden">
        {/* Left Column: Problem Briefing (5 Cols) */}
        <div className={`lg:col-span-5 h-full min-h-0 ${mobileTab === 'briefing' ? 'block' : 'hidden lg:block'}`}>
          <IncidentBriefing />
        </div>

        {/* Right Column: Code Editor (Top) + Interactive Console (Bottom) (7 Cols) */}
        <div className={`lg:col-span-7 h-full min-h-0 flex flex-col gap-2.5 ${
          mobileTab === 'briefing' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Top: Multi-file Editor */}
          <div className={`flex-1 min-h-0 ${mobileTab === 'console' ? 'hidden lg:block' : 'block'}`}>
            <OpsEditor />
          </div>

          {/* Bottom: Console Panel with Tabs (Testcase | Terminal | Test Result) */}
          <div className={`h-64 sm:h-72 min-h-[180px] shrink-0 flex flex-col rounded-lg border border-[#383838] bg-[#262626] overflow-hidden shadow-sm ${
            mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}>
            {/* Console Tabs Header (LeetCode Style) */}
            <div className="flex items-center justify-between px-3 border-b border-[#383838] bg-[#262626] text-xs">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setConsoleTab('cluster')}
                  className={`flex items-center gap-1.5 py-2 text-xs font-medium transition border-b-2 ${
                    consoleTab === 'cluster'
                      ? 'border-white text-white font-semibold'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Testcase & Topology</span>
                </button>

                <button
                  onClick={() => setConsoleTab('terminal')}
                  className={`flex items-center gap-1.5 py-2 text-xs font-medium transition border-b-2 ${
                    consoleTab === 'terminal'
                      ? 'border-white text-white font-semibold'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <TerminalIcon className="w-3.5 h-3.5" />
                  <span>Terminal</span>
                </button>

                <button
                  onClick={() => setConsoleTab('grader')}
                  className={`flex items-center gap-1.5 py-2 text-xs font-medium transition border-b-2 ${
                    consoleTab === 'grader'
                      ? 'border-white text-white font-semibold'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00b8a3]" />
                  <span>Test Result</span>
                  {gradeSummary.status !== 'idle' && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      gradeSummary.status === 'passed' ? 'bg-[#00b8a3]/20 text-[#00b8a3]' : 'bg-[#ff375f]/20 text-[#ff375f]'
                    }`}>
                      {gradeSummary.passed}/{gradeSummary.total}
                    </span>
                  )}
                </button>
              </div>

              <div className="text-[11px] font-mono text-zinc-500 hidden sm:block">
                Console
              </div>
            </div>

            {/* Console Content Area */}
            <div className="flex-1 min-h-0 overflow-hidden bg-[#1e1e1e]">
              {consoleTab === 'cluster' && <ClusterVisualizer />}
              {consoleTab === 'terminal' && <OpsTerminal />}
              {consoleTab === 'grader' && <GraderPanel />}
            </div>
          </div>
        </div>
      </div>

      {/* Post Mortem RCA Modal */}
      <PostMortemModal />
    </main>
  );
};
