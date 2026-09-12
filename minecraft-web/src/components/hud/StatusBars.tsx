import React from 'react';
import { PlayerState } from '../../types';

interface StatusBarsProps {
  playerState: PlayerState;
}

export const StatusBars: React.FC<StatusBarsProps> = ({ playerState }) => {
  const maxHearts = 10;
  const currentHealth = Math.max(0, Math.min(20, playerState.health));
  const fullHearts = Math.floor(currentHealth / 2);
  const hasHalfHeart = currentHealth % 2 === 1;

  const maxHunger = 10;
  const currentHunger = Math.max(0, Math.min(20, playerState.hunger));
  const fullHunger = Math.floor(currentHunger / 2);

  return (
    <div className="fixed bottom-18 left-1/2 -translate-x-1/2 z-30 select-none pointer-events-none flex flex-col items-center gap-1.5 w-[380px]">
      {/* Game Mode & Flight Status Notification */}
      <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider text-zinc-300 bg-black/60 px-2 py-0.5 rounded border border-zinc-700">
        <span className="uppercase text-amber-400 font-bold">{playerState.gameMode} MODE</span>
        {playerState.isFlying && (
          <span className="text-cyan-400 font-bold">• FLYING (F)</span>
        )}
        {playerState.inWater && (
          <span className="text-blue-400 font-bold">• SWIMMING</span>
        )}
        {playerState.isSneaking && (
          <span className="text-purple-400 font-bold">• SNEAKING</span>
        )}
      </div>

      {/* Underwater Oxygen Bubbles (shown when in water) */}
      {playerState.inWater && (
        <div className="flex items-center gap-1 self-end mr-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-cyan-400 border border-blue-900 shadow-sm animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Hearts & Hunger Row */}
      <div className="w-full flex items-center justify-between px-2">
        {/* 10 Health Hearts */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: maxHearts }).map((_, i) => {
            const isFull = i < fullHearts;
            const isHalf = i === fullHearts && hasHalfHeart;

            return (
              <div key={i} className="relative w-4 h-4 flex items-center justify-center">
                {/* Heart Base Icon */}
                <svg viewBox="0 0 16 16" className="w-4 h-4 drop-shadow">
                  {/* Black outline */}
                  <path
                    d="M2,4 L6,4 L8,6 L10,4 L14,4 L15,5 L15,8 L8,15 L1,8 L1,5 Z"
                    fill="#111"
                  />
                  {/* Red filling */}
                  {isFull && (
                    <path
                      d="M2.5,4.5 L5.5,4.5 L8,7 L10.5,4.5 L13.5,4.5 L14,5 L14,7.5 L8,13.5 L2,7.5 L2,5 Z"
                      fill="#ef4444"
                    />
                  )}
                  {isHalf && (
                    <path
                      d="M2.5,4.5 L5.5,4.5 L8,7 L8,13.5 L2,7.5 L2,5 Z"
                      fill="#ef4444"
                    />
                  )}
                  {!isFull && !isHalf && (
                    <path
                      d="M2.5,4.5 L5.5,4.5 L8,7 L10.5,4.5 L13.5,4.5 L14,5 L14,7.5 L8,13.5 L2,7.5 L2,5 Z"
                      fill="#374151"
                    />
                  )}
                </svg>
              </div>
            );
          })}
        </div>

        {/* 10 Hunger Drumsticks */}
        <div className="flex items-center gap-0.5 flex-row-reverse">
          {Array.from({ length: maxHunger }).map((_, i) => {
            const isFull = i < fullHunger;

            return (
              <div key={i} className="relative w-4 h-4 flex items-center justify-center">
                <svg viewBox="0 0 16 16" className="w-4 h-4 drop-shadow">
                  {/* Drumstick shape */}
                  <circle cx="9" cy="7" r="5" fill="#111" />
                  <rect x="2" y="10" width="4" height="4" rx="1" fill="#111" />
                  <circle cx="9" cy="7" r="4" fill={isFull ? '#b45309' : '#374151'} />
                  <circle cx="3" cy="11" r="1.5" fill="#e5e7eb" />
                </svg>
              </div>
            );
          })}
        </div>
      </div>

      {/* Experience Bar & Level Badge */}
      <div className="relative w-full px-2 flex items-center">
        {/* Green XP Bar */}
        <div className="w-full h-2 bg-black/80 border border-zinc-700 rounded-xs overflow-hidden flex items-center p-[1px]">
          <div
            className="h-full bg-gradient-to-r from-lime-500 to-emerald-400 rounded-xs transition-all"
            style={{ width: `${Math.min(100, (playerState.experience % 100))}%` }}
          />
        </div>

        {/* Level Number Badge in Center */}
        <span className="absolute left-1/2 -translate-x-1/2 -top-3 text-sm font-bold font-mono text-[#55ff55] drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
          {playerState.level}
        </span>
      </div>
    </div>
  );
};
