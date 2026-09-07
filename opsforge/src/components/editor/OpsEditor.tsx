import React, { useState } from 'react';
import { useOps } from '../../context/OpsContext';
import { Copy, Check, FileCode, RotateCcw, ChevronDown, Settings } from 'lucide-react';

export const OpsEditor: React.FC = () => {
  const {
    files,
    selectedFileName,
    setSelectedFileName,
    updateFileContent,
    resetFiles,
    editorSettings,
    setShowSettingsModal
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
      const spaces = ' '.repeat(editorSettings.tabSize || 2);
      const newContent = activeContent.substring(0, start) + spaces + activeContent.substring(end);
      updateFileContent(selectedFileName, newContent);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + (editorSettings.tabSize || 2);
      }, 0);
    }
  };

  const getLanguageName = () => {
    if (selectedFileName.endsWith('.yaml') || selectedFileName.endsWith('.yml')) return 'YAML';
    if (selectedFileName.endsWith('.tf')) return 'HCL / Terraform';
    if (selectedFileName.endsWith('.sh') || selectedFileName === 'entrypoint.sh') return 'Bash Shell';
    if (selectedFileName === 'Dockerfile') return 'Dockerfile';
    return 'Configuration';
  };

  return (
    <div className="flex flex-col h-full bg-[#262626] border border-[#383838] rounded-lg overflow-hidden shadow-sm">
      {/* Editor Top Bar (LeetCode Style) */}
      <div className="flex items-center justify-between bg-[#262626] border-b border-[#383838] px-3 py-1.5 text-xs select-none">
        {/* Left: Language & File Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#333333] text-[#eff1f6] font-medium text-[11px] border border-[#444]">
            <span>{getLanguageName()}</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </div>

          <div className="flex items-center gap-1">
            {Object.keys(files).map(fileName => {
              const isSelected = fileName === selectedFileName;
              return (
                <button
                  key={fileName}
                  onClick={() => setSelectedFileName(fileName)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition ${
                    isSelected
                      ? 'bg-[#1e1e1e] text-white font-medium border border-[#383838]'
                      : 'text-zinc-400 hover:text-white hover:bg-[#303030]'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{fileName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Actions (Settings, Reset, Copy) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#333333] transition"
            title="Editor Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetFiles}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#333333] transition"
            title="Reset code to starter template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-zinc-300 hover:text-white hover:bg-[#333333] transition"
            title="Copy code"
          >
            {copied ? <Check className="w-3 h-3 text-[#00b8a3]" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div 
        className="relative flex-1 min-h-0 flex overflow-hidden bg-[#1e1e1e]"
        style={{ fontFamily: editorSettings.fontFamily || "'Fira Code', monospace" }}
      >
        {/* Line Numbers Gutter */}
        {editorSettings.showLineNumbers && (
          <div className="select-none py-3 px-3 bg-[#1e1e1e] text-zinc-600 text-right border-r border-[#2e2e2e] w-12 shrink-0 overflow-hidden">
            {lines.map((_, idx) => (
              <div 
                key={idx} 
                className="leading-6"
                style={{ fontSize: `${editorSettings.fontSize - 1}px` }}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        )}

        {/* Textarea Code Input */}
        <textarea
          value={activeContent}
          onChange={e => updateFileContent(selectedFileName, e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          style={{ 
            fontSize: `${editorSettings.fontSize}px`,
            whiteSpace: editorSettings.wordWrap ? 'pre-wrap' : 'pre'
          }}
          className="flex-1 w-full h-full p-3 bg-transparent text-[#eff1f6] leading-6 resize-none focus:outline-none focus:ring-0 selection:bg-zinc-700 selection:text-white overflow-y-auto"
          placeholder="Write or remediate configuration here..."
        />
      </div>

      {/* Editor Footer Status Bar */}
      <div className="px-3 py-1 bg-[#262626] border-t border-[#383838] text-[11px] font-mono text-zinc-400 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <span>{selectedFileName}</span>
          <span>{lines.length} lines</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00b8a3] inline-block"></span>
          <span>Spaces: {editorSettings.tabSize || 2}</span>
        </div>
      </div>
    </div>
  );
};
