import createCtx from './createCtx';
import { canvasRGBA } from 'stackblur-canvas';
// 十六进制color转rgba数组
export function hex2rgba(color: string): Uint8ClampedArray {
  const ctx = createCtx(1, 1);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  return ctx.getImageData(0, 0, 1, 1).data;
}
export async function imgPainter(img: ImageBitmap, color: string, limit = 512): Promise<ImageBitmap> {
  const dataRGBA = hex2rgba(color);
  const ctx = createCtx(img.width, img.height, { willReadFrequently: true }); // Warning
  ctx.drawImage(img, 0, 0);
  for (let dy = 0; dy < img.height; dy += limit) {
    for (let dx = 0; dx < img.width; dx += limit) {
      const imgData = ctx.getImageData(dx, dy, limit, limit);
      for (let i = 0; i < imgData.data.length / 4; i++) {
        imgData.data[i * 4] = dataRGBA[0];
        imgData.data[i * 4 + 1] = dataRGBA[1];
        imgData.data[i * 4 + 2] = dataRGBA[2];
        imgData.data[i * 4 + 3] *= dataRGBA[3] / 255;
      }
      ctx.putImageData(imgData, dx, dy);
    }
  }
  return createImageBitmap(ctx.canvas);
}
export async function imgBlur(img: ImageBitmap): Promise<ImageBitmap> {
  const ctx = createCtx(img.width, img.height);
  const { width: w, height: h } = ctx.canvas;
  ctx.drawImage(img, 0, 0);
  canvasRGBA(ctx.canvas, 0, 0, w, h, Math.ceil(Math.min(w, h) * 0.0125));
  return createImageBitmap(ctx.canvas);
}
export async function imgShader(img: ImageBitmap, color: string, limit = 512): Promise<ImageBitmap> {
  const dataRGBA = hex2rgba(color);
  const ctx = createCtx(img.width, img.height, { willReadFrequently: true }); // warning
  ctx.drawImage(img, 0, 0);
  for (let dy = 0; dy < img.height; dy += limit) {
    for (let dx = 0; dx < img.width; dx += limit) {
      const imgData = ctx.getImageData(dx, dy, limit, limit);
      for (let i = 0; i < imgData.data.length / 4; i++) {
        imgData.data[i * 4] *= dataRGBA[0] / 255;
        imgData.data[i * 4 + 1] *= dataRGBA[1] / 255;
        imgData.data[i * 4 + 2] *= dataRGBA[2] / 255;
        imgData.data[i * 4 + 3] *= dataRGBA[3] / 255;
      }
      ctx.putImageData(imgData, dx, dy);
    }
  }
  return createImageBitmap(ctx.canvas);
}
export namespace ImgAny{
  export function decode(img: ImageBitmap, border = 0): ArrayBuffer {
    const ctx1 = createCtx(img.width - border * 2, img.height - border * 2);
    ctx1.drawImage(img, -border, -border);
    const id = ctx1.getImageData(0, 0, ctx1.canvas.width, ctx1.canvas.width);
    const ab = new Uint8Array(id.data.length / 4 * 3);
    for (let i = 0; i < ab.length; i++) ab[i] = id.data[(i / 3 | 0) * 4 + i % 3] ^ i * 3473;
    const size = new DataView(ab.buffer, 0, 4).getUint32(0);
    return ab.buffer.slice(4, size + 4);
  }
  export function decodeAlt(img: ImageBitmap): ArrayBuffer {
    const ctx = createCtx(img.width, img.height);
    ctx.drawImage(img, 0, 0);
    const id = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const ab = new Uint8Array(id.data.length / 4 * 3);
    const mask = (v = 0, i = 0) => v ^ i ** 2 * 3473 & 255;
    for (let i = 0; i < ab.length; i++) ab[i] = id.data[(i / 3 | 0) * 4 + i % 3];
    const combined = new Uint8Array(ab.length / 2);
    for (let i = 0; i < ab.length / 2; i++) combined[i] = mask((ab[i * 2] + 8) / 17 << 4 | (ab[i * 2 + 1] + 8) / 17, i);
    const size = new DataView(combined.buffer, 0, 4).getUint32(0);
    return combined.buffer.slice(4, size + 4);
  }
}
export async function imgSplit(img: ImageBitmap, limitX?: number, limitY?: number): Promise<ImageBitmap[]> {
  const dx = Math.floor(limitX ?? Math.min(img.width, img.height));
  const dy = Math.floor(limitY ?? dx);
  const arr = [];
  for (let sy = 0; sy < img.height; sy += dy) {
    for (let sx = 0; sx < img.width; sx += dx) {
      arr.push(createImageBitmap(img, sx, sy, dx, dy));
    }
  }
  return Promise.all(arr);
}
