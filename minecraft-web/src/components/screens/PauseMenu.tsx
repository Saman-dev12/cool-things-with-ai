import React from 'react';
import { GameSettings } from '../../types';

interface PauseMenuProps {
  isOpen: boolean;
  onResume: () => void;
  onOpenSettings: () => void;
  onToggleGameMode: () => void;
  onQuitToTitle: () => void;
  gameMode: 'survival' | 'creative';
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  isOpen,
  onResume,
  onOpenSettings,
  onToggleGameMode,
  onQuitToTitle,
  gameMode
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="flex flex-col items-center gap-3 w-80 font-mono text-center">
        {/* Title */}
        <h2 className="text-2xl font-bold text-white tracking-wider mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
          Game Paused
        </h2>

        {/* Buttons */}
        <button
          onClick={onResume}
          className="w-full py-2.5 px-4 bg-[#555] hover:bg-[#666] active:bg-[#444] border-t-2 border-l-2 border-[#888] border-b-2 border-r-2 border-[#222] text-white font-bold text-sm tracking-wide shadow-md transition cursor-pointer"
        >
          Back to Game
        </button>

        <button
          onClick={onToggleGameMode}
          className="w-full py-2.5 px-4 bg-[#555] hover:bg-[#666] active:bg-[#444] border-t-2 border-l-2 border-[#888] border-b-2 border-r-2 border-[#222] text-white font-bold text-sm tracking-wide shadow-md transition cursor-pointer"
        >
          Game Mode: <span className="text-amber-300 uppercase">{gameMode}</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full py-2.5 px-4 bg-[#555] hover:bg-[#666] active:bg-[#444] border-t-2 border-l-2 border-[#888] border-b-2 border-r-2 border-[#222] text-white font-bold text-sm tracking-wide shadow-md transition cursor-pointer"
        >
          Options / Settings...
        </button>

        <button
          onClick={onQuitToTitle}
          className="w-full py-2.5 px-4 bg-[#555] hover:bg-[#666] active:bg-[#444] border-t-2 border-l-2 border-[#888] border-b-2 border-r-2 border-[#222] text-white font-bold text-sm tracking-wide shadow-md transition cursor-pointer mt-2"
        >
          Save & Quit to Title
        </button>
      </div>
    </div>
  );
};
