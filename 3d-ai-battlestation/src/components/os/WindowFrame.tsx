import React, { useRef } from 'react';
import { Minus, Square, X, Terminal, Music, Gamepad2, Globe, Code, Bot, Settings, Image } from 'lucide-react';
import type { AppWindow } from '../../types/os';
import { useOS } from '../../context/OSContext';
import { TerminalApp } from '../apps/TerminalApp';
import { MusicApp } from '../apps/MusicApp';
import { ArcadeApp } from '../apps/ArcadeApp';
import { BrowserApp } from '../apps/BrowserApp';
import { CodeEditorApp } from '../apps/CodeEditorApp';
import { ChatApp } from '../apps/ChatApp';
import { SettingsApp } from '../apps/SettingsApp';
import { GalleryApp } from '../apps/GalleryApp';

interface WindowFrameProps {
  app: AppWindow;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ app }) => {
  const {
    activeAppId,
    focusApp,
    closeApp,
    minimizeApp,
    maximizeApp,
    updateWindowPos,
    updateWindowSize,
  } = useOS();

  const isFocused = activeAppId === app.id;
  const isDragging = useRef(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });

  const isResizing = useRef(false);
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, winW: 0, winH: 0 });

  if (!app.isOpen || app.isMinimized) return null;

  const handleMouseDown = () => {
    focusApp(app.id);
  };

  // Drag logic
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (app.isMaximized) return;
    isDragging.current = true;
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: app.position.x,
      winY: app.position.y,
    };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = ev.clientX - dragStart.current.mouseX;
      const dy = ev.clientY - dragStart.current.mouseY;
      const newX = Math.max(0, dragStart.current.winX + dx);
      const newY = Math.max(38, dragStart.current.winY + dy); // Ensure titlebar stays below top menu bar
      updateWindowPos(app.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Resize logic
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (app.isMaximized) return;
    isResizing.current = true;
    resizeStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winW: app.size.width,
      winH: app.size.height,
    };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isResizing.current) return;
      const dw = ev.clientX - resizeStart.current.mouseX;
      const dh = ev.clientY - resizeStart.current.mouseY;
      const newW = Math.max(380, resizeStart.current.winW + dw);
      const newH = Math.max(280, resizeStart.current.winH + dh);
      updateWindowSize(app.id, { width: newW, height: newH });
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const renderAppContent = () => {
    switch (app.id) {
      case 'terminal':
        return <TerminalApp />;
      case 'music':
        return <MusicApp />;
      case 'arcade':
        return <ArcadeApp />;
      case 'browser':
        return <BrowserApp />;
      case 'code':
        return <CodeEditorApp />;
      case 'chat':
        return <ChatApp />;
      case 'settings':
        return <SettingsApp />;
      case 'gallery':
        return <GalleryApp />;
      default:
        return <div className="p-4 text-white">App Content</div>;
    }
  };

  const getAppIcon = () => {
    switch (app.id) {
      case 'terminal':
        return <Terminal className="w-3.5 h-3.5 text-emerald-400" />;
      case 'music':
        return <Music className="w-3.5 h-3.5 text-pink-400" />;
      case 'arcade':
        return <Gamepad2 className="w-3.5 h-3.5 text-yellow-400" />;
      case 'browser':
        return <Globe className="w-3.5 h-3.5 text-cyan-400" />;
      case 'code':
        return <Code className="w-3.5 h-3.5 text-teal-400" />;
      case 'chat':
        return <Bot className="w-3.5 h-3.5 text-purple-400" />;
      case 'settings':
        return <Settings className="w-3.5 h-3.5 text-gray-300" />;
      case 'gallery':
        return <Image className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Terminal className="w-3.5 h-3.5" />;
    }
  };

  const style: React.CSSProperties = app.isMaximized
    ? {
        position: 'absolute',
        top: 36, // Below top menu bar
        left: 0,
        width: '100%',
        height: 'calc(100% - 36px - 64px)', // Reserve dock & menu bar space
        zIndex: 20 + app.zIndex,
      }
    : {
        position: 'absolute',
        left: `${Math.max(0, app.position.x)}px`,
        top: `${Math.max(40, app.position.y)}px`,
        width: `${app.size.width}px`,
        height: `${app.size.height}px`,
        zIndex: 20 + app.zIndex,
      };

  return (
    <div
      style={style}
      onMouseDown={handleMouseDown}
      className={`flex flex-col rounded-2xl overflow-hidden transition-all duration-150 pointer-events-auto select-none ${
        isFocused
          ? 'shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.18)] ring-1 ring-white/10'
          : 'shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] opacity-95'
      }`}
    >
      <div className="flex flex-col h-full rounded-2xl overflow-hidden bg-slate-900/95 backdrop-blur-3xl border border-white/10">
        {/* Authentic macOS Titlebar */}
        <div
          onMouseDown={handleHeaderMouseDown}
          onDoubleClick={() => maximizeApp(app.id)}
          className="h-10 px-3.5 flex items-center justify-between cursor-move select-none border-b border-white/8 bg-slate-950/80 backdrop-blur-md"
        >
          {/* macOS Traffic Light Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeApp(app.id);
              }}
              className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-110 flex items-center justify-center text-black/80 transition shadow-inner group cursor-pointer"
              title="Close"
            >
              <X className="w-2 h-2 opacity-0 group-hover:opacity-100 transition" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                minimizeApp(app.id);
              }}
              className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:brightness-110 flex items-center justify-center text-black/80 transition shadow-inner group cursor-pointer"
              title="Minimize"
            >
              <Minus className="w-2 h-2 opacity-0 group-hover:opacity-100 transition" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                maximizeApp(app.id);
              }}
              className="w-3 h-3 rounded-full bg-[#27c93f] hover:brightness-110 flex items-center justify-center text-black/80 transition shadow-inner group cursor-pointer"
              title="Zoom / Restore"
            >
              <Square className="w-1.5 h-1.5 opacity-0 group-hover:opacity-100 transition" />
            </button>

            {/* Window Icon & Title */}
            <div className="flex items-center gap-2 ml-3">
              {getAppIcon()}
              <span className="text-xs font-semibold text-gray-200 tracking-tight font-sans">
                {app.title}
              </span>
            </div>
          </div>

          {/* Window Dimensions Tag */}
          <div className="text-[10px] text-gray-500 font-mono tracking-tighter">
            {app.size.width} × {app.size.height}
          </div>
        </div>

        {/* Real App Content Body */}
        <div className="flex-1 relative overflow-hidden bg-slate-950/90">{renderAppContent()}</div>

        {/* Bottom-Right Subtle Resize Handle */}
        {!app.isMaximized && (
          <div
            onMouseDown={handleResizeMouseDown}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 flex items-end justify-end p-0.5 opacity-40 hover:opacity-100 transition"
            title="Resize Window"
          >
            <div className="w-2 h-2 border-r border-b border-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
};
