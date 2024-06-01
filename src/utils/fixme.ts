import createCtx from './createCtx';
import { audio } from '@/external';
export async function fixme(raw: Record<string, unknown>, res: Record<string, unknown>): Promise<void> {
  const entries = ['Tap', 'TapHL', 'Drag', 'DragHL', 'HoldHead', 'HoldHeadHL', 'Hold', 'HoldHL', 'HoldEnd', 'Flick', 'FlickHL', 'HitFXRaw'];
  if (raw.image == null) raw.image = {};
  const { image } = raw as { image: Record<string, string | null> };
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
    const _5x5colors = ['#fffb00', '#a937e7', '#ea61df', '#ff9e22', '#00a844', '#00e8de', '#e4e4e4'];
    const _5x5dots = [5232301, 4532785, 16267326, 18415150, 16301615, 31491134, 1088575];
    const ctx = createCtx(256, 1792);
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, i * 256, 256, 256);
      ctx.fillStyle = '#303030';
      ctx.fillRect(16, i * 256 + 16, 224, 224);
      ctx.fillStyle = _5x5colors[i];
      const dot = _5x5dots[i];
      const size = 32;
      const start = (256 - size * 5) / 2;
      for (let k = 0; k < 25; k++) {
        if (dot >> k & 1) {
          const x = start + k % 5 * size;
          const y = start + Math.floor(k / 5) * size + i * 256;
          ctx.fillRect(x, y, size, size);
        }
      }
    }
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
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0, 0, 1716, 325);
    ctx.fillStyle = '#989898';
    // ctx.fillRect(0, 90, 1716, 145);
    // ctx.fillStyle = '#4b4b4b';
    ctx.fillRect(0, 94, 1716, 137);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'right';
    ctx.font = 'bold 30px Custom';
    ctx.fillText('ACC:', 240, 172);
    ctx.fillText('Max combo:', 1420, 172);
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px Custom';
    ctx.fillText('Perfect', 788, 304);
    ctx.fillText('Good', 942, 304);
    ctx.fillText('Bad', 1096, 304);
    ctx.fillText('Miss', 1250, 304);
    res.LevelOver1 = await createImageBitmap(ctx.canvas);
  }
  if (res.LevelOver4 == null) {
    const ctx = createCtx(633, 122);
    const gradient = ctx.createLinearGradient(24, 0, 633, 0);
    gradient.addColorStop(0, 'rgba(0,0,0,0.78125)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(24, 24, 609, 72);
    res.LevelOver4 = await createImageBitmap(ctx.canvas);
  }
  if (res.LevelOver5 == null) {
    const ctx = createCtx(11, 43);
    ctx.fillStyle = '#fff';
    ctx.fillRect(3, 1, 7, 40);
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
