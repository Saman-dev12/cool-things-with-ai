import * as THREE from 'three';
import { BlockUV } from '../types';

export class TextureAtlas {
  private static instance: TextureAtlas;
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public texture: THREE.CanvasTexture;
  public uvMap: Map<string, BlockUV> = new Map();
  private textureSize = 16; // 16x16 pixels per block texture
  private atlasCols = 8;
  private atlasRows = 8;

  private constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.atlasCols * this.textureSize;
    this.canvas.height = this.atlasRows * this.textureSize;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context for TextureAtlas');
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;

    this.generateAtlas();

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.generateMipmaps = false;
    this.texture.colorSpace = THREE.SRGBColorSpace;
  }

  public static getInstance(): TextureAtlas {
    if (!TextureAtlas.instance) {
      TextureAtlas.instance = new TextureAtlas();
    }
    return TextureAtlas.instance;
  }

  private generateAtlas() {
    const textures: Record<string, (ctx: CanvasRenderingContext2D, ox: number, oy: number) => void> = {
      grass_top: (ctx, ox, oy) => this.drawGrassTop(ctx, ox, oy),
      grass_side: (ctx, ox, oy) => this.drawGrassSide(ctx, ox, oy),
      dirt: (ctx, ox, oy) => this.drawDirt(ctx, ox, oy),
      stone: (ctx, ox, oy) => this.drawStone(ctx, ox, oy),
      cobblestone: (ctx, ox, oy) => this.drawCobblestone(ctx, ox, oy),
      oak_log_side: (ctx, ox, oy) => this.drawOakLogSide(ctx, ox, oy),
      oak_log_top: (ctx, ox, oy) => this.drawOakLogTop(ctx, ox, oy),
      oak_leaves: (ctx, ox, oy) => this.drawOakLeaves(ctx, ox, oy),
      oak_planks: (ctx, ox, oy) => this.drawOakPlanks(ctx, ox, oy),
      sand: (ctx, ox, oy) => this.drawSand(ctx, ox, oy),
      water: (ctx, ox, oy) => this.drawWater(ctx, ox, oy),
      glass: (ctx, ox, oy) => this.drawGlass(ctx, ox, oy),
      bricks: (ctx, ox, oy) => this.drawBricks(ctx, ox, oy),
      coal_ore: (ctx, ox, oy) => this.drawOre(ctx, ox, oy, '#1c1917', '#292524'),
      iron_ore: (ctx, ox, oy) => this.drawOre(ctx, ox, oy, '#d6c0a6', '#b0997e'),
      gold_ore: (ctx, ox, oy) => this.drawOre(ctx, ox, oy, '#facc15', '#ca8a04'),
      diamond_ore: (ctx, ox, oy) => this.drawOre(ctx, ox, oy, '#22d3ee', '#0891b2'),
      tnt_top: (ctx, ox, oy) => this.drawTntTop(ctx, ox, oy),
      tnt_bottom: (ctx, ox, oy) => this.drawTntBottom(ctx, ox, oy),
      tnt_side: (ctx, ox, oy) => this.drawTntSide(ctx, ox, oy),
      crafting_table_top: (ctx, ox, oy) => this.drawCraftingTableTop(ctx, ox, oy),
      crafting_table_front: (ctx, ox, oy) => this.drawCraftingTableFront(ctx, ox, oy),
      crafting_table_side: (ctx, ox, oy) => this.drawCraftingTableSide(ctx, ox, oy),
      furnace_top: (ctx, ox, oy) => this.drawStone(ctx, ox, oy),
      furnace_front: (ctx, ox, oy) => this.drawFurnaceFront(ctx, ox, oy),
      furnace_side: (ctx, ox, oy) => this.drawCobblestone(ctx, ox, oy),
      bookshelf: (ctx, ox, oy) => this.drawBookshelf(ctx, ox, oy),
      bedrock: (ctx, ox, oy) => this.drawBedrock(ctx, ox, oy),
      snow: (ctx, ox, oy) => this.drawSnow(ctx, ox, oy),
      snow_side: (ctx, ox, oy) => this.drawSnowSide(ctx, ox, oy),
      cactus_top: (ctx, ox, oy) => this.drawCactusTop(ctx, ox, oy),
      cactus_bottom: (ctx, ox, oy) => this.drawCactusTop(ctx, ox, oy),
      cactus_side: (ctx, ox, oy) => this.drawCactusSide(ctx, ox, oy)
    };

    let index = 0;
    const atlasW = this.canvas.width;
    const atlasH = this.canvas.height;

    for (const [name, drawFn] of Object.entries(textures)) {
      const col = index % this.atlasCols;
      const row = Math.floor(index / this.atlasCols);
      const px = col * this.textureSize;
      const py = row * this.textureSize;

      drawFn(this.ctx, px, py);

      // In Three.js, V=0 is bottom and V=1 is top
      const uMin = px / atlasW;
      const uMax = (px + this.textureSize) / atlasW;
      const vMax = 1 - py / atlasH;
      const vMin = 1 - (py + this.textureSize) / atlasH;

      this.uvMap.set(name, { uMin, vMin, uMax, vMax });
      index++;
    }
  }

  public getUV(textureName: string): BlockUV {
    const uv = this.uvMap.get(textureName);
    if (!uv) {
      return this.uvMap.get('stone') || { uMin: 0, vMin: 0, uMax: 0.125, vMax: 0.125 };
    }
    return uv;
  }

  // --- Procedural Pixel Art Renderers ---

  private setPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  }

  private drawGrassTop(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    const greens = ['#5b8c32', '#4c7828', '#689c38', '#3f6520', '#568430'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const hash = (x * 37 + y * 17 + (x ^ y)) % greens.length;
        this.setPixel(ctx, ox + x, oy + y, greens[hash]);
      }
    }
  }

  private drawDirt(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    const browns = ['#866043', '#745238', '#5c402b', '#966c4c', '#6d4c32'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const hash = (x * 43 + y * 29 + (x * y)) % browns.length;
        this.setPixel(ctx, ox + x, oy + y, browns[hash]);
      }
    }
  }

  private drawGrassSide(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    this.drawDirt(ctx, ox, oy);
    const fringe = [3, 4, 3, 5, 4, 3, 4, 3, 5, 4, 3, 4, 3, 5, 4, 3];
    const greens = ['#5b8c32', '#4c7828', '#689c38', '#3f6520'];
    for (let x = 0; x < 16; x++) {
      const h = fringe[x];
      for (let y = 0; y < h; y++) {
        const hash = (x * 19 + y * 11) % greens.length;
        this.setPixel(ctx, ox + x, oy + y, greens[hash]);
      }
    }
  }

  private drawStone(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    const grays = ['#737373', '#666666', '#595959', '#7f7f7f', '#8c8c8c'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const hash = (x * 31 + y * 13 + (x ^ y)) % grays.length;
        this.setPixel(ctx, ox + x, oy + y, grays[hash]);
      }
    }
  }

  private drawCobblestone(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    this.drawStone(ctx, ox, oy);
    const dark = '#3f3f3f';
    const light = '#999999';
    // Mortar lines
    for (let i = 0; i < 16; i++) {
      if (i % 4 === 0) {
        for (let x = 0; x < 16; x++) {
          this.setPixel(ctx, ox + x, oy + i, dark);
        }
      }
      if (i % 4 === 1) {
        for (let x = 0; x < 16; x++) {
          if (x % 5 === 0) this.setPixel(ctx, ox + x, oy + i, light);
        }
      }
    }
  }

  private drawOakLogSide(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    const barks = ['#675232', '#544226', '#46371f', '#78613d', '#3e311b'];
    for (let x = 0; x < 16; x++) {
      const baseCol = barks[x % barks.length];
      for (let y = 0; y < 16; y++) {
        const hash = (x * 7 + y * 23) % barks.length;
        const col = (y % 5 === 0) ? barks[hash] : baseCol;
        this.setPixel(ctx, ox + x, oy + y, col);
      }
    }
  }

  private drawOakLogTop(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    const rings = ['#a58352', '#8d6f43', '#bf9b65', '#735a34'];
    const bark = '#46371f';
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        if (x <= 1 || x >= 14 || y <= 1 || y >= 14) {
          this.setPixel(ctx, ox + x, oy + y, bark);
          continue;
        }
        const dx = x - 7.5;
        const dy = y - 7.5;
        const dist = Math.floor(Math.sqrt(dx * dx + dy * dy));
        const col = rings[dist % rings.length];
        this.setPixel(ctx, ox + x, oy + y, col);
      }
    }
  }

  private drawOakLeaves(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    const greens = ['#2e6f1e', '#388724', '#265b18', '#429e2b'];
    ctx.clearRect(ox, oy, 16, 16);
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        if ((x + y * 3) % 7 === 0) continue; // Transparency cutouts!
        const col = greens[(x * 17 + y * 31) % greens.length];
        this.setPixel(ctx, ox + x, oy + y, col);
      }
    }
  }

  private drawOakPlanks(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    const wood = ['#b8945f', '#a18150', '#c9a46e', '#8f7244'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        if (y % 4 === 0) {
          this.setPixel(ctx, ox + x, oy + y, '#6c5531'); // Plank border line
        } else {
          const col = wood[(x * 13 + y * 7) % wood.length];
          this.setPixel(ctx, ox + x, oy + y, col);
        }
      }
    }
  }

  private drawSand(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    const sands = ['#dbd3a0', '#c2ba88', '#e7dfad', '#b5ad7c'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const hash = (x * 47 + y * 23) % sands.length;
        this.setPixel(ctx, ox + x, oy + y, sands[hash]);
      }
    }
  }

  private drawWater(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    const blues = ['#2563eb', '#1d4ed8', '#3b82f6', '#1e40af'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const wave = Math.sin((x + y) * 0.8) > 0 ? blues[0] : blues[1];
        this.setPixel(ctx, ox + x, oy + y, wave);
      }
    }
  }

  private drawGlass(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    ctx.clearRect(ox, oy, 16, 16);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(ox, oy, 16, 16);
    // Outer frame
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.strokeRect(ox + 0.5, oy + 0.5, 15, 15);
    // Diagonal glass sheen lines
    this.setPixel(ctx, ox + 3, oy + 3, '#ffffff');
    this.setPixel(ctx, ox + 4, oy + 4, '#ffffff');
    this.setPixel(ctx, ox + 5, oy + 5, '#ffffff');
    this.setPixel(ctx, ox + 10, oy + 10, '#ffffff');
    this.setPixel(ctx, ox + 11, oy + 11, '#ffffff');
  }

  private drawBricks(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    const red = '#993d3d';
    const darkRed = '#802f2f';
    const mortar = '#d6d3d1';
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        if (y % 4 === 0) {
          this.setPixel(ctx, ox + x, oy + y, mortar);
          continue;
        }
        const row = Math.floor(y / 4);
        const shift = (row % 2 === 0) ? 0 : 4;
        if ((x + shift) % 8 === 0) {
          this.setPixel(ctx, ox + x, oy + y, mortar);
        } else {
          const col = ((x + y) % 3 === 0) ? darkRed : red;
          this.setPixel(ctx, ox + x, oy + y, col);
        }
      }
    }
  }

  private drawOre(ctx: CanvasRenderingContext2D, ox: number, oy: number, mainColor: string, darkColor: string) {
    this.drawStone(ctx, ox, oy);
    const oreSpots = [
      [3, 3], [4, 3], [3, 4],
      [11, 4], [12, 4], [12, 5],
      [7, 9], [8, 9], [8, 10], [9, 10],
      [4, 12], [5, 12], [4, 13]
    ];
    for (const [px, py] of oreSpots) {
      this.setPixel(ctx, ox + px, oy + py, mainColor);
      this.setPixel(ctx, ox + px + 1, oy + py, darkColor);
    }
  }

  private drawTntSide(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    // Red body with white middle label
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        if (y >= 6 && y <= 9) {
          this.setPixel(ctx, ox + x, oy + y, '#f4f4f5'); // White band
        } else {
          const red = ((x + y) % 4 === 0) ? '#b91c1c' : '#dc2626';
          this.setPixel(ctx, ox + x, oy + y, red);
        }
      }
    }
    // "TNT" black text pixels on white band
    ctx.fillStyle = '#000000';
    // T
    ctx.fillRect(ox + 2, oy + 7, 3, 1);
    ctx.fillRect(ox + 3, oy + 7, 1, 3);
    // N
    ctx.fillRect(ox + 6, oy + 7, 1, 3);
    ctx.fillRect(ox + 7, oy + 8, 1, 1);
    ctx.fillRect(ox + 8, oy + 7, 1, 3);
    // T
    ctx.fillRect(ox + 10, oy + 7, 3, 1);
    ctx.fillRect(ox + 11, oy + 7, 1, 3);
  }

  private drawTntTop(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    this.drawTntBottom(ctx, ox, oy);
    // Center gunpowder fuse
    ctx.fillStyle = '#27272a';
    ctx.fillRect(ox + 6, oy + 6, 4, 4);
    this.setPixel(ctx, ox + 7, oy + 7, '#ef4444');
  }

  private drawTntBottom(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const col = ((x ^ y) % 3 === 0) ? '#991b1b' : '#b91c1c';
        this.setPixel(ctx, ox + x, oy + y, col);
      }
    }
  }

  private drawCraftingTableTop(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    this.drawOakPlanks(ctx, ox, oy);
    // 3x3 checkered crafting grid
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1;
    ctx.strokeRect(ox + 2.5, oy + 2.5, 11, 11);
    ctx.strokeRect(ox + 6.5, oy + 2.5, 3, 11);
    ctx.strokeRect(ox + 2.5, oy + 6.5, 11, 3);
  }

  private drawCraftingTableFront(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    this.drawOakPlanks(ctx, ox, oy);
    // Saw and hammer carving
    ctx.fillStyle = '#451a03';
    ctx.fillRect(ox + 3, oy + 4, 2, 7);
    ctx.fillRect(ox + 2, oy + 4, 4, 2);
    // Saw
    ctx.fillRect(ox + 10, oy + 5, 3, 6);
  }

  private drawCraftingTableSide(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    this.drawOakPlanks(ctx, ox, oy);
    // Tool engraving
    ctx.fillStyle = '#451a03';
    ctx.fillRect(ox + 4, oy + 4, 8, 2);
    ctx.fillRect(ox + 7, oy + 6, 2, 6);
  }

  private drawFurnaceFront(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    this.drawCobblestone(ctx, ox, oy);
    // Arch vent
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(ox + 3, oy + 7, 10, 6);
    // Glowing red/yellow ember grate inside
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(ox + 5, oy + 10, 6, 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(ox + 6, oy + 11, 4, 1);
  }

  private drawBookshelf(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    this.drawOakPlanks(ctx, ox, oy);
    const bookColors = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#9333ea'];
    // Top shelf
    for (let x = 2; x < 14; x++) {
      const col = bookColors[x % bookColors.length];
      for (let y = 2; y < 7; y++) {
        this.setPixel(ctx, ox + x, oy + y, col);
      }
    }
    // Bottom shelf
    for (let x = 2; x < 14; x++) {
      const col = bookColors[(x + 2) % bookColors.length];
      for (let y = 9; y < 14; y++) {
        this.setPixel(ctx, ox + x, oy + y, col);
      }
    }
  }

  private drawBedrock(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    const shades = ['#000000', '#18181b', '#27272a', '#3f3f46', '#52525b'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const hash = (x * 47 + y * 73 + (x * y)) % shades.length;
        this.setPixel(ctx, ox + x, oy + y, shades[hash]);
      }
    }
  }

  private drawSnow(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    const whites = ['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const hash = (x * 19 + y * 29) % whites.length;
        this.setPixel(ctx, ox + x, oy + y, whites[hash]);
      }
    }
  }

  private drawSnowSide(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    this.drawDirt(ctx, ox, oy);
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 4; y++) {
        this.setPixel(ctx, ox + x, oy + y, '#ffffff');
      }
    }
  }

  private drawCactusTop(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    const greens = ['#15803d', '#16a34a', '#22c55e', '#166534'];
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const hash = (x * 13 + y * 17) % greens.length;
        this.setPixel(ctx, ox + x, oy + y, greens[hash]);
      }
    }
  }

  private drawCactusSide(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
    const greens = ['#15803d', '#16a34a', '#166534'];
    for (let x = 0; x < 16; x++) {
      const col = (x % 3 === 0) ? greens[0] : greens[1];
      for (let y = 0; y < 16; y++) {
        if ((x + y * 4) % 11 === 0) {
          this.setPixel(ctx, ox + x, oy + y, '#1e293b'); // Spines
        } else {
          this.setPixel(ctx, ox + x, oy + y, col);
        }
      }
    }
  }
}
