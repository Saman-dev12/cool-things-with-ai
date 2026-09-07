# Cool Things with AI 🚀

A curated collection of creative, interactive, and production-grade experimental projects built with AI.

Each project lives in its own dedicated directory and can be run, developed, and deployed independently.

---

## 📂 Projects

| Directory | Project Name | Description | Tech Stack |
| :--- | :--- | :--- | :--- |
| [**`opsforge/`**](./opsforge) | **OpsForge — LeetCode for DevOps & SRE** | Production-grade scenario challenges for DevOps, SRE, and Cloud-Native engineers. Features real-time Kubernetes cluster topology map, in-browser POSIX terminal (`kubectl`, `docker`, `terraform`, `top`, `df`, `lsof`), multi-file manifest editor, automated quality & reliability grader, and incident post-mortem RCA engine. | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti, Vite |
| [**`3d-ai-battlestation/`**](./3d-ai-battlestation) | **3D Photorealistic AI BattleStation Loft** | Full 3D architectural loft with First-Person View (WASD walking, mouse look), Lian Li O11 Vision PC rig with RTX 5090 & HydroShift AIO cooler, 34" curved ultrawide monitor running an interactive macOS-style AetherOS desktop with retro arcade games, CodeCraft IDE with sandboxed JS runtime, and real studio master audio player. | React 19, Three.js, React Three Fiber, Web Audio API, TailwindCSS, Vite |

---

## ⚡ OpsForge: LeetCode for DevOps & Cloud-Native SRE

```
   ____  ____  _____ _____ ____  ____   ____ _____ 
  / __ \|  _ \/ ____|  ___/ __ \|  _ \ / ___| ____|
 | |  | | |_) | (___| |_ | |  | | |_) | |  _|  _|  
 | |__| |  __/ \___ \  _|| |__| |  _ <| |_| | |___ 
  \____/|_|    |_____/_|  \____/|_| \_\\____|_____|
```

### Challenge Tracks & Scenarios
1. ☸️ **Kubernetes**: *CrashLoopBackOff & OOMKilled Payment Microservice* — Diagnose memory limits, liveness probe endpoints, and ConfigMap references under traffic load.
2. 🐳 **Containers**: *Shrink 1.4GB Monolith to 45MB & Secure Container* — Implement multi-stage builds, Alpine base images, non-root users (`USER node`), and layer caching.
3. 🐧 **Linux SRE Incident Response**: *The Midnight 100% Disk Full Mystery* — Identify unlinked open file descriptors holding disk blocks (`lsof +L1`), target rogue PIDs, and reclaim space without dropping production connections.
4. 🏗️ **Terraform IaC**: *Resolve Cyclic Dependency & Multi-AZ Subnet Drift* — Break HCL graph loops, eliminate overlapping CIDR allocations, and export outputs.
5. ⚡ **CI/CD & GitHub Actions**: *Fix Flaky Multi-Arch Pipeline & Dependency Cache* — Add `actions/checkout`, setup `actions/cache@v4` with lockfile hashes, and secure credentials.
6. 📊 **Observability & PromQL**: *Write PromQL Alert for P99 Latency & SLO Burn* — Quantile calculation over histogram buckets (`histogram_quantile(0.99, ...)`).

### Running OpsForge Locally
```bash
cd opsforge
npm install
npm run dev
```
Open `http://localhost:5173` to triage incidents in the interactive SRE arena.

---

## 🎮 3D AI BattleStation Loft

```bash
cd 3d-ai-battlestation
npm install
npm run dev
```

---

*Curated with ❤️ by [Saman-dev12](https://github.com/Saman-dev12)*
