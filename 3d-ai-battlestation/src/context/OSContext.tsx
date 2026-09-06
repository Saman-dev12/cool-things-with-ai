import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppId, AppWindow, ThemeConfig, Wallpaper, CameraMode } from '../types/os';
import { THEMES, WALLPAPERS } from '../data/themes';
import { soundFx } from '../audio/soundEngine';

interface OSContextType {
  windows: AppWindow[];
  activeAppId: AppId | null;
  openApp: (id: AppId) => void;
  closeApp: (id: AppId) => void;
  minimizeApp: (id: AppId) => void;
  maximizeApp: (id: AppId) => void;
  focusApp: (id: AppId) => void;
  updateWindowPos: (id: AppId, pos: { x: number; y: number }) => void;
  updateWindowSize: (id: AppId, size: { width: number; height: number }) => void;

  currentTheme: ThemeConfig;
  setTheme: (id: string) => void;
  currentWallpaper: Wallpaper;
  setWallpaper: (id: string) => void;

  cameraMode: CameraMode;
  setCameraMode: (mode: CameraMode) => void;
  toggleCameraMode: () => void;

  isRoomLampOn: boolean;
  toggleRoomLamp: () => void;

  isMuted: boolean;
  toggleSound: () => void;

  notification: { title: string; message: string } | null;
  showNotification: (title: string, message: string) => void;
  closeAllWindows: () => void;
  resetWindowPositions: () => void;
}

const DEFAULT_WINDOWS: AppWindow[] = [
  {
    id: 'terminal',
    title: 'CyberTerminal (zsh)',
    icon: 'Terminal',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    position: { x: 220, y: 55 },
    size: { width: 560, height: 380 },
    zIndex: 10,
  },
  {
    id: 'music',
    title: 'WaveBeats Synthesizer',
    icon: 'Music',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    position: { x: 750, y: 65 },
    size: { width: 420, height: 440 },
    zIndex: 11,
  },
  {
    id: 'browser',
    title: 'NetSurfer Quantum',
    icon: 'Globe',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: { x: 230, y: 55 },
    size: { width: 680, height: 460 },
    zIndex: 5,
  },
  {
    id: 'arcade',
    title: 'Neon Invaders 1984',
    icon: 'Gamepad2',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: { x: 280, y: 55 },
    size: { width: 520, height: 480 },
    zIndex: 6,
  },
  {
    id: 'code',
    title: 'CodeCraft Studio',
    icon: 'Code',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: { x: 240, y: 55 },
    size: { width: 700, height: 480 },
    zIndex: 7,
  },
  {
    id: 'chat',
    title: 'NeuralChat AI (Aether-9)',
    icon: 'Bot',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: { x: 300, y: 65 },
    size: { width: 460, height: 480 },
    zIndex: 8,
  },
  {
    id: 'settings',
    title: 'System Settings & 3D RGB',
    icon: 'Settings',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: { x: 260, y: 65 },
    size: { width: 520, height: 420 },
    zIndex: 9,
  },
  {
    id: 'gallery',
    title: 'HoloGallery Wallpapers',
    icon: 'Image',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: { x: 250, y: 65 },
    size: { width: 580, height: 440 },
    zIndex: 9,
  },
];

const OSContext = createContext<OSContextType | null>(null);

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<AppWindow[]>(DEFAULT_WINDOWS);
  const [activeAppId, setActiveAppId] = useState<AppId | null>('music');
  const [currentTheme, setCurrentThemeState] = useState<ThemeConfig>(THEMES[0]);
  const [currentWallpaper, setCurrentWallpaperState] = useState<Wallpaper>(WALLPAPERS[0]);
  const [cameraMode, setCameraMode] = useState<CameraMode>('desk');
  const [isRoomLampOn, setIsRoomLampOn] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ title: string; message: string } | null>({
    title: 'AetherOS 4.2 Online',
    message: 'System ready! Type commands in Terminal or play synth beats in WaveBeats.',
  });

  const getHighestZIndex = () => {
    return Math.max(...windows.map((w) => w.zIndex), 10);
  };

  const focusApp = (id: AppId) => {
    setActiveAppId(id);
    const nextZ = getHighestZIndex() + 1;
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, zIndex: nextZ, isMinimized: false }
          : w
      )
    );
  };

  const openApp = (id: AppId) => {
    soundFx.windowOpen();
    const nextZ = getHighestZIndex() + 1;
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, isOpen: true, isMinimized: false, zIndex: nextZ }
          : w
      )
    );
    setActiveAppId(id);
  };

  const closeApp = (id: AppId) => {
    soundFx.windowClose();
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isOpen: false, isMaximized: false } : w))
    );
    if (activeAppId === id) {
      setActiveAppId(null);
    }
  };

  const minimizeApp = (id: AppId) => {
    soundFx.click();
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (activeAppId === id) {
      setActiveAppId(null);
    }
  };

  const maximizeApp = (id: AppId) => {
    soundFx.click();
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
    focusApp(id);
  };

  const updateWindowPos = (id: AppId, pos: { x: number; y: number }) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, position: pos } : w))
    );
  };

  const updateWindowSize = (id: AppId, size: { width: number; height: number }) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, size: size } : w))
    );
  };

  const setTheme = (id: string) => {
    const t = THEMES.find((item) => item.id === id);
    if (t) {
      setCurrentThemeState(t);
      soundFx.click();
      showNotification('Theme Updated', `Switched to ${t.name}`);
    }
  };

  const setWallpaper = (id: string) => {
    const w = WALLPAPERS.find((item) => item.id === id);
    if (w) {
      setCurrentWallpaperState(w);
      soundFx.click();
      showNotification('Wallpaper Changed', `Applied "${w.name}"`);
    }
  };

  const toggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) soundFx.click();
  };

  const toggleRoomLamp = () => {
    soundFx.click();
    setIsRoomLampOn((prev) => !prev);
    showNotification('Studio Lighting', !isRoomLampOn ? 'Turned lamp ON' : 'Turned lamp OFF');
  };

  const toggleCameraMode = () => {
    soundFx.click();
    setCameraMode((prev) => (prev === 'screen' ? 'desk' : prev === 'desk' ? 'fpv' : 'desk'));
  };

  const showNotification = (title: string, message: string) => {
    setNotification({ title, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.title === title ? null : curr));
    }, 4500);
  };

  const closeAllWindows = () => {
    soundFx.windowClose();
    setWindows((prev) => prev.map((w) => ({ ...w, isOpen: false, isMaximized: false })));
    setActiveAppId(null);
  };

  const resetWindowPositions = () => {
    soundFx.click();
    setWindows(DEFAULT_WINDOWS);
    setActiveAppId('terminal');
    showNotification('Windows Reset', 'Restored default workspace window arrangement.');
  };

  useEffect(() => {
    soundFx.bootChime();
  }, []);

  return (
    <OSContext.Provider
      value={{
        windows,
        activeAppId,
        openApp,
        closeApp,
        minimizeApp,
        maximizeApp,
        focusApp,
        updateWindowPos,
        updateWindowSize,
        currentTheme,
        setTheme,
        currentWallpaper,
        setWallpaper,
        cameraMode,
        setCameraMode,
        toggleCameraMode,
        isRoomLampOn,
        toggleRoomLamp,
        isMuted,
        toggleSound,
        notification,
        showNotification,
        closeAllWindows,
        resetWindowPositions,
      }}
    >
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error('useOS must be used within OSProvider');
  return ctx;
};
