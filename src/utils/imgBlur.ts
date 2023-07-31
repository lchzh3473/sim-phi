import createCtx from './createCtx';
import { canvasRGBA } from 'stackblur-canvas';
export async function imgBlur(img: ImageBitmap): Promise<ImageBitmap> {
  const ctx = createCtx(img.width, img.height);
  const { width: w, height: h } = ctx.canvas;
  ctx.drawImage(img, 0, 0);
  canvasRGBA(ctx.canvas, 0, 0, w, h, Math.ceil(Math.min(w, h) * 0.0125));
  return createImageBitmap(ctx.canvas);
}
