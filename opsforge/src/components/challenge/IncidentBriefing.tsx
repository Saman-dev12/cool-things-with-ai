import React, { useState } from 'react';
import { useOps } from '../../context/OpsContext';
import { TRACK_INFO } from '../../data/catalog';
import { 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  ListChecks, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const IncidentBriefing: React.FC = () => {
  const { currentChallenge, setShowPostMortem } = useOps();
  const [checkedRules, setCheckedRules] = useState<Record<string, boolean>>({});
  const [expandedHints, setExpandedHints] = useState<Record<string, boolean>>({});
  const [symptomsOpen, setSymptomsOpen] = useState(true);

  const trackInfo = TRACK_INFO[currentChallenge.track];

  const toggleRule = (id: string) => {
    setCheckedRules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleHint = (id: string) => {
    setExpandedHints(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'SEV-1':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'SEV-2':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Incident Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getSeverityStyle(currentChallenge.severity)}`}>
            {currentChallenge.severity} INCIDENT
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {trackInfo.icon} {trackInfo.label}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800/80 text-slate-400">
            {currentChallenge.difficulty}
          </span>
        </div>

        <h1 className="text-lg font-bold text-slate-100 leading-snug">
          {currentChallenge.title}
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Target Workload: <span className="text-cyan-300 font-semibold">{currentChallenge.serviceName}</span>
        </p>
      </div>

      {/* Incident Content Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {/* Incident Summary Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Incident Briefing</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {currentChallenge.summary}
          </p>
        </div>

        {/* Symptoms & Reproduction Accordion */}
        <div className="border border-slate-800 rounded-xl bg-slate-900/50 overflow-hidden">
          <button
            onClick={() => setSymptomsOpen(!symptomsOpen)}
            className="w-full p-3 flex items-center justify-between text-left text-slate-200 font-semibold hover:bg-slate-800/50 transition"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Reported Symptoms & Logs</span>
            </div>
            {symptomsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {symptomsOpen && (
            <div className="p-3 pt-0 space-y-2 border-t border-slate-800/60">
              <ul className="space-y-1.5 list-disc pl-4 text-slate-300">
                {currentChallenge.symptoms.map((symptom, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {symptom}
                  </li>
                ))}
              </ul>
              
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-400 mb-1">Reproduction & Triage Steps:</p>
                <ol className="space-y-1 list-decimal pl-4 text-slate-400 font-mono text-[11px]">
                  {currentChallenge.reproductionSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Acceptance Criteria Checklist */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <ListChecks className="w-4 h-4 text-emerald-400" />
              <span>Remediation Criteria</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {Object.values(checkedRules).filter(Boolean).length}/{currentChallenge.acceptanceRules.length} Checked
            </span>
          </div>

          <div className="space-y-2">
            {currentChallenge.acceptanceRules.map(rule => {
              const isChecked = !!checkedRules[rule.id];
              const hintOpen = !!expandedHints[rule.id];

              return (
                <div
                  key={rule.id}
                  className={`p-3 rounded-xl border transition ${
                    isChecked
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleRule(rule.id)}
                      className="mt-0.5 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className={`leading-relaxed ${isChecked ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                        {rule.description}
                      </p>

                      {rule.hint && (
                        <div className="mt-2">
                          <button
                            onClick={() => toggleHint(rule.id)}
                            className="text-[10px] flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
                          >
                            <HelpCircle className="w-3 h-3" />
                            <span>{hintOpen ? 'Hide Hint' : 'Reveal Hint'}</span>
                          </button>
                          {hintOpen && (
                            <div className="mt-1.5 p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                              {rule.hint}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RCA Button */}
        <div className="pt-2">
          <button
            onClick={() => setShowPostMortem(true)}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 flex items-center justify-center gap-2 font-medium transition"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Review Incident Post-Mortem & Architecture</span>
          </button>
        </div>
      </div>
    </div>
  );
};
