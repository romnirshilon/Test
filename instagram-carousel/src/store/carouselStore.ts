import { create } from 'zustand';
import type { Slide, CarouselState, SlideBackground } from '../types';

function defaultBackground(): SlideBackground {
  return {
    type: 'gradient',
    color: '#6366f1',
    gradient: {
      stops: [
        { color: '#6366f1', position: 0 },
        { color: '#a855f7', position: 100 },
      ],
      angle: 135,
    },
    imageUrl: null,
  };
}

function createSlide(overrides?: Partial<Slide>): Slide {
  return {
    id: crypto.randomUUID(),
    background: defaultBackground(),
    canvasJson: null,
    thumbnail: null,
    ...overrides,
  };
}

interface CarouselStore extends CarouselState {
  addSlide: () => void;
  removeSlide: (id: string) => void;
  duplicateSlide: (id: string) => void;
  setActiveSlide: (id: string) => void;
  reorderSlides: (from: number, to: number) => void;
  updateSlideBackground: (id: string, bg: Partial<SlideBackground>) => void;
  updateSlideCanvas: (id: string, json: string) => void;
  updateSlideThumbnail: (id: string, thumbnail: string) => void;
  setAspectRatio: (ratio: CarouselState['aspectRatio']) => void;
  setSlides: (slides: Slide[]) => void;
}

const initialSlide = createSlide();

export const useCarouselStore = create<CarouselStore>((set) => ({
  slides: [initialSlide],
  activeSlideId: initialSlide.id,
  aspectRatio: '1:1',

  addSlide: () =>
    set((state) => {
      const newSlide = createSlide();
      return { slides: [...state.slides, newSlide], activeSlideId: newSlide.id };
    }),

  removeSlide: (id) =>
    set((state) => {
      if (state.slides.length === 1) return state;
      const idx = state.slides.findIndex((s) => s.id === id);
      const remaining = state.slides.filter((s) => s.id !== id);
      const newActive =
        state.activeSlideId === id
          ? remaining[Math.max(0, idx - 1)]?.id ?? remaining[0]?.id
          : state.activeSlideId;
      return { slides: remaining, activeSlideId: newActive };
    }),

  duplicateSlide: (id) =>
    set((state) => {
      const src = state.slides.find((s) => s.id === id);
      if (!src) return state;
      const copy = createSlide({
        background: { ...src.background, gradient: { ...src.background.gradient, stops: [...src.background.gradient.stops] } },
        canvasJson: src.canvasJson,
        thumbnail: src.thumbnail,
      });
      const idx = state.slides.findIndex((s) => s.id === id);
      const slides = [...state.slides];
      slides.splice(idx + 1, 0, copy);
      return { slides, activeSlideId: copy.id };
    }),

  setActiveSlide: (id) => set({ activeSlideId: id }),

  reorderSlides: (from, to) =>
    set((state) => {
      const slides = [...state.slides];
      const [moved] = slides.splice(from, 1);
      slides.splice(to, 0, moved);
      return { slides };
    }),

  updateSlideBackground: (id, bg) =>
    set((state) => ({
      slides: state.slides.map((s) =>
        s.id === id ? { ...s, background: { ...s.background, ...bg } } : s
      ),
    })),

  updateSlideCanvas: (id, json) =>
    set((state) => ({
      slides: state.slides.map((s) => (s.id === id ? { ...s, canvasJson: json } : s)),
    })),

  updateSlideThumbnail: (id, thumbnail) =>
    set((state) => ({
      slides: state.slides.map((s) => (s.id === id ? { ...s, thumbnail } : s)),
    })),

  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),

  setSlides: (slides) =>
    set({ slides, activeSlideId: slides[0]?.id ?? null }),
}));
