import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Terminal,
  Music,
  Globe,
  Gamepad2,
  Code,
  Bot,
  Settings,
  Image,
  Sparkles,
  Calculator,
  ArrowRight,
  Camera,
  Monitor,
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { soundFx, musicPlayer } from '../../audio/soundEngine';

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'App' | 'Action' | 'Calculation';
  icon: React.ReactNode;
  action: () => void;
}

export const SpotlightSearch: React.FC<SpotlightSearchProps> = ({ isOpen, onClose }) => {
  const {
    openApp,
    setCameraMode,
    closeAllWindows,
    showNotification,
  } = useOS();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Base list of apps and actions
  const allItems: SearchItem[] = [
    {
      id: 'app-terminal',
      title: 'CyberTerminal (zsh)',
      subtitle: 'Hardware diagnostics, neofetch & command line',
      category: 'App',
      icon: <Terminal className="w-4 h-4 text-emerald-400" />,
      action: () => openApp('terminal'),
    },
    {
      id: 'app-music',
      title: 'WaveBeats Synthesizer',
      subtitle: '5 procedural synth tracks with reactive visualizer',
      category: 'App',
      icon: <Music className="w-4 h-4 text-pink-400" />,
      action: () => openApp('music'),
    },
    {
      id: 'app-browser',
      title: 'NetSurfer Browser',
      subtitle: 'Multi-tab web browser with Giggle search & CatTube',
      category: 'App',
      icon: <Globe className="w-4 h-4 text-cyan-400" />,
      action: () => openApp('browser'),
    },
    {
      id: 'app-arcade',
      title: 'Aether Arcade Hub',
      subtitle: '4 games: Space Defender, Snake, Breaker, Typing',
      category: 'App',
      icon: <Gamepad2 className="w-4 h-4 text-amber-400" />,
      action: () => openApp('arcade'),
    },
    {
      id: 'app-code',
      title: 'CodeCraft Studio IDE',
      subtitle: 'Sandboxed JavaScript execution with runtime benchmarks',
      category: 'App',
      icon: <Code className="w-4 h-4 text-blue-400" />,
      action: () => openApp('code'),
    },
    {
      id: 'app-chat',
      title: 'NeuralChat AI',
      subtitle: 'Intelligent AI assistant powered by Aether-9',
      category: 'App',
      icon: <Bot className="w-4 h-4 text-purple-400" />,
      action: () => openApp('chat'),
    },
    {
      id: 'app-gallery',
      title: 'Holographic Wallpapers',
      subtitle: 'Set 4K HDR desktop backgrounds & ambient studio glow',
      category: 'App',
      icon: <Image className="w-4 h-4 text-sky-400" />,
      action: () => openApp('gallery'),
    },
    {
      id: 'app-settings',
      title: 'System Settings',
      subtitle: 'Configure display, neon theme, audio and RTX rig telemetry',
      category: 'App',
      icon: <Settings className="w-4 h-4 text-gray-400" />,
      action: () => openApp('settings'),
    },
    {
      id: 'act-3d',
      title: 'Explore 3D Studio Room',
      subtitle: 'Orbit camera around the desk and Lian Li PC build',
      category: 'Action',
      icon: <Camera className="w-4 h-4 text-pink-400" />,
      action: () => setCameraMode('desk'),
    },
    {
      id: 'act-screen',
      title: 'Focus Desktop Screen (1:1)',
      subtitle: 'Switch camera straight into the high-res desktop',
      category: 'Action',
      icon: <Monitor className="w-4 h-4 text-cyan-400" />,
      action: () => setCameraMode('screen'),
    },
    {
      id: 'act-music-toggle',
      title: 'Toggle Music Play / Pause',
      subtitle: 'Play or pause the current procedural synth track',
      category: 'Action',
      icon: <Music className="w-4 h-4 text-yellow-400" />,
      action: () => musicPlayer.togglePlay(),
    },
    {
      id: 'act-close-all',
      title: 'Close All Windows',
      subtitle: 'Dismiss all open windows to clean up the workspace',
      category: 'Action',
      icon: <Sparkles className="w-4 h-4 text-rose-400" />,
      action: () => closeAllWindows(),
    },
  ];

  // Try math calculation
  let mathResult: SearchItem | null = null;
  const trimmed = query.trim();
  if (/^[\d\s+\-*/().%^]+$/.test(trimmed) && trimmed.length > 1) {
    try {
      // Safe math eval for simple expressions
      const evaluated = new Function(`return (${trimmed})`)();
      if (typeof evaluated === 'number' && !isNaN(evaluated)) {
        mathResult = {
          id: 'math-calc',
          title: `= ${evaluated}`,
          subtitle: `Calculation: ${trimmed}`,
          category: 'Calculation',
          icon: <Calculator className="w-4 h-4 text-emerald-400" />,
          action: () => {
            navigator.clipboard.writeText(String(evaluated)).catch(() => {});
            showNotification('Calculator', `Copied ${evaluated} to clipboard`);
          },
        };
      }
    } catch {
      // ignore
    }
  }

  // Filter items based on query
  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  const results = mathResult ? [mathResult, ...filtered] : filtered;

  const handleSelect = (item: SearchItem) => {
    soundFx.click();
    item.action();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-start justify-center pt-24 px-4 animate-in fade-in duration-100"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-3xl bg-slate-900/95 border border-white/20 shadow-2xl backdrop-blur-3xl overflow-hidden flex flex-col font-sans text-gray-200 animate-in zoom-in-95 duration-100"
      >
        {/* Search Input Box */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight Search: type an app name, command, or math (e.g. 5090 * 2)..."
            className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
          />
          <kbd className="hidden sm:inline text-[10px] bg-black/40 px-2 py-0.5 rounded text-gray-400 font-mono border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500 font-mono">
              No results found for "{query}"
            </div>
          ) : (
            results.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-2xl cursor-pointer transition ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/25 border border-cyan-500/40 text-white shadow'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400/50'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono">
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-950/90 px-4 py-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-cyan-400 text-[10px]">AetherOS Spotlight v2</span>
        </div>
      </div>
    </div>
  );
};
