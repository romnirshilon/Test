import { useState } from 'react';
import BackgroundPanel from './BackgroundPanel';
import CanvaImport from './CanvaImport';
import GeneratorWizard from './GeneratorWizard';
import AIAgentPanel from './AIAgentPanel';
import { Palette, Import, Sparkles, Bot } from 'lucide-react';
import clsx from 'clsx';

const TABS = [
  { id: 'ai',         label: 'AI',       icon: Bot },
  { id: 'generate',   label: 'Generate', icon: Sparkles },
  { id: 'background', label: 'Style',    icon: Palette },
  { id: 'canva',      label: 'Canva',    icon: Import },
];

export default function RightPanel() {
  const [tab, setTab] = useState('ai');

  return (
    <div className="flex flex-col h-full bg-[#16161e] border-l border-white/10 w-72 min-w-[18rem]">
      <div className="flex border-b border-white/10">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all border-b-2',
              tab === id
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-white/40 hover:text-white/70'
            )}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto slide-thumb p-4">
        {tab === 'ai'         && <AIAgentPanel />}
        {tab === 'generate'   && <GeneratorWizard />}
        {tab === 'background' && <BackgroundPanel />}
        {tab === 'canva'      && <CanvaImport />}
      </div>
    </div>
  );
}
