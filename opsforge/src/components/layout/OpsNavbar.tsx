import React, { useState } from 'react';
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
  Clock,
  Palette,
  Check
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
    { id: 'linear', name: 'Linear Titanium', desc: 'Deep Neutral Zinc', color: '#e4e4e7' },
    { id: 'vercel', name: 'Vercel Black', desc: 'Pure Monochrome', color: '#ffffff' },
    { id: 'github', name: 'GitHub Dimmed', desc: 'Classic Developer', color: '#539bf5' },
    { id: 'supabase', name: 'Supabase Emerald', desc: 'Carbon & Mint', color: '#10b981' }
  ] as const;

  return (
    <header className="h-12 shrink-0 z-40 px-4 border-b border-white/[0.08] bg-[var(--bg-panel)] flex items-center justify-between text-xs select-none">
      {/* Left: Brand & Navigation Links */}
      <div className="flex items-center gap-5">
        {/* Brand */}
        <div 
          onClick={() => setViewMode('problemset')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="h-7 w-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent-light)] group-hover:border-[var(--accent)] transition shadow-sm">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold tracking-wider text-sm text-[var(--text-primary)]">
            OPSFORGE
          </span>
        </div>

        {/* Global Nav Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('problemset')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              viewMode === 'problemset'
                ? 'bg-white/10 text-white font-semibold shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04]'
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
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              viewMode === 'workspace'
                ? 'bg-white/10 text-white font-semibold shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Workspace
          </button>
        </div>

        {/* Workspace Breadcrumbs (Shown when solving) */}
        {viewMode === 'workspace' && (
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/[0.08] text-[var(--text-secondary)]">
            <button
              onClick={() => setViewMode('problemset')}
              className="hover:text-white transition flex items-center gap-1 text-[11px]"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Problem List</span>
            </button>

            <div className="flex items-center gap-0.5">
              <button
                disabled={!prevProblem}
                onClick={() => prevProblem && selectChallenge(prevProblem.id)}
                className="p-1 rounded hover:bg-white/[0.08] disabled:opacity-30 transition"
                title={prevProblem?.title}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={!nextProblem}
                onClick={() => nextProblem && selectChallenge(nextProblem.id)}
                className="p-1 rounded hover:bg-white/[0.08] disabled:opacity-30 transition"
                title={nextProblem?.title}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={pickRandomProblem}
                className="p-1 rounded hover:bg-white/[0.08] transition text-[var(--text-secondary)] hover:text-white"
                title="Shuffle Random Problem"
              >
                <Dices className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="font-semibold text-[var(--text-primary)] truncate max-w-[220px]">
              {currentIdx + 1}. {currentChallenge.title}
            </span>
          </div>
        )}
      </div>

      {/* Right: Actions, Theme Switcher & Profile */}
      <div className="flex items-center gap-2.5">
        {viewMode === 'workspace' && (
          <>
            {/* SLA Timer */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-card)] border border-white/[0.06] font-mono text-[11px]">
              <Clock className={`w-3.5 h-3.5 ${slaSeconds < 180 ? 'text-red-400 animate-pulse' : 'text-[var(--text-muted)]'}`} />
              <span className="text-[var(--text-muted)]">SLA:</span>
              <span className={`font-bold ${slaSeconds < 180 ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                {formatTimer(slaSeconds)}
              </span>
            </div>

            {/* RCA / Solution */}
            <button
              onClick={() => setShowPostMortem(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-card)] hover:bg-white/[0.08] border border-white/[0.08] text-[var(--text-secondary)] hover:text-white transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Editorial</span>
            </button>

            {/* Reset */}
            <button
              onClick={resetFiles}
              className="p-1.5 rounded-md bg-[var(--bg-card)] hover:bg-white/[0.08] border border-white/[0.08] text-[var(--text-secondary)] hover:text-white transition"
              title="Reset starter files"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Run Tests (Diagnostics) */}
            <button
              onClick={runDiagnostics}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] font-semibold text-[var(--text-primary)] transition"
            >
              <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Run</span>
            </button>

            {/* Deploy Fix (Submit) */}
            <button
              onClick={deployFix}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-bold transition shadow-sm ${
                isSolved
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-white hover:bg-zinc-200 text-black font-semibold'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>{isSolved ? 'Resolved' : 'Submit'}</span>
            </button>
          </>
        )}

        {/* Theme Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="p-1.5 rounded-md hover:bg-white/[0.08] text-[var(--text-secondary)] hover:text-white transition"
            title="Change Theme Palette"
          >
            <Palette className="w-4 h-4" />
          </button>

          {themeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[var(--bg-panel)] border border-white/[0.12] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                Color Palette
              </div>
              <div className="space-y-0.5">
                {themesList.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition ${
                      theme === t.id
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-[var(--text-secondary)] hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                      <div className="text-left">
                        <div className="leading-tight">{t.name}</div>
                        <div className="text-[10px] opacity-60 leading-tight">{t.desc}</div>
                      </div>
                    </div>
                    {theme === t.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-1 font-mono text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
          <Flame className="w-3.5 h-3.5 fill-amber-400" />
          <span>3</span>
        </div>

        {/* User Avatar */}
        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-200 font-bold text-[11px] select-none">
          S
        </div>
      </div>
    </header>
  );
};
