import React, { useState } from 'react';
import { useOps } from '../../context/OpsContext';
import { Code, Copy, Check, FileCode, RotateCcw } from 'lucide-react';

export const OpsEditor: React.FC = () => {
  const {
    currentChallenge,
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
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* File Tabs Bar */}
      <div className="flex items-center justify-between bg-slate-900 border-b border-slate-800 px-2 pt-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {Object.keys(files).map(fileName => {
            const isSelected = fileName === selectedFileName;
            return (
              <button
                key={fileName}
                onClick={() => setSelectedFileName(fileName)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-mono font-medium transition border-t border-x ${
                  isSelected
                    ? 'bg-slate-950 border-slate-800 text-cyan-300 border-b-transparent shadow-sm'
                    : 'bg-slate-900/60 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>{fileName}</span>
              </button>
            );
          })}
        </div>

        {/* Editor Actions */}
        <div className="flex items-center gap-1.5 pb-1">
          <button
            onClick={resetFiles}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Reset file content"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Copy file code"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="relative flex-1 flex overflow-hidden bg-slate-950 font-mono text-xs">
        {/* Line Numbers Gutter */}
        <div className="select-none py-3 px-3 bg-slate-950 text-slate-600 text-right border-r border-slate-800/80 w-12 shrink-0">
          {lines.map((_, idx) => (
            <div key={idx} className="leading-6">
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
          className="flex-1 w-full h-full p-3 bg-transparent text-slate-200 leading-6 resize-none focus:outline-none focus:ring-0 selection:bg-cyan-500/30 selection:text-white"
          placeholder="Edit manifest or script..."
        />
      </div>

      {/* Editor Footer Status Bar */}
      <div className="px-3 py-1 bg-slate-900/90 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>{selectedFileName}</span>
          <span>{lines.length} lines</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block"></span>
          <span>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
};
