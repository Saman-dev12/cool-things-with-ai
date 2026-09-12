import React, { useEffect } from 'react';
import { InventorySlot, BlockType } from '../../types';
import { getBlockIconUrl } from '../../voxel/BlockIconHelper';

interface HotbarProps {
  hotbar: InventorySlot[];
  activeSlotIndex: number;
  onSelectSlot: (idx: number) => void;
}

export const Hotbar: React.FC<HotbarProps> = ({
  hotbar,
  activeSlotIndex,
  onSelectSlot
}) => {
  // Listen to 1-9 keys and mouse wheel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        onSelectSlot(num - 1);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        onSelectSlot((activeSlotIndex + 1) % 9);
      } else if (e.deltaY < 0) {
        onSelectSlot((activeSlotIndex - 1 + 9) % 9);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [activeSlotIndex, onSelectSlot]);

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 select-none pointer-events-auto">
      <div className="flex items-center gap-1 p-1 bg-[#1a1a1a]/85 border-2 border-[#555] rounded-md backdrop-blur-xs shadow-2xl">
        {hotbar.slice(0, 9).map((slot, idx) => {
          const isActive = idx === activeSlotIndex;
          const iconUrl = slot.block !== BlockType.AIR ? getBlockIconUrl(slot.block) : '';

          return (
            <button
              key={idx}
              onClick={() => onSelectSlot(idx)}
              className={`relative w-12 h-12 flex items-center justify-center rounded transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#444] border-2 border-white scale-105 shadow-lg'
                  : 'bg-[#2b2b2b] border border-[#3d3d3d] hover:bg-[#383838]'
              }`}
            >
              {/* Slot Number indicator */}
              <span className="absolute top-0.5 left-1 text-[9px] font-mono text-zinc-400 opacity-60">
                {idx + 1}
              </span>

              {/* Block Icon */}
              {iconUrl ? (
                <img
                  src={iconUrl}
                  alt="Block"
                  className="w-8 h-8 pixelated pointer-events-none drop-shadow"
                />
              ) : null}

              {/* Item Count */}
              {slot.count > 1 && (
                <span className="absolute bottom-0.5 right-1 text-xs font-bold font-mono text-white drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
                  {slot.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
