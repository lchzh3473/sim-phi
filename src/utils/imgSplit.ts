export async function imgSplit(img: ImageBitmap, limitX?: number, limitY?: number): Promise<ImageBitmap[]> {
  const dx = Math.floor(limitX ?? Math.min(img.width, img.height));
  const dy = Math.floor(limitY ?? dx);
  const arr = [];
  for (let sy = 0; sy < img.height; sy += dy) {
    for (let sx = 0; sx < img.width; sx += dx) {
      arr.push(createImageBitmap(img, sx, sy, dx, dy));
    }
  }
  return Promise.all(arr);
}
