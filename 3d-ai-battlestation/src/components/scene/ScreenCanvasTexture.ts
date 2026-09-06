import * as THREE from 'three';
import type { ThemeConfig, Wallpaper, AppWindow, AppId } from '../../types/os';

export function createScreenTexture(
  theme: ThemeConfig,
  wallpaper: Wallpaper,
  windows?: AppWindow[],
  activeAppId?: AppId | null
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // 1. Premium Atmospheric Wallpaper (Exact match to current OS theme & wallpaper)
  const bgGrad = ctx.createLinearGradient(0, 0, 1920, 1200);
  if (wallpaper.id === 'matrix-rain') {
    bgGrad.addColorStop(0, '#031a14');
    bgGrad.addColorStop(0.5, '#064e3b');
    bgGrad.addColorStop(1, '#01140e');
  } else if (wallpaper.id === 'sunset-peaks') {
    bgGrad.addColorStop(0, '#2e0854');
    bgGrad.addColorStop(0.4, '#4c0519');
    bgGrad.addColorStop(0.7, '#2b0938');
    bgGrad.addColorStop(1, '#090514');
  } else if (wallpaper.id === 'deep-space') {
    bgGrad.addColorStop(0, '#311042');
    bgGrad.addColorStop(0.5, '#111827');
    bgGrad.addColorStop(1, '#020617');
  } else {
    // Obsidian Sapphire Studio
    bgGrad.addColorStop(0, '#0a0f1d');
    bgGrad.addColorStop(0.4, '#1e1b4b');
    bgGrad.addColorStop(0.7, '#0d1326');
    bgGrad.addColorStop(1, '#030712');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1920, 1200);

  // Soft atmospheric luminous glow orbs
  const accentColor = theme.neonColor || '#38bdf8';
  const orb1 = ctx.createRadialGradient(1300, 350, 10, 1300, 350, 550);
  orb1.addColorStop(0, `${accentColor}33`);
  orb1.addColorStop(0.6, 'rgba(99, 102, 241, 0.08)');
  orb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = orb1;
  ctx.fillRect(0, 0, 1920, 1200);

  // 2. Realistic Top Menu Bar (macOS Sequoia Style)
  ctx.fillStyle = 'rgba(10, 15, 26, 0.78)';
  ctx.fillRect(0, 0, 1920, 42);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillRect(0, 41, 1920, 1);

  // Apple / Aether Logo & Menu items
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(32, 21, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('AetherOS', 50, 26);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const menus = ['File', 'Edit', 'View', 'Window', 'Help'];
  menus.forEach((m, idx) => {
    ctx.fillText(m, 140 + idx * 62, 26);
  });

  // Top Right Status Telemetry
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('⚡ 240 FPS • RTX 5090 • Wi-Fi 7', 1540, 26);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(timeStr, 1840, 26);

  // 3. Desktop Squircles (2 neat columns on the left matching Desktop.tsx)
  const iconsCol1 = [
    { label: 'Terminal', grad1: '#0f172a', grad2: '#064e3b' },
    { label: 'WaveBeats', grad1: '#db2777', grad2: '#7c3aed' },
    { label: 'NetSurfer', grad1: '#0284c7', grad2: '#2563eb' },
    { label: 'Arcade', grad1: '#d97706', grad2: '#dc2626' },
  ];
  const iconsCol2 = [
    { label: 'CodeCraft', grad1: '#2563eb', grad2: '#4f46e5' },
    { label: 'NeuralChat', grad1: '#7c3aed', grad2: '#c026d3' },
    { label: 'Wallpapers', grad1: '#0284c7', grad2: '#06b6d4' },
    { label: 'Settings', grad1: '#334155', grad2: '#0f172a' },
  ];

  [iconsCol1, iconsCol2].forEach((col, cIdx) => {
    const xBase = 32 + cIdx * 76;
    col.forEach((ic, i) => {
      const y = 68 + i * 86;
      // Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.roundRect(xBase, y + 3, 56, 56, 16);
      ctx.fill();

      // Squircle gradient
      const sGrad = ctx.createLinearGradient(xBase, y, xBase + 56, y + 56);
      sGrad.addColorStop(0, ic.grad1);
      sGrad.addColorStop(1, ic.grad2);
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.roundRect(xBase, y, 56, 56, 16);
      ctx.fill();

      // Subtle glass border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label with drop shadow
      ctx.fillStyle = '#000000';
      ctx.font = '500 11px -apple-system, sans-serif';
      ctx.fillText(ic.label, xBase + 3, y + 72);
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(ic.label, xBase + 2, y + 71);
    });
  });

  // 4. Determine Open Windows to Mirror the Internal UI
  const openWins = windows ? windows.filter((w) => w.isOpen && !w.isMinimized) : [];

  // Helper to draw macOS window chrome
  const drawWindowChrome = (x: number, y: number, w: number, h: number, title: string, isFocused: boolean) => {
    // Window shadow
    ctx.fillStyle = isFocused ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(x + 10, y + 10, w, h, 20);
    ctx.fill();

    // Window base
    ctx.fillStyle = 'rgba(11, 15, 25, 0.95)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 18);
    ctx.fill();
    ctx.strokeStyle = isFocused ? `${accentColor}77` : 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = isFocused ? 2 : 1.5;
    ctx.stroke();

    // Titlebar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, 44, [18, 18, 0, 0]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Traffic light buttons
    ctx.fillStyle = '#ff5f56';
    ctx.beginPath();
    ctx.arc(x + 24, y + 22, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffbd2e';
    ctx.beginPath();
    ctx.arc(x + 44, y + 22, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#27c93f';
    ctx.beginPath();
    ctx.arc(x + 64, y + 22, 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 13px -apple-system, sans-serif';
    ctx.fillText(title, x + 92, y + 27);
  };

  // Check which apps to render
  const isCodeOpen = openWins.some((w) => w.id === 'code');
  const isTerminalOpen = openWins.some((w) => w.id === 'terminal');
  const isMusicOpen = openWins.some((w) => w.id === 'music');
  const isBrowserOpen = openWins.some((w) => w.id === 'browser');

  // If CodeCraft is open (like user had in screenshot), render CodeCraft prominently!
  if (isCodeOpen) {
    const isCodeFocused = activeAppId === 'code';
    drawWindowChrome(220, 80, 960, 680, 'CodeCraft Studio — main.ts (TypeScript 5.8)', isCodeFocused);

    // Code Editor Tabs
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(221, 124, 958, 36);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(221, 124, 110, 3);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('📄 main.ts', 235, 147);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px monospace';
    ctx.fillText('📄 matrix.py', 345, 147);

    // Run button
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(1070, 130, 90, 24, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px -apple-system, sans-serif';
    ctx.fillText('▶ Run Code', 1082, 146);

    // Code lines
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(221, 160, 48, 420);
    ctx.fillStyle = '#475569';
    ctx.font = '12px monospace';
    for (let l = 1; l <= 14; l++) {
      ctx.fillText(String(l), 236, 178 + (l - 1) * 26);
    }

    // Code text syntax highlighting
    const codeLines = [
      { text: '// Aether Quantum Controller — RTX 5090 Workstation', color: '#64748b' },
      { text: "import { initWorkstation } from '@aether/3d-core';", color: '#38bdf8' },
      { text: '', color: '#fff' },
      { text: 'interface CyberRigConfig {', color: '#ec4899' },
      { text: "  cpu: 'AMD Ryzen 9 9950X3D (16C/32T @ 5.7GHz)';", color: '#e2e8f0' },
      { text: "  gpu: 'NVIDIA GeForce RTX 5090 32GB GDDR7';", color: '#10b981' },
      { text: "  cooling: 'Lian Li HydroShift LCD 360 (38°C)';", color: '#e2e8f0' },
      { text: "  ram: '64GB G.Skill Trident Z5 Royal DDR5-6400';", color: '#e2e8f0' },
      { text: '}', color: '#ec4899' },
      { text: '', color: '#fff' },
      { text: 'export function launchSimulation(config: CyberRigConfig) {', color: '#f59e0b' },
      { text: "  console.log('[+] Initializing 2026 Flagship Rig...');", color: '#e2e8f0' },
      { text: "  return { status: 'OPTIMAL', fps: 240, temp: 38 };", color: '#10b981' },
      { text: '}', color: '#f59e0b' },
    ];

    ctx.font = '12.5px "Fira Code", monospace';
    codeLines.forEach((cl, i) => {
      ctx.fillStyle = cl.color;
      ctx.fillText(cl.text, 280, 178 + i * 26);
    });

    // Console output pane
    ctx.fillStyle = '#060a12';
    ctx.fillRect(221, 580, 958, 178);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(221, 580, 958, 1);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('>_ Terminal Output (Exit Code 0)', 240, 606);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '12px monospace';
    ctx.fillText('[+] Initializing 2026 Flagship Rig...', 240, 634);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText('[+] Processor: AMD Ryzen 9 9950X3D (16C/32T @ 5.7GHz)', 240, 658);
    ctx.fillText('[+] Graphics: NVIDIA GeForce RTX 5090 32GB GDDR7', 240, 682);
    ctx.fillStyle = '#10b981';
    ctx.fillText('[SUCCESS] 34" Samsung Odyssey OLED G9 calibrated at 240 FPS (38°C). All systems optimal!', 240, 710);
  } else if (isTerminalOpen || openWins.length === 0) {
    // Default Terminal
    const isTermFocused = activeAppId === 'terminal' || !isMusicOpen;
    drawWindowChrome(220, 90, 780, 540, 'CyberTerminal (zsh) — 2026 Flagship Rig', isTermFocused);

    ctx.font = '13.5px "Fira Code", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('guest@aether:~$ fetch --flagship-specs', 245, 160);

    ctx.fillStyle = '#10b981';
    ctx.fillText('✔ Hardware Architecture Verified: [2026 Ultra Flagship]', 245, 190);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('OS       : AetherOS 4.2 Pro Workstation (x86_64-quantum)', 245, 225);
    ctx.fillText('CPU      : AMD Ryzen 9 9950X3D (16 Cores / 32 Threads @ 5.7GHz)', 245, 255);
    ctx.fillText('GPU      : NVIDIA GeForce RTX 5090 32GB GDDR7 (Blackwell DLSS 4/5)', 245, 285);
    ctx.fillText('MOTHERBD : ASUS ROG Crosshair X870E HERO', 245, 315);
    ctx.fillText('MEMORY   : 64GB (2x32GB) G.Skill Trident Z5 Royal DDR5-6400 CL28', 245, 345);
    ctx.fillText('COOLING  : Lian Li HydroShift LCD 360 Liquid Cooler (38°C)', 245, 375);
    ctx.fillText('STORAGE  : 4TB Crucial T705 PCIe 5.0 NVMe (14,500 MB/s)', 245, 405);
    ctx.fillText('DISPLAY  : 34" Samsung Odyssey OLED G9 QD-OLED (240Hz, 0.03ms)', 245, 435);

    ctx.fillStyle = '#f59e0b';
    ctx.fillText('STATUS   : All 16 cores optimal. Fan curve: Silent Profile (580 RPM)', 245, 475);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('guest@aether:~$ █', 245, 510);
  }

  // WaveBeats Music Player (Right side)
  if (isMusicOpen || (!isCodeOpen && openWins.length <= 1)) {
    const isMusicFocused = activeAppId === 'music';
    const musicX = isCodeOpen ? 1220 : 1040;
    const musicW = isCodeOpen ? 640 : 660;
    drawWindowChrome(musicX, 100, musicW, 530, 'WaveBeats Synthesizer • Lossless Studio Audio', isMusicFocused);

    // Vinyl Album Disc
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(musicX + 110, 230, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let r = 25; r < 65; r += 8) {
      ctx.beginPath();
      ctx.arc(musicX + 110, 230, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Vinyl center label
    const labelGrad = ctx.createLinearGradient(musicX + 85, 205, musicX + 135, 255);
    labelGrad.addColorStop(0, '#ec4899');
    labelGrad.addColorStop(1, '#6366f1');
    ctx.fillStyle = labelGrad;
    ctx.beginPath();
    ctx.arc(musicX + 110, 230, 22, 0, Math.PI * 2);
    ctx.fill();

    // Song metadata
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px -apple-system, sans-serif';
    ctx.fillText('Neon Skyline', musicX + 210, 215);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 13px -apple-system, sans-serif';
    ctx.fillText('CyberPulse • Synthwave 112 BPM', musicX + 210, 240);
    ctx.fillStyle = '#10b981';
    ctx.font = '600 11.5px monospace';
    ctx.fillText('24-bit / 96kHz Studio Master • Dolby Atmos', musicX + 210, 265);

    // Audio Spectrum Equalizer
    for (let b = 0; b < 32; b++) {
      const barH = 15 + Math.sin(b * 0.35 + 1.2) * 35 + (b % 5) * 8;
      const barGrad = ctx.createLinearGradient(0, 420 - barH, 0, 420);
      barGrad.addColorStop(0, '#38bdf8');
      barGrad.addColorStop(0.6, '#818cf8');
      barGrad.addColorStop(1, '#ec4899');
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect(musicX + 50 + b * 17, 420 - barH, 10, barH, 4);
      ctx.fill();
    }

    // Progress bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.roundRect(musicX + 50, 460, musicW - 100, 5, 3);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(musicX + 50, 460, (musicW - 100) * 0.45, 5, 3);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '11px monospace';
    ctx.fillText('01:42', musicX + 50, 485);
    ctx.fillText('03:45', musicX + musicW - 90, 485);
  }

  // If NetSurfer Browser is open
  if (isBrowserOpen && !isCodeOpen) {
    const isBrowserFocused = activeAppId === 'browser';
    drawWindowChrome(240, 110, 820, 560, 'NetSurfer Quantum — Giggle Search', isBrowserFocused);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(241, 154, 818, 514);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px -apple-system, sans-serif';
    ctx.fillText('Giggle Quantum', 520, 240);
  }

  // 5. Floating macOS Liquid Glass Dock
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.roundRect(580, 1105, 760, 72, 24);
  ctx.fill();

  // Glass blur container
  ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
  ctx.beginPath();
  ctx.roundRect(580, 1098, 760, 72, 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Dock items with live open indicators!
  const dockApps = [
    { id: 'terminal', name: 'Terminal', grad1: '#0f172a', grad2: '#064e3b' },
    { id: 'music', name: 'WaveBeats', grad1: '#db2777', grad2: '#7c3aed' },
    { id: 'browser', name: 'NetSurfer', grad1: '#0284c7', grad2: '#2563eb' },
    { id: 'arcade', name: 'Arcade', grad1: '#d97706', grad2: '#dc2626' },
    { id: 'code', name: 'CodeCraft', grad1: '#2563eb', grad2: '#4f46e5' },
    { id: 'chat', name: 'NeuralChat', grad1: '#7c3aed', grad2: '#c026d3' },
    { id: 'gallery', name: 'Wallpapers', grad1: '#0284c7', grad2: '#06b6d4' },
    { id: 'settings', name: 'Settings', grad1: '#334155', grad2: '#0f172a' },
  ];

  dockApps.forEach((app, idx) => {
    const x = 620 + idx * 86;
    const y = 1110;
    const isOpen = openWins.some((w) => w.id === app.id);
    const isActive = activeAppId === app.id;

    // Squircle
    const dGrad = ctx.createLinearGradient(x, y, x + 48, y + 48);
    dGrad.addColorStop(0, app.grad1);
    dGrad.addColorStop(1, app.grad2);
    ctx.fillStyle = dGrad;
    ctx.beginPath();
    ctx.roundRect(x, y, 48, 48, 14);
    ctx.fill();

    ctx.strokeStyle = isActive ? `${accentColor}` : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = isActive ? 2 : 1;
    ctx.stroke();

    // Active pill / dot indicator matching user's open apps!
    if (isOpen) {
      ctx.fillStyle = isActive ? accentColor : '#94a3b8';
      ctx.beginPath();
      ctx.roundRect(x + (isActive ? 18 : 22), 1163, isActive ? 12 : 4, 3, 1.5);
      ctx.fill();
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
