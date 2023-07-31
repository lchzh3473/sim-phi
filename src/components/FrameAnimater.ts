export class FrameAnimater {
  private callback: (arg0: number) => void;
  private lastTime: number;
  private interval: number;
  private id: number | null;
  public constructor() {
    this.callback = (): void => {};
    this.lastTime = 0;
    this.interval = Number.EPSILON;
    this.id = null;
    this._animate = this._animate.bind(this);
  }
  public start(): void {
    if (this.id !== null) return;
    this.lastTime = performance.now();
    this.id = requestAnimationFrame(this._animate.bind(this));
  }
  public stop(): void {
    if (this.id === null) return;
    cancelAnimationFrame(this.id);
    this.id = null;
  }
  public setCallback(callback: (arg0: number) => void): void {
    if (typeof callback !== 'function') throw new TypeError('callback is not a function');
    this.callback = callback;
  }
  public setFrameRate(frameRate: number): void {
    this.interval = Math.abs(1e3 / frameRate);
    if (!isFinite(this.interval)) this.interval = Number.EPSILON;
  }
  private _animate() {
    this.id = requestAnimationFrame(this._animate.bind(this)); // 回调更新动画
    const nowTime = performance.now();
    const elapsed = nowTime - this.lastTime;
    if (elapsed > this.interval) {
      this.lastTime = nowTime - elapsed % this.interval;
      this.callback(nowTime);
    }
  }
}
