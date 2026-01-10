import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { 
  CheckIcon, DownloadIcon, MoonIcon, SunIcon, 
  LayersIcon, SparklesIcon, LightningIcon, UserIcon, MenuIcon,
  AppleIcon, GooglePlayIcon, AppIcon, HistoryIcon, SettingsIcon, SearchIcon, XIcon, TrendingUpIcon
} from '../components/Icons';
import { ResultsView, HistoryView, SettingsView, TrendingApps } from './Dashboard';
import PricingModal from '../components/PricingModal';
import ToastContainer, { ToastMessage } from '../components/Toast';
import { AppData, AnalysisResult, StoreType, UserProfile, Screenshot, AppView } from '../types';
import { scrapeApp, validateUrl } from '../services/mockScraperService';
import { analyzeASO } from '../services/geminiService';

interface Props {
  view: AppView;
  navigate: (view: AppView) => void;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  history: AppData[];
  setHistory: React.Dispatch<React.SetStateAction<AppData[]>>;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Landing: React.FC<Props> = ({ 
  view, navigate, user, setUser, history, setHistory, isDarkMode, toggleTheme 
}) => {
  // --- LOCAL STATE ---
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'screenshots' | 'analysis'>('screenshots');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreType>(StoreType.APP_STORE);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // --- ACTIONS ---
  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const handleScrape = useCallback(async (e?: React.FormEvent | string) => {
    if (e && typeof e !== 'string') e.preventDefault();
    const targetUrl = typeof e === 'string' ? e : url;
    
    if (user.credits.used >= user.credits.total && user.tier === 'free') {
      addToast('Credit limit reached. Please upgrade to continue.', 'error');
      navigate('pricing');
      return;
    }

    setAppData(null);
    setAnalysis(null);
    
    const storeType = validateUrl(targetUrl);
    if (storeType === StoreType.UNKNOWN && !targetUrl.includes('id') && targetUrl.length < 5) {
      addToast('Invalid URL. Provide an App Store or Play Store link.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await scrapeApp(targetUrl);
      setAppData(data);
      setHistory(prev => [data, ...prev]);
      setUser(prev => ({ ...prev, credits: { ...prev.credits, used: prev.credits.used + 1 } }));
      addToast('Metadata retrieved successfully', 'success');
      navigate('dashboard');
    } catch (err) {
      addToast('Failed to connect to store. Try again later.', 'error');
    } finally {
      setLoading(false);
    }
  }, [url, user, navigate, setHistory, setUser]);

  const handleAnalyze = useCallback(async () => {
    if (!appData) return;
    setAnalyzing(true);
    setActiveTab('analysis');
    try {
      const result = await analyzeASO(appData);
      setAnalysis(result);
      addToast('ASO Score Calculated', 'success');
    } catch (err) {
      addToast('AI Analysis failed. Checking credentials...', 'error');
    } finally {
      setAnalyzing(false);
    }
  }, [appData]);

  const handleDownloadZip = async () => {
      if (!appData || user.tier === 'free') {
          addToast('ZIP Export is a Pro feature.', 'info');
          navigate('pricing');
          return;
      }
      setDownloading(true);
      addToast('Compiling assets...', 'info');
      try {
          const zip = new JSZip();
          const folder = zip.folder(`${appData.name.toLowerCase().replace(/\s/g, '_')}_assets`);
          const promises = appData.screenshots.map(async (shot, index) => {
              const res = await fetch(shot.optimizedUrl || shot.url);
              const blob = await res.blob();
              folder?.file(`shot_${index + 1}.webp`, blob);
          });
          await Promise.all(promises);
          const content = await zip.generateAsync({ type: 'blob' });
          const url = window.URL.createObjectURL(content);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${appData.name}_ASO_Assets.zip`;
          a.click();
          addToast('ZIP generated!', 'success');
      } catch (error) {
          addToast("Failed to compile ZIP.", 'error');
      } finally {
          setDownloading(false);
      }
  };

  const handleUpgrade = (tier: string) => {
      setUser(prev => ({
          ...prev,
          tier: tier as any,
          credits: { used: prev.credits.used, total: tier === 'pro' ? 100 : 9999 }
      }));
      addToast(`Upgraded to ${tier.toUpperCase()}!`, 'success');
      navigate('dashboard');
  };

  // --- SUB-VIEWS ---
  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
          <div className="pt-32 pb-20 animate-fade-in">
             <div className="max-w-4xl mx-auto px-6 text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest mb-8">
                  <LightningIcon className="w-3 h-3" /> New: Gemini 3 Pro Analysis
                </span>
                <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">
                  App Store Assets <br/>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-indigo-400 to-purple-400">Simplified.</span>
                </h1>
                <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                  The ultimate ASO tool for 2025. Download high-res screenshots, perform AI optimization audits, and track competitors with one click.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                   <button 
                    onClick={() => navigate('dashboard')}
                    className="w-full sm:w-auto px-10 py-5 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-brand-500/20 active:scale-95"
                   >
                     Get Started Free
                   </button>
                   <button 
                    onClick={() => navigate('pricing')}
                    className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold text-lg transition-all"
                   >
                     View Pricing
                   </button>
                </div>
                
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                  {[
                    { icon: <SearchIcon />, title: "Bulk Fetch", desc: "Enter any app URL or ID to scrape all screenshots, icons, and metadata instantly." },
                    { icon: <SparklesIcon />, title: "AI Audit", desc: "Get a professional ASO health score and improvement suggestions powered by Gemini 3 Pro." },
                    { icon: <LayersIcon />, title: "Export Assets", desc: "Download all visual assets in high-quality WebP format, organized in a clean ZIP file." }
                  ].map((f, i) => (
                    <div key={i} className="p-8 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-brand-500/30 transition-colors group">
                      <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center text-brand-400 mb-6 group-hover:scale-110 transition-transform">
                        {f.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                      <p className="text-slate-500 leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        );
      
      case 'dashboard':
        return (
          <div className="pt-28 pb-32 px-6 max-w-7xl mx-auto animate-fade-in">
             {!appData ? (
               <div className="max-w-2xl mx-auto text-center mt-12">
                  <h2 className="text-3xl font-bold text-white mb-8">Search App</h2>
                  <div className="flex justify-center mb-8">
                    <div className="bg-white/5 p-1 rounded-full flex gap-1 border border-white/10">
                        <button 
                            onClick={() => setSelectedStore(StoreType.APP_STORE)}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all ${selectedStore === StoreType.APP_STORE ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <AppleIcon className="w-4 h-4" /> App Store
                        </button>
                        <button 
                            onClick={() => setSelectedStore(StoreType.PLAY_STORE)}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all ${selectedStore === StoreType.PLAY_STORE ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <GooglePlayIcon className="w-4 h-4" /> Google Play
                        </button>
                    </div>
                  </div>
                  <form onSubmit={handleScrape} className="relative group">
                     <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-indigo-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
                     <div className="relative flex items-center bg-slate-900 rounded-xl p-2 border border-white/10">
                        <input
                            type="text"
                            className="block w-full pl-6 pr-3 py-4 bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-lg"
                            placeholder={selectedStore === StoreType.APP_STORE ? "e.g., 389801252 or Instagram" : "e.g., com.google.android.gm"}
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={loading || !url}
                            className="ml-2 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Fetching...' : 'Fetch'}
                        </button>
                     </div>
                  </form>
                  <TrendingApps onSelect={(u) => { setUrl(u); handleScrape(u); }} />
               </div>
             ) : (
               <ResultsView 
                 appData={appData} 
                 analysis={analysis}
                 analyzing={analyzing}
                 downloading={downloading}
                 activeTab={activeTab}
                 setActiveTab={setActiveTab}
                 onAnalyze={handleAnalyze}
                 onDownloadZip={handleDownloadZip}
                 onDownloadImage={() => addToast('Image download started', 'info')}
                 onClose={() => setAppData(null)}
                 isDarkMode={isDarkMode}
               />
             )}
          </div>
        );

      case 'history':
        return <HistoryView history={history} onSelect={(app) => { setAppData(app); navigate('dashboard'); }} />;
      
      case 'settings':
        return <SettingsView user={user} navigate={navigate} />;
      
      case 'pricing':
        return (
          <div className="pt-32 pb-32 px-6 max-w-7xl mx-auto animate-fade-in text-center">
             <h2 className="text-4xl font-black text-white mb-4">Choose Your Plan</h2>
             <p className="text-slate-400 mb-16">Everything you need to scale your app store presence.</p>
             <PricingModal isOpen={true} onClose={() => navigate('home')} onUpgrade={handleUpgrade} isInline={true} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-950 text-white transition-colors duration-200 flex flex-col min-h-screen selection:bg-brand-500/30">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* GLOBAL NAV */}
      <nav className="fixed w-full z-40 bg-slate-950/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('home')}>
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
              <AppIcon className="text-white h-6 w-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">appshot.ai</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('dashboard')} className={`text-sm font-semibold transition-colors ${view === 'dashboard' ? 'text-brand-400' : 'text-slate-400 hover:text-white'}`}>Dashboard</button>
            <button onClick={() => navigate('history')} className={`text-sm font-semibold transition-colors ${view === 'history' ? 'text-brand-400' : 'text-slate-400 hover:text-white'}`}>History</button>
            <button onClick={() => navigate('pricing')} className={`text-sm font-semibold transition-colors ${view === 'pricing' ? 'text-brand-400' : 'text-slate-400 hover:text-white'}`}>Pricing</button>
            
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            
            <button onClick={toggleTheme} className="p-2 rounded-full text-slate-400 hover:text-white transition-colors">
              {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            
            <button onClick={() => navigate('settings')} className="flex items-center gap-3 p-1 pl-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors">
              <span className="text-sm font-bold">{user.name.split(' ')[0]}</span>
              <img src={user.avatar} className="w-8 h-8 rounded-full bg-slate-800" />
            </button>
          </div>

          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 text-slate-400">
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>

        {showMobileMenu && (
            <div className="md:hidden border-t border-white/5 bg-slate-950 p-6 space-y-4 animate-fade-in-down">
                {['dashboard', 'history', 'pricing', 'settings'].map(v => (
                  <button 
                    key={v}
                    onClick={() => { navigate(v as any); setShowMobileMenu(false); }} 
                    className="block w-full text-left text-lg font-bold capitalize text-white p-2"
                  >
                    {v}
                  </button>
                ))}
            </div>
        )}
      </nav>

      <main className="flex-1">
        {renderContent()}
      </main>

      <footer className="bg-slate-950 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <AppIcon className="text-brand-500 w-5 h-5" />
             <span className="text-sm text-slate-500 font-medium">© 2025 AppShot AI. Built for modern mobile teams.</span>
          </div>
          <div className="flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
             <a href="#" className="hover:text-brand-400 transition-colors">Twitter</a>
             <a href="#" className="hover:text-brand-400 transition-colors">API Status</a>
             <a href="#" className="hover:text-brand-400 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
