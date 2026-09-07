import React from 'react';
import { OpsProvider, useOps } from './context/OpsContext';
import { OpsNavbar } from './components/layout/OpsNavbar';
import { ProblemSetView } from './components/problemset/ProblemSetView';
import { OpsWorkspace } from './components/layout/OpsWorkspace';

function MainContent() {
  const { viewMode } = useOps();
  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col antialiased selection:bg-cyan-500/30 selection:text-white">
      <OpsNavbar />
      {viewMode === 'problemset' ? <ProblemSetView /> : <OpsWorkspace />}
    </div>
  );
}

export function App() {
  return (
    <OpsProvider>
      <MainContent />
    </OpsProvider>
  );
}

export default App;
