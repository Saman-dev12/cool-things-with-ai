import React, { useState, useEffect } from 'react';
import { useOps } from '../../context/OpsContext';
import { 
  Code2, 
  Flame, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Dices,
  BookOpen, 
  RotateCcw, 
  Clock, 
  Settings, 
  Maximize2,
  Minimize2,
  CheckCircle2,
  Send
} from 'lucide-react';

export const OpsNavbar: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    allProblems,
    currentChallenge,
    selectChallenge,
    runDiagnostics,
    deployFix,
    solvedChallengeIds,
    slaSeconds,
    resetFiles,
    setShowPostMortem,
    pickRandomProblem,
    setShowSettingsModal
  } = useOps();

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Global Keyboard Shortcuts (Ctrl + Enter = Submit, Ctrl + ' = Run)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        deployFix();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "'") {
        e.preventDefault();
        runDiagnostics();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [deployFix, runDiagnostics]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isSolved = solvedChallengeIds.includes(currentChallenge.id);

  const currentIdx = allProblems.findIndex(p => p.id === currentChallenge.id);
  const prevProblem = currentIdx > 0 ? allProblems[currentIdx - 1] : null;
  const nextProblem = currentIdx < allProblems.length - 1 ? allProblems[currentIdx + 1] : null;

  return (
    <header className="h-12 shrink-0 z-40 px-4 border-b border-[#383838] bg-[#262626] flex items-center justify-between text-xs select-none shadow-sm">
      {/* Left: Brand & Navigation */}
      <div className="flex items-center gap-6">
        {/* LeetCode-style Brand */}
        <div 
          onClick={() => setViewMode('problemset')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-6 h-6 rounded bg-[#ffa116]/20 border border-[#ffa116]/40 flex items-center justify-center text-[#ffa116]">
            <Code2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-[#eff1f6]">
              OpsForge
            </span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-[#333333] text-[#ffa116] font-mono font-bold">
              SRE
            </span>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('problemset')}
            className={`px-3 py-1 rounded text-xs font-medium transition ${
              viewMode === 'problemset'
                ? 'text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Problems
          </button>
          <button
            onClick={() => {
              if (viewMode !== 'workspace') {
                selectChallenge(allProblems[0].id);
              }
            }}
            className={`px-3 py-1 rounded text-xs font-medium transition ${
              viewMode === 'workspace'
                ? 'text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Workspace
          </button>
        </nav>

        {/* In-Workspace Breadcrumb Navigation */}
        {viewMode === 'workspace' && (
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#3a3a3a] text-zinc-400">
            <button
              onClick={() => setViewMode('problemset')}
              className="hover:text-white transition flex items-center gap-1 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Problem List</span>
            </button>

            <div className="flex items-center gap-0.5 ml-1">
              <button
                disabled={!prevProblem}
                onClick={() => prevProblem && selectChallenge(prevProblem.id)}
                className="p-1 rounded hover:bg-[#333333] disabled:opacity-30 transition"
                title={prevProblem?.title}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={!nextProblem}
                onClick={() => nextProblem && selectChallenge(nextProblem.id)}
                className="p-1 rounded hover:bg-[#333333] disabled:opacity-30 transition"
                title={nextProblem?.title}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={pickRandomProblem}
                className="p-1 rounded hover:bg-[#333333] transition text-zinc-400 hover:text-white"
                title="Shuffle Random Problem"
              >
                <Dices className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="font-medium text-[#eff1f6] truncate max-w-[240px]">
              {currentIdx + 1}. {currentChallenge.title}
            </span>
          </div>
        )}
      </div>

      {/* Center / Right: Run & Submit & Actions */}
      <div className="flex items-center gap-2.5">
        {viewMode === 'workspace' && (
          <>
            {/* Run Button (LeetCode Gray Button) */}
            <button
              onClick={runDiagnostics}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#333333] hover:bg-[#3d3d3d] border border-[#444] font-medium text-[#eff1f6] transition"
              title="Run Code (Ctrl + ')"
            >
              <Play className="w-3 h-3 text-zinc-300 fill-zinc-300" />
              <span>Run</span>
            </button>

            {/* Submit Button (LeetCode Green Button) */}
            <button
              onClick={deployFix}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-semibold text-white transition shadow-sm bg-[#00b8a3] hover:bg-[#00a390]"
              title="Submit Solution (Ctrl + Enter)"
            >
              {isSolved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Solved</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit</span>
                </>
              )}
            </button>

            {/* Stopwatch Timer */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded bg-[#1e1e1e] border border-[#333333] font-mono text-[11px] text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{formatTimer(slaSeconds)}</span>
            </div>

            {/* Editorial Button */}
            <button
              onClick={() => setShowPostMortem(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#333333] hover:bg-[#3d3d3d] border border-[#444] text-zinc-300 hover:text-white transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#ffa116]" />
              <span>Editorial</span>
            </button>

            {/* Reset */}
            <button
              onClick={resetFiles}
              className="p-1.5 rounded bg-[#333333] hover:bg-[#3d3d3d] border border-[#444] text-zinc-400 hover:text-white transition"
              title="Reset starter files"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* Settings Gear Icon (LeetCode Style) */}
        <button
          onClick={() => setShowSettingsModal(true)}
          className="p-1.5 rounded hover:bg-[#333333] text-zinc-400 hover:text-white transition"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded hover:bg-[#333333] text-zinc-400 hover:text-white transition hidden sm:block"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Streak Counter */}
        <div className="flex items-center gap-1 font-mono text-[#ffa116] font-bold px-2 py-0.5 rounded bg-[#ffa116]/10 border border-[#ffa116]/20 text-[11px]">
          <Flame className="w-3 h-3 fill-[#ffa116]" />
          <span>3</span>
        </div>

        {/* User Profile Avatar */}
        <div className="w-6 h-6 rounded-full bg-[#383838] border border-[#484848] flex items-center justify-center text-zinc-300 font-bold text-[10px] select-none">
          S
        </div>
      </div>
    </header>
  );
};
