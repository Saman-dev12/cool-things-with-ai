import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { WindowFrame } from './WindowFrame';
import { Taskbar } from './Taskbar';
import { TopMenuBar } from './TopMenuBar';
import {
  Terminal,
  Music,
  Gamepad2,
  Globe,
  Code,
  Bot,
  Settings,
  Image,
  Bell,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import type { AppId } from '../../types/os';
import { soundFx, musicPlayer } from '../../audio/soundEngine';
import { SpotlightSearch } from './SpotlightSearch';

interface DesktopIcon {
  id: AppId;
  label: string;
  gradient: string;
  icon: React.ReactNode;
}

export const Desktop: React.FC = () => {
  const {
    windows,
    openApp,
    currentWallpaper,
    notification,
  } = useOS();

  const [showHelp, setShowHelp] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Spotlight Search: Ctrl+Space or Cmd+Space
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        soundFx.click();
        setShowSpotlight((prev) => !prev);
        return;
      }

      // 2. Music Toggle: Ctrl+M or Cmd+M
      if ((e.ctrlKey || e.metaKey) && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        soundFx.click();
        musicPlayer.togglePlay();
        return;
      }

      // 3. App Launch Hotkeys: Ctrl+1 through Ctrl+8
      if (e.ctrlKey || e.metaKey) {
        const keyMap: Record<string, AppId> = {
          '1': 'terminal',
          '2': 'music',
          '3': 'browser',
          '4': 'arcade',
          '5': 'code',
          '6': 'chat',
          '7': 'gallery',
          '8': 'settings',
        };
        if (keyMap[e.key]) {
          e.preventDefault();
          openApp(keyMap[e.key]);
          return;
        }
      }

      // 4. Escape: Close Spotlight & Help modals
      if (e.key === 'Escape') {
        setShowSpotlight(false);
        setShowHelp(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openApp]);

  const desktopIcons: DesktopIcon[] = [
    {
      id: 'terminal',
      label: 'Terminal',
      gradient: 'from-slate-900 to-emerald-950 border-emerald-500/30',
      icon: <Terminal className="w-6 h-6 text-emerald-400" />,
    },
    {
      id: 'music',
      label: 'WaveBeats',
      gradient: 'from-pink-600 to-purple-700 border-pink-400/40',
      icon: <Music className="w-6 h-6 text-white" />,
    },
    {
      id: 'browser',
      label: 'NetSurfer',
      gradient: 'from-cyan-600 to-blue-700 border-cyan-400/40',
      icon: <Globe className="w-6 h-6 text-white" />,
    },
    {
      id: 'arcade',
      label: 'Arcade',
      gradient: 'from-amber-500 to-rose-600 border-yellow-400/40',
      icon: <Gamepad2 className="w-6 h-6 text-white" />,
    },
    {
      id: 'code',
      label: 'CodeCraft',
      gradient: 'from-blue-600 to-indigo-700 border-blue-400/40',
      icon: <Code className="w-6 h-6 text-white" />,
    },
    {
      id: 'chat',
      label: 'NeuralChat',
      gradient: 'from-purple-600 to-pink-600 border-purple-400/40',
      icon: <Bot className="w-6 h-6 text-white" />,
    },
    {
      id: 'gallery',
      label: 'Wallpapers',
      gradient: 'from-sky-500 to-cyan-600 border-sky-400/40',
      icon: <Image className="w-6 h-6 text-white" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      gradient: 'from-slate-700 to-slate-900 border-slate-500/40',
      icon: <Settings className="w-6 h-6 text-gray-200" />,
    },
  ];

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        background: currentWallpaper.url,
      }}
    >
      {/* 1. Realistic Top Menu Bar (macOS Sequoia Style) */}
      <TopMenuBar
        onOpenHelp={() => setShowHelp(true)}
        onOpenSpotlight={() => setShowSpotlight(true)}
      />

      {/* 2. Realistic Desktop App Icons (iOS/macOS Squircles in 2 neat columns, behind windows) */}
      <div className="absolute top-11 left-6 grid grid-flow-col grid-rows-4 gap-x-2 gap-y-2 z-10 pointer-events-auto">
        {desktopIcons.map((icon) => (
          <button
            key={icon.id}
            onDoubleClick={() => openApp(icon.id)}
            onClick={() => {
              soundFx.click();
              openApp(icon.id);
            }}
            className="flex flex-col items-center justify-center w-20 p-1.5 rounded-2xl hover:bg-white/10 active:scale-95 transition text-center group cursor-pointer"
          >
            {/* iOS Style Glass Squircle */}
            <div
              className={`w-13 h-13 rounded-[18px] bg-gradient-to-tr ${icon.gradient} border flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.5)] group-hover:shadow-cyan-500/30 group-hover:scale-105 transition-all duration-150 backdrop-blur-md`}
            >
              {icon.icon}
            </div>
            {/* Clean Shadowed Label */}
            <span className="text-[11px] font-sans font-medium text-white/90 group-hover:text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] mt-1.5 truncate max-w-full">
              {icon.label}
            </span>
          </button>
        ))}
      </div>

      {/* 3. Notification Toast */}
      {notification && (
        <div className="absolute top-9 right-5 max-w-sm p-3.5 rounded-2xl bg-slate-900/90 border border-white/15 backdrop-blur-2xl shadow-2xl z-[9999] flex items-start gap-3 animate-in slide-in-from-top-2 duration-200">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0 text-cyan-300">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-white flex items-center gap-1.5 font-sans">
              {notification.title}
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="text-[11px] text-gray-300 mt-0.5 leading-snug font-sans">
              {notification.message}
            </div>
          </div>
        </div>
      )}

      {/* 4. Windows Layer (z-20 so windows render ON TOP of desktop icons) */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {windows.map((app) => (
          <WindowFrame key={app.id} app={app} />
        ))}
      </div>

      {/* 5. Floating macOS Glass Dock */}
      <Taskbar />

      {/* 6. Help Dialog */}
      {showHelp && (
        <div
          onClick={() => setShowHelp(false)}
          className="absolute inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl space-y-4 text-xs font-sans"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                AetherOS Desktop Guide
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-gray-300 leading-relaxed text-xs">
              <div>
                <strong className="text-cyan-300">💻 Operating System:</strong> Click or double-click any icon on the desktop or in the floating dock to launch apps.
              </div>
              <div>
                <strong className="text-pink-300">🪐 3D Studio:</strong> Click "3D Studio" in the top menu bar to explore the realistic studio room, oak flooring, and the RTX 5090 PC!
              </div>
              <div>
                <strong className="text-yellow-300">🎵 Music & Visualizer:</strong> WaveBeats features a real-time reactive audio visualizer with procedural synthwave music.
              </div>
              <div>
                <strong className="text-emerald-300">⌨️ Terminal:</strong> Type <code className="bg-black/50 px-1.5 py-0.5 rounded text-emerald-400">fetch</code> to see the full 2026 flagship specs.
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

      {/* 7. Spotlight Global Search (Ctrl+Space) */}
      <SpotlightSearch
        isOpen={showSpotlight}
        onClose={() => setShowSpotlight(false)}
      />
    </div>
  );
};
