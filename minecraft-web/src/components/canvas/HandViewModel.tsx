import * as THREE from 'three';
import { BlockType } from '../../types';
import { BLOCK_REGISTRY } from '../../voxel/BlockRegistry';
import { TextureAtlas } from '../../voxel/TextureAtlas';

export class HandViewModel {
  public group: THREE.Group;
  public blockMesh: THREE.Mesh | null = null;
  public handMesh: THREE.Mesh;
  public isSwinging = false;
  private swingTimer = 0;
  private atlas: TextureAtlas;

  constructor(camera: THREE.Camera) {
    this.atlas = TextureAtlas.getInstance();
    this.group = new THREE.Group();

    // Position hand in lower right of camera view
    this.group.position.set(0.42, -0.38, -0.65);
    this.group.rotation.set(0.1, -0.35, 0.05);

    // Player arm (skin/sleeve texture)
    const armGeo = new THREE.BoxGeometry(0.15, 0.45, 0.15);
    const armMat = new THREE.MeshLambertMaterial({ color: '#b97a57' });
    this.handMesh = new THREE.Mesh(armGeo, armMat);
    this.handMesh.position.set(0.08, -0.15, 0);
    this.handMesh.rotation.set(0.2, 0.1, -0.2);
    this.group.add(this.handMesh);

    camera.add(this.group);
  }

  public setHeldBlock(blockType: BlockType) {
    if (this.blockMesh) {
      this.group.remove(this.blockMesh);
      this.blockMesh.geometry.dispose();
      this.blockMesh = null;
    }

    if (blockType === BlockType.AIR) {
      this.handMesh.visible = true;
      return;
    }

    const blockDef = BLOCK_REGISTRY[blockType];
    if (!blockDef) return;

    // Build mini voxel block geometry with atlas UVs
    const size = 0.22;
    const geometry = new THREE.BoxGeometry(size, size, size);

    // Map materials with UVs from TextureAtlas
    const material = new THREE.MeshLambertMaterial({
      map: this.atlas.texture,
      transparent: !!blockDef.transparent
    });

    this.blockMesh = new THREE.Mesh(geometry, material);
    this.blockMesh.position.set(-0.02, 0.05, -0.05);
    this.blockMesh.rotation.set(0.2, 0.6, -0.1);
    this.group.add(this.blockMesh);

    this.handMesh.visible = true;
  }

  public triggerSwing() {
    if (this.isSwinging) return;
    this.isSwinging = true;
    this.swingTimer = 0;
  }

  public update(dt: number, isMoving: boolean) {
    // Walking idle bobbing
    if (isMoving && !this.isSwinging) {
      const time = performance.now() * 0.008;
      this.group.position.y = -0.38 + Math.sin(time) * 0.02;
      this.group.position.x = 0.42 + Math.cos(time * 0.5) * 0.015;
    }

    // Punch / Swing animation
    if (this.isSwinging) {
      this.swingTimer += dt * 8;
      const progress = Math.sin(this.swingTimer * Math.PI);

      this.group.rotation.x = 0.1 - progress * 0.6;
      this.group.rotation.y = -0.35 + progress * 0.3;
      this.group.position.z = -0.65 - progress * 0.12;

      if (this.swingTimer >= 1.0) {
        this.isSwinging = false;
        this.group.rotation.set(0.1, -0.35, 0.05);
        this.group.position.set(0.42, -0.38, -0.65);
      }
    }
  }

  public dispose(camera: THREE.Camera) {
    camera.remove(this.group);
    if (this.blockMesh) this.blockMesh.geometry.dispose();
    this.handMesh.geometry.dispose();
  }
}
