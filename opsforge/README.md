# OpsForge ⚒️

> **The Authentic LeetCode for DevOps, SRE, and Cloud-Native Engineering**

OpsForge is an interactive incident response and infrastructure problem-solving arena designed to sharpen real-world engineering skills through hands-on scenario challenges. Built with a pixel-faithful **LeetCode Dark Mode** experience, it provides an in-browser Kubernetes cluster visualizer, interactive POSIX terminal, multi-manifest syntax-highlighted code editor, and automated grading system.

---

## ✨ Features

- **LeetCode Dark Mode UI**: Resizable split panes (horizontal & vertical draggable splitters), collapsible console drawer, and custom dark themes (`LeetCode Dark`, `Linear Titanium`, `Vercel Black`, `GitHub Dimmed`).
- **Syntax-Highlighted Code Editor**: Full Prism.js syntax highlighting for `YAML` (Kubernetes, Helm, GitHub Actions), `Dockerfile`, `Bash Shell` (`.sh`), `HCL / Terraform` (`.tf`), and `JSON` with synchronized line numbering gutter, LeetCode gold cursor, and zero-latency typing.
- **In-Browser POSIX Terminal**: Simulated terminal supporting realistic commands:
  - `kubectl` (`get pods`, `describe pod`, `logs`, `get svc`, `apply`)
  - `docker` (`ps`, `logs`, `inspect`, `build`)
  - `terraform` (`plan`, `apply`, `validate`, `state show`)
  - Linux SRE tools: `top`, `df -h`, `lsof +L1`, `free -m`, `systemctl`, `journalctl`
- **Kubernetes Cluster Visualizer**: Live interactive topology rendering Pod phases (`Running`, `CrashLoopBackOff`, `OOMKilled`, `Error`), ReplicaSets, Deployments, Service cluster IPs, target ports, and node resource gauges.
- **Acceptance & Diff Grader**: LeetCode-style test results with `Case 1`, `Case 2`, `Case 3` input inspection, pass/fail status, runtime latency percentiles, and expected vs. actual output diffs.
- **Root Cause Analysis (RCA) & Post-Mortem Engine**: Detailed incident post-mortems with root cause breakdowns, prevention measures, and multi-file reference solutions.
- **Customizable Preferences**: Dedicated Settings modal (`⚙️`) with font size (12px–18px), font family (Fira Code, JetBrains Mono, SF Mono), tab sizes, and word wrap controls.

---

## 🛠️ Tech Stack

- **Framework**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Syntax Highlighting**: Prism.js
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti
- **Tooling**: Vite

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm or yarn

### Installation & Development
```bash
# Navigate to opsforge directory
cd opsforge

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to start triaging incidents.

### Production Build
```bash
npm run build
npm run preview
```

---

## 📂 Project Structure

```
opsforge/
├── src/
│   ├── components/
│   │   ├── challenge/     # IncidentBriefing (Description, Editorial, Submissions), PostMortemModal
│   │   ├── cluster/       # ClusterVisualizer & Topology inspection
│   │   ├── editor/        # OpsEditor (Prism syntax highlighting overlay & gutter)
│   │   ├── layout/        # OpsNavbar, OpsWorkspace (draggable split panes)
│   │   ├── settings/      # SettingsModal (fonts, themes, tab size)
│   │   └── terminal/      # OpsTerminal (simulated POSIX environment)
│   ├── context/           # OpsContext (global state, test runner, persistence)
│   ├── data/              # Curated scenario catalog, starter files, testcases
│   ├── styles/            # Tailwind v4 & Prism Dark+ token styles
│   ├── types/             # SRE challenge schemas, cluster states, settings
│   └── utils/             # Syntax highlighter & formatters
├── public/                # Static assets
└── package.json
```

---

## 📜 Available Incident Scenarios

1. **Kubernetes**: *CrashLoopBackOff & OOMKilled Payment Microservice* — Diagnose memory limits, liveness probes, and ConfigMap references under traffic spikes.
2. **Containers**: *Shrink 1.4GB Monolith to 45MB & Secure Container* — Implement multi-stage builds, Alpine base images, non-root users (`USER node`), and layer caching.
3. **Linux SRE Incident Response**: *The Midnight 100% Disk Full Mystery* — Identify unlinked open file descriptors holding disk blocks (`lsof +L1`), target rogue PIDs, and reclaim space without dropping production connections.
4. **Terraform IaC**: *Resolve Cyclic Dependency & Multi-AZ Subnet Drift* — Break HCL graph loops, eliminate overlapping CIDR allocations, and export outputs.
5. **CI/CD & Pipelines**: *Fix Flaky Multi-Arch Pipeline & Dependency Cache* — Add `actions/checkout`, setup `actions/cache@v4` with lockfile hashes, and secure credentials.
6. **Observability & SRE**: *Write PromQL Alert for P99 Latency & SLO Burn* — Quantile calculation over histogram buckets (`histogram_quantile(0.99, ...)`).
