interface Size {
  width: number;
  height: number;
}
// 调节画面尺寸和全屏相关(返回source播放aegleseeker会出现迷之error)
export function adjustSize(source: Size, dest: Size, scale: number): [number, number, number, number] {
  const { width: sw, height: sh } = source;
  const { width: dw, height: dh } = dest;
  if (dw * sh > dh * sw) return [dw * (1 - scale) / 2, (dh - dw * sh / sw * scale) / 2, dw * scale, dw * sh / sw * scale];
  return [(dw - dh * sw / sh * scale) / 2, dh * (1 - scale) / 2, dh * sw / sh * scale, dh * scale];
}
