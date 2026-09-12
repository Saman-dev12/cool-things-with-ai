# Minecraft Web (VoxelCraft 3D) ⛏️🧱

> **A high-performance, playable 3D Voxel Sandbox in the browser built with React 19 and Three.js.**

Minecraft Web brings the classic Minecraft Java Edition sandbox experience directly to modern web browsers. It features a custom chunk-based voxel engine with culled face meshing, procedural fractal terrain generation, first-person AABB physics, block mining/placing, explosive TNT mechanics, procedural pixel-art textures, synthesized Web Audio sound effects, and authentic Minecraft HUD and menus.

---

## ✨ Features

- **Chunk-Based Culled Face Meshing (60 FPS)**:
  - 16x16x64 voxel chunks with sub-5ms geometry rebuilds.
  - Automatically culls internal occluded faces, rendering only surface block faces bordering air or transparent voxels.
  - Generates directional sunlight shading per face (Top: 1.0, North/South: 0.8, East/West: 0.65, Underside: 0.5) for classic Minecraft block depth.
- **Procedural Pixel-Art Texture Atlas**:
  - 100% canvas-generated 16x16 pixel-art textures rendered with `THREE.NearestFilter` for sharp retro pixel edges.
  - Blocks: Grass Block (green top & dirt fringe sides), Dirt, Stone, Cobblestone, Bedrock, Oak Log (growth rings top/bottom & bark sides), Oak Leaves (transparency cutouts), Oak Planks, Sand, Water (translucent), Glass, Bricks, Coal/Iron/Gold/Diamond Ores, TNT, Crafting Table, Furnace, Bookshelf, Snow, and Cacti.
- **Procedural Terrain & Biomes**:
  - Multi-octave Simplex / Perlin noise (fractal Brownian motion) generating rolling plains, forest groves, sandy deserts, and snowy mountain peaks.
  - Procedural oak tree generation with trunk columns and 3D spherical leaf clusters.
  - Desert cacti vegetation and underground ore veins distributed by elevation.
- **First-Person Physics & Movement**:
  - Custom AABB bounding box collision resolution on X, Y, and Z axes against solid voxels.
  - **Walking & Sprinting**: WASD movement with sprint toggle (`Ctrl` or double-tap W) and dynamic FOV kick.
  - **Jumping**: Realistic gravity, jump velocity, and head clearance checks.
  - **Sneaking (`Shift`)**: Ledge detection prevents walking off high block drops.
  - **Water Swimming**: Buoyancy, reduced fall speed, and underwater fog tint.
  - **Creative Flight (`F` or double-Space)**: 3D free flight with Space (ascend) and Shift (descend).
  - **Game Mode Toggle (`M` or pause menu)**: Switch between Creative and Survival modes.
- **Mining, Building & TNT Explosives**:
  - Voxel Raycasting (DDA algorithm) up to 5.5 blocks reach.
  - Black wireframe bounding box highlight around targeted block.
  - Left-click mining: progressive cracking animation (stages 0-9) and 10-piece flying debris particle burst.
  - Right-click building: places active hotbar block against targeted face without intersecting player.
  - Middle-click: pick-block copies targeted block into active hotbar slot.
  - **TNT Ignition & Blast**: striking or right-clicking TNT triggers a white flashing expansion countdown, a sizzling fuse sound, followed by a spherical voxel blast (`BOOM`) that vaporizes nearby blocks and launches players.
- **Synthesized Web Audio API Sounds**:
  - Procedural audio without external audio files: footsteps (grass, stone, wood, sand, water), block digging thuds, block break crunches, block place pops, TNT fuse sizzles, explosion blasts, and water splashes.
- **Authentic Minecraft UI & HUD**:
  - **9-Slot Hotbar**: active selector box, 1-9 number keys, and mouse wheel cycling.
  - **First-Person Hand Viewmodel**: 3D arm holding current block with walking bobbing and punch animation.
  - **Status Bars**: 10 Health Hearts (wobble on damage), 10 Hunger drumsticks, green Experience level bar, and underwater oxygen bubbles.
  - **Full Inventory Screen (`E`)**: Searchable Creative item catalog, 2x2 crafting table with recipe solver (Logs -> Planks, Planks -> Table, Cobble -> Furnace, Sand+Dirt -> TNT), and 27-slot player backpack.
  - **F3 Debug Screen (`F3`)**: Authentic Minecraft F3 overlay showing FPS, Coordinates (`XYZ`), Block coords, Chunk coords, Facing direction, Biome, Light level, and Targeted block inspection.
  - **In-Game Menu (`ESC`)**: Resume, game mode switch, video/audio options, and quit to title.
  - **Title Screen**: Classic moving panorama, bouncing yellow splash text ("Now in WebGL!", "100% Pure Three.js!"), and custom world seed input.

---

## 🎮 Controls & Keybindings

| Key / Input | Action |
| :--- | :--- |
| **W / A / S / D** | Walk & Strafe |
| **Mouse Look** | Rotate Camera (Pointer Lock API) |
| **Spacebar** | Jump / Swim upward / Fly upward |
| **Left Click** | Mine / Break block (hold in Survival, instant in Creative) |
| **Right Click** | Place active block / Ignite TNT |
| **Middle Click** | Pick block (copy targeted block to hotbar) |
| **F** (or double-Space) | Toggle Creative Flight |
| **Left Shift** | Sneak (prevents falling off ledges) / Fly downward |
| **Left Ctrl** (or double-W) | Sprint (expands FOV) |
| **E** | Open Inventory & 2x2 Crafting Screen |
| **1 - 9** / **Mouse Wheel** | Select Hotbar Slot |
| **F3** | Toggle Minecraft Debug Screen |
| **ESC** | Open Pause Menu / Release Pointer Lock |

---

## 🛠️ Tech Stack

- **Framework**: React 19, TypeScript
- **3D Graphics & Engine**: Three.js (WebGL 2.0)
- **Styling**: Tailwind CSS v4
- **Audio Engine**: Web Audio API (procedural synthesis)
- **Icons**: Lucide React
- **Build Tool**: Vite

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Modern browser with WebGL 2.0 enabled

### Installation & Development
```bash
# Navigate to minecraft-web
cd minecraft-web

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5174](http://localhost:5174) in your browser. Click **Generate & Enter World** and click anywhere inside the screen to lock the mouse cursor and begin playing!

### Production Build
```bash
npm run build
npm run preview
```
