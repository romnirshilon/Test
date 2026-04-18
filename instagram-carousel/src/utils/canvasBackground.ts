import type { fabric } from 'fabric';
import type { SlideBackground } from '../types';

export function applyBackground(canvas: fabric.Canvas, bg: SlideBackground) {
  const width = canvas.getWidth();
  const height = canvas.getHeight();

  if (bg.type === 'solid') {
    canvas.setBackgroundColor(bg.color, () => canvas.renderAll());
    canvas.setBackgroundImage(undefined as unknown as fabric.Image, () => canvas.renderAll());
  } else if (bg.type === 'gradient') {
    const { stops, angle } = bg.gradient;
    const rad = (angle * Math.PI) / 180;
    const x1 = width / 2 - (Math.cos(rad) * width) / 2;
    const y1 = height / 2 - (Math.sin(rad) * height) / 2;
    const x2 = width / 2 + (Math.cos(rad) * width) / 2;
    const y2 = height / 2 + (Math.sin(rad) * height) / 2;

    const gradient = new (window as unknown as { fabric: typeof import('fabric').fabric }).fabric.Gradient({
      type: 'linear',
      coords: { x1, y1, x2, y2 },
      colorStops: stops.map((s) => ({ offset: s.position / 100, color: s.color })),
    });

    canvas.setBackgroundColor(gradient as unknown as string, () => canvas.renderAll());
    canvas.setBackgroundImage(undefined as unknown as fabric.Image, () => canvas.renderAll());
  } else if (bg.type === 'image' && bg.imageUrl) {
    (window as unknown as { fabric: typeof import('fabric').fabric }).fabric.Image.fromURL(
      bg.imageUrl,
      (img: fabric.Image) => {
        img.scaleToWidth(width);
        if ((img.getScaledHeight() ?? 0) < height) {
          img.scaleToHeight(height);
        }
        img.set({ left: 0, top: 0, originX: 'left', originY: 'top' });
        canvas.setBackgroundImage(img, () => canvas.renderAll());
      },
      { crossOrigin: 'anonymous' }
    );
  }
}
