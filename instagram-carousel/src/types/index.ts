export type BackgroundType = 'solid' | 'gradient' | 'image';

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

export interface Slide {
  id: string;
  background: SlideBackground;
  canvasJson: string | null;
  thumbnail: string | null;
}

export interface CarouselState {
  slides: Slide[];
  activeSlideId: string | null;
  aspectRatio: '1:1' | '4:5' | '9:16';
}
