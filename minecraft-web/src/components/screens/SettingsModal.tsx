import React from 'react';
import { GameSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="bg-[#2c2c2c] border-4 border-[#181818] rounded-lg w-full max-w-md p-6 shadow-2xl flex flex-col gap-4 font-mono text-white">
        <h2 className="text-xl font-bold text-center tracking-wider text-amber-300 drop-shadow">
          Video & Audio Settings
        </h2>

        <div className="space-y-4 text-xs">
          {/* FOV Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-zinc-300">
              <span>FOV (Field of View)</span>
              <span className="font-bold text-amber-400">
                {settings.fov === 75 ? '75 (Normal)' : settings.fov === 110 ? '110 (Quake Pro)' : settings.fov}
              </span>
            </div>
            <input
              type="range"
              min={60}
              max={110}
              step={1}
              value={settings.fov}
              onChange={e => onUpdateSettings({ fov: parseInt(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Master Volume */}
          <div className="space-y-1">
            <div className="flex justify-between text-zinc-300">
              <span>Master Sound Volume</span>
              <span className="font-bold text-amber-400">{Math.round(settings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.volume}
              onChange={e => onUpdateSettings({ volume: parseFloat(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Day / Night Cycle Speed */}
          <div className="space-y-1">
            <div className="flex justify-between text-zinc-300">
              <span>Day / Night Speed</span>
              <span className="font-bold text-amber-400">
                {settings.dayNightSpeed === 0 ? 'Frozen' : `${settings.dayNightSpeed}x`}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 4].map(spd => (
                <button
                  key={spd}
                  onClick={() => onUpdateSettings({ dayNightSpeed: spd })}
                  className={`py-1.5 rounded border transition cursor-pointer text-[11px] ${
                    settings.dayNightSpeed === spd
                      ? 'bg-amber-500 text-black font-bold border-amber-300'
                      : 'bg-[#3a3a3a] text-zinc-300 border-zinc-700 hover:bg-[#444]'
                  }`}
                >
                  {spd === 0 ? 'Frozen' : spd === 1 ? 'Normal (1x)' : 'Fast (4x)'}
                </button>
              ))}
            </div>
          </div>

          {/* F3 Debug Screen Toggle */}
          <div className="flex items-center justify-between p-2 bg-[#1e1e1e] border border-zinc-700 rounded">
            <span>Show F3 Debug Screen</span>
            <input
              type="checkbox"
              checked={settings.showF3}
              onChange={e => onUpdateSettings({ showF3: e.target.checked })}
              className="w-4 h-4 accent-amber-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-[#555] hover:bg-[#666] active:bg-[#444] border-t-2 border-l-2 border-[#888] border-b-2 border-r-2 border-[#222] text-white font-bold text-sm tracking-wide shadow-md transition cursor-pointer mt-2"
        >
          Done
        </button>
      </div>
    </div>
  );
};
