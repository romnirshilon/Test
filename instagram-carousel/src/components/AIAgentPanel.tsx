import { useState, useRef } from 'react';
import { Sparkles, Key, CheckCircle2, Loader2, ChevronDown, ChevronUp, Wand2 } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { useCarouselStore } from '../store/carouselStore';
import { generateCarouselContent } from '../utils/anthropicClient';
import type { AICarouselResult } from '../utils/anthropicClient';
import type { DesignStyle, PaletteKey, FontPairKey } from '../types';
import ApiKeyModal from './ApiKeyModal';
import clsx from 'clsx';

const TONES = ['Professional', 'Casual & Fun', 'Inspirational', 'Educational', 'Bold & Direct', 'Storytelling'];
const SLIDE_COUNTS = [4, 5, 6, 7, 8, 10];

const STYLE_LABELS: Record<DesignStyle, string> = {
  modern: 'Modern', elegant: 'Elegant', bold: 'Bold', minimal: 'Minimal', vibrant: 'Vibrant',
};
const PALETTE_LABELS: Record<PaletteKey, string> = {
  purple: 'Purple', ocean: 'Ocean', sunset: 'Sunset', forest: 'Forest',
  rose: 'Rose', mono: 'Mono', coral: 'Coral', midnight: 'Midnight',
};
const FONT_LABELS: Record<FontPairKey, string> = {
  inter: 'Inter', serif: 'Serif', display: 'Display', mono: 'Mono',
};

export default function AIAgentPanel() {
  const { apiKey } = useSettingsStore();
  const setSlides = useCarouselStore((s) => s.setSlides);
  const existingSlides = useCarouselStore((s) => s.slides);

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [slideCount, setSlideCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [result, setResult] = useState<AICarouselResult | null>(null);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [applied, setApplied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const generate = async () => {
    if (!topic.trim() || !apiKey) return;
    setLoading(true);
    setStreamText('');
    setResult(null);
    setError('');
    setApplied(false);

    try {
      const res = await generateCarouselContent(
        apiKey,
        topic,
        tone,
        slideCount,
        (text) => setStreamText(text)
      );
      setResult(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg.includes('401') ? 'Invalid API key. Please check your key.' : `Error: ${msg}`);
    } finally {
      setLoading(false);
      setStreamText('');
    }
  };

  const applyToCarousel = () => {
    if (!result) return;
    const design = result.designSuggestion;
    const newSlides = result.slides.map((content) => ({
      id: crypto.randomUUID(),
      background: existingSlides[0]?.background ?? {
        type: 'gradient' as const,
        color: '#1a1a2e',
        gradient: { stops: [{ color: '#1a1a2e', position: 0 }, { color: '#16213e', position: 100 }], angle: 135 },
        imageUrl: null,
      },
      canvasJson: null,
      thumbnail: null,
      generationData: {
        content,
        design,
        totalSlides: result.slides.length,
      },
    }));
    setSlides(newSlides);
    setApplied(true);
  };

  return (
    <div className="space-y-4">
      {/* API Key banner */}
      {!apiKey ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2">
          <Key size={14} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-amber-300 text-xs font-medium">API key required</p>
            <p className="text-amber-300/60 text-[11px] mt-0.5">Set your Anthropic API key to use the AI agent.</p>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-medium transition-all"
          >
            Set key
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
            <CheckCircle2 size={12} />
            API key connected
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className="text-white/30 hover:text-white/60 text-[11px] transition-colors"
          >
            Change
          </button>
        </div>
      )}

      {/* Topic input */}
      <div>
        <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">Topic / Direction</label>
        <textarea
          ref={textareaRef}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. 5 habits that will transform your morning routine and boost your productivity..."
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs placeholder-white/20 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate();
          }}
        />
        <p className="text-white/20 text-[10px] mt-1">⌘+Enter to generate</p>
      </div>

      {/* Tone */}
      <div>
        <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">Tone</label>
        <div className="flex flex-wrap gap-1.5">
          {TONES.map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border',
                tone === t
                  ? 'border-indigo-500 bg-indigo-600/20 text-white'
                  : 'border-white/10 bg-white/5 text-white/40 hover:text-white/70'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Slide count */}
      <div>
        <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">
          Slides — <span className="text-indigo-300">{slideCount}</span>
        </label>
        <div className="flex gap-1.5">
          {SLIDE_COUNTS.map((n) => (
            <button
              key={n}
              onClick={() => setSlideCount(n)}
              className={clsx(
                'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border',
                slideCount === n
                  ? 'border-indigo-500 bg-indigo-600/20 text-white'
                  : 'border-white/10 bg-white/5 text-white/40 hover:text-white/70'
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={loading || !topic.trim() || !apiKey}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all disabled:opacity-40 shadow-lg shadow-indigo-500/20"
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> Writing carousel…</>
          : <><Sparkles size={16} /> Generate with AI</>}
      </button>

      {/* Streaming preview */}
      {loading && streamText && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 max-h-32 overflow-y-auto">
          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Loader2 size={10} className="animate-spin" /> AI writing…
          </p>
          <pre className="text-white/60 text-[10px] font-mono whitespace-pre-wrap leading-relaxed">{streamText.slice(-400)}</pre>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-3">
          {/* Summary */}
          <div className="rounded-xl bg-indigo-600/10 border border-indigo-500/20 p-3">
            <p className="text-indigo-300 text-xs leading-relaxed">{result.summary}</p>
          </div>

          {/* Design suggestion */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-2">
            <p className="text-white/50 text-[10px] uppercase tracking-wider">AI Design Suggestion</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-[10px]">
                {STYLE_LABELS[result.designSuggestion.style]}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300 text-[10px]">
                {PALETTE_LABELS[result.designSuggestion.palette]}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-[10px]">
                {FONT_LABELS[result.designSuggestion.fontPair]}
              </span>
            </div>
          </div>

          {/* Slides preview */}
          <div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center justify-between w-full text-white/50 text-[10px] uppercase tracking-wider mb-2"
            >
              <span>{result.slides.length} slides preview</span>
              {showPreview ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {showPreview && (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {result.slides.map((slide, i) => (
                  <div key={i} className="rounded-lg bg-white/5 border border-white/5 p-2.5 flex gap-2.5">
                    <div className="shrink-0 flex flex-col items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[9px] font-bold">
                        {i + 1}
                      </div>
                      <span className="text-white/25 text-[9px] capitalize">{slide.type}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-[11px] font-medium leading-tight truncate">{slide.title}</p>
                      {slide.subtitle && <p className="text-white/40 text-[10px] mt-0.5 leading-tight line-clamp-1">{slide.subtitle}</p>}
                      {slide.body && <p className="text-white/35 text-[10px] mt-1 leading-tight line-clamp-2">{slide.body}</p>}
                      {slide.items && (
                        <ul className="mt-1 space-y-0.5">
                          {slide.items.slice(0, 3).map((item, j) => (
                            <li key={j} className="text-white/35 text-[10px] flex items-start gap-1">
                              <span className="text-indigo-400 shrink-0">•</span>
                              <span className="line-clamp-1">{item}</span>
                            </li>
                          ))}
                          {slide.items.length > 3 && (
                            <li className="text-white/20 text-[10px]">+{slide.items.length - 3} more…</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Apply button */}
          <button
            onClick={applyToCarousel}
            disabled={applied}
            className={clsx(
              'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all',
              applied
                ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 cursor-default'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20'
            )}
          >
            {applied
              ? <><CheckCircle2 size={16} /> Applied to carousel!</>
              : <><Wand2 size={16} /> Apply to Carousel</>}
          </button>

          {!applied && (
            <p className="text-white/25 text-[10px] text-center">
              This will replace your current slides with AI-generated content
            </p>
          )}
        </div>
      )}

      {showKeyModal && <ApiKeyModal onClose={() => setShowKeyModal(false)} />}
    </div>
  );
}
