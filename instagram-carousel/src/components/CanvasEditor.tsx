import { useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import { useCarouselStore } from '../store/carouselStore';
import { applyTemplate } from '../utils/templateEngine';
import type { SlideBackground } from '../types';

interface Props {
  slideId: string;
  width: number;
  height: number;
  onCanvasReady?: (canvas: fabric.Canvas) => void;
}

function buildGradient(canvas: fabric.Canvas, bg: SlideBackground) {
  const w = canvas.getWidth();
  const h = canvas.getHeight();
  const rad = (bg.gradient.angle * Math.PI) / 180;
  const x1 = w / 2 - (Math.cos(rad) * w) / 2;
  const y1 = h / 2 - (Math.sin(rad) * h) / 2;
  const x2 = w / 2 + (Math.cos(rad) * w) / 2;
  const y2 = h / 2 + (Math.sin(rad) * h) / 2;
  return new fabric.Gradient({
    type: 'linear',
    coords: { x1, y1, x2, y2 },
    colorStops: bg.gradient.stops.map((s) => ({ offset: s.position / 100, color: s.color })),
  });
}

function applyBg(canvas: fabric.Canvas, bg: SlideBackground) {
  if (bg.type === 'solid') {
    canvas.setBackgroundColor(bg.color, () => canvas.renderAll());
    canvas.setBackgroundImage(null as unknown as fabric.Image, () => {});
  } else if (bg.type === 'gradient') {
    canvas.setBackgroundColor(buildGradient(canvas, bg) as unknown as string, () =>
      canvas.renderAll()
    );
    canvas.setBackgroundImage(null as unknown as fabric.Image, () => {});
  } else if (bg.type === 'image' && bg.imageUrl) {
    fabric.Image.fromURL(
      bg.imageUrl,
      (img: fabric.Image) => {
        img.scaleToWidth(canvas.getWidth());
        if ((img.getScaledHeight() ?? 0) < canvas.getHeight()) {
          img.scaleToHeight(canvas.getHeight());
        }
        img.set({ left: 0, top: 0, originX: 'left', originY: 'top' });
        canvas.setBackgroundColor('', () => {});
        canvas.setBackgroundImage(img, () => canvas.renderAll());
      },
      { crossOrigin: 'anonymous' }
    );
  }
}

export default function CanvasEditor({ slideId, width, height, onCanvasReady }: Props) {
  // React owns this div — Fabric.js owns the <canvas> it creates inside
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const slide = useCarouselStore((s) => s.slides.find((sl) => sl.id === slideId));
  const updateCanvas = useCarouselStore((s) => s.updateSlideCanvas);
  const updateThumbnail = useCarouselStore((s) => s.updateSlideThumbnail);

  const saveState = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON(['id']));
    updateCanvas(slideId, json);
    const thumb = canvas.toDataURL({ format: 'jpeg', quality: 0.4, multiplier: 0.25 });
    updateThumbnail(slideId, thumb);
  }, [slideId, updateCanvas, updateThumbnail]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create a raw <canvas> element — NOT managed by React — and hand it to Fabric
    const canvasEl = document.createElement('canvas');
    containerRef.current.appendChild(canvasEl);

    const canvas = new fabric.Canvas(canvasEl, {
      width,
      height,
      selection: true,
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;

    const afterSetup = () => {
      canvas.renderAll();
      onCanvasReady?.(canvas);
      setTimeout(saveState, 300);
    };

    if (slide?.generationData) {
      const { content, design, totalSlides } = slide.generationData;
      try {
        applyTemplate(canvas, content, design, totalSlides, width, height);
      } catch (err) {
        console.error('Template render error:', err);
      }
      afterSetup();
    } else if (slide?.canvasJson) {
      canvas.loadFromJSON(slide.canvasJson, () => {
        if (slide?.background) applyBg(canvas, slide.background);
        afterSetup();
      });
    } else {
      if (slide?.background) applyBg(canvas, slide.background);
      afterSetup();
    }

    canvas.on('object:modified', saveState);
    canvas.on('object:added', saveState);
    canvas.on('object:removed', saveState);

    return () => {
      canvas.off('object:modified', saveState);
      canvas.off('object:added', saveState);
      canvas.off('object:removed', saveState);
      // dispose() removes Fabric's wrapper from containerRef — React keeps its div
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideId, width, height]);

  // React to live background changes
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !slide?.background || slide.generationData) return;
    applyBg(canvas, slide.background);
    setTimeout(saveState, 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide?.background]);

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        borderRadius: '8px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}
    />
  );
}
