import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { World } from '../../voxel/World';
import { PlayerController } from '../../physics/PlayerController';
import { Skybox } from './Skybox';
import { HandViewModel } from './HandViewModel';
import { SoundManager } from '../../audio/SoundManager';
import { BlockType, TargetedBlock, GameSettings, InventorySlot, PlayerState } from '../../types';
import { BLOCK_REGISTRY } from '../../voxel/BlockRegistry';

interface GameCanvasProps {
  settings: GameSettings;
  activeBlock: BlockType;
  hotbar: InventorySlot[];
  onTargetChange: (target: TargetedBlock | null) => void;
  onPlayerUpdate: (state: PlayerState, fps: number) => void;
  onBlockMined: (type: BlockType) => void;
  onBlockPlaced: (slotIdx: number) => void;
  activeSlotIndex: number;
  isPaused: boolean;
}

interface DebrisParticle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
}

interface ActiveTnt {
  mesh: THREE.Mesh;
  timer: number;
  worldPos: THREE.Vector3;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  settings,
  activeBlock,
  hotbar,
  onTargetChange,
  onPlayerUpdate,
  onBlockMined,
  onBlockPlaced,
  activeSlotIndex,
  isPaused
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // References to core systems
  const worldRef = useRef<World | null>(null);
  const controllerRef = useRef<PlayerController | null>(null);
  const handRef = useRef<HandViewModel | null>(null);
  const skyboxRef = useRef<Skybox | null>(null);
  const soundRef = useRef<SoundManager>(SoundManager.getInstance());
  const wireframeRef = useRef<THREE.LineSegments | null>(null);

  const particlesRef = useRef<DebrisParticle[]>([]);
  const tntEntitiesRef = useRef<ActiveTnt[]>([]);

  // Mining state
  const isMiningRef = useRef(false);
  const miningProgressRef = useRef(0);
  const lastDigSoundTimeRef = useRef(0);
  const currentTargetRef = useRef<TargetedBlock | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Three.js Scene, Camera, Renderer
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xa5c4ff, 25, 75);

    const camera = new THREE.PerspectiveCamera(settings.fov || 75, width / height, 0.1, 300);
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);

    // 2. Initialize Voxel World
    const world = new World(1337);
    world.generateArea(0, 0, 2); // Initial 5x5 chunks (80x80 blocks)
    scene.add(world.group);
    worldRef.current = world;

    // 3. Player Controller
    const controller = new PlayerController(camera, world);
    controller.position.set(8, 38, 8); // Spawn above ground
    controllerRef.current = controller;

    // 4. Skybox & Celestial Cycle
    const skybox = new Skybox(scene);
    skyboxRef.current = skybox;

    // 5. Hand Viewmodel
    const hand = new HandViewModel(camera);
    hand.setHeldBlock(activeBlock);
    handRef.current = hand;

    // 6. Block Target Wireframe
    const boxGeo = new THREE.BoxGeometry(1.002, 1.002, 1.002);
    const edges = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    wireframe.visible = false;
    scene.add(wireframe);
    wireframeRef.current = wireframe;

    // 7. Particle Group
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);

    // 8. Event Listeners for Mining and Building
    const handleMouseDown = (e: MouseEvent) => {
      if (!controller.isLocked || isPaused) return;

      if (e.button === 0) {
        // Left click: Mine / Strike
        isMiningRef.current = true;
        hand.triggerSwing();

        const target = currentTargetRef.current;
        if (target) {
          if (controller.gameMode === 'creative') {
            breakBlock(target, world, scene, particleGroup);
          } else {
            soundRef.current.playDig(BLOCK_REGISTRY[target.blockType]?.soundType || 'stone');
          }
        }
      } else if (e.button === 2) {
        // Right click: Place Block / Ignite TNT
        e.preventDefault();
        hand.triggerSwing();
        const target = currentTargetRef.current;
        if (!target) return;

        // If target is TNT, ignite it!
        if (target.blockType === BlockType.TNT) {
          igniteTnt(target.worldX, target.worldY, target.worldZ, world, scene);
          return;
        }

        // Place block on targeted face
        const px = target.worldX + target.normal[0];
        const py = target.worldY + target.normal[1];
        const pz = target.worldZ + target.normal[2];

        // Ensure not colliding with player body
        const playerBox = controller.physics.getPlayerBox(controller.position);
        const newBlockBox = new THREE.Box3(
          new THREE.Vector3(px, py, pz),
          new THREE.Vector3(px + 1, py + 1, pz + 1)
        );

        if (!playerBox.intersectsBox(newBlockBox)) {
          const blockToPlace = activeBlock !== BlockType.AIR ? activeBlock : BlockType.COBBLESTONE;
          world.setBlock(px, py, pz, blockToPlace);
          soundRef.current.playPlace();
          onBlockPlaced(activeSlotIndex);
        }
      } else if (e.button === 1) {
        // Middle click: Pick Block
        e.preventDefault();
        const target = currentTargetRef.current;
        if (target && target.blockType !== BlockType.AIR) {
          onBlockMined(target.blockType);
          soundRef.current.playClick();
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        isMiningRef.current = false;
        miningProgressRef.current = 0;
      }
    };

    const handleClickCanvas = () => {
      if (!controller.isLocked && !isPaused) {
        controller.requestPointerLock(renderer.domElement);
      }
    };

    const handlePointerLockChange = () => {
      controller.isLocked = document.pointerLockElement === renderer.domElement;
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('click', handleClickCanvas);
    renderer.domElement.addEventListener('contextmenu', handleContextMenu);

    // Helpers
    const breakBlock = (target: TargetedBlock, w: World, sc: THREE.Scene, pGroup: THREE.Group) => {
      const blockType = target.blockType;
      const soundType = BLOCK_REGISTRY[blockType]?.soundType || 'stone';

      w.setBlock(target.worldX, target.worldY, target.worldZ, BlockType.AIR);
      soundRef.current.playBreak(soundType);
      onBlockMined(blockType);

      // Spawn 10 small debris particles
      const uv = w.atlas.getUV(BLOCK_REGISTRY[blockType]?.textures.top || 'stone');
      const pMat = new THREE.MeshBasicMaterial({ map: w.atlas.texture });
      const pGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);

      for (let i = 0; i < 10; i++) {
        const pMesh = new THREE.Mesh(pGeo, pMat);
        pMesh.position.set(
          target.worldX + 0.5 + (Math.random() - 0.5) * 0.4,
          target.worldY + 0.5 + (Math.random() - 0.5) * 0.4,
          target.worldZ + 0.5 + (Math.random() - 0.5) * 0.4
        );
        pGroup.add(pMesh);

        particlesRef.current.push({
          mesh: pMesh,
          vel: new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            Math.random() * 4 + 2,
            (Math.random() - 0.5) * 5
          ),
          life: 0,
          maxLife: 0.6 + Math.random() * 0.4
        });
      }
    };

    const igniteTnt = (tx: number, ty: number, tz: number, w: World, sc: THREE.Scene) => {
      w.setBlock(tx, ty, tz, BlockType.AIR);
      soundRef.current.playTntFuse();

      // Spawn animated TNT mesh
      const tntGeo = new THREE.BoxGeometry(0.98, 0.98, 0.98);
      const tntMat = new THREE.MeshLambertMaterial({ map: w.atlas.texture });
      const tntMesh = new THREE.Mesh(tntGeo, tntMat);
      tntMesh.position.set(tx + 0.5, ty + 0.5, tz + 0.5);
      sc.add(tntMesh);

      tntEntitiesRef.current.push({
        mesh: tntMesh,
        timer: 3.0,
        worldPos: new THREE.Vector3(tx + 0.5, ty + 0.5, tz + 0.5)
      });
    };

    // 9. Main Animation Loop
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTime = lastTime;
    let currentFps = 60;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // FPS Counter
      frameCount++;
      if (now - fpsTime >= 500) {
        currentFps = Math.round((frameCount * 1000) / (now - fpsTime));
        frameCount = 0;
        fpsTime = now;
      }

      if (!isPaused) {
        // Update Player Physics
        controller.update(dt, settings);

        // Update Celestial Skybox
        skybox.update(dt, settings.dayNightSpeed, scene, controller.position);

        // Update Hand Viewmodel
        const isMoving = controller.velocity.lengthSq() > 0.1;
        hand.update(dt, isMoving);

        // Voxel Raycast from Camera Center
        const ray = new THREE.Ray(camera.position, camera.getWorldDirection(new THREE.Vector3()));
        const target = world.raycast(ray, 5.5);
        currentTargetRef.current = target;
        onTargetChange(target);

        if (target) {
          wireframe.visible = true;
          wireframe.position.set(target.worldX + 0.5, target.worldY + 0.5, target.worldZ + 0.5);

          // Handle Mining Progress in Survival Mode
          if (isMiningRef.current && controller.gameMode === 'survival') {
            const blockDef = BLOCK_REGISTRY[target.blockType];
            const breakTime = (blockDef?.hardness || 1000) / 1000; // seconds

            miningProgressRef.current += dt / breakTime;

            if (now - lastDigSoundTimeRef.current > 240) {
              soundRef.current.playDig(blockDef?.soundType || 'stone');
              lastDigSoundTimeRef.current = now;
            }

            if (miningProgressRef.current >= 1.0) {
              breakBlock(target, world, scene, particleGroup);
              miningProgressRef.current = 0;
            }
          }
        } else {
          wireframe.visible = false;
          miningProgressRef.current = 0;
        }

        // Update Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.life += dt;
          p.vel.y -= 18.0 * dt; // gravity
          p.mesh.position.addScaledVector(p.vel, dt);
          p.mesh.rotation.x += dt * 4;
          p.mesh.rotation.y += dt * 6;

          if (p.life >= p.maxLife) {
            particleGroup.remove(p.mesh);
            p.mesh.geometry.dispose();
            particlesRef.current.splice(i, 1);
          }
        }

        // Update Active TNT entities
        for (let i = tntEntitiesRef.current.length - 1; i >= 0; i--) {
          const tnt = tntEntitiesRef.current[i];
          tnt.timer -= dt;

          // Flashing scale & color
          const flash = Math.sin(tnt.timer * 20) > 0;
          tnt.mesh.scale.setScalar(flash ? 1.15 : 1.0);

          if (tnt.timer <= 0) {
            // EXPLODE!
            scene.remove(tnt.mesh);
            tnt.mesh.geometry.dispose();
            tntEntitiesRef.current.splice(i, 1);

            world.explode(Math.floor(tnt.worldPos.x), Math.floor(tnt.worldPos.y), Math.floor(tnt.worldPos.z), 4);
            soundRef.current.playExplosion();

            // Knockback player if near
            const dist = controller.position.distanceTo(tnt.worldPos);
            if (dist < 8) {
              const push = controller.position.clone().sub(tnt.worldPos).normalize();
              const force = Math.max(2, (8 - dist) * 3);
              controller.velocity.addScaledVector(push, force);
              controller.velocity.y += 6;
              controller.health = Math.max(1, controller.health - Math.floor(12 / (dist + 0.5)));
            }
          }
        }

        // Send state to React UI
        onPlayerUpdate(controller.getState(), currentFps);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('click', handleClickCanvas);
      renderer.domElement.removeEventListener('contextmenu', handleContextMenu);

      skybox.dispose(scene);
      hand.dispose(camera);
      wireframe.geometry.dispose();
      lineMat.dispose();

      for (const p of particlesRef.current) {
        p.mesh.geometry.dispose();
      }
      for (const t of tntEntitiesRef.current) {
        t.mesh.geometry.dispose();
      }

      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update held block in hand when activeBlock changes
  useEffect(() => {
    if (handRef.current) {
      handRef.current.setHeldBlock(activeBlock);
    }
  }, [activeBlock]);

  // Update FOV when settings change
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.camera.fov = settings.fov;
      controllerRef.current.camera.updateProjectionMatrix();
    }
  }, [settings.fov]);

  return <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-crosshair overflow-hidden" />;
};
