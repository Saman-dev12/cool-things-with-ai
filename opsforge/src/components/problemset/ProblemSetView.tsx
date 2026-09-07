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
  TrendingUp, 
  Layers, 
  Terminal, 
  Filter, 
  ChevronRight,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Sparkles,
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
      // Track filter
      if (activeTrackFilter !== 'all' && p.track !== activeTrackFilter) return false;
      // Difficulty filter
      if (difficultyFilter !== 'all' && p.difficulty !== difficultyFilter) return false;
      // Status filter
      const isSolved = solvedChallengeIds.includes(p.id);
      if (statusFilter === 'solved' && !isSolved) return false;
      if (statusFilter === 'todo' && isSolved) return false;
      // Search query
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

  // Pagination
  const totalPages = Math.ceil(filteredProblems.length / pageSize) || 1;
  const paginatedProblems = filteredProblems.slice((page - 1) * pageSize, page * pageSize);

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case 'Beginner':
        return <span className="text-[#00b8a3] font-semibold text-xs">Easy</span>;
      case 'Intermediate':
        return <span className="text-[#ffc01e] font-semibold text-xs">Medium</span>;
      case 'Staff SRE':
        return <span className="text-[#ff375f] font-semibold text-xs">Hard</span>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b0f17] text-slate-100">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Top Hero & Study Plans Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Featured Study Plan Banner (8 Cols) */}
          <div className="lg:col-span-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800/80 p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                  FEATURED STUDY PLAN
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Most Popular for SRE Interviews
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                DevOps 75: Production Incident & Architecture Mastery
              </h1>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                Master 100+ real-world production outages, broken Kubernetes pods, multi-stage Docker builds, Linux kernel inode leaks, Terraform cycles, and PromQL P99 alerting rules.
              </p>
            </div>

            <div className="relative z-10 pt-6 flex flex-wrap items-center gap-4">
              <button
                onClick={() => selectChallenge('k8s-crashloop-oom')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
              >
                <span>Start Practicing Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={pickRandomProblem}
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition"
              >
                <Dices className="w-4 h-4 text-cyan-400" />
                <span>Pick Random Incident</span>
              </button>
            </div>
          </div>

          {/* User Stats Card (4 Cols) */}
          <div className="lg:col-span-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 p-5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                  S
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-200">Session Progress</div>
                  <div className="text-[11px] text-slate-400 font-mono">SRE Candidate Level 3</div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-400 font-mono font-bold text-xs bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/30">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>3 Day Streak</span>
              </div>
            </div>

            {/* Stats Breakdown */}
            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Solved:</span>
                <span className="font-mono text-sm font-bold text-slate-100">
                  {solvedStats.solvedCount} / {solvedStats.total}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                <div 
                  className="bg-[#00b8a3] h-full transition-all duration-500" 
                  style={{ width: `${(solvedStats.easySolved / solvedStats.total) * 100}%` }}
                  title="Easy Solved"
                />
                <div 
                  className="bg-[#ffc01e] h-full transition-all duration-500" 
                  style={{ width: `${(solvedStats.medSolved / solvedStats.total) * 100}%` }}
                  title="Medium Solved"
                />
                <div 
                  className="bg-[#ff375f] h-full transition-all duration-500" 
                  style={{ width: `${(solvedStats.hardSolved / solvedStats.total) * 100}%` }}
                  title="Hard Solved"
                />
              </div>

              {/* Difficulty breakdown rows */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] font-mono">
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                  <div className="text-[#00b8a3] font-bold">Easy</div>
                  <div className="text-slate-300 font-semibold mt-0.5">
                    {solvedStats.easySolved}/{solvedStats.easyTotal}
                  </div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                  <div className="text-[#ffc01e] font-bold">Medium</div>
                  <div className="text-slate-300 font-semibold mt-0.5">
                    {solvedStats.medSolved}/{solvedStats.medTotal}
                  </div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                  <div className="text-[#ff375f] font-bold">Hard</div>
                  <div className="text-slate-300 font-semibold mt-0.5">
                    {solvedStats.hardSolved}/{solvedStats.hardTotal}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span>Acceptance Rate:</span>
              <span className="text-emerald-400 font-bold">54.8%</span>
            </div>
          </div>
        </div>

        {/* Tracks Carousel Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Explore by Specialization Track</span>
            </h2>
            <button
              onClick={() => setActiveTrackFilter('all')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              View All 100+ &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="text-2xl mb-2">{info.icon}</div>
                  <div>
                    <div className="font-bold text-xs text-slate-100">{info.label}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{count} Problems</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by title, tag (e.g. OOM, lsof, VPC, DNS, Probes)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-2">
              {/* Difficulty Filter */}
              <select
                value={difficultyFilter}
                onChange={e => {
                  setDifficultyFilter(e.target.value as any);
                  setPage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                <option value="Beginner">Easy</option>
                <option value="Intermediate">Medium</option>
                <option value="Staff SRE">Hard</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="todo">Unsolved</option>
                <option value="solved">Solved</option>
              </select>

              {/* Random Pick Button */}
              <button
                onClick={pickRandomProblem}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition"
                title="Pick Random Problem"
              >
                <Dices className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Problems Table */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">Status</th>
                    <th className="py-3 px-3 w-14">#</th>
                    <th className="py-3 px-4">Title & Specialization</th>
                    <th className="py-3 px-4 w-28">Acceptance</th>
                    <th className="py-3 px-4 w-28">Difficulty</th>
                    <th className="py-3 px-4 w-32">Track</th>
                    <th className="py-3 px-4 w-24 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {paginatedProblems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No DevOps problems found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedProblems.map((prob, idx) => {
                      const isSolved = solvedChallengeIds.includes(prob.id);
                      return (
                        <tr
                          key={prob.id}
                          onClick={() => selectChallenge(prob.id)}
                          className={`group hover:bg-slate-800/50 cursor-pointer transition ${
                            idx % 2 === 0 ? 'bg-slate-900/20' : 'bg-slate-950/20'
                          }`}
                        >
                          {/* Status Icon */}
                          <td className="py-3 px-4 text-center">
                            {isSolved ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-600 mx-auto group-hover:text-slate-400" />
                            )}
                          </td>

                          {/* Problem Number */}
                          <td className="py-3 px-3 font-mono text-slate-400 font-semibold">
                            {prob.number}.
                          </td>

                          {/* Title & Tags */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-200 group-hover:text-cyan-300 transition">
                                {prob.title}
                              </span>
                              {prob.hasInteractiveSandbox && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono">
                                  LIVE CLUSTER
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              {prob.tags.slice(0, 3).map(tag => (
                                <span
                                  key={tag}
                                  className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-750"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Acceptance Rate */}
                          <td className="py-3 px-4 font-mono text-slate-400">
                            {prob.acceptanceRate}
                          </td>

                          {/* Difficulty */}
                          <td className="py-3 px-4">
                            {getDifficultyBadge(prob.difficulty)}
                          </td>

                          {/* Track */}
                          <td className="py-3 px-4">
                            <span className="text-slate-300 text-xs flex items-center gap-1.5">
                              <span>{TRACK_INFO[prob.track].icon}</span>
                              <span className="hidden sm:inline">{TRACK_INFO[prob.track].label}</span>
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                selectChallenge(prob.id);
                              }}
                              className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-300 transition"
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
            <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400 font-mono">
              <div>
                Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredProblems.length)} of {filteredProblems.length} problems
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 flex items-center gap-1 transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
