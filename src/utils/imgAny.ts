import createCtx from './createCtx';
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
