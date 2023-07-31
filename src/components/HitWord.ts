export class HitWord {
  public offsetX: number;
  public offsetY: number;
  public time: number;
  public duration: number;
  public color: string;
  public text: string;
  public constructor(offsetX: number, offsetY: number, n1: string, n2: string) {
    this.offsetX = offsetX || 0;
    this.offsetY = offsetY || 0;
    this.time = performance.now();
    this.duration = 250;
    this.color = n1;
    this.text = n2;
  }
  public static early(offsetX: number, offsetY: number): HitWord {
    // console.log('Tap', offsetX, offsetY);
    return new HitWord(offsetX, offsetY, '#03aaf9', 'Early');
  }
  public static late(offsetX: number, offsetY: number): HitWord {
    // console.log('Hold', offsetX, offsetY);
    return new HitWord(offsetX, offsetY, '#ff4612', 'Late');
  }
}
