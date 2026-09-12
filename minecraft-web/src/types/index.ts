export enum BlockType {
  AIR = 0,
  GRASS = 1,
  DIRT = 2,
  STONE = 3,
  COBBLESTONE = 4,
  OAK_LOG = 5,
  OAK_LEAVES = 6,
  OAK_PLANKS = 7,
  SAND = 8,
  WATER = 9,
  GLASS = 10,
  BRICKS = 11,
  COAL_ORE = 12,
  IRON_ORE = 13,
  GOLD_ORE = 14,
  DIAMOND_ORE = 15,
  TNT = 16,
  CRAFTING_TABLE = 17,
  FURNACE = 18,
  BOOKSHELF = 19,
  BEDROCK = 20,
  SNOW = 21,
  CACTUS = 22
}

export type BlockFace = 'top' | 'bottom' | 'north' | 'south' | 'east' | 'west';

export interface BlockDef {
  id: BlockType;
  name: string;
  category: 'building' | 'natural' | 'functional' | 'ores';
  hardness: number; // break time in ms (creative breaks instantly)
  transparent?: boolean;
  translucent?: boolean; // e.g. water
  emissive?: boolean;
  soundType: 'grass' | 'dirt' | 'stone' | 'wood' | 'sand' | 'glass' | 'water';
  textures: {
    top: string;
    bottom: string;
    north: string;
    south: string;
    east: string;
    west: string;
  };
}

export interface BlockUV {
  uMin: number;
  vMin: number;
  uMax: number;
  vMax: number;
}

export interface PlayerState {
  position: [number, number, number];
  velocity: [number, number, number];
  rotation: [number, number]; // pitch, yaw
  isGrounded: boolean;
  isSprinting: boolean;
  isSneaking: boolean;
  isSwimming: boolean;
  isFlying: boolean;
  inWater: boolean;
  health: number; // max 20
  hunger: number; // max 20
  experience: number;
  level: number;
  oxygen: number; // max 20
  gameMode: 'survival' | 'creative';
}

export interface InventorySlot {
  block: BlockType;
  count: number;
}

export interface TargetedBlock {
  chunkX: number;
  chunkZ: number;
  localX: number;
  localY: number;
  localZ: number;
  worldX: number;
  worldY: number;
  worldZ: number;
  face: BlockFace;
  normal: [number, number, number];
  blockType: BlockType;
  distance: number;
}

export interface GameSettings {
  fov: number; // 60 to 110
  renderDistance: number; // 2 to 8 chunks
  mouseSensitivity: number; // 0.1 to 2.0
  invertY: boolean;
  volume: number; // 0.0 to 1.0
  dayNightSpeed: number; // 1 = standard, 0 = frozen, 4 = fast
  showF3: boolean;
}

export type GameScreen = 'title' | 'playing' | 'paused' | 'inventory' | 'settings';
