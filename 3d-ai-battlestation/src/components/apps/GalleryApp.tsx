import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { WALLPAPERS } from '../../data/themes';
import { Image as ImageIcon, Check, Sparkles, Monitor, Sun } from 'lucide-react';
import { soundFx } from '../../audio/soundEngine';

export const GalleryApp: React.FC = () => {
  const { currentWallpaper, setWallpaper } = useOS();
  const [previewWpId, setPreviewWpId] = useState<string>(currentWallpaper.id);

  const activePreview = WALLPAPERS.find((w) => w.id === previewWpId) || currentWallpaper;

  const handleApply = (id: string) => {
    soundFx.arcadePowerup();
    setWallpaper(id);
  };

  return (
    <div className="w-full h-full bg-[#070a12] p-4 text-gray-200 overflow-y-auto select-none font-sans text-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-sm text-white">4K Holographic Wallpaper Studio</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> AI Photorealistic Generated
        </span>
      </div>

      {/* Featured Large Preview Hero */}
      <div className="rounded-2xl border border-white/15 overflow-hidden bg-slate-950/80 shadow-2xl relative">
        <div
          className="h-44 w-full relative flex items-end p-4 transition-all duration-300"
          style={{ background: activePreview.url }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          <div className="relative z-10 flex items-end justify-between w-full">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                  3840 × 2160 • 4K HDR
                </span>
                <span className="text-[10px] text-gray-300 flex items-center gap-1 font-mono">
                  <Sun className="w-3 h-3 text-amber-400" /> 3D Ambient Sync
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1 drop-shadow-md">
                {activePreview.name}
              </h2>
            </div>

            <button
              onClick={() => handleApply(activePreview.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition cursor-pointer flex items-center gap-1.5 ${
                currentWallpaper.id === activePreview.id
                  ? 'bg-emerald-500 text-black shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:brightness-110 active:scale-95'
              }`}
            >
              {currentWallpaper.id === activePreview.id ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Applied</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Set as Wallpaper</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Wallpaper Grid */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-300">Choose Desktop Theme & Mood:</div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {WALLPAPERS.map((wp) => {
            const isCurrent = currentWallpaper.id === wp.id;
            const isPreviewing = activePreview.id === wp.id;

            return (
              <div
                key={wp.id}
                onClick={() => {
                  soundFx.click();
                  setPreviewWpId(wp.id);
                }}
                className={`group cursor-pointer rounded-xl border overflow-hidden transition-all duration-150 ${
                  isPreviewing
                    ? 'border-cyan-400 ring-2 ring-cyan-500/30 scale-[1.02]'
                    : isCurrent
                    ? 'border-emerald-500'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {/* Thumbnail */}
                <div
                  className="h-24 w-full relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                  style={{ background: wp.url }}
                >
                  {isCurrent && (
                    <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-emerald-500 text-black font-bold text-[9px] flex items-center gap-1 shadow">
                      <Check className="w-3 h-3" /> Active
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-2 bg-slate-900 flex items-center justify-between">
                  <span className="text-[11px] text-gray-200 font-medium truncate">
                    {wp.name}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/40 shrink-0 ml-1"
                    style={{ backgroundColor: wp.dominantColor }}
                    title="Ambient Room Lighting Hue"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
