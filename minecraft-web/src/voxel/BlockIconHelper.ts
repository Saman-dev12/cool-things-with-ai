import { BlockType } from '../types';
import { BLOCK_REGISTRY } from './BlockRegistry';
import { TextureAtlas } from './TextureAtlas';

const iconCache = new Map<BlockType, string>();

export function getBlockIconUrl(blockType: BlockType): string {
  if (blockType === BlockType.AIR) return '';
  if (iconCache.has(blockType)) return iconCache.get(blockType)!;

  const atlas = TextureAtlas.getInstance();
  const blockDef = BLOCK_REGISTRY[blockType];
  if (!blockDef) return '';

  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.imageSmoothingEnabled = false;

  // Draw 2D texture scaled up with nearest neighbor
  const texName = blockDef.textures.top;
  const uv = atlas.getUV(texName);

  const atlasW = atlas.canvas.width;
  const atlasH = atlas.canvas.height;
  const sx = uv.uMin * atlasW;
  const sy = (1 - uv.vMax) * atlasH;
  const sSize = (uv.uMax - uv.uMin) * atlasW;

  ctx.drawImage(atlas.canvas, sx, sy, sSize, sSize, 0, 0, 32, 32);

  const dataUrl = canvas.toDataURL();
  iconCache.set(blockType, dataUrl);
  return dataUrl;
}
