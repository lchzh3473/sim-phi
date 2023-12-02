import type { Renderer } from '@/core';
import type { ScaledNote } from './ScaledNote';
export class HitImage {
  public offsetX: number;
  public offsetY: number;
  public time: number;
  public duration: number;
  public effects: ScaledNote[];
  public direction: number[][];
  public color: string;
  public constructor(offsetX: number, offsetY: number, n1: string, n3: string) {
    const packs = hook.noteRender.hitFX[n1]; // TODO: Refactor
    this.offsetX = offsetX || 0;
    this.offsetY = offsetY || 0;
    this.time = performance.now();
    this.duration = packs.duration;
    this.effects = packs.effects;
    this.direction = Array(packs.numOfParts || 0).fill(0).map(() => [Math.random() * 80 + 185, Math.random() * 2 * Math.PI]);
    this.color = n3;
  }
  public static perfect(offsetX: number, offsetY: number, _note: Renderer.Note): HitImage {
    // console.log(note);
    return new HitImage(offsetX, offsetY, 'Perfect', '#ffeca0');
  }
  public static good(offsetX: number, offsetY: number, _note: Renderer.Note): HitImage {
    // console.log(note);
    return new HitImage(offsetX, offsetY, 'Good', '#b4e1ff');
  }
}
