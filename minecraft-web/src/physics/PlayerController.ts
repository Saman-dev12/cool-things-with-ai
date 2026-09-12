import * as THREE from 'three';
import { World } from '../voxel/World';
import { PhysicsEngine } from './PhysicsEngine';
import { PlayerState, GameSettings } from '../types';

export class PlayerController {
  public camera: THREE.PerspectiveCamera;
  public world: World;
  public physics: PhysicsEngine;

  public position = new THREE.Vector3(0, 35, 0);
  public velocity = new THREE.Vector3(0, 0, 0);

  public pitch = 0; // Look up / down (-Math.PI/2 to Math.PI/2)
  public yaw = 0;   // Turn left / right

  public isGrounded = false;
  public isSprinting = false;
  public isSneaking = false;
  public isFlying = false;
  public inWater = false;
  public gameMode: 'survival' | 'creative' = 'creative';

  public health = 20;
  public hunger = 20;
  public experience = 0;
  public level = 0;
  public oxygen = 20;

  public bobTimer = 0;
  public headBobOffset = new THREE.Vector3();

  // Keys state
  private keys: Record<string, boolean> = {};
  public isLocked = false;

  private lastSpaceTime = 0;
  private lastWTime = 0;

  constructor(camera: THREE.PerspectiveCamera, world: World) {
    this.camera = camera;
    this.world = world;
    this.physics = new PhysicsEngine();

    this.setupInputs();
  }

  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Double-tap Space for Creative flight toggle
      if (e.code === 'Space') {
        const now = performance.now();
        if (now - this.lastSpaceTime < 300) {
          this.isFlying = !this.isFlying;
          this.velocity.y = 0;
        }
        this.lastSpaceTime = now;
      }

      // Double-tap W for Sprinting toggle
      if (e.code === 'KeyW') {
        const now = performance.now();
        if (now - this.lastWTime < 300) {
          this.isSprinting = true;
        }
        this.lastWTime = now;
      }

      // Fly toggle hotkey F
      if (e.code === 'KeyF') {
        this.isFlying = !this.isFlying;
        this.velocity.y = 0;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.code === 'KeyW' && !this.keys['ControlLeft']) {
        this.isSprinting = false;
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isLocked) return;
      const sens = 0.0022;
      this.yaw -= e.movementX * sens;
      this.pitch -= e.movementY * sens;

      // Clamp pitch to straight up / down
      this.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.pitch));
    });
  }

  public requestPointerLock(domElement: HTMLElement) {
    domElement.requestPointerLock();
  }

  public update(dt: number, settings: GameSettings) {
    // Check sprint key
    if (this.keys['ControlLeft']) {
      this.isSprinting = true;
    }
    this.isSneaking = !!this.keys['ShiftLeft'];

    // Movement speeds
    let moveSpeed = 4.3; // Minecraft walking: ~4.3 m/s
    if (this.isSprinting) moveSpeed = 6.2; // Sprinting: ~6.2 m/s
    if (this.isSneaking) moveSpeed = 1.3;  // Sneaking: ~1.3 m/s
    if (this.isFlying) moveSpeed = 12.0;  // Creative flight

    // Forward and Right vectors from yaw (horizontal plane only)
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize();
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).normalize();

    const wishDir = new THREE.Vector3();
    if (this.keys['KeyW']) wishDir.add(forward);
    if (this.keys['KeyS']) wishDir.sub(forward);
    if (this.keys['KeyD']) wishDir.add(right);
    if (this.keys['KeyA']) wishDir.sub(right);

    if (wishDir.lengthSq() > 0) {
      wishDir.normalize();
      this.velocity.x = wishDir.x * moveSpeed;
      this.velocity.z = wishDir.z * moveSpeed;

      // Head bobbing animation when grounded
      if (this.isGrounded && !this.isFlying) {
        this.bobTimer += dt * (this.isSprinting ? 14 : 9);
        this.headBobOffset.y = Math.sin(this.bobTimer) * 0.04;
        this.headBobOffset.x = Math.cos(this.bobTimer * 0.5) * 0.02;
      }
    } else {
      // Friction / deceleration
      const friction = this.isGrounded ? 0.001 : 0.4;
      this.velocity.x *= Math.pow(friction, dt * 60);
      this.velocity.z *= Math.pow(friction, dt * 60);
      this.headBobOffset.set(0, 0, 0);
    }

    // Jump / Fly vertical controls
    if (this.isFlying) {
      if (this.keys['Space']) this.velocity.y = 8.0;
      else if (this.keys['ShiftLeft']) this.velocity.y = -8.0;
      else this.velocity.y = 0;
    } else if (this.inWater) {
      if (this.keys['Space']) {
        this.velocity.y = 3.5; // Swimming up
      }
    } else if (this.keys['Space'] && this.isGrounded) {
      this.velocity.y = 9.2; // Minecraft jump velocity
      this.isGrounded = false;
    }

    // Run physics collision simulation
    const res = this.physics.updatePlayer(
      this.world,
      this.position,
      this.velocity,
      dt,
      this.isSneaking,
      this.isFlying
    );

    this.isGrounded = res.isGrounded;
    this.inWater = res.inWater;

    // Update Camera Transform
    const eyeY = this.position.y + this.physics.eyeHeight - (this.isSneaking ? 0.2 : 0) + this.headBobOffset.y;
    this.camera.position.set(
      this.position.x + this.headBobOffset.x,
      eyeY,
      this.position.z
    );

    // Apply rotation (Euler order YXZ)
    const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);

    // Dynamic FOV (Sprint kick)
    const baseFov = settings.fov || 75;
    const targetFov = this.isSprinting && wishDir.lengthSq() > 0 ? baseFov + 12 : baseFov;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, dt * 10);
    this.camera.updateProjectionMatrix();
  }

  public getState(): PlayerState {
    return {
      position: [this.position.x, this.position.y, this.position.z],
      velocity: [this.velocity.x, this.velocity.y, this.velocity.z],
      rotation: [this.pitch, this.yaw],
      isGrounded: this.isGrounded,
      isSprinting: this.isSprinting,
      isSneaking: this.isSneaking,
      isSwimming: this.inWater,
      isFlying: this.isFlying,
      inWater: this.inWater,
      health: this.health,
      hunger: this.hunger,
      experience: this.experience,
      level: this.level,
      oxygen: this.oxygen,
      gameMode: this.gameMode
    };
  }
}
