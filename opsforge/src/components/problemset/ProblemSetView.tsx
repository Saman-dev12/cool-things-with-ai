import React, { useState, useMemo } from 'react';
import { useOps } from '../../context/OpsContext';
import { TRACK_INFO } from '../../data/catalog';
import { OpsTrack, Difficulty } from '../../types/ops';
import { 
  Search, 
  Dices, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Layers, 
  ArrowRight,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export const ProblemSetView: React.FC = () => {
  const {
    allProblems,
    selectChallenge,
    activeTrackFilter,
    setActiveTrackFilter,
    difficultyFilter,
    setDifficultyFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    pickRandomProblem,
    solvedChallengeIds,
    solvedStats
  } = useOps();

  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Filter problems
  const filteredProblems = useMemo(() => {
    return allProblems.filter(p => {
      if (activeTrackFilter !== 'all' && p.track !== activeTrackFilter) return false;
      if (difficultyFilter !== 'all' && p.difficulty !== difficultyFilter) return false;
      const isSolved = solvedChallengeIds.includes(p.id);
      if (statusFilter === 'solved' && !isSolved) return false;
      if (statusFilter === 'todo' && isSolved) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesTag = p.tags.some(t => t.toLowerCase().includes(query));
        const matchesService = p.serviceName.toLowerCase().includes(query);
        const matchesNum = String(p.number) === query;
        if (!matchesTitle && !matchesTag && !matchesService && !matchesNum) return false;
      }
      return true;
    });
  }, [allProblems, activeTrackFilter, difficultyFilter, statusFilter, searchQuery, solvedChallengeIds]);

  const totalPages = Math.ceil(filteredProblems.length / pageSize) || 1;
  const paginatedProblems = filteredProblems.slice((page - 1) * pageSize, page * pageSize);

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case 'Beginner':
        return <span className="text-[#10b981] font-semibold text-xs">Easy</span>;
      case 'Intermediate':
        return <span className="text-[#f59e0b] font-semibold text-xs">Medium</span>;
      case 'Staff SRE':
        return <span className="text-[#f43f5e] font-semibold text-xs">Hard</span>;
    }
  };

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Top Hero & Study Plans Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Main Featured Study Plan Banner (8 Cols) */}
          <div className="lg:col-span-8 rounded-xl bg-[var(--bg-card)] border border-white/[0.08] p-6 flex flex-col justify-between relative overflow-hidden shadow-sm">
            <div className="relative z-10 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--accent-bg)] border border-[var(--accent)]/30 text-[var(--accent-light)]">
                  FEATURED TRACK
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Most Popular for SRE Interviews
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white">
                DevOps 75: Production Incident Mastery
              </h1>
              <p className="text-xs text-[var(--text-secondary)] max-w-xl leading-relaxed">
                Triage and remediate 100+ real-world production outages, broken Kubernetes pods, Docker builds, Linux kernel inode leaks, Terraform cycles, and PromQL P99 alerting.
              </p>
            </div>

            <div className="relative z-10 pt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => selectChallenge('k8s-crashloop-oom')}
                className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs shadow-sm flex items-center gap-1.5 transition"
              >
                <span>Start Practicing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={pickRandomProblem}
                className="px-3.5 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-[var(--text-primary)] font-medium text-xs flex items-center gap-1.5 transition"
              >
                <Dices className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>Shuffle Incident</span>
              </button>
            </div>
          </div>

          {/* User Stats Card (4 Cols) */}
          <div className="lg:col-span-4 rounded-xl bg-[var(--bg-card)] border border-white/[0.08] p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <div className="font-semibold text-xs text-white">Your Progress</div>
                <div className="text-[11px] text-[var(--text-muted)] font-mono">SRE Candidate</div>
              </div>

              <div className="flex items-center gap-1 text-amber-400 font-mono font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <Flame className="w-3 h-3 fill-amber-400" />
                <span>3 Days</span>
              </div>
            </div>

            {/* Stats Breakdown */}
            <div className="py-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Total Solved:</span>
                <span className="font-mono font-bold text-white">
                  {solvedStats.solvedCount} / {solvedStats.total}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden flex">
                <div 
                  className="bg-[#10b981] h-full transition-all duration-500" 
                  style={{ width: `${(solvedStats.easySolved / solvedStats.total) * 100}%` }}
                />
                <div 
                  className="bg-[#f59e0b] h-full transition-all duration-500" 
                  style={{ width: `${(solvedStats.medSolved / solvedStats.total) * 100}%` }}
                />
                <div 
                  className="bg-[#f43f5e] h-full transition-all duration-500" 
                  style={{ width: `${(solvedStats.hardSolved / solvedStats.total) * 100}%` }}
                />
              </div>

              {/* Difficulty breakdown rows */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[11px] font-mono">
                <div className="bg-white/[0.03] p-1.5 rounded border border-white/[0.05]">
                  <div className="text-[#10b981] font-semibold">Easy</div>
                  <div className="text-[var(--text-secondary)] mt-0.5 font-bold">
                    {solvedStats.easySolved}/{solvedStats.easyTotal}
                  </div>
                </div>
                <div className="bg-white/[0.03] p-1.5 rounded border border-white/[0.05]">
                  <div className="text-[#f59e0b] font-semibold">Medium</div>
                  <div className="text-[var(--text-secondary)] mt-0.5 font-bold">
                    {solvedStats.medSolved}/{solvedStats.medTotal}
                  </div>
                </div>
                <div className="bg-white/[0.03] p-1.5 rounded border border-white/[0.05]">
                  <div className="text-[#f43f5e] font-semibold">Hard</div>
                  <div className="text-[var(--text-secondary)] mt-0.5 font-bold">
                    {solvedStats.hardSolved}/{solvedStats.hardTotal}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] text-[11px] text-[var(--text-muted)] flex items-center justify-between font-mono">
              <span>Acceptance:</span>
              <span className="text-emerald-400 font-bold">54.8%</span>
            </div>
          </div>
        </div>

        {/* Tracks Carousel */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span>Specialization Tracks</span>
            </h2>
            <button
              onClick={() => setActiveTrackFilter('all')}
              className="text-xs text-[var(--text-secondary)] hover:text-white transition font-medium"
            >
              Reset Filters &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {(Object.keys(TRACK_INFO) as OpsTrack[]).map(trackKey => {
              const info = TRACK_INFO[trackKey];
              const isSelected = activeTrackFilter === trackKey;
              const count = allProblems.filter(p => p.track === trackKey).length;
              return (
                <button
                  key={trackKey}
                  onClick={() => {
                    setActiveTrackFilter(isSelected ? 'all' : trackKey);
                    setPage(1);
                  }}
                  className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white/10 border-white/20 text-white shadow-sm'
                      : 'bg-[var(--bg-card)] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.03] text-[var(--text-secondary)]'
                  }`}
                >
                  <div className="text-xl mb-1.5">{info.icon}</div>
                  <div>
                    <div className="font-semibold text-xs text-white leading-snug">{info.label}</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">{count} Problems</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[var(--bg-card)] p-2 rounded-lg border border-white/[0.06]">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search questions by keyword, tag (e.g. OOM, lsof, VPC, DNS)..."
                className="w-full bg-[var(--bg-canvas)] border border-white/[0.08] rounded-md pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-2">
              <select
                value={difficultyFilter}
                onChange={e => {
                  setDifficultyFilter(e.target.value as any);
                  setPage(1);
                }}
                className="bg-[var(--bg-canvas)] border border-white/[0.08] rounded-md px-2.5 py-1.5 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-white/30 cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                <option value="Beginner">Easy</option>
                <option value="Intermediate">Medium</option>
                <option value="Staff SRE">Hard</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="bg-[var(--bg-canvas)] border border-white/[0.08] rounded-md px-2.5 py-1.5 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-white/30 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="todo">Unsolved</option>
                <option value="solved">Solved</option>
              </select>

              <button
                onClick={pickRandomProblem}
                className="p-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-[var(--text-secondary)] hover:text-white border border-white/[0.08] transition"
                title="Shuffle Random Problem"
              >
                <Dices className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Problems Table */}
          <div className="rounded-xl border border-white/[0.08] bg-[var(--bg-card)] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[var(--text-muted)] font-semibold uppercase text-[10px] tracking-wider font-mono">
                    <th className="py-2.5 px-3 w-10 text-center">Status</th>
                    <th className="py-2.5 px-2 w-10">#</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3 w-24">Acceptance</th>
                    <th className="py-2.5 px-3 w-20">Difficulty</th>
                    <th className="py-2.5 px-3 w-28">Track</th>
                    <th className="py-2.5 px-3 w-20 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {paginatedProblems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-[var(--text-muted)]">
                        No DevOps questions found matching filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedProblems.map((prob) => {
                      const isSolved = solvedChallengeIds.includes(prob.id);
                      return (
                        <tr
                          key={prob.id}
                          onClick={() => selectChallenge(prob.id)}
                          className="hover:bg-white/[0.03] cursor-pointer transition"
                        >
                          <td className="py-2.5 px-3 text-center">
                            {isSolved ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                            ) : (
                              <Circle className="w-3 h-3 text-white/20 mx-auto" />
                            )}
                          </td>

                          <td className="py-2.5 px-2 font-mono text-[var(--text-muted)] text-[11px]">
                            {prob.number}.
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[var(--text-primary)] hover:text-white transition">
                                {prob.title}
                              </span>
                              {prob.hasInteractiveSandbox && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.06] border border-white/10 text-zinc-300 font-mono">
                                  SIMULATOR
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                              {prob.tags.slice(0, 3).map(tag => (
                                <span
                                  key={tag}
                                  className="text-[9px] px-1 py-0.2 rounded bg-white/[0.04] text-[var(--text-muted)] font-mono"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-2.5 px-3 font-mono text-[var(--text-muted)] text-[11px]">
                            {prob.acceptanceRate}
                          </td>

                          <td className="py-2.5 px-3">
                            {getDifficultyBadge(prob.difficulty)}
                          </td>

                          <td className="py-2.5 px-3">
                            <span className="text-[var(--text-secondary)] text-xs flex items-center gap-1.5">
                              <span>{TRACK_INFO[prob.track].icon}</span>
                              <span className="hidden sm:inline">{TRACK_INFO[prob.track].label}</span>
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                selectChallenge(prob.id);
                              }}
                              className="px-2 py-0.5 rounded text-[11px] font-medium bg-white/[0.06] hover:bg-white hover:text-black text-[var(--text-secondary)] transition"
                            >
                              Solve
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-4 py-2.5 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
              <div>
                Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredProblems.length)} of {filteredProblems.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 text-[var(--text-secondary)] flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>Prev</span>
                </button>
                <span>Page {page} / {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 text-[var(--text-secondary)] flex items-center gap-1 transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
