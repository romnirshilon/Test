import { useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import {
  Type,
  Square,
  Circle,
  Triangle,
  Minus,
  Image as ImageIcon,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';

interface Props {
  canvas: fabric.Canvas | null;
}

export default function Toolbar({ canvas }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const addText = useCallback(() => {
    if (!canvas) return;
    const text = new fabric.IText('Double click to edit', {
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      originX: 'center',
      originY: 'center',
      fontSize: 48,
      fontFamily: 'Inter',
      fill: '#ffffff',
      fontWeight: 'bold',
      textAlign: 'center',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  }, [canvas]);

  const addRect = useCallback(() => {
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: canvas.getWidth() / 2 - 60,
      top: canvas.getHeight() / 2 - 40,
      width: 120,
      height: 80,
      fill: 'rgba(99,102,241,0.7)',
      rx: 12,
      ry: 12,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  }, [canvas]);

  const addCircle = useCallback(() => {
    if (!canvas) return;
    const circle = new fabric.Circle({
      left: canvas.getWidth() / 2 - 50,
      top: canvas.getHeight() / 2 - 50,
      radius: 50,
      fill: 'rgba(168,85,247,0.7)',
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  }, [canvas]);

  const addTriangle = useCallback(() => {
    if (!canvas) return;
    const tri = new fabric.Triangle({
      left: canvas.getWidth() / 2 - 50,
      top: canvas.getHeight() / 2 - 50,
      width: 100,
      height: 100,
      fill: 'rgba(236,72,153,0.7)',
    });
    canvas.add(tri);
    canvas.setActiveObject(tri);
    canvas.renderAll();
  }, [canvas]);

  const addLine = useCallback(() => {
    if (!canvas) return;
    const line = new fabric.Line([50, 0, canvas.getWidth() - 50, 0], {
      left: 50,
      top: canvas.getHeight() / 2,
      stroke: '#ffffff',
      strokeWidth: 3,
    });
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.renderAll();
  }, [canvas]);

  const addImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;
    const url = URL.createObjectURL(file);
    fabric.Image.fromURL(url, (img: fabric.Image) => {
      const maxW = canvas.getWidth() * 0.7;
      if (img.width && img.width > maxW) img.scaleToWidth(maxW);
      img.set({ left: canvas.getWidth() / 2, top: canvas.getHeight() / 2, originX: 'center', originY: 'center' });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    });
    e.target.value = '';
  }, [canvas]);

  const deleteSelected = useCallback(() => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) {
      if ('forEachObject' in obj) {
        (obj as fabric.ActiveSelection).forEachObject((o: fabric.Object) => canvas.remove(o));
      }
      canvas.remove(obj);
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }, [canvas]);

  const bringForward = () => {
    const obj = canvas?.getActiveObject();
    if (obj) { canvas?.bringForward(obj); canvas?.renderAll(); }
  };
  const sendBackward = () => {
    const obj = canvas?.getActiveObject();
    if (obj) { canvas?.sendBackwards(obj); canvas?.renderAll(); }
  };

  const setTextAlign = (align: string) => {
    const obj = canvas?.getActiveObject() as fabric.IText;
    if (obj && 'textAlign' in obj) { obj.set('textAlign', align); canvas?.renderAll(); }
  };
  const toggleBold = () => {
    const obj = canvas?.getActiveObject() as fabric.IText;
    if (obj && 'fontWeight' in obj) {
      obj.set('fontWeight', obj.fontWeight === 'bold' ? 'normal' : 'bold');
      canvas?.renderAll();
    }
  };
  const toggleItalic = () => {
    const obj = canvas?.getActiveObject() as fabric.IText;
    if (obj && 'fontStyle' in obj) {
      obj.set('fontStyle', obj.fontStyle === 'italic' ? 'normal' : 'italic');
      canvas?.renderAll();
    }
  };

  const btn = 'flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer text-xs';

  return (
    <div className="bg-[#16161e] border-b border-white/10 px-4 py-3">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-white/30 text-xs uppercase tracking-wider mr-1">Add</span>

        <button onClick={addText} className={btn}>
          <Type size={16} />
          Text
        </button>
        <button onClick={addRect} className={btn}>
          <Square size={16} />
          Box
        </button>
        <button onClick={addCircle} className={btn}>
          <Circle size={16} />
          Circle
        </button>
        <button onClick={addTriangle} className={btn}>
          <Triangle size={16} />
          Triangle
        </button>
        <button onClick={addLine} className={btn}>
          <Minus size={16} />
          Line
        </button>
        <label className={clsx(btn, 'cursor-pointer')}>
          <ImageIcon size={16} />
          Image
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={addImage} />
        </label>

        <div className="w-px h-8 bg-white/10 mx-1" />

        <span className="text-white/30 text-xs uppercase tracking-wider mr-1">Format</span>
        <button onClick={toggleBold} className={btn} title="Bold"><Bold size={16} />Bold</button>
        <button onClick={toggleItalic} className={btn} title="Italic"><Italic size={16} />Italic</button>
        <button onClick={() => setTextAlign('left')} className={btn}><AlignLeft size={16} />Left</button>
        <button onClick={() => setTextAlign('center')} className={btn}><AlignCenter size={16} />Center</button>
        <button onClick={() => setTextAlign('right')} className={btn}><AlignRight size={16} />Right</button>

        <div className="w-px h-8 bg-white/10 mx-1" />

        <button onClick={bringForward} className={btn}><ChevronUp size={16} />Forward</button>
        <button onClick={sendBackward} className={btn}><ChevronDown size={16} />Backward</button>

        <div className="w-px h-8 bg-white/10 mx-1" />

        <button onClick={deleteSelected} className={clsx(btn, 'hover:bg-red-600/20 hover:text-red-400')}>
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
}
