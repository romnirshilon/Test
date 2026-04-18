import { useState } from 'react';
import { fabric } from 'fabric';
import { useCarouselStore } from '../store/carouselStore';
import { downloadSlideAsPng, downloadAllSlides } from '../utils/export';
import { X, Download, Loader2, Images } from 'lucide-react';

interface Props {
  onClose: () => void;
  canvases: Map<string, fabric.Canvas>;
}

export default function ExportModal({ onClose, canvases }: Props) {
  const slides = useCarouselStore((s) => s.slides);
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState(2);

  const exportAll = async () => {
    setLoading(true);
    try {
      const urls: string[] = [];
      for (const slide of slides) {
        const canvas = canvases.get(slide.id);
        if (canvas) {
          const url = canvas.toDataURL({ format: 'png', multiplier: quality });
          urls.push(url);
        }
      }
      await downloadAllSlides(urls, 'instagram-carousel');
    } finally {
      setLoading(false);
    }
  };

  const exportSingle = async (slideId: string, idx: number) => {
    const canvas = canvases.get(slideId);
    if (!canvas) return;
    const url = canvas.toDataURL({ format: 'png', multiplier: quality });
    await downloadSlideAsPng(url, `slide-${idx + 1}.png`);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <Download size={18} className="text-indigo-400" />
            Export Carousel
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm">Export quality</p>
              <span className="text-white text-sm font-medium">{quality}x ({quality === 1 ? '1080px' : quality === 2 ? '2160px' : '3240px'})</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={1}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-white/30 text-xs mt-1">
              <span>Standard</span>
              <span>High</span>
              <span>Ultra</span>
            </div>
          </div>

          <button
            onClick={exportAll}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Images size={18} />}
            {loading ? 'Exporting...' : `Export all ${slides.length} slides as ZIP`}
          </button>

          <div className="space-y-2">
            <p className="text-white/40 text-xs uppercase tracking-wider">Or export individual slides</p>
            {slides.map((slide, i) => (
              <div key={slide.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-all">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#0f0f1a] shrink-0">
                  {slide.thumbnail && <img src={slide.thumbnail} alt="" className="w-full h-full object-cover" />}
                </div>
                <span className="text-white/70 text-sm flex-1">Slide {i + 1}</span>
                <button
                  onClick={() => exportSingle(slide.id, i)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-indigo-600 text-white/70 hover:text-white text-xs transition-all"
                >
                  <Download size={12} />
                  PNG
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
