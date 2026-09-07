import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { OpsChallenge, OpsTrack, ClusterTopology, GradeSummary } from '../types/ops';
import { OPS_CHALLENGES } from '../data/catalog';
import { executeCommand } from '../runner/terminalSimulator';
import { runGradingSuite } from '../runner/devopsGrader';

interface OpsContextType {
  challenges: OpsChallenge[];
  currentChallenge: OpsChallenge;
  selectChallenge: (id: string) => void;
  activeTrackFilter: OpsTrack | 'all';
  setActiveTrackFilter: (track: OpsTrack | 'all') => void;
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
}

const OpsContext = createContext<OpsContextType | undefined>(undefined);

export const OpsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [challenges] = useState<OpsChallenge[]>(OPS_CHALLENGES);
  const [currentChallenge, setCurrentChallenge] = useState<OpsChallenge>(OPS_CHALLENGES[0]);
  const [activeTrackFilter, setActiveTrackFilter] = useState<OpsTrack | 'all'>('all');
  
  // Files for current challenge
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
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // SLA Timer
  const [slaSeconds, setSlaSeconds] = useState<number>(OPS_CHALLENGES[0].estimatedTimeMin * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [showPostMortem, setShowPostMortem] = useState<boolean>(false);

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setSlaSeconds(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Handle switching challenges
  const selectChallenge = (id: string) => {
    const target = challenges.find(c => c.id === id);
    if (!target) return;
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

  return (
    <OpsContext.Provider
      value={{
        challenges,
        currentChallenge,
        selectChallenge,
        activeTrackFilter,
        setActiveTrackFilter,
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
        setShowPostMortem
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
