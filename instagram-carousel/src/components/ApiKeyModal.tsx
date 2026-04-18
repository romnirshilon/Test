import { useState } from 'react';
import { X, Key, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

interface Props {
  onClose: () => void;
}

export default function ApiKeyModal({ onClose }: Props) {
  const { apiKey, setApiKey } = useSettingsStore();
  const [draft, setDraft] = useState(apiKey);
  const [show, setShow] = useState(false);

  const save = () => {
    setApiKey(draft.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#13131f] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <Key size={16} className="text-indigo-400" />
            Anthropic API Key
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-white/50 text-xs leading-relaxed">
            Your API key is stored locally and never sent anywhere except directly to Anthropic's API.
          </p>

          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-indigo-500 font-mono"
              onKeyDown={(e) => e.key === 'Enter' && save()}
            />
            <button
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-indigo-400 text-xs hover:text-indigo-300 transition-colors"
          >
            <ExternalLink size={12} />
            Get an API key from Anthropic Console
          </a>

          <button
            onClick={save}
            disabled={!draft.trim()}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium text-sm transition-all"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
}
