import React, { useState, useRef, useEffect } from 'react';
import { useOps } from '../../context/OpsContext';
import { Terminal as TerminalIcon, Trash2, CornerDownLeft, Sparkles } from 'lucide-react';

export const OpsTerminal: React.FC = () => {
  const { terminalHistory, runCommand, clearTerminal, currentChallenge } = useOps();
  const [inputVal, setInputVal] = useState('');
  const [historyIdx, setHistoryIdx] = useState<number | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    setCommandHistory(prev => [...prev, inputVal.trim()]);
    runCommand(inputVal.trim());
    setInputVal('');
    setHistoryIdx(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = historyIdx === null ? commandHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputVal(commandHistory[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === null) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= commandHistory.length) {
        setHistoryIdx(null);
        setInputVal('');
      } else {
        setHistoryIdx(nextIdx);
        setInputVal(commandHistory[nextIdx]);
      }
    }
  };

  // Quick shortcut commands depending on track
  const getShortcuts = () => {
    switch (currentChallenge.track) {
      case 'kubernetes':
        return ['kubectl get pods', 'kubectl describe pod', 'kubectl logs', 'curl'];
      case 'docker':
        return ['docker build .', 'docker images', 'cat Dockerfile'];
      case 'linux-sre':
        return ['df -h', 'lsof +L1', 'top', 'ps aux'];
      case 'terraform':
        return ['terraform plan', 'terraform validate', 'cat main.tf'];
      case 'observability':
        return ['cat prometheus_rules.yaml', 'curl'];
      default:
        return ['kubectl get pods', 'df -h', 'docker build .', 'help'];
    }
  };

  const colorizeLine = (line: string) => {
    if (line.startsWith('sre@opsforge-prod:~$')) {
      return 'text-cyan-400 font-bold';
    }
    if (line.includes('Error') || line.includes('CrashLoopBackOff') || line.includes('OOMKilled') || line.includes('FAIL')) {
      return 'text-red-400';
    }
    if (line.includes('Warning') || line.includes('BackOff')) {
      return 'text-amber-400';
    }
    if (line.includes('Running') || line.includes('Success') || line.includes('PASSED') || line.includes('200 OK')) {
      return 'text-emerald-400';
    }
    return 'text-slate-300';
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300 font-semibold text-[11px]">SRE Interactive Shell</span>
          <span className="text-[10px] text-slate-500">[bash 5.2]</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick command buttons */}
          <div className="hidden sm:flex items-center gap-1">
            {getShortcuts().map(cmd => (
              <button
                key={cmd}
                onClick={() => runCommand(cmd)}
                className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-slate-700/60 transition"
              >
                {cmd}
              </button>
            ))}
          </div>

          <button
            onClick={clearTerminal}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
            title="Clear terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto space-y-1 selection:bg-cyan-500/30 selection:text-white"
      >
        {terminalHistory.map((line, idx) => (
          <div key={idx} className={`leading-relaxed whitespace-pre-wrap ${colorizeLine(line)}`}>
            {line}
          </div>
        ))}
      </div>

      {/* Terminal Command Input Form */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 border-t border-slate-800"
      >
        <span className="text-emerald-400 font-bold select-none text-[11px]">sre@opsforge:~$</span>
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command (e.g. kubectl get pods, df -h, help)..."
          className="flex-1 bg-transparent text-slate-200 text-xs focus:outline-none placeholder:text-slate-600 font-mono"
        />
        <button
          type="submit"
          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
