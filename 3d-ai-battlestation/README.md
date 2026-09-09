# 3D AI BattleStation Loft 🖥️✨

> **Photorealistic 3D Architectural Loft & Interactive In-World Virtual OS**

An immersive web-based 3D environment built with **Three.js** and **React Three Fiber**. Freely navigate a hyper-detailed architectural penthouse loft in First-Person View (WASD + mouse look), sit down at a custom Lian Li O11 Vision dual-chamber PC battlestation, and interact directly with **AetherOS** running live on a 34" curved ultrawide display.

---

## ✨ Features

- **3D Architectural Environment**: Hyper-realistic penthouse loft with wood floors, exposed brick, loft windows, ambient neon lighting, studio acoustic panels, and potted greenery.
- **First-Person Controls (FPV)**: Smooth WASD movement, spacebar jump, collision boundaries, and mouse look with Pointer Lock API.
- **Lian Li O11 Vision Dual-Chamber Rig**: Fully modeled liquid-cooled PC case featuring an NVIDIA GeForce RTX 5090, Lian Li HydroShift AIO cooler, Lian Li UNI Fan TL LCD RGB fans, and custom braided cables.
- **Interactive In-World Virtual OS (AetherOS)**:
  - **34" Curved Ultrawide Display**: Screen canvas renders an interactive desktop with floating draggable windows, dock, and menu bar.
  - **CodeCraft IDE**: Full-featured code editor with syntax highlighting and sandboxed JavaScript evaluation.
  - **Terminal**: Simulated POSIX shell with custom utilities and AI commands.
  - **Audio Master / Music Player**: Real synthesized Web Audio API tracks with visualizer.
  - **Retro Arcade**: Playable mini-games including CyberPong, Breakout, and Snake.
  - **AI Chat Assistant**: Conversational assistant interface.
  - **Web Browser Simulation**: Functional browser tab with curated bookmarks and web pages.
  - **Gallery & Wallpapers**: High-resolution themes and live procedural wallpapers.
- **Postprocessing & Shaders**: Bloom, tone mapping, screen space reflections, and realistic shadows.

---

## 🛠️ Tech Stack

- **Framework**: React 19, TypeScript
- **3D & Graphics**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Shaders & Effects**: Postprocessing (`@react-three/postprocessing`)
- **Styling**: Tailwind CSS v4
- **Audio**: Web Audio API
- **Icons**: Lucide React
- **Tooling**: Vite

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Modern browser with WebGL 2.0 and hardware acceleration enabled

### Installation & Development
```bash
# Navigate to 3d-ai-battlestation directory
cd 3d-ai-battlestation

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Click anywhere to engage mouse-look, and press `ESC` to release.

### Controls
| Key / Input | Action |
| :--- | :--- |
| **W / A / S / D** | Walk Forward / Left / Backward / Right |
| **Mouse Move** | Look around (first-person camera) |
| **Spacebar** | Jump |
| **Left Click** | Interact with objects / Click into AetherOS monitor |
| **ESC** | Release mouse pointer lock |

---

## 📂 Project Structure

```
3d-ai-battlestation/
├── src/
│   ├── components/
│   │   ├── apps/          # AetherOS applications (Arcade, CodeEditor, Music, Terminal, Browser)
│   │   ├── os/            # AetherOS desktop, window manager, dock, taskbar
│   │   └── scene/         # 3D scene (WorkstationScene, FPVControls, ProceduralTextures, ScreenCanvas)
│   ├── context/           # AudioContext, OS state management
│   ├── data/              # Default wallpapers, music tracks, initial files
│   ├── audio/             # Sound synthesis utilities
│   └── styles/            # Tailwind styles
├── public/                # Static assets & 3D textures
└── package.json
```
