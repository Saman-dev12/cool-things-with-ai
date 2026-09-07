import React from 'react';
import { OpsProvider, useOps } from './context/OpsContext';
import { OpsNavbar } from './components/layout/OpsNavbar';
import { ProblemSetView } from './components/problemset/ProblemSetView';
import { OpsWorkspace } from './components/layout/OpsWorkspace';
import { SettingsModal } from './components/settings/SettingsModal';

function MainContent() {
  const { viewMode } = useOps();
  return (
    <div className="h-screen w-screen max-h-screen max-w-screen overflow-hidden flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] antialiased selection:bg-white/20 selection:text-white">
      <OpsNavbar />
      <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
        {viewMode === 'problemset' ? <ProblemSetView /> : <OpsWorkspace />}
      </div>
      <SettingsModal />
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
