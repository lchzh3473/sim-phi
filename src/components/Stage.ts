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
    const stageWidth = Math.min(854, document.documentElement.clientWidth * 0.8);
    const stageHeight = stageWidth / this.aspectRatio;
    if (this.isFull) this.stage.style.cssText = ';position:fixed;top:0;left:0;bottom:0;right:0';
    else this.stage.style.cssText = `;width:${stageWidth.toFixed()}px;height:${stageHeight.toFixed()}px`;
  }
  public getFull(): boolean {
    return this.isFull;
  }
  public setFull(isFull: boolean): boolean {
    return this.isFull = isFull;
  }
}
