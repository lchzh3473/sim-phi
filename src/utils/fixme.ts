import createCtx from './createCtx';
import { audio } from '../external';
export async function fixme(raw: Record<string, unknown>, res: Record<string, unknown>): Promise<void> {
  const entries = ['Tap', 'TapHL', 'Drag', 'DragHL', 'HoldHead', 'HoldHeadHL', 'Hold', 'HoldHL', 'HoldEnd', 'Flick', 'FlickHL', 'HitFXRaw'];
  if (raw.image == null) raw.image = {};
  const { image } = raw as { image: Record<string, string> };
  for (const entry of entries) {
    if (image[entry] == null) image[entry] = '|8080';
  }
  if (res.Tap == null) {
    const ctx = createCtx(1089, 200);
    ctx.lineWidth = 32;
    ctx.strokeStyle = '#fff';
    ctx.stroke(new Path2D('M 0 0 L 1089 0 L 1089 200 L 0 200 Z'));
    ctx.strokeStyle = '#0ac3e1';
    ctx.stroke(new Path2D('M 50 50 L 1039 50 L 1039 150 L 50 150 Z'));
    res.Tap = await createImageBitmap(ctx.canvas);
  }
  if (res.TapHL == null) {
    const ctx = createCtx(1089, 200);
    ctx.lineWidth = 32;
    ctx.strokeStyle = '#fdfd66';
    ctx.stroke(new Path2D('M 0 0 L 1089 0 L 1089 200 L 0 200 Z'));
    ctx.strokeStyle = '#0ac3e1';
    ctx.stroke(new Path2D('M 50 50 L 1039 50 L 1039 150 L 50 150 Z'));
    res.TapHL = await createImageBitmap(ctx.canvas);
  }
  if (res.Drag == null) {
    const ctx = createCtx(1089, 160);
    ctx.lineWidth = 32;
    ctx.strokeStyle = '#fff';
    ctx.stroke(new Path2D('M 0 0 L 1089 0 L 1089 160 L 0 160 Z'));
    ctx.strokeStyle = '#f0ed69';
    ctx.stroke(new Path2D('M 50 50 L 1039 50 L 1039 110 L 50 110 Z'));
    res.Drag = await createImageBitmap(ctx.canvas);
  }
  if (res.DragHL == null) {
    const ctx = createCtx(1089, 160);
    ctx.lineWidth = 32;
    ctx.strokeStyle = '#fdfd66';
    ctx.stroke(new Path2D('M 0 0 L 1089 0 L 1089 160 L 0 160 Z'));
    ctx.strokeStyle = '#f0ed69';
    ctx.stroke(new Path2D('M 50 50 L 1039 50 L 1039 110 L 50 110 Z'));
    res.DragHL = await createImageBitmap(ctx.canvas);
  }
  if (res.HoldHead == null) {
    const ctx = createCtx(1089, 100);
    ctx.lineWidth = 32;
    ctx.strokeStyle = '#fff';
    ctx.stroke(new Path2D('M 0 0 L 0 100 L 1089 100 L 1089 0'));
    ctx.strokeStyle = '#96ebfc';
    ctx.stroke(new Path2D('M 50 0 L 50 50 L 1039 50 L 1039 0'));
    res.HoldHead = await createImageBitmap(ctx.canvas);
  }
  if (res.HoldHeadHL == null) {
    const ctx = createCtx(1089, 100);
    ctx.lineWidth = 32;
    ctx.strokeStyle = '#fdfd66';
    ctx.stroke(new Path2D('M 0 0 L 0 100 L 1089 100 L 1089 0'));
    ctx.strokeStyle = '#96ebfc';
    ctx.stroke(new Path2D('M 50 0 L 50 50 L 1039 50 L 1039 0'));
    res.HoldHeadHL = await createImageBitmap(ctx.canvas);
  }
  if (res.Hold == null) {
    const ctx = createCtx(1089, 1900);
    ctx.lineWidth = 32;
    ctx.strokeStyle = '#fff';
    ctx.stroke(new Path2D('M 0 0 L 0 1900 M 1089 0 L 1089 1900'));
    ctx.strokeStyle = '#96ebfc';
    ctx.stroke(new Path2D('M 50 0 L 50 1900 M 1039 0 L 1039 1900'));
    res.Hold = await createImageBitmap(ctx.canvas);
  }
  if (res.HoldHL == null) {
    const ctx = createCtx(1089, 1900);
    ctx.lineWidth = 32;
    ctx.strokeStyle = '#fdfd66';
    ctx.stroke(new Path2D('M 0 0 L 0 1900 M 1089 0 L 1089 1900'));
    ctx.strokeStyle = '#96ebfc';
    ctx.stroke(new Path2D('M 50 0 L 50 1900 M 1039 0 L 1039 1900'));
    res.HoldHL = await createImageBitmap(ctx.canvas);
  }
  if (res.HoldEnd == null) {
    const ctx = createCtx(1089, 100);
    ctx.lineWidth = 32;
    ctx.strokeStyle = '#fff';
    ctx.stroke(new Path2D('M 0 100 L 0 0 L 1089 0 L 1089 100'));
    ctx.strokeStyle = '#96ebfc';
    ctx.stroke(new Path2D('M 50 100 L 50 50 L 1039 50 L 1039 100'));
    res.HoldEnd = await createImageBitmap(ctx.canvas);
  }
  if (res.Flick == null) {
    const ctx = createCtx(1089, 300);
    ctx.lineWidth = 32;
    ctx.strokeStyle = '#fff';
    ctx.stroke(new Path2D('M 0 0 L 1089 0 L 1089 300 L 0 300 Z'));
    ctx.strokeStyle = '#fe4365';
    ctx.stroke(new Path2D('M 50 50 L 1039 50 L 1039 250 L 50 250 Z'));
    res.Flick = await createImageBitmap(ctx.canvas);
  }
  if (res.FlickHL == null) {
    const ctx = createCtx(1089, 300);
    ctx.lineWidth = 32;
    ctx.strokeStyle = '#fdfd66';
    ctx.stroke(new Path2D('M 0 0 L 1089 0 L 1089 300 L 0 300 Z'));
    ctx.strokeStyle = '#fe4365';
    ctx.stroke(new Path2D('M 50 50 L 1039 50 L 1039 250 L 50 250 Z'));
    res.FlickHL = await createImageBitmap(ctx.canvas);
  }
  if (res.Rank == null) {
    const ctx = createCtx(256, 1792);
    ctx.lineWidth = 32;
    ctx.strokeStyle = '#fff000';
    ctx.strokeRect(58, 58, 140, 140);
    ctx.strokeStyle = '#6f6bf1';
    ctx.strokeRect(58, 58 + 256, 140, 140);
    ctx.strokeStyle = '#ea4cd6';
    ctx.strokeRect(58, 58 + 256 * 2, 140, 140);
    ctx.strokeStyle = '#ff7f2a';
    ctx.strokeRect(58, 58 + 256 * 3, 140, 140);
    ctx.strokeStyle = '#00d448';
    ctx.strokeRect(58, 58 + 256 * 4, 140, 140);
    ctx.strokeStyle = '#00eafb';
    ctx.strokeRect(58, 58 + 256 * 5, 140, 140);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(58, 58 + 256 * 6, 140, 140);
    res.Rank = await createImageBitmap(ctx.canvas);
  }
  if (res.HitFXRaw == null) {
    const ctx = createCtx(256, 256 * 30);
    ctx.strokeStyle = '#fff';
    for (let i = 0; i < 30; i++) {
      const tick = i / 30;
      ctx.lineWidth = (1 - tick) ** 2 * 25;
      ctx.globalAlpha = 1 - tick;
      const width = tick ** 0.2 * 224;
      ctx.strokeRect(128 - width / 2, i * 256 + 128 - width / 2, width, width);
    }
    res.HitFXRaw = await createImageBitmap(ctx.canvas);
  }
  if (res.LevelOver1 == null) {
    const ctx = createCtx(1716, 325);
    ctx.fillStyle = '#333';
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0, 0, 1716, 325);
    res.LevelOver1 = await createImageBitmap(ctx.canvas);
  }
  if (res.LevelOver4 == null) {
    const ctx = createCtx(633, 122);
    ctx.fillStyle = '#333';
    ctx.globalAlpha = 0.9;
    ctx.fillRect(0, 0, 633, 122);
    res.LevelOver4 = await createImageBitmap(ctx.canvas);
  }
  if (res.LevelOver5 == null) {
    const ctx = createCtx(11, 43);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 11, 43);
    res.LevelOver5 = await createImageBitmap(ctx.canvas);
  }
  const entries2 = ['HitFXRaw', 'Rank', 'LevelOver1', 'LevelOver3', 'LevelOver4', 'LevelOver5'];
  for (const entry of entries2) {
    if (res[entry] == null) {
      res[entry] = await createImageBitmap(createCtx(1, 1).canvas);
    }
  }
  if (res.JudgeLine == null) {
    const ctx = createCtx(1920, 3);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 1920, 3);
    res.JudgeLine = await createImageBitmap(ctx.canvas);
  }
  if (res.ProgressBar == null) {
    const ctx = createCtx(1919, 11);
    ctx.fillStyle = '#919191';
    ctx.fillRect(0, 0, 1916, 11);
    ctx.fillStyle = '#fff';
    ctx.fillRect(1916, 0, 3, 11);
    res.ProgressBar = await createImageBitmap(ctx.canvas);
  }
  if (res.HitSong0 == null) res.HitSong0 = audio.triangle(0.075, 880, 0.5); // 0.1
  if (res.HitSong1 == null) res.HitSong1 = audio.triangle(0.05, 1318, 0.5); // 0.44
  if (res.HitSong2 == null) res.HitSong2 = audio.triangle(0.075, 1760, 0.5); // 0.39
  if (res.LevelOver0_v1 == null) res.LevelOver0_v1 = audio.noise(27.83);
  if (res.LevelOver1_v1 == null) res.LevelOver1_v1 = audio.noise(27.83);
  if (res.LevelOver2_v1 == null) res.LevelOver2_v1 = audio.noise(27.83);
  if (res.LevelOver3_v1 == null) res.LevelOver3_v1 = audio.noise(27.83);
}
