export type AppId =
  | 'browser'
  | 'terminal'
  | 'music'
  | 'arcade'
  | 'code'
  | 'chat'
  | 'settings'
  | 'gallery';

export type CameraMode = 'fpv' | 'desk' | 'screen';

export interface AppWindow {
  id: AppId;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export interface Wallpaper {
  id: string;
  name: string;
  url: string;
  dominantColor: string;
  accentColor: string;
  ambientLight: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  primary: string;
  accent: string;
  glassBg: string;
  borderColor: string;
  ambientColor: string;
  neonColor: string;
}
