import React from 'react';
import { PlayerState, TargetedBlock } from '../../types';
import { BLOCK_REGISTRY } from '../../voxel/BlockRegistry';

interface F3DebugOverlayProps {
  playerState: PlayerState;
  target: TargetedBlock | null;
  fps: number;
  show: boolean;
}

export const F3DebugOverlay: React.FC<F3DebugOverlayProps> = ({
  playerState,
  target,
  fps,
  show
}) => {
  if (!show) return null;

  const [x, y, z] = playerState.position;
  const bx = Math.floor(x);
  const by = Math.floor(y);
  const bz = Math.floor(z);

  const cx = Math.floor(bx / 16);
  const cz = Math.floor(bz / 16);

  // Facing direction calculation from yaw
  const yawNorm = ((playerState.rotation[1] % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const deg = (yawNorm * 180) / Math.PI;

  let facing = 'south';
  let towards = 'towards positive Z';
  if (deg >= 45 && deg < 135) {
    facing = 'west';
    towards = 'towards negative X';
  } else if (deg >= 135 && deg < 225) {
    facing = 'north';
    towards = 'towards negative Z';
  } else if (deg >= 225 && deg < 315) {
    facing = 'east';
    towards = 'towards positive X';
  }

  // Simple biome heuristic
  const biome = by >= 48 ? 'mountains' : bx > 30 ? 'desert' : bz > 20 ? 'forest' : 'plains';

  return (
    <div className="fixed inset-0 p-3 pointer-events-none z-40 select-none font-mono text-[11px] leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] flex justify-between">
      {/* Left Debug Column */}
      <div className="space-y-0.5 max-w-md bg-black/40 p-2 rounded">
        <p className="font-bold text-amber-300">Minecraft Web Edition (1.20.4-forge / Three.js)</p>
        <p>{fps} fps (V-Sync enabled)</p>
        <p className="text-zinc-400">Integrated server @ 0.0 ms ticks, 0 tx, 0 rx</p>
        <div className="h-1" />
        <p>XYZ: {x.toFixed(3)} / {y.toFixed(3)} / {z.toFixed(3)}</p>
        <p>Block: {bx} {by} {bz}</p>
        <p>Chunk: {bx & 15} {by & 15} {bz & 15} inside chunk [{cx}, {cz}]</p>
        <p>Facing: {facing} ({towards})</p>
        <div className="h-1" />
        <p>Biome: minecraft:{biome}</p>
        <p>Light: 15 (15 sky, 0 block)</p>
        <p>Local Difficulty: 1.50 // 0.00 (Day 1)</p>
        <p className="text-emerald-400">Fly: {playerState.isFlying ? 'ACTIVE' : 'OFF'} (Press F)</p>
      </div>

      {/* Right Debug Column */}
      <div className="space-y-0.5 text-right max-w-xs bg-black/40 p-2 rounded h-fit">
        <p className="font-bold text-zinc-300">Java: 17 64bit (V8 / WASM)</p>
        <p>Mem: 38% 388/1024MB</p>
        <p>Allocated: 100% 1024MB</p>
        <p>Display: {window.innerWidth}x{window.innerHeight} (WebGL 2.0)</p>
        <p className="text-zinc-400">GPU: Three.js Hardware Rasterizer</p>
        
        {target && (
          <div className="mt-3 pt-2 border-t border-zinc-700 text-right">
            <p className="font-bold text-cyan-300">Targeted Block:</p>
            <p className="text-white">{target.worldX}, {target.worldY}, {target.worldZ}</p>
            <p className="text-yellow-300">minecraft:{BLOCK_REGISTRY[target.blockType]?.name.toLowerCase().replace(/ /g, '_')}</p>
            <p className="text-zinc-400">facing: {target.face}</p>
            <p className="text-zinc-400">dist: {target.distance.toFixed(2)}m</p>
          </div>
        )}
      </div>
    </div>
  );
};
