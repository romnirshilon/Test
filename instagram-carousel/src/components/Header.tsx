import { useState } from 'react';
import { useCarouselStore } from '../store/carouselStore';
import ExportModal from './ExportModal';
import { fabric } from 'fabric';
import { Download, Camera } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  canvases: Map<string, fabric.Canvas>;
}

const RATIOS = [
  { value: '1:1' as const, label: '1:1', sub: 'Square' },
  { value: '4:5' as const, label: '4:5', sub: 'Portrait' },
  { value: '9:16' as const, label: '9:16', sub: 'Story' },
];

export default function Header({ canvases }: Props) {
  const [showExport, setShowExport] = useState(false);
  const aspectRatio = useCarouselStore((s) => s.aspectRatio);
  const setAspectRatio = useCarouselStore((s) => s.setAspectRatio);
  const slides = useCarouselStore((s) => s.slides);

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3 bg-[#0d0d17] border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Camera size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-none">InstaCarousel</h1>
            <p className="text-white/40 text-xs mt-0.5">Instagram Carousel Creator</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
            {RATIOS.map(({ value, label, sub }) => (
              <button
                key={value}
                onClick={() => setAspectRatio(value)}
                className={clsx(
                  'flex flex-col items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  aspectRatio === value
                    ? 'bg-indigo-600 text-white'
                    : 'text-white/40 hover:text-white'
                )}
              >
                <span>{label}</span>
                <span className="text-[10px] opacity-70">{sub}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
          >
            <Download size={15} />
            Export ({slides.length})
          </button>
        </div>
      </header>

      {showExport && (
        <ExportModal canvases={canvases} onClose={() => setShowExport(false)} />
      )}
    </>
  );
}
