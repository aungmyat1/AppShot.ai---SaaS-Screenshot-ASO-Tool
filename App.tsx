import React, { useState } from 'react';
import Landing from './views/Landing';
import Dashboard from './views/Dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

  // Simple state-based routing for this demo
  if (view === 'dashboard') {
    return <Dashboard />;
  }

  return <Landing onGetStarted={() => setView('dashboard')} />;
};

export default App;