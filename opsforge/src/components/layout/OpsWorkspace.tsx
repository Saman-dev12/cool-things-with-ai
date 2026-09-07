import React, { useState } from 'react';
import { IncidentBriefing } from '../challenge/IncidentBriefing';
import { OpsEditor } from '../editor/OpsEditor';
import { OpsTerminal } from '../terminal/OpsTerminal';
import { ClusterVisualizer } from '../cluster/ClusterVisualizer';
import { GraderPanel } from '../runner/GraderPanel';
import { PostMortemModal } from '../challenge/PostMortemModal';
import { FileText, Code2, Layers } from 'lucide-react';

export const OpsWorkspace: React.FC = () => {
  const [mobileTab, setMobileTab] = useState<'briefing' | 'editor' | 'cluster'>('editor');

  return (
    <main className="flex-1 p-3 overflow-hidden flex flex-col h-[calc(100vh-57px)]">
      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden items-center justify-around bg-slate-900 border border-slate-800 rounded-lg p-1 mb-2 shrink-0">
        <button
          onClick={() => setMobileTab('briefing')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            mobileTab === 'briefing' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Incident</span>
        </button>
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            mobileTab === 'editor' ? 'bg-slate-800 text-emerald-300' : 'text-slate-400'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Code & Shell</span>
        </button>
        <button
          onClick={() => setMobileTab('cluster')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            mobileTab === 'cluster' ? 'bg-slate-800 text-indigo-300' : 'text-slate-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Cluster & Tests</span>
        </button>
      </div>

      {/* Desktop 3-Column Split View */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Left Column: Incident Briefing (3 Cols) */}
        <div className={`md:col-span-3 h-full min-h-0 ${mobileTab === 'briefing' ? 'block' : 'hidden md:block'}`}>
          <IncidentBriefing />
        </div>

        {/* Center Column: Code Editor + Terminal (5 Cols) */}
        <div className={`md:col-span-5 h-full min-h-0 flex flex-col gap-3 ${mobileTab === 'editor' ? 'flex' : 'hidden md:flex'}`}>
          <div className="flex-1 min-h-0">
            <OpsEditor />
          </div>
          <div className="h-56 min-h-[180px] shrink-0">
            <OpsTerminal />
          </div>
        </div>

        {/* Right Column: Cluster Visualizer + Grader (4 Cols) */}
        <div className={`md:col-span-4 h-full min-h-0 flex flex-col gap-3 ${mobileTab === 'cluster' ? 'flex' : 'hidden md:flex'}`}>
          <div className="flex-1 min-h-0">
            <ClusterVisualizer />
          </div>
          <div className="h-64 min-h-[220px] shrink-0">
            <GraderPanel />
          </div>
        </div>
      </div>

      {/* Post Mortem Modal */}
      <PostMortemModal />
    </main>
  );
};
