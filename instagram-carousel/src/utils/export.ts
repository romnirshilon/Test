import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export async function downloadSlideAsPng(dataUrl: string, filename: string) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  saveAs(blob, filename);
}

export async function downloadAllSlides(dataUrls: string[], projectName = 'carousel') {
  const zip = new JSZip();
  await Promise.all(
    dataUrls.map(async (url, i) => {
      const res = await fetch(url);
      const blob = await res.blob();
      zip.file(`${projectName}-slide-${i + 1}.png`, blob);
    })
  );
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${projectName}.zip`);
}
