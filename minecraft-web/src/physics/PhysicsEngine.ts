import * as THREE from 'three';
import { World } from '../voxel/World';
import { BlockType } from '../types';
import { BLOCK_REGISTRY } from '../voxel/BlockRegistry';

export class PhysicsEngine {
  public playerWidth = 0.6;
  public playerHeight = 1.8;
  public eyeHeight = 1.62;

  public gravity = -26.0;
  public terminalVelocity = -50.0;
  public waterGravity = -3.5;
  public waterDrag = 0.8;

  constructor() {}

  public isSolidBlock(block: BlockType): boolean {
    if (block === BlockType.AIR || block === BlockType.WATER) return false;
    const def = BLOCK_REGISTRY[block];
    return !!def;
  }

  // Tests if bounding box intersects solid blocks, with boundary epsilon
  public checkCollision(world: World, box: THREE.Box3): boolean {
    const eps = 0.005;
    const minX = Math.floor(box.min.x + eps);
    const maxX = Math.floor(box.max.x - eps);
    const minY = Math.floor(box.min.y + eps);
    const maxY = Math.floor(box.max.y - eps);
    const minZ = Math.floor(box.min.z + eps);
    const maxZ = Math.floor(box.max.z - eps);

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
    // Water check
    const blockAtFeet = world.getBlock(Math.floor(pos.x), Math.floor(pos.y + 0.2), Math.floor(pos.z));
    const blockAtWaist = world.getBlock(Math.floor(pos.x), Math.floor(pos.y + 0.9), Math.floor(pos.z));
    const inWater = blockAtFeet === BlockType.WATER || blockAtWaist === BlockType.WATER;

    // Check if player has solid ground directly below
    const groundProbeBox = this.getPlayerBox(pos);
    groundProbeBox.min.y -= 0.08;
    groundProbeBox.max.y = pos.y + 0.01;
    const hasGroundBelow = this.checkCollision(world, groundProbeBox);

    let isGrounded = hasGroundBelow && vel.y <= 0.001;

    // Apply vertical forces
    if (!isFlying) {
      if (inWater) {
        vel.y += this.waterGravity * dt;
        vel.y = Math.max(vel.y, -6.0);
        vel.x *= Math.pow(this.waterDrag, dt * 60);
        vel.z *= Math.pow(this.waterDrag, dt * 60);
      } else if (!isGrounded) {
        vel.y += this.gravity * dt;
        vel.y = Math.max(vel.y, this.terminalVelocity);
      } else {
        // Grounded: zero out negative vertical velocity
        if (vel.y < 0) vel.y = 0;
      }
    } else {
      vel.y *= Math.pow(0.8, dt * 60);
    }

    // 1. Move along Y
    if (vel.y !== 0) {
      const prevY = pos.y;
      pos.y += vel.y * dt;
      const boxY = this.getPlayerBox(pos);

      if (this.checkCollision(world, boxY)) {
        if (vel.y < 0) {
          isGrounded = true;
          pos.y = Math.round(prevY);
          // Ensure clear
          while (this.checkCollision(world, this.getPlayerBox(pos)) && pos.y < prevY + 1.2) {
            pos.y += 0.05;
          }
        } else {
          pos.y = prevY;
        }
        vel.y = 0;
      }
    }

    // Sneaking ledge protection: stop from walking off cliff
    if (isSneaking && isGrounded) {
      const testX = pos.clone();
      testX.x += vel.x * dt;
      const boxBelowX = this.getPlayerBox(testX);
      boxBelowX.min.y -= 0.6;
      boxBelowX.max.y = testX.y + 0.01;
      if (!this.checkCollision(world, boxBelowX)) {
        vel.x = 0;
      }

      const testZ = pos.clone();
      testZ.z += vel.z * dt;
      const boxBelowZ = this.getPlayerBox(testZ);
      boxBelowZ.min.y -= 0.6;
      boxBelowZ.max.y = testZ.y + 0.01;
      if (!this.checkCollision(world, boxBelowZ)) {
        vel.z = 0;
      }
    }

    // 2. Move along X with auto step-up for 1-block terrain
    if (vel.x !== 0) {
      const prevX = pos.x;
      pos.x += vel.x * dt;
      const boxX = this.getPlayerBox(pos);

      if (this.checkCollision(world, boxX)) {
        let stepped = false;
        if (isGrounded) {
          const stepPos = pos.clone();
          stepPos.y += 1.05;
          if (!this.checkCollision(world, this.getPlayerBox(stepPos))) {
            pos.y += 1.0;
            stepped = true;
          }
        }

        if (!stepped) {
          pos.x = prevX;
          vel.x = 0;
        }
      }
    }

    // 3. Move along Z with auto step-up
    if (vel.z !== 0) {
      const prevZ = pos.z;
      pos.z += vel.z * dt;
      const boxZ = this.getPlayerBox(pos);

      if (this.checkCollision(world, boxZ)) {
        let stepped = false;
        if (isGrounded) {
          const stepPos = pos.clone();
          stepPos.y += 1.05;
          if (!this.checkCollision(world, this.getPlayerBox(stepPos))) {
            pos.y += 1.0;
            stepped = true;
          }
        }

        if (!stepped) {
          pos.z = prevZ;
          vel.z = 0;
        }
      }
    }

    return { isGrounded, inWater };
  }
}
