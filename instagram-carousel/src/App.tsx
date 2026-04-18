import { useState, useRef, useCallback, useEffect } from 'react';
import { fabric } from 'fabric';
import Header from './components/Header';
import SlidePanel from './components/SlidePanel';
import CanvasEditor from './components/CanvasEditor';
import Toolbar from './components/Toolbar';
import RightPanel from './components/RightPanel';
import { useCarouselStore } from './store/carouselStore';

const CANVAS_SIZES = {
  '1:1': { width: 1080, height: 1080 },
  '4:5': { width: 1080, height: 1350 },
  '9:16': { width: 1080, height: 1920 },
};

const DISPLAY_MAX_HEIGHT = 560;

export default function App() {
  const [activeCanvas, setActiveCanvas] = useState<fabric.Canvas | null>(null);
  const canvasesRef = useRef<Map<string, fabric.Canvas>>(new Map());

  const activeSlideId = useCarouselStore((s) => s.activeSlideId);
  const aspectRatio = useCarouselStore((s) => s.aspectRatio);

  const canvasSize = CANVAS_SIZES[aspectRatio];
  const scale = DISPLAY_MAX_HEIGHT / canvasSize.height;
  const displayWidth = Math.round(canvasSize.width * scale);
  const displayHeight = Math.round(canvasSize.height * scale);

  const handleCanvasReady = useCallback(
    (canvas: fabric.Canvas) => {
      if (activeSlideId) {
        canvasesRef.current.set(activeSlideId, canvas);
      }
      setActiveCanvas(canvas);
    },
    [activeSlideId]
  );

  useEffect(() => {
    if (!activeSlideId) return;
    const existing = canvasesRef.current.get(activeSlideId);
    if (existing) setActiveCanvas(existing);
  }, [activeSlideId]);

  return (
    <div className="flex flex-col h-screen bg-[#0f0f13] overflow-hidden">
      <Header canvases={canvasesRef.current} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Slides panel */}
        <div className="w-36 min-w-[9rem] flex-shrink-0 overflow-hidden">
          <SlidePanel />
        </div>

        {/* Center: Editor */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Toolbar canvas={activeCanvas} />
          <div className="flex-1 flex items-center justify-center overflow-auto bg-[#0f0f13] p-6">
            <div
              style={{
                width: displayWidth,
                height: displayHeight,
                position: 'relative',
              }}
            >
              {activeSlideId && (
                <CanvasEditor
                  key={`${activeSlideId}-${aspectRatio}`}
                  slideId={activeSlideId}
                  width={displayWidth}
                  height={displayHeight}
                  onCanvasReady={handleCanvasReady}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right: Properties panel */}
        <RightPanel />
      </div>
    </div>
  );
}
