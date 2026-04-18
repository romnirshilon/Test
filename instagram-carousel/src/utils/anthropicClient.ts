import Anthropic from '@anthropic-ai/sdk';
import type { SlidePageContent, DesignConfig, DesignStyle, PaletteKey, FontPairKey } from '../types';

export interface AICarouselResult {
  slides: SlidePageContent[];
  designSuggestion: DesignConfig;
  summary: string;
}

const SYSTEM_PROMPT = `You are an elite Instagram content strategist and copywriter. Your job is to create compelling carousel content that drives engagement, saves, and shares.

Instagram carousel best practices you follow:
- Slide 1 (cover): Bold hook that stops the scroll — a provocative question, striking stat, or strong promise
- Slides 2-6 (content): Each slide delivers ONE clear insight, tip, or idea — concise, punchy, valuable
- Quote slide (optional): A powerful quote that reinforces the message
- List slide (optional): Scannable bullet points (3-7 items max)
- Last slide (CTA): Clear, specific call to action — follow, save, comment, DM, visit link

Writing rules:
- Short sentences. White space. Easy to scan.
- Use "you" language — speak directly to the reader
- Every slide title must make someone want to read the next slide
- Body text max 2-3 short sentences
- Bullets max 6 words each
- Tone: confident, clear, valuable — never salesy or generic

Output ONLY valid JSON in this exact structure (no markdown, no explanation):
{
  "slides": [
    {
      "type": "cover" | "content" | "quote" | "list" | "cta",
      "title": "string",
      "subtitle": "string (optional)",
      "body": "string (optional, 1-3 sentences)",
      "items": ["string"] (optional, for list slides only)
    }
  ],
  "designSuggestion": {
    "style": "modern" | "elegant" | "bold" | "minimal" | "vibrant",
    "palette": "purple" | "ocean" | "sunset" | "forest" | "rose" | "mono" | "coral" | "midnight",
    "fontPair": "inter" | "serif" | "display" | "mono"
  },
  "summary": "1-2 sentence description of the content strategy chosen"
}`;

export async function generateCarouselContent(
  apiKey: string,
  topic: string,
  tone: string,
  slideCount: number,
  onStream?: (text: string) => void
): Promise<AICarouselResult> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const userMessage = `Create a ${slideCount}-slide Instagram carousel about: "${topic}"
Tone: ${tone}
Target slides: ${slideCount} (cover + ${slideCount - 2} content slides + CTA)

Generate professional copywriting that will drive high engagement. Choose the design style that best fits the topic and tone.`;

  const stream = client.messages.stream({
    model: 'claude-opus-4-7',
    max_tokens: 4096,
    thinking: { type: 'adaptive' },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  let fullText = '';

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      fullText += event.delta.text;
      onStream?.(fullText);
    }
  }

  // Extract JSON from response (handle possible thinking blocks)
  const jsonMatch = fullText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No valid JSON in AI response');

  const parsed = JSON.parse(jsonMatch[0]) as AICarouselResult;

  // Validate and normalize
  if (!Array.isArray(parsed.slides) || parsed.slides.length === 0) {
    throw new Error('AI returned no slides');
  }

  // Add page numbers
  parsed.slides = parsed.slides.map((s, i) => ({ ...s, pageNumber: i + 1 }));

  // Ensure valid enum values
  const validStyles: DesignStyle[] = ['modern', 'elegant', 'bold', 'minimal', 'vibrant'];
  const validPalettes: PaletteKey[] = ['purple', 'ocean', 'sunset', 'forest', 'rose', 'mono', 'coral', 'midnight'];
  const validFonts: FontPairKey[] = ['inter', 'serif', 'display', 'mono'];

  if (!validStyles.includes(parsed.designSuggestion.style)) parsed.designSuggestion.style = 'modern';
  if (!validPalettes.includes(parsed.designSuggestion.palette)) parsed.designSuggestion.palette = 'purple';
  if (!validFonts.includes(parsed.designSuggestion.fontPair)) parsed.designSuggestion.fontPair = 'inter';

  return parsed;
}
