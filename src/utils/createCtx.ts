export default function(
  width: number, height: number,
  options?: CanvasRenderingContext2DSettings
): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  Object.assign(canvas, { width, height });
  const ctx = canvas.getContext('2d', options);
  if (!ctx) throw new TypeError('Failed to create canvas context');
  return ctx;
}
