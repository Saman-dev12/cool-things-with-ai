import React from 'react';
import { useOS } from '../../context/OSContext';
import { THEMES } from '../../data/themes';
import { Palette, Volume2, Monitor, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../audio/soundEngine';

export const SettingsApp: React.FC = () => {
  const {
    currentTheme,
    setTheme,
    cameraMode,
    setCameraMode,
    isMuted,
    toggleSound,
  } = useOS();

  const handleThemeChange = (id: string) => {
    setTheme(id);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className="w-full h-full bg-slate-950 p-4 text-gray-200 overflow-y-auto space-y-5 select-none font-sans text-xs">
      {/* Themes Selection */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-1.5">
          <Palette className="w-4 h-4 text-pink-400" />
          <span>OS Themes & 3D Ambient Lighting</span>
        </div>
        <p className="text-[11px] text-gray-400">
          Selecting a theme instantly recolors the operating system glass borders and the 3D room's neon strip and PC tower RGB!
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`p-3 rounded-xl border flex items-center justify-between text-left transition ${
                currentTheme.id === theme.id
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/10 font-bold'
                  : 'border-white/10 bg-slate-900/60 hover:border-white/20'
              }`}
            >
              <div>
                <div className="text-white text-xs">{theme.name}</div>
                <div className="text-[10px] text-gray-400">Syncs 3D RGB</div>
              </div>
              <div className="flex gap-1.5">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                  style={{ backgroundColor: theme.primary }}
                />
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                  style={{ backgroundColor: theme.accent }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3D Camera Controls */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-1.5">
          <Monitor className="w-4 h-4 text-cyan-400" />
          <span>Workstation Camera Mode</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              soundFx.click();
              setCameraMode('desk');
            }}
            className={`p-3 rounded-xl border text-center transition ${
              cameraMode === 'desk'
                ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold'
                : 'border-white/10 bg-slate-900/60 text-gray-400 hover:text-white'
            }`}
          >
            <div className="text-xs">3D Desk Orbit</div>
            <div className="text-[10px] opacity-75">Inspect PC, mug, keyboard</div>
          </button>
          <button
            onClick={() => {
              soundFx.click();
              setCameraMode('screen');
            }}
            className={`p-3 rounded-xl border text-center transition ${
              cameraMode === 'screen'
                ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold'
                : 'border-white/10 bg-slate-900/60 text-gray-400 hover:text-white'
            }`}
          >
            <div className="text-xs">Focus Screen (1:1)</div>
            <div className="text-[10px] opacity-75">Full-fidelity app experience</div>
          </button>
        </div>
      </div>

      {/* Audio Engine */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-1.5">
          <Volume2 className="w-4 h-4 text-yellow-400" />
          <span>Acoustics & Web Audio Engine</span>
        </div>
        <div className="p-3 bg-slate-900/60 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-white">System Sound & Keyboard Clicks</div>
            <div className="text-[10px] text-gray-400">Synthesized 100% procedurally in browser</div>
          </div>
          <button
            onClick={toggleSound}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              isMuted
                ? 'bg-rose-600/30 border border-rose-500/50 text-rose-300'
                : 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-300'
            }`}
          >
            {isMuted ? 'Muted' : 'Sound Enabled'}
          </button>
        </div>
      </div>

      {/* System Hardware Diagnostics (2026 Flagship Rig) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-1.5">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>2026 Flagship System Hardware Diagnostics</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 bg-slate-900/60 border border-white/10 rounded-xl">
            <span className="text-gray-400 block text-[10px]">Processor:</span>
            <span className="text-cyan-300 font-semibold font-mono">AMD Ryzen 9 9950X3D</span>
            <span className="text-gray-400 block text-[10px] mt-0.5">16C/32T @ 5.7 GHz • 144MB Cache</span>
          </div>
          <div className="p-2.5 bg-slate-900/60 border border-white/10 rounded-xl">
            <span className="text-gray-400 block text-[10px]">Graphics Processing Unit:</span>
            <span className="text-pink-400 font-semibold font-mono">NVIDIA RTX 5090 32GB</span>
            <span className="text-emerald-400 block text-[10px] mt-0.5">Blackwell • 38°C (Idle)</span>
          </div>
          <div className="p-2.5 bg-slate-900/60 border border-white/10 rounded-xl">
            <span className="text-gray-400 block text-[10px]">System Memory:</span>
            <span className="text-yellow-300 font-semibold font-mono">64GB DDR5-6400 CL28</span>
            <span className="text-gray-400 block text-[10px] mt-0.5">G.Skill Trident Z5 Royal RGB</span>
          </div>
          <div className="p-2.5 bg-slate-900/60 border border-white/10 rounded-xl">
            <span className="text-gray-400 block text-[10px]">Primary Storage:</span>
            <span className="text-emerald-400 font-semibold font-mono">4TB Gen5 NVMe SSD</span>
            <span className="text-gray-400 block text-[10px] mt-0.5">Crucial T705 @ 14,500 MB/s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
