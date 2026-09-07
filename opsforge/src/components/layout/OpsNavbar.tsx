import React from 'react';
import { useOps } from '../../context/OpsContext';
import { 
  Terminal, 
  Flame, 
  Play, 
  Rocket, 
  ChevronLeft, 
  ChevronRight, 
  Dices,
  BookOpen,
  LayoutGrid,
  RotateCcw,
  Clock
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
    pickRandomProblem
  } = useOps();

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isSolved = solvedChallengeIds.includes(currentChallenge.id);

  // Find index of current problem in list for prev/next
  const currentIdx = allProblems.findIndex(p => p.id === currentChallenge.id);
  const prevProblem = currentIdx > 0 ? allProblems[currentIdx - 1] : null;
  const nextProblem = currentIdx < allProblems.length - 1 ? allProblems[currentIdx + 1] : null;

  return (
    <header className="h-12 shrink-0 z-40 px-4 border-b border-slate-800/90 bg-[#090d16]/95 backdrop-blur-md flex items-center justify-between text-xs">
      {/* Left: Brand & Navigation Links */}
      <div className="flex items-center gap-5">
        {/* Brand */}
        <div 
          onClick={() => setViewMode('problemset')}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 transition shadow-sm">
            <Terminal className="w-4 h-4" />
          </div>
          <span className="font-extrabold tracking-wider text-sm bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
            OPSFORGE
          </span>
        </div>

        {/* Global Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('problemset')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              viewMode === 'problemset'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
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
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              viewMode === 'workspace'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Workspace
          </button>
        </div>

        {/* Workspace Breadcrumbs & Prev/Next (Shown when solving) */}
        {viewMode === 'workspace' && (
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800 text-slate-400">
            <button
              onClick={() => setViewMode('problemset')}
              className="hover:text-cyan-300 transition flex items-center gap-1 text-[11px]"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Problem List</span>
            </button>

            <div className="flex items-center gap-0.5">
              <button
                disabled={!prevProblem}
                onClick={() => prevProblem && selectChallenge(prevProblem.id)}
                className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 transition"
                title={prevProblem?.title}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={!nextProblem}
                onClick={() => nextProblem && selectChallenge(nextProblem.id)}
                className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 transition"
                title={nextProblem?.title}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={pickRandomProblem}
                className="p-1 rounded hover:bg-slate-800 transition text-slate-400 hover:text-cyan-300"
                title="Shuffle Random Problem"
              >
                <Dices className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="font-semibold text-slate-200 truncate max-w-[220px]">
              {currentIdx + 1}. {currentChallenge.title}
            </span>
          </div>
        )}
      </div>

      {/* Right: Actions, Run/Submit & Profile */}
      <div className="flex items-center gap-3">
        {viewMode === 'workspace' && (
          <>
            {/* SLA Timer */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 font-mono text-[11px]">
              <Clock className={`w-3.5 h-3.5 ${slaSeconds < 180 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="text-slate-500">SLA:</span>
              <span className={`font-bold ${slaSeconds < 180 ? 'text-red-400' : 'text-slate-200'}`}>
                {formatTimer(slaSeconds)}
              </span>
            </div>

            {/* RCA / Solution */}
            <button
              onClick={() => setShowPostMortem(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Editorial</span>
            </button>

            {/* Reset */}
            <button
              onClick={resetFiles}
              className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
              title="Reset starter files"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Run Tests (Diagnostics) */}
            <button
              onClick={runDiagnostics}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-slate-200 shadow transition"
            >
              <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Run</span>
            </button>

            {/* Deploy Fix (Submit) */}
            <button
              onClick={deployFix}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition shadow-lg ${
                isSolved
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>{isSolved ? 'Resolved' : 'Submit'}</span>
            </button>
          </>
        )}

        {/* Global Streak & Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="flex items-center gap-1 font-mono text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>3</span>
          </div>

          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs select-none border border-cyan-400/40">
            S
          </div>
        </div>
      </div>
    </header>
  );
};
