import { useState, useMemo, useCallback } from 'react';
import { useCarouselStore } from '../store/carouselStore';
import type {
  SlidePageContent, SlideType, DesignConfig,
  DesignStyle, PaletteKey, FontPairKey, GenerationData,
} from '../types';
import {
  Sparkles, ArrowRight, ArrowLeft, Zap,
  Layout, Type, Quote, List, Megaphone, ChevronDown, ChevronUp,
} from 'lucide-react';
import clsx from 'clsx';

// ─── Design options ───────────────────────────────────────────────────────────
const STYLES: { value: DesignStyle; label: string; desc: string; preview: string }[] = [
  { value: 'modern',   label: 'Modern',   desc: 'Clean & professional', preview: 'from-indigo-900 to-violet-700' },
  { value: 'bold',     label: 'Bold',     desc: 'Big impact typography', preview: 'from-slate-900 to-slate-700' },
  { value: 'minimal',  label: 'Minimal',  desc: 'White & refined',       preview: 'from-gray-100 to-gray-200' },
  { value: 'elegant',  label: 'Elegant',  desc: 'Classic & ornate',      preview: 'from-amber-950 to-amber-700' },
  { value: 'vibrant',  label: 'Vibrant',  desc: 'Colorful & dynamic',    preview: 'from-fuchsia-900 to-pink-600' },
];

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

const FONTS: { value: FontPairKey; label: string; desc: string }[] = [
  { value: 'inter',   label: 'Inter',   desc: 'Clean sans-serif' },
  { value: 'serif',   label: 'Georgia', desc: 'Classic serif' },
  { value: 'display', label: 'Black',   desc: 'Heavy impact' },
  { value: 'mono',    label: 'Courier', desc: 'Code & technical' },
];

// ─── Slide type icon ──────────────────────────────────────────────────────────
const TYPE_ICON: Record<SlideType, React.ReactNode> = {
  cover:   <Layout   size={10} />,
  content: <Type     size={10} />,
  quote:   <Quote    size={10} />,
  list:    <List     size={10} />,
  cta:     <Megaphone size={10} />,
};

const TYPE_COLOR: Record<SlideType, string> = {
  cover:   'bg-indigo-600/30 text-indigo-300',
  content: 'bg-blue-600/30 text-blue-300',
  quote:   'bg-amber-600/30 text-amber-300',
  list:    'bg-emerald-600/30 text-emerald-300',
  cta:     'bg-rose-600/30 text-rose-300',
};

// ─── Smart text parser ────────────────────────────────────────────────────────
function parseText(raw: string): SlidePageContent[] {
  // Split on blank lines (one or more)
  const blocks = raw.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length === 0) return [];

  const slides: SlidePageContent[] = [];

  blocks.forEach((block, idx) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const firstLine = lines[0];

    // CTA: last block or starts with CTA:/CTA keywords
    const isLastBlock = idx === blocks.length - 1;
    const ctaKeywords = /^(cta:|follow|save|share|dm us|click|subscribe|join|grab|get|sign up|link in bio)/i;
    if (isLastBlock && blocks.length > 1 && (ctaKeywords.test(firstLine) || lines.length <= 2)) {
      const title = firstLine.replace(/^cta:\s*/i, '');
      const subtitle = lines[1] ?? '';
      slides.push({ type: 'cta', title, subtitle });
      return;
    }

    // Quote: block is wrapped in quotes or starts with > or "
    const quoteMatch = block.match(/^[">](.+?)["<]?\s*[-–—]\s*(.+)$/s);
    const simpleQuote = /^[">"]/.test(firstLine) && lines.length <= 3;
    if (quoteMatch) {
      slides.push({
        type: 'quote',
        title: quoteMatch[1].replace(/^[">\s]+/, '').replace(/[">\s]+$/, '').trim(),
        subtitle: quoteMatch[2].trim(),
      });
      return;
    }
    if (simpleQuote) {
      const cleaned = lines.map((l) => l.replace(/^[">"\s]+/, '').replace(/[">\s]+$/, '').trim());
      slides.push({ type: 'quote', title: cleaned[0], subtitle: cleaned[1] ?? '' });
      return;
    }

    // List: 3+ bullet lines
    const bulletLines = lines.filter((l) => /^[-•*]\s/.test(l));
    if (bulletLines.length >= 2) {
      const titleLine = lines.find((l) => !/^[-•*]\s/.test(l));
      const items = bulletLines.map((l) => l.replace(/^[-•*]\s+/, '').trim());
      slides.push({ type: 'list', title: titleLine ?? items[0], items: titleLine ? items : items.slice(1) });
      return;
    }

    // Cover: first block with short content
    if (idx === 0 && lines.length <= 3) {
      slides.push({ type: 'cover', title: firstLine, subtitle: lines.slice(1).join(' ') });
      return;
    }

    // Content: default — first line is title, rest is body
    const title = firstLine.replace(/^#+\s*/, ''); // strip markdown headings
    const body = lines.slice(1).join(' ');
    slides.push({ type: 'content', title, body });
  });

  return slides;
}

// ─── Format hint ─────────────────────────────────────────────────────────────
const FORMAT_HINT = `שם הקרוסלה
כותרת משנה (אופציונלי)

כותרת תוכן 1
טקסט הסבר של השקף הזה, משפט או שניים.

כותרת תוכן 2
טקסט של השקף השני.

כותרת רשימה
- נקודה ראשונה
- נקודה שנייה
- נקודה שלישית

> "ציטוט מעורר השראה" — שם המחבר

עקבו אחרינו לעוד תוכן`;

// ─── Step dot ─────────────────────────────────────────────────────────────────
function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className={clsx(
      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
      done   ? 'bg-emerald-500 text-white' :
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
  const [rawText, setRawText] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [design, setDesign] = useState<DesignConfig>({ style: 'modern', palette: 'purple', fontPair: 'inter' });
  const [generating, setGenerating] = useState(false);

  const store = useCarouselStore();

  const parsedSlides = useMemo(() => parseText(rawText), [rawText]);

  const generate = useCallback(async () => {
    if (parsedSlides.length === 0) return;
    setGenerating(true);
    const newSlides = parsedSlides.map((content, i) => ({
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
        totalSlides: parsedSlides.length,
      } as GenerationData,
    }));
    store.setSlides(newSlides);
    setGenerating(false);
    setStep(0);
    setRawText('');
  }, [parsedSlides, design, store]);

  const canContinue = parsedSlides.length > 0;

  return (
    <div className="space-y-4">
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {([0, 1, 2] as const).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button onClick={() => canContinue && setStep(s)}>
              <StepDot n={s + 1} active={step === s} done={step > s} />
            </button>
            {s < 2 && <div className="h-px w-6 bg-white/15" />}
          </div>
        ))}
        <span className="text-white/40 text-xs ml-2">
          {step === 0 ? 'טקסט' : step === 1 ? 'עיצוב' : 'יצירה'}
        </span>
      </div>

      {/* ── Step 0: Text input ──────────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-3">
          {/* Hint toggle */}
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 text-indigo-400 text-xs hover:text-indigo-300 transition-colors"
          >
            {showHint ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            איך לפרמט את הטקסט?
          </button>

          {showHint && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <p className="text-white/50 text-[10px] uppercase tracking-wider mb-2">פורמט הטקסט</p>
              <pre className="text-white/40 text-[10px] leading-relaxed whitespace-pre-wrap font-mono">{FORMAT_HINT}</pre>
              <div className="mt-2 grid grid-cols-2 gap-1">
                {[
                  { icon: <Layout size={9}/>,    label: 'שקף פתיחה',  desc: 'בלוק ראשון קצר' },
                  { icon: <Type size={9}/>,      label: 'תוכן',       desc: 'כותרת + טקסט' },
                  { icon: <List size={9}/>,      label: 'רשימה',      desc: '2+ שורות עם -' },
                  { icon: <Quote size={9}/>,     label: 'ציטוט',      desc: 'שורה עם > או "' },
                  { icon: <Megaphone size={9}/>, label: 'CTA',        desc: 'הבלוק האחרון' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-white/30">{r.icon}</span>
                    <div>
                      <p className="text-white/60 text-[10px] font-medium">{r.label}</p>
                      <p className="text-white/25 text-[9px]">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main textarea */}
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`כותרת הקרוסלה\nכותרת משנה\n\nכותרת שקף 1\nטקסט של השקף...`}
            rows={12}
            dir="auto"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs placeholder-white/20 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed font-mono"
          />

          {/* Live preview of detected slides */}
          {parsedSlides.length > 0 && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-2">
              <p className="text-white/40 text-[10px] uppercase tracking-wider">
                זוהו {parsedSlides.length} שקפים
              </p>
              <div className="space-y-1.5">
                {parsedSlides.map((slide, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={clsx(
                      'flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium shrink-0',
                      TYPE_COLOR[slide.type]
                    )}>
                      {TYPE_ICON[slide.type]}
                      <span className="capitalize">{slide.type}</span>
                    </span>
                    <span className="text-white/60 text-[11px] truncate">{slide.title}</span>
                    <span className="shrink-0 text-white/20 text-[9px] ml-auto">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setStep(1)}
            disabled={!canContinue}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all disabled:opacity-40"
          >
            בחר עיצוב <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── Step 1: Design ──────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-5">
          {/* Style */}
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">סגנון</p>
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
                  {design.style === value && <span className="ml-auto text-indigo-400 text-xs font-semibold">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Palette */}
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">צבעים</p>
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
            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">פונט</p>
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
              <ArrowLeft size={14} /> חזור
            </button>
            <button onClick={() => setStep(2)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all">
              סיכום <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Preview & generate ──────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
            <p className="text-white/60 text-xs uppercase tracking-wider">סיכום</p>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${STYLES.find(s => s.value === design.style)?.preview} shrink-0`} />
              <div>
                <p className="text-white text-sm font-semibold capitalize">
                  {design.style} · {PALETTES.find(p => p.value === design.palette)?.label}
                </p>
                <p className="text-white/40 text-xs">
                  {FONTS.find(f => f.value === design.fontPair)?.label} · {parsedSlides.length} שקפים
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3 space-y-1.5">
              {parsedSlides.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={clsx(
                    'flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium shrink-0',
                    TYPE_COLOR[s.type]
                  )}>
                    {TYPE_ICON[s.type]}
                    <span className="capitalize">{s.type}</span>
                  </span>
                  <span className="text-white/70 text-xs truncate">{s.title}</span>
                  <span className="shrink-0 text-white/20 text-[10px] ml-auto">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 text-sm transition-all">
              <ArrowLeft size={14} /> חזור
            </button>
            <button
              onClick={generate}
              disabled={generating || parsedSlides.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
            >
              {generating
                ? <><Sparkles size={15} className="animate-spin" /> יוצר...</>
                : <><Zap size={15} /> צור {parsedSlides.length} שקפים</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
