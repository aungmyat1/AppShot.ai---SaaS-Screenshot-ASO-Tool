
import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { 
  CheckIcon, DownloadIcon, ChartIcon, BrainIcon, MoonIcon, SunIcon, 
  LayersIcon, GlobeIcon, SparklesIcon, LightningIcon, SearchIcon, UserIcon, MenuIcon,
  AppleIcon, GooglePlayIcon, AppIcon
} from '../components/Icons';
import { ResultsView, HistoryModal, SettingsModal, TrendingApps } from './Dashboard';
import PricingModal from '../components/PricingModal';
import ToastContainer, { ToastMessage } from '../components/Toast';
import { AppData, AnalysisResult, StoreType, UserProfile, Screenshot } from '../types';
import { scrapeApp, validateUrl } from '../services/mockScraperService';
import { analyzeASO } from '../services/geminiService';

interface Props {
  onGetStarted: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Landing: React.FC<Props> = ({ isDarkMode, toggleTheme }) => {
  // --- STATE MANAGEMENT ---
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'screenshots' | 'analysis'>('screenshots');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreType>(StoreType.APP_STORE);
  
  // Modals
  const [showPricing, setShowPricing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Mock User
  const [user, setUser] = useState<UserProfile>({
    id: 'usr_123',
    name: 'Demo User',
    email: 'user@example.com',
    tier: 'free',
    credits: { used: 3, total: 5 },
    memberSince: 'Oct 2023'
  });

  const [history, setHistory] = useState<AppData[]>([]);

  // --- ACTIONS ---
  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const handleScrape = useCallback(async (e?: React.FormEvent | string) => {
    if (e && typeof e !== 'string') e.preventDefault();
    const targetUrl = typeof e === 'string' ? e : url;
    
    if (user.credits.used >= user.credits.total) {
      setShowPricing(true);
      return;
    }

    setAppData(null);
    setAnalysis(null);
    
    const storeType = validateUrl(targetUrl);
    if (storeType === StoreType.UNKNOWN && !targetUrl.includes('id') && targetUrl.length < 5) {
      addToast('Please enter a valid Google Play or Apple App Store URL', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await scrapeApp(targetUrl);
      setAppData(data);
      setHistory(prev => [data, ...prev]);
      setUser(prev => ({ ...prev, credits: { ...prev.credits, used: prev.credits.used + 1 } }));
      addToast('App data loaded successfully', 'success');
      setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      addToast('Failed to fetch app data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [url, user.credits]);

  const handleAnalyze = useCallback(async () => {
    if (!appData) return;
    setAnalyzing(true);
    setActiveTab('analysis');
    try {
      const result = await analyzeASO(appData);
      setAnalysis(result);
      addToast('AI Analysis complete', 'success');
    } catch (err) {
      addToast('Analysis failed. Please try again.', 'error');
    } finally {
      setAnalyzing(false);
    }
  }, [appData]);

  const handleDownloadZip = async () => {
      if (!appData || user.tier === 'free') {
          setShowPricing(true);
          return;
      }
      setDownloading(true);
      addToast('Preparing ZIP archive...', 'info');
      try {
          const zip = new JSZip();
          const safeName = appData.name.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
          const fileName = `${safeName}_${appData.id}_assets`;
          const folder = zip.folder(fileName);
          const promises = appData.screenshots.map(async (shot, index) => {
              const downloadUrl = shot.optimizedUrl || shot.url;
              const response = await fetch(downloadUrl);
              const blob = await response.blob();
              const extension = shot.optimized ? 'webp' : 'jpg';
              folder?.file(`screenshot_${index + 1}.${extension}`, blob);
          });
          await Promise.all(promises);
          const content = await zip.generateAsync({ type: 'blob' });
          const url = window.URL.createObjectURL(content);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${fileName}.zip`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          addToast('ZIP downloaded successfully', 'success');
      } catch (error) {
          addToast("Failed to generate ZIP archive.", 'error');
      } finally {
          setDownloading(false);
      }
  };

  const handleDownloadImage = async (shot: Screenshot) => {
      try {
          const downloadUrl = shot.optimizedUrl || shot.url;
          const response = await fetch(downloadUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const extension = shot.optimized ? 'webp' : 'jpg';
          const safeName = appData?.name.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_') || 'app';
          a.download = `${safeName}_screenshot-${shot.id}.${extension}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          addToast('Image downloaded', 'success');
      } catch (e) {
          addToast('Failed to download image', 'error');
      }
  };

  const handleUpgrade = (tier: string) => {
      setUser(prev => ({
          ...prev,
          tier: tier as any,
          credits: { used: prev.credits.used, total: tier === 'pro' ? 100 : prev.credits.total }
      }));
      addToast(`Upgraded to ${tier.toUpperCase()} plan!`, 'success');
  };

  return (
    <div className="bg-slate-950 text-white transition-colors duration-200 flex flex-col min-h-screen selection:bg-brand-500/30">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* HEADER */}
      <nav className="fixed w-full z-40 bg-slate-950/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setAppData(null); window.scrollTo(0,0); }}>
            <AppIcon className="text-brand-500 h-7 w-7 transition-transform group-hover:scale-110" />
            <span className="font-bold text-xl tracking-tight text-white">getappshots</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-8 text-sm font-medium text-slate-400">
                <button onClick={() => setShowPricing(true)} className="hover:text-white transition-colors">Pricing</button>
                <a href="#" className="hover:text-white transition-colors">API Docs</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                onClick={toggleTheme} 
                className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>
                <button className="bg-brand-600 hover:bg-brand-500 px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-brand-500/20 active:scale-95">
                    Sign Up
                </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 text-slate-400">
                <MenuIcon className="w-6 h-6" />
             </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {showMobileMenu && (
            <div className="md:hidden border-t border-white/5 bg-slate-950 p-6 space-y-6 shadow-2xl absolute w-full animate-fade-in">
                <button onClick={() => {setShowPricing(true); setShowMobileMenu(false);}} className="block w-full text-left text-base font-medium text-white">Pricing</button>
                <a href="#" className="block w-full text-left text-base font-medium text-white">API Docs</a>
                <a href="#" className="block w-full text-left text-base font-medium text-white">Contact</a>
                <button className="w-full bg-brand-600 px-6 py-3 rounded-full text-sm font-semibold text-white">Sign Up</button>
            </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <div className={`relative isolate pt-40 pb-20 lg:px-8 transition-all duration-700 ${appData ? 'min-h-[500px]' : 'min-h-[90vh] flex flex-col justify-center'}`}>
        {/* Background Mesh Gradients */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-8 leading-[1.1]">
             {appData ? 'Analysis Ready' : (
               <>
                 App Screenshots, <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-cyan-300 to-emerald-300">Instantly.</span>
               </>
             )}
          </h1>
          
          <p className={`mt-8 text-xl leading-relaxed text-slate-400 transition-opacity duration-300 max-w-2xl mx-auto ${appData ? 'hidden' : 'opacity-100'}`}>
            Paste any App Store or Google Play link/ID to download all screenshots in seconds. Perfect for designers, marketers, and developers.
          </p>

          <div className="mt-12 max-w-2xl mx-auto">
             {/* Store Toggle */}
             {!appData && (
                <div className="flex justify-center mb-8">
                    <div className="bg-white/5 p-1 rounded-full flex gap-1 border border-white/10">
                        <button 
                            onClick={() => setSelectedStore(StoreType.APP_STORE)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${selectedStore === StoreType.APP_STORE ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <AppleIcon className="w-4 h-4" /> App Store
                        </button>
                        <button 
                            onClick={() => setSelectedStore(StoreType.PLAY_STORE)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${selectedStore === StoreType.PLAY_STORE ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <GooglePlayIcon className="w-4 h-4" /> Google Play
                        </button>
                    </div>
                </div>
             )}

             <form onSubmit={handleScrape} className="relative flex items-center bg-white/5 rounded-2xl p-2.5 border border-white/10 focus-within:border-brand-500/50 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all shadow-2xl">
                <input
                    type="text"
                    className="block w-full pl-6 pr-3 py-4 bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-lg"
                    placeholder={selectedStore === StoreType.APP_STORE ? "e.g., Instagram or 389801252" : "e.g., com.google.android.gm"}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={loading || !url}
                    className={`ml-2 inline-flex items-center px-8 py-4 border border-transparent text-base font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-500 focus:outline-none shadow-lg shadow-brand-600/20 active:scale-95 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : 'Fetch'}
                </button>
             </form>

             {!appData && (
                <div className="mt-8">
                    <button onClick={() => setShowPricing(true)} className="text-sm font-medium text-slate-500 hover:text-brand-400 transition-colors">
                        <span className="underline underline-offset-4 decoration-slate-700">Sign up</span> to get <span className="text-white">5 free fetches</span>.
                    </button>
                </div>
             )}
          </div>
        </div>

        {/* Social Proof */}
        {!appData && (
            <div className="mt-24 text-center">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-10">Trusted by teams at</h2>
                <div className="flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale contrast-125">
                    <div className="flex items-center gap-2">
                        <GlobeIcon className="w-8 h-8" />
                        <span className="text-xl font-black">SPHERE</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="w-8 h-8" />
                        <span className="text-xl font-black">NOVA</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <LayersIcon className="w-8 h-8" />
                        <span className="text-xl font-black">FLUX</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <LightningIcon className="w-8 h-8" />
                        <span className="text-xl font-black">VELOX</span>
                    </div>
                </div>
            </div>
        )}

        {!appData && <TrendingApps onSelect={(url) => { setUrl(url); handleScrape(url); }} />}
      </div>

      {/* RESULTS SECTION */}
      {appData && (
          <div id="results-section" className="pb-32 pt-10 bg-slate-900/30 backdrop-blur-sm min-h-screen border-t border-white/5">
              <ResultsView 
                 appData={appData} 
                 analysis={analysis}
                 analyzing={analyzing}
                 downloading={downloading}
                 activeTab={activeTab}
                 setActiveTab={setActiveTab}
                 onAnalyze={handleAnalyze}
                 onDownloadZip={handleDownloadZip}
                 onDownloadImage={handleDownloadImage}
                 onClose={() => setAppData(null)}
                 isDarkMode={true}
              />
          </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-white/5 mt-auto">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
              <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Product</h3>
                  <ul className="space-y-4 text-sm text-slate-500">
                      <li><a href="#" className="hover:text-brand-400 transition-colors">Features</a></li>
                      <li><a href="#" className="hover:text-brand-400 transition-colors">Pricing</a></li>
                      <li><a href="#" className="hover:text-brand-400 transition-colors">API Docs</a></li>
                      <li><a href="#" className="hover:text-brand-400 transition-colors">Changelog</a></li>
                  </ul>
              </div>
              <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Company</h3>
                  <ul className="space-y-4 text-sm text-slate-500">
                      <li><a href="#" className="hover:text-brand-400 transition-colors">About Us</a></li>
                      <li><a href="#" className="hover:text-brand-400 transition-colors">Blog</a></li>
                      <li><a href="#" className="hover:text-brand-400 transition-colors">Careers</a></li>
                      <li><a href="#" className="hover:text-brand-400 transition-colors">Customers</a></li>
                  </ul>
              </div>
               <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Resources</h3>
                  <ul className="space-y-4 text-sm text-slate-500">
                      <li><a href="#" className="hover:text-brand-400 transition-colors">Support</a></li>
                      <li><a href="#" className="hover:text-brand-400 transition-colors">Documentation</a></li>
                      <li><a href="#" className="hover:text-brand-400 transition-colors">Guides</a></li>
                      <li><a href="#" className="hover:text-brand-400 transition-colors">ASO Bible</a></li>
                  </ul>
              </div>
              <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Legal</h3>
                  <ul className="space-y-4 text-sm text-slate-500">
                      <li><a href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</a></li>
                      <li><a href="#" className="hover:text-brand-400 transition-colors">Terms of Service</a></li>
                      <li><a href="#" className="hover:text-brand-400 transition-colors">Cookie Policy</a></li>
                  </ul>
              </div>
           </div>
           <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-3">
               <AppIcon className="text-brand-500 h-6 w-6" />
               <p className="text-sm text-slate-600">&copy; 2025 getappshots. All rights reserved.</p>
             </div>
             <div className="flex gap-8 items-center">
                <a href="#" className="text-slate-600 hover:text-white transition-colors"><GlobeIcon className="w-5 h-5" /></a>
                <a href="#" className="text-slate-600 hover:text-white transition-colors"><UserIcon className="w-5 h-5" /></a>
             </div>
           </div>
        </div>
      </footer>

      {/* Global Modals */}
      <PricingModal 
        isOpen={showPricing} 
        onClose={() => setShowPricing(false)} 
        onUpgrade={(tier) => { handleUpgrade(tier); setShowPricing(false); }}
      />
      <HistoryModal 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)}
        history={history}
        onSelect={(app) => { setAppData(app); setShowHistory(false); }}
      />
      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
        onUpgradeClick={() => { setShowSettings(false); setShowPricing(true); }}
      />
    </div>
  );
};

export default Landing;
