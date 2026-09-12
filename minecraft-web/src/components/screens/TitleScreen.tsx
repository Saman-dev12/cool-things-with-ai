import React, { useState, useEffect } from 'react';
import { Play, HelpCircle, RefreshCw } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: (seed: number, mode: 'survival' | 'creative') => void;
}

const SPLASH_TEXTS = [
  'Now in WebGL!',
  '100% Pure Three.js!',
  'Watch out for Creepers!',
  'May contain redstone!',
  'Chunk meshing at 60 FPS!',
  'Try flying with F!',
  'Crafting included!',
  'Pixel-perfect voxels!'
];

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame }) => {
  const [splash, setSplash] = useState('');
  const [seedInput, setSeedInput] = useState('1337');
  const [gameMode, setGameMode] = useState<'survival' | 'creative'>('creative');
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const randomSplash = SPLASH_TEXTS[Math.floor(Math.random() * SPLASH_TEXTS.length)];
    setSplash(randomSplash);
  }, []);

  const handleStart = () => {
    let numericSeed = parseInt(seedInput);
    if (isNaN(numericSeed)) {
      // Hash string seed
      let hash = 0;
      for (let i = 0; i < seedInput.length; i++) {
        hash = (hash << 5) - hash + seedInput.charCodeAt(i);
        hash |= 0;
      }
      numericSeed = Math.abs(hash);
    }
    onStartGame(numericSeed, gameMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-8 select-none font-mono text-white overflow-hidden bg-gradient-to-b from-blue-900 via-sky-800 to-emerald-950">
      {/* Moving Panorama Background Effect */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,transparent_100%)]" 
      />

      {/* Title Header */}
      <div className="relative flex flex-col items-center mt-12">
        {/* Minecraft 3D Header Logo */}
        <div className="relative">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-widest text-[#d4d4d4] drop-shadow-[0_8px_0_#333] stroke-black uppercase">
            MINECRAFT
          </h1>
          <span className="block text-center text-xs sm:text-sm tracking-widest text-amber-300 font-bold -mt-1 drop-shadow">
            WEB EDITION 1.20.4
          </span>

          {/* Iconic Bouncing Yellow Splash Text */}
          <div className="absolute -bottom-3 -right-8 sm:-right-14 transform -rotate-12 animate-pulse">
            <span className="text-sm sm:text-base font-bold text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] whitespace-nowrap bg-black/40 px-2 py-0.5 rounded">
              {splash}
            </span>
          </div>
        </div>
      </div>

      {/* Center Main Menu Card */}
      <div className="flex flex-col items-center gap-3 w-full max-w-sm z-10">
        {/* Game Mode Selector */}
        <div className="w-full flex items-center justify-between p-1 bg-[#222]/80 border-2 border-zinc-700 rounded text-xs mb-1">
          <span className="text-zinc-400 pl-2">Game Mode:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setGameMode('creative')}
              className={`px-3 py-1 rounded transition cursor-pointer ${
                gameMode === 'creative' ? 'bg-cyan-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Creative
            </button>
            <button
              onClick={() => setGameMode('survival')}
              className={`px-3 py-1 rounded transition cursor-pointer ${
                gameMode === 'survival' ? 'bg-amber-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Survival
            </button>
          </div>
        </div>

        {/* Seed Input */}
        <div className="w-full flex items-center gap-2 bg-[#222]/80 border-2 border-zinc-700 px-3 py-1.5 rounded text-xs">
          <span className="text-zinc-400 whitespace-nowrap">World Seed:</span>
          <input
            type="text"
            value={seedInput}
            onChange={e => setSeedInput(e.target.value)}
            className="w-full bg-transparent text-amber-300 font-bold focus:outline-none"
            placeholder="1337"
          />
          <button
            onClick={() => setSeedInput(Math.floor(Math.random() * 99999).toString())}
            title="Random Seed"
            className="text-zinc-400 hover:text-white p-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Play Button */}
        <button
          onClick={handleStart}
          className="w-full py-3 px-6 bg-[#555] hover:bg-[#666] active:bg-[#444] border-t-2 border-l-2 border-[#888] border-b-2 border-r-2 border-[#222] text-white font-bold text-base tracking-wider shadow-xl transition cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Generate & Enter World</span>
        </button>

        {/* Controls Guide Button */}
        <button
          onClick={() => setShowControls(true)}
          className="w-full py-2.5 px-4 bg-[#444] hover:bg-[#555] active:bg-[#333] border-t-2 border-l-2 border-[#666] border-b-2 border-r-2 border-[#222] text-zinc-300 font-bold text-xs tracking-wide shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Controls & Keybindings</span>
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between w-full text-[11px] text-zinc-400 max-w-4xl border-t border-white/10 pt-4">
        <span>Minecraft Web Edition (Three.js Voxel Engine)</span>
        <span>Built with ❤️ for cool-things-with-ai</span>
      </div>

      {/* Controls Modal */}
      {showControls && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#2c2c2c] border-4 border-[#181818] rounded-lg w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-lg font-bold text-center text-amber-300">Keyboard & Mouse Controls</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
              <div className="p-2 bg-[#222] rounded border border-zinc-700">
                <span className="font-bold text-white">W / A / S / D</span>
                <p className="text-[11px] text-zinc-400">Walk & Strafe</p>
              </div>
              <div className="p-2 bg-[#222] rounded border border-zinc-700">
                <span className="font-bold text-white">Spacebar</span>
                <p className="text-[11px] text-zinc-400">Jump / Swim / Fly Up</p>
              </div>
              <div className="p-2 bg-[#222] rounded border border-zinc-700">
                <span className="font-bold text-white">Left Click</span>
                <p className="text-[11px] text-zinc-400">Break / Mine Block</p>
              </div>
              <div className="p-2 bg-[#222] rounded border border-zinc-700">
                <span className="font-bold text-white">Right Click</span>
                <p className="text-[11px] text-zinc-400">Place Block / Ignite TNT</p>
              </div>
              <div className="p-2 bg-[#222] rounded border border-zinc-700">
                <span className="font-bold text-white">F Key (or double-Space)</span>
                <p className="text-[11px] text-zinc-400">Toggle Creative Flight</p>
              </div>
              <div className="p-2 bg-[#222] rounded border border-zinc-700">
                <span className="font-bold text-white">Shift Key</span>
                <p className="text-[11px] text-zinc-400">Sneak (Ledge Protection) / Fly Down</p>
              </div>
              <div className="p-2 bg-[#222] rounded border border-zinc-700">
                <span className="font-bold text-white">Ctrl Key</span>
                <p className="text-[11px] text-zinc-400">Sprint (FOV Kick)</p>
              </div>
              <div className="p-2 bg-[#222] rounded border border-zinc-700">
                <span className="font-bold text-white">E Key</span>
                <p className="text-[11px] text-zinc-400">Open Inventory & Crafting</p>
              </div>
              <div className="p-2 bg-[#222] rounded border border-zinc-700">
                <span className="font-bold text-white">1 - 9 Keys / Wheel</span>
                <p className="text-[11px] text-zinc-400">Select Hotbar Slot</p>
              </div>
              <div className="p-2 bg-[#222] rounded border border-zinc-700">
                <span className="font-bold text-white">F3 Key</span>
                <p className="text-[11px] text-zinc-400">Toggle Debug Screen</p>
              </div>
            </div>
            <button
              onClick={() => setShowControls(false)}
              className="w-full py-2 bg-[#555] hover:bg-[#666] border-t-2 border-l-2 border-[#888] border-b-2 border-r-2 border-[#222] text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
