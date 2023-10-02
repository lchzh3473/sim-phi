export class Stage {
  private aspectRatio: number;
  private isFull: boolean;
  private readonly stage: HTMLDivElement;
  public constructor(stage: HTMLDivElement) {
    this.aspectRatio = 0;
    this.isFull = false;
    this.stage = stage;
    this.resize();
  }
  public resize(ratio = 0): void {
    this.aspectRatio = ratio || this.aspectRatio || 16 / 9;
    const devicePixelRatio = self.devicePixelRatio || 1;
    const rawWidth = Math.min(854, document.body.getBoundingClientRect().width * 0.8);
    const width = Math.round(rawWidth * devicePixelRatio);
    const height = Math.ceil(width / this.aspectRatio); // 保证实际宽高比不大于理论值，防止出现黑边
    const stageWidth = width / devicePixelRatio;
    const stageHeight = height / devicePixelRatio;
    if (this.isFull) this.stage.style.cssText = ';position:fixed;top:0;left:0;bottom:0;right:0';
    else this.stage.style.cssText = `;width:${stageWidth.toFixed(3)}px;height:${stageHeight.toFixed(3)}px`;
  }
  public getFull(): boolean {
    return this.isFull;
  }
  public setFull(isFull: boolean): boolean {
    return this.isFull = isFull;
  }
}
