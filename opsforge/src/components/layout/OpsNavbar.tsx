import React, { useState } from 'react';
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
  Palette, 
  Check,
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
    theme,
    setTheme
  } = useOps();

  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isSolved = solvedChallengeIds.includes(currentChallenge.id);

  const currentIdx = allProblems.findIndex(p => p.id === currentChallenge.id);
  const prevProblem = currentIdx > 0 ? allProblems[currentIdx - 1] : null;
  const nextProblem = currentIdx < allProblems.length - 1 ? allProblems[currentIdx + 1] : null;

  const themesList = [
    { id: 'leetcode', name: 'LeetCode Dark', desc: 'Official Carbon', color: '#ffa116' },
    { id: 'linear', name: 'Linear Titanium', desc: 'Neutral Charcoal', color: '#e4e4e7' },
    { id: 'vercel', name: 'Vercel Black', desc: 'Pitch Black', color: '#ffffff' },
    { id: 'github', name: 'GitHub Dimmed', desc: 'Developer Slate', color: '#539bf5' }
  ] as const;

  return (
    <header className="h-12 shrink-0 z-40 px-4 border-b border-[#333333] bg-[#262626] flex items-center justify-between text-xs select-none">
      {/* Left: Brand & Nav Links */}
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

        {/* LeetCode Global Tabs */}
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

        {/* In-Workspace Navigation Breadcrumbs */}
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

            <span className="font-medium text-[#eff1f6] truncate max-w-[260px]">
              {currentIdx + 1}. {currentChallenge.title}
            </span>
          </div>
        )}
      </div>

      {/* Right: Actions, Timer, Profile */}
      <div className="flex items-center gap-2.5">
        {viewMode === 'workspace' && (
          <>
            {/* SLA / Stopwatch Timer */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded bg-[#1e1e1e] border border-[#333333] font-mono text-[11px] text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{formatTimer(slaSeconds)}</span>
            </div>

            {/* Editorial / Solution */}
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
              title="Reset starter code"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Run Button (LeetCode Gray Button) */}
            <button
              onClick={runDiagnostics}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#333333] hover:bg-[#3d3d3d] border border-[#444] font-medium text-[#eff1f6] transition"
            >
              <Play className="w-3 h-3 text-zinc-300 fill-zinc-300" />
              <span>Run</span>
            </button>

            {/* Submit Button (LeetCode Green Button) */}
            <button
              onClick={deployFix}
              className="flex items-center gap-1.5 px-3.5 py-1 rounded font-semibold text-white transition shadow-sm bg-[#00b8a3] hover:bg-[#00a390]"
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
          </>
        )}

        {/* Theme Palette Switcher */}
        <div className="relative">
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="p-1.5 rounded hover:bg-[#333333] text-zinc-400 hover:text-white transition"
            title="Theme Palette"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {themeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[#262626] border border-[#383838] shadow-2xl p-1.5 z-50">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                Theme
              </div>
              <div className="space-y-0.5">
                {themesList.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id as any);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition ${
                      theme === t.id
                        ? 'bg-[#333333] text-white font-medium'
                        : 'text-zinc-400 hover:bg-[#2e2e2e] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                      <span>{t.name}</span>
                    </div>
                    {theme === t.id && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

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
