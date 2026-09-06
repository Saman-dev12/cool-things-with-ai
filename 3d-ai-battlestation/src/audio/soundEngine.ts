// Web Audio API Sound & Music Synthesizer Engine
// 100% Procedural - No external audio assets required

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private sfxVolume: number = 0.4;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Soft UI click
  public click(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(this.sfxVolume * 0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  // Mechanical switch typing click
  public keyPress(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = 1200 + Math.random() * 400;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(this.sfxVolume * 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // ignore
    }
  }

  // Window open swoosh
  public windowOpen(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.2, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // ignore
    }
  }

  // Window close swoosh
  public windowClose(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(this.sfxVolume * 0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // ignore
    }
  }

  // Retro sci-fi boot chime
  public bootChime(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25]; // C E G C E
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.09;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.22, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.85);
      });
    } catch {
      // ignore
    }
  }

  // Authentic PC power relay mechanical click
  public powerRelay(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(this.sfxVolume * 0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // ignore
    }
  }

  // Sip coffee gentle sound
  public sipCoffee(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(this.sfxVolume * 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      // ignore
    }
  }

  // Arcade laser shoot
  public arcadeLaser(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(this.sfxVolume * 0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // ignore
    }
  }

  // Arcade explosion
  public arcadeExplosion(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(this.sfxVolume * 0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // ignore
    }
  }

  // Arcade powerup sound
  public arcadePowerup(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const notes = [330, 440, 554, 659, 880];
      notes.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + i * 0.05;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, start);

        gain.gain.setValueAtTime(this.sfxVolume * 0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.12);
      });
    } catch {
      // ignore
    }
  }
}

export const soundFx = new SoundEngine();

// ==================== PROCEDURAL & REAL AUDIO MUSIC PLAYER ====================
export interface TrackInfo {
  id: number;
  title: string;
  artist: string;
  duration: number; // in seconds
  genre: string;
  bpm: number;
  audioUrl: string;
  chords: number[][];
  leadWave: OscillatorType;
  bassWave: OscillatorType;
  filterCutoff: number;
}

export const TRACKS: TrackInfo[] = [
  {
    id: 1,
    title: 'Neon Skyline (Studio Master)',
    artist: 'CyberPulse',
    duration: 372, // 6m 12s
    genre: 'Synthwave / Outrun',
    bpm: 118,
    audioUrl: '/audio/track1.mp3',
    leadWave: 'sawtooth',
    bassWave: 'triangle',
    filterCutoff: 1400,
    chords: [
      [220, 261.63, 329.63, 440],     // Am
      [174.61, 220, 261.63, 349.23],  // F
      [261.63, 329.63, 392, 523.25],  // C
      [196, 246.94, 293.66, 392],     // G
    ],
  },
  {
    id: 2,
    title: 'Midnight Rain Lofi (Full Studio)',
    artist: 'Aether Echoes',
    duration: 425, // 7m 05s
    genre: 'Lofi Chillhop',
    bpm: 84,
    audioUrl: '/audio/track2.mp3',
    leadWave: 'sine',
    bassWave: 'sine',
    filterCutoff: 750,
    chords: [
      [293.66, 349.23, 440, 523.25],  // Dm7
      [196, 246.94, 293.66, 349.23],  // G7
      [261.63, 329.63, 392, 493.88],  // Cmaj7
      [220, 261.63, 329.63, 392],     // Am7
    ],
  },
  {
    id: 3,
    title: 'Quantum Drift (Space Ambient)',
    artist: 'Void Walker',
    duration: 344, // 5m 44s
    genre: 'Cyber Ambient / Chill',
    bpm: 92,
    audioUrl: '/audio/track3.mp3',
    leadWave: 'sine',
    bassWave: 'triangle',
    filterCutoff: 950,
    chords: [
      [164.81, 220, 246.94, 329.63],  // Em9
      [174.61, 220, 261.63, 329.63],  // Fmaj7
      [220, 277.18, 329.63, 415.3],   // Amaj7
      [146.83, 220, 293.66, 369.99],  // Dadd9
    ],
  },
  {
    id: 4,
    title: 'Tokyo Overdrive (Cyberpunk)',
    artist: 'NeoShinjuku',
    duration: 302, // 5m 02s
    genre: 'Darksynth / Cyberpunk',
    bpm: 136,
    audioUrl: '/audio/track4.mp3',
    leadWave: 'square',
    bassWave: 'sawtooth',
    filterCutoff: 1800,
    chords: [
      [146.83, 220, 293.66, 349.23],  // Dm
      [130.81, 196, 261.63, 329.63],  // C
      [116.54, 174.61, 233.08, 293.66], // Bb
      [146.83, 220, 293.66, 440],     // Dm oct
    ],
  },
];

class ProceduralMusicPlayer {
  private ctx: AudioContext | null = null;
  public analyser: AnalyserNode | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private isPlaying: boolean = false;
  private currentTrackIdx: number = 0;
  private volume: number = 0.5;
  private beatIntervalId: number | null = null;
  private step: number = 0;
  private elapsedSeconds: number = 0;
  private listeners: Array<() => void> = [];
  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (!this.audioEl) {
      this.audioEl = new Audio();
      this.audioEl.crossOrigin = 'anonymous';

      // Connect HTML5 Audio into Web Audio graph for realtime spectrum visualizer!
      try {
        if (this.ctx && this.analyser) {
          this.mediaSource = this.ctx.createMediaElementSource(this.audioEl);
          this.mediaSource.connect(this.analyser);
        }
      } catch {
        // Media source might already be connected
      }

      this.audioEl.addEventListener('timeupdate', () => {
        if (this.audioEl && !isNaN(this.audioEl.currentTime)) {
          this.elapsedSeconds = Math.floor(this.audioEl.currentTime);
          this.notify();
        }
      });

      this.audioEl.addEventListener('ended', () => {
        this.nextTrack();
      });

      this.audioEl.addEventListener('loadedmetadata', () => {
        if (this.audioEl && !isNaN(this.audioEl.duration) && this.audioEl.duration > 0) {
          TRACKS[this.currentTrackIdx].duration = Math.floor(this.audioEl.duration);
          this.notify();
        }
      });
    }
  }

  public subscribe(fn: () => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getTrack(): TrackInfo {
    return TRACKS[this.currentTrackIdx];
  }

  public getAllTracks(): TrackInfo[] {
    return TRACKS;
  }

  public getCurrentTrackIdx(): number {
    return this.currentTrackIdx;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getElapsedSeconds(): number {
    return this.elapsedSeconds;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audioEl) {
      this.audioEl.volume = this.volume;
    }
    this.notify();
  }

  public seek(seconds: number) {
    const track = this.getTrack();
    this.elapsedSeconds = Math.max(0, Math.min(track.duration, Math.floor(seconds)));
    if (this.audioEl && !isNaN(this.audioEl.duration)) {
      this.audioEl.currentTime = this.elapsedSeconds;
    }
    this.step = Math.floor((this.elapsedSeconds * track.bpm) / 60) * 2;
    this.notify();
  }

  public selectTrack(index: number) {
    if (index < 0 || index >= TRACKS.length) return;
    const wasPlaying = this.isPlaying;
    if (wasPlaying) this.pause();
    this.currentTrackIdx = index;
    this.step = 0;
    this.elapsedSeconds = 0;
    if (this.audioEl) {
      this.audioEl.src = TRACKS[index].audioUrl;
      this.audioEl.currentTime = 0;
    }
    if (wasPlaying) this.play();
    else this.notify();
  }

  public play() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;

    const track = this.getTrack();

    // Try playing real studio MP3 track
    if (this.audioEl && track.audioUrl) {
      if (this.audioEl.src !== window.location.origin + track.audioUrl && !this.audioEl.src.endsWith(track.audioUrl)) {
        this.audioEl.src = track.audioUrl;
        this.audioEl.currentTime = this.elapsedSeconds;
      }
      this.audioEl.volume = this.volume;
      this.audioEl
        .play()
        .catch(() => {
          // Fall back to procedural synthesis if browser autoplay policy restricts media
          this.startProceduralFallback();
        });
    } else {
      this.startProceduralFallback();
    }

    this.notify();
  }

  private startProceduralFallback() {
    if (this.beatIntervalId) clearInterval(this.beatIntervalId);
    const track = this.getTrack();
    const beatInterval = (60 / track.bpm) * 1000 * 0.5;
    this.beatIntervalId = window.setInterval(() => {
      this.playStep();
      this.elapsedSeconds += 0.25;
      if (this.elapsedSeconds >= track.duration) {
        this.nextTrack();
      } else {
        this.notify();
      }
    }, beatInterval);
  }

  public pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.audioEl) {
      this.audioEl.pause();
    }
    if (this.beatIntervalId !== null) {
      clearInterval(this.beatIntervalId);
      this.beatIntervalId = null;
    }
    this.notify();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public nextTrack() {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) this.pause();
    this.currentTrackIdx = (this.currentTrackIdx + 1) % TRACKS.length;
    this.step = 0;
    this.elapsedSeconds = 0;
    if (this.audioEl) {
      this.audioEl.src = TRACKS[this.currentTrackIdx].audioUrl;
      this.audioEl.currentTime = 0;
    }
    if (wasPlaying) this.play();
    else this.notify();
  }

  public prevTrack() {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) this.pause();
    this.currentTrackIdx = (this.currentTrackIdx - 1 + TRACKS.length) % TRACKS.length;
    this.step = 0;
    this.elapsedSeconds = 0;
    if (this.audioEl) {
      this.audioEl.src = TRACKS[this.currentTrackIdx].audioUrl;
      this.audioEl.currentTime = 0;
    }
    if (wasPlaying) this.play();
    else this.notify();
  }

  private playStep() {
    if (!this.ctx || !this.analyser || this.volume <= 0.001) return;

    const track = this.getTrack();
    const chordIdx = Math.floor(this.step / 8) % track.chords.length;
    const chord = track.chords[chordIdx];
    const subStep = this.step % 8;

    const now = this.ctx.currentTime;

    // 1. Synth Chord Pad on measure start (subStep 0)
    if (subStep === 0) {
      chord.forEach((freq) => {
        if (!this.ctx || !this.analyser) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = track.leadWave;
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(track.filterCutoff * 0.7, now);
        filter.frequency.exponentialRampToValueAtTime(track.filterCutoff, now + 0.8);
        filter.frequency.exponentialRampToValueAtTime(track.filterCutoff * 0.6, now + 1.8);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(this.volume * 0.07, now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.analyser);

        osc.start(now);
        osc.stop(now + 1.85);
      });
    }

    // 2. Arpeggiated melody line
    const arpNote = chord[subStep % chord.length] * (subStep % 2 === 0 ? 1 : 1.5);
    if (arpNote) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = track.leadWave === 'square' ? 'square' : 'sine';
      osc.frequency.setValueAtTime(arpNote, now);

      gain.gain.setValueAtTime(this.volume * 0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.analyser);

      osc.start(now);
      osc.stop(now + 0.18);
    }

    // 3. Bass line
    if (subStep === 0 || subStep === 4) {
      const bassFreq = chord[0] / 2;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = track.bassWave;
      osc.frequency.setValueAtTime(bassFreq, now);

      gain.gain.setValueAtTime(this.volume * 0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(gain);
      gain.connect(this.analyser);

      osc.start(now);
      osc.stop(now + 0.34);
    }

    // 4. Soft hi-hat tick on off-beats
    if (subStep % 2 === 1 && this.volume > 0.05) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(8000 + (subStep * 500), now);
      gain.gain.setValueAtTime(this.volume * 0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.analyser);
      osc.start(now);
      osc.stop(now + 0.05);
    }

    this.step++;
  }
}

export const musicPlayer = new ProceduralMusicPlayer();
