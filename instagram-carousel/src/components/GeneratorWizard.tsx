import { useState, useCallback } from 'react';
import { useCarouselStore } from '../store/carouselStore';
import type {
  SlidePageContent, SlideType, DesignConfig,
  DesignStyle, PaletteKey, FontPairKey, GenerationData,
} from '../types';
import {
  Sparkles, Plus, Trash2, ChevronUp, ChevronDown,
  Type, Quote, List, Megaphone, Layout,
  ArrowRight, ArrowLeft, Zap,
} from 'lucide-react';
import clsx from 'clsx';

// ─── Slide type meta ──────────────────────────────────────────────────────────
const SLIDE_TYPES: { value: SlideType; label: string; icon: React.ReactNode; hint: string }[] = [
  { value: 'cover',   label: 'Cover',   icon: <Layout size={14} />,    hint: 'Title + subtitle' },
  { value: 'content', label: 'Content', icon: <Type size={14} />,      hint: 'Title + body text' },
  { value: 'quote',   label: 'Quote',   icon: <Quote size={14} />,     hint: 'Quote + attribution' },
  { value: 'list',    label: 'List',    icon: <List size={14} />,      hint: 'Title + bullet list' },
  { value: 'cta',     label: 'CTA',     icon: <Megaphone size={14} />, hint: 'Call to action' },
];

// ─── Design styles ────────────────────────────────────────────────────────────
const STYLES: { value: DesignStyle; label: string; desc: string; preview: string }[] = [
  { value: 'modern',   label: 'Modern',   desc: 'Clean & professional', preview: 'from-indigo-900 to-violet-700' },
  { value: 'bold',     label: 'Bold',     desc: 'Big impact typography', preview: 'from-slate-900 to-slate-700' },
  { value: 'minimal',  label: 'Minimal',  desc: 'White & refined',      preview: 'from-gray-100 to-gray-200' },
  { value: 'elegant',  label: 'Elegant',  desc: 'Classic & ornate',     preview: 'from-amber-950 to-amber-700' },
  { value: 'vibrant',  label: 'Vibrant',  desc: 'Colorful & dynamic',   preview: 'from-fuchsia-900 to-pink-600' },
];

// ─── Palettes ─────────────────────────────────────────────────────────────────
const PALETTES: { value: PaletteKey; label: string; from: string; to: string }[] = [
  { value: 'purple',   label: 'Purple',   from: '#1a0533', to: '#5b21b6' },
  { value: 'ocean',    label: 'Ocean',    from: '#0c1a4d', to: '#1d4ed8' },
  { value: 'sunset',   label: 'Sunset',   from: '#431407', to: '#c2410c' },
  { value: 'forest',   label: 'Forest',   from: '#052e16', to: '#15803d' },
  { value: 'rose',     label: 'Rose',     from: '#4c0519', to: '#be185d' },
  { value: 'mono',     label: 'Mono',     from: '#09090b', to: '#27272a' },
  { value: 'coral',    label: 'Coral',    from: '#1c0a00', to: '#9f1239' },
  { value: 'midnight', label: 'Midnight', from: '#020617', to: '#1e3a5f' },
];

// ─── Font pairs ───────────────────────────────────────────────────────────────
const FONTS: { value: FontPairKey; label: string; desc: string }[] = [
  { value: 'inter',   label: 'Inter',   desc: 'Clean sans-serif' },
  { value: 'serif',   label: 'Georgia', desc: 'Classic serif' },
  { value: 'display', label: 'Black',   desc: 'Heavy impact' },
  { value: 'mono',    label: 'Courier', desc: 'Code & technical' },
];

// ─── Empty slide factory ──────────────────────────────────────────────────────
function emptySlide(type: SlideType = 'content'): SlidePageContent {
  return { type, title: '', subtitle: '', body: '', items: ['', ''] };
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className={clsx(
      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
      done ? 'bg-emerald-500 text-white' :
      active ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' :
      'bg-white/10 text-white/30'
    )}>
      {done ? '✓' : n}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function GeneratorWizard() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [pages, setPages] = useState<SlidePageContent[]>([
    { type: 'cover',   title: '', subtitle: '' },
    { type: 'content', title: '', body: '' },
  ]);
  const [design, setDesign] = useState<DesignConfig>({
    style: 'modern',
    palette: 'purple',
    fontPair: 'inter',
  });
  const [generating, setGenerating] = useState(false);

  const store = useCarouselStore();

  // ── Page editors ─────────────────────────────────────────────────────────────
  const updatePage = useCallback((idx: number, patch: Partial<SlidePageContent>) => {
    setPages((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }, []);

  const addPage = () =>
    setPages((p) => [...p, emptySlide(p.length === 0 ? 'cover' : 'content')]);

  const removePage = (idx: number) =>
    setPages((p) => p.filter((_, i) => i !== idx));

  const movePage = (idx: number, dir: -1 | 1) => {
    setPages((p) => {
      const arr = [...p];
      const to = idx + dir;
      if (to < 0 || to >= arr.length) return arr;
      [arr[idx], arr[to]] = [arr[to], arr[idx]];
      return arr;
    });
  };

  // ── Generate ─────────────────────────────────────────────────────────────────
  const generate = async () => {
    setGenerating(true);

    const validPages = pages.filter((p) => p.title.trim());
    if (!validPages.length) { setGenerating(false); return; }

    // Build new slides with generationData — CanvasEditor will render them
    const newSlides = validPages.map((content, i) => ({
      id: crypto.randomUUID(),
      background: {
        type: 'gradient' as const,
        color: '#6366f1',
        gradient: { stops: [{ color: '#1a0533', position: 0 }, { color: '#5b21b6', position: 100 }], angle: 135 },
        imageUrl: null,
      },
      canvasJson: null,
      thumbnail: null,
      generationData: {
        content: { ...content, pageNumber: i },
        design,
        totalSlides: validPages.length,
      } as GenerationData,
    }));

    store.setSlides(newSlides);
    setGenerating(false);
    setStep(0);
  };

  // ── UI ────────────────────────────────────────────────────────────────────────
  const validPageCount = pages.filter((p) => p.title.trim()).length;

  return (
    <div className="space-y-4">
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {([0, 1, 2] as const).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button onClick={() => setStep(s)}>
              <StepDot n={s + 1} active={step === s} done={step > s} />
            </button>
            {s < 2 && <div className="flex-1 h-px w-6 bg-white/15" />}
          </div>
        ))}
        <span className="text-white/40 text-xs ml-2">
          {step === 0 ? 'Slides content' : step === 1 ? 'Design' : 'Generate'}
        </span>
      </div>

      {/* ── Step 0: Content ───────────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-3">
          <p className="text-white/50 text-xs">Add your slide texts. Each slide is one page in the carousel.</p>

          {pages.map((page, idx) => (
            <div key={idx} className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-2">
              {/* Header row */}
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-600/40 flex items-center justify-center text-[10px] text-indigo-300 font-bold shrink-0">
                  {idx + 1}
                </span>

                <select
                  value={page.type}
                  onChange={(e) => updatePage(idx, { type: e.target.value as SlideType })}
                  className="flex-1 bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-white text-xs"
                >
                  {SLIDE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label} — {t.hint}</option>
                  ))}
                </select>

                <div className="flex gap-1">
                  <button onClick={() => movePage(idx, -1)} disabled={idx === 0}
                    className="w-5 h-5 flex items-center justify-center rounded bg-white/5 hover:bg-white/15 text-white/40 hover:text-white disabled:opacity-20 transition-all">
                    <ChevronUp size={10} />
                  </button>
                  <button onClick={() => movePage(idx, 1)} disabled={idx === pages.length - 1}
                    className="w-5 h-5 flex items-center justify-center rounded bg-white/5 hover:bg-white/15 text-white/40 hover:text-white disabled:opacity-20 transition-all">
                    <ChevronDown size={10} />
                  </button>
                  <button onClick={() => removePage(idx)} disabled={pages.length <= 1}
                    className="w-5 h-5 flex items-center justify-center rounded bg-white/5 hover:bg-red-600/40 text-white/40 hover:text-red-400 disabled:opacity-20 transition-all">
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>

              {/* Title */}
              <input
                value={page.title}
                onChange={(e) => updatePage(idx, { title: e.target.value })}
                placeholder={
                  page.type === 'cover' ? 'Main title...' :
                  page.type === 'quote' ? 'Quote text...' :
                  'Slide title...'
                }
                className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
              />

              {/* Subtitle / author */}
              {(page.type === 'cover' || page.type === 'quote' || page.type === 'cta') && (
                <input
                  value={page.subtitle ?? ''}
                  onChange={(e) => updatePage(idx, { subtitle: e.target.value })}
                  placeholder={
                    page.type === 'quote' ? '— Author name...' :
                    page.type === 'cta' ? 'Button text...' :
                    'Subtitle or tagline...'
                  }
                  className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white/70 text-xs placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              )}

              {/* Body */}
              {(page.type === 'content' || page.type === 'cta') && (
                <textarea
                  value={page.body ?? ''}
                  onChange={(e) => updatePage(idx, { body: e.target.value })}
                  placeholder="Body text..."
                  rows={3}
                  className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white/70 text-xs placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              )}

              {/* List items */}
              {page.type === 'list' && (
                <div className="space-y-1.5">
                  {(page.items ?? []).map((item, ii) => (
                    <div key={ii} className="flex items-center gap-2">
                      <span className="text-indigo-400 text-xs shrink-0">•</span>
                      <input
                        value={item}
                        onChange={(e) => {
                          const items = [...(page.items ?? [])];
                          items[ii] = e.target.value;
                          updatePage(idx, { items });
                        }}
                        placeholder={`Item ${ii + 1}...`}
                        className="flex-1 bg-transparent border border-white/10 rounded-lg px-2 py-1.5 text-white/70 text-xs placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      <button
                        onClick={() => updatePage(idx, { items: (page.items ?? []).filter((_, j) => j !== ii) })}
                        className="text-white/20 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updatePage(idx, { items: [...(page.items ?? []), ''] })}
                    className="flex items-center gap-1.5 text-indigo-400 text-xs hover:text-indigo-300 transition-colors"
                  >
                    <Plus size={11} /> Add item
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addPage}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/20 hover:border-indigo-500/60 text-white/40 hover:text-white text-xs transition-all"
          >
            <Plus size={13} /> Add slide
          </button>

          <button
            onClick={() => setStep(1)}
            disabled={validPageCount === 0}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all disabled:opacity-40"
          >
            Design <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── Step 1: Design ────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-5">
          {/* Style */}
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Style</p>
            <div className="space-y-2">
              {STYLES.map(({ value, label, desc, preview }) => (
                <button
                  key={value}
                  onClick={() => setDesign((d) => ({ ...d, style: value }))}
                  className={clsx(
                    'w-full flex items-center gap-3 p-3 rounded-xl border transition-all',
                    design.style === value
                      ? 'border-indigo-500 bg-indigo-600/15'
                      : 'border-white/10 bg-white/5 hover:bg-white/8'
                  )}
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${preview} shrink-0`} />
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">{label}</p>
                    <p className="text-white/40 text-xs">{desc}</p>
                  </div>
                  {design.style === value && (
                    <span className="ml-auto text-indigo-400 text-xs font-semibold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Palette */}
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Color palette</p>
            <div className="grid grid-cols-4 gap-2">
              {PALETTES.map(({ value, label, from, to }) => (
                <button
                  key={value}
                  onClick={() => setDesign((d) => ({ ...d, palette: value }))}
                  title={label}
                  className={clsx(
                    'aspect-square rounded-xl border-2 transition-all',
                    design.palette === value ? 'border-white scale-110' : 'border-transparent hover:border-white/40'
                  )}
                  style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                />
              ))}
            </div>
          </div>

          {/* Font */}
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Font</p>
            <div className="grid grid-cols-2 gap-2">
              {FONTS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setDesign((d) => ({ ...d, fontPair: value }))}
                  className={clsx(
                    'p-3 rounded-xl border transition-all text-left',
                    design.fontPair === value
                      ? 'border-indigo-500 bg-indigo-600/15'
                      : 'border-white/10 bg-white/5 hover:bg-white/8'
                  )}
                >
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-white/40 text-[10px]">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(0)} className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 text-sm transition-all">
              <ArrowLeft size={14} /> Back
            </button>
            <button onClick={() => setStep(2)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all">
              Preview <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Generate ──────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
            <p className="text-white/60 text-xs uppercase tracking-wider">Summary</p>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${STYLES.find(s => s.value === design.style)?.preview} shrink-0`} />
              <div>
                <p className="text-white text-sm font-semibold capitalize">{design.style} · {PALETTES.find(p => p.value === design.palette)?.label}</p>
                <p className="text-white/40 text-xs">{FONTS.find(f => f.value === design.fontPair)?.label} font · {validPageCount} slides</p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3 space-y-1.5">
              {pages.filter(p => p.title.trim()).map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-indigo-600/30 flex items-center justify-center text-[10px] text-indigo-300 font-bold shrink-0">{i + 1}</span>
                  <span className="text-white/70 text-xs truncate">{p.title}</span>
                  <span className="ml-auto text-white/30 text-[10px] capitalize">{p.type}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 text-sm transition-all">
              <ArrowLeft size={14} /> Back
            </button>
            <button
              onClick={generate}
              disabled={generating || validPageCount === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
            >
              {generating ? (
                <><Sparkles size={15} className="animate-spin" /> Generating...</>
              ) : (
                <><Zap size={15} /> Generate {validPageCount} slides</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
