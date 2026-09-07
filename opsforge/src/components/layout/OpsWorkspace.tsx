import React, { useState } from 'react';
import { IncidentBriefing } from '../challenge/IncidentBriefing';
import { OpsEditor } from '../editor/OpsEditor';
import { OpsTerminal } from '../terminal/OpsTerminal';
import { ClusterVisualizer } from '../cluster/ClusterVisualizer';
import { GraderPanel } from '../runner/GraderPanel';
import { PostMortemModal } from '../challenge/PostMortemModal';
import { useOps } from '../../context/OpsContext';
import { FileText, Code2, Layers, Terminal as TerminalIcon, ShieldCheck } from 'lucide-react';

export const OpsWorkspace: React.FC = () => {
  const { gradeSummary } = useOps();
  const [consoleTab, setConsoleTab] = useState<'cluster' | 'terminal' | 'grader'>('cluster');
  const [mobileTab, setMobileTab] = useState<'briefing' | 'editor' | 'console'>('editor');

  return (
    <main className="flex-1 p-3 overflow-hidden flex flex-col h-[calc(100vh-53px)] bg-[#0b0f17]">
      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden items-center justify-around bg-slate-900 border border-slate-800 rounded-lg p-1 mb-2 shrink-0">
        <button
          onClick={() => setMobileTab('briefing')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            mobileTab === 'briefing' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Description</span>
        </button>
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            mobileTab === 'editor' ? 'bg-slate-800 text-emerald-300' : 'text-slate-400'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Code</span>
        </button>
        <button
          onClick={() => setMobileTab('console')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            mobileTab === 'console' ? 'bg-slate-800 text-indigo-300' : 'text-slate-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Console & Tests</span>
        </button>
      </div>

      {/* Main Workspace Split (Left: Problem & Spec | Right: Editor & Console) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Left Half: Problem Briefing & Editorial (5 Cols) */}
        <div className={`lg:col-span-5 h-full min-h-0 ${mobileTab === 'briefing' ? 'block' : 'hidden lg:block'}`}>
          <IncidentBriefing />
        </div>

        {/* Right Half: Code Editor (Top) + Interactive Console Drawer (Bottom) (7 Cols) */}
        <div className={`lg:col-span-7 h-full min-h-0 flex flex-col gap-3 ${
          mobileTab === 'briefing' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Top: Multi-file Editor */}
          <div className={`flex-1 min-h-0 ${mobileTab === 'console' ? 'hidden lg:block' : 'block'}`}>
            <OpsEditor />
          </div>

          {/* Bottom: Console Panel with Tabs (Cluster | Terminal | Tests) */}
          <div className={`h-72 min-h-[220px] shrink-0 flex flex-col rounded-xl border border-slate-800/80 bg-[#0d1117] overflow-hidden shadow-2xl ${
            mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}>
            {/* Console Tabs Header */}
            <div className="flex items-center justify-between px-3 pt-2 border-b border-slate-800 bg-[#090d16] text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setConsoleTab('cluster')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg font-medium transition border-t border-x ${
                    consoleTab === 'cluster'
                      ? 'bg-[#0d1117] border-slate-800 text-cyan-300 border-b-transparent shadow-sm'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cluster Topology</span>
                </button>

                <button
                  onClick={() => setConsoleTab('terminal')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg font-medium transition border-t border-x ${
                    consoleTab === 'terminal'
                      ? 'bg-[#0d1117] border-slate-800 text-emerald-300 border-b-transparent shadow-sm'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SRE Terminal</span>
                </button>

                <button
                  onClick={() => setConsoleTab('grader')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg font-medium transition border-t border-x ${
                    consoleTab === 'grader'
                      ? 'bg-[#0d1117] border-slate-800 text-indigo-300 border-b-transparent shadow-sm'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Test Results</span>
                  {gradeSummary.status !== 'idle' && (
                    <span className={`text-[10px] font-mono px-1.5 rounded-full ${
                      gradeSummary.status === 'passed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {gradeSummary.passed}/{gradeSummary.total}
                    </span>
                  )}
                </button>
              </div>

              <div className="text-[10px] font-mono text-slate-500 pb-1 hidden sm:block">
                <span>Press 'Run' to test or 'Submit' to deploy</span>
              </div>
            </div>

            {/* Console Content Area */}
            <div className="flex-1 min-h-0 overflow-hidden">
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
