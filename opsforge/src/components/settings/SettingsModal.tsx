import React from 'react';
import { useOps } from '../../context/OpsContext';
import { X, Sliders, Monitor, Code, Keyboard, Check } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    showSettingsModal,
    setShowSettingsModal,
    editorSettings,
    updateEditorSettings,
    theme,
    setTheme
  } = useOps();

  if (!showSettingsModal) return null;

  const fontSizes = [12, 13, 14, 16, 18];
  const tabSizes = [2, 4];
  const fontFamilies = [
    { label: 'Fira Code', value: "'Fira Code', monospace" },
    { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
    { label: 'SF Mono', value: "'SF Mono', monospace" },
    { label: 'Consolas', value: "Consolas, monospace" }
  ];

  const themes = [
    { id: 'leetcode' as const, name: 'LeetCode Dark', color: '#ffa116' },
    { id: 'linear' as const, name: 'Linear Titanium', color: '#e4e4e7' },
    { id: 'vercel' as const, name: 'Vercel Pitch Black', color: '#ffffff' },
    { id: 'github' as const, name: 'GitHub Dimmed', color: '#539bf5' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div 
        className="w-full max-w-lg rounded-xl bg-[#262626] border border-[#3a3a3a] shadow-2xl overflow-hidden flex flex-col text-xs text-[#eff1f6]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#383838]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#ffa116]" />
            <span className="font-semibold text-sm text-white">Settings</span>
          </div>
          <button
            onClick={() => setShowSettingsModal(false)}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#333333] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          
          {/* Section 1: Appearance & Theme */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
              <Monitor className="w-3.5 h-3.5" />
              <span>Appearance</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-2.5 rounded-lg border text-left transition flex items-center justify-between ${
                    theme === t.id
                      ? 'bg-[#333333] border-[#ffa116] text-white'
                      : 'bg-[#202020] border-[#383838] text-zinc-400 hover:text-zinc-200 hover:bg-[#282828]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="font-medium text-xs">{t.name}</span>
                  </div>
                  {theme === t.id && <Check className="w-3.5 h-3.5 text-[#ffa116]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Editor Configuration */}
          <div className="space-y-3 pt-3 border-t border-[#333333]">
            <div className="flex items-center gap-1.5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
              <Code className="w-3.5 h-3.5" />
              <span>Editor Settings</span>
            </div>

            {/* Font Size */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white text-xs">Font Size</div>
                <div className="text-[11px] text-zinc-400">Editor text size in pixels</div>
              </div>
              <div className="flex items-center gap-1 bg-[#1e1e1e] p-1 rounded-md border border-[#383838]">
                {fontSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => updateEditorSettings({ fontSize: size })}
                    className={`px-2 py-0.5 rounded text-xs transition ${
                      editorSettings.fontSize === size
                        ? 'bg-[#3a3a3a] text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Size */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white text-xs">Tab Size</div>
                <div className="text-[11px] text-zinc-400">Number of spaces per indentation</div>
              </div>
              <div className="flex items-center gap-1 bg-[#1e1e1e] p-1 rounded-md border border-[#383838]">
                {tabSizes.map(tab => (
                  <button
                    key={tab}
                    onClick={() => updateEditorSettings({ tabSize: tab })}
                    className={`px-2.5 py-0.5 rounded text-xs transition ${
                      editorSettings.tabSize === tab
                        ? 'bg-[#3a3a3a] text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tab} spaces
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white text-xs">Font Family</div>
                <div className="text-[11px] text-zinc-400">Monospace typography for editor code</div>
              </div>
              <select
                value={editorSettings.fontFamily}
                onChange={e => updateEditorSettings({ fontFamily: e.target.value })}
                className="bg-[#1e1e1e] border border-[#383838] rounded-md px-2.5 py-1 text-xs text-zinc-200 focus:outline-none cursor-pointer"
              >
                {fontFamilies.map(f => (
                  <option key={f.label} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Word Wrap Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white text-xs">Word Wrap</div>
                <div className="text-[11px] text-zinc-400">Wrap long lines to fit the viewport</div>
              </div>
              <button
                onClick={() => updateEditorSettings({ wordWrap: !editorSettings.wordWrap })}
                className={`w-10 h-5 rounded-full transition p-0.5 flex items-center ${
                  editorSettings.wordWrap ? 'bg-[#00b8a3] justify-end' : 'bg-[#383838] justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-md inline-block" />
              </button>
            </div>

            {/* Line Numbers Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white text-xs">Line Numbers</div>
                <div className="text-[11px] text-zinc-400">Show line gutter on the left of code</div>
              </div>
              <button
                onClick={() => updateEditorSettings({ showLineNumbers: !editorSettings.showLineNumbers })}
                className={`w-10 h-5 rounded-full transition p-0.5 flex items-center ${
                  editorSettings.showLineNumbers ? 'bg-[#00b8a3] justify-end' : 'bg-[#383838] justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-md inline-block" />
              </button>
            </div>
          </div>

          {/* Section 3: Keyboard Shortcuts */}
          <div className="space-y-2.5 pt-3 border-t border-[#333333]">
            <div className="flex items-center gap-1.5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
              <Keyboard className="w-3.5 h-3.5" />
              <span>Keyboard Shortcuts</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-[#202020] border border-[#333333]">
                <span className="text-zinc-400 font-sans">Run Diagnostics</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#333333] text-zinc-200 text-[10px]">Ctrl + '</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#202020] border border-[#333333]">
                <span className="text-zinc-400 font-sans">Submit Solution</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#333333] text-zinc-200 text-[10px]">Ctrl + Enter</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#202020] border border-[#333333]">
                <span className="text-zinc-400 font-sans">Indent 2 Spaces</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#333333] text-zinc-200 text-[10px]">Tab</kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#202020] border border-[#333333]">
                <span className="text-zinc-400 font-sans">Clear Shell</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#333333] text-zinc-200 text-[10px]">clear</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#383838] bg-[#222222] flex items-center justify-end">
          <button
            onClick={() => setShowSettingsModal(false)}
            className="px-4 py-1.5 rounded-md bg-[#00b8a3] hover:bg-[#00a390] text-white font-medium text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
