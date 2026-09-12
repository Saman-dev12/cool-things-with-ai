import * as THREE from 'three';
import { World } from '../voxel/World';
import { BlockType } from '../types';
import { BLOCK_REGISTRY } from '../voxel/BlockRegistry';

export class PhysicsEngine {
  public playerWidth = 0.6;
  public playerHeight = 1.8;
  public eyeHeight = 1.62;

  public gravity = -28.0;
  public terminalVelocity = -50.0;
  public waterGravity = -4.0;
  public waterDrag = 0.75;

  constructor() {}

  public isSolidBlock(block: BlockType): boolean {
    if (block === BlockType.AIR || block === BlockType.WATER) return false;
    const def = BLOCK_REGISTRY[block];
    return !!def;
  }

  public checkCollision(world: World, box: THREE.Box3): boolean {
    const minX = Math.floor(box.min.x);
    const maxX = Math.floor(box.max.x);
    const minY = Math.floor(box.min.y);
    const maxY = Math.floor(box.max.y);
    const minZ = Math.floor(box.min.z);
    const maxZ = Math.floor(box.max.z);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const b = world.getBlock(x, y, z);
          if (this.isSolidBlock(b)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public getPlayerBox(pos: THREE.Vector3): THREE.Box3 {
    const halfW = this.playerWidth / 2;
    return new THREE.Box3(
      new THREE.Vector3(pos.x - halfW, pos.y, pos.z - halfW),
      new THREE.Vector3(pos.x + halfW, pos.y + this.playerHeight, pos.z + halfW)
    );
  }

  public updatePlayer(
    world: World,
    pos: THREE.Vector3,
    vel: THREE.Vector3,
    dt: number,
    isSneaking: boolean,
    isFlying: boolean
  ): { isGrounded: boolean; inWater: boolean } {
    // Check if player is currently in water
    const blockAtFeet = world.getBlock(Math.floor(pos.x), Math.floor(pos.y + 0.2), Math.floor(pos.z));
    const blockAtWaist = world.getBlock(Math.floor(pos.x), Math.floor(pos.y + 0.9), Math.floor(pos.z));
    const inWater = blockAtFeet === BlockType.WATER || blockAtWaist === BlockType.WATER;

    // Apply gravity
    if (!isFlying) {
      if (inWater) {
        vel.y += this.waterGravity * dt;
        vel.y = Math.max(vel.y, -8.0);
        vel.x *= Math.pow(this.waterDrag, dt * 60);
        vel.z *= Math.pow(this.waterDrag, dt * 60);
      } else {
        vel.y += this.gravity * dt;
        vel.y = Math.max(vel.y, this.terminalVelocity);
      }
    } else {
      vel.y *= Math.pow(0.8, dt * 60);
    }

    let isGrounded = false;
    const halfW = this.playerWidth / 2;

    // 1. Move along Y
    const dy = vel.y * dt;
    pos.y += dy;
    let box = this.getPlayerBox(pos);

    if (this.checkCollision(world, box)) {
      if (dy < 0) {
        // Falling down - hit floor
        isGrounded = true;
        pos.y = Math.floor(pos.y) + 1; // Snap on top of block
      } else if (dy > 0) {
        // Jumping up - hit ceiling
        pos.y = Math.floor(pos.y + this.playerHeight) - this.playerHeight - 0.001;
      }
      vel.y = 0;
    }

    // Sneaking ledge check: prevent walking off block if sneaking and grounded
    if (isSneaking && isGrounded) {
      const stepX = vel.x * dt;
      const stepZ = vel.z * dt;

      // Test if moving forward on X leaves no ground beneath
      const testPosX = pos.clone();
      testPosX.x += stepX;
      testPosX.y -= 0.1;
      const boxBelowX = this.getPlayerBox(testPosX);
      if (!this.checkCollision(world, boxBelowX)) {
        vel.x = 0;
      }

      // Test if moving forward on Z leaves no ground beneath
      const testPosZ = pos.clone();
      testPosZ.z += stepZ;
      testPosZ.y -= 0.1;
      const boxBelowZ = this.getPlayerBox(testPosZ);
      if (!this.checkCollision(world, boxBelowZ)) {
        vel.z = 0;
      }
    }

    // 2. Move along X
    const dx = vel.x * dt;
    pos.x += dx;
    box = this.getPlayerBox(pos);
    if (this.checkCollision(world, box)) {
      if (dx > 0) {
        pos.x = Math.floor(pos.x + halfW) - halfW - 0.001;
      } else if (dx < 0) {
        pos.x = Math.floor(pos.x - halfW) + 1 + halfW + 0.001;
      }
      vel.x = 0;
    }

    // 3. Move along Z
    const dz = vel.z * dt;
    pos.z += dz;
    box = this.getPlayerBox(pos);
    if (this.checkCollision(world, box)) {
      if (dz > 0) {
        pos.z = Math.floor(pos.z + halfW) - halfW - 0.001;
      } else if (dz < 0) {
        pos.z = Math.floor(pos.z - halfW) + 1 + halfW + 0.001;
      }
      vel.z = 0;
    }

    return { isGrounded, inWater };
  }
}
