import React, { useState, useEffect, useRef } from 'react';
import { soundFx } from '../../audio/soundEngine';
import { useOS } from '../../context/OSContext';

interface HistoryItem {
  type: 'input' | 'output' | 'error' | 'success';
  content: string | React.ReactNode;
}

export const TerminalApp: React.FC = () => {
  const { setTheme, showNotification } = useOS();
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      type: 'output',
      content: (
        <div className="space-y-1.5 font-mono text-xs leading-relaxed text-gray-300">
          <div className="text-cyan-400 font-bold">Aether Terminal 4.2 • Darwin 24.3.0 (x86_64)</div>
          <div className="text-gray-400">Host: AMD Ryzen 9 9950X3D (32) @ 5.700GHz | GPU: NVIDIA GeForce RTX 5090 32GB</div>
          <div className="text-emerald-400">Type <span className="text-white font-semibold underline">'help'</span> for command list or <span className="text-white font-semibold underline">'fetch'</span> for hardware specs.</div>
        </div>
      ),
    },
  ]);
  const [matrixActive, setMatrixActive] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Matrix rain canvas animation
  useEffect(() => {
    if (!matrixActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 300);

    const characters = '0123456789ABCDEFHIJKLMNOPQRSTUVWXYZ@#$%&*+=-';
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const interval = setInterval(() => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00ff66';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }, 33);

    return () => clearInterval(interval);
  }, [matrixActive]);

  const [commandList, setCommandList] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandList.length === 0) return;
      const nextIdx = historyIndex === -1 ? commandList.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputVal(commandList[nextIdx]);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= commandList.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIdx);
        setInputVal(commandList[nextIdx]);
      }
      return;
    }

    soundFx.keyPress();

    if (e.key === 'Enter') {
      const trimmed = inputVal.trim();
      const currentInput = inputVal;
      setInputVal('');
      setHistoryIndex(-1);

      if (!trimmed) return;

      setCommandList((prev) => [...prev, currentInput]);

      const newHistory: HistoryItem[] = [
        ...history,
        { type: 'input', content: `guest@aether:~$ ${currentInput}` },
      ];

      const parts = trimmed.split(' ');
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      switch (cmd) {
        case 'help':
          newHistory.push({
            type: 'output',
            content: (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-300 font-mono py-1">
                <div><span className="text-cyan-400 font-semibold">help</span> - Show this cheat sheet</div>
                <div><span className="text-cyan-400 font-semibold">fetch</span> - System information</div>
                <div><span className="text-cyan-400 font-semibold">matrix</span> - Toggle digital rain mode</div>
                <div><span className="text-cyan-400 font-semibold">scan</span> - Quantum network scanner</div>
                <div><span className="text-cyan-400 font-semibold">cat &lt;file&gt;</span> - Read notes.txt</div>
                <div><span className="text-cyan-400 font-semibold">cowsay &lt;msg&gt;</span> - ASCII cow wisdom</div>
                <div><span className="text-cyan-400 font-semibold">theme &lt;name&gt;</span> - cyberpunk, matrix, etc.</div>
                <div><span className="text-cyan-400 font-semibold">clear</span> - Clear screen history</div>
              </div>
            ),
          });
          break;

        case 'clear':
          setHistory([]);
          return;

        case 'matrix':
          setMatrixActive((prev) => !prev);
          newHistory.push({
            type: 'success',
            content: matrixActive ? 'Matrix simulation terminated.' : 'Neural matrix feed initialized. Press ESC or run "matrix" to toggle.',
          });
          break;

        case 'fetch':
          newHistory.push({
            type: 'output',
            content: (
              <div className="flex gap-4 font-mono text-xs py-2 text-emerald-400">
                <pre className="text-cyan-400 text-[10px] leading-tight select-none">
{`    /\\_____/\\
   /  o   o  \\
  ( ==  ^  == )
   )         (
  (           )
 ( (  )   (  ) )
(__(__)___(__)__)`}
                </pre>
                <div className="space-y-0.5 text-gray-300">
                  <div className="text-cyan-300 font-bold">guest@aether-flagship-rig</div>
                  <div>-----------------------------------</div>
                  <div><span className="text-cyan-400">OS:</span> AetherOS 4.2 (x86_64-quantum)</div>
                  <div><span className="text-cyan-400">Host:</span> Lian Li O11 Vision Flagship Studio</div>
                  <div><span className="text-cyan-400">Motherboard:</span> ASUS ROG Crosshair X870E HERO</div>
                  <div><span className="text-cyan-400">CPU:</span> AMD Ryzen 9 9950X3D (16C/32T @ 5.7GHz, 144MB V-Cache)</div>
                  <div><span className="text-cyan-400">GPU:</span> NVIDIA GeForce RTX 5090 32GB GDDR7 (Blackwell DLSS 4/5)</div>
                  <div><span className="text-cyan-400">Memory:</span> 64GB (2x32GB) G.Skill Trident Z5 Royal DDR5-6400 CL28</div>
                  <div><span className="text-cyan-400">Storage:</span> 4TB Crucial T705 PCIe Gen 5 NVMe (14,500 MB/s)</div>
                  <div><span className="text-cyan-400">Cooler:</span> Lian Li HydroShift LCD 360 (CPU: 38°C)</div>
                  <div><span className="text-cyan-400">Display:</span> 34" Samsung Odyssey OLED G9 240Hz 0.03ms QD-OLED</div>
                </div>
              </div>
            ),
          });
          break;

        case 'scan':
          newHistory.push({
            type: 'output',
            content: (
              <div className="space-y-1 font-mono text-xs text-yellow-300 py-1">
                <div>[+] Initializing quantum subnet handshake (192.168.42.0/24)...</div>
                <div className="text-emerald-400">[OPEN] 192.168.42.1 : PORT 22 (SSH-CyberSecure)</div>
                <div className="text-emerald-400">[OPEN] 192.168.42.4 : PORT 8080 (Aether Neural Gateway)</div>
                <div className="text-cyan-400">[OPEN] 192.168.42.99 : PORT 3000 (React Three Fiber Node)</div>
                <div className="text-gray-400">[*] 3 devices discovered. Firewall status: UNCOMPROMISED.</div>
              </div>
            ),
          });
          break;

        case 'cat':
          if (args[0] === 'notes.txt' || args[0] === 'secret.txt') {
            newHistory.push({
              type: 'output',
              content: (
                <div className="p-2 bg-black/40 rounded border border-yellow-500/30 text-yellow-200 font-mono text-xs">
                  <div># TOP SECRET LOG: PROJECT AETHER</div>
                  <div className="text-gray-400 mt-1">
                    "If you're reading this, the 3D bridge has successfully stabilized.
                    The audio synthesizer is operating at full fidelity.
                    Don't forget to play Neon Invaders or try the music player chords!"
                  </div>
                </div>
              ),
            });
          } else {
            newHistory.push({
              type: 'error',
              content: `cat: ${args[0] || 'file'}: No such file or directory. Try 'cat notes.txt'`,
            });
          }
          break;

        case 'cowsay':
          const msg = args.join(' ') || 'Welcome to AetherOS!';
          newHistory.push({
            type: 'output',
            content: (
              <pre className="text-pink-300 font-mono text-xs leading-tight py-1">
{`  ___________________________
< ${msg} >
  ---------------------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`}
              </pre>
            ),
          });
          break;

        case 'theme':
          if (args[0]) {
            setTheme(args[0]);
            newHistory.push({
              type: 'success',
              content: `Theme switch requested for '${args[0]}'`,
            });
          } else {
            newHistory.push({
              type: 'error',
              content: 'Usage: theme <cyberpunk | matrix | tokyo-midnight | sunset-synth | minimal-ice>',
            });
          }
          break;

        case 'sudo':
          if (args.join(' ').includes('rm -rf')) {
            showNotification('SYSTEM ALERT', 'Nice try! Access Denied: Quantum Core is protected.');
            newHistory.push({
              type: 'error',
              content: 'CRITICAL ERROR: Neural failsafe triggered. Root partition is immutable.',
            });
          } else {
            newHistory.push({
              type: 'error',
              content: 'guest is not in the sudoers file. This incident will be reported to Aether-9.',
            });
          }
          break;

        default:
          newHistory.push({
            type: 'error',
            content: `zsh: command not found: ${cmd}. Type 'help' for available commands.`,
          });
      }

      setHistory(newHistory);
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-950/95 font-mono text-xs p-3 flex flex-col overflow-hidden text-emerald-400">
      {matrixActive && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-0 pointer-events-none opacity-80"
        />
      )}

      <div className="relative z-10 flex-1 overflow-y-auto space-y-1 pr-1">
        {history.map((item, idx) => (
          <div key={idx} className="leading-snug">
            {item.type === 'input' && (
              <div className="text-white font-medium">{item.content}</div>
            )}
            {item.type === 'output' && <div>{item.content}</div>}
            {item.type === 'error' && (
              <div className="text-rose-400 font-semibold">{item.content}</div>
            )}
            {item.type === 'success' && (
              <div className="text-emerald-300 font-semibold">{item.content}</div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="relative z-10 flex items-center gap-2 pt-2.5 border-t border-white/10 mt-1">
        <span className="text-cyan-400 font-bold shrink-0 flex items-center gap-1.5">
          <span className="text-gray-400">guest@aether</span>
          <span className="text-pink-400 font-normal">[~/workstation]</span>
          <span className="text-emerald-400 font-bold">❯</span>
        </span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-transparent text-gray-100 outline-none font-mono text-xs caret-cyan-400 placeholder:text-gray-600"
          placeholder="type a command (e.g. fetch, matrix, help, scan)..."
        />
      </div>
    </div>
  );
};
