import React, { useState } from 'react';
import { useOps } from '../../context/OpsContext';
import { Copy, Check, FileCode, RotateCcw } from 'lucide-react';

export const OpsEditor: React.FC = () => {
  const {
    files,
    selectedFileName,
    setSelectedFileName,
    updateFileContent,
    resetFiles
  } = useOps();

  const [copied, setCopied] = useState(false);

  const activeContent = files[selectedFileName] || '';
  const lines = activeContent.split('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newContent = activeContent.substring(0, start) + '  ' + activeContent.substring(end);
      updateFileContent(selectedFileName, newContent);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-panel)] border border-white/[0.08] rounded-xl overflow-hidden shadow-sm">
      {/* File Tabs Bar */}
      <div className="flex items-center justify-between bg-[var(--bg-panel)] border-b border-white/[0.06] px-2 pt-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {Object.keys(files).map(fileName => {
            const isSelected = fileName === selectedFileName;
            return (
              <button
                key={fileName}
                onClick={() => setSelectedFileName(fileName)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-md text-xs font-mono font-medium transition border-t border-x ${
                  isSelected
                    ? 'bg-[var(--bg-card)] border-white/[0.08] text-white border-b-transparent shadow-sm'
                    : 'border-transparent text-[var(--text-muted)] hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                <span>{fileName}</span>
              </button>
            );
          })}
        </div>

        {/* Editor Actions */}
        <div className="flex items-center gap-1 pb-1.5">
          <button
            onClick={resetFiles}
            className="p-1 rounded text-[var(--text-muted)] hover:text-white hover:bg-white/[0.06] transition"
            title="Reset file content"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.06] hover:bg-white/[0.1] text-[var(--text-secondary)] hover:text-white border border-white/[0.06] transition"
            title="Copy file code"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="relative flex-1 min-h-0 flex overflow-hidden bg-[var(--bg-card)] font-mono text-xs">
        {/* Line Numbers Gutter */}
        <div className="select-none py-3 px-3 bg-[var(--bg-card)] text-zinc-600 text-right border-r border-white/[0.06] w-12 shrink-0 overflow-hidden">
          {lines.map((_, idx) => (
            <div key={idx} className="leading-6 text-[11px]">
              {idx + 1}
            </div>
          ))}
        </div>

        {/* Code Input Textarea */}
        <textarea
          value={activeContent}
          onChange={e => updateFileContent(selectedFileName, e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          className="flex-1 w-full h-full p-3 bg-transparent text-zinc-200 leading-6 resize-none focus:outline-none focus:ring-0 selection:bg-white/20 selection:text-white overflow-y-auto"
          placeholder="Edit manifest or script..."
        />
      </div>

      {/* Editor Footer Status Bar */}
      <div className="px-3 py-1 bg-[var(--bg-panel)] border-t border-white/[0.06] text-[10px] font-mono text-[var(--text-muted)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>{selectedFileName}</span>
          <span>{lines.length} lines</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
          <span>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
};
