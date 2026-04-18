import { useState } from 'react';
import { fabric } from 'fabric';
import { useCarouselStore } from '../store/carouselStore';
import { downloadSlideAsPng, downloadAllSlides } from '../utils/export';
import { X, Download, Loader2, Images, CheckCircle2, FileImage } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  onClose: () => void;
  canvases: Map<string, fabric.Canvas>;
}

type ExportFormat = 'zip' | 'individual';

export default function ExportModal({ onClose, canvases }: Props) {
  const slides = useCarouselStore((s) => s.slides);
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState(2);
  const [format, setFormat] = useState<ExportFormat>('zip');
  const [exportedSlides, setExportedSlides] = useState<Set<number>>(new Set());
  const projectName = 'instagram-carousel';

  // Export slides in strict slide order (slides array order = page order)
  const exportAll = async () => {
    setLoading(true);
    setExportedSlides(new Set());
    try {
      const urls: { url: string; name: string }[] = [];
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const canvas = canvases.get(slide.id);
        if (canvas) {
          const slideTitle = slide.generationData?.content.title
            ? slide.generationData.content.title.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 30)
            : '';
          const fileName = slideTitle
            ? `${String(i + 1).padStart(2, '0')}-${slideTitle}.png`
            : `${String(i + 1).padStart(2, '0')}-slide.png`;
          urls.push({ url: canvas.toDataURL({ format: 'png', multiplier: quality }), name: fileName });
          setExportedSlides((prev) => new Set([...prev, i]));
        }
      }
      await downloadAllSlides(
        urls.map((u) => u.url),
        projectName,
        urls.map((u) => u.name)
      );
    } finally {
      setLoading(false);
    }
  };

  const exportSingle = async (slideId: string, idx: number) => {
    const canvas = canvases.get(slideId);
    if (!canvas) return;
    const url = canvas.toDataURL({ format: 'png', multiplier: quality });
    const slide = slides[idx];
    const slideTitle = slide.generationData?.content.title
      ? slide.generationData.content.title.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 30)
      : 'slide';
    await downloadSlideAsPng(url, `${String(idx + 1).padStart(2, '0')}-${slideTitle}.png`);
  };

  const qualityLabels: Record<number, string> = { 1: '1080px — Standard', 2: '2160px — High', 3: '3240px — Ultra' };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#13131f] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <Download size={16} className="text-indigo-400" />
            Export Carousel
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors rounded-lg p-1 hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">

          {/* Slide order preview */}
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">
              Slide order — {slides.length} pages
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {slides.map((slide, i) => (
                <div key={slide.id} className="shrink-0 relative">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#1a1a2e] border border-white/10">
                    {slide.thumbnail
                      ? <img src={slide.thumbnail} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-indigo-900/40" />}
                  </div>
                  <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[9px] font-bold">
                    {i + 1}
                  </div>
                  {exportedSlides.has(i) && (
                    <div className="absolute inset-0 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-white/50 text-xs uppercase tracking-wider">Quality</p>
              <span className="text-indigo-300 text-xs font-medium">{qualityLabels[quality]}</span>
            </div>
            <input
              type="range" min={1} max={3} step={1} value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Format picker */}
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Export format</p>
            <div className="grid grid-cols-2 gap-2">
              {(['zip', 'individual'] as ExportFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={clsx(
                    'flex flex-col items-center gap-1 p-3 rounded-xl border transition-all',
                    format === f
                      ? 'border-indigo-500 bg-indigo-600/15 text-white'
                      : 'border-white/10 bg-white/5 text-white/50 hover:text-white'
                  )}
                >
                  {f === 'zip' ? <Images size={18} /> : <FileImage size={18} />}
                  <span className="text-xs font-medium">{f === 'zip' ? 'ZIP bundle' : 'Per slide'}</span>
                  <span className="text-[10px] opacity-60">{f === 'zip' ? 'All in one file' : 'Download each'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main export button */}
          {format === 'zip' && (
            <button
              onClick={exportAll}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
            >
              {loading
                ? <><Loader2 size={17} className="animate-spin" /> Packing {slides.length} slides...</>
                : <><Images size={17} /> Download ZIP ({slides.length} slides)</>}
            </button>
          )}

          {/* Per-slide buttons */}
          {format === 'individual' && (
            <div className="space-y-2">
              {slides.map((slide, i) => (
                <div key={slide.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#0f0f1a]">
                      {slide.thumbnail && <img src={slide.thumbnail} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-[9px] text-white font-bold">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-xs font-medium truncate">
                      {slide.generationData?.content.title || `Slide ${i + 1}`}
                    </p>
                    <p className="text-white/30 text-[10px] capitalize">
                      {slide.generationData?.content.type ?? 'custom'}
                    </p>
                  </div>
                  <button
                    onClick={() => exportSingle(slide.id, i)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-medium transition-all"
                  >
                    <Download size={11} /> PNG
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-white/25 text-xs text-center">
            Files named: 01-title.png, 02-title.png…
          </p>
        </div>
      </div>
    </div>
  );
}
