import React, { useState, useMemo } from 'react';
import { useOps } from '../../context/OpsContext';
import { X, BookOpen, AlertOctagon, CheckCircle2, Shield, Copy, Check } from 'lucide-react';
import { highlightCode } from '../../utils/highlighter';

export const PostMortemModal: React.FC = () => {
  const { currentChallenge, showPostMortem, setShowPostMortem } = useOps();
  const [selectedRefTab, setSelectedRefTab] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!showPostMortem) return null;

  const { postMortem } = currentChallenge;
  const activeRefFile = postMortem.referenceFiles[selectedRefTab] || postMortem.referenceFiles[0];

  const highlightedRefContent = useMemo(() => {
    if (!activeRefFile?.content) return '';
    return highlightCode(activeRefFile.content, activeRefFile.name || 'config.yaml');
  }, [activeRefFile]);

  const handleCopy = async () => {
    if (!activeRefFile) return;
    try {
      await navigator.clipboard.writeText(activeRefFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-950 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                SRE Incident Post-Mortem & Architecture RCA
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Incident ID: {currentChallenge.id} • {currentChallenge.serviceName}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPostMortem(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Section 1: Executive RCA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                <AlertOctagon className="w-4 h-4" />
                <span>Root Cause Analysis (RCA)</span>
              </div>
              <p className="leading-relaxed text-slate-300">
                {postMortem.rootCause}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Shield className="w-4 h-4" />
                <span>Business Impact & Detection</span>
              </div>
              <p className="leading-relaxed text-slate-300">
                <span className="font-semibold text-slate-200">Impact: </span>
                {postMortem.impact}
              </p>
              <p className="leading-relaxed text-slate-400 font-mono text-[11px] pt-1">
                <span className="text-slate-300 font-semibold font-sans">Detection: </span>
                {postMortem.detection}
              </p>
            </div>
          </div>

          {/* Section 2: Remediation Steps Taken */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Remediation Breakdown</span>
            </h3>
            <ul className="space-y-1.5 list-disc pl-5 text-slate-300">
              {postMortem.solutionBreakdown.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Reference Production Code */}
          {postMortem.referenceFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Reference Implementation ({postMortem.referenceFiles.length} file)
                </h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Solution'}</span>
                </button>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
                <div className="flex items-center gap-1 px-3 pt-2 border-b border-slate-800 bg-slate-950">
                  {postMortem.referenceFiles.map((f, idx) => (
                    <button
                      key={f.name}
                      onClick={() => setSelectedRefTab(idx)}
                      className={`px-3 py-1.5 rounded-t text-xs font-mono transition ${
                        selectedRefTab === idx
                          ? 'bg-slate-900 text-cyan-300 border-t border-x border-slate-800'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>

                <pre className="p-4 text-[11px] font-mono leading-5 overflow-x-auto max-h-72">
                  <code dangerouslySetInnerHTML={{ __html: highlightedRefContent }} />
                </pre>
              </div>
            </div>
          )}

          {/* Section 4: Preventative Guardrails */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Long-term Preventative Measures & SRE Guardrails
            </h3>
            <ul className="space-y-1 list-disc pl-5 text-slate-400">
              {postMortem.preventativeMeasures.map((measure, idx) => (
                <li key={idx} className="leading-relaxed">
                  {measure}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={() => setShowPostMortem(false)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            Close Post-Mortem
          </button>
        </div>
      </div>
    </div>
  );
};
