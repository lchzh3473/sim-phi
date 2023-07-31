export class ScaledNote {
  public full: (ctx: CanvasRenderingContext2D) => void;
  public head: (ctx: CanvasRenderingContext2D) => void;
  public body: (ctx: CanvasRenderingContext2D, offset: number, length: number) => void;
  public tail: (ctx: CanvasRenderingContext2D, offset: number) => void;
  // private readonly img: ImageBitmap;
  // private readonly scale: number;
  public constructor(img: ImageBitmap, scale: number, compacted = false) {
    // this.img = img;
    // this.scale = scale;
    const dx = -img.width / 2 * scale;
    const dy = -img.height / 2 * scale;
    const dw = img.width * scale;
    const dh = img.height * scale;
    this.full = ctx => ctx.drawImage(img, dx, dy, dw, dh);
    this.head = ctx => ctx.drawImage(img, dx, 0, dw, dh);
    this.body = (ctx, offset, length) => ctx.drawImage(img, dx, offset, dw, length);
    this.tail = (ctx, offset) => ctx.drawImage(img, dx, offset - dh, dw, dh);
    if (compacted) {
      this.head = ctx => ctx.drawImage(img, dx, dy, dw, dh);
      this.tail = (ctx, offset) => ctx.drawImage(img, dx, offset - dh - dy, dw, dh);
    }
  }
}
