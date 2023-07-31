type HitType = 'keyboard' | 'mouse' | 'touch';
class HitEvent {
  public type: HitType;
  public id: number | string;
  public offsetX: number;
  public offsetY: number;
  public isActive: boolean;
  public isTapped: boolean;
  public isMoving: boolean;
  public lastDeltaX: number;
  public lastDeltaY: number;
  public nowDeltaX: number;
  public nowDeltaY: number;
  public deltaTime: number;
  public currentTime: number;
  public flicking: boolean;
  public flicked: boolean;
  public constructor(type: HitType, id: number | string, offsetX: number, offsetY: number) {
    this.type = type;
    this.id = id;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.isActive = true; // 是否标记为按下，若false则可以移除
    this.isTapped = false; // 是否触发过Tap判定
    this.isMoving = false; // 是否正在移动
    // flick(speed)
    this.lastDeltaX = 0;
    this.lastDeltaY = 0;
    this.nowDeltaX = 0;
    this.nowDeltaY = 0;
    this.deltaTime = 0; // 按下时间差
    this.currentTime = performance.now(); // 按下时间
    this.flicking = false; // 是否触发Flick判定
    this.flicked = false; // 是否触发过Flick判定
  }
  public move(offsetX: number, offsetY: number): void {
    this.lastDeltaX = this.nowDeltaX;
    this.lastDeltaY = this.nowDeltaY;
    this.nowDeltaX = offsetX - this.offsetX;
    this.nowDeltaY = offsetY - this.offsetY;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    const time = performance.now();
    this.deltaTime = time - this.currentTime;
    this.currentTime = time;
    this.isMoving = true;
    const flickSpeed = (this.nowDeltaX * this.lastDeltaX + this.nowDeltaY * this.lastDeltaY) / Math.sqrt(this.lastDeltaX ** 2 + this.lastDeltaY ** 2) / this.deltaTime;
    if (this.flicking && flickSpeed < 0.5) {
      this.flicking = false;
      this.flicked = false;
    } else if (!this.flicking && flickSpeed > 1.0) this.flicking = true;
  }
}
export class HitManager {
  public list: HitEvent[];
  public constructor() {
    this.list = [];
  }
  public activate(type: HitType, id: number | string, offsetX: number, offsetY: number): void {
    const { list } = this;
    const idx = list.findIndex(hit => hit.type === type && hit.id === id);
    if (idx !== -1) list.splice(idx, 1);
    list.push(new HitEvent(type, id, offsetX, offsetY));
  }
  public moving(type: HitType, id: number | string, offsetX: number, offsetY: number): void {
    const hitEl = this.list.find(hit => hit.type === type && hit.id === id);
    if (hitEl) hitEl.move(offsetX, offsetY);
  }
  public deactivate(type: HitType, id: number | string): void {
    const hitEl = this.list.find(hit => hit.type === type && hit.id === id);
    if (hitEl) hitEl.isActive = false;
  }
  public update(): void {
    const { list } = this;
    for (let i = 0; i < list.length; i++) {
      const hitEl = list[i];
      if (hitEl.isActive) {
        hitEl.isTapped = true;
        hitEl.isMoving = false;
      } else list.splice(i--, 1);
    }
  }
  public clear(type: HitType): void {
    for (const i of this.list) if (i.type === type) this.deactivate(type, i.id);
  }
}
export class JudgeEvent {
  public offsetX: number;
  public offsetY: number;
  public type: number;
  public judged: boolean;
  public event?: HitEvent;
  public preventBad: boolean;
  public constructor(offsetX: number, offsetY: number, type: number, event?: HitEvent) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.type = type | 0; // 1-Tap,2-Hold/Drag,3-Move
    this.judged = false; // 是否被判定
    this.event = event; // Flick专用回调
    this.preventBad = false; // 是否阻止判定为Bad
  }
}
