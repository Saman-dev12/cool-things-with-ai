import React from 'react';
import { OpsProvider } from './context/OpsContext';
import { OpsNavbar } from './components/layout/OpsNavbar';
import { OpsWorkspace } from './components/layout/OpsWorkspace';

export function App() {
  return (
    <OpsProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-cyan-500/30 selection:text-white">
        <OpsNavbar />
        <OpsWorkspace />
      </div>
    </OpsProvider>
  );
}

export default App;
