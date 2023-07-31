export class HitFeedback {
  public offsetX: number;
  public offsetY: number;
  public color: string;
  public text: string;
  public time: number;
  public constructor(offsetX: number, offsetY: number, n1: string, n2: string) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.color = n1;
    this.text = n2;
    this.time = 0;
  }
  public static tap(offsetX: number, offsetY: number): HitFeedback {
    // console.log('Tap', offsetX, offsetY);
    return new HitFeedback(offsetX, offsetY, 'cyan', '');
  }
  public static hold(offsetX: number, offsetY: number): HitFeedback {
    // console.log('Hold', offsetX, offsetY);
    return new HitFeedback(offsetX, offsetY, 'lime', '');
  }
  public static move(offsetX: number, offsetY: number): HitFeedback {
    // console.log('Move', offsetX, offsetY);
    return new HitFeedback(offsetX, offsetY, 'violet', '');
  }
}
