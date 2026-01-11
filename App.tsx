
import React, { useState, useEffect } from 'react';
import Landing from './views/Landing';
import { AppData, UserProfile, AppView } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [history, setHistory] = useState<AppData[]>([]);
  const [user, setUser] = useState<UserProfile>({
    name: 'Sarah User',
    email: 'sarah@example.com',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    tier: 'free',
    memberSince: 'Jan 2025',
    credits: { used: 0, total: 5 }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <Landing 
      view={view}
      navigate={(v) => setView(v)}
      user={user}
      setUser={setUser}
      history={history}
      setHistory={setHistory}
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
    />
  );
};

export default App;
