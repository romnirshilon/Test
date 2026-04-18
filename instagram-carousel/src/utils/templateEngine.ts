import { fabric } from 'fabric';
import type { SlidePageContent, DesignConfig, PaletteKey, FontPairKey, DesignStyle } from '../types';

// ─── Color Palettes ────────────────────────────────────────────────────────────
interface Palette {
  bg1: string; bg2: string; bgAngle: number;
  accent: string; accentLight: string;
  text: string; textMuted: string;
}

const PALETTES: Record<PaletteKey, Palette> = {
  purple:   { bg1: '#1a0533', bg2: '#5b21b6', bgAngle: 135, accent: '#c084fc', accentLight: '#e9d5ff', text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)' },
  ocean:    { bg1: '#0c1a4d', bg2: '#1d4ed8', bgAngle: 145, accent: '#60a5fa', accentLight: '#bfdbfe', text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)' },
  sunset:   { bg1: '#431407', bg2: '#c2410c', bgAngle: 125, accent: '#fbbf24', accentLight: '#fde68a', text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)' },
  forest:   { bg1: '#052e16', bg2: '#15803d', bgAngle: 140, accent: '#4ade80', accentLight: '#bbf7d0', text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)' },
  rose:     { bg1: '#4c0519', bg2: '#be185d', bgAngle: 130, accent: '#f9a8d4', accentLight: '#fce7f3', text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)' },
  mono:     { bg1: '#09090b', bg2: '#27272a', bgAngle: 160, accent: '#e4e4e7', accentLight: '#f4f4f5', text: '#ffffff', textMuted: 'rgba(255,255,255,0.6)' },
  coral:    { bg1: '#1c0a00', bg2: '#9f1239', bgAngle: 135, accent: '#fb7185', accentLight: '#fecdd3', text: '#ffffff', textMuted: 'rgba(255,255,255,0.65)' },
  midnight: { bg1: '#020617', bg2: '#1e3a5f', bgAngle: 150, accent: '#38bdf8', accentLight: '#bae6fd', text: '#ffffff', textMuted: 'rgba(255,255,255,0.6)' },
};

// ─── Font Pairs ────────────────────────────────────────────────────────────────
interface FontPair { heading: string; body: string; headingWeight: string; }

const FONT_PAIRS: Record<FontPairKey, FontPair> = {
  inter:   { heading: 'Inter',       body: 'Inter',     headingWeight: '700' },
  serif:   { heading: 'Georgia',     body: 'Inter',     headingWeight: '700' },
  display: { heading: 'Arial Black', body: 'Inter',     headingWeight: '900' },
  mono:    { heading: 'Courier New', body: 'Courier New', headingWeight: '700' },
};

// ─── Gradient Helper ──────────────────────────────────────────────────────────
function makeGradient(canvas: fabric.Canvas, stops: { color: string; offset: number }[], angle: number) {
  const w = canvas.getWidth();
  const h = canvas.getHeight();
  const rad = (angle * Math.PI) / 180;
  return new fabric.Gradient({
    type: 'linear',
    coords: {
      x1: w / 2 - (Math.cos(rad) * w) / 2,
      y1: h / 2 - (Math.sin(rad) * h) / 2,
      x2: w / 2 + (Math.cos(rad) * w) / 2,
      y2: h / 2 + (Math.sin(rad) * h) / 2,
    },
    colorStops: stops,
  });
}

// ─── Page indicator ───────────────────────────────────────────────────────────
function addPageDots(canvas: fabric.Canvas, current: number, total: number, palette: Palette) {
  if (total <= 1) return;
  const w = canvas.getWidth();
  const h = canvas.getHeight();
  const dotSize = 8;
  const gap = 14;
  const totalW = total * dotSize + (total - 1) * (gap - dotSize);
  const startX = w / 2 - totalW / 2;
  const y = h - 44;
  for (let i = 0; i < total; i++) {
    const isActive = i === current;
    const dot = new fabric.Circle({
      left: startX + i * gap,
      top: y,
      radius: isActive ? 5 : 3,
      fill: isActive ? palette.accent : 'rgba(255,255,255,0.3)',
      selectable: false, evented: false,
    });
    canvas.add(dot);
  }
}

// ─── Decorative line ─────────────────────────────────────────────────────────
function accentLine(canvas: fabric.Canvas, x: number, y: number, width: number, color: string, thickness = 3) {
  const line = new fabric.Rect({
    left: x, top: y, width, height: thickness,
    fill: color, rx: 2, ry: 2,
    selectable: false, evented: false,
  });
  canvas.add(line);
}

// ─── Wrapping text helper ────────────────────────────────────────────────────
function addText(canvas: fabric.Canvas, text: string, opts: fabric.ITextboxOptions) {
  const tb = new fabric.Textbox(text, {
    selectable: true, evented: true,
    ...opts,
  });
  canvas.add(tb);
  return tb;
}

// ─── Large decorative quote mark ─────────────────────────────────────────────
function addQuoteMark(canvas: fabric.Canvas, x: number, y: number, color: string, font: string) {
  const q = new fabric.Text('\u201C', {
    left: x, top: y,
    fontSize: 200,
    fontFamily: font,
    fill: color,
    opacity: 0.18,
    selectable: false, evented: false,
  });
  canvas.add(q);
}

// ─── Bullet list items ────────────────────────────────────────────────────────
function addBulletList(
  canvas: fabric.Canvas,
  items: string[],
  startY: number,
  palette: Palette,
  fonts: FontPair,
  w: number,
  padding: number
) {
  let y = startY;
  items.forEach((item, i) => {
    const bullet = new fabric.Circle({
      left: padding,
      top: y + 10,
      radius: 5,
      fill: palette.accent,
      selectable: false, evented: false,
    });
    canvas.add(bullet);

    addText(canvas, item, {
      left: padding + 22,
      top: y,
      width: w - padding * 2 - 22,
      fontSize: w * 0.038,
      fontFamily: fonts.body,
      fill: i === 0 ? palette.text : palette.textMuted,
      lineHeight: 1.4,
    });
    y += w * 0.065;
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Template Renderers
// ═══════════════════════════════════════════════════════════════════════════════

function renderModern(
  canvas: fabric.Canvas, content: SlidePageContent,
  palette: Palette, fonts: FontPair, w: number, h: number
) {
  const pad = w * 0.09;
  const isSquare = Math.abs(w - h) < 50;

  if (content.type === 'cover') {
    // Big centered layout
    const titleY = h * (isSquare ? 0.3 : 0.28);
    addText(canvas, content.title, {
      left: pad, top: titleY,
      width: w - pad * 2,
      fontSize: w * 0.085,
      fontFamily: fonts.heading,
      fontWeight: fonts.headingWeight,
      fill: palette.text,
      textAlign: 'left',
      lineHeight: 1.1,
    });
    if (content.subtitle) {
      accentLine(canvas, pad, titleY - 20, w * 0.12, palette.accent, 4);
      addText(canvas, content.subtitle, {
        left: pad, top: titleY + w * 0.085 * 2.2,
        width: w - pad * 2,
        fontSize: w * 0.042,
        fontFamily: fonts.body,
        fill: palette.textMuted,
        textAlign: 'left',
        lineHeight: 1.4,
      });
    }
    // Bottom bar
    const barRect = new fabric.Rect({
      left: 0, top: h - 10, width: w, height: 10,
      fill: palette.accent,
      selectable: false, evented: false,
    });
    canvas.add(barRect);

  } else if (content.type === 'content') {
    accentLine(canvas, pad, h * 0.12, w * 0.08, palette.accent, 4);
    addText(canvas, content.title, {
      left: pad, top: h * 0.14,
      width: w - pad * 2,
      fontSize: w * 0.062,
      fontFamily: fonts.heading,
      fontWeight: fonts.headingWeight,
      fill: palette.text,
      lineHeight: 1.15,
    });
    if (content.body) {
      addText(canvas, content.body, {
        left: pad, top: h * 0.38,
        width: w - pad * 2,
        fontSize: w * 0.038,
        fontFamily: fonts.body,
        fill: palette.textMuted,
        lineHeight: 1.6,
      });
    }

  } else if (content.type === 'quote') {
    addQuoteMark(canvas, pad * 0.3, h * 0.05, palette.accent, fonts.heading);
    addText(canvas, content.title, {
      left: pad, top: h * 0.28,
      width: w - pad * 2,
      fontSize: w * 0.065,
      fontFamily: fonts.heading,
      fontWeight: '600',
      fill: palette.text,
      textAlign: 'center',
      lineHeight: 1.3,
    });
    if (content.subtitle) {
      accentLine(canvas, w / 2 - w * 0.08, h * 0.7, w * 0.16, palette.accent, 2);
      addText(canvas, `— ${content.subtitle}`, {
        left: pad, top: h * 0.74,
        width: w - pad * 2,
        fontSize: w * 0.033,
        fontFamily: fonts.body,
        fill: palette.accentLight,
        textAlign: 'center',
        fontStyle: 'italic',
      });
    }

  } else if (content.type === 'list') {
    accentLine(canvas, pad, h * 0.1, w * 0.08, palette.accent, 4);
    addText(canvas, content.title, {
      left: pad, top: h * 0.12,
      width: w - pad * 2,
      fontSize: w * 0.058,
      fontFamily: fonts.heading,
      fontWeight: fonts.headingWeight,
      fill: palette.text,
      lineHeight: 1.15,
    });
    if (content.items?.length) {
      addBulletList(canvas, content.items, h * 0.36, palette, fonts, w, pad);
    }

  } else if (content.type === 'cta') {
    addText(canvas, content.title, {
      left: pad, top: h * 0.25,
      width: w - pad * 2,
      fontSize: w * 0.08,
      fontFamily: fonts.heading,
      fontWeight: fonts.headingWeight,
      fill: palette.text,
      textAlign: 'center',
      lineHeight: 1.15,
    });
    if (content.body) {
      addText(canvas, content.body, {
        left: pad, top: h * 0.55,
        width: w - pad * 2,
        fontSize: w * 0.036,
        fontFamily: fonts.body,
        fill: palette.textMuted,
        textAlign: 'center',
        lineHeight: 1.5,
      });
    }
    // CTA button shape
    const btnW = w * 0.5, btnH = h * 0.07;
    const btn = new fabric.Rect({
      left: w / 2 - btnW / 2, top: h * 0.74,
      width: btnW, height: btnH,
      fill: palette.accent,
      rx: btnH / 2, ry: btnH / 2,
      selectable: true,
    });
    canvas.add(btn);
    if (content.subtitle) {
      addText(canvas, content.subtitle, {
        left: w / 2 - btnW / 2, top: h * 0.74 + btnH * 0.22,
        width: btnW,
        fontSize: w * 0.033,
        fontFamily: fonts.heading,
        fontWeight: '700',
        fill: palette.bg1,
        textAlign: 'center',
      });
    }
  }
}

function renderBold(
  canvas: fabric.Canvas, content: SlidePageContent,
  palette: Palette, fonts: FontPair, w: number, h: number
) {
  const pad = w * 0.08;

  if (content.type === 'cover') {
    // Giant text, bottom aligned
    addText(canvas, content.title.toUpperCase(), {
      left: pad, top: h * 0.45,
      width: w - pad * 2,
      fontSize: w * 0.1,
      fontFamily: fonts.heading,
      fontWeight: '900',
      fill: palette.text,
      lineHeight: 0.95,
    });
    if (content.subtitle) {
      addText(canvas, content.subtitle, {
        left: pad, top: h * 0.8,
        width: w - pad * 2,
        fontSize: w * 0.035,
        fontFamily: fonts.body,
        fill: palette.accent,
      });
    }
    // Big accent block top-left
    const blk = new fabric.Rect({
      left: 0, top: 0, width: w * 0.06, height: h,
      fill: palette.accent,
      selectable: false, evented: false,
    });
    canvas.add(blk);

  } else if (content.type === 'quote') {
    addText(canvas, `"${content.title}"`, {
      left: pad, top: h * 0.2,
      width: w - pad * 2,
      fontSize: w * 0.09,
      fontFamily: fonts.heading,
      fontWeight: '900',
      fill: palette.text,
      lineHeight: 1.05,
    });
    if (content.subtitle) {
      addText(canvas, content.subtitle.toUpperCase(), {
        left: pad, top: h * 0.78,
        width: w - pad * 2,
        fontSize: w * 0.03,
        fontFamily: fonts.body,
        fill: palette.accent,
      });
    }

  } else {
    // Content / list / cta: huge number + text
    addText(canvas, String((content.pageNumber ?? 0) + 1).padStart(2, '0'), {
      left: pad, top: h * 0.05,
      fontSize: w * 0.22,
      fontFamily: fonts.heading,
      fontWeight: '900',
      fill: palette.accent,
      opacity: 0.15,
      selectable: false,
    });
    addText(canvas, content.title.toUpperCase(), {
      left: pad, top: h * 0.3,
      width: w - pad * 2,
      fontSize: w * 0.075,
      fontFamily: fonts.heading,
      fontWeight: '900',
      fill: palette.text,
      lineHeight: 1.0,
    });
    if (content.body) {
      addText(canvas, content.body, {
        left: pad, top: h * 0.62,
        width: w - pad * 2,
        fontSize: w * 0.037,
        fontFamily: fonts.body,
        fill: palette.textMuted,
        lineHeight: 1.55,
      });
    }
    if (content.items?.length) {
      addBulletList(canvas, content.items, h * 0.55, palette, fonts, w, pad);
    }
  }
}

function renderMinimal(
  canvas: fabric.Canvas, content: SlidePageContent,
  palette: Palette, fonts: FontPair, w: number, h: number
) {
  const pad = w * 0.1;
  // Override background to near-white
  canvas.setBackgroundColor('#f8f8f6', () => canvas.renderAll());
  const dark = '#1a1a1a';
  const muted = '#6b6b6b';
  const accent = palette.bg2;

  if (content.type === 'cover') {
    accentLine(canvas, pad, h * 0.35, w * 0.06, accent, 3);
    addText(canvas, content.title, {
      left: pad, top: h * 0.38,
      width: w - pad * 2,
      fontSize: w * 0.078,
      fontFamily: fonts.heading,
      fontWeight: '300',
      fill: dark,
      lineHeight: 1.15,
    });
    if (content.subtitle) {
      addText(canvas, content.subtitle, {
        left: pad, top: h * 0.68,
        width: w - pad * 2,
        fontSize: w * 0.033,
        fontFamily: fonts.body,
        fill: muted,
        lineHeight: 1.5,
      });
    }
  } else if (content.type === 'quote') {
    addText(canvas, '\u201C', {
      left: pad - 10, top: h * 0.15,
      fontSize: w * 0.18,
      fontFamily: fonts.heading,
      fill: accent,
      opacity: 0.4,
      selectable: false,
    });
    addText(canvas, content.title, {
      left: pad, top: h * 0.3,
      width: w - pad * 2,
      fontSize: w * 0.055,
      fontFamily: fonts.heading,
      fontWeight: '300',
      fill: dark,
      textAlign: 'center',
      lineHeight: 1.5,
    });
    if (content.subtitle) {
      addText(canvas, `— ${content.subtitle}`, {
        left: pad, top: h * 0.72,
        width: w - pad * 2,
        fontSize: w * 0.03,
        fontFamily: fonts.body,
        fill: muted,
        textAlign: 'center',
        fontStyle: 'italic',
      });
    }
  } else {
    addText(canvas, content.title, {
      left: pad, top: h * 0.15,
      width: w - pad * 2,
      fontSize: w * 0.065,
      fontFamily: fonts.heading,
      fontWeight: '300',
      fill: dark,
      lineHeight: 1.2,
    });
    accentLine(canvas, pad, h * 0.35, w * 0.08, accent, 2);
    if (content.body) {
      addText(canvas, content.body, {
        left: pad, top: h * 0.4,
        width: w - pad * 2,
        fontSize: w * 0.036,
        fontFamily: fonts.body,
        fill: muted,
        lineHeight: 1.7,
      });
    }
    if (content.items?.length) {
      let y = h * 0.38;
      content.items.forEach((item) => {
        accentLine(canvas, pad, y + 14, 8, accent, 8);
        addText(canvas, item, {
          left: pad + 22, top: y,
          width: w - pad * 2 - 22,
          fontSize: w * 0.036,
          fontFamily: fonts.body,
          fill: dark,
          lineHeight: 1.5,
        });
        y += w * 0.063;
      });
    }
    if (content.type === 'cta' && content.subtitle) {
      const btnW = w * 0.45, btnH = h * 0.065;
      const btn = new fabric.Rect({
        left: pad, top: h * 0.74,
        width: btnW, height: btnH,
        fill: accent,
        rx: 4, ry: 4,
        selectable: true,
      });
      canvas.add(btn);
      addText(canvas, content.subtitle, {
        left: pad, top: h * 0.74 + btnH * 0.2,
        width: btnW,
        fontSize: w * 0.03,
        fontFamily: fonts.heading,
        fontWeight: '600',
        fill: '#ffffff',
        textAlign: 'center',
      });
    }
  }
}

function renderElegant(
  canvas: fabric.Canvas, content: SlidePageContent,
  palette: Palette, fonts: FontPair, w: number, h: number
) {
  const pad = w * 0.1;

  // Decorative corner ornaments
  const cornerSize = w * 0.08;
  [[0, 0], [w, 0], [0, h], [w, h]].forEach(([cx, cy], i) => {
    const xDir = cx === 0 ? 1 : -1;
    const yDir = cy === 0 ? 1 : -1;
    const lh = new fabric.Line([cx, cy + yDir * cornerSize * 0.3, cx, cy + yDir * cornerSize], {
      stroke: palette.accent, strokeWidth: 1.5, opacity: 0.6,
      selectable: false, evented: false,
    });
    const lv = new fabric.Line([cx + xDir * cornerSize * 0.3, cy, cx + xDir * cornerSize, cy], {
      stroke: palette.accent, strokeWidth: 1.5, opacity: 0.6,
      selectable: false, evented: false,
    });
    canvas.add(lh, lv);
    void i;
  });

  if (content.type === 'cover') {
    addText(canvas, content.title, {
      left: pad, top: h * 0.32,
      width: w - pad * 2,
      fontSize: w * 0.075,
      fontFamily: fonts.heading,
      fontWeight: fonts.headingWeight,
      fill: palette.text,
      textAlign: 'center',
      lineHeight: 1.2,
    });
    // Elegant divider
    const divY = h * 0.58;
    accentLine(canvas, w / 2 - w * 0.06, divY, w * 0.03, palette.accent, 1);
    const diamond = new fabric.Rect({
      left: w / 2 - 5, top: divY - 4,
      width: 10, height: 10,
      fill: palette.accent,
      angle: 45,
      selectable: false,
    });
    canvas.add(diamond);
    accentLine(canvas, w / 2 + w * 0.03, divY, w * 0.03, palette.accent, 1);
    if (content.subtitle) {
      addText(canvas, content.subtitle, {
        left: pad, top: h * 0.64,
        width: w - pad * 2,
        fontSize: w * 0.032,
        fontFamily: fonts.body,
        fill: palette.accentLight,
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 1.5,
      });
    }
  } else if (content.type === 'quote') {
    addText(canvas, `\u201C${content.title}\u201D`, {
      left: pad, top: h * 0.25,
      width: w - pad * 2,
      fontSize: w * 0.06,
      fontFamily: fonts.heading,
      fontWeight: '400',
      fill: palette.text,
      textAlign: 'center',
      fontStyle: 'italic',
      lineHeight: 1.4,
    });
    if (content.subtitle) {
      accentLine(canvas, w / 2 - w * 0.1, h * 0.7, w * 0.2, palette.accent, 1);
      addText(canvas, content.subtitle, {
        left: pad, top: h * 0.73,
        width: w - pad * 2,
        fontSize: w * 0.03,
        fontFamily: fonts.body,
        fill: palette.accentLight,
        textAlign: 'center',
      });
    }
  } else {
    addText(canvas, content.title, {
      left: pad, top: h * 0.16,
      width: w - pad * 2,
      fontSize: w * 0.06,
      fontFamily: fonts.heading,
      fontWeight: fonts.headingWeight,
      fill: palette.text,
      textAlign: 'center',
      lineHeight: 1.2,
    });
    accentLine(canvas, w / 2 - w * 0.12, h * 0.35, w * 0.24, palette.accent, 1);
    if (content.body) {
      addText(canvas, content.body, {
        left: pad, top: h * 0.4,
        width: w - pad * 2,
        fontSize: w * 0.036,
        fontFamily: fonts.body,
        fill: palette.textMuted,
        textAlign: 'center',
        lineHeight: 1.6,
        fontStyle: 'italic',
      });
    }
    if (content.items?.length) {
      let y = h * 0.38;
      content.items.forEach((item) => {
        addText(canvas, item, {
          left: pad, top: y,
          width: w - pad * 2,
          fontSize: w * 0.037,
          fontFamily: fonts.body,
          fill: palette.textMuted,
          textAlign: 'center',
          lineHeight: 1.5,
          fontStyle: 'italic',
        });
        y += w * 0.07;
      });
    }
  }
}

function renderVibrant(
  canvas: fabric.Canvas, content: SlidePageContent,
  palette: Palette, fonts: FontPair, w: number, h: number
) {
  const pad = w * 0.09;

  // Dynamic background blobs
  const blob1 = new fabric.Circle({
    left: -w * 0.2, top: -h * 0.15,
    radius: w * 0.6,
    fill: palette.accent,
    opacity: 0.12,
    selectable: false, evented: false,
  });
  const blob2 = new fabric.Circle({
    left: w * 0.5, top: h * 0.55,
    radius: w * 0.45,
    fill: palette.accentLight,
    opacity: 0.08,
    selectable: false, evented: false,
  });
  canvas.add(blob1, blob2);

  if (content.type === 'cover') {
    // Badge
    const badge = new fabric.Rect({
      left: pad, top: h * 0.16,
      width: w * 0.28, height: h * 0.045,
      fill: palette.accent,
      rx: 4, ry: 4,
      selectable: false,
    });
    canvas.add(badge);
    if (content.subtitle) {
      addText(canvas, content.subtitle.toUpperCase(), {
        left: pad + 10, top: h * 0.165,
        width: w * 0.28 - 20,
        fontSize: w * 0.022,
        fontFamily: fonts.body,
        fontWeight: '700',
        fill: palette.bg1,
      });
    }
    addText(canvas, content.title, {
      left: pad, top: h * 0.26,
      width: w - pad * 2,
      fontSize: w * 0.088,
      fontFamily: fonts.heading,
      fontWeight: fonts.headingWeight,
      fill: palette.text,
      lineHeight: 1.05,
    });
    // Zig-zag bottom accent
    const zigH = h * 0.012;
    for (let i = 0; i < 6; i++) {
      const seg = new fabric.Rect({
        left: w * 0.09 * i, top: h - zigH * 2,
        width: w * 0.09, height: zigH,
        fill: i % 2 === 0 ? palette.accent : palette.accentLight,
        selectable: false,
      });
      canvas.add(seg);
    }
  } else if (content.type === 'quote') {
    addQuoteMark(canvas, pad * 0.2, h * 0.0, palette.accent, fonts.heading);
    addText(canvas, content.title, {
      left: pad, top: h * 0.25,
      width: w - pad * 2,
      fontSize: w * 0.068,
      fontFamily: fonts.heading,
      fontWeight: fonts.headingWeight,
      fill: palette.text,
      lineHeight: 1.2,
      textAlign: 'center',
    });
    if (content.subtitle) {
      const pill = new fabric.Rect({
        left: w / 2 - w * 0.22, top: h * 0.72,
        width: w * 0.44, height: h * 0.048,
        fill: 'rgba(255,255,255,0.15)',
        rx: h * 0.024, ry: h * 0.024,
        selectable: false,
      });
      canvas.add(pill);
      addText(canvas, content.subtitle, {
        left: w / 2 - w * 0.22, top: h * 0.728,
        width: w * 0.44,
        fontSize: w * 0.03,
        fontFamily: fonts.body,
        fill: palette.accentLight,
        textAlign: 'center',
      });
    }
  } else {
    // Tilted accent stripe
    const stripe = new fabric.Rect({
      left: -w * 0.05, top: h * 0.08,
      width: w * 0.25, height: h,
      fill: palette.accent,
      opacity: 0.12,
      angle: -8,
      selectable: false,
    });
    canvas.add(stripe);
    addText(canvas, content.title, {
      left: pad, top: h * 0.14,
      width: w - pad * 2,
      fontSize: w * 0.065,
      fontFamily: fonts.heading,
      fontWeight: fonts.headingWeight,
      fill: palette.text,
      lineHeight: 1.15,
    });
    accentLine(canvas, pad, h * 0.36, w * 0.1, palette.accent, 5);
    if (content.body) {
      addText(canvas, content.body, {
        left: pad, top: h * 0.4,
        width: w - pad * 2,
        fontSize: w * 0.038,
        fontFamily: fonts.body,
        fill: palette.textMuted,
        lineHeight: 1.6,
      });
    }
    if (content.items?.length) {
      addBulletList(canvas, content.items, h * 0.38, palette, fonts, w, pad);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main entry point
// ═══════════════════════════════════════════════════════════════════════════════
export function applyTemplate(
  canvas: fabric.Canvas,
  content: SlidePageContent,
  design: DesignConfig,
  totalSlides: number,
  width: number,
  height: number
) {
  canvas.clear();

  const palette = PALETTES[design.palette];
  const fonts = FONT_PAIRS[design.fontPair];
  const w = width;
  const h = height;

  // Apply gradient background (except minimal which overrides)
  if (design.style !== 'minimal') {
    const grad = makeGradient(canvas, [
      { offset: 0, color: palette.bg1 },
      { offset: 1, color: palette.bg2 },
    ], palette.bgAngle);
    canvas.setBackgroundColor(grad as unknown as string, () => {});
  }

  const renderMap: Record<DesignStyle, typeof renderModern> = {
    modern:  renderModern,
    bold:    renderBold,
    minimal: renderMinimal,
    elegant: renderElegant,
    vibrant: renderVibrant,
  };

  renderMap[design.style](canvas, content, palette, fonts, w, h);

  // Page dots at bottom (all styles except cover in most)
  const pageIdx = content.pageNumber ?? 0;
  if (content.type !== 'cover') {
    addPageDots(canvas, pageIdx, totalSlides, palette);
  }

  canvas.renderAll();
}
