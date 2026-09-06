import React from 'react';
import {
  Terminal,
  Music,
  Gamepad2,
  Globe,
  Code,
  Bot,
  Settings,
  Image,
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import type { AppId } from '../../types/os';
import { soundFx } from '../../audio/soundEngine';

interface DockApp {
  id: AppId;
  title: string;
  gradient: string;
  icon: React.ReactNode;
}

export const Taskbar: React.FC = () => {
  const {
    windows,
    activeAppId,
    openApp,
    focusApp,
    minimizeApp,
  } = useOS();

  const apps: DockApp[] = [
    {
      id: 'terminal',
      title: 'Terminal',
      gradient: 'from-slate-900 to-emerald-950 border-emerald-500/30',
      icon: <Terminal className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'music',
      title: 'WaveBeats',
      gradient: 'from-pink-600 to-purple-700 border-pink-400/40',
      icon: <Music className="w-5 h-5 text-white" />,
    },
    {
      id: 'browser',
      title: 'NetSurfer',
      gradient: 'from-cyan-600 to-blue-700 border-cyan-400/40',
      icon: <Globe className="w-5 h-5 text-white" />,
    },
    {
      id: 'arcade',
      title: 'Arcade',
      gradient: 'from-amber-500 to-rose-600 border-yellow-400/40',
      icon: <Gamepad2 className="w-5 h-5 text-white" />,
    },
    {
      id: 'code',
      title: 'CodeCraft',
      gradient: 'from-blue-600 to-indigo-700 border-blue-400/40',
      icon: <Code className="w-5 h-5 text-white" />,
    },
    {
      id: 'chat',
      title: 'NeuralChat',
      gradient: 'from-purple-600 to-pink-600 border-purple-400/40',
      icon: <Bot className="w-5 h-5 text-white" />,
    },
    {
      id: 'gallery',
      title: 'Wallpapers',
      gradient: 'from-sky-500 to-cyan-600 border-sky-400/40',
      icon: <Image className="w-5 h-5 text-white" />,
    },
    {
      id: 'settings',
      title: 'Settings',
      gradient: 'from-slate-700 to-slate-900 border-slate-500/40',
      icon: <Settings className="w-5 h-5 text-gray-200" />,
    },
  ];

  const handleAppClick = (id: AppId) => {
    soundFx.click();
    const win = windows.find((w) => w.id === id);
    if (!win || !win.isOpen) {
      openApp(id);
    } else if (win.isMinimized) {
      focusApp(id);
    } else if (activeAppId === id) {
      minimizeApp(id);
    } else {
      focusApp(id);
    }
  };

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[900] select-none pointer-events-auto">
      {/* Floating Glass Dock (macOS Style) */}
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/60 backdrop-blur-3xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.65)]">
        {apps.map((app) => {
          const win = windows.find((w) => w.id === app.id);
          const isOpen = win?.isOpen;
          const isActive = activeAppId === app.id && !win?.isMinimized;

          return (
            <div key={app.id} className="relative flex flex-col items-center group">
              {/* Tooltip on hover */}
              <div className="absolute -top-9 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-white/15 text-white text-[10px] font-sans font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                {app.title}
              </div>

              {/* Squircle App Icon */}
              <button
                onClick={() => handleAppClick(app.id)}
                className={`w-11 h-11 rounded-[14px] bg-gradient-to-tr ${app.gradient} border flex items-center justify-center shadow-lg transition-all duration-200 ease-out group-hover:scale-120 group-hover:-translate-y-2 cursor-pointer ${
                  isActive ? 'ring-2 ring-white/40 shadow-cyan-500/20' : 'hover:shadow-xl'
                }`}
              >
                {app.icon}
              </button>

              {/* Active / Open Dot indicator */}
              <div className="h-1 mt-1 flex items-center justify-center">
                {isOpen && (
                  <span
                    className={`rounded-full transition-all duration-200 ${
                      isActive
                        ? 'w-2.5 h-1 bg-cyan-400 shadow-[0_0_6px_#06b6d4]'
                        : 'w-1 h-1 bg-gray-400'
                    }`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
