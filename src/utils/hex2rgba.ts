import createCtx from './createCtx';
// 十六进制color转rgba数组
export function hex2rgba(color: string): Uint8ClampedArray {
  const ctx = createCtx(1, 1);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  return ctx.getImageData(0, 0, 1, 1).data;
}
