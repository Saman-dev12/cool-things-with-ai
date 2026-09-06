import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CameraControls, ContactShadows, Float, Environment, RoundedBox } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useOS } from '../../context/OSContext';
import { createScreenTexture } from './ScreenCanvasTexture';
import {
  createHardwoodFloorTexture,
  createWoodDeskTexture,
  createAioLcdTexture,
  createAcousticSlatTexture,
  createLeatherDeskPadTexture,
  createSpeakerConeTexture,
  createCitySkylineTexture,
  createGalleryArtTexture,
} from './ProceduralTextures';
import { FPVControls, type InteractTarget } from './FPVControls';
import { soundFx, musicPlayer } from '../../audio/soundEngine';

// ==================== PROCEDURAL STEAM PARTICLES ====================
function CoffeeSteam() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 30;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.08;
      pos[i * 3 + 1] = Math.random() * 0.35;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (!particlesRef.current) return;
    const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += delta * 0.14;
      pos[i * 3] += Math.sin(pos[i * 3 + 1] * 8 + i) * 0.0006;
      if (pos[i * 3 + 1] > 0.42) {
        pos[i * 3 + 1] = 0.02;
        pos[i * 3] = (Math.random() - 0.5) * 0.08;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
      }
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef} position={[-1.15, 0.28, 0.35]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#f1f5f9" transparent opacity={0.35} depthWrite={false} />
    </points>
  );
}

// ==================== 2026 FLAGSHIP GAMING PC (PHOTOREALISTIC OVERHAUL) ====================
function FlagshipPCTower({
  neonColor,
  aioTexture,
  isPoweredOn = true,
  onTogglePower,
  onClick,
}: {
  neonColor: string;
  aioTexture?: THREE.CanvasTexture;
  isPoweredOn?: boolean;
  onTogglePower?: () => void;
  onClick?: () => void;
}) {
  const fansRef = useRef<THREE.Group>(null);
  const gpuFansRef = useRef<THREE.Group>(null);
  const ramRef = useRef<THREE.Mesh>(null);
  const elapsedRef = useRef(0);

  useFrame((_, delta) => {
    if (!isPoweredOn) return;
    elapsedRef.current += delta;
    if (fansRef.current) {
      fansRef.current.children.forEach((fan) => {
        fan.rotation.z += delta * 14;
      });
    }
    if (gpuFansRef.current) {
      gpuFansRef.current.children.forEach((fan) => {
        fan.rotation.y += delta * 18;
      });
    }
    if (ramRef.current) {
      const mat = ramRef.current.material as THREE.MeshBasicMaterial;
      const hue = (elapsedRef.current * 0.12) % 1;
      mat.color.setHSL(hue, 0.9, 0.6);
    }
  });

  return (
    <group
      position={[1.28, 0.38, 0.08]}
      rotation={[0, -0.32, 0]}
      onClick={onClick}
    >
      {/* 1. Anodized Aluminum Mid-Tower Frame (Lian Li O11 Vision Style Proportions: 0.26w x 0.52h x 0.48d) */}
      {/* Lower PSU Shroud Pedestal with Hexagonal Vent Pattern */}
      <RoundedBox position={[0, -0.21, 0]} args={[0.26, 0.14, 0.48]} radius={0.008} smoothness={4} castShadow>
        <meshStandardMaterial color="#0b0f19" metalness={0.92} roughness={0.2} />
      </RoundedBox>

      {/* Top 360 Radiator Exhaust Bracket & Fine Magnetic Mesh Filter */}
      <RoundedBox position={[0, 0.25, 0]} args={[0.26, 0.035, 0.48]} radius={0.006} smoothness={4}>
        <meshStandardMaterial color="#0b0f19" metalness={0.92} roughness={0.2} />
      </RoundedBox>

      {/* Rear Motherboard Tray & CNC IO Shield */}
      <mesh position={[0.12, 0.02, 0]}>
        <boxGeometry args={[0.02, 0.44, 0.46]} />
        <meshStandardMaterial color="#111827" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Corner Support Bevel Pillars */}
      <mesh position={[0.12, 0.02, -0.23]}>
        <boxGeometry args={[0.015, 0.44, 0.015]} />
        <meshStandardMaterial color="#1e293b" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Power Button on Front Top Edge */}
      <group
        position={[-0.10, 0.255, 0.20]}
        onClick={(e) => {
          e.stopPropagation();
          onTogglePower?.();
        }}
      >
        <mesh>
          <cylinderGeometry args={[0.006, 0.006, 0.006, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.004, 0]}>
          <ringGeometry args={[0.003, 0.005, 16]} />
          <meshBasicMaterial color={isPoweredOn ? '#10b981' : '#475569'} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 2. Crystal Tempered Glass Panels (Front & Side Seamless Panorama) */}
      {/* Front Tempered Glass Panel */}
      <mesh position={[0, 0.02, 0.235]}>
        <boxGeometry args={[0.245, 0.43, 0.008]} />
        <meshPhysicalMaterial
          color="#f8fafc"
          transparent
          opacity={0.22}
          roughness={0.02}
          metalness={0.1}
          transmission={0.92}
        />
      </mesh>

      {/* Left Side Tempered Glass Panel */}
      <mesh position={[-0.125, 0.02, 0]}>
        <boxGeometry args={[0.008, 0.43, 0.46]} />
        <meshPhysicalMaterial
          color="#f8fafc"
          transparent
          opacity={0.22}
          roughness={0.02}
          metalness={0.1}
          transmission={0.92}
        />
      </mesh>

      {/* Metal Knurled Thumb Screws on Glass Corners */}
      {[
        [-0.12, 0.22, 0.22],
        [-0.12, 0.22, -0.22],
        [-0.12, -0.13, 0.22],
        [-0.12, -0.13, -0.22],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.006, 0.006, 0.01, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* 3. Motherboard: ASUS ROG Crosshair X870E HERO with Matte Heatsinks */}
      <group position={[0.10, 0.02, -0.02]}>
        {/* PCB Board */}
        <mesh>
          <boxGeometry args={[0.012, 0.40, 0.36]} />
          <meshStandardMaterial color="#090d16" roughness={0.7} />
        </mesh>
        {/* VRM Heatsinks with Silver Chamfers */}
        <mesh position={[-0.012, 0.13, -0.08]}>
          <boxGeometry args={[0.016, 0.08, 0.12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-0.012, 0.16, 0.04]}>
          <boxGeometry args={[0.016, 0.05, 0.10]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* M.2 Thermal Armor Shield */}
        <mesh position={[-0.012, -0.06, 0]}>
          <boxGeometry args={[0.014, 0.03, 0.18]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* 4. GPU: NVIDIA GeForce RTX 5090 32GB GDDR7 Flagship */}
      <group position={[-0.01, -0.07, -0.02]}>
        {/* Triple-Fan Aluminum Heatsink Shroud */}
        <mesh castShadow>
          <boxGeometry args={[0.18, 0.065, 0.38]} />
          <meshStandardMaterial color="#18181b" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Silver Aluminum Micro-Fin Heatsink Core visible on sides */}
        <mesh position={[0, 0.005, 0]}>
          <boxGeometry args={[0.16, 0.045, 0.36]} />
          <meshStandardMaterial color="#64748b" metalness={0.95} roughness={0.15} />
        </mesh>

        {/* Brushed Metal Backplate with Geometric Cutouts */}
        <mesh position={[0, 0.035, 0]}>
          <boxGeometry args={[0.175, 0.005, 0.37]} />
          <meshStandardMaterial color="#27272a" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* Illuminated Edge Stripe: GEFORCE RTX 5090 */}
        <mesh position={[-0.092, 0, 0]}>
          <boxGeometry args={[0.004, 0.024, 0.22]} />
          <meshBasicMaterial color={neonColor} />
        </mesh>

        {/* Triple Spinning Axial-Tech Fans */}
        <group ref={gpuFansRef} position={[0, -0.034, 0]}>
          {[-0.11, 0, 0.11].map((zOffset, i) => (
            <group key={i} position={[0, 0, zOffset]}>
              <mesh rotation={[0, 0, 0]}>
                <cylinderGeometry args={[0.038, 0.038, 0.006, 24]} />
                <meshStandardMaterial color="#09090b" roughness={0.3} />
              </mesh>
              {/* Metallic Center Hub Emblem */}
              <mesh position={[0, -0.004, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.004, 16]} />
                <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.1} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Anti-Sag Aluminum Support Pillar */}
        <mesh position={[-0.08, -0.07, 0.16]}>
          <cylinderGeometry args={[0.006, 0.006, 0.08, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Dual 16-Pin 12V-2x6 Sleeved Power Cables with Combs */}
        <group position={[0.04, -0.01, 0.08]}>
          {Array.from({ length: 4 }).map((_, cIdx) => (
            <mesh key={cIdx} position={[-0.01 * cIdx, -0.06, 0]}>
              <cylinderGeometry args={[0.003, 0.003, 0.08, 8]} />
              <meshStandardMaterial color="#09090b" roughness={0.9} />
            </mesh>
          ))}
          {/* Cable Comb */}
          <mesh position={[-0.015, -0.06, 0]}>
            <boxGeometry args={[0.038, 0.005, 0.01]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </group>
      </group>

      {/* 5. CPU Liquid Cooler: Lian Li HydroShift LCD 360 */}
      <group position={[0.04, 0.10, -0.02]}>
        {/* Pump Base */}
        <mesh>
          <cylinderGeometry args={[0.045, 0.045, 0.028, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* 3.5" Full Color LCD Display (38°C CPU Temp & Telemetry) */}
        <mesh position={[-0.015, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <circleGeometry args={[0.038, 32]} />
          <meshBasicMaterial map={aioTexture} color={aioTexture ? '#ffffff' : '#06b6d4'} />
        </mesh>
        <pointLight position={[-0.03, 0, 0]} color="#06b6d4" intensity={0.8} distance={0.5} />

        {/* Dual Braided Coolant Tubes looping to top 360 Radiator */}
        <mesh position={[0.01, 0.10, 0.03]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.16, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        <mesh position={[0.01, 0.10, -0.03]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.16, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
      </group>

      {/* 6. RAM: 64GB (2x32GB) G.Skill Trident Z5 Royal DDR5-6400 */}
      <group position={[0.06, 0.12, -0.11]}>
        <mesh ref={ramRef}>
          <boxGeometry args={[0.012, 0.08, 0.09]} />
          <meshBasicMaterial color={neonColor} />
        </mesh>
        <mesh position={[0.016, 0, 0]}>
          <boxGeometry args={[0.012, 0.08, 0.09]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* 7. PWM RGB Halo Intake Fans (Side & Top) */}
      <group ref={fansRef}>
        {/* 2x Side Intake Fans */}
        {[-0.08, 0.08].map((yOffset, fIdx) => (
          <group key={fIdx} position={[-0.09, yOffset, 0.14]} rotation={[0, Math.PI / 2, 0]}>
            {/* Glowing Halo Ring */}
            <mesh>
              <ringGeometry args={[0.048, 0.058, 32]} />
              <meshBasicMaterial color={neonColor} side={THREE.DoubleSide} />
            </mesh>
            {/* Frosted Blades */}
            <mesh>
              <boxGeometry args={[0.012, 0.095, 0.004]} />
              <meshStandardMaterial color="#64748b" roughness={0.3} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.012, 0.095, 0.004]} />
              <meshStandardMaterial color="#64748b" roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Internal System Atmosphere Glow */}
      <pointLight position={[0, 0.05, 0]} color={neonColor} intensity={2.2} distance={1.8} />
    </group>
  );
}

// ==================== 34" CURVED ULTRAWIDE DISPLAY (1800R CURVATURE) ====================
function DisplayMonitor({
  neonColor,
  ambientColor,
  onScreenClick,
  screenTexture,
}: {
  neonColor: string;
  ambientColor: string;
  onScreenClick: () => void;
  screenTexture: THREE.CanvasTexture;
}) {
  return (
    <group position={[0, 0.28, 0.12]}>
      {/* Heavy-Duty Solid Aluminum Ergonomic Monitor Arm */}
      <group position={[0, 0, -0.36]}>
        {/* Desk Edge Clamp Bracket */}
        <mesh position={[0, -0.28, 0.02]} receiveShadow>
          <boxGeometry args={[0.14, 0.08, 0.12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* Lower Heavy Arm Segment */}
        <mesh position={[0, -0.06, -0.02]} rotation={[-0.22, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.42, 20]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Gas-Spring Articulating Upper Arm */}
        <mesh position={[0, 0.24, 0.04]} rotation={[0.32, 0, 0]}>
          <boxGeometry args={[0.06, 0.36, 0.05]} />
          <meshStandardMaterial color="#334155" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* VESA 100x100 Quick-Release Swivel Bracket */}
        <mesh position={[0, 0.52, 0.12]}>
          <cylinderGeometry args={[0.055, 0.055, 0.04, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* Display Enclosure with 1800R Curvature */}
      <group position={[0, 0.52, -0.22]} rotation={[-0.03, 0, 0]}>
        {/* Rear Curved Bezel Shell with Matte Aerospace Aluminum Finish */}
        <RoundedBox position={[0, 0, -0.02]} args={[1.96, 0.88, 0.035]} radius={0.016} smoothness={4} castShadow>
          <meshStandardMaterial color="#0b0f19" metalness={0.88} roughness={0.2} />
        </RoundedBox>

        {/* 1.8mm Ultra-Thin Outer Bezel Trim */}
        <mesh position={[0, 0, -0.002]}>
          <boxGeometry args={[1.92, 0.84, 0.008]} />
          <meshStandardMaterial color="#18181b" roughness={0.3} />
        </mesh>

        {/* 34" QD-OLED Active Holographic Display Screen (Mirroring exact OS UI) */}
        <mesh
          position={[0, 0, 0.008]}
          onClick={(e) => {
            e.stopPropagation();
            soundFx.click();
            onScreenClick();
          }}
        >
          <planeGeometry args={[1.88, 0.80]} />
          <meshBasicMaterial map={screenTexture} toneMapped={false} />
        </mesh>

        {/* BenQ ScreenBar Halo LED Light Bar Mounted on Top */}
        <group position={[0, 0.44, 0.03]}>
          {/* Anodized Aluminum Cylinder Housing */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.78, 24]} />
            <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.15} />
          </mesh>
          {/* Warm 3000K Asymmetric Optical Diffuser */}
          <mesh position={[0, -0.012, 0.004]}>
            <boxGeometry args={[0.76, 0.003, 0.012]} />
            <meshBasicMaterial color="#fef3c7" />
          </mesh>
          {/* Focused Downward Warm Light hitting desk pad */}
          <spotLight
            position={[0, -0.02, 0.08]}
            target-position={[0, -0.6, 0.35]}
            color="#fffbeb"
            intensity={2.8}
            angle={0.72}
            penumbra={0.65}
            distance={2.5}
          />
        </group>

        {/* Rear Ambient Bias Glow washing over accent wall */}
        <mesh position={[0, 0, -0.038]}>
          <boxGeometry args={[1.6, 0.02, 0.008]} />
          <meshBasicMaterial color={neonColor} />
        </mesh>
        <pointLight position={[0, 0, -0.25]} color={ambientColor} intensity={2.8} distance={2.8} />
      </group>

      {/* ScreenBar Wireless Desktop Rotary Controller */}
      <group position={[0.62, -0.23, 0.18]}>
        <mesh>
          <cylinderGeometry args={[0.035, 0.035, 0.018, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.01, 0]}>
          <ringGeometry args={[0.024, 0.03, 32]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

// ==================== STUDIO DESK SPEAKERS & AUDIO INTERFACE ====================
function AudioMonitors({ speakerTexture }: { speakerTexture: THREE.CanvasTexture }) {
  return (
    <>
      {/* Left Yamaha HS8 Studio Monitor on Angled Acoustic Foam Pad */}
      <group position={[-1.25, 0.18, -0.02]} rotation={[0.06, 0.28, 0]}>
        {/* Acoustic Isolation Foam Wedge (5° upward tilt) */}
        <mesh position={[0, -0.17, 0]} receiveShadow>
          <boxGeometry args={[0.22, 0.035, 0.25]} />
          <meshStandardMaterial color="#090d16" roughness={0.98} />
        </mesh>

        {/* Curved MDF Satin Black Acoustic Enclosure */}
        <RoundedBox args={[0.21, 0.35, 0.23]} radius={0.012} smoothness={4} castShadow>
          <meshStandardMaterial color="#18181b" roughness={0.35} metalness={0.15} />
        </RoundedBox>

        {/* Front Baffle Chamfer Trim */}
        <mesh position={[0, 0, 0.116]}>
          <boxGeometry args={[0.20, 0.34, 0.008]} />
          <meshStandardMaterial color="#0c0e14" roughness={0.25} />
        </mesh>

        {/* 1" Silk Dome Tweeter in Elliptical Waveguide */}
        <group position={[0, 0.095, 0.122]}>
          <mesh>
            <cylinderGeometry args={[0.034, 0.034, 0.004, 32]} />
            <meshStandardMaterial color="#18181b" roughness={0.3} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.003]}>
            <sphereGeometry args={[0.012, 16, 16]} />
            <meshStandardMaterial color="#09090b" roughness={0.2} metalness={0.8} />
          </mesh>
        </group>

        {/* 8" Pure White Polymer Woofer Cone */}
        <mesh position={[0, -0.05, 0.122]} rotation={[0, 0, 0]}>
          <circleGeometry args={[0.068, 32]} />
          <meshStandardMaterial map={speakerTexture} roughness={0.4} />
        </mesh>

        {/* Front Glowing White Power LED */}
        <mesh position={[0, -0.14, 0.122]}>
          <circleGeometry args={[0.0025, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Right Yamaha HS8 Studio Monitor on Angled Acoustic Foam Pad */}
      <group position={[0.82, 0.18, -0.02]} rotation={[0.06, -0.28, 0]}>
        {/* Acoustic Isolation Foam Wedge */}
        <mesh position={[0, -0.17, 0]} receiveShadow>
          <boxGeometry args={[0.22, 0.035, 0.25]} />
          <meshStandardMaterial color="#090d16" roughness={0.98} />
        </mesh>

        {/* Curved MDF Satin Black Acoustic Enclosure */}
        <RoundedBox args={[0.21, 0.35, 0.23]} radius={0.012} smoothness={4} castShadow>
          <meshStandardMaterial color="#18181b" roughness={0.35} metalness={0.15} />
        </RoundedBox>

        {/* Front Baffle Chamfer Trim */}
        <mesh position={[0, 0, 0.116]}>
          <boxGeometry args={[0.20, 0.34, 0.008]} />
          <meshStandardMaterial color="#0c0e14" roughness={0.25} />
        </mesh>

        {/* 1" Silk Dome Tweeter in Elliptical Waveguide */}
        <group position={[0, 0.095, 0.122]}>
          <mesh>
            <cylinderGeometry args={[0.034, 0.034, 0.004, 32]} />
            <meshStandardMaterial color="#18181b" roughness={0.3} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.003]}>
            <sphereGeometry args={[0.012, 16, 16]} />
            <meshStandardMaterial color="#09090b" roughness={0.2} metalness={0.8} />
          </mesh>
        </group>

        {/* 8" Pure White Polymer Woofer Cone */}
        <mesh position={[0, -0.05, 0.122]} rotation={[0, 0, 0]}>
          <circleGeometry args={[0.068, 32]} />
          <meshStandardMaterial map={speakerTexture} roughness={0.4} />
        </mesh>

        {/* Front Glowing White Power LED */}
        <mesh position={[0, -0.14, 0.122]}>
          <circleGeometry args={[0.0025, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Focusrite Scarlett 2i2 USB-C Audio Interface */}
      <group position={[-0.85, 0.04, 0.12]}>
        {/* Brushed Red Anodized Aluminum Enclosure */}
        <RoundedBox args={[0.22, 0.052, 0.14]} radius={0.008} smoothness={4} castShadow>
          <meshStandardMaterial color="#b91c1c" metalness={0.85} roughness={0.25} />
        </RoundedBox>
        {/* Glossy Black Front Faceplate */}
        <mesh position={[0, 0, 0.072]}>
          <boxGeometry args={[0.21, 0.044, 0.004]} />
          <meshStandardMaterial color="#09090b" roughness={0.1} />
        </mesh>
        {/* Dual XLR/TRS Combo Inputs with Silver Knurled Halo Rings */}
        {[-0.065, -0.015].map((x, idx) => (
          <group key={idx} position={[x, 0, 0.076]}>
            <mesh>
              <cylinderGeometry args={[0.012, 0.012, 0.008, 16]} />
              <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Halo Gain Indicator Ring */}
            <mesh position={[0, 0, 0.005]}>
              <ringGeometry args={[0.009, 0.012, 16]} />
              <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
        {/* Large Brushed Silver Master Volume Knob */}
        <mesh position={[0.055, 0, 0.078]}>
          <cylinderGeometry args={[0.016, 0.016, 0.012, 24]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>
    </>
  );
}

// ==================== MECHANICAL KEYBOARD, MOUSE & LEATHER PAD ====================
function KeyboardAndMouse({
  neonColor,
  leatherPadTexture,
  onSipCoffee,
}: {
  neonColor: string;
  leatherPadTexture: THREE.CanvasTexture;
  onSipCoffee?: () => void;
}) {
  return (
    <group position={[0, 0.02, 0.44]}>
      {/* 900x400mm Stitched Micro-Weave Leather Desk Pad */}
      <RoundedBox position={[0, -0.01, -0.02]} args={[1.58, 0.008, 0.68]} radius={0.018} smoothness={4} receiveShadow>
        <meshStandardMaterial
          map={leatherPadTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </RoundedBox>

      {/* Custom 75% Mechanical Keyboard (CNC Aluminum Case + Brass Weight) */}
      <group position={[-0.14, 0.014, 0]} rotation={[0.05, 0, 0]}>
        {/* Anodized Dark Titan Aluminum Case with Beveled Chamfers */}
        <RoundedBox args={[0.66, 0.03, 0.24]} radius={0.01} smoothness={4} castShadow>
          <meshStandardMaterial color="#0f172a" metalness={0.92} roughness={0.18} />
        </RoundedBox>
        {/* Brass Internal Weight Plate Underglow */}
        <mesh position={[0, -0.01, 0]}>
          <boxGeometry args={[0.65, 0.006, 0.23]} />
          <meshBasicMaterial color={neonColor} />
        </mesh>
        {/* Sculpted PBT Double-Shot Keycaps */}
        <mesh position={[0, 0.018, 0]}>
          <boxGeometry args={[0.62, 0.016, 0.20]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
        {/* Metallic Accent Esc & Enter Keycaps */}
        <mesh position={[-0.27, 0.022, -0.07]}>
          <boxGeometry args={[0.036, 0.012, 0.036]} />
          <meshStandardMaterial color="#06b6d4" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.27, 0.022, 0.01]}>
          <boxGeometry args={[0.048, 0.012, 0.036]} />
          <meshStandardMaterial color="#f43f5e" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Custom Coiled Aviator Cable with Metallic GX16 Connector */}
        <group position={[0, 0.01, -0.13]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.004, 0.004, 0.18, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          {/* GX16 Silver Aviator Quick-Disconnect Collar */}
          <mesh position={[0.09, 0, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.018, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* Ergonomic Wireless Mouse (Logitech MX Master 3S Style with MagSpeed Wheel) */}
      <group position={[0.45, 0.022, 0.02]}>
        {/* Sculpted Matte Body with Thumb Rest */}
        <RoundedBox args={[0.11, 0.042, 0.18]} radius={0.022} smoothness={4} castShadow>
          <meshStandardMaterial color="#111827" metalness={0.65} roughness={0.25} />
        </RoundedBox>
        {/* Knurled Metal MagSpeed Scroll Wheel */}
        <mesh position={[0, 0.024, -0.038]}>
          <cylinderGeometry args={[0.008, 0.008, 0.012, 20]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Subtle LED Glow Accent */}
        <mesh position={[-0.035, 0.012, 0.02]}>
          <boxGeometry args={[0.003, 0.006, 0.03]} />
          <meshBasicMaterial color={neonColor} />
        </mesh>
      </group>

      {/* Ceramic Artisan Coffee Mug with Latte Art (Clickable with sound!) */}
      <group
        position={[-1.15, 0.08, -0.12]}
        onClick={(e) => {
          e.stopPropagation();
          onSipCoffee?.();
        }}
      >
        <mesh castShadow>
          <cylinderGeometry args={[0.065, 0.055, 0.14, 24]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.25} metalness={0.1} />
        </mesh>
        {/* Fresh Latte Swirl */}
        <mesh position={[0, 0.056, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.058, 24]} />
          <meshStandardMaterial color="#6f4e37" roughness={0.3} />
        </mesh>
        {/* Mug Handle */}
        <mesh position={[-0.075, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.038, 0.008, 12, 24]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.25} />
        </mesh>
        <CoffeeSteam />
      </group>

      {/* Modern Potted Succulent Bonsai */}
      <group position={[1.15, 0.05, -0.14]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.045, 0.08, 24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.041, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.056, 24]} />
          <meshStandardMaterial color="#292524" roughness={0.9} />
        </mesh>
        {/* Succulent Leaves */}
        {Array.from({ length: 6 }).map((_, idx) => (
          <mesh
            key={idx}
            position={[
              Math.cos((idx * Math.PI) / 3) * 0.025,
              0.06,
              Math.sin((idx * Math.PI) / 3) * 0.025,
            ]}
            rotation={[0.3, (idx * Math.PI) / 3, 0]}
          >
            <coneGeometry args={[0.016, 0.045, 8]} />
            <meshStandardMaterial color="#10b981" roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ==================== PHOTOREALISTIC ERGONOMIC CHAIR (HERMAN MILLER AERON STYLE) ====================
function ErgonomicChair() {
  return (
    <group position={[0, -0.15, 1.25]} rotation={[0, Math.PI, 0]}>
      {/* 5-Star Die-Cast Aluminum Base with Roller Wheels */}
      <group position={[0, -0.68, 0]}>
        <mesh>
          <cylinderGeometry args={[0.045, 0.055, 0.06, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* 5 Star Legs */}
        {Array.from({ length: 5 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 5;
          const lx = Math.sin(angle) * 0.28;
          const lz = Math.cos(angle) * 0.28;
          return (
            <group key={i}>
              <mesh position={[lx * 0.5, -0.015, lz * 0.5]} rotation={[0, -angle, 0.08]}>
                <boxGeometry args={[0.035, 0.02, 0.32]} />
                <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.15} />
              </mesh>
              {/* Dual Caster Wheel at tip */}
              <group position={[lx, -0.04, lz]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.025, 0.025, 0.022, 16]} />
                  <meshStandardMaterial color="#09090b" roughness={0.6} />
                </mesh>
                <mesh position={[0, 0.02, 0]}>
                  <cylinderGeometry args={[0.005, 0.005, 0.02, 8]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
                </mesh>
              </group>
            </group>
          );
        })}
      </group>

      {/* Heavy Chrome Gas-Lift Pneumatic Piston with Lever */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.42, 20]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.08} />
      </mesh>
      {/* Tilt Mechanism Under-Seat Box & Tension Knob */}
      <mesh position={[0, -0.25, 0.02]}>
        <boxGeometry args={[0.18, 0.06, 0.22]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.10, -0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.12, 12]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Contoured Ergonomic Seat Pan with Rounded Waterfall Edge */}
      <group position={[0, -0.19, 0]}>
        <RoundedBox args={[0.54, 0.05, 0.52]} radius={0.024} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#090d16" roughness={0.8} />
        </RoundedBox>
        {/* Breathable Pellicle Mesh Weave Inset */}
        <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.48, 0.46]} />
          <meshStandardMaterial color="#1e293b" roughness={0.95} />
        </mesh>
      </group>

      {/* Die-Cast Aluminum Spine & Lumbar PostureFit Support */}
      <group position={[0, 0.16, 0.24]}>
        {/* Central Vertical Spine Column */}
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[0.06, 0.54, 0.035]} />
          <meshStandardMaterial color="#334155" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* PostureFit Dual Lumbar Support Pad */}
        <mesh position={[0, -0.06, -0.045]}>
          <boxGeometry args={[0.28, 0.10, 0.02]} />
          <meshStandardMaterial color="#090d16" roughness={0.6} />
        </mesh>
        {/* Breathable Mesh High-Back Frame */}
        <RoundedBox position={[0, 0.08, 0]} args={[0.48, 0.56, 0.03]} radius={0.02} smoothness={4} castShadow>
          <meshStandardMaterial color="#090d16" roughness={0.7} />
        </RoundedBox>
        {/* Translucent Mesh Back Inset */}
        <mesh position={[0, 0.08, -0.002]}>
          <planeGeometry args={[0.42, 0.50]} />
          <meshStandardMaterial color="#1e293b" roughness={0.95} />
        </mesh>
      </group>

      {/* 3D Adjustable Armrests */}
      {[-0.27, 0.27].map((x, idx) => (
        <group key={idx} position={[x, -0.04, 0.05]}>
          {/* Aluminum Arm Upright */}
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.014, 0.016, 0.22, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Polyurethane Soft Arm Pad */}
          <RoundedBox position={[0, 0.20, -0.02]} args={[0.08, 0.025, 0.22]} radius={0.012} smoothness={4} castShadow>
            <meshStandardMaterial color="#09090b" roughness={0.5} />
          </RoundedBox>
        </group>
      ))}
    </group>
  );
}

// ==================== STUDIO LOUNGE: SOFA, COFFEE TABLE & FLOOR LAMP ====================
function LoungeArea({
  isLampOn,
  onToggleLamp,
  onToggleStereo,
}: {
  isLampOn: boolean;
  onToggleLamp: () => void;
  onToggleStereo: () => void;
}) {
  return (
    <>
      {/* Modern 2-Seater Textured Fabric Designer Sofa */}
      <group position={[0, -0.48, 3.4]} rotation={[0, 0, 0]}>
        {/* Base Seat Cushion */}
        <RoundedBox position={[0, 0.18, 0]} args={[1.85, 0.28, 0.88]} radius={0.05} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#1e293b" roughness={0.88} />
        </RoundedBox>
        {/* Dual Backrest Cushions */}
        <RoundedBox position={[-0.46, 0.50, 0.35]} args={[0.88, 0.44, 0.22]} radius={0.04} smoothness={4} castShadow>
          <meshStandardMaterial color="#1e293b" roughness={0.88} />
        </RoundedBox>
        <RoundedBox position={[0.46, 0.50, 0.35]} args={[0.88, 0.44, 0.22]} radius={0.04} smoothness={4} castShadow>
          <meshStandardMaterial color="#1e293b" roughness={0.88} />
        </RoundedBox>
        {/* Plush Curved Armrests */}
        <RoundedBox position={[-0.98, 0.32, 0]} args={[0.18, 0.38, 0.88]} radius={0.04} smoothness={4}>
          <meshStandardMaterial color="#1e293b" roughness={0.88} />
        </RoundedBox>
        <RoundedBox position={[0.98, 0.32, 0]} args={[0.18, 0.38, 0.88]} radius={0.04} smoothness={4}>
          <meshStandardMaterial color="#1e293b" roughness={0.88} />
        </RoundedBox>
        {/* Designer Throw Pillows */}
        <RoundedBox position={[-0.72, 0.34, 0.26]} rotation={[0.1, 0.2, 0]} args={[0.32, 0.32, 0.12]} radius={0.03} smoothness={4}>
          <meshStandardMaterial color="#d97706" roughness={0.9} />
        </RoundedBox>
        <RoundedBox position={[0.72, 0.34, 0.26]} rotation={[0.1, -0.2, 0]} args={[0.32, 0.32, 0.12]} radius={0.03} smoothness={4}>
          <meshStandardMaterial color="#0d9488" roughness={0.9} />
        </RoundedBox>
        {/* Turned Oak Tapered Legs with Brass Ferrules */}
        {[
          [-0.85, -0.08, 0.35],
          [0.85, -0.08, 0.35],
          [-0.85, -0.08, -0.35],
          [0.85, -0.08, -0.35],
        ].map((pos, i) => (
          <group key={i} position={pos as [number, number, number]}>
            <mesh>
              <cylinderGeometry args={[0.02, 0.014, 0.18, 16]} />
              <meshStandardMaterial color="#78350f" roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.07, 0]}>
              <cylinderGeometry args={[0.015, 0.014, 0.04, 16]} />
              <meshStandardMaterial color="#eab308" metalness={0.95} roughness={0.15} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Solid Walnut & Matte Steel Coffee Table */}
      <group position={[0, -0.68, 2.3]}>
        <RoundedBox position={[0, 0.12, 0]} args={[1.2, 0.045, 0.6]} radius={0.018} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#451a03" roughness={0.38} />
        </RoundedBox>
        {/* Modern Hairpin Steel Table Legs */}
        {[
          [-0.52, 0, 0.24],
          [0.52, 0, 0.24],
          [-0.52, 0, -0.24],
          [0.52, 0, -0.24],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <cylinderGeometry args={[0.012, 0.012, 0.24, 12]} />
            <meshStandardMaterial color="#0f172a" metalness={0.92} roughness={0.2} />
          </mesh>
        ))}
        {/* Hardcover Architectural Monographs & Brass Incense Bowl */}
        <mesh position={[-0.2, 0.155, 0]} rotation={[0, 0.15, 0]}>
          <boxGeometry args={[0.26, 0.02, 0.34]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.4} />
        </mesh>
        <mesh position={[0.24, 0.158, 0.04]}>
          <cylinderGeometry args={[0.065, 0.045, 0.035, 24]} />
          <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Lush Indoor Monstera Deliciosa Planter in Room Corner */}
      <group position={[-3.8, -0.88, 3.2]}>
        {/* Ribbed Ceramic Planter Pot */}
        <mesh castShadow>
          <cylinderGeometry args={[0.28, 0.22, 0.55, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.35} />
        </mesh>
        {/* Rich Soil */}
        <mesh position={[0, 0.27, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.27, 24]} />
          <meshStandardMaterial color="#292524" roughness={0.95} />
        </mesh>
        {/* Lush Organic Fan Leaves */}
        {Array.from({ length: 9 }).map((_, lIdx) => {
          const lAngle = (lIdx * Math.PI * 2) / 9;
          const lx = Math.cos(lAngle) * 0.18;
          const lz = Math.sin(lAngle) * 0.18;
          const rotZ = 0.35 + (lIdx % 3) * 0.12;
          return (
            <group key={lIdx} position={[lx, 0.28, lz]} rotation={[0, lAngle, rotZ]}>
              {/* Stem */}
              <mesh position={[0, 0.22, 0]}>
                <cylinderGeometry args={[0.008, 0.01, 0.45, 8]} />
                <meshStandardMaterial color="#15803d" roughness={0.5} />
              </mesh>
              {/* Broad Leaf */}
              <mesh position={[0, 0.44, 0]} rotation={[0.4, 0, 0]}>
                <planeGeometry args={[0.26, 0.36]} />
                <meshStandardMaterial color="#166534" roughness={0.3} side={THREE.DoubleSide} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Interactive Nordic Floor Lamp */}
      <group position={[-3.2, -0.88, 1.8]} onClick={onToggleLamp}>
        {/* Heavy Circular Marble Base */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.04, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Slender Brass Upright Stem */}
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 2.1, 16]} />
          <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Conical Linen Lampshade */}
        <mesh position={[0, 2.1, 0]}>
          <cylinderGeometry args={[0.18, 0.28, 0.36, 32, 1, true]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
        {/* Glowing Bulb inside */}
        <mesh position={[0, 2.05, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color={isLampOn ? '#fef08a' : '#475569'} />
        </mesh>
        {/* Lamp Spotlight & Ambient Light */}
        {isLampOn && (
          <>
            <pointLight position={[0, 2.05, 0]} color="#fef08a" intensity={2.8} distance={5.5} />
            <spotLight
              position={[0, 2.1, 0]}
              target-position={[0, 0, 0]}
              color="#fef08a"
              intensity={2.2}
              angle={0.8}
              penumbra={0.6}
            />
          </>
        )}
      </group>

      {/* Right Wall: Scandinavian Bookshelf & Hi-Fi Turntable */}
      <group position={[3.6, -0.88, 0.8]} rotation={[0, -Math.PI / 2, 0]}>
        {/* 4-Tier Wood Bookshelf */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[1.8, 2.2, 0.38]} />
          <meshStandardMaterial color="#78350f" roughness={0.4} />
        </mesh>
        {/* Shelf Cutouts / Shelves */}
        {[-0.5, 0, 0.5, 1.0].map((y, idx) => (
          <mesh key={idx} position={[0, y, 0.02]}>
            <boxGeometry args={[1.7, 0.03, 0.36]} />
            <meshStandardMaterial color="#451a03" roughness={0.4} />
          </mesh>
        ))}

        {/* Vintage Hi-Fi Vinyl Turntable (Interactive: Click to Play/Pause real music!) */}
        <group position={[0, 0.03, 0]} onClick={onToggleStereo}>
          {/* Turntable Plinth */}
          <mesh position={[0, 0.03, 0]} castShadow>
            <boxGeometry args={[0.48, 0.06, 0.34]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Vinyl Record Platter */}
          <mesh position={[-0.06, 0.065, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.008, 32]} />
            <meshStandardMaterial color="#09090b" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[-0.06, 0.07, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.009, 24]} />
            <meshBasicMaterial color="#f43f5e" />
          </mesh>
          {/* Tonearm */}
          <mesh position={[0.14, 0.08, 0.06]} rotation={[0, -0.3, 0]}>
            <boxGeometry args={[0.008, 0.008, 0.16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
        </group>
      </group>
    </>
  );
}

// ==================== COMPLETE 4-WALL ARCHITECTURAL STUDIO LOFT ====================
export const WorkstationScene: React.FC = () => {
  const {
    windows,
    activeAppId,
    currentTheme,
    currentWallpaper,
    cameraMode,
    setCameraMode,
    isRoomLampOn,
    toggleRoomLamp,
  } = useOS();

  const cameraControlsRef = useRef<CameraControls>(null);
  const [hoverTarget, setHoverTarget] = useState<InteractTarget>(null);

  const neonColor = currentTheme.neonColor || '#06b6d4';
  const ambientColor = currentWallpaper.ambientLight || '#8b5cf6';

  // Procedural Textures
  const deskTextures = useMemo(() => createWoodDeskTexture(), []);
  const floorTextures = useMemo(() => createHardwoodFloorTexture(), []);
  const aioTexture = useMemo(() => createAioLcdTexture(38), []);
  const slatTextures = useMemo(() => createAcousticSlatTexture(), []);
  const leatherPadTexture = useMemo(() => createLeatherDeskPadTexture(), []);
  const speakerTexture = useMemo(() => createSpeakerConeTexture(), []);
  const skylineTexture = useMemo(() => createCitySkylineTexture(), []);
  const artTexture1 = useMemo(() => createGalleryArtTexture(0), []);
  const artTexture2 = useMemo(() => createGalleryArtTexture(1), []);

  const [isPcPoweredOn, setIsPcPoweredOn] = useState(true);

  // Realtime Mirroring Screen Texture with automatic GPU texture memory disposal
  const [screenTexture, setScreenTexture] = useState<THREE.CanvasTexture>(() =>
    createScreenTexture(currentTheme, currentWallpaper, windows, activeAppId)
  );

  useEffect(() => {
    const newTex = createScreenTexture(currentTheme, currentWallpaper, windows, activeAppId);
    setScreenTexture((prev) => {
      prev?.dispose();
      return newTex;
    });
    return () => {
      newTex.dispose();
    };
  }, [currentTheme, currentWallpaper, windows, activeAppId]);

  // Camera transitions when cameraMode changes
  useEffect(() => {
    if (!cameraControlsRef.current) return;
    if (cameraMode === 'screen') {
      cameraControlsRef.current.setLookAt(0, 0.84, 1.44, 0, 0.84, 0, true);
    } else if (cameraMode === 'desk') {
      cameraControlsRef.current.setLookAt(0, 0.96, 2.22, 0, 0.90, 0, true);
    }
  }, [cameraMode]);

  const handleInteract = (target: InteractTarget) => {
    if (target === 'computer') {
      soundFx.click();
      setCameraMode('screen');
    } else if (target === 'lamp') {
      soundFx.click();
      toggleRoomLamp();
    } else if (target === 'stereo') {
      soundFx.click();
      musicPlayer.togglePlay();
    } else if (target === 'coffee') {
      soundFx.sipCoffee();
    } else if (target === 'pc_power') {
      soundFx.powerRelay();
      setIsPcPoweredOn((prev) => !prev);
    }
  };

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        camera={{ position: [0, 0.96, 2.22], fov: 44 }}
        className="w-full h-full block select-none bg-[#090d16]"
      >
        <color attach="background" args={['#080c16']} />

        {/* Photorealistic IBL Studio Lighting & City Reflection Map */}
        <Environment preset="city" environmentIntensity={0.68} />

        {/* Ambient Room Daylight Fill (low intensity for cinematic contrast and deep shadows) */}
        <ambientLight intensity={0.24} color="#f8fafc" />

        {/* Sunlight streaming through Left Loft Window */}
        <directionalLight
          position={[-5.5, 5.0, 1.5]}
          intensity={2.8}
          color="#fffbeb"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />

        {/* Warm Studio Room Ceiling Fill */}
        <pointLight position={[0, 3.2, 1.2]} color="#fef3c7" intensity={1.5} distance={8.5} />

        {/* Camera Control: Orbit in 'desk' / 'screen', or First-Person Walking in 'fpv' */}
        {cameraMode !== 'fpv' ? (
          <CameraControls
            ref={cameraControlsRef}
            minDistance={0.8}
            maxDistance={4.5}
            maxPolarAngle={Math.PI / 2 - 0.04}
          />
        ) : (
          <FPVControls
            active={cameraMode === 'fpv'}
            onTargetChange={setHoverTarget}
            onInteract={handleInteract}
          />
        )}

        {/* Dust Particles floating in room air */}
        <Float speed={1.0} rotationIntensity={0.2} floatIntensity={0.4}>
          <points position={[0, 1.2, 0]}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={60}
                args={[
                  useMemo(() => {
                    const arr = new Float32Array(60 * 3);
                    for (let i = 0; i < 60; i++) {
                      arr[i * 3] = (Math.random() - 0.5) * 6.0;
                      arr[i * 3 + 1] = Math.random() * 2.5;
                      arr[i * 3 + 2] = (Math.random() - 0.5) * 6.0;
                    }
                    return arr;
                  }, []),
                  3,
                ]}
              />
            </bufferGeometry>
            <pointsMaterial size={0.022} color="#cbd5e1" transparent opacity={0.35} />
          </points>
        </Float>

        {/* ================= 3D WORKSTATION DESK SETUP ================= */}
        <group position={[0, 0, 0]}>
          {/* Solid American Walnut Desktop Slab with Micro-Beveled Chamfers */}
          <RoundedBox
            position={[0, 0, 0.1]}
            args={[3.2, 0.065, 1.3]}
            radius={0.014}
            smoothness={4}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              map={deskTextures.map}
              roughnessMap={deskTextures.roughnessMap}
              roughness={0.42}
              metalness={0.05}
            />
          </RoundedBox>

          {/* Front Bevel Chamfer Strip on Desk Edge */}
          <mesh position={[0, 0.032, 0.75]}>
            <boxGeometry args={[3.2, 0.004, 0.012]} />
            <meshStandardMaterial color="#4a3325" roughness={0.3} />
          </mesh>

          {/* Desk Edge RGB Under-Glow Diffuser Strips */}
          <mesh position={[0, -0.034, 0.72]}>
            <boxGeometry args={[3.16, 0.005, 0.012]} />
            <meshBasicMaterial color={neonColor} />
          </mesh>
          <mesh position={[0, -0.034, -0.52]}>
            <boxGeometry args={[3.16, 0.005, 0.012]} />
            <meshBasicMaterial color={neonColor} />
          </mesh>
          <pointLight position={[0, -0.06, -0.4]} color={neonColor} intensity={1.1} distance={1.8} />

          {/* Heavy-Duty Motorized Standing Desk Legs */}
          <mesh position={[-1.4, -0.45, 0.1]}>
            <boxGeometry args={[0.09, 0.85, 1.1]} />
            <meshStandardMaterial color="#0f172a" metalness={0.92} roughness={0.2} />
          </mesh>
          <mesh position={[1.4, -0.45, 0.1]}>
            <boxGeometry args={[0.09, 0.85, 1.1]} />
            <meshStandardMaterial color="#0f172a" metalness={0.92} roughness={0.2} />
          </mesh>

          {/* 34" Curved Ultrawide Display */}
          <DisplayMonitor
            neonColor={neonColor}
            ambientColor={ambientColor}
            onScreenClick={() => setCameraMode('screen')}
            screenTexture={screenTexture}
          />

          {/* 2026 Flagship Gaming PC (RTX 5090 & Ryzen 9 9950X3D) */}
          <FlagshipPCTower
            neonColor={neonColor}
            aioTexture={aioTexture}
            isPoweredOn={isPcPoweredOn}
            onTogglePower={() => {
              soundFx.powerRelay();
              setIsPcPoweredOn((p) => !p);
            }}
            onClick={() => setCameraMode('screen')}
          />

          {/* Studio Audio Monitor Speakers & Focusrite */}
          <AudioMonitors speakerTexture={speakerTexture} />

          {/* Mechanical Keyboard, Mouse & Stitched Leather Pad */}
          <KeyboardAndMouse
            neonColor={neonColor}
            leatherPadTexture={leatherPadTexture}
            onSipCoffee={() => soundFx.sipCoffee()}
          />

          {/* Ergonomic Mesh Office Chair */}
          <ErgonomicChair />
        </group>

        {/* Lounge Area: Sofa, Coffee Table, Floor Lamp, Bookshelf */}
        <LoungeArea
          isLampOn={isRoomLampOn}
          onToggleLamp={toggleRoomLamp}
          onToggleStereo={() => {
            soundFx.click();
            musicPlayer.togglePlay();
          }}
        />

        {/* Soft Contact Shadows on Floor & Tabletop */}
        <ContactShadows position={[0, -0.87, 0.5]} opacity={0.55} scale={12} blur={2.2} far={4} />
        <ContactShadows position={[0, 0.038, 0.3]} opacity={0.35} scale={3.2} blur={1.0} far={0.5} />

        {/* ================= 4-WALL ARCHITECTURAL LOFT ROOM ================= */}
        {/* 1. Back Wall: Architectural Dark Charcoal Plaster + Centered Smoked Oak Slat Panel + Floating Walnut Shelf */}
        <group position={[0, 1.2, -0.94]}>
          {/* Base Dark Charcoal Micro-Cement Wall */}
          <mesh>
            <planeGeometry args={[11, 5.2]} />
            <meshStandardMaterial color="#181e29" roughness={0.92} />
          </mesh>

          {/* Centered Luxury Smoked Oak Slat Feature Accent Panel (Replacing the 96 barcode stripes!) */}
          <mesh position={[0, 0.15, 0.012]} receiveShadow>
            <planeGeometry args={[3.8, 3.4]} />
            <meshStandardMaterial
              map={slatTextures.map}
              roughnessMap={slatTextures.roughnessMap}
              bumpMap={slatTextures.bumpMap}
              bumpScale={0.06}
              roughness={0.55}
            />
          </mesh>

          {/* Floating Solid American Walnut Display Shelf above Monitor */}
          <group position={[0, 0.42, 0.10]}>
            {/* Walnut Shelf Board with Beveled Edges */}
            <RoundedBox args={[2.6, 0.04, 0.22]} radius={0.008} smoothness={4} castShadow receiveShadow>
              <meshStandardMaterial map={deskTextures.map} roughness={0.4} />
            </RoundedBox>
            {/* Concealed LED Strip Under-Glow */}
            <mesh position={[0, -0.022, 0.05]}>
              <boxGeometry args={[2.5, 0.005, 0.015]} />
              <meshBasicMaterial color="#fffbeb" />
            </mesh>
            <spotLight
              position={[0, -0.05, 0.06]}
              target-position={[0, -0.6, 0]}
              color="#fffbeb"
              intensity={2.2}
              angle={0.9}
              penumbra={0.7}
              distance={1.8}
            />
            {/* Minimalist Shelf Decor: Ceramic Vase with Botanical Sprig */}
            <mesh position={[-0.85, 0.12, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.06, 0.20, 20]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
            </mesh>
            {/* Shelf Decor: Architectural Monographs */}
            <mesh position={[0.75, 0.08, 0]} rotation={[0, 0.15, 0]} castShadow>
              <boxGeometry args={[0.18, 0.14, 0.24]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} />
            </mesh>
            <mesh position={[0.77, 0.18, 0]} rotation={[0, -0.1, 0]} castShadow>
              <boxGeometry args={[0.16, 0.05, 0.22]} />
              <meshStandardMaterial color="#d97706" roughness={0.4} />
            </mesh>
          </group>

          {/* Soft Wall Wash LED Ambient Light */}
          <pointLight position={[0, 0.2, 0.06]} color="#fef3c7" intensity={1.6} distance={3.2} />
        </group>

        {/* 2. Left Wall: Giant Floor-to-Ceiling Industrial Window with Twilight City Skyline */}
        <group position={[-4.5, 1.2, 1.5]} rotation={[0, Math.PI / 2, 0]}>
          {/* Wall Surround */}
          <mesh position={[0, 0, -0.05]}>
            <boxGeometry args={[7.2, 4.8, 0.1]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          {/* Realistic City Skyline Twilight Backdrop Pane */}
          <mesh position={[0, 0, 0.005]}>
            <planeGeometry args={[5.4, 3.4]} />
            <meshBasicMaterial map={skylineTexture} />
          </mesh>
          {/* Exterior Window Glass Pane with Subtle Sky Reflection */}
          <mesh position={[0, 0, 0.015]}>
            <planeGeometry args={[5.4, 3.4]} />
            <meshPhysicalMaterial
              color="#38bdf8"
              transparent
              opacity={0.15}
              roughness={0.05}
              transmission={0.85}
            />
          </mesh>
          {/* Black Steel Window Mullions */}
          <mesh position={[0, 0, 0.025]}>
            <boxGeometry args={[0.06, 3.4, 0.03]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          <mesh position={[0, 0, 0.025]}>
            <boxGeometry args={[5.4, 0.06, 0.03]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
        </group>

        {/* 3. Right Wall: Art Gallery Wall */}
        <group position={[4.5, 1.2, 1.5]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh position={[0, 0, -0.05]}>
            <boxGeometry args={[7.2, 4.8, 0.1]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          {/* Framed Photography Prints with Picture Lights */}
          {[-1.6, 0.4].map((x, idx) => (
            <group key={idx} position={[x, 0.4, 0.02]}>
              {/* Outer Deep Black Matte Frame */}
              <mesh castShadow>
                <boxGeometry args={[1.1, 1.4, 0.03]} />
                <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.7} />
              </mesh>
              {/* Archival Off-White Passe-Partout Mat Board */}
              <mesh position={[0, 0, 0.016]}>
                <planeGeometry args={[1.02, 1.32]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.9} />
              </mesh>
              {/* High-Resolution Gallery Canvas Artwork */}
              <mesh position={[0, 0, 0.019]}>
                <planeGeometry args={[0.82, 1.12]} />
                <meshStandardMaterial map={idx === 0 ? artTexture1 : artTexture2} roughness={0.35} />
              </mesh>
              {/* Museum Chrome/Brass Picture Light Luminaire */}
              <group position={[0, 0.74, 0.08]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.007, 0.007, 0.45, 16]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
                </mesh>
                <mesh position={[0, -0.008, 0.002]}>
                  <boxGeometry args={[0.42, 0.004, 0.008]} />
                  <meshBasicMaterial color="#fffbeb" />
                </mesh>
                <spotLight
                  position={[0, -0.04, 0.06]}
                  target-position={[0, -0.45, 0]}
                  color="#fffbeb"
                  intensity={2.2}
                  angle={0.65}
                  penumbra={0.6}
                  distance={2.0}
                />
              </group>
            </group>
          ))}
        </group>

        {/* 4. Front Wall (Behind Player in FPV): Studio Door & Switch */}
        <group position={[0, 1.2, 4.5]} rotation={[0, Math.PI, 0]}>
          <mesh position={[0, 0, -0.05]}>
            <boxGeometry args={[9.2, 4.8, 0.1]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          {/* Studio Door */}
          <group position={[2.2, -0.15, 0.02]}>
            <mesh>
              <boxGeometry args={[1.1, 2.3, 0.04]} />
              <meshStandardMaterial color="#1e293b" roughness={0.4} />
            </mesh>
            {/* Brushed Chrome Handle */}
            <mesh position={[-0.42, 0, 0.03]}>
              <boxGeometry args={[0.12, 0.02, 0.03]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>
        </group>

        {/* 5. Hardwood Parquet Floor & Area Rug */}
        <mesh position={[0, -0.88, 1.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 8]} />
          <meshStandardMaterial
            map={floorTextures.map}
            roughnessMap={floorTextures.roughnessMap}
            roughness={0.4}
            metalness={0.05}
          />
        </mesh>
        {/* Large Textured Scandinavian Woven Area Rug */}
        <mesh position={[0, -0.875, 1.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[4.2, 3.4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.95} />
        </mesh>

        {/* 6. Concrete Architectural Ceiling */}
        <mesh position={[0, 3.5, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>

        {/* Cinematic Camera Post-Processing Pipeline */}
        <EffectComposer multisampling={4}>
          <Bloom
            luminanceThreshold={0.78}
            luminanceSmoothing={0.35}
            intensity={0.42}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.12} darkness={0.62} />
        </EffectComposer>
      </Canvas>

      {/* ================= FPV FIRST-PERSON ON-SCREEN OVERLAY & INTERACTION BANNER ================= */}
      {cameraMode === 'fpv' && (
        <>
          {/* Minimalist Center Crosshair */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div
              className={`rounded-full transition-all duration-150 ${
                hoverTarget
                  ? 'w-5 h-5 border-2 border-cyan-400 bg-cyan-400/30 scale-125 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                  : 'w-1.5 h-1.5 bg-white/80 shadow-[0_0_4px_rgba(255,255,255,0.8)]'
              }`}
            />
          </div>

          {/* Interactive Target Prompt Banner */}
          {hoverTarget && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-auto bg-slate-900/95 border border-cyan-400/50 backdrop-blur-xl px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-sans text-white animate-in slide-in-from-bottom-2 duration-150">
              <span className="px-2 py-0.5 rounded-lg bg-cyan-500 text-black font-mono font-bold shadow">
                PRESS [E]
              </span>
              <span className="font-semibold text-sm">
                {hoverTarget === 'computer' && 'Sit Down & Use Computer'}
                {hoverTarget === 'pc_power' && 'Toggle PC RGB / Power'}
                {hoverTarget === 'coffee' && 'Drink Fresh Espresso'}
                {hoverTarget === 'lamp' && 'Toggle Studio Floor Lamp'}
                {hoverTarget === 'stereo' && 'Play / Pause Vinyl Turntable'}
                {hoverTarget === 'sofa' && 'Relax on Lounge Sofa'}
              </span>
              <button
                onClick={() => handleInteract(hoverTarget)}
                className="ml-2 px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/40 text-xs cursor-pointer active:scale-95 transition"
              >
                Click
              </button>
            </div>
          )}

          {/* Walking Tutorial Hint at Bottom with Pointer Lock Notice */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none bg-black/75 backdrop-blur-md px-5 py-2 rounded-full border border-white/15 text-[11px] font-mono text-gray-200 flex items-center gap-4 shadow-2xl">
            <span className="text-cyan-300 font-semibold">CLICK SCREEN TO LOOK AROUND</span>
            <span className="text-gray-500">•</span>
            <span>WASD / ARROWS TO WALK</span>
            <span className="text-gray-500">•</span>
            <span className="text-emerald-400 font-semibold">[E] TO INTERACT</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400">ESC TO RELEASE MOUSE</span>
          </div>
        </>
      )}

      {/* Mode Switch Floating Pill (always accessible) */}
      <div className="absolute top-10 right-4 z-50 pointer-events-auto flex items-center bg-slate-900/90 border border-white/15 backdrop-blur-xl rounded-2xl p-1 shadow-2xl text-xs font-sans">
        <button
          onClick={() => {
            soundFx.click();
            setCameraMode('fpv');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer font-medium ${
            cameraMode === 'fpv'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow font-semibold'
              : 'text-gray-400 hover:text-white'
          }`}
          title="Walk around the 3D studio room in First-Person View"
        >
          <span>🚶 Walk in Room (FPV)</span>
        </button>
        <button
          onClick={() => {
            soundFx.click();
            setCameraMode('desk');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer font-medium ${
            cameraMode === 'desk'
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow font-semibold'
              : 'text-gray-400 hover:text-white'
          }`}
          title="Sit down at the workstation desk"
        >
          <span>🪑 Desk View</span>
        </button>
        <button
          onClick={() => {
            soundFx.click();
            setCameraMode('screen');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer font-medium ${
            cameraMode === 'screen'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow font-semibold'
              : 'text-gray-400 hover:text-white'
          }`}
          title="Focus directly on the interactive computer screen"
        >
          <span>🖥️ Use Computer</span>
        </button>
      </div>
    </div>
  );
};
