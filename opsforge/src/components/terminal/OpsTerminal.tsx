import React, { useState, useRef, useEffect } from 'react';
import { useOps } from '../../context/OpsContext';
import { Terminal as TerminalIcon, Trash2, CornerDownLeft } from 'lucide-react';

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
    if (line.startsWith('sre@opsforge-prod:~$') || line.startsWith('sre@opsforge:~$')) {
      return 'text-white font-semibold';
    }
    if (line.includes('Error') || line.includes('CrashLoopBackOff') || line.includes('OOMKilled') || line.includes('FAIL')) {
      return 'text-[#ff375f]';
    }
    if (line.includes('Warning') || line.includes('BackOff')) {
      return 'text-[#ffc01e]';
    }
    if (line.includes('Running') || line.includes('Success') || line.includes('PASSED') || line.includes('200 OK')) {
      return 'text-[#00b8a3]';
    }
    return 'text-zinc-300';
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] overflow-hidden font-mono text-xs">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#383838] bg-[#262626]">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-300 font-medium text-xs">Terminal</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1">
            {getShortcuts().map(cmd => (
              <button
                key={cmd}
                onClick={() => runCommand(cmd)}
                className="px-2 py-0.5 rounded text-[11px] bg-[#333333] hover:bg-[#3d3d3d] text-zinc-300 hover:text-white border border-[#444] transition"
              >
                {cmd}
              </button>
            ))}
          </div>

          <button
            onClick={clearTerminal}
            className="p-1 rounded text-zinc-500 hover:text-white transition"
            title="Clear terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto space-y-1 bg-[#141414] selection:bg-zinc-700 selection:text-white text-xs font-mono"
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
        className="flex items-center gap-2 px-3 py-2 bg-[#1e1e1e] border-t border-[#333333]"
      >
        <span className="text-[#00b8a3] font-bold select-none text-xs">sre@opsforge:~$</span>
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Run commands (kubectl get pods, df -h, help)..."
          className="flex-1 bg-transparent text-white text-xs focus:outline-none placeholder:text-zinc-600 font-mono"
        />
        <button
          type="submit"
          className="p-1 rounded text-zinc-400 hover:text-white transition"
          title="Execute"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
