import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Disc,
  Radio,
  ListMusic,
  Sparkles,
} from 'lucide-react';
import { musicPlayer, type TrackInfo } from '../../audio/soundEngine';
import { soundFx } from '../../audio/soundEngine';

export const MusicApp: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(musicPlayer.getIsPlaying());
  const [currentTrack, setCurrentTrack] = useState<TrackInfo>(musicPlayer.getTrack());
  const [currentIdx, setCurrentIdx] = useState(musicPlayer.getCurrentTrackIdx());
  const [volume, setVolume] = useState(musicPlayer.getVolume());
  const [elapsed, setElapsed] = useState(musicPlayer.getElapsedSeconds());
  const [showPlaylist, setShowPlaylist] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const allTracks = musicPlayer.getAllTracks();

  useEffect(() => {
    const unsubscribe = musicPlayer.subscribe(() => {
      setIsPlaying(musicPlayer.getIsPlaying());
      setCurrentTrack(musicPlayer.getTrack());
      setCurrentIdx(musicPlayer.getCurrentTrackIdx());
      setVolume(musicPlayer.getVolume());
      setElapsed(musicPlayer.getElapsedSeconds());
    });
    return unsubscribe;
  }, []);

  // Real-time audio spectrum visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      animationId = requestAnimationFrame(render);
      const width = (canvas.width = canvas.parentElement?.clientWidth || 360);
      const height = (canvas.height = 64);

      ctx.clearRect(0, 0, width, height);

      const analyser = musicPlayer.analyser;
      if (analyser && isPlaying) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 1.8;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height * 0.95;

          const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
          gradient.addColorStop(0, '#38bdf8'); // Sky blue
          gradient.addColorStop(0.5, '#818cf8'); // Indigo
          gradient.addColorStop(1, '#ec4899'); // Rose

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, Math.max(2, barWidth - 3), barHeight, 2);
          ctx.fill();

          x += barWidth;
        }
      } else {
        // Idle gentle waveform
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const time = Date.now() * 0.002;
        for (let x = 0; x < width; x += 4) {
          const y = height * 0.5 + Math.sin(x * 0.04 + time) * 3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  const handlePlayToggle = () => {
    soundFx.click();
    musicPlayer.togglePlay();
  };

  const handleNext = () => {
    soundFx.click();
    musicPlayer.nextTrack();
  };

  const handlePrev = () => {
    soundFx.click();
    musicPlayer.prevTrack();
  };

  const handleTrackSelect = (idx: number) => {
    soundFx.click();
    musicPlayer.selectTrack(idx);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSeconds = clickRatio * currentTrack.duration;
    musicPlayer.seek(targetSeconds);
  };

  const progressPercent = Math.min(100, (elapsed / (currentTrack.duration || 1)) * 100);

  return (
    <div className="w-full h-full bg-[#080d18] p-4 text-white flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* Top Track & Album Info */}
      <div className="flex items-center gap-3.5">
        {/* Realistic Vinyl Album Art */}
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 p-1 shadow-2xl border border-white/10 shrink-0 flex items-center justify-center overflow-hidden group">
          <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center relative overflow-hidden">
            <Disc
              className={`w-14 h-14 text-indigo-400 transition-transform duration-1000 ${
                isPlaying ? 'animate-spin' : ''
              }`}
            />
            <div className="absolute w-4 h-4 rounded-full bg-slate-900 border border-white/20 shadow-inner" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold tracking-wider uppercase border border-indigo-500/30">
              {currentTrack.genre.split('/')[0]}
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
              <Radio className="w-3 h-3 animate-pulse" /> Lossless 96kHz
            </span>
          </div>

          <h2 className="text-lg font-bold text-white truncate mt-1 tracking-tight">
            {currentTrack.title}
          </h2>
          <p className="text-xs text-gray-400 truncate mt-0.5 font-mono">
            {currentTrack.artist} • {currentTrack.bpm} BPM • {formatSeconds(currentTrack.duration)}
          </p>
        </div>

        <button
          onClick={() => setShowPlaylist(!showPlaylist)}
          className={`p-2 rounded-xl border transition cursor-pointer ${
            showPlaylist
              ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
              : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
          }`}
          title="Toggle Playlist"
        >
          <ListMusic className="w-4 h-4" />
        </button>
      </div>

      {/* Reactive Real-Time Visualizer */}
      <div className="w-full h-16 bg-slate-950/80 rounded-xl border border-white/8 p-2 relative overflow-hidden flex items-center justify-center shadow-inner my-2">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Interactive Playlist Drawer */}
      {showPlaylist && (
        <div className="bg-slate-950/60 rounded-xl border border-white/10 p-2 space-y-1 max-h-36 overflow-y-auto mb-2 text-xs font-sans">
          <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider px-2 pb-1 border-b border-white/5 flex items-center justify-between">
            <span>AetherOS Studio Hi-Fi Masters ({allTracks.length} Real Tracks)</span>
            <span className="text-cyan-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Live
            </span>
          </div>
          {allTracks.map((t, idx) => {
            const isSelected = currentIdx === idx;
            return (
              <div
                key={t.id}
                onClick={() => handleTrackSelect(idx)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition ${
                  isSelected
                    ? 'bg-indigo-600/25 border border-indigo-500/40 text-white font-medium'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[10px] text-gray-500 w-3">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <div className="text-xs font-medium truncate">{t.title}</div>
                    <div className="text-[10px] text-gray-400 truncate">{t.artist} • {t.genre}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-gray-400">
                  {isSelected && isPlaying && (
                    <span className="flex items-center gap-0.5 text-pink-400">
                      <span className="w-1 h-3 bg-pink-400 rounded-full animate-bounce" />
                      <span className="w-1 h-2 bg-pink-400 rounded-full animate-bounce delay-75" />
                      <span className="w-1 h-3 bg-pink-400 rounded-full animate-bounce delay-150" />
                    </span>
                  )}
                  <span>{formatSeconds(t.duration)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Progress Scrubber (Interactive Seeking) */}
      <div className="space-y-1">
        <div
          onClick={handleScrubberClick}
          className="group relative w-full h-2 bg-gray-800/80 hover:h-2.5 rounded-full overflow-hidden cursor-pointer transition-all"
          title="Click to seek"
        >
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 rounded-full transition-all duration-150 relative"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-gray-400 font-mono">
          <span className="text-cyan-300 font-semibold">{formatSeconds(elapsed)}</span>
          <span>{formatSeconds(currentTrack.duration)}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 text-gray-300 hover:text-white transition cursor-pointer active:scale-95"
            title="Previous Track"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={handlePlayToggle}
            className="p-2.5 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition shadow-xl font-bold cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
          <button
            onClick={handleNext}
            className="p-2 text-gray-300 hover:text-white transition cursor-pointer active:scale-95"
            title="Next Track"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.click();
              musicPlayer.setVolume(volume > 0 ? 0 : 0.4);
            }}
            className="text-gray-400 hover:text-white cursor-pointer"
            title={volume > 0 ? 'Mute' : 'Unmute'}
          >
            {volume > 0 ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => musicPlayer.setVolume(parseFloat(e.target.value))}
            className="w-20 accent-cyan-400 cursor-pointer h-1.5 bg-gray-800 rounded-lg"
          />
          <span className="text-[10px] font-mono text-gray-400 w-7">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
