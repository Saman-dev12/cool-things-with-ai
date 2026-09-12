import { BlockType, BlockDef } from '../types';

export const BLOCK_REGISTRY: Record<BlockType, BlockDef> = {
  [BlockType.AIR]: {
    id: BlockType.AIR,
    name: 'Air',
    category: 'natural',
    hardness: 0,
    transparent: true,
    soundType: 'grass',
    textures: { top: 'air', bottom: 'air', north: 'air', south: 'air', east: 'air', west: 'air' }
  },
  [BlockType.GRASS]: {
    id: BlockType.GRASS,
    name: 'Grass Block',
    category: 'natural',
    hardness: 600,
    soundType: 'grass',
    textures: {
      top: 'grass_top',
      bottom: 'dirt',
      north: 'grass_side',
      south: 'grass_side',
      east: 'grass_side',
      west: 'grass_side'
    }
  },
  [BlockType.DIRT]: {
    id: BlockType.DIRT,
    name: 'Dirt',
    category: 'natural',
    hardness: 500,
    soundType: 'dirt',
    textures: {
      top: 'dirt',
      bottom: 'dirt',
      north: 'dirt',
      south: 'dirt',
      east: 'dirt',
      west: 'dirt'
    }
  },
  [BlockType.STONE]: {
    id: BlockType.STONE,
    name: 'Stone',
    category: 'building',
    hardness: 1500,
    soundType: 'stone',
    textures: {
      top: 'stone',
      bottom: 'stone',
      north: 'stone',
      south: 'stone',
      east: 'stone',
      west: 'stone'
    }
  },
  [BlockType.COBBLESTONE]: {
    id: BlockType.COBBLESTONE,
    name: 'Cobblestone',
    category: 'building',
    hardness: 1600,
    soundType: 'stone',
    textures: {
      top: 'cobblestone',
      bottom: 'cobblestone',
      north: 'cobblestone',
      south: 'cobblestone',
      east: 'cobblestone',
      west: 'cobblestone'
    }
  },
  [BlockType.OAK_LOG]: {
    id: BlockType.OAK_LOG,
    name: 'Oak Log',
    category: 'natural',
    hardness: 1200,
    soundType: 'wood',
    textures: {
      top: 'oak_log_top',
      bottom: 'oak_log_top',
      north: 'oak_log_side',
      south: 'oak_log_side',
      east: 'oak_log_side',
      west: 'oak_log_side'
    }
  },
  [BlockType.OAK_LEAVES]: {
    id: BlockType.OAK_LEAVES,
    name: 'Oak Leaves',
    category: 'natural',
    hardness: 300,
    transparent: true,
    soundType: 'grass',
    textures: {
      top: 'oak_leaves',
      bottom: 'oak_leaves',
      north: 'oak_leaves',
      south: 'oak_leaves',
      east: 'oak_leaves',
      west: 'oak_leaves'
    }
  },
  [BlockType.OAK_PLANKS]: {
    id: BlockType.OAK_PLANKS,
    name: 'Oak Planks',
    category: 'building',
    hardness: 1000,
    soundType: 'wood',
    textures: {
      top: 'oak_planks',
      bottom: 'oak_planks',
      north: 'oak_planks',
      south: 'oak_planks',
      east: 'oak_planks',
      west: 'oak_planks'
    }
  },
  [BlockType.SAND]: {
    id: BlockType.SAND,
    name: 'Sand',
    category: 'natural',
    hardness: 500,
    soundType: 'sand',
    textures: {
      top: 'sand',
      bottom: 'sand',
      north: 'sand',
      south: 'sand',
      east: 'sand',
      west: 'sand'
    }
  },
  [BlockType.WATER]: {
    id: BlockType.WATER,
    name: 'Water',
    category: 'natural',
    hardness: 0,
    transparent: true,
    translucent: true,
    soundType: 'water',
    textures: {
      top: 'water',
      bottom: 'water',
      north: 'water',
      south: 'water',
      east: 'water',
      west: 'water'
    }
  },
  [BlockType.GLASS]: {
    id: BlockType.GLASS,
    name: 'Glass',
    category: 'building',
    hardness: 400,
    transparent: true,
    soundType: 'glass',
    textures: {
      top: 'glass',
      bottom: 'glass',
      north: 'glass',
      south: 'glass',
      east: 'glass',
      west: 'glass'
    }
  },
  [BlockType.BRICKS]: {
    id: BlockType.BRICKS,
    name: 'Bricks',
    category: 'building',
    hardness: 1800,
    soundType: 'stone',
    textures: {
      top: 'bricks',
      bottom: 'bricks',
      north: 'bricks',
      south: 'bricks',
      east: 'bricks',
      west: 'bricks'
    }
  },
  [BlockType.COAL_ORE]: {
    id: BlockType.COAL_ORE,
    name: 'Coal Ore',
    category: 'ores',
    hardness: 2000,
    soundType: 'stone',
    textures: {
      top: 'coal_ore',
      bottom: 'coal_ore',
      north: 'coal_ore',
      south: 'coal_ore',
      east: 'coal_ore',
      west: 'coal_ore'
    }
  },
  [BlockType.IRON_ORE]: {
    id: BlockType.IRON_ORE,
    name: 'Iron Ore',
    category: 'ores',
    hardness: 2200,
    soundType: 'stone',
    textures: {
      top: 'iron_ore',
      bottom: 'iron_ore',
      north: 'iron_ore',
      south: 'iron_ore',
      east: 'iron_ore',
      west: 'iron_ore'
    }
  },
  [BlockType.GOLD_ORE]: {
    id: BlockType.GOLD_ORE,
    name: 'Gold Ore',
    category: 'ores',
    hardness: 2500,
    soundType: 'stone',
    textures: {
      top: 'gold_ore',
      bottom: 'gold_ore',
      north: 'gold_ore',
      south: 'gold_ore',
      east: 'gold_ore',
      west: 'gold_ore'
    }
  },
  [BlockType.DIAMOND_ORE]: {
    id: BlockType.DIAMOND_ORE,
    name: 'Diamond Ore',
    category: 'ores',
    hardness: 3000,
    soundType: 'stone',
    textures: {
      top: 'diamond_ore',
      bottom: 'diamond_ore',
      north: 'diamond_ore',
      south: 'diamond_ore',
      east: 'diamond_ore',
      west: 'diamond_ore'
    }
  },
  [BlockType.TNT]: {
    id: BlockType.TNT,
    name: 'TNT',
    category: 'functional',
    hardness: 100,
    soundType: 'grass',
    textures: {
      top: 'tnt_top',
      bottom: 'tnt_bottom',
      north: 'tnt_side',
      south: 'tnt_side',
      east: 'tnt_side',
      west: 'tnt_side'
    }
  },
  [BlockType.CRAFTING_TABLE]: {
    id: BlockType.CRAFTING_TABLE,
    name: 'Crafting Table',
    category: 'functional',
    hardness: 1200,
    soundType: 'wood',
    textures: {
      top: 'crafting_table_top',
      bottom: 'oak_planks',
      north: 'crafting_table_front',
      south: 'crafting_table_side',
      east: 'crafting_table_side',
      west: 'crafting_table_front'
    }
  },
  [BlockType.FURNACE]: {
    id: BlockType.FURNACE,
    name: 'Furnace',
    category: 'functional',
    hardness: 1800,
    soundType: 'stone',
    textures: {
      top: 'furnace_top',
      bottom: 'stone',
      north: 'furnace_front',
      south: 'furnace_side',
      east: 'furnace_side',
      west: 'furnace_side'
    }
  },
  [BlockType.BOOKSHELF]: {
    id: BlockType.BOOKSHELF,
    name: 'Bookshelf',
    category: 'building',
    hardness: 1000,
    soundType: 'wood',
    textures: {
      top: 'oak_planks',
      bottom: 'oak_planks',
      north: 'bookshelf',
      south: 'bookshelf',
      east: 'bookshelf',
      west: 'bookshelf'
    }
  },
  [BlockType.BEDROCK]: {
    id: BlockType.BEDROCK,
    name: 'Bedrock',
    category: 'natural',
    hardness: 9999999, // Unbreakable
    soundType: 'stone',
    textures: {
      top: 'bedrock',
      bottom: 'bedrock',
      north: 'bedrock',
      south: 'bedrock',
      east: 'bedrock',
      west: 'bedrock'
    }
  },
  [BlockType.SNOW]: {
    id: BlockType.SNOW,
    name: 'Snow Block',
    category: 'natural',
    hardness: 400,
    soundType: 'dirt',
    textures: {
      top: 'snow',
      bottom: 'dirt',
      north: 'snow_side',
      south: 'snow_side',
      east: 'snow_side',
      west: 'snow_side'
    }
  },
  [BlockType.CACTUS]: {
    id: BlockType.CACTUS,
    name: 'Cactus',
    category: 'natural',
    hardness: 400,
    transparent: true,
    soundType: 'wood',
    textures: {
      top: 'cactus_top',
      bottom: 'cactus_bottom',
      north: 'cactus_side',
      south: 'cactus_side',
      east: 'cactus_side',
      west: 'cactus_side'
    }
  }
};

export const CREATIVE_BLOCKS: BlockType[] = [
  BlockType.GRASS,
  BlockType.DIRT,
  BlockType.STONE,
  BlockType.COBBLESTONE,
  BlockType.BRICKS,
  BlockType.OAK_LOG,
  BlockType.OAK_PLANKS,
  BlockType.OAK_LEAVES,
  BlockType.BOOKSHELF,
  BlockType.SAND,
  BlockType.SNOW,
  BlockType.CACTUS,
  BlockType.GLASS,
  BlockType.WATER,
  BlockType.COAL_ORE,
  BlockType.IRON_ORE,
  BlockType.GOLD_ORE,
  BlockType.DIAMOND_ORE,
  BlockType.CRAFTING_TABLE,
  BlockType.FURNACE,
  BlockType.TNT,
  BlockType.BEDROCK
];
