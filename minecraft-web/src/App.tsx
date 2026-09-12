import React, { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from './components/canvas/GameCanvas';
import { Crosshair } from './components/hud/Crosshair';
import { Hotbar } from './components/hud/Hotbar';
import { StatusBars } from './components/hud/StatusBars';
import { F3DebugOverlay } from './components/hud/F3DebugOverlay';
import { InventoryModal } from './components/screens/InventoryModal';
import { PauseMenu } from './components/screens/PauseMenu';
import { SettingsModal } from './components/screens/SettingsModal';
import { TitleScreen } from './components/screens/TitleScreen';
import {
  BlockType,
  GameSettings,
  GameScreen,
  InventorySlot,
  PlayerState,
  TargetedBlock
} from './types';
import { SoundManager } from './audio/SoundManager';

const DEFAULT_SETTINGS: GameSettings = {
  fov: 75,
  renderDistance: 3,
  mouseSensitivity: 1.0,
  invertY: false,
  volume: 0.5,
  dayNightSpeed: 1.0,
  showF3: false
};

const INITIAL_HOTBAR: InventorySlot[] = [
  { block: BlockType.GRASS, count: 64 },
  { block: BlockType.OAK_PLANKS, count: 64 },
  { block: BlockType.COBBLESTONE, count: 64 },
  { block: BlockType.OAK_LOG, count: 64 },
  { block: BlockType.OAK_LEAVES, count: 64 },
  { block: BlockType.GLASS, count: 64 },
  { block: BlockType.BRICKS, count: 64 },
  { block: BlockType.DIAMOND_ORE, count: 64 },
  { block: BlockType.TNT, count: 64 }
];

export const App: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [hotbar, setHotbar] = useState<InventorySlot[]>(INITIAL_HOTBAR);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

  const [playerState, setPlayerState] = useState<PlayerState>({
    position: [8, 35, 8],
    velocity: [0, 0, 0],
    rotation: [0, 0],
    isGrounded: false,
    isSprinting: false,
    isSneaking: false,
    isSwimming: false,
    isFlying: false,
    inWater: false,
    health: 20,
    hunger: 20,
    experience: 0,
    level: 0,
    oxygen: 20,
    gameMode: 'creative'
  });

  const [fps, setFps] = useState(60);
  const [targetedBlock, setTargetedBlock] = useState<TargetedBlock | null>(null);

  // Sync volume with SoundManager
  useEffect(() => {
    SoundManager.getInstance().volume = settings.volume;
  }, [settings.volume]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen === 'title') return;

      // F3 Debug Toggle
      if (e.code === 'F3') {
        e.preventDefault();
        setSettings(prev => ({ ...prev, showF3: !prev.showF3 }));
        return;
      }

      // E Key - Inventory Toggle
      if (e.code === 'KeyE') {
        if (screen === 'playing') {
          document.exitPointerLock?.();
          setScreen('inventory');
        } else if (screen === 'inventory') {
          setScreen('playing');
        }
        return;
      }

      // ESC Key - Pause / Resume
      if (e.code === 'Escape') {
        if (screen === 'playing') {
          document.exitPointerLock?.();
          setScreen('paused');
        } else if (screen === 'paused' || screen === 'inventory' || screen === 'settings') {
          setScreen('playing');
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen]);

  const handleStartGame = (seed: number, mode: 'survival' | 'creative') => {
    setPlayerState(prev => ({ ...prev, gameMode: mode }));
    setScreen('playing');
  };

  const handleSelectSlot = useCallback((idx: number) => {
    setActiveSlotIndex(idx);
    SoundManager.getInstance().playClick();
  }, []);

  const handleSetHotbarSlot = useCallback((slotIdx: number, block: BlockType, count: number) => {
    setHotbar(prev => {
      const next = [...prev];
      next[slotIdx] = { block, count };
      return next;
    });
  }, []);

  const handleBlockMined = useCallback((blockType: BlockType) => {
    // Add mined block to hotbar or increment
    setHotbar(prev => {
      const existing = prev.findIndex(s => s.block === blockType);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { ...next[existing], count: next[existing].count + 1 };
        return next;
      }
      // Place in active slot if empty
      const next = [...prev];
      next[activeSlotIndex] = { block: blockType, count: 1 };
      return next;
    });
  }, [activeSlotIndex]);

  const handleBlockPlaced = useCallback((slotIdx: number) => {
    if (playerState.gameMode === 'survival') {
      setHotbar(prev => {
        const next = [...prev];
        const count = next[slotIdx].count - 1;
        if (count <= 0) {
          next[slotIdx] = { block: BlockType.AIR, count: 0 };
        } else {
          next[slotIdx] = { ...next[slotIdx], count };
        }
        return next;
      });
    }
  }, [playerState.gameMode]);

  const activeBlock = hotbar[activeSlotIndex]?.block || BlockType.AIR;

  return (
    <div className="w-full h-full relative overflow-hidden bg-black select-none font-mono">
      {/* Title Screen */}
      {screen === 'title' && (
        <TitleScreen onStartGame={handleStartGame} />
      )}

      {/* 3D Game Canvas (Active whenever game has started) */}
      {screen !== 'title' && (
        <>
          <GameCanvas
            settings={settings}
            activeBlock={activeBlock}
            hotbar={hotbar}
            activeSlotIndex={activeSlotIndex}
            onTargetChange={setTargetedBlock}
            onPlayerUpdate={(st, curFps) => {
              setPlayerState(st);
              setFps(curFps);
            }}
            onBlockMined={handleBlockMined}
            onBlockPlaced={handleBlockPlaced}
            isPaused={screen !== 'playing'}
          />

          {/* HUD (Crosshair, Hotbar, Hearts/Hunger/XP, F3) */}
          <Crosshair />
          <Hotbar
            hotbar={hotbar}
            activeSlotIndex={activeSlotIndex}
            onSelectSlot={handleSelectSlot}
          />
          <StatusBars playerState={playerState} />
          <F3DebugOverlay
            playerState={playerState}
            target={targetedBlock}
            fps={fps}
            show={settings.showF3}
          />

          {/* Modals & Menus */}
          <InventoryModal
            isOpen={screen === 'inventory'}
            onClose={() => setScreen('playing')}
            hotbar={hotbar}
            activeSlotIndex={activeSlotIndex}
            onSetHotbarSlot={handleSetHotbarSlot}
          />

          <PauseMenu
            isOpen={screen === 'paused'}
            onResume={() => setScreen('playing')}
            onOpenSettings={() => setScreen('settings')}
            onToggleGameMode={() => {
              const newMode = playerState.gameMode === 'creative' ? 'survival' : 'creative';
              setPlayerState(prev => ({ ...prev, gameMode: newMode }));
            }}
            onQuitToTitle={() => setScreen('title')}
            gameMode={playerState.gameMode}
          />

          <SettingsModal
            isOpen={screen === 'settings'}
            onClose={() => setScreen('paused')}
            settings={settings}
            onUpdateSettings={newSt => setSettings(prev => ({ ...prev, ...newSt }))}
          />
        </>
      )}
    </div>
  );
};
