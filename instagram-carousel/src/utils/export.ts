import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export async function downloadSlideAsPng(dataUrl: string, filename: string) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  saveAs(blob, filename);
}

/**
 * Downloads all slides as a ZIP file.
 * Slides are named by the provided filenames array (already ordered).
 */
export async function downloadAllSlides(
  dataUrls: string[],
  projectName = 'carousel',
  filenames?: string[]
) {
  const zip = new JSZip();
  await Promise.all(
    dataUrls.map(async (url, i) => {
      const res = await fetch(url);
      const blob = await res.blob();
      const name = filenames?.[i] ?? `${projectName}-${String(i + 1).padStart(2, '0')}.png`;
      zip.file(name, blob);
    })
  );
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${projectName}.zip`);
}
