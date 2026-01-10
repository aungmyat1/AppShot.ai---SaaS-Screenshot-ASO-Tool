import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { 
  CheckIcon, DownloadIcon, ChartIcon, BrainIcon, MoonIcon, SunIcon, 
  LayersIcon, GlobeIcon, SparklesIcon, CubeIcon, LightningIcon, SearchIcon, UserIcon, MenuIcon 
} from '../components/Icons';
import { ResultsView, HistoryModal, SettingsModal, TrendingApps } from './Dashboard';
import PricingModal from '../components/PricingModal';
import ToastContainer, { ToastMessage } from '../components/Toast';
import { AppData, AnalysisResult, StoreType, UserProfile, Screenshot } from '../types';
import { scrapeApp, validateUrl } from '../services/mockScraperService';
import { analyzeASO } from '../services/geminiService';

interface Props {
  onGetStarted: () => void; // Deprecated but kept for type compat if needed, unused now
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
    if (storeType === StoreType.UNKNOWN) {
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
      // Scroll to results usually handled by layout shift, or we can force scroll
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

  // --- RENDER ---
  return (
    <div className="bg-white dark:bg-slate-950 transition-colors duration-200 flex flex-col min-h-screen">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* HEADER */}
      <nav className="fixed w-full z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setAppData(null); window.scrollTo(0,0); }}>
            <LayersIcon className="text-brand-600 h-8 w-8" />
            <span className="font-bold text-xl text-slate-900 dark:text-white">AppShot.ai</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => setShowHistory(true)} className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">History</button>
            <a href="#features" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Features</a>
            <a href="#pricing" onClick={(e) => { e.preventDefault(); setShowPricing(true); }} className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Pricing</a>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
            
            <button 
             onClick={toggleTheme} 
             className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
           >
             {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
           </button>

           <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                  {user.credits.total - user.credits.used} credits
              </span>
              <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                      <UserIcon className="w-5 h-5" />
                  </div>
              </button>
           </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <button 
             onClick={toggleTheme} 
             className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
           >
             {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
           </button>
             <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="text-slate-500 dark:text-slate-400">
                <MenuIcon className="w-6 h-6" />
             </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {showMobileMenu && (
            <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 shadow-lg absolute w-full">
                <button onClick={() => {setShowHistory(true); setShowMobileMenu(false);}} className="block w-full text-left text-sm font-medium text-slate-900 dark:text-white py-2">History</button>
                <button onClick={() => {setShowPricing(true); setShowMobileMenu(false);}} className="block w-full text-left text-sm font-medium text-slate-900 dark:text-white py-2">Pricing</button>
                <button onClick={() => {setShowSettings(true); setShowMobileMenu(false);}} className="block w-full text-left text-sm font-medium text-slate-900 dark:text-white py-2">Account Settings</button>
            </div>
        )}
      </nav>

      {/* HERO SECTION - Always visible, acts as the Search Entry */}
      <div className={`relative isolate pt-32 pb-14 lg:px-8 transition-all duration-500 ${appData ? 'min-h-[400px]' : 'min-h-[80vh] flex flex-col justify-center'}`}>
        {/* Background Gradients */}
        {!appData && (
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 dark:opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}}></div>
            </div>
        )}
        
        <div className="mx-auto max-w-3xl px-6 text-center">
          {!appData && (
            <div className="hidden sm:mb-8 sm:flex sm:justify-center animate-fade-in-down">
                <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-slate-600 dark:text-slate-300 ring-1 ring-slate-900/10 dark:ring-slate-100/10 hover:ring-slate-900/20 dark:hover:ring-slate-100/20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all hover:shadow-sm cursor-pointer group">
                <span className="font-semibold text-brand-600 dark:text-brand-400">New feature</span>
                <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
                Gemini 2.5 Integration is live 
                <span className="ml-1 inline-block transition-transform group-hover:translate-x-1 text-brand-600 dark:text-brand-400">&rarr;</span>
                </div>
            </div>
          )}
          
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl animate-fade-in">
             {appData ? 'Result Ready' : 'Analyze App Assets with'} <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400">{appData ? '' : 'AI Precision'}</span>
          </h1>
          
          <p className={`mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 transition-opacity duration-300 ${appData ? 'hidden' : 'opacity-100'}`}>
            The ultimate SaaS platform for ASO experts. Download high-res screenshots, analyze competitors, and optimize your conversion rate.
          </p>

          <div className="mt-10 max-w-2xl mx-auto">
             <form onSubmit={handleScrape} className="relative flex gap-2 shadow-xl rounded-2xl bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-3 py-4 bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0 text-base"
                        placeholder="Paste Play Store or App Store URL..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !url}
                    className={`inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 transition-transform'}`}
                >
                    {loading ? 'Processing...' : 'Analyze'}
                </button>
             </form>

             {!appData && (
                <div className="mt-6 flex justify-center gap-6 text-xs text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-green-500"/> Play Store</span>
                    <span className="flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-blue-500"/> App Store</span>
                </div>
             )}
          </div>
        </div>

        {/* Trending Apps - Only Show if NO App Data */}
        {!appData && <TrendingApps onSelect={(url) => { setUrl(url); handleScrape(url); }} />}

      </div>

      {/* RESULTS SECTION - Injected below Hero when active */}
      {appData && (
          <div id="results-section" className="pb-24 pt-4 bg-slate-50 dark:bg-slate-950/50 min-h-screen">
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
                 isDarkMode={isDarkMode}
              />
          </div>
      )}

      {/* MARKETING SECTIONS - Only visible when NO analysis is active */}
      {!appData && (
        <>
            {/* Trusted By Section */}
            <div className="py-12 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <h2 className="text-center text-sm font-semibold leading-8 text-gray-500 dark:text-slate-400 uppercase tracking-wide">Trusted by modern product teams</h2>
                <div className="mx-auto mt-10 grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-12 sm:max-w-xl sm:grid-cols-3 lg:mx-0 lg:max-w-none lg:grid-cols-5 opacity-50 dark:opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center justify-center gap-2 group cursor-default">
                    <SparklesIcon className="h-8 w-8 text-slate-800 dark:text-white group-hover:text-purple-500 transition-colors" />
                    <span className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-purple-500 transition-colors">Lumina</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 group cursor-default">
                    <GlobeIcon className="h-8 w-8 text-slate-800 dark:text-white group-hover:text-blue-500 transition-colors" />
                    <span className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-blue-500 transition-colors">Nebula</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 group cursor-default">
                    <ChartIcon className="h-8 w-8 text-slate-800 dark:text-white group-hover:text-emerald-500 transition-colors" />
                    <span className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-emerald-500 transition-colors">Quantico</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 group cursor-default">
                    <LayersIcon className="h-8 w-8 text-slate-800 dark:text-white group-hover:text-indigo-500 transition-colors" />
                    <span className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-500 transition-colors">StackFlow</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 group cursor-default">
                    <LightningIcon className="h-8 w-8 text-slate-800 dark:text-white group-hover:text-amber-500 transition-colors" />
                    <span className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-amber-500 transition-colors">Velocy</span>
                    </div>
                </div>
                </div>
            </div>

            {/* Feature Section */}
            <div id="features" className="bg-white dark:bg-slate-950 py-24 sm:py-32 transition-colors duration-200">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-brand-600 dark:text-brand-400">Deploy faster</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Everything you need for ASO</p>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
                    Stop manually saving images. Automate your workflow and gain insights that drive downloads.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                    {[
                        {
                        name: 'Bulk Downloads',
                        description: 'Download all screenshots from any App Store or Google Play Store listing in one click.',
                        icon: DownloadIcon,
                        },
                        {
                        name: 'AI Analysis',
                        description: 'Leverage Gemini models to analyze your visual assets against guidelines and best practices.',
                        icon: BrainIcon,
                        },
                        {
                        name: 'Competitor Tracking',
                        description: 'Compare your ASO score against top competitors in your category.',
                        icon: ChartIcon,
                        },
                        {
                        name: 'Cross-Platform',
                        description: 'Works seamlessly for both iOS and Android apps with automatic store detection.',
                        icon: CheckIcon,
                        },
                    ].map((feature) => (
                        <div key={feature.name} className="relative pl-16">
                        <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                            <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
                            <feature.icon className="h-6 w-6" />
                            </div>
                            {feature.name}
                        </dt>
                        <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">{feature.description}</dd>
                        </div>
                    ))}
                    </dl>
                </div>
                </div>
            </div>
        </>
      )}

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-900 mt-auto border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Product</h3>
                  <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                      <li><a href="#" className="hover:text-brand-600">Features</a></li>
                      <li><a href="#" className="hover:text-brand-600">Pricing</a></li>
                      <li><a href="#" className="hover:text-brand-600">API</a></li>
                  </ul>
              </div>
              <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Company</h3>
                  <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                      <li><a href="#" className="hover:text-brand-600">About</a></li>
                      <li><a href="#" className="hover:text-brand-600">Blog</a></li>
                      <li><a href="#" className="hover:text-brand-600">Careers</a></li>
                  </ul>
              </div>
               <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Resources</h3>
                  <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                      <li><a href="#" className="hover:text-brand-600">Documentation</a></li>
                      <li><a href="#" className="hover:text-brand-600">Help Center</a></li>
                      <li><a href="#" className="hover:text-brand-600">Community</a></li>
                  </ul>
              </div>
              <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Legal</h3>
                  <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                      <li><a href="#" className="hover:text-brand-600">Privacy</a></li>
                      <li><a href="#" className="hover:text-brand-600">Terms</a></li>
                  </ul>
              </div>
           </div>
           <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
             <div className="flex items-center gap-2 mb-4 md:mb-0">
               <LayersIcon className="text-brand-600 h-6 w-6" />
               <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">&copy; 2024 AppShot.ai, Inc. All rights reserved.</p>
             </div>
             <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-gray-500">
                   <GlobeIcon className="h-5 w-5" />
                </a>
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