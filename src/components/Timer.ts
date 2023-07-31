export class Timer {
  private t0: number;
  private t1: number;
  private isPaused: boolean;
  public constructor() {
    this.t0 = 0;
    this.t1 = 0;
    this.isPaused = true;
  }
  public get time(): number {
    if (this.isPaused) return this.t0;
    return this.t0 + performance.now() - this.t1;
  }
  public get second(): number {
    return this.time / 1e3;
  }
  public play(): void {
    if (!this.isPaused) throw new Error('Time has been playing');
    this.t1 = performance.now();
    this.isPaused = false;
  }
  public pause(): void {
    if (this.isPaused) throw new Error('Time has been paused');
    this.t0 = this.time;
    this.isPaused = true;
  }
  public reset(): void {
    this.t0 = 0;
    this.t1 = 0;
    this.isPaused = true;
  }
  public addTime(num = 0): void {
    this.t0 += num;
  }
}
