export type BackgroundType = 'solid' | 'gradient' | 'image';
export type SlideType = 'cover' | 'content' | 'quote' | 'list' | 'cta';
export type DesignStyle = 'modern' | 'elegant' | 'bold' | 'minimal' | 'vibrant';
export type PaletteKey = 'purple' | 'ocean' | 'sunset' | 'forest' | 'rose' | 'mono' | 'coral' | 'midnight';
export type FontPairKey = 'inter' | 'serif' | 'display' | 'mono';

export interface GradientStop {
  color: string;
  position: number;
}

export interface SlideBackground {
  type: BackgroundType;
  color: string;
  gradient: {
    stops: GradientStop[];
    angle: number;
  };
  imageUrl: string | null;
}

export interface SlidePageContent {
  type: SlideType;
  title: string;
  subtitle?: string;
  body?: string;
  items?: string[];
  pageNumber?: number;
}

export interface DesignConfig {
  style: DesignStyle;
  palette: PaletteKey;
  fontPair: FontPairKey;
}

export interface GenerationData {
  content: SlidePageContent;
  design: DesignConfig;
  totalSlides: number;
}

export interface Slide {
  id: string;
  background: SlideBackground;
  canvasJson: string | null;
  thumbnail: string | null;
  generationData?: GenerationData;
}

export interface CarouselState {
  slides: Slide[];
  activeSlideId: string | null;
  aspectRatio: '1:1' | '4:5' | '9:16';
}
