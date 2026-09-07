import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IncidentBriefing } from '../challenge/IncidentBriefing';
import { OpsEditor } from '../editor/OpsEditor';
import { OpsTerminal } from '../terminal/OpsTerminal';
import { ClusterVisualizer } from '../cluster/ClusterVisualizer';
import { GraderPanel } from '../runner/GraderPanel';
import { PostMortemModal } from '../challenge/PostMortemModal';
import { useOps } from '../../context/OpsContext';
import { 
  FileText, 
  Code2, 
  Layers, 
  Terminal as TerminalIcon, 
  CheckCircle2, 
  ChevronUp, 
  ChevronDown,
  GripVertical,
  GripHorizontal
} from 'lucide-react';

export const OpsWorkspace: React.FC = () => {
  const { gradeSummary } = useOps();
  const [consoleTab, setConsoleTab] = useState<'cluster' | 'terminal' | 'grader'>('cluster');
  const [mobileTab, setMobileTab] = useState<'briefing' | 'editor' | 'console'>('editor');
  
  // Resizable state
  const [leftPercent, setLeftPercent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('opsforge_split_left');
      return saved ? parseFloat(saved) : 44;
    } catch {
      return 44;
    }
  });

  const [bottomHeight, setBottomHeight] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('opsforge_split_bottom');
      return saved ? parseInt(saved, 10) : 260;
    } catch {
      return 260;
    }
  });

  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  // Automatically switch to grader test result tab when user runs tests or submits
  useEffect(() => {
    if (gradeSummary.status !== 'idle') {
      setConsoleTab('grader');
      if (isConsoleCollapsed) {
        setIsConsoleCollapsed(false);
      }
    }
  }, [gradeSummary.status]);

  // Vertical Resize Handler (Left vs Right)
  const handleVerticalResize = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(20, Math.min(75, newPercent));
    setLeftPercent(clamped);
    try {
      localStorage.setItem('opsforge_split_left', String(clamped));
    } catch {}
  }, []);

  const stopVerticalResize = useCallback(() => {
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', handleVerticalResize);
    window.removeEventListener('mouseup', stopVerticalResize);
  }, [handleVerticalResize]);

  const startVerticalResize = (e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleVerticalResize);
    window.addEventListener('mouseup', stopVerticalResize);
  };

  // Horizontal Resize Handler (Editor vs Console)
  const handleHorizontalResize = useCallback((e: MouseEvent) => {
    if (!rightColRef.current) return;
    const rect = rightColRef.current.getBoundingClientRect();
    const newHeight = rect.bottom - e.clientY;
    const clamped = Math.max(120, Math.min(rect.height - 120, newHeight));
    setBottomHeight(clamped);
    if (isConsoleCollapsed) {
      setIsConsoleCollapsed(false);
    }
    try {
      localStorage.setItem('opsforge_split_bottom', String(clamped));
    } catch {}
  }, [isConsoleCollapsed]);

  const stopHorizontalResize = useCallback(() => {
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', handleHorizontalResize);
    window.removeEventListener('mouseup', stopHorizontalResize);
  }, [handleHorizontalResize]);

  const startHorizontalResize = (e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleHorizontalResize);
    window.addEventListener('mouseup', stopHorizontalResize);
  };

  return (
    <main className="flex-1 min-h-0 w-full p-2 overflow-hidden flex flex-col bg-[#1a1a1a]">
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

      {/* Main Resizable Workspace Container */}
      <div 
        ref={containerRef}
        className="flex-1 min-h-0 flex overflow-hidden relative"
      >
        {/* Left Column: Problem Briefing */}
        <div 
          style={{ width: `${leftPercent}%` }}
          className={`h-full min-h-0 ${mobileTab === 'briefing' ? 'w-full block' : 'hidden lg:block'}`}
        >
          <IncidentBriefing />
        </div>

        {/* Vertical Drag Handle Splitter (LeetCode Desktop Style) */}
        <div
          onMouseDown={startVerticalResize}
          className="hidden lg:flex w-2 shrink-0 items-center justify-center cursor-col-resize group relative z-30 select-none hover:bg-[#383838]/40 transition"
          title="Drag to resize panels"
        >
          <div className="w-[3px] h-10 rounded-full bg-[#3a3a3a] group-hover:bg-[#ffa116] transition flex items-center justify-center">
            <GripVertical className="w-2.5 h-2.5 text-zinc-500 opacity-0 group-hover:opacity-100" />
          </div>
        </div>

        {/* Right Column: Code Editor + Resizable Console */}
        <div 
          ref={rightColRef}
          style={{ width: `${100 - leftPercent}%` }}
          className={`h-full min-h-0 flex flex-col ${
            mobileTab === 'briefing' ? 'hidden lg:flex' : 'w-full flex'
          }`}
        >
          {/* Top: Multi-file Editor */}
          <div className={`flex-1 min-h-0 ${mobileTab === 'console' ? 'hidden lg:block' : 'block'}`}>
            <OpsEditor />
          </div>

          {/* Horizontal Drag Handle Splitter */}
          {!isConsoleCollapsed && (
            <div
              onMouseDown={startHorizontalResize}
              className="h-2 shrink-0 flex items-center justify-center cursor-row-resize group relative z-30 select-none hover:bg-[#383838]/40 transition"
              title="Drag to resize console"
            >
              <div className="h-[3px] w-12 rounded-full bg-[#3a3a3a] group-hover:bg-[#ffa116] transition flex items-center justify-center">
                <GripHorizontal className="w-2.5 h-2.5 text-zinc-500 opacity-0 group-hover:opacity-100" />
              </div>
            </div>
          )}

          {/* Bottom: Console Panel with Tabs (Testcase | Terminal | Test Result) */}
          <div 
            style={{ height: isConsoleCollapsed ? '36px' : `${bottomHeight}px` }}
            className={`shrink-0 flex flex-col rounded-lg border border-[#383838] bg-[#262626] overflow-hidden shadow-sm transition-[height] duration-150 ${
              mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Console Tabs Header (LeetCode Style) */}
            <div className="flex items-center justify-between px-3 h-9 shrink-0 border-b border-[#383838] bg-[#262626] text-xs select-none">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setConsoleTab('cluster');
                    if (isConsoleCollapsed) setIsConsoleCollapsed(false);
                  }}
                  className={`flex items-center gap-1.5 h-9 text-xs font-medium transition border-b-2 ${
                    consoleTab === 'cluster'
                      ? 'border-white text-white font-semibold'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Testcase & Topology</span>
                </button>

                <button
                  onClick={() => {
                    setConsoleTab('terminal');
                    if (isConsoleCollapsed) setIsConsoleCollapsed(false);
                  }}
                  className={`flex items-center gap-1.5 h-9 text-xs font-medium transition border-b-2 ${
                    consoleTab === 'terminal'
                      ? 'border-white text-white font-semibold'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <TerminalIcon className="w-3.5 h-3.5" />
                  <span>Terminal</span>
                </button>

                <button
                  onClick={() => {
                    setConsoleTab('grader');
                    if (isConsoleCollapsed) setIsConsoleCollapsed(false);
                  }}
                  className={`flex items-center gap-1.5 h-9 text-xs font-medium transition border-b-2 ${
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

              {/* Console Toggle Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#333333] transition flex items-center gap-1 text-[11px]"
                  title={isConsoleCollapsed ? "Expand Console" : "Collapse Console"}
                >
                  <span className="hidden sm:inline">Console</span>
                  {isConsoleCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Console Content Area */}
            {!isConsoleCollapsed && (
              <div className="flex-1 min-h-0 overflow-hidden bg-[#1e1e1e]">
                {consoleTab === 'cluster' && <ClusterVisualizer />}
                {consoleTab === 'terminal' && <OpsTerminal />}
                {consoleTab === 'grader' && <GraderPanel />}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Mortem RCA Modal */}
      <PostMortemModal />
    </main>
  );
};
