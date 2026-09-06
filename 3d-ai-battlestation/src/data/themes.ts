import type { ThemeConfig, Wallpaper } from '../types/os';

export const THEMES: ThemeConfig[] = [
  {
    id: 'cyberpunk',
    name: 'Neo Tokyo Night',
    primary: '#06b6d4', // Cyan
    accent: '#ec4899', // Pink
    glassBg: 'rgba(10, 15, 30, 0.82)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    ambientColor: '#38bdf8',
    neonColor: '#06b6d4',
  },
  {
    id: 'matrix',
    name: 'Emerald Matrix',
    primary: '#10b981', // Emerald
    accent: '#059669', // Dark Green
    glassBg: 'rgba(5, 20, 15, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    ambientColor: '#059669',
    neonColor: '#10b981',
  },
  {
    id: 'tokyo-midnight',
    name: 'Obsidian Studio',
    primary: '#8b5cf6', // Violet
    accent: '#3b82f6', // Blue
    glassBg: 'rgba(15, 20, 32, 0.84)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    ambientColor: '#6366f1',
    neonColor: '#8b5cf6',
  },
  {
    id: 'sunset-synth',
    name: 'Sunset Mirage',
    primary: '#f43f5e', // Rose
    accent: '#f97316', // Orange
    glassBg: 'rgba(25, 15, 28, 0.84)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    ambientColor: '#ea580c',
    neonColor: '#f43f5e',
  },
  {
    id: 'minimal-ice',
    name: 'Nordic Clean',
    primary: '#38bdf8', // Sky blue
    accent: '#94a3b8', // Slate
    glassBg: 'rgba(15, 23, 42, 0.88)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    ambientColor: '#38bdf8',
    neonColor: '#7dd3fc',
  },
];

export const WALLPAPERS: Wallpaper[] = [
  {
    id: 'loft-studio',
    name: 'Scandinavian Loft Studio',
    url: "url('/wallpapers/loft.jpg') center/cover no-repeat",
    dominantColor: '#f59e0b',
    accentColor: '#38bdf8',
    ambientLight: '#fef3c7',
  },
  {
    id: 'deep-space',
    name: 'James Webb Cosmic Nebula',
    url: "url('/wallpapers/nebula.jpg') center/cover no-repeat",
    dominantColor: '#a855f7',
    accentColor: '#38bdf8',
    ambientLight: '#8b5cf6',
  },
  {
    id: 'tokyo-rain',
    name: 'Shinjuku Rainy Neon Night',
    url: "url('/wallpapers/tokyo.jpg') center/cover no-repeat",
    dominantColor: '#ec4899',
    accentColor: '#06b6d4',
    ambientLight: '#06b6d4',
  },
  {
    id: 'cyber-grid',
    name: 'Obsidian Sapphire Minimal',
    url: 'radial-gradient(ellipse at 50% 15%, #1e1b4b 0%, #0d1326 50%, #030712 100%)',
    dominantColor: '#38bdf8',
    accentColor: '#818cf8',
    ambientLight: '#38bdf8',
  },
  {
    id: 'matrix-rain',
    name: 'Nordic Emerald Forest',
    url: 'radial-gradient(ellipse at 50% 10%, #064e3b 0%, #022c22 45%, #01140e 100%)',
    dominantColor: '#10b981',
    accentColor: '#34d399',
    ambientLight: '#10b981',
  },
];
