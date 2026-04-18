import { useRef, useState } from 'react';
import { useCarouselStore } from '../store/carouselStore';
import { Upload, CheckCircle, Info } from 'lucide-react';

export default function CanvaImport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [imported, setImported] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const addSlide = useCarouselStore((s) => s.addSlide);
  const slides = useCarouselStore((s) => s.slides);
  const updateBg = useCarouselStore((s) => s.updateSlideBackground);
  const updateThumbnail = useCarouselStore((s) => s.updateSlideThumbnail);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!imageFiles.length) return;

    imageFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      // If we need a new slide, add it; otherwise use existing empty slot
      const emptySlide = slides.find((s) => !s.background.imageUrl && s.background.type !== 'image' && !s.canvasJson);
      if (emptySlide && slides.length === 1 && !emptySlide.thumbnail) {
        updateBg(emptySlide.id, { type: 'image', imageUrl: url });
        updateThumbnail(emptySlide.id, url);
      } else {
        addSlide();
        // We'll update the last slide after addSlide completes
        setTimeout(() => {
          const currentSlides = useCarouselStore.getState().slides;
          const last = currentSlides[currentSlides.length - 1];
          if (last) {
            updateBg(last.id, { type: 'image', imageUrl: url });
            updateThumbnail(last.id, url);
          }
        }, 50);
      }
      setImported((prev) => [...prev, file.name]);
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <Info size={14} className="text-indigo-400 mt-0.5 shrink-0" />
        <p className="text-indigo-300 text-xs leading-relaxed">
          Export your Canva design as PNG or JPG images, then upload them here to use as slide backgrounds.
        </p>
      </div>

      <div>
        <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Import from Canva</p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`w-full flex flex-col items-center gap-3 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragging
              ? 'border-indigo-500 bg-indigo-500/10 text-white'
              : 'border-white/20 hover:border-indigo-500/50 text-white/50 hover:text-white/80'
          }`}
        >
          <Upload size={28} />
          <div className="text-center">
            <p className="text-sm font-medium">Drop Canva exports here</p>
            <p className="text-xs text-white/40 mt-1">or click to browse</p>
          </div>
          <p className="text-xs text-white/30">PNG, JPG, WebP — multiple files OK</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {imported.length > 0 && (
        <div className="space-y-2">
          <p className="text-white/50 text-xs uppercase tracking-wider">Imported</p>
          {imported.map((name, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
              <CheckCircle size={14} className="text-emerald-400 shrink-0" />
              <span className="text-white/70 text-xs truncate">{name}</span>
            </div>
          ))}
        </div>
      )}

      <div className="p-3 rounded-xl bg-white/5 space-y-2">
        <p className="text-white/70 text-xs font-semibold">How to export from Canva:</p>
        <ol className="text-white/40 text-xs space-y-1 list-decimal list-inside">
          <li>Open your design in Canva</li>
          <li>Click Share → Download</li>
          <li>Choose PNG or JPG format</li>
          <li>Select "All pages" for multiple slides</li>
          <li>Upload the downloaded files here</li>
        </ol>
      </div>
    </div>
  );
}
