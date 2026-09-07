import React from 'react';
import { OpsProvider, useOps } from './context/OpsContext';
import { OpsNavbar } from './components/layout/OpsNavbar';
import { ProblemSetView } from './components/problemset/ProblemSetView';
import { OpsWorkspace } from './components/layout/OpsWorkspace';

function MainContent() {
  const { viewMode } = useOps();
  return (
    <div className="h-screen w-screen max-h-screen max-w-screen overflow-hidden flex flex-col bg-[#0b0f17] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-white">
      <OpsNavbar />
      <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
        {viewMode === 'problemset' ? <ProblemSetView /> : <OpsWorkspace />}
      </div>
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
