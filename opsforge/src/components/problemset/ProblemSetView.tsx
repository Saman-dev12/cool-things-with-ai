import React, { useState, useMemo } from 'react';
import { useOps } from '../../context/OpsContext';
import { TRACK_INFO } from '../../data/catalog';
import { OpsTrack, Difficulty } from '../../types/ops';
import { 
  Search, 
  Dices, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft,
  Flame,
  Award
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

  const getDifficultyText = (diff: Difficulty) => {
    switch (diff) {
      case 'Beginner':
        return <span className="text-[#00b8a3] font-medium text-xs">Easy</span>;
      case 'Intermediate':
        return <span className="text-[#ffc01e] font-medium text-xs">Medium</span>;
      case 'Staff SRE':
        return <span className="text-[#ff375f] font-medium text-xs">Hard</span>;
    }
  };

  const studyPlans = [
    {
      id: 'devops-75',
      title: 'DevOps 75',
      desc: 'Must-know 75 incidents for SRE & DevOps interviews',
      icon: '🔥',
      solved: solvedStats.solvedCount,
      total: 75,
      filter: 'all' as const,
      firstProblemId: 'k8s-crashloop-oom'
    },
    {
      id: 'k8s-20',
      title: 'Kubernetes 20',
      desc: 'Master CrashLoopBackOff, Ingress, RBAC & Probes',
      icon: '☸️',
      solved: solvedChallengeIds.filter(id => id.startsWith('k8s')).length,
      total: 20,
      filter: 'kubernetes' as OpsTrack,
      firstProblemId: 'k8s-crashloop-oom'
    },
    {
      id: 'linux-20',
      title: 'Linux SRE 20',
      desc: 'Kernel Inodes, zombies, OOM killer & file descriptors',
      icon: '🐧',
      solved: solvedChallengeIds.filter(id => id.startsWith('linux')).length,
      total: 20,
      filter: 'linux-sre' as OpsTrack,
      firstProblemId: 'linux-unlinked-disk'
    },
    {
      id: 'iac-15',
      title: 'Cloud IaC 15',
      desc: 'Terraform dependency cycles, drift & state locks',
      icon: '🏗️',
      solved: solvedChallengeIds.filter(id => id.startsWith('tf')).length,
      total: 15,
      filter: 'terraform' as OpsTrack,
      firstProblemId: 'tf-cycle-deadlock'
    }
  ];

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto bg-[#1a1a1a] text-[#eff1f6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        
        {/* Study Plans Section (Authentic LeetCode Study Cards) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#ffa116]" />
              <span>Study Plans</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {studyPlans.map(plan => (
              <div
                key={plan.id}
                onClick={() => {
                  if (plan.filter !== 'all') {
                    setActiveTrackFilter(plan.filter);
                  }
                  selectChallenge(plan.firstProblemId);
                }}
                className="p-3.5 rounded-lg bg-[#262626] hover:bg-[#2e2e2e] border border-[#383838] hover:border-zinc-500 cursor-pointer transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{plan.icon}</span>
                    <span className="text-[10px] font-mono text-zinc-400 group-hover:text-white transition">
                      {plan.solved} / {plan.total} Solved
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-[#eff1f6] group-hover:text-[#ffa116] transition">
                    {plan.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-snug line-clamp-2">
                    {plan.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#333333]">
                  <div className="w-full bg-[#383838] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#00b8a3] h-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (plan.solved / plan.total) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Filter Chips Bar (LeetCode Style) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              setActiveTrackFilter('all');
              setPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition ${
              activeTrackFilter === 'all'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'bg-[#262626] text-zinc-300 hover:bg-[#333333] border border-[#383838]'
            }`}
          >
            All Topics ({allProblems.length})
          </button>

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
                className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'bg-[#262626] text-zinc-300 hover:bg-[#333333] border border-[#383838]'
                }`}
              >
                <span>{info.icon}</span>
                <span>{info.label} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search questions by keyword, service, or concept..."
              className="w-full bg-[#262626] border border-[#383838] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#eff1f6] placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 transition"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={difficultyFilter}
              onChange={e => {
                setDifficultyFilter(e.target.value as any);
                setPage(1);
              }}
              className="bg-[#262626] border border-[#383838] rounded-md px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-400 cursor-pointer"
            >
              <option value="all">Difficulty</option>
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
              className="bg-[#262626] border border-[#383838] rounded-md px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-400 cursor-pointer"
            >
              <option value="all">Status</option>
              <option value="todo">Todo</option>
              <option value="solved">Solved</option>
            </select>

            {/* Pick One Shuffle Button (Authentic LeetCode) */}
            <button
              onClick={pickRandomProblem}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#262626] hover:bg-[#333333] border border-[#383838] text-xs font-medium text-zinc-300 hover:text-white transition"
              title="Pick a random problem"
            >
              <Dices className="w-3.5 h-3.5 text-[#00b8a3]" />
              <span className="hidden sm:inline">Pick One</span>
            </button>
          </div>
        </div>

        {/* LeetCode Authentic Problems Table */}
        <div className="rounded-lg border border-[#383838] bg-[#262626] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#383838] bg-[#282828] text-zinc-400 text-[11px] font-medium">
                  <th className="py-2.5 px-3 w-12 text-center">Status</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3 w-16 text-center">Solution</th>
                  <th className="py-2.5 px-3 w-24">Acceptance</th>
                  <th className="py-2.5 px-3 w-24">Difficulty</th>
                  <th className="py-2.5 px-3 w-36">Track</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]">
                {paginatedProblems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                      No questions found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  paginatedProblems.map((prob, idx) => {
                    const isSolved = solvedChallengeIds.includes(prob.id);
                    const isEven = idx % 2 === 0;
                    return (
                      <tr
                        key={prob.id}
                        onClick={() => selectChallenge(prob.id)}
                        className={`cursor-pointer transition hover:bg-[#333333] ${
                          isEven ? 'bg-[#222222]' : 'bg-[#1f1f1f]'
                        }`}
                      >
                        {/* Solved Status */}
                        <td className="py-2.5 px-3 text-center">
                          {isSolved ? (
                            <CheckCircle2 className="w-4 h-4 text-[#00b8a3] mx-auto" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-zinc-600 mx-auto" />
                          )}
                        </td>

                        {/* Title & Tags */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400 font-mono text-[11px]">
                              {prob.number}.
                            </span>
                            <span className="font-medium text-[#eff1f6] hover:text-[#ffa116] transition">
                              {prob.title}
                            </span>
                            {prob.hasInteractiveSandbox && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#333333] text-zinc-400 font-mono">
                                Sandbox
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1 mt-0.5 pl-5">
                            {prob.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className="text-[9px] px-1.5 py-0.2 rounded bg-[#2e2e2e] text-zinc-400 font-mono"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Solution Document Icon */}
                        <td className="py-2.5 px-3 text-center">
                          <BookOpen className="w-3.5 h-3.5 text-zinc-400 hover:text-[#ffa116] mx-auto" />
                        </td>

                        {/* Acceptance Rate */}
                        <td className="py-2.5 px-3 font-mono text-zinc-400 text-xs">
                          {prob.acceptanceRate}
                        </td>

                        {/* Difficulty */}
                        <td className="py-2.5 px-3">
                          {getDifficultyText(prob.difficulty)}
                        </td>

                        {/* Track */}
                        <td className="py-2.5 px-3">
                          <span className="text-zinc-400 text-xs flex items-center gap-1.5">
                            <span>{TRACK_INFO[prob.track].icon}</span>
                            <span className="hidden sm:inline">{TRACK_INFO[prob.track].label}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Controls (LeetCode Style) */}
          <div className="px-4 py-2.5 border-t border-[#383838] bg-[#262626] flex items-center justify-between text-xs text-zinc-400">
            <div>
              Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredProblems.length)} of {filteredProblems.length}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1 rounded hover:bg-[#333333] disabled:opacity-30 text-zinc-300 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 font-mono text-xs">
                {Array.from({ length: Math.min(6, totalPages) }, (_, i) => i + 1).map(pNum => (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-6 h-6 rounded flex items-center justify-center transition ${
                      page === pNum
                        ? 'bg-[#383838] text-white font-bold'
                        : 'text-zinc-400 hover:text-white hover:bg-[#303030]'
                    }`}
                  >
                    {pNum}
                  </button>
                ))}
              </div>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1 rounded hover:bg-[#333333] disabled:opacity-30 text-zinc-300 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
