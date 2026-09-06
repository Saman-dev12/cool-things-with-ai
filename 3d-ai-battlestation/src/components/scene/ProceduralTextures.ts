import * as THREE from 'three';

// 1. Scandinavian Oak Plank Flooring Texture (Repeatable, realistic plank seams & grain)
export function createHardwoodFloorTexture(): { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 1024;
  roughCanvas.height = 1024;
  const rCtx = roughCanvas.getContext('2d')!;

  // Base warm oak tones
  const numPlanks = 8;
  const plankHeight = 1024 / numPlanks;

  for (let i = 0; i < numPlanks; i++) {
    const y = i * plankHeight;
    // Varying plank lightness
    const toneVariation = Math.sin(i * 1.7) * 12;
    const r = Math.min(255, Math.max(0, 195 + toneVariation));
    const g = Math.min(255, Math.max(0, 160 + toneVariation));
    const b = Math.min(255, Math.max(0, 125 + toneVariation * 0.8));

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, y, 1024, plankHeight);

    // Subtle wood grain horizontal lines
    for (let j = 0; j < 45; j++) {
      const lineY = y + Math.random() * plankHeight;
      const alpha = 0.03 + Math.random() * 0.05;
      ctx.strokeStyle = `rgba(100, 70, 40, ${alpha})`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.bezierCurveTo(
        340,
        lineY + (Math.random() - 0.5) * 6,
        680,
        lineY + (Math.random() - 0.5) * 6,
        1024,
        lineY
      );
      ctx.stroke();
    }

    // Plank seams (dark groove)
    ctx.fillStyle = 'rgba(40, 25, 15, 0.5)';
    ctx.fillRect(0, y, 1024, 3);

    // Staggered vertical end joints
    const jointX1 = (i * 370 + 200) % 1024;
    ctx.fillRect(jointX1, y, 3, plankHeight);

    // Roughness map (slightly glossy satin lacquer)
    const baseRough = 120 + Math.random() * 30;
    rCtx.fillStyle = `rgb(${baseRough}, ${baseRough}, ${baseRough})`;
    rCtx.fillRect(0, y, 1024, plankHeight);
    rCtx.fillStyle = '#ffffff';
    rCtx.fillRect(0, y, 1024, 3);
    rCtx.fillRect(jointX1, y, 3, plankHeight);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(4, 4);
  map.colorSpace = THREE.SRGBColorSpace;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(4, 4);

  return { map, roughnessMap };
}

// 2. Solid American Walnut Executive Desk Texture (Deep chocolate tones, rich grain, satin finish)
export function createWoodDeskTexture(): { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 1024;
  roughCanvas.height = 1024;
  const rCtx = roughCanvas.getContext('2d')!;

  // Rich American Walnut deep chocolate gradient base
  const grad = ctx.createLinearGradient(0, 0, 1024, 0);
  grad.addColorStop(0, '#3a271c');
  grad.addColorStop(0.25, '#4a3325');
  grad.addColorStop(0.5, '#352319');
  grad.addColorStop(0.75, '#442e21');
  grad.addColorStop(1, '#38251b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Flowing organic wood grain rings
  for (let i = 0; i < 180; i++) {
    const y = Math.random() * 1024;
    const isDark = Math.random() > 0.35;
    const alpha = isDark ? 0.06 + Math.random() * 0.10 : 0.04 + Math.random() * 0.06;
    ctx.strokeStyle = isDark
      ? `rgba(32, 20, 12, ${alpha})`
      : `rgba(95, 68, 48, ${alpha})`;
    ctx.lineWidth = 1 + Math.random() * 3.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      280 + Math.random() * 80,
      y + (Math.random() - 0.5) * 28,
      720 + Math.random() * 80,
      y + (Math.random() - 0.5) * 28,
      1024,
      y
    );
    ctx.stroke();
  }

  // Micro wood pores
  for (let p = 0; p < 800; p++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 1024;
    ctx.fillStyle = 'rgba(25, 15, 8, 0.15)';
    ctx.fillRect(px, py, 1.5, 3 + Math.random() * 5);
  }

  // Soft plank seams (wide luxury walnut planks)
  [256, 512, 768].forEach((x) => {
    ctx.fillStyle = 'rgba(20, 12, 6, 0.4)';
    ctx.fillRect(x, 0, 2, 1024);
  });

  // Roughness Map (satin finish, smooth surface with subtle grain reflection)
  rCtx.fillStyle = '#666666'; // ~0.40 roughness
  rCtx.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 60; i++) {
    const y = Math.random() * 1024;
    rCtx.fillStyle = Math.random() > 0.5 ? '#777777' : '#555555';
    rCtx.fillRect(0, y, 1024, 2 + Math.random() * 3);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 1);
  map.colorSpace = THREE.SRGBColorSpace;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 1);

  return { map, roughnessMap };
}

// 3. Acoustic Smoked Oak Slat Accent Wall Texture (Luxury Felt Backing & Natural Wood Slats)
export function createAcousticSlatTexture(): { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 1024;
  roughCanvas.height = 1024;
  const rCtx = roughCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 1024;
  bumpCanvas.height = 1024;
  const bCtx = bumpCanvas.getContext('2d')!;

  // 1. Dark acoustic felt background (#12161f)
  ctx.fillStyle = '#12161f';
  ctx.fillRect(0, 0, 1024, 1024);
  rCtx.fillStyle = '#f0f0f0'; // Rough felt
  rCtx.fillRect(0, 0, 1024, 1024);
  bCtx.fillStyle = '#000000'; // Recessed groove
  bCtx.fillRect(0, 0, 1024, 1024);

  // 2. Repeated vertical oak slats (28px wood slat, 14px felt groove = 42px period)
  const period = 42;
  const slatWidth = 28;
  const numSlats = Math.ceil(1024 / period);

  for (let i = 0; i < numSlats; i++) {
    const x = i * period;

    // Slat base natural smoked oak color
    const slatTone = Math.sin(i * 1.5) * 8;
    const r = Math.round(92 + slatTone);
    const g = Math.round(64 + slatTone * 0.8);
    const b = Math.round(44 + slatTone * 0.6);

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(x, 0, slatWidth, 1024);

    // Wood grain on slat
    for (let gIdx = 0; gIdx < 12; gIdx++) {
      const gx = x + Math.random() * slatWidth;
      ctx.strokeStyle = 'rgba(45, 30, 20, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx + (Math.random() - 0.5) * 4, 1024);
      ctx.stroke();
    }

    // Slat edge bevel shading (gives 3D depth to each slat)
    const edgeGrad = ctx.createLinearGradient(x, 0, x + slatWidth, 0);
    edgeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    edgeGrad.addColorStop(0.15, 'rgba(255, 255, 255, 0)');
    edgeGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0)');
    edgeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(x, 0, slatWidth, 1024);

    // Roughness for wood slat (~0.55 satin)
    rCtx.fillStyle = '#888888';
    rCtx.fillRect(x, 0, slatWidth, 1024);

    // Bump map: slats raised to white (255)
    bCtx.fillStyle = '#ffffff';
    bCtx.fillRect(x + 1, 0, slatWidth - 2, 1024);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 1);
  map.colorSpace = THREE.SRGBColorSpace;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 1);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 1);

  return { map, roughnessMap, bumpMap };
}

// 4. Stitched Micro-Weave Leather Desk Pad Texture (900x400mm)
export function createLeatherDeskPadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark graphite leather
  ctx.fillStyle = '#1e2430';
  ctx.fillRect(0, 0, 512, 256);

  // Micro leather grain noise
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const bright = Math.random() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${bright}, ${bright}, ${bright}, 0.03)`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  // Precision cyan/white perimeter stitching
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(8, 8, 496, 240);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 5. Studio Monitor Pure White Woofer Cone Texture
export function createSpeakerConeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Pure white polymer woofer with concentric composite weave
  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, '#1c1917'); // Inverted dust cap
  grad.addColorStop(0.28, '#292524');
  grad.addColorStop(0.32, '#f8fafc'); // White cone transition
  grad.addColorStop(0.85, '#e2e8f0');
  grad.addColorStop(0.92, '#18181b'); // Outer rubber roll surround
  grad.addColorStop(1, '#09090b');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(128, 128, 128, 0, Math.PI * 2);
  ctx.fill();

  // Subtle concentric micro-grooves
  for (let r = 45; r < 115; r += 5) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(128, 128, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 6. AIO Liquid Cooler 480x480 LCD Pump Texture (Ryzen 9 9950X3D + 38°C + Pump RPM)
export function createAioLcdTexture(temp = 38): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Background deep tech blue/black
  ctx.fillStyle = '#050811';
  ctx.beginPath();
  ctx.arc(256, 256, 256, 0, Math.PI * 2);
  ctx.fill();

  // Outer bezel ring
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(256, 256, 240, 0, Math.PI * 2);
  ctx.stroke();

  // Circular gauge track
  ctx.lineWidth = 16;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.arc(256, 256, 200, Math.PI * 0.75, Math.PI * 2.25);
  ctx.stroke();

  // Circular gauge active arc (cyan to blue for 38°C)
  const arcGrad = ctx.createLinearGradient(100, 400, 400, 100);
  arcGrad.addColorStop(0, '#06b6d4');
  arcGrad.addColorStop(1, '#3b82f6');
  ctx.strokeStyle = arcGrad;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(256, 256, 200, Math.PI * 0.75, Math.PI * 0.75 + (temp / 100) * (Math.PI * 1.5));
  ctx.stroke();

  // Text: CPU Model
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 24px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('RYZEN 9 9950X3D', 256, 140);

  // Large Temp readout
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 108px -apple-system, sans-serif';
  ctx.fillText(`${temp}°`, 236, 275);

  ctx.fillStyle = '#06b6d4';
  ctx.font = 'bold 44px -apple-system, sans-serif';
  ctx.fillText('C', 342, 248);

  // Subtext: GPU & Pump Status
  ctx.fillStyle = '#10b981';
  ctx.font = '700 22px -apple-system, sans-serif';
  ctx.fillText('RTX 5090: 41°C', 256, 345);

  ctx.fillStyle = '#64748b';
  ctx.font = '600 18px monospace';
  ctx.fillText('HYDROSHIFT: 2450 RPM • FLUID 29°C', 256, 395);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 7. Twilight City Skyline Backdrop Texture for Loft Window
export function createCitySkylineTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Twilight sky gradient (deep indigo -> sunset orange/magenta horizon)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
  skyGrad.addColorStop(0, '#0a0f1d');
  skyGrad.addColorStop(0.5, '#1e1b4b');
  skyGrad.addColorStop(0.75, '#4c1d95');
  skyGrad.addColorStop(0.92, '#be185d');
  skyGrad.addColorStop(1, '#f97316');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Distant skyscraper silhouettes
  const numBuildings = 64;
  for (let i = 0; i < numBuildings; i++) {
    const w = 18 + Math.random() * 26;
    const h = 80 + Math.random() * 220;
    const x = i * 16 + (Math.random() - 0.5) * 6;
    const y = 512 - h;

    ctx.fillStyle = '#05070e';
    ctx.fillRect(x, y, w, h);

    // Glowing office windows inside skyscrapers
    const rows = Math.floor(h / 12);
    const cols = Math.floor(w / 7);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() > 0.45) {
          const winX = x + 3 + c * 6;
          const winY = y + 8 + r * 11;
          const isWarm = Math.random() > 0.3;
          ctx.fillStyle = isWarm ? 'rgba(254, 240, 138, 0.85)' : 'rgba(56, 189, 248, 0.8)';
          ctx.fillRect(winX, winY, 3.5, 4.5);
        }
      }
    }
  }

  // Highway light streak on bottom
  const roadGrad = ctx.createLinearGradient(0, 480, 1024, 512);
  roadGrad.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
  roadGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.7)');
  roadGrad.addColorStop(1, 'rgba(239, 68, 68, 0.6)');
  ctx.strokeStyle = roadGrad;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 495);
  ctx.lineTo(1024, 502);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 8. Architectural Gallery Abstract Artwork Textures (Tokyo Rain & Deep Space Nebula)
export function createGalleryArtTexture(index: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 700;
  const ctx = canvas.getContext('2d')!;

  if (index === 0) {
    // Artwork 1: "Neon Tokyo Rain Reflections" - Moody cyberpunk metropolis watercolor / acrylic
    const grad = ctx.createLinearGradient(0, 0, 0, 700);
    grad.addColorStop(0, '#0a0d18');
    grad.addColorStop(0.35, '#1e1b4b');
    grad.addColorStop(0.65, '#3b0764');
    grad.addColorStop(0.85, '#831843');
    grad.addColorStop(1, '#090514');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 700);

    // Glowing vertical neon light bars
    const neonStrips = [
      { x: 80, w: 14, color: '#f43f5e' },
      { x: 140, w: 20, color: '#06b6d4' },
      { x: 220, w: 12, color: '#ec4899' },
      { x: 290, w: 24, color: '#38bdf8' },
      { x: 380, w: 18, color: '#a855f7' },
      { x: 440, w: 15, color: '#f59e0b' },
    ];
    neonStrips.forEach((s) => {
      const g = ctx.createLinearGradient(0, 100, 0, 650);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.2, s.color);
      g.addColorStop(0.65, s.color);
      g.addColorStop(0.8, `${s.color}88`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(s.x - 10, 80, s.w + 20, 560);
    });

    // Rain drop streaks and wet pavement reflections
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 120; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 500;
      ctx.fillRect(rx, ry, 1, 8 + Math.random() * 14);
    }

    // Wet asphalt ground reflection ripple lines
    for (let r = 520; r < 700; r += 7) {
      ctx.fillStyle = `rgba(244, 63, 94, ${0.15 + Math.random() * 0.2})`;
      ctx.fillRect(40 + Math.random() * 80, r, 200 + Math.random() * 120, 2);
      ctx.fillStyle = `rgba(6, 182, 212, ${0.15 + Math.random() * 0.2})`;
      ctx.fillRect(220 + Math.random() * 80, r + 3, 180 + Math.random() * 80, 2);
    }
  } else {
    // Artwork 2: "Cosmic Event Horizon" - Deep space stellar vortex
    const grad = ctx.createRadialGradient(256, 350, 20, 256, 350, 380);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.12, '#f97316');
    grad.addColorStop(0.3, '#c026d3');
    grad.addColorStop(0.55, '#312e81');
    grad.addColorStop(0.8, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 700);

    // Accretion disk spiral arms
    for (let ring = 0; ring < 24; ring++) {
      ctx.strokeStyle = `rgba(${180 + ring * 3}, ${120 + ring * 4}, 255, ${0.25 - ring * 0.008})`;
      ctx.lineWidth = 3 + ring * 0.8;
      ctx.beginPath();
      ctx.ellipse(256, 350, 120 + ring * 10, 45 + ring * 4, -0.4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Distant stars & galaxies
    for (let s = 0; s < 180; s++) {
      const sx = Math.random() * 512;
      const sy = Math.random() * 700;
      const size = Math.random() > 0.9 ? 2.5 : 1;
      ctx.fillStyle = Math.random() > 0.4 ? '#ffffff' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

