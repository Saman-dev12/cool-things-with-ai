import * as THREE from 'three';
import { BlockType, BlockFace, TargetedBlock } from '../types';
import { Chunk, CHUNK_SIZE_X, CHUNK_SIZE_Y, CHUNK_SIZE_Z } from './Chunk';
import { TextureAtlas } from './TextureAtlas';
import { NoiseGenerator } from './Noise';

export class World {
  public chunks: Map<string, Chunk> = new Map();
  public group: THREE.Group;
  public atlas: TextureAtlas;
  public noise: NoiseGenerator;
  public seed: number;
  public seaLevel = 22;

  constructor(seed = 1337) {
    this.seed = seed;
    this.noise = new NoiseGenerator(seed);
    this.atlas = TextureAtlas.getInstance();
    this.group = new THREE.Group();
  }

  public getChunkKey(cx: number, cz: number): string {
    return `${cx},${cz}`;
  }

  public getChunk(cx: number, cz: number): Chunk | undefined {
    return this.chunks.get(this.getChunkKey(cx, cz));
  }

  public worldToChunkCoords(x: number, z: number): [number, number] {
    const cx = Math.floor(x / CHUNK_SIZE_X);
    const cz = Math.floor(z / CHUNK_SIZE_Z);
    return [cx, cz];
  }

  public worldToLocalCoords(x: number, y: number, z: number): [number, number, number] {
    const lx = ((x % CHUNK_SIZE_X) + CHUNK_SIZE_X) % CHUNK_SIZE_X;
    const lz = ((z % CHUNK_SIZE_Z) + CHUNK_SIZE_Z) % CHUNK_SIZE_Z;
    return [lx, y, lz];
  }

  public getBlock(worldX: number, worldY: number, worldZ: number): BlockType {
    if (worldY < 0 || worldY >= CHUNK_SIZE_Y) return BlockType.AIR;
    const [cx, cz] = this.worldToChunkCoords(worldX, worldZ);
    const chunk = this.getChunk(cx, cz);
    if (!chunk) return BlockType.AIR;
    const [lx, ly, lz] = this.worldToLocalCoords(worldX, worldY, worldZ);
    return chunk.getBlock(lx, ly, lz);
  }

  public setBlock(worldX: number, worldY: number, worldZ: number, type: BlockType) {
    if (worldY < 0 || worldY >= CHUNK_SIZE_Y) return;
    const [cx, cz] = this.worldToChunkCoords(worldX, worldZ);
    let chunk = this.getChunk(cx, cz);
    if (!chunk) {
      chunk = new Chunk(cx, cz);
      this.chunks.set(this.getChunkKey(cx, cz), chunk);
      this.group.add(chunk.group);
    }
    const [lx, ly, lz] = this.worldToLocalCoords(worldX, worldY, worldZ);
    chunk.setBlock(lx, ly, lz, type);
    chunk.rebuildMesh(this.atlas, (wx, wy, wz) => this.getBlock(wx, wy, wz));

    // If on boundary, also rebuild neighbor chunks
    if (lx === 0) this.rebuildChunkMesh(cx - 1, cz);
    if (lx === CHUNK_SIZE_X - 1) this.rebuildChunkMesh(cx + 1, cz);
    if (lz === 0) this.rebuildChunkMesh(cx, cz - 1);
    if (lz === CHUNK_SIZE_Z - 1) this.rebuildChunkMesh(cx, cz + 1);
  }

  public rebuildChunkMesh(cx: number, cz: number) {
    const chunk = this.getChunk(cx, cz);
    if (chunk) {
      chunk.rebuildMesh(this.atlas, (wx, wy, wz) => this.getBlock(wx, wy, wz));
    }
  }

  // Generate a rectangular area of chunks around center (e.g. 5x5 chunks = 80x80 blocks)
  public generateArea(centerChunkX = 0, centerChunkZ = 0, radius = 2) {
    // 1. First pass: generate terrain voxels for all chunks in area
    for (let cx = centerChunkX - radius; cx <= centerChunkX + radius; cx++) {
      for (let cz = centerChunkZ - radius; cz <= centerChunkZ + radius; cz++) {
        if (!this.getChunk(cx, cz)) {
          const chunk = new Chunk(cx, cz);
          this.generateChunkTerrain(chunk);
          this.chunks.set(this.getChunkKey(cx, cz), chunk);
          this.group.add(chunk.group);
        }
      }
    }

    // 2. Second pass: decorate with trees & flora (which can cross chunk boundaries)
    for (let cx = centerChunkX - radius; cx <= centerChunkX + radius; cx++) {
      for (let cz = centerChunkZ - radius; cz <= centerChunkZ + radius; cz++) {
        this.decorateChunk(cx, cz);
      }
    }

    // 3. Third pass: rebuild meshes with all neighbor voxels populated
    for (let cx = centerChunkX - radius; cx <= centerChunkX + radius; cx++) {
      for (let cz = centerChunkZ - radius; cz <= centerChunkZ + radius; cz++) {
        const chunk = this.getChunk(cx, cz);
        if (chunk) {
          chunk.rebuildMesh(this.atlas, (wx, wy, wz) => this.getBlock(wx, wy, wz));
        }
      }
    }
  }

  private generateChunkTerrain(chunk: Chunk) {
    const originX = chunk.chunkX * CHUNK_SIZE_X;
    const originZ = chunk.chunkZ * CHUNK_SIZE_Z;

    for (let x = 0; x < CHUNK_SIZE_X; x++) {
      for (let z = 0; z < CHUNK_SIZE_Z; z++) {
        const wx = originX + x;
        const wz = originZ + z;

        // Biome temperature & moisture
        const tempNoise = this.noise.noise2D(wx * 0.005, wz * 0.005);
        const isDesert = tempNoise > 0.35;
        const isMountain = this.noise.noise2D(wx * 0.015, wz * 0.015) > 0.45;

        // Base heightmap using fractal Brownian motion
        let height: number;
        if (isMountain) {
          const mHeight = this.noise.fbm2D(wx * 0.02, wz * 0.02, 4) * 18 + 36;
          height = Math.floor(Math.max(26, Math.min(56, mHeight)));
        } else if (isDesert) {
          const dHeight = this.noise.fbm2D(wx * 0.03, wz * 0.03, 3) * 6 + 26;
          height = Math.floor(dHeight);
        } else {
          // Rolling plains & hills
          const pHeight = this.noise.fbm2D(wx * 0.02, wz * 0.02, 4) * 10 + 26;
          height = Math.floor(pHeight);
        }

        for (let y = 0; y < CHUNK_SIZE_Y; y++) {
          let block = BlockType.AIR;

          if (y === 0) {
            block = BlockType.BEDROCK;
          } else if (y < height) {
            if (y === height - 1) {
              if (isDesert) {
                block = BlockType.SAND;
              } else if (y >= 48) {
                block = BlockType.SNOW;
              } else if (y <= this.seaLevel + 1) {
                block = BlockType.SAND;
              } else {
                block = BlockType.GRASS;
              }
            } else if (y >= height - 4) {
              block = isDesert ? BlockType.SAND : BlockType.DIRT;
            } else {
              // Stone layer with natural ores
              const oreRoll = Math.abs(this.noise.noise3D(wx * 0.1, y * 0.1, wz * 0.1));
              if (y <= 12 && oreRoll > 0.72) {
                block = BlockType.DIAMOND_ORE;
              } else if (y <= 20 && oreRoll > 0.68) {
                block = BlockType.GOLD_ORE;
              } else if (y <= 32 && oreRoll > 0.62) {
                block = BlockType.IRON_ORE;
              } else if (oreRoll > 0.58) {
                block = BlockType.COAL_ORE;
              } else {
                block = BlockType.STONE;
              }
            }
          } else if (y <= this.seaLevel) {
            // Fill water up to sea level
            block = BlockType.WATER;
          }

          chunk.setBlock(x, y, z, block);
        }
      }
    }
  }

  private decorateChunk(cx: number, cz: number) {
    const originX = cx * CHUNK_SIZE_X;
    const originZ = cz * CHUNK_SIZE_Z;

    for (let x = 2; x < CHUNK_SIZE_X - 2; x += 4) {
      for (let z = 2; z < CHUNK_SIZE_Z - 2; z += 4) {
        const wx = originX + x;
        const wz = originZ + z;
        const tempNoise = this.noise.noise2D(wx * 0.005, wz * 0.005);
        const isDesert = tempNoise > 0.35;

        // Find surface block
        let surfaceY = -1;
        for (let y = CHUNK_SIZE_Y - 1; y >= 0; y--) {
          const b = this.getBlock(wx, y, wz);
          if (b !== BlockType.AIR && b !== BlockType.WATER) {
            surfaceY = y;
            break;
          }
        }

        if (surfaceY > this.seaLevel + 1 && surfaceY < 46) {
          const treeChance = this.noise.noise2D(wx * 0.2, wz * 0.2);

          if (isDesert && treeChance > 0.4) {
            // Spawn Cactus (2-3 blocks tall)
            const cactusHeight = Math.floor(Math.abs(treeChance * 10) % 2) + 2;
            for (let cy = 1; cy <= cactusHeight; cy++) {
              this.setBlock(wx, surfaceY + cy, wz, BlockType.CACTUS);
            }
          } else if (!isDesert && treeChance > 0.3) {
            // Spawn Oak Tree
            this.growOakTree(wx, surfaceY + 1, wz);
          }
        }
      }
    }
  }

  public growOakTree(rootX: number, rootY: number, rootZ: number) {
    const trunkHeight = 5;

    // Trunk
    for (let y = 0; y < trunkHeight; y++) {
      this.setBlock(rootX, rootY + y, rootZ, BlockType.OAK_LOG);
    }

    // Leaves canopy
    const leafStart = rootY + trunkHeight - 2;
    for (let ly = leafStart; ly <= rootY + trunkHeight + 1; ly++) {
      const radius = ly >= rootY + trunkHeight ? 1 : 2;
      for (let lx = -radius; lx <= radius; lx++) {
        for (let lz = -radius; lz <= radius; lz++) {
          if (Math.abs(lx) === radius && Math.abs(lz) === radius && (ly === rootY + trunkHeight + 1 || Math.random() > 0.4)) {
            continue; // Cut corners for natural rounded canopy
          }
          const wx = rootX + lx;
          const wz = rootZ + lz;
          if (this.getBlock(wx, ly, wz) === BlockType.AIR) {
            this.setBlock(wx, ly, wz, BlockType.OAK_LEAVES);
          }
        }
      }
    }
  }

  // Fast Voxel Raycasting (DDA / Fast Voxel Traversal)
  public raycast(ray: THREE.Ray, maxDistance = 6.0): TargetedBlock | null {
    const pos = ray.origin.clone();
    const dir = ray.direction.clone().normalize();

    let x = Math.floor(pos.x);
    let y = Math.floor(pos.y);
    let z = Math.floor(pos.z);

    const stepX = dir.x > 0 ? 1 : dir.x < 0 ? -1 : 0;
    const stepY = dir.y > 0 ? 1 : dir.y < 0 ? -1 : 0;
    const stepZ = dir.z > 0 ? 1 : dir.z < 0 ? -1 : 0;

    const tDeltaX = stepX !== 0 ? Math.abs(1 / dir.x) : Infinity;
    const tDeltaY = stepY !== 0 ? Math.abs(1 / dir.y) : Infinity;
    const tDeltaZ = stepZ !== 0 ? Math.abs(1 / dir.z) : Infinity;

    let tMaxX = stepX > 0 ? (x + 1 - pos.x) * tDeltaX : (pos.x - x) * tDeltaX;
    let tMaxY = stepY > 0 ? (y + 1 - pos.y) * tDeltaY : (pos.y - y) * tDeltaY;
    let tMaxZ = stepZ > 0 ? (z + 1 - pos.z) * tDeltaZ : (pos.z - z) * tDeltaZ;

    let face: BlockFace = 'top';
    let normal: [number, number, number] = [0, 1, 0];
    let distance = 0;

    while (distance <= maxDistance) {
      const block = this.getBlock(x, y, z);
      if (block !== BlockType.AIR && block !== BlockType.WATER) {
        const [cx, cz] = this.worldToChunkCoords(x, z);
        const [lx, ly, lz] = this.worldToLocalCoords(x, y, z);
        return {
          worldX: x,
          worldY: y,
          worldZ: z,
          chunkX: cx,
          chunkZ: cz,
          localX: lx,
          localY: ly,
          localZ: lz,
          face,
          normal,
          blockType: block,
          distance
        };
      }

      if (tMaxX < tMaxY) {
        if (tMaxX < tMaxZ) {
          x += stepX;
          distance = tMaxX;
          tMaxX += tDeltaX;
          face = stepX > 0 ? 'west' : 'east';
          normal = [-stepX, 0, 0];
        } else {
          z += stepZ;
          distance = tMaxZ;
          tMaxZ += tDeltaZ;
          face = stepZ > 0 ? 'south' : 'north';
          normal = [0, 0, -stepZ];
        }
      } else {
        if (tMaxY < tMaxZ) {
          y += stepY;
          distance = tMaxY;
          tMaxY += tDeltaY;
          face = stepY > 0 ? 'bottom' : 'top';
          normal = [0, -stepY, 0];
        } else {
          z += stepZ;
          distance = tMaxZ;
          tMaxZ += tDeltaZ;
          face = stepZ > 0 ? 'south' : 'north';
          normal = [0, 0, -stepZ];
        }
      }
    }

    return null;
  }

  // Trigger TNT Spherical Explosion
  public explode(centerX: number, centerY: number, centerZ: number, radius = 4): { destroyed: number } {
    let destroyed = 0;
    const affectedChunks = new Set<string>();

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const distSq = dx * dx + dy * dy + dz * dz;
          if (distSq <= radius * radius) {
            const wx = centerX + dx;
            const wy = centerY + dy;
            const wz = centerZ + dz;

            const block = this.getBlock(wx, wy, wz);
            if (block !== BlockType.AIR && block !== BlockType.BEDROCK) {
              const [cx, cz] = this.worldToChunkCoords(wx, wz);
              const chunk = this.getChunk(cx, cz);
              if (chunk) {
                const [lx, ly, lz] = this.worldToLocalCoords(wx, wy, wz);
                chunk.setBlock(lx, ly, lz, BlockType.AIR);
                affectedChunks.add(`${cx},${cz}`);
                destroyed++;
              }
            }
          }
        }
      }
    }

    // Rebuild all touched chunks
    for (const key of affectedChunks) {
      const [cxStr, czStr] = key.split(',');
      const cx = parseInt(cxStr);
      const cz = parseInt(czStr);
      this.rebuildChunkMesh(cx, cz);
      this.rebuildChunkMesh(cx - 1, cz);
      this.rebuildChunkMesh(cx + 1, cz);
      this.rebuildChunkMesh(cx, cz - 1);
      this.rebuildChunkMesh(cx, cz + 1);
    }

    return { destroyed };
  }
}
