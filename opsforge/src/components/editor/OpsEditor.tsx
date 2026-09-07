import React, { useState, useRef, useMemo } from 'react';
import { useOps } from '../../context/OpsContext';
import { Copy, Check, FileCode, RotateCcw, ChevronDown, Settings } from 'lucide-react';
import { getLanguageForFile, highlightCode } from '../../utils/highlighter';

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
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const activeContent = files[selectedFileName] || '';
  const lines = activeContent.split('\n');

  const langInfo = useMemo(() => getLanguageForFile(selectedFileName), [selectedFileName]);
  const highlightedCode = useMemo(() => highlightCode(activeContent, selectedFileName), [activeContent, selectedFileName]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const updateCursorPos = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const pos = target.selectionStart || 0;
    const linesBefore = activeContent.substring(0, pos).split('\n');
    const line = linesBefore.length;
    const col = (linesBefore[linesBefore.length - 1] || '').length + 1;
    setCursorPos({ line, col });
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
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
        updateCursorPos(e);
      }, 0);
    }
  };

  const lineHeightPx = 22;
  const editorFontStyle: React.CSSProperties = {
    fontFamily: editorSettings.fontFamily || "'Fira Code', monospace",
    fontSize: `${editorSettings.fontSize}px`,
    lineHeight: `${lineHeightPx}px`,
    tabSize: editorSettings.tabSize || 2,
    whiteSpace: editorSettings.wordWrap ? 'pre-wrap' : 'pre',
    wordBreak: editorSettings.wordWrap ? 'break-word' : 'normal',
    letterSpacing: '0px',
  };

  return (
    <div className="flex flex-col h-full bg-[#262626] border border-[#383838] rounded-lg overflow-hidden shadow-sm">
      {/* Editor Top Bar (LeetCode Style) */}
      <div className="flex items-center justify-between bg-[#262626] border-b border-[#383838] px-3 py-1.5 text-xs select-none">
        {/* Left: Language & File Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#333333] text-[#eff1f6] font-medium text-[11px] border border-[#444]">
            <span>{langInfo.displayName}</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </div>

          <div className="flex items-center gap-1">
            {Object.keys(files).map(fileName => {
              const isSelected = fileName === selectedFileName;
              return (
                <button
                  key={fileName}
                  onClick={() => {
                    setSelectedFileName(fileName);
                    setCursorPos({ line: 1, col: 1 });
                  }}
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
      <div className="relative flex-1 min-h-0 flex overflow-hidden bg-[#1e1e1e]">
        {/* Line Numbers Gutter */}
        {editorSettings.showLineNumbers && (
          <div 
            ref={gutterRef}
            onWheel={(e) => {
              if (textareaRef.current) {
                textareaRef.current.scrollTop += e.deltaY;
              }
            }}
            className="select-none py-3 px-2 bg-[#1e1e1e] text-zinc-600 text-right border-r border-[#2e2e2e] w-12 shrink-0 overflow-hidden"
            style={{ fontFamily: editorSettings.fontFamily || "'Fira Code', monospace" }}
          >
            {lines.map((_, idx) => {
              const isCurrent = idx + 1 === cursorPos.line;
              return (
                <div 
                  key={idx} 
                  style={{ 
                    height: `${lineHeightPx}px`, 
                    lineHeight: `${lineHeightPx}px`,
                    fontSize: `${editorSettings.fontSize - 1}px` 
                  }}
                  className={`transition-colors font-mono ${isCurrent ? 'text-[#eff1f6] font-semibold' : 'text-zinc-600'}`}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>
        )}

        {/* Code Content Container */}
        <div className="ops-editor-container">
          {/* Syntax Highlighted Layer (Rendered underneath) */}
          <pre
            ref={preRef}
            className="ops-editor-pre"
            style={editorFontStyle}
            aria-hidden="true"
          >
            <code
              dangerouslySetInnerHTML={{
                __html: highlightedCode + (activeContent.endsWith('\n') ? ' ' : '')
              }}
            />
          </pre>

          {/* Interactive Input Layer (Transparent text, amber cursor) */}
          <textarea
            ref={textareaRef}
            value={activeContent}
            onChange={e => {
              updateFileContent(selectedFileName, e.target.value);
              updateCursorPos(e);
            }}
            onKeyDown={e => {
              handleKeyDown(e);
              setTimeout(() => updateCursorPos(e), 0);
            }}
            onKeyUp={updateCursorPos}
            onClick={updateCursorPos}
            onSelect={updateCursorPos}
            onScroll={handleScroll}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            style={editorFontStyle}
            className="ops-editor-textarea"
            placeholder="Write or remediate configuration here..."
          />
        </div>
      </div>

      {/* Editor Footer Status Bar */}
      <div className="px-3 py-1 bg-[#262626] border-t border-[#383838] text-[11px] font-mono text-zinc-400 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <span>{selectedFileName}</span>
          <span className="text-zinc-300">Ln {cursorPos.line}, Col {cursorPos.col}</span>
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

