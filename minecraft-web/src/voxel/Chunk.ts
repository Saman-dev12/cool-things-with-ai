import * as THREE from 'three';
import { BlockType, BlockFace } from '../types';
import { BLOCK_REGISTRY } from './BlockRegistry';
import { TextureAtlas } from './TextureAtlas';

export const CHUNK_SIZE_X = 16;
export const CHUNK_SIZE_Z = 16;
export const CHUNK_SIZE_Y = 64;

export class Chunk {
  public chunkX: number;
  public chunkZ: number;
  public voxels: Uint8Array;
  public mesh: THREE.Mesh | null = null;
  public waterMesh: THREE.Mesh | null = null;
  public group: THREE.Group;
  public isDirty = true;

  constructor(chunkX: number, chunkZ: number) {
    this.chunkX = chunkX;
    this.chunkZ = chunkZ;
    this.voxels = new Uint8Array(CHUNK_SIZE_X * CHUNK_SIZE_Y * CHUNK_SIZE_Z);
    this.group = new THREE.Group();
    this.group.position.set(chunkX * CHUNK_SIZE_X, 0, chunkZ * CHUNK_SIZE_Z);
  }

  public static getIndex(x: number, y: number, z: number): number {
    return x + z * CHUNK_SIZE_X + y * (CHUNK_SIZE_X * CHUNK_SIZE_Z);
  }

  public getBlock(x: number, y: number, z: number): BlockType {
    if (x < 0 || x >= CHUNK_SIZE_X || y < 0 || y >= CHUNK_SIZE_Y || z < 0 || z >= CHUNK_SIZE_Z) {
      return BlockType.AIR;
    }
    return this.voxels[Chunk.getIndex(x, y, z)];
  }

  public setBlock(x: number, y: number, z: number, type: BlockType) {
    if (x < 0 || x >= CHUNK_SIZE_X || y < 0 || y >= CHUNK_SIZE_Y || z < 0 || z >= CHUNK_SIZE_Z) {
      return;
    }
    this.voxels[Chunk.getIndex(x, y, z)] = type;
    this.isDirty = true;
  }

  // Culled Face Meshing
  public rebuildMesh(
    atlas: TextureAtlas,
    getNeighborBlock: (worldX: number, worldY: number, worldZ: number) => BlockType
  ) {
    // Vertex buffers for opaque blocks
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    let vertexCount = 0;

    // Separate vertex buffers for water/translucent blocks
    const waterPositions: number[] = [];
    const waterNormals: number[] = [];
    const waterUvs: number[] = [];
    const waterColors: number[] = [];
    const waterIndices: number[] = [];
    let waterVertexCount = 0;

    const originX = this.chunkX * CHUNK_SIZE_X;
    const originZ = this.chunkZ * CHUNK_SIZE_Z;

    for (let y = 0; y < CHUNK_SIZE_Y; y++) {
      for (let z = 0; z < CHUNK_SIZE_Z; z++) {
        for (let x = 0; x < CHUNK_SIZE_X; x++) {
          const blockId = this.voxels[Chunk.getIndex(x, y, z)];
          if (blockId === BlockType.AIR) continue;

          const blockDef = BLOCK_REGISTRY[blockId as BlockType];
          if (!blockDef) continue;

          const isWater = blockId === BlockType.WATER;
          const isTranslucent = !!blockDef.translucent;

          // Check all 6 faces
          const checkFace = (
            face: BlockFace,
            dx: number,
            dy: number,
            dz: number,
            shade: number,
            faceVerts: number[],
            faceNormals: number[]
          ) => {
            const nx = x + dx;
            const ny = y + dy;
            const nz = z + dz;

            let neighborId: BlockType;
            if (nx >= 0 && nx < CHUNK_SIZE_X && ny >= 0 && ny < CHUNK_SIZE_Y && nz >= 0 && nz < CHUNK_SIZE_Z) {
              neighborId = this.voxels[Chunk.getIndex(nx, ny, nz)];
            } else {
              neighborId = getNeighborBlock(originX + nx, ny, originZ + nz);
            }

            const neighborDef = BLOCK_REGISTRY[neighborId];
            const neighborIsTransparent = !neighborDef || neighborDef.transparent || neighborDef.id === BlockType.AIR;

            // Cull conditions
            let shouldDraw = false;
            if (isWater) {
              // Water only renders against air or non-water transparent blocks
              shouldDraw = neighborId === BlockType.AIR || (neighborIsTransparent && neighborId !== BlockType.WATER);
            } else if (blockDef.transparent) {
              // Leaves / Glass / Cactus don't render face against same block type
              shouldDraw = neighborIsTransparent && neighborId !== blockId;
            } else {
              // Solid opaque block renders face if neighbor is transparent or water
              shouldDraw = neighborIsTransparent || neighborId === BlockType.WATER;
            }

            if (!shouldDraw) return;

            const uvInfo = atlas.getUV(blockDef.textures[face]);
            const targetPos = isWater ? waterPositions : positions;
            const targetNorm = isWater ? waterNormals : normals;
            const targetUv = isWater ? waterUvs : uvs;
            const targetCol = isWater ? waterColors : colors;
            const targetInd = isWater ? waterIndices : indices;
            const count = isWater ? waterVertexCount : vertexCount;

            // 4 Vertices of the quad
            for (let i = 0; i < 4; i++) {
              targetPos.push(
                x + faceVerts[i * 3],
                y + faceVerts[i * 3 + 1],
                z + faceVerts[i * 3 + 2]
              );
              targetNorm.push(faceNormals[0], faceNormals[1], faceNormals[2]);
              // Directional sunlight tinting
              targetCol.push(shade, shade, shade);
            }

            // UV coordinates for the 4 corners: (uMin, vMax), (uMax, vMax), (uMax, vMin), (uMin, vMin)
            targetUv.push(
              uvInfo.uMin, uvInfo.vMax,
              uvInfo.uMax, uvInfo.vMax,
              uvInfo.uMax, uvInfo.vMin,
              uvInfo.uMin, uvInfo.vMin
            );

            // Two triangles for the quad
            targetInd.push(count, count + 1, count + 2);
            targetInd.push(count, count + 2, count + 3);

            if (isWater) {
              waterVertexCount += 4;
            } else {
              vertexCount += 4;
            }
          };

          // Top (+Y)
          checkFace('top', 0, 1, 0, 1.0, [
            0, 1, 1,
            1, 1, 1,
            1, 1, 0,
            0, 1, 0
          ], [0, 1, 0]);

          // Bottom (-Y)
          checkFace('bottom', 0, -1, 0, 0.5, [
            0, 0, 0,
            1, 0, 0,
            1, 0, 1,
            0, 0, 1
          ], [0, -1, 0]);

          // North (+Z)
          checkFace('north', 0, 0, 1, 0.8, [
            0, 0, 1,
            1, 0, 1,
            1, 1, 1,
            0, 1, 1
          ], [0, 0, 1]);

          // South (-Z)
          checkFace('south', 0, 0, -1, 0.8, [
            1, 0, 0,
            0, 0, 0,
            0, 1, 0,
            1, 1, 0
          ], [0, 0, -1]);

          // East (+X)
          checkFace('east', 1, 0, 0, 0.65, [
            1, 0, 1,
            1, 0, 0,
            1, 1, 0,
            1, 1, 1
          ], [1, 0, 0]);

          // West (-X)
          checkFace('west', -1, 0, 0, 0.65, [
            0, 0, 0,
            0, 0, 1,
            0, 1, 1,
            0, 1, 0
          ], [-1, 0, 0]);
        }
      }
    }

    // Clean existing meshes
    if (this.mesh) {
      this.group.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh = null;
    }
    if (this.waterMesh) {
      this.group.remove(this.waterMesh);
      this.waterMesh.geometry.dispose();
      this.waterMesh = null;
    }

    // Build Opaque Mesh
    if (positions.length > 0) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.setIndex(indices);

      const material = new THREE.MeshLambertMaterial({
        map: atlas.texture,
        vertexColors: true,
        alphaTest: 0.5,
        transparent: false,
        side: THREE.FrontSide
      });

      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      this.group.add(this.mesh);
    }

    // Build Water / Translucent Mesh
    if (waterPositions.length > 0) {
      const waterGeometry = new THREE.BufferGeometry();
      waterGeometry.setAttribute('position', new THREE.Float32BufferAttribute(waterPositions, 3));
      waterGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(waterNormals, 3));
      waterGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(waterUvs, 2));
      waterGeometry.setAttribute('color', new THREE.Float32BufferAttribute(waterColors, 3));
      waterGeometry.setIndex(waterIndices);

      const waterMaterial = new THREE.MeshLambertMaterial({
        map: atlas.texture,
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
        side: THREE.DoubleSide
      });

      this.waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
      this.group.add(this.waterMesh);
    }

    this.isDirty = false;
  }

  public dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
    }
    if (this.waterMesh) {
      this.waterMesh.geometry.dispose();
    }
    this.group.clear();
  }
}
