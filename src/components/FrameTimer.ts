export class FrameTimer {
  private tick: number;
  private time: number;
  private fps: number;
  public constructor() {
    this.tick = 0;
    this.time = performance.now();
    this.fps = 0;
  }
  public get fpsStr(): string {
    const { fps } = this;
    if (fps < 10) return fps.toPrecision(2);
    return fps.toFixed(0);
  }
  public get disp(): number {
    return 0.5 / this.fps || 0;
  }
  public addTick(fr = 10): number {
    if (++this.tick >= fr) {
      this.tick = 0;
      this.fps = 1e3 * fr / (-this.time + (this.time = performance.now()));
    }
    return this.fps;
  }
}
