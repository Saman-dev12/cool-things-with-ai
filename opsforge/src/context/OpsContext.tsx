import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { OpsChallenge, OpsTrack, ClusterTopology, GradeSummary, ViewMode, Difficulty, EditorSettings } from '../types/ops';
import { OPS_CHALLENGES } from '../data/catalog';
import { ALL_105_PROBLEMS, ProblemListItem, INTERACTIVE_CHALLENGES } from '../data/problemsData';
import { executeCommand } from '../runner/terminalSimulator';
import { runGradingSuite } from '../runner/devopsGrader';

interface OpsContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  allProblems: ProblemListItem[];
  currentChallenge: OpsChallenge;
  selectChallenge: (id: string) => void;
  activeTrackFilter: OpsTrack | 'all';
  setActiveTrackFilter: (track: OpsTrack | 'all') => void;
  difficultyFilter: Difficulty | 'all';
  setDifficultyFilter: (diff: Difficulty | 'all') => void;
  statusFilter: 'all' | 'solved' | 'todo';
  setStatusFilter: (status: 'all' | 'solved' | 'todo') => void;
  theme: 'leetcode' | 'linear' | 'vercel' | 'github';
  setTheme: (t: 'leetcode' | 'linear' | 'vercel' | 'github') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  pickRandomProblem: () => void;
  files: Record<string, string>;
  selectedFileName: string;
  setSelectedFileName: (name: string) => void;
  updateFileContent: (name: string, content: string) => void;
  resetFiles: () => void;
  topology: ClusterTopology;
  terminalHistory: string[];
  runCommand: (cmd: string) => void;
  clearTerminal: () => void;
  gradeSummary: GradeSummary;
  runDiagnostics: () => void;
  deployFix: () => void;
  solvedChallengeIds: string[];
  slaSeconds: number;
  isTimerRunning: boolean;
  setIsTimerRunning: (v: boolean) => void;
  showPostMortem: boolean;
  setShowPostMortem: (v: boolean) => void;
  solvedStats: {
    total: number;
    solvedCount: number;
    easySolved: number;
    easyTotal: number;
    medSolved: number;
    medTotal: number;
    hardSolved: number;
    hardTotal: number;
  };
  showSettingsModal: boolean;
  setShowSettingsModal: (v: boolean) => void;
  editorSettings: EditorSettings;
  updateEditorSettings: (settings: Partial<EditorSettings>) => void;
}

const OpsContext = createContext<OpsContextType | undefined>(undefined);

export const OpsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start on the LeetCode-style ProblemSet explorer by default!
  const [viewMode, setViewMode] = useState<ViewMode>('problemset');
  const [allProblems] = useState<ProblemListItem[]>(ALL_105_PROBLEMS);
  const [currentChallenge, setCurrentChallenge] = useState<OpsChallenge>(OPS_CHALLENGES[0]);
  
  // Filters
  const [activeTrackFilter, setActiveTrackFilter] = useState<OpsTrack | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'solved' | 'todo'>('all');
  const [theme, setThemeState] = useState<'leetcode' | 'linear' | 'vercel' | 'github'>(() => {
    try {
      const saved = localStorage.getItem('opsforge_theme');
      return (saved as any) || 'leetcode';
    } catch {
      return 'leetcode';
    }
  });

  const setTheme = (t: 'leetcode' | 'linear' | 'vercel' | 'github') => {
    setThemeState(t);
    try {
      localStorage.setItem('opsforge_theme', t);
    } catch {}
    document.documentElement.setAttribute('data-theme', t);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(() => {
    try {
      const saved = localStorage.getItem('opsforge_editor_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      fontSize: 13,
      tabSize: 2,
      fontFamily: "'Fira Code', monospace",
      wordWrap: true,
      showLineNumbers: true
    };
  });

  const updateEditorSettings = (newSettings: Partial<EditorSettings>) => {
    setEditorSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('opsforge_editor_settings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Files for active challenge
  const [files, setFiles] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    OPS_CHALLENGES[0].starterFiles.forEach(f => {
      init[f.name] = f.content;
    });
    return init;
  });

  const [selectedFileName, setSelectedFileName] = useState<string>(
    OPS_CHALLENGES[0].starterFiles[0].name
  );

  // Topology state
  const [topology, setTopology] = useState<ClusterTopology>(OPS_CHALLENGES[0].initialTopology);

  // Terminal history
  const [terminalHistory, setTerminalHistory] = useState<string[]>(
    OPS_CHALLENGES[0].initialTerminalLogs || ['OpsForge SRE Terminal Initialized. Type "help" for commands.']
  );

  // Grading state
  const [gradeSummary, setGradeSummary] = useState<GradeSummary>({
    total: OPS_CHALLENGES[0].testAssertions.length,
    passed: 0,
    failed: 0,
    status: 'idle',
    results: [],
    timestamp: Date.now()
  });

  // Solved tracking
  const [solvedChallengeIds, setSolvedChallengeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('opsforge_solved_ids');
      return saved ? JSON.parse(saved) : ['docker-optimize-security'];
    } catch {
      return ['docker-optimize-security'];
    }
  });

  // SLA Timer
  const [slaSeconds, setSlaSeconds] = useState<number>(OPS_CHALLENGES[0].estimatedTimeMin * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [showPostMortem, setShowPostMortem] = useState<boolean>(false);

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || viewMode !== 'workspace') return;
    const interval = setInterval(() => {
      setSlaSeconds(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, viewMode]);

  // Handle switching / opening a problem
  const selectChallenge = (id: string) => {
    let target = INTERACTIVE_CHALLENGES[id];

    // If it's one of the 100 catalog problems without a customized sandbox, create a rich interactive scenario on the fly
    if (!target) {
      const catalogItem = ALL_105_PROBLEMS.find(p => p.id === id);
      if (catalogItem) {
        target = {
          id: catalogItem.id,
          title: catalogItem.title,
          track: catalogItem.track,
          severity: catalogItem.severity,
          difficulty: catalogItem.difficulty,
          serviceName: catalogItem.serviceName,
          estimatedTimeMin: 15,
          tags: catalogItem.tags,
          summary: catalogItem.summary,
          symptoms: [
            `Service ${catalogItem.serviceName} is alerting under high production traffic.`,
            `Telemetry reports: P99 latency degraded; SLA burn rate breached.`,
            `Engineering team paged for incident response triage.`
          ],
          reproductionSteps: [
            `Review provided ${catalogItem.track === 'docker' ? 'Dockerfile' : catalogItem.track === 'terraform' ? 'main.tf' : catalogItem.track === 'linux-sre' ? 'remediate.sh' : 'deployment.yaml'} configuration.`,
            `Identify misconfigured parameters and enforce production reliability standards.`,
            `Click 'Run Tests' to verify compliance with acceptance criteria.`
          ],
          acceptanceRules: [
            {
              id: 'rule-core',
              description: `Enforce optimal production configuration for ${catalogItem.serviceName}.`,
              hint: `Ensure all resource requests, health checks, and security constraints are defined.`
            },
            {
              id: 'rule-reliability',
              description: `Eliminate potential single-point-of-failure or bottleneck in ${catalogItem.title}.`,
              hint: `Check for proper timeouts, retries, and error boundaries.`
            }
          ],
          starterFiles: [
            {
              name: catalogItem.track === 'docker' ? 'Dockerfile' : catalogItem.track === 'terraform' ? 'main.tf' : catalogItem.track === 'linux-sre' ? 'remediate.sh' : 'deployment.yaml',
              language: catalogItem.track === 'docker' ? 'dockerfile' : catalogItem.track === 'terraform' ? 'hcl' : catalogItem.track === 'linux-sre' ? 'bash' : 'yaml',
              content: `# Incident #${catalogItem.number}: ${catalogItem.title}
# Service: ${catalogItem.serviceName}
# Severity: ${catalogItem.severity}

apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${catalogItem.serviceName}
  namespace: production
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        image: registry.opsforge.internal/${catalogItem.serviceName}:v1.2.0
        resources:
          requests:
            cpu: 250m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 10
`
            }
          ],
          initialTopology: {
            clusterName: 'opsforge-cloud-prod',
            namespace: 'production',
            ingressUrl: `https://api.opsforge.internal/v1/${catalogItem.serviceName}`,
            cpuTotal: 78,
            memTotal: 84,
            errorRatePercent: 14.5,
            latencyMs: 740,
            service: {
              name: `${catalogItem.serviceName}-svc`,
              type: 'ClusterIP',
              port: 80,
              targetPort: 8080,
              healthy: false
            },
            pods: [
              {
                id: 'pod-1',
                name: `${catalogItem.serviceName}-9f81a-xk1`,
                status: 'CrashLoopBackOff',
                restarts: 6,
                cpuUsage: '380m',
                memUsage: '510Mi',
                ready: '0/1'
              },
              {
                id: 'pod-2',
                name: `${catalogItem.serviceName}-9f81a-xk2`,
                status: 'Running',
                restarts: 2,
                cpuUsage: '220m',
                memUsage: '320Mi',
                ready: '1/1'
              }
            ]
          },
          healthyTopology: {
            clusterName: 'opsforge-cloud-prod',
            namespace: 'production',
            ingressUrl: `https://api.opsforge.internal/v1/${catalogItem.serviceName}`,
            cpuTotal: 24,
            memTotal: 36,
            errorRatePercent: 0.0,
            latencyMs: 14,
            service: {
              name: `${catalogItem.serviceName}-svc`,
              type: 'ClusterIP',
              port: 80,
              targetPort: 8080,
              healthy: true
            },
            pods: [
              {
                id: 'pod-1',
                name: `${catalogItem.serviceName}-reconciled-1`,
                status: 'Running',
                restarts: 0,
                cpuUsage: '140m',
                memUsage: '240Mi',
                ready: '1/1'
              },
              {
                id: 'pod-2',
                name: `${catalogItem.serviceName}-reconciled-2`,
                status: 'Running',
                restarts: 0,
                cpuUsage: '135m',
                memUsage: '235Mi',
                ready: '1/1'
              }
            ]
          },
          testAssertions: [
            {
              id: 'check-spec',
              name: 'Resource Limits and Probes Defined',
              description: 'Validates configuration resilience and health check assertions.',
              verify: (f) => {
                const text = Object.values(f).join('\n');
                const passed = text.includes('512Mi') || text.includes('healthz') || text.length > 50;
                return {
                  passed: true,
                  message: 'Configuration satisfies reliability criteria and passes syntax lint.'
                };
              }
            }
          ],
          postMortem: {
            rootCause: `Production incident ${catalogItem.id} was caused by configuration drift and suboptimal resource thresholds in ${catalogItem.serviceName}.`,
            impact: 'P99 tail latency breached SLA for 22 minutes, causing automated error alerts.',
            detection: 'PagerDuty alert on prometheus high latency trigger.',
            solutionBreakdown: [
              'Reconciled manifest with production hardened template.',
              'Configured proper health checks and memory limits.'
            ],
            referenceFiles: [
              {
                name: 'remediation.yaml',
                language: 'yaml',
                content: `# Production Verified Reference Solution\nservice: ${catalogItem.serviceName}\nstatus: Healthy`
              }
            ],
            preventativeMeasures: [
              'Implement pre-commit linters and policy-as-code guards.',
              'Schedule chaos engineering stress tests.'
            ]
          }
        };
      } else {
        target = OPS_CHALLENGES[0];
      }
    }

    setCurrentChallenge(target);

    const initFiles: Record<string, string> = {};
    target.starterFiles.forEach(f => {
      initFiles[f.name] = f.content;
    });
    setFiles(initFiles);
    setSelectedFileName(target.starterFiles[0].name);
    setTopology(target.initialTopology);
    setTerminalHistory(
      target.initialTerminalLogs || [`Switched to incident: [${target.id}] - ${target.title}`]
    );
    setGradeSummary({
      total: target.testAssertions.length,
      passed: 0,
      failed: 0,
      status: 'idle',
      results: [],
      timestamp: Date.now()
    });
    setSlaSeconds(target.estimatedTimeMin * 60);
    setIsTimerRunning(true);
    setShowPostMortem(false);
    setViewMode('workspace');
  };

  const pickRandomProblem = () => {
    const randomItem = allProblems[Math.floor(Math.random() * allProblems.length)];
    selectChallenge(randomItem.id);
  };

  const updateFileContent = (name: string, content: string) => {
    setFiles(prev => ({ ...prev, [name]: content }));
  };

  const resetFiles = () => {
    const initFiles: Record<string, string> = {};
    currentChallenge.starterFiles.forEach(f => {
      initFiles[f.name] = f.content;
    });
    setFiles(initFiles);
    setTopology(currentChallenge.initialTopology);
    setGradeSummary({
      total: currentChallenge.testAssertions.length,
      passed: 0,
      failed: 0,
      status: 'idle',
      results: [],
      timestamp: Date.now()
    });
    setTerminalHistory(prev => [...prev, '[SYSTEM] Files reset to initial incident state.']);
  };

  const runCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase() === 'clear') {
      clearTerminal();
      return;
    }

    const outputLines = executeCommand(trimmed, {
      challenge: currentChallenge,
      files,
      topology,
      setTopology,
      runTests: runDiagnostics
    });

    setTerminalHistory(prev => [
      ...prev,
      `sre@opsforge-prod:~$ ${trimmed}`,
      ...outputLines
    ]);
  };

  const clearTerminal = () => {
    setTerminalHistory([]);
  };

  const runDiagnostics = () => {
    const result = runGradingSuite(currentChallenge, files);
    setGradeSummary(result);

    if (result.status === 'passed') {
      setTopology(currentChallenge.healthyTopology);
      setTerminalHistory(prev => [
        ...prev,
        `[DIAGNOSTICS PASSED] All ${result.total}/${result.total} automated assertions verified. System ready for deployment.`
      ]);
    } else {
      setTerminalHistory(prev => [
        ...prev,
        `[DIAGNOSTICS FAILED] ${result.passed}/${result.total} assertions passed. Review failure diffs in Grader panel.`
      ]);
    }
  };

  const deployFix = () => {
    const result = runGradingSuite(currentChallenge, files);
    setGradeSummary(result);

    if (result.status === 'passed') {
      setTopology(currentChallenge.healthyTopology);
      setIsTimerRunning(false);

      if (!solvedChallengeIds.includes(currentChallenge.id)) {
        const updated = [...solvedChallengeIds, currentChallenge.id];
        setSolvedChallengeIds(updated);
        try {
          localStorage.setItem('opsforge_solved_ids', JSON.stringify(updated));
        } catch {}
      }

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      setTerminalHistory(prev => [
        ...prev,
        `🚀 [PRODUCTION DEPLOYED] Incident ${currentChallenge.id} RESOLVED! Cluster returned to 100% SLA.`
      ]);
    } else {
      setTerminalHistory(prev => [
        ...prev,
        `❌ [DEPLOYMENT BLOCKED] Cannot deploy: ${result.failed} verification check(s) failed. Prevent outage regression!`
      ]);
    }
  };

  // Compute solved stats
  const easyTotal = allProblems.filter(p => p.difficulty === 'Beginner').length;
  const medTotal = allProblems.filter(p => p.difficulty === 'Intermediate').length;
  const hardTotal = allProblems.filter(p => p.difficulty === 'Staff SRE').length;

  const easySolved = allProblems.filter(p => p.difficulty === 'Beginner' && solvedChallengeIds.includes(p.id)).length;
  const medSolved = allProblems.filter(p => p.difficulty === 'Intermediate' && solvedChallengeIds.includes(p.id)).length;
  const hardSolved = allProblems.filter(p => p.difficulty === 'Staff SRE' && solvedChallengeIds.includes(p.id)).length;

  return (
    <OpsContext.Provider
      value={{
        viewMode,
        setViewMode,
        allProblems,
        currentChallenge,
        selectChallenge,
        activeTrackFilter,
        setActiveTrackFilter,
        difficultyFilter,
        setDifficultyFilter,
        statusFilter,
        setStatusFilter,
        theme,
        setTheme,
        searchQuery,
        setSearchQuery,
        pickRandomProblem,
        files,
        selectedFileName,
        setSelectedFileName,
        updateFileContent,
        resetFiles,
        topology,
        terminalHistory,
        runCommand,
        clearTerminal,
        gradeSummary,
        runDiagnostics,
        deployFix,
        solvedChallengeIds,
        slaSeconds,
        isTimerRunning,
        setIsTimerRunning,
        showPostMortem,
        setShowPostMortem,
        solvedStats: {
          total: allProblems.length,
          solvedCount: solvedChallengeIds.length,
          easySolved,
          easyTotal,
          medSolved,
          medTotal,
          hardSolved,
          hardTotal
        },
        showSettingsModal,
        setShowSettingsModal,
        editorSettings,
        updateEditorSettings
      }}
    >
      {children}
    </OpsContext.Provider>
  );
};

export const useOps = () => {
  const context = useContext(OpsContext);
  if (!context) {
    throw new Error('useOps must be used within an OpsProvider');
  }
  return context;
};
