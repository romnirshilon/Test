import { useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useCarouselStore } from '../store/carouselStore';
import type { BackgroundType } from '../types';
import { Upload, ImageIcon } from 'lucide-react';
import clsx from 'clsx';

const PRESET_GRADIENTS = [
  { stops: [{ color: '#6366f1', position: 0 }, { color: '#a855f7', position: 100 }], angle: 135 },
  { stops: [{ color: '#f43f5e', position: 0 }, { color: '#f97316', position: 100 }], angle: 135 },
  { stops: [{ color: '#06b6d4', position: 0 }, { color: '#3b82f6', position: 100 }], angle: 135 },
  { stops: [{ color: '#10b981', position: 0 }, { color: '#06b6d4', position: 100 }], angle: 135 },
  { stops: [{ color: '#f59e0b', position: 0 }, { color: '#ef4444', position: 100 }], angle: 135 },
  { stops: [{ color: '#8b5cf6', position: 0 }, { color: '#ec4899', position: 100 }], angle: 135 },
  { stops: [{ color: '#1e293b', position: 0 }, { color: '#334155', position: 100 }], angle: 135 },
  { stops: [{ color: '#0f172a', position: 0 }, { color: '#1e1b4b', position: 100 }], angle: 135 },
];

const PRESET_COLORS = [
  '#ffffff', '#000000', '#1e1e2e', '#0f172a',
  '#6366f1', '#a855f7', '#ec4899', '#f43f5e',
  '#f97316', '#f59e0b', '#10b981', '#06b6d4',
];

export default function BackgroundPanel() {
  const activeId = useCarouselStore((s) => s.activeSlideId);
  const slides = useCarouselStore((s) => s.slides);
  const updateBg = useCarouselStore((s) => s.updateSlideBackground);
  const fileRef = useRef<HTMLInputElement>(null);

  const slide = slides.find((s) => s.id === activeId);
  const bg = slide?.background;

  if (!slide || !bg) return null;

  const setType = (type: BackgroundType) => updateBg(slide.id, { type });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateBg(slide.id, { type: 'image', imageUrl: url });
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Type</p>
        <div className="grid grid-cols-3 gap-2">
          {(['solid', 'gradient', 'image'] as BackgroundType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={clsx(
                'py-2 rounded-lg text-xs font-medium capitalize transition-all border',
                bg.type === t
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {bg.type === 'solid' && (
        <div className="space-y-3">
          <p className="text-white/50 text-xs uppercase tracking-wider">Color</p>
          <HexColorPicker
            color={bg.color}
            onChange={(c) => updateBg(slide.id, { color: c })}
            style={{ width: '100%', height: 160 }}
          />
          <div className="grid grid-cols-6 gap-1.5 mt-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => updateBg(slide.id, { color: c })}
                className="w-full aspect-square rounded-md border-2 transition-all"
                style={{
                  backgroundColor: c,
                  borderColor: bg.color === c ? '#6366f1' : 'transparent',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {bg.type === 'gradient' && (
        <div className="space-y-3">
          <p className="text-white/50 text-xs uppercase tracking-wider">Presets</p>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_GRADIENTS.map((g, i) => (
              <button
                key={i}
                onClick={() => updateBg(slide.id, { gradient: g })}
                className="aspect-square rounded-lg border-2 border-white/10 hover:border-indigo-500 transition-all"
                style={{
                  background: `linear-gradient(${g.angle}deg, ${g.stops.map((s) => `${s.color} ${s.position}%`).join(', ')})`,
                }}
              />
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-white/50 text-xs uppercase tracking-wider">Start Color</p>
            <HexColorPicker
              color={bg.gradient.stops[0]?.color ?? '#6366f1'}
              onChange={(c) =>
                updateBg(slide.id, {
                  gradient: {
                    ...bg.gradient,
                    stops: bg.gradient.stops.map((s, i) => (i === 0 ? { ...s, color: c } : s)),
                  },
                })
              }
              style={{ width: '100%', height: 120 }}
            />
            <p className="text-white/50 text-xs uppercase tracking-wider mt-2">End Color</p>
            <HexColorPicker
              color={bg.gradient.stops[1]?.color ?? '#a855f7'}
              onChange={(c) =>
                updateBg(slide.id, {
                  gradient: {
                    ...bg.gradient,
                    stops: bg.gradient.stops.map((s, i) => (i === 1 ? { ...s, color: c } : s)),
                  },
                })
              }
              style={{ width: '100%', height: 120 }}
            />
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-white/50 text-xs uppercase tracking-wider">Angle</p>
                <span className="text-white text-xs">{bg.gradient.angle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={bg.gradient.angle}
                onChange={(e) =>
                  updateBg(slide.id, {
                    gradient: { ...bg.gradient, angle: Number(e.target.value) },
                  })
                }
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {bg.type === 'image' && (
        <div className="space-y-3">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed border-white/20 hover:border-indigo-500 text-white/50 hover:text-white transition-all"
          >
            <Upload size={24} />
            <span className="text-sm">Upload image</span>
          </button>
          {bg.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-white/10">
              <img src={bg.imageUrl} alt="Background" className="w-full object-cover max-h-40" />
            </div>
          )}
          <p className="text-white/30 text-xs flex items-center gap-1">
            <ImageIcon size={12} /> Supports JPG, PNG, WebP
          </p>
        </div>
      )}
    </div>
  );
}
