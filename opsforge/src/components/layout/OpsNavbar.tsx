import React, { useState } from 'react';
import { useOps } from '../../context/OpsContext';
import { TRACK_INFO } from '../../data/catalog';
import { OpsTrack } from '../../types/ops';
import { 
  Terminal, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Rocket, 
  BookOpen, 
  RotateCcw,
  ChevronDown,
  Clock,
  Flame
} from 'lucide-react';

export const OpsNavbar: React.FC = () => {
  const {
    challenges,
    currentChallenge,
    selectChallenge,
    activeTrackFilter,
    setActiveTrackFilter,
    runDiagnostics,
    deployFix,
    gradeSummary,
    solvedChallengeIds,
    slaSeconds,
    resetFiles,
    setShowPostMortem
  } = useOps();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isSolved = solvedChallengeIds.includes(currentChallenge.id);
  const filteredChallenges = activeTrackFilter === 'all'
    ? challenges
    : challenges.filter(c => c.track === activeTrackFilter);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'SEV-1':
        return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
      case 'SEV-2':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  return (
    <header className="glass-header sticky top-0 z-40 px-4 py-2.5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/90">
      {/* Brand & Incident Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-base bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                OPSFORGE
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                SRE-LEETCODE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block"></span>
              CLUSTER UPTIME: 99.992%
            </p>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

        {/* Incident Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-sm font-medium text-slate-200 transition"
          >
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getSeverityBadge(currentChallenge.severity)}`}>
              {currentChallenge.severity}
            </span>
            <span className="max-w-[200px] truncate">{currentChallenge.title}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-96 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
                Active Production Outages ({challenges.length})
              </div>
              <div className="max-h-80 overflow-y-auto space-y-1">
                {challenges.map(c => {
                  const solved = solvedChallengeIds.includes(c.id);
                  const isCurrent = c.id === currentChallenge.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        selectChallenge(c.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between transition ${
                        isCurrent
                          ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-200'
                          : 'hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getSeverityBadge(c.severity)}`}>
                          {c.severity}
                        </span>
                        <div className="truncate">
                          <p className="font-semibold text-slate-100">{c.title}</p>
                          <p className="text-[10px] text-slate-400">{c.serviceName} • {c.difficulty}</p>
                        </div>
                      </div>
                      {solved ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">{c.estimatedTimeMin}m</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Track Filter Pills (Desktop) */}
      <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800/70">
        <button
          onClick={() => setActiveTrackFilter('all')}
          className={`px-2.5 py-1 rounded text-xs font-medium transition ${
            activeTrackFilter === 'all'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Scenarios
        </button>
        {(Object.keys(TRACK_INFO) as OpsTrack[]).map(trackKey => {
          const info = TRACK_INFO[trackKey];
          const isSelected = activeTrackFilter === trackKey;
          return (
            <button
              key={trackKey}
              onClick={() => setActiveTrackFilter(trackKey)}
              className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition ${
                isSelected
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{info.icon}</span>
              <span>{info.label}</span>
            </button>
          );
        })}
      </div>

      {/* Actions & SLA Timer */}
      <div className="flex items-center gap-3">
        {/* SLA Timer */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs">
          <Clock className={`w-3.5 h-3.5 ${slaSeconds < 180 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
          <span className="text-slate-400 text-[10px]">SLA:</span>
          <span className={`font-bold ${slaSeconds < 180 ? 'text-red-400' : 'text-slate-200'}`}>
            {formatTimer(slaSeconds)}
          </span>
        </div>

        {/* Post-Mortem Reference Button */}
        <button
          onClick={() => setShowPostMortem(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 transition"
          title="View Root Cause Analysis & Reference Solution"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">RCA / Solution</span>
        </button>

        {/* Reset Starter Files */}
        <button
          onClick={resetFiles}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition"
          title="Reset files to initial broken state"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Run Diagnostics (Test) */}
        <button
          onClick={runDiagnostics}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 shadow transition"
        >
          <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Run Tests</span>
        </button>

        {/* Deploy Fix (Submit) */}
        <button
          onClick={deployFix}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-lg ${
            isSolved
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              : 'bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-extrabold shadow-cyan-500/20'
          }`}
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>{isSolved ? 'Resolved ✅' : 'Deploy Fix'}</span>
        </button>
      </div>
    </header>
  );
};
