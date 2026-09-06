import React, { useEffect } from 'react';
import { OSProvider, useOS } from './context/OSContext';
import { WorkstationScene } from './components/scene/WorkstationScene';
import { Desktop } from './components/os/Desktop';
import { Monitor, Footprints } from 'lucide-react';
import { soundFx } from './audio/soundEngine';

const MainLayout: React.FC = () => {
  const { cameraMode, setCameraMode } = useOS();

  // Instant Stand Up / Mode Switching via Keyboard
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      // If sitting at desk, pressing WASD or Arrow Keys or Space immediately stands up and starts walking!
      if (cameraMode === 'desk') {
        if (
          e.code === 'KeyW' ||
          key === 'w' ||
          e.code === 'KeyA' ||
          key === 'a' ||
          e.code === 'KeyS' ||
          key === 's' ||
          e.code === 'KeyD' ||
          key === 'd' ||
          e.code === 'ArrowUp' ||
          e.code === 'ArrowDown' ||
          e.code === 'ArrowLeft' ||
          e.code === 'ArrowRight' ||
          e.code === 'Space'
        ) {
          soundFx.click();
          setCameraMode('fpv');
        }
      } else if (cameraMode === 'screen') {
        if (e.code === 'Escape') {
          soundFx.click();
          setCameraMode('desk');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [cameraMode, setCameraMode]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-white select-none">
      {/* 1. 3D Studio Loft Scene with Photorealistic Room, RTX 5090 Rig & FPV Controls */}
      <div className="absolute inset-0 z-0">
        <WorkstationScene />
      </div>

      {/* 2. Interactive 1:1 Desktop Screen Overlay when in Focus Mode */}
      <div
        className={`absolute inset-0 z-30 transition-all duration-700 ${
          cameraMode === 'screen'
            ? 'opacity-100 pointer-events-auto scale-100'
            : 'opacity-0 pointer-events-none scale-95'
        }`}
      >
        <Desktop />
      </div>

      {/* 3. In Desk Sitting Mode: Action Controls (Use Computer / Stand Up & Walk) */}
      {cameraMode === 'desk' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
          <button
            onClick={() => {
              soundFx.click();
              setCameraMode('fpv');
            }}
            className="px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs shadow-2xl flex items-center gap-2 cursor-pointer border border-white/20 transition-all duration-200 active:scale-95"
            title="Stand up from desk and freely explore the studio room with WASD"
          >
            <Footprints className="w-4 h-4 text-emerald-400" />
            <span>STAND UP & WALK (WASD)</span>
          </button>

          <button
            onClick={() => {
              soundFx.click();
              setCameraMode('screen');
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:brightness-110 active:scale-95 text-white font-bold text-sm shadow-[0_15px_40px_rgba(6,182,212,0.4)] flex items-center gap-2.5 cursor-pointer border border-cyan-300/40 transition-all duration-200"
            title="Focus directly onto the desktop screen"
          >
            <Monitor className="w-5 h-5" />
            <span>USE COMPUTER / OPEN SCREEN</span>
          </button>
        </div>
      )}

      {/* 4. When in 1:1 Screen Mode: Stand Up / Back to 3D Room Pill */}
      {cameraMode === 'screen' && (
        <div className="absolute top-8 right-6 z-40 pointer-events-auto">
          <button
            onClick={() => {
              soundFx.click();
              setCameraMode('fpv');
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-500/40 text-emerald-300 hover:text-white hover:bg-emerald-500/20 text-xs font-semibold shadow-xl transition cursor-pointer backdrop-blur-md"
            title="Exit screen and walk around the 3D room"
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Stand Up & Explore Room (ESC)</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <OSProvider>
      <MainLayout />
    </OSProvider>
  );
}
