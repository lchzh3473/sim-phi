import createCtx from './createCtx';
import { hex2rgba } from './hex2rgba';
export async function imgPainter(img: ImageBitmap, color: string, limit = 512): Promise<ImageBitmap> {
  const dataRGBA = hex2rgba(color);
  const ctx = createCtx(img.width, img.height, { willReadFrequently: true }); // Warning
  ctx.drawImage(img, 0, 0);
  for (let dy = 0; dy < img.height; dy += limit) {
    for (let dx = 0; dx < img.width; dx += limit) {
      const imgData = ctx.getImageData(dx, dy, limit, limit);
      for (let i = 0; i < imgData.data.length / 4; i++) {
        imgData.data[i * 4] = dataRGBA[0];
        imgData.data[i * 4 + 1] = dataRGBA[1];
        imgData.data[i * 4 + 2] = dataRGBA[2];
        imgData.data[i * 4 + 3] *= dataRGBA[3] / 255;
      }
      ctx.putImageData(imgData, dx, dy);
    }
  }
  return createImageBitmap(ctx.canvas);
}
