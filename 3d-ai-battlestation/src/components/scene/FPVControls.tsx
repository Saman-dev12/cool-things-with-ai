import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export type InteractTarget = 'computer' | 'lamp' | 'stereo' | 'sofa' | 'coffee' | 'pc_power' | null;

interface FPVControlsProps {
  active: boolean;
  onTargetChange: (target: InteractTarget) => void;
  onInteract: (target: InteractTarget) => void;
}

export const FPVControls: React.FC<FPVControlsProps> = ({
  active,
  onTargetChange,
  onInteract,
}) => {
  const { camera, gl } = useThree();

  // Player position and orientation
  const playerPos = useRef(new THREE.Vector3(0, 1.62, 2.4));
  const yaw = useRef(0);
  const pitch = useRef(0);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const [isSittingOnSofa, setIsSittingOnSofa] = useState(false);

  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const currentTarget = useRef<InteractTarget>(null);

  // Keyboard listeners
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (e.code === 'KeyW' || key === 'w' || e.code === 'ArrowUp') {
        keys.current.forward = true;
        if (isSittingOnSofa) setIsSittingOnSofa(false);
      }
      if (e.code === 'KeyS' || key === 's' || e.code === 'ArrowDown') {
        keys.current.backward = true;
        if (isSittingOnSofa) setIsSittingOnSofa(false);
      }
      if (e.code === 'KeyA' || key === 'a' || e.code === 'ArrowLeft') {
        keys.current.left = true;
        if (isSittingOnSofa) setIsSittingOnSofa(false);
      }
      if (e.code === 'KeyD' || key === 'd' || e.code === 'ArrowRight') {
        keys.current.right = true;
        if (isSittingOnSofa) setIsSittingOnSofa(false);
      }

      // [E] or Space to interact
      if (e.code === 'KeyE' || (e.code === 'Space' && currentTarget.current)) {
        e.preventDefault();
        if (currentTarget.current === 'sofa') {
          setIsSittingOnSofa((prev) => !prev);
        } else if (currentTarget.current) {
          onInteract(currentTarget.current);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (e.code === 'KeyW' || key === 'w' || e.code === 'ArrowUp') keys.current.forward = false;
      if (e.code === 'KeyS' || key === 's' || e.code === 'ArrowDown') keys.current.backward = false;
      if (e.code === 'KeyA' || key === 'a' || e.code === 'ArrowLeft') keys.current.left = false;
      if (e.code === 'KeyD' || key === 'd' || e.code === 'ArrowRight') keys.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [active, onInteract, isSittingOnSofa]);

  // Pointer Lock & Mouse Look Listeners
  useEffect(() => {
    if (!active) return;

    const dom = gl.domElement;

    const onPointerDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDragging.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };

        // Request Pointer Lock on click if not already locked
        if (document.pointerLockElement !== dom && dom.requestPointerLock) {
          dom.requestPointerLock().catch(() => {
            // Pointer lock might be blocked by user gesture policy in some iframes, fallback to drag
          });
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const sens = 0.0022;

      // 1. Pointer Lock movement (True FPS controls - mouse right turns right, mouse left turns left)
      if (document.pointerLockElement === dom) {
        yaw.current += e.movementX * sens;
        pitch.current -= e.movementY * sens;
      }
      // 2. Click-and-drag fallback
      else if (isDragging.current) {
        const dx = e.clientX - lastMouse.current.x;
        const dy = e.clientY - lastMouse.current.y;
        lastMouse.current = { x: e.clientX, y: e.clientY };
        yaw.current += dx * sens;
        pitch.current -= dy * sens;
      }

      // Clamp vertical look between looking straight down (-1.25) and up (+1.25)
      pitch.current = Math.max(-1.25, Math.min(1.25, pitch.current));
    };

    const onPointerUp = () => {
      isDragging.current = false;
    };

    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onPointerUp);

    return () => {
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onPointerUp);
    };
  }, [active, gl]);

  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const walkBob = useRef(0);

  // Movement & Raycasting frame loop
  useFrame((_, delta) => {
    if (!active) return;

    // Sitting height vs Standing height
    const targetHeight = isSittingOnSofa ? 1.05 : 1.62;
    playerPos.current.y += (targetHeight - playerPos.current.y) * 0.1;

    const moveSpeed = 3.6; // meters per second

    // Mathematically aligned horizontal forward and right strafe vectors
    const forwardX = Math.sin(yaw.current);
    const forwardZ = -Math.cos(yaw.current);
    const rightX = Math.cos(yaw.current);
    const rightZ = Math.sin(yaw.current);

    let moveX = 0;
    let moveZ = 0;

    if (!isSittingOnSofa) {
      if (keys.current.forward) {
        moveX += forwardX;
        moveZ += forwardZ;
      }
      if (keys.current.backward) {
        moveX -= forwardX;
        moveZ -= forwardZ;
      }
      if (keys.current.left) {
        moveX -= rightX;
        moveZ -= rightZ;
      }
      if (keys.current.right) {
        moveX += rightX;
        moveZ += rightZ;
      }
    }

    const len = Math.hypot(moveX, moveZ);
    const targetVelX = len > 0.001 ? (moveX / len) * moveSpeed : 0;
    const targetVelZ = len > 0.001 ? (moveZ / len) * moveSpeed : 0;

    // Smooth acceleration & friction damping
    velocity.current.x = THREE.MathUtils.damp(velocity.current.x, targetVelX, 12, delta);
    velocity.current.z = THREE.MathUtils.damp(velocity.current.z, targetVelZ, 12, delta);

    const stepX = velocity.current.x * delta;
    const stepZ = velocity.current.z * delta;

    if (Math.abs(stepX) > 0.0001 || Math.abs(stepZ) > 0.0001) {
      const nextX = playerPos.current.x + stepX;
      const nextZ = playerPos.current.z + stepZ;

      // Room Boundaries
      const clampedX = Math.max(-4.1, Math.min(4.1, nextX));
      const clampedZ = Math.max(-2.4, Math.min(4.1, nextZ));

      // Sliding Obstacle Check
      const isInsideObstacle = (x: number, z: number) => {
        // Workstation Desk & Chair Area
        const inDesk = x > -1.75 && x < 1.75 && z > -0.7 && z < 0.85;
        // Lounge Sofa Area
        const inSofa = x > -1.1 && x < 1.1 && z > 2.8 && z < 3.9;
        // Bookshelf
        const inBookshelf = x > 3.2 && x < 4.2 && z > -0.2 && z < 1.8;
        return inDesk || inSofa || inBookshelf;
      };

      // Independent X-axis slide
      if (!isInsideObstacle(clampedX, playerPos.current.z)) {
        playerPos.current.x = clampedX;
      }
      // Independent Z-axis slide
      if (!isInsideObstacle(playerPos.current.x, clampedZ)) {
        playerPos.current.z = clampedZ;
      }

      // Head bobbing during walking
      walkBob.current += delta * 11;
    } else {
      walkBob.current = THREE.MathUtils.damp(walkBob.current, 0, 8, delta);
    }

    // Set camera transform with natural walking bob
    const bob = Math.sin(walkBob.current) * 0.018;
    camera.position.set(playerPos.current.x, playerPos.current.y + bob, playerPos.current.z);

    // Compute look-at target from yaw and pitch
    const lookDir = new THREE.Vector3(
      Math.sin(yaw.current) * Math.cos(pitch.current),
      Math.sin(pitch.current),
      -Math.cos(yaw.current) * Math.cos(pitch.current)
    );
    const targetPoint = playerPos.current.clone().add(lookDir);
    camera.lookAt(targetPoint);

    // Proximity Detection
    const p = playerPos.current;
    const distToDesk = p.distanceTo(new THREE.Vector3(0, 1.0, 0.2));
    const distToPc = p.distanceTo(new THREE.Vector3(1.28, 0.8, 0.1));
    const distToCoffee = p.distanceTo(new THREE.Vector3(-1.15, 0.8, 0.35));
    const distToLamp = p.distanceTo(new THREE.Vector3(-3.2, 1.2, 1.8));
    const distToStereo = p.distanceTo(new THREE.Vector3(3.2, 0.9, 0.8));
    const distToSofa = p.distanceTo(new THREE.Vector3(0, 0.6, 3.2));

    let detected: InteractTarget = null;
    if (distToPc < 1.8 && lookDir.x > 0.2) {
      detected = 'pc_power';
    } else if (distToCoffee < 1.6 && lookDir.x < -0.2) {
      detected = 'coffee';
    } else if (distToDesk < 2.5 && lookDir.z < -0.15) {
      detected = 'computer';
    } else if (distToLamp < 2.2) {
      detected = 'lamp';
    } else if (distToStereo < 2.2) {
      detected = 'stereo';
    } else if (distToSofa < 2.2) {
      detected = 'sofa';
    }

    if (detected !== currentTarget.current) {
      currentTarget.current = detected;
      onTargetChange(detected);
    }
  });

  return null;
};
