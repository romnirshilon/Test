import { useCarouselStore } from '../store/carouselStore';
import { Plus, Trash2, Copy } from 'lucide-react';
import clsx from 'clsx';

export default function SlidePanel() {
  const slides = useCarouselStore((s) => s.slides);
  const activeId = useCarouselStore((s) => s.activeSlideId);
  const addSlide = useCarouselStore((s) => s.addSlide);
  const removeSlide = useCarouselStore((s) => s.removeSlide);
  const duplicateSlide = useCarouselStore((s) => s.duplicateSlide);
  const setActiveSlide = useCarouselStore((s) => s.setActiveSlide);

  return (
    <div className="flex flex-col h-full bg-[#16161e] border-r border-white/10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">Slides</span>
        <button
          onClick={addSlide}
          className="w-7 h-7 flex items-center justify-center rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          title="Add slide"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto slide-thumb py-3 space-y-2 px-3">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={clsx(
              'group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all',
              slide.id === activeId
                ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
                : 'border-transparent hover:border-white/20'
            )}
            onClick={() => setActiveSlide(slide.id)}
          >
            <div className="aspect-square bg-[#1e1e2e] flex items-center justify-center">
              {slide.thumbnail ? (
                <img
                  src={slide.thumbnail}
                  alt={`Slide ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    background:
                      slide.background.type === 'solid'
                        ? slide.background.color
                        : slide.background.type === 'gradient'
                        ? `linear-gradient(${slide.background.gradient.angle}deg, ${slide.background.gradient.stops
                            .map((s) => `${s.color} ${s.position}%`)
                            .join(', ')})`
                        : '#1e1e2e',
                  }}
                />
              )}
            </div>
            <div className="absolute bottom-1 left-1 bg-black/60 rounded px-1.5 py-0.5 text-white text-[10px] font-semibold">
              {idx + 1}
            </div>

            <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); duplicateSlide(slide.id); }}
                className="w-5 h-5 flex items-center justify-center rounded bg-black/60 text-white hover:bg-indigo-600 transition-colors"
                title="Duplicate"
              >
                <Copy size={10} />
              </button>
              {slides.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeSlide(slide.id); }}
                  className="w-5 h-5 flex items-center justify-center rounded bg-black/60 text-white hover:bg-red-600 transition-colors"
                  title="Remove"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
