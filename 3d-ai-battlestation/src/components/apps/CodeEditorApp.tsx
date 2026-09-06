import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  FileCode,
  Terminal as TerminalIcon,
  Plus,
  Trash2,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { soundFx } from '../../audio/soundEngine';

interface FileItem {
  id: string;
  name: string;
  code: string;
  description: string;
}

const DEFAULT_FILES: FileItem[] = [
  {
    id: 'benchmark.js',
    name: 'benchmark.js',
    description: 'Quantum Flagship Rig Benchmark',
    code: `// 2026 Quantum Flagship Rig Benchmark
console.log("[*] Initializing benchmark on AMD Ryzen 9 9950X3D + RTX 5090...");

function calculatePrimes(max) {
  const primes = [];
  for (let i = 2; i <= max; i++) {
    let isPrime = true;
    for (let j = 2; j * j <= i; j++) {
      if (i % j === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) primes.push(i);
  }
  return primes;
}

const start = performance.now();
const primes = calculatePrimes(25000);
const duration = (performance.now() - start).toFixed(2);

console.log(\`[+] Found \${primes.length} prime numbers up to 25,000 in \${duration} ms\`);
console.log(\`[+] Largest prime calculated: \${primes[primes.length - 1]}\`);
console.log("[SUCCESS] RTX 5090 32GB GDDR7 rendering at 240 FPS. Lian Li AIO temperature: 38°C.");
`,
  },
  {
    id: 'matrix_rain.js',
    name: 'matrix_rain.js',
    description: 'Cyber Matrix Rain Simulation',
    code: `// Cyber Matrix Stream Generator
console.log("===[ NEURAL MULTIVERSE STREAM ]===");

const GLYPHS = "0123456789ABCDEFλπΩΨΦΣΔΞ";

function generateMatrixLine(length) {
  let line = "";
  for (let i = 0; i < length; i++) {
    const char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    line += char + " ";
  }
  return line;
}

for (let row = 1; row <= 6; row++) {
  console.log(\`[STREAM \${row}] \${generateMatrixLine(14)}\`);
}

console.log("[+] Matrix neural link synchronized at 10 Gbps (Wi-Fi 7).");
`,
  },
  {
    id: 'physics_sim.js',
    name: 'physics_sim.js',
    description: '2D Orbital Particle Simulation',
    code: `// Gravitational Particle Orbit Simulation
class Particle {
  constructor(x, y, vx, vy, mass) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.mass = mass;
  }

  step(dt) {
    // Gravitational pull toward center (0, 0)
    const distSq = this.x * this.x + this.y * this.y;
    const dist = Math.sqrt(distSq) || 1;
    const force = (1000 * this.mass) / distSq;
    const ax = (-this.x / dist) * force;
    const ay = (-this.y / dist) * force;

    this.vx += ax * dt;
    this.vy += ay * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }
}

const particle = new Particle(100, 0, 0, 3.16, 5);
console.log(\`[*] Initial particle position: (\${particle.x}, \${particle.y})\`);

for (let tick = 1; tick <= 5; tick++) {
  particle.step(0.5);
  console.log(\`Tick \${tick * 0.5}s: x=\${particle.x.toFixed(2)}, y=\${particle.y.toFixed(2)}, speed=\${Math.hypot(particle.vx, particle.vy).toFixed(2)}\`);
}

console.log("[+] Quantum trajectory stable.");
`,
  },
];

interface LogEntry {
  type: 'log' | 'warn' | 'error' | 'info';
  text: string;
  time: string;
}

export const CodeEditorApp: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>(DEFAULT_FILES);
  const [activeFileId, setActiveFileId] = useState<string>(DEFAULT_FILES[0].id);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [execTime, setExecTime] = useState<number | null>(null);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateCode = (newCode: string) => {
    soundFx.keyPress();
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, code: newCode } : f))
    );
  };

  const handleAddNewFile = () => {
    soundFx.click();
    const fileName = `script_${files.length + 1}.js`;
    const newFile: FileItem = {
      id: fileName,
      name: fileName,
      description: 'Custom Script',
      code: `// ${fileName}\nconsole.log("Hello from AetherOS CodeCraft!");\nconst sum = [10, 20, 30, 40].reduce((a, b) => a + b, 0);\nconsole.log("Calculated sum:", sum);\n`,
    };
    setFiles([...files, newFile]);
    setActiveFileId(newFile.id);
  };

  const handleDeleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.click();
    if (files.length <= 1) return;
    const remaining = files.filter((f) => f.id !== id);
    setFiles(remaining);
    if (activeFileId === id) {
      setActiveFileId(remaining[0].id);
    }
  };

  // REAL CODE EXECUTION ENGINE
  const runCode = async () => {
    soundFx.click();
    setIsRunning(true);
    const newLogs: LogEntry[] = [];
    const getTime = () => new Date().toLocaleTimeString([], { hour12: false });

    const formatArg = (arg: any): string => {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    };

    const customConsole = {
      log: (...args: any[]) => {
        newLogs.push({ type: 'log', text: args.map(formatArg).join(' '), time: getTime() });
      },
      warn: (...args: any[]) => {
        newLogs.push({ type: 'warn', text: '[WARN] ' + args.map(formatArg).join(' '), time: getTime() });
      },
      error: (...args: any[]) => {
        newLogs.push({ type: 'error', text: '[ERROR] ' + args.map(formatArg).join(' '), time: getTime() });
      },
      info: (...args: any[]) => {
        newLogs.push({ type: 'info', text: '[INFO] ' + args.map(formatArg).join(' '), time: getTime() });
      },
      table: (arg: any) => {
        newLogs.push({ type: 'info', text: formatArg(arg), time: getTime() });
      },
    };

    const startTime = performance.now();

    try {
      // Execute the user's code inside an async wrapper with sandboxed console
      const runner = new Function('console', 'performance', `
        return (async () => {
          ${activeFile.code}
        })();
      `);

      // Race with timeout to guard against infinite loops (max 3000ms)
      const executionPromise = runner(customConsole, performance);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Execution timed out (> 3000ms). Prevented potential infinite loop.')), 3000)
      );

      await Promise.race([executionPromise, timeoutPromise]);

      const duration = performance.now() - startTime;
      setExecTime(duration);
      soundFx.arcadePowerup();

      if (newLogs.length === 0) {
        newLogs.push({
          type: 'info',
          text: '[Done] Program completed successfully with no console output.',
          time: getTime(),
        });
      }
    } catch (err: any) {
      const duration = performance.now() - startTime;
      setExecTime(duration);
      soundFx.arcadeLaser();
      newLogs.push({
        type: 'error',
        text: `Runtime Exception: ${err.message || String(err)}`,
        time: getTime(),
      });
    } finally {
      setIsRunning(false);
      setLogs(newLogs);
    }
  };

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to run when focused in CodeCraft
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (containerRef.current?.contains(document.activeElement)) {
          e.preventDefault();
          runCode();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile.code, isRunning]);

  const lines = (activeFile.code || '').split('\n');

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#0a0e17] flex flex-col overflow-hidden text-gray-200 select-none font-mono text-xs"
    >
      {/* Editor Header / Multi-File Tabs */}
      <div className="bg-slate-900/90 border-b border-white/10 flex items-center justify-between px-2 py-1 gap-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => {
                soundFx.click();
                setActiveFileId(file.id);
              }}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs transition cursor-pointer border-t-2 shrink-0 ${
                activeFileId === file.id
                  ? 'bg-[#0a0e17] text-cyan-300 border-cyan-400 font-semibold shadow'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>{file.name}</span>
              {files.length > 1 && (
                <span
                  onClick={(e) => handleDeleteFile(file.id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition"
                  title="Close tab"
                >
                  <Trash2 className="w-3 h-3" />
                </span>
              )}
            </button>
          ))}

          <button
            onClick={handleAddNewFile}
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
            title="New File"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 active:scale-95 text-white font-semibold rounded-lg text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
            title="Run Code (Ctrl+Enter)"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isRunning ? 'Executing...' : 'Run Code'}</span>
            <kbd className="hidden sm:inline text-[9px] bg-black/30 px-1 rounded font-mono text-emerald-200">^Enter</kbd>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers Gutter */}
        <div className="w-10 bg-[#070a10] border-r border-white/5 py-3 text-right pr-2.5 select-none text-gray-600 font-mono text-[11px] leading-[20px] shrink-0">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Real Code Textarea */}
        <div className="flex-1 relative overflow-hidden bg-[#0a0e17]">
          <textarea
            ref={textareaRef}
            value={activeFile.code}
            onChange={(e) => updateCode(e.target.value)}
            spellCheck={false}
            className="w-full h-full p-3 bg-transparent text-gray-100 font-mono text-xs leading-[20px] outline-none resize-none selection:bg-cyan-500/30 whitespace-pre"
            placeholder="Type JavaScript / TypeScript code here..."
          />
        </div>
      </div>

      {/* Console Output Panel */}
      <div className="h-44 bg-[#05070c] border-t border-white/10 flex flex-col">
        {/* Console Header */}
        <div className="bg-slate-950 px-3 py-1.5 border-b border-white/10 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-gray-300">Terminal Output Console</span>
            {execTime !== null && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" /> {execTime.toFixed(2)} ms
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.click();
                setLogs([]);
                setExecTime(null);
              }}
              className="text-[10px] hover:text-white flex items-center gap-1 transition cursor-pointer"
              title="Clear Console"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          </div>
        </div>

        {/* Logs Stream */}
        <div className="flex-1 p-3 overflow-y-auto space-y-1 font-mono text-[11px]">
          {logs.length === 0 ? (
            <div className="text-gray-600 italic">
              Press "Run Code" or press Ctrl+Enter to execute JavaScript in real-time sandbox.
            </div>
          ) : (
            logs.map((log, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 leading-tight ${
                  log.type === 'error'
                    ? 'text-rose-400 bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-800/30'
                    : log.type === 'warn'
                    ? 'text-amber-300'
                    : log.type === 'info'
                    ? 'text-cyan-300'
                    : 'text-emerald-300'
                }`}
              >
                <span className="text-gray-600 shrink-0 select-none text-[10px] font-mono">
                  [{log.time}]
                </span>
                <span className="whitespace-pre-wrap break-all">{log.text}</span>
              </div>
            ))
          )}
        </div>

        {/* Status Bar */}
        <div className="bg-slate-950 px-3 py-1 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
          <div className="flex items-center gap-3">
            <span>JavaScript (ES2026)</span>
            <span>Lines: {lines.length}</span>
            <span>Chars: {activeFile.code.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Sandbox Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
