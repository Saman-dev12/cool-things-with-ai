# Cool Things with AI ⚡

> A curated collection of creative, interactive, and production-grade experimental projects built with modern web technologies and AI.

This repository serves as a **modular monorepo** hosting multiple independent, self-contained applications. Each project explores different facets of frontend engineering, 3D graphics, developer tooling, simulation, and interactive systems.

---

## 🚀 Projects Showcase

| Project | Category | Description | Tech Stack | Quick Links |
| :--- | :--- | :--- | :--- | :--- |
| [**OpsForge**](./opsforge) | **DevOps & Cloud SRE** | Interactive incident response arena ("LeetCode for DevOps"). Diagnose CrashLoopBackOffs, disk exhaustion, and IaC drift with a live Kubernetes cluster visualizer, in-browser POSIX terminal, syntax-highlighted editor, and automated grading. | React 19, TypeScript, Tailwind CSS v4, Prism.js, Vite | [Folder](./opsforge) • [README](./opsforge/README.md) |
| [**3D AI BattleStation**](./3d-ai-battlestation) | **3D Graphics & Simulation** | Photorealistic architectural loft with First-Person navigation (WASD + mouse look). Features a custom liquid-cooled Lian Li PC rig with an RTX 5090 and a 34" ultrawide curved monitor running an interactive in-world virtual OS (AetherOS). | React 19, Three.js, React Three Fiber, Web Audio API, Vite | [Folder](./3d-ai-battlestation) • [README](./3d-ai-battlestation/README.md) |

*(More experimental projects and interactive tools will be added here!)*

---

## 🏗️ Repository Architecture

This repository is organized as a lightweight, independent multi-project workspace:

```
cool-things-with-ai/
├── opsforge/               # Interactive DevOps & SRE scenario challenge platform
├── 3d-ai-battlestation/    # 3D architectural loft & in-world virtual desktop OS
├── <future-project>/       # New independent projects slot in here
└── README.md               # Monorepo portal & project directory
```

### Core Monorepo Principles
- **Zero Cross-Contamination**: Each project maintains its own isolated `package.json`, dependencies, build config (`vite.config.ts`), and TypeScript environment.
- **Independent Execution**: Any project can be cloned, developed, built, and deployed without dependencies on sibling projects.
- **Dedicated Documentation**: Every subproject contains its own detailed `README.md` with scenario breakdowns, architecture diagrams, controls, and configuration options.

---

## ⚡ Quick Start

To run any project locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Saman-dev12/cool-things-with-ai.git
   cd cool-things-with-ai
   ```

2. **Navigate into the desired project directory**:
   ```bash
   cd <project-folder-name>
   # Example: cd opsforge
   # Example: cd 3d-ai-battlestation
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```

---

## ➕ Adding New Projects

When adding a new experiment or application to this repository:

1. Create a dedicated subfolder at the root (e.g. `cool-things-with-ai/my-new-project/`).
2. Initialize with its own `package.json` and build pipeline (e.g. Vite, Next.js, Astro).
3. Ensure standard npm lifecycle scripts are present:
   - `npm run dev`: Starts the local development server.
   - `npm run build`: Compiles and type-checks the project for production.
4. Include a dedicated `README.md` in the project directory detailing features, architecture, and controls.
5. Register the new project in the [Projects Showcase table](#-projects-showcase) in this root `README.md`.

---

## 🤝 Contributing & Feedback

Contributions, experiments, and creative ideas are welcome! Feel free to open an issue or submit a pull request.

*Maintained with ❤️ by [Saman-dev12](https://github.com/Saman-dev12)*
