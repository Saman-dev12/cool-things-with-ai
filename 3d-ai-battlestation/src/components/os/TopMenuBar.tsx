import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi,
  Volume2,
  VolumeX,
  Camera,
  Monitor,
  Maximize,
  Sparkles,
  Play,
  Pause,
  Palette,
  Search,
  Check,
  Cpu,
  Layers,
  Calendar as CalendarIcon,
  HelpCircle,
  Zap,
  Sliders,
  X,
  Lock,
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { musicPlayer, soundFx } from '../../audio/soundEngine';
import { THEMES, WALLPAPERS } from '../../data/themes';

interface TopMenuBarProps {
  onOpenHelp: () => void;
  onOpenSpotlight?: () => void;
}

type MenuKey = 'apple' | 'file' | 'edit' | 'view' | 'window' | 'help' | null;
type PopoverKey = 'wifi' | 'volume' | 'calendar' | null;

export const TopMenuBar: React.FC<TopMenuBarProps> = ({ onOpenHelp, onOpenSpotlight }) => {
  const {
    cameraMode,
    setCameraMode,
    currentTheme,
    setTheme,
    currentWallpaper,
    setWallpaper,
    isMuted,
    toggleSound,
    activeAppId,
    openApp,
    closeApp,
    minimizeApp,
    maximizeApp,
    closeAllWindows,
    resetWindowPositions,
    showNotification,
  } = useOS();

  const [activeMenu, setActiveMenu] = useState<MenuKey>(null);
  const [activePopover, setActivePopover] = useState<PopoverKey>(null);
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isPlaying, setIsPlaying] = useState(musicPlayer.getIsPlaying());
  const [currentTrack, setCurrentTrack] = useState(musicPlayer.getTrack());
  const [volume, setVolume] = useState(musicPlayer.getVolume());
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const menuBarRef = useRef<HTMLDivElement>(null);

  // Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setDateStr(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Music state subscriber
  useEffect(() => {
    return musicPlayer.subscribe(() => {
      setIsPlaying(musicPlayer.getIsPlaying());
      setCurrentTrack(musicPlayer.getTrack());
      setVolume(musicPlayer.getVolume());
    });
  }, []);

  // Click outside listener to close dropdowns & popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setActivePopover(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (key: MenuKey) => {
    soundFx.click();
    setActivePopover(null);
    setActiveMenu((prev) => (prev === key ? null : key));
  };

  const togglePopover = (key: PopoverKey) => {
    soundFx.click();
    setActiveMenu(null);
    setActivePopover((prev) => (prev === key ? null : key));
  };

  const closeAllPopups = () => {
    setActiveMenu(null);
    setActivePopover(null);
  };

  const handleFullscreen = () => {
    soundFx.click();
    closeAllPopups();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const cycleTheme = () => {
    soundFx.click();
    const themeIds = THEMES.map((t) => t.id);
    const currIdx = themeIds.indexOf(currentTheme.id);
    const nextId = themeIds[(currIdx + 1) % themeIds.length];
    setTheme(nextId);
  };

  const cycleWallpaper = () => {
    soundFx.click();
    const wpIds = WALLPAPERS.map((w) => w.id);
    const currIdx = wpIds.indexOf(currentWallpaper.id);
    const nextId = wpIds[(currIdx + 1) % wpIds.length];
    setWallpaper(nextId);
  };

  return (
    <>
      <header
        ref={menuBarRef}
        className="absolute top-0 left-0 right-0 h-7 bg-slate-950/85 backdrop-blur-2xl border-b border-white/10 z-[999] flex items-center justify-between px-2 text-[11px] text-gray-200 select-none pointer-events-auto shadow-sm"
      >
        {/* Left Menu Items (macOS Apple Menu Style with REAL Click Dropdowns) */}
        <div className="flex items-center gap-1">
          {/* Apple/AetherOS Logo Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('apple')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition cursor-pointer font-bold ${
                activeMenu === 'apple'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-white hover:bg-white/10 hover:text-cyan-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AetherOS</span>
            </button>

            {activeMenu === 'apple' && (
              <div className="absolute top-full left-0 mt-1 w-56 rounded-xl bg-slate-900/95 border border-white/15 backdrop-blur-2xl shadow-2xl py-1 z-[1000] text-xs font-sans text-gray-200 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    closeAllPopups();
                    setShowAboutModal(true);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>About AetherOS 2026</span>
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                </button>
                <div className="h-px bg-white/10 my-1" />
                <button
                  onClick={() => {
                    closeAllPopups();
                    openApp('settings');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>System Preferences...</span>
                  <Sliders className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button
                  onClick={() => {
                    closeAllPopups();
                    openApp('gallery');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Holographic Wallpapers...</span>
                  <Palette className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <div className="h-px bg-white/10 my-1" />
                <button
                  onClick={() => {
                    closeAllPopups();
                    resetWindowPositions();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white cursor-pointer"
                >
                  Restart Desktop Session
                </button>
                <button
                  onClick={() => {
                    closeAllPopups();
                    setIsLocked(true);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Lock Screen</span>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            )}
          </div>

          {/* File Menu */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => toggleMenu('file')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                activeMenu === 'file' ? 'bg-white/15 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              File
            </button>
            {activeMenu === 'file' && (
              <div className="absolute top-full left-0 mt-1 w-52 rounded-xl bg-slate-900/95 border border-white/15 backdrop-blur-2xl shadow-2xl py-1 z-[1000] text-xs font-sans text-gray-200 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    closeAllPopups();
                    openApp('terminal');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>New Terminal</span>
                  <span className="text-[10px] text-gray-500 font-mono">Ctrl+T</span>
                </button>
                <button
                  onClick={() => {
                    closeAllPopups();
                    openApp('code');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>New CodeCraft File</span>
                  <span className="text-[10px] text-gray-500 font-mono">Ctrl+N</span>
                </button>
                <button
                  onClick={() => {
                    closeAllPopups();
                    openApp('browser');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Launch NetSurfer</span>
                  <span className="text-[10px] text-gray-500 font-mono">Ctrl+B</span>
                </button>
                <div className="h-px bg-white/10 my-1" />
                <button
                  onClick={() => {
                    closeAllPopups();
                    if (activeAppId) closeApp(activeAppId);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Close Active Window</span>
                  <span className="text-[10px] text-gray-500 font-mono">Ctrl+W</span>
                </button>
                <button
                  onClick={() => {
                    closeAllPopups();
                    closeAllWindows();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-500/20 hover:text-rose-300 text-rose-400 cursor-pointer"
                >
                  Close All Windows
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => toggleMenu('edit')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                activeMenu === 'edit' ? 'bg-white/15 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Edit
            </button>
            {activeMenu === 'edit' && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-slate-900/95 border border-white/15 backdrop-blur-2xl shadow-2xl py-1 z-[1000] text-xs font-sans text-gray-200 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    closeAllPopups();
                    showNotification('Clipboard', 'Undo executed');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Undo</span>
                  <span className="text-[10px] text-gray-500 font-mono">Ctrl+Z</span>
                </button>
                <button
                  onClick={() => {
                    closeAllPopups();
                    showNotification('Clipboard', 'Redo executed');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Redo</span>
                  <span className="text-[10px] text-gray-500 font-mono">Ctrl+Y</span>
                </button>
                <div className="h-px bg-white/10 my-1" />
                <button
                  onClick={() => {
                    closeAllPopups();
                    showNotification('Clipboard', 'Cut text');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Cut</span>
                  <span className="text-[10px] text-gray-500 font-mono">Ctrl+X</span>
                </button>
                <button
                  onClick={() => {
                    closeAllPopups();
                    showNotification('Clipboard', 'Copied selection to clipboard');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Copy</span>
                  <span className="text-[10px] text-gray-500 font-mono">Ctrl+C</span>
                </button>
                <button
                  onClick={() => {
                    closeAllPopups();
                    showNotification('Clipboard', 'Pasted from clipboard');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Paste</span>
                  <span className="text-[10px] text-gray-500 font-mono">Ctrl+V</span>
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative hidden md:block">
            <button
              onClick={() => toggleMenu('view')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                activeMenu === 'view' ? 'bg-white/15 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              View
            </button>
            {activeMenu === 'view' && (
              <div className="absolute top-full left-0 mt-1 w-56 rounded-xl bg-slate-900/95 border border-white/15 backdrop-blur-2xl shadow-2xl py-1 z-[1000] text-xs font-sans text-gray-200 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    closeAllPopups();
                    setCameraMode('screen');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Focus Desktop (2D 1:1)</span>
                  {cameraMode === 'screen' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
                <button
                  onClick={() => {
                    closeAllPopups();
                    setCameraMode('desk');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Sit at Desk (3D View)</span>
                  {cameraMode === 'desk' && <Check className="w-3.5 h-3.5 text-pink-400" />}
                </button>
                <button
                  onClick={() => {
                    closeAllPopups();
                    setCameraMode('fpv');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Walk in Studio Room (FPV)</span>
                  {cameraMode === 'fpv' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
                <div className="h-px bg-white/10 my-1" />
                <button
                  onClick={() => {
                    closeAllPopups();
                    cycleWallpaper();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Next Wallpaper Preset</span>
                  <span className="text-[10px] text-cyan-400">4K HDR</span>
                </button>
                <button
                  onClick={() => {
                    closeAllPopups();
                    cycleTheme();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white cursor-pointer"
                >
                  Next Neon Theme
                </button>
                <div className="h-px bg-white/10 my-1" />
                <button
                  onClick={handleFullscreen}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Toggle Fullscreen</span>
                  <span className="text-[10px] text-gray-500 font-mono">F11</span>
                </button>
              </div>
            )}
          </div>

          {/* Window Menu */}
          <div className="relative hidden md:block">
            <button
              onClick={() => toggleMenu('window')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                activeMenu === 'window' ? 'bg-white/15 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Window
            </button>
            {activeMenu === 'window' && (
              <div className="absolute top-full left-0 mt-1 w-52 rounded-xl bg-slate-900/95 border border-white/15 backdrop-blur-2xl shadow-2xl py-1 z-[1000] text-xs font-sans text-gray-200 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    closeAllPopups();
                    if (activeAppId) minimizeApp(activeAppId);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Minimize Window</span>
                  <span className="text-[10px] text-gray-500 font-mono">Ctrl+M</span>
                </button>
                <button
                  onClick={() => {
                    closeAllPopups();
                    if (activeAppId) maximizeApp(activeAppId);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white cursor-pointer"
                >
                  Maximize / Restore
                </button>
                <div className="h-px bg-white/10 my-1" />
                <button
                  onClick={() => {
                    closeAllPopups();
                    resetWindowPositions();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Reset & Arrange All</span>
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('help')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                activeMenu === 'help' ? 'bg-white/15 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Help
            </button>
            {activeMenu === 'help' && (
              <div className="absolute top-full left-0 mt-1 w-56 rounded-xl bg-slate-900/95 border border-white/15 backdrop-blur-2xl shadow-2xl py-1 z-[1000] text-xs font-sans text-gray-200 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    closeAllPopups();
                    onOpenHelp();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>AetherOS Quick Guide</span>
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                </button>
                <button
                  onClick={() => {
                    closeAllPopups();
                    if (onOpenSpotlight) onOpenSpotlight();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Keyboard Shortcuts</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Ctrl+Space</span>
                </button>
                <div className="h-px bg-white/10 my-1" />
                <button
                  onClick={() => {
                    closeAllPopups();
                    soundFx.arcadePowerup();
                    showNotification('Audio Engine', 'Procedural synthesizer check: 100% functional');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white cursor-pointer"
                >
                  Synthesizer Sound Test
                </button>
                <button
                  onClick={() => {
                    closeAllPopups();
                    showNotification('Rig Telemetry', 'RTX 5090 @ 38°C • 240 FPS • All systems optimal');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 hover:text-white flex items-center justify-between cursor-pointer"
                >
                  <span>Rig Diagnostics</span>
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Control Center Items */}
        <div className="flex items-center gap-2 sm:gap-3 font-mono text-[11px]">
          {/* Spotlight Search Icon Button */}
          <button
            onClick={() => {
              soundFx.click();
              if (onOpenSpotlight) onOpenSpotlight();
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-cyan-300 border border-white/10 transition cursor-pointer"
            title="Spotlight Search (Ctrl+Space)"
          >
            <Search className="w-3 h-3 text-cyan-400" />
            <span className="hidden lg:inline text-[10px] font-sans text-gray-300">Search</span>
            <kbd className="hidden lg:inline text-[9px] bg-black/40 px-1 rounded text-cyan-400 font-mono">^Space</kbd>
          </button>

          {/* Procedural Music Quick Pill */}
          <button
            onClick={() => {
              soundFx.click();
              musicPlayer.togglePlay();
            }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-pink-300 border border-white/10 transition cursor-pointer max-w-[170px] truncate"
            title="Play/Pause Procedural Synth Music"
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 text-pink-400 shrink-0" />
            ) : (
              <Play className="w-3 h-3 text-pink-400 shrink-0" />
            )}
            <span className="hidden sm:inline font-sans text-[10px] truncate">
              {isPlaying ? currentTrack.title : 'WaveBeats'}
            </span>
          </button>

          {/* 3D Studio / FPV Walk vs Screen Focus Pill */}
          <div className="flex items-center bg-black/40 rounded-full p-0.5 border border-white/15">
            <button
              onClick={() => {
                soundFx.click();
                setCameraMode('screen');
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium transition cursor-pointer ${
                cameraMode === 'screen'
                  ? 'bg-cyan-500 text-black font-semibold shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Focus 1:1 on desktop screen"
            >
              <Monitor className="w-3 h-3" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => {
                soundFx.click();
                setCameraMode('desk');
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium transition cursor-pointer ${
                cameraMode === 'desk'
                  ? 'bg-pink-500 text-white font-semibold shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Sit at 3D Desk"
            >
              <Camera className="w-3 h-3" />
              <span>Desk</span>
            </button>
            <button
              onClick={() => {
                soundFx.click();
                setCameraMode('fpv');
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium transition cursor-pointer ${
                cameraMode === 'fpv'
                  ? 'bg-emerald-500 text-black font-semibold shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Walk in 3D Room (WASD)"
            >
              <span>🚶 Walk</span>
            </button>
          </div>

          {/* Theme Cycler */}
          <button
            onClick={cycleTheme}
            className="p-1 hover:bg-white/10 rounded transition cursor-pointer text-gray-300 hover:text-cyan-300"
            title={`Current Theme: ${currentTheme.name} (Click to cycle)`}
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {/* Volume Control Popover */}
          <div className="relative">
            <button
              onClick={() => togglePopover('volume')}
              className={`p-1 rounded transition cursor-pointer ${
                activePopover === 'volume'
                  ? 'bg-white/20 text-white'
                  : 'hover:bg-white/10 text-gray-300 hover:text-white'
              }`}
              title="Volume Control & Audio Devices"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>

            {activePopover === 'volume' && (
              <div className="absolute top-full right-0 mt-2 w-64 rounded-2xl bg-slate-900/95 border border-white/15 backdrop-blur-2xl shadow-2xl p-4 z-[1000] text-xs font-sans text-gray-200 animate-in fade-in zoom-in-95 duration-100 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold text-white text-xs">Audio & Sound Master</span>
                  <button
                    onClick={toggleSound}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition cursor-pointer ${
                      isMuted
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isMuted ? 'Muted' : 'Unmuted'}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>WaveBeats Synth Volume</span>
                    <span className="font-mono text-cyan-300">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => musicPlayer.setVolume(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-800 rounded-lg"
                  />
                </div>

                <div className="pt-2 border-t border-white/10 text-[11px] space-y-1">
                  <div className="text-gray-400">Active Output Device:</div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-white">
                    <span className="truncate">Yamaha HS8 Studio Monitors</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 ml-1" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Wi-Fi 7 Popover */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => togglePopover('wifi')}
              className={`p-1 rounded transition cursor-pointer ${
                activePopover === 'wifi'
                  ? 'bg-white/20 text-white'
                  : 'hover:bg-white/10 text-emerald-400'
              }`}
              title="Wi-Fi 7 (10 Gbps Ultra-Low Latency)"
            >
              <Wifi className="w-3.5 h-3.5" />
            </button>

            {activePopover === 'wifi' && (
              <div className="absolute top-full right-0 mt-2 w-64 rounded-2xl bg-slate-900/95 border border-white/15 backdrop-blur-2xl shadow-2xl p-4 z-[1000] text-xs font-sans text-gray-200 animate-in fade-in zoom-in-95 duration-100 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-xs">Wi-Fi 7 (802.11be)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                    Connected
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-gray-300">
                  <div className="flex justify-between py-0.5 border-b border-white/5">
                    <span className="text-gray-400">SSID:</span>
                    <span className="font-semibold text-white">AetherNet-WiFi7-Pro</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-white/5">
                    <span className="text-gray-400">Frequency Band:</span>
                    <span className="text-cyan-300">6.0 GHz (320 MHz Channel)</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-white/5">
                    <span className="text-gray-400">Link Speed:</span>
                    <span className="font-mono text-emerald-400">4,800 Mbps</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-white/5">
                    <span className="text-gray-400">Round-trip Ping:</span>
                    <span className="font-mono text-cyan-300">3 ms</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-gray-400">IPv4 Address:</span>
                    <span className="font-mono text-gray-300">192.168.1.188</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={handleFullscreen}
            className="p-1 hover:bg-white/10 rounded transition cursor-pointer text-gray-300 hover:text-white"
            title="Toggle Fullscreen (F11)"
          >
            <Maximize className="w-3 h-3" />
          </button>

          {/* Calendar & Clock Popover */}
          <div className="relative">
            <button
              onClick={() => togglePopover('calendar')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition cursor-pointer font-sans font-medium ${
                activePopover === 'calendar'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-200 hover:bg-white/10'
              }`}
              title="Click to view Calendar & Time"
            >
              <span className="hidden md:inline text-gray-400 text-[10px]">{dateStr}</span>
              <span className="font-mono text-cyan-200">{timeStr}</span>
            </button>

            {activePopover === 'calendar' && (
              <div className="absolute top-full right-0 mt-2 w-72 rounded-2xl bg-slate-900/95 border border-white/15 backdrop-blur-2xl shadow-2xl p-4 z-[1000] text-xs font-sans text-gray-200 animate-in fade-in zoom-in-95 duration-100 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-xs">{dateStr}</span>
                  </div>
                  <span className="font-mono text-cyan-300 text-xs font-bold">{timeStr}</span>
                </div>

                {/* Calendar Grid */}
                <div className="space-y-1">
                  <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-gray-400 font-semibold pb-1">
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px]">
                    {Array.from({ length: 31 }, (_, i) => {
                      const day = i + 1;
                      const isToday = day === new Date().getDate();
                      return (
                        <div
                          key={day}
                          className={`py-1 rounded-lg transition ${
                            isToday
                              ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/30'
                              : 'text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Today's Schedule preview */}
                <div className="pt-2 border-t border-white/10 space-y-1.5 text-[11px]">
                  <div className="text-gray-400 font-semibold">Today's Focus:</div>
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 flex items-center justify-between">
                    <span>Quantum Rig Benchmark Session</span>
                    <span className="font-mono text-[10px] text-cyan-400">240 FPS</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* About AetherOS System Modal */}
      {showAboutModal && (
        <div
          onClick={() => setShowAboutModal(false)}
          className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full rounded-3xl bg-slate-900 border border-white/20 p-6 shadow-2xl space-y-4 text-xs font-sans text-gray-200"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">AetherOS 2026 Ultimate</h3>
                  <p className="text-[10px] text-gray-400">Version 4.2.0-Quantum (Build 9950X)</p>
                </div>
              </div>
              <button
                onClick={() => setShowAboutModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hardware specifications breakdown */}
            <div className="space-y-2.5 bg-slate-950/70 p-4 rounded-2xl border border-white/10 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Processor:</span>
                <span className="font-semibold text-white">AMD Ryzen 9 9950X3D (16C/32T)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Graphics:</span>
                <span className="font-semibold text-emerald-400">NVIDIA GeForce RTX 5090 32GB GDDR7</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Liquid Cooler:</span>
                <span className="text-cyan-300">Lian Li HydroShift 360 LCD (38°C)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Memory:</span>
                <span className="font-mono text-gray-200">64GB DDR5-6400 CL28 Dual-Channel</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Storage:</span>
                <span className="font-mono text-gray-200">4TB Crucial T705 Gen5 NVMe (14,500 MB/s)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Display:</span>
                <span className="text-pink-300">34" Samsung Odyssey OLED G9 @ 240Hz</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Audio Monitors:</span>
                <span className="text-amber-300">Yamaha HS8 Studio Monitors + Focusrite</span>
              </div>
            </div>

            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
            >
              Close System Overview
            </button>
          </div>
        </div>
      )}

      {/* Lock Screen Overlay */}
      {isLocked && (
        <div
          onClick={() => {
            soundFx.arcadeLaser();
            setIsLocked(false);
          }}
          className="fixed inset-0 z-[999999] bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center space-y-6 text-white select-none cursor-pointer animate-in fade-in duration-200"
        >
          <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-md">
            <Lock className="w-10 h-10 text-cyan-400 animate-pulse" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-4xl font-black tracking-tight text-white font-mono">{timeStr}</h2>
            <p className="text-sm text-gray-400">{dateStr}</p>
          </div>
          <div className="text-xs text-cyan-300/80 animate-bounce pt-6">
            Click anywhere or press any key to unlock
          </div>
        </div>
      )}
    </>
  );
};
